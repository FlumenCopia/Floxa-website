from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from accounts.models import User
from .models import (
    ActivityLog, ClientPortalSession, Concept, Deliverable, DiscoveryDraft,
    Moodboard, Notification, Project,
)
from .tokens import generate_portal_token, hash_portal_token


class FloxaApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="consultant@example.com",
            password="strong-test-password",
            name="Consultant",
            role=User.Role.CONSULTANT,
        )

    def authenticate(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": self.user.email, "password": "strong-test-password"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )

    def portal_project(self, **kwargs):
        raw_token = generate_portal_token()
        project = Project.objects.create(
            consultant=self.user,
            client_access_token=hash_portal_token(raw_token),
            **kwargs,
        )
        return project, raw_token

    def test_login_me_and_project_creation(self):
        self.authenticate()
        me = self.client.get("/api/v1/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["email"], self.user.email)

        created = self.client.post(
            "/api/v1/projects/",
            {
                "name": "Test Project",
                "clientEmail": "client@example.com",
                "sector": "BRAND_IDENTITY",
                "projectValue": 75000,
                "splitAdvancePct": 50,
                "splitMidPct": 30,
                "splitFinalPct": 20,
                "freeRevisions": 2,
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertTrue(created.data["success"])

    def test_client_portal_discovery(self):
        project, raw_token = self.portal_project(
            name="Portal Project",
            client_email="client@example.com",
            project_value=75000,
        )
        session = self.client.post( 
            "/api/v1/client-portal/session/",
            {"token": raw_token},
            format="json",
        )
        self.assertEqual(session.status_code, 200)
        self.assertNotIn("clientAccessToken", session.data["project"])
        self.assertNotIn("notes", session.data["project"])
        self.client.credentials(
            HTTP_X_CLIENT_PORTAL_TOKEN=session.data["portal_token"]
        )
        discovery = self.client.post(
            "/api/v1/client-portal/discovery/",
            {
                "whatDo": "Brand strategy",
                "targetCustomer": "Growing businesses",
                "whyChooseUs": "Clear strategic thinking",
                "brandFeeling": "Confident and understood",
                "audienceArchetype": "Quality Seeker",
                "clientSliders": {"playfulSerious": 1},
                "emotions": ["Trust", "Bold"],
                "visualStyles": ["Minimal Clean"],
            },
            format="json",
        )
        self.assertEqual(discovery.status_code, 200)
        self.assertEqual(
            discovery.data["data"]["personalityCluster"],
            "Elevated Heritage",
        )

    def test_client_review_actions_and_payment_gate(self):
        project, raw_token = self.portal_project(
            name="Review Project",
            project_value=50000,
        )
        moodboard = Moodboard.objects.create(project=project, name="Direction One")
        concept = Concept.objects.create(project=project, title="Concept One")
        deliverable = Deliverable.objects.create(
            project=project,
            category="logo",
            label="Logo Pack",
            file_url="https://example.com/logo.zip",
            gated=True,
        )
        session = self.client.post(
            "/api/v1/client-portal/session/",
            {"token": raw_token},
            format="json",
        )
        self.client.credentials(
            HTTP_X_CLIENT_PORTAL_TOKEN=session.data["portal_token"]
        )

        selected = self.client.post(
            f"/api/v1/client-portal/moodboards/{moodboard.id}/select/",
            {},
            format="json",
        )
        self.assertEqual(selected.status_code, 200)

        approved = self.client.post(
            f"/api/v1/client-portal/concepts/{concept.id}/decision/",
            {"status": "SELECTED"},
            format="json",
        )
        self.assertEqual(approved.status_code, 200)

        download = self.client.post(
            f"/api/v1/client-portal/deliverables/{deliverable.id}/download/",
            {},
            format="json",
        )
        self.assertEqual(download.status_code, 200)

    def test_registration_archive_and_status(self):
        registered = self.client.post(
            "/api/v1/auth/register/",
            {
                "email": "new@example.com",
                "password": "A-strong-registration-password-2026",
                "name": "New Consultant",
                "company_name": "New Studio",
            },
            format="json",
        )
        self.assertEqual(registered.status_code, 201)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {registered.data['access']}")
        created = self.client.post(
            "/api/v1/projects/",
            {
                "name": "Status Project",
                "sector": "BRAND_IDENTITY",
                "projectValue": 10000,
            },
            format="json",
        )
        project_id = created.data["data"]["project"]["id"]
        updated = self.client.post(
            f"/api/v1/projects/{project_id}/status/",
            {"status": "DISCOVERY_COMPLETE"},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        archived = self.client.post(f"/api/v1/projects/{project_id}/archive/", {}, format="json")
        self.assertEqual(archived.status_code, 200)
        self.assertEqual(archived.data["data"]["status"], "ARCHIVED")

    def test_complete_consultant_workflow(self):
        unauthenticated = self.client.get("/api/v1/dashboard/summary/")
        self.assertEqual(unauthenticated.status_code, 401)

        registered = self.client.post(
            "/api/v1/auth/register/",
            {
                "email": "phase1a@example.com",
                "password": "Phase-1A-Strong-Password-2026",
                "name": "Phase 1A Consultant",
                "company_name": "FLOXA Test Studio",
            },
            format="json",
        )
        self.assertEqual(registered.status_code, 201)
        self.assertIn("access", registered.data)
        self.assertIn("refresh", registered.data)

        refreshed = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": registered.data["refresh"]},
            format="json",
        )
        self.assertEqual(refreshed.status_code, 200)
        self.assertIn("access", refreshed.data)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refreshed.data['access']}"
        )

        initial_summary = self.client.get("/api/v1/dashboard/summary/")
        self.assertEqual(initial_summary.status_code, 200)
        self.assertEqual(initial_summary.data["data"]["totalProjects"], 0)

        created = self.client.post(
            "/api/v1/projects/",
            {
                "name": "Phase 1A Project",
                "clientEmail": "client@example.com",
                "sector": "BRAND_IDENTITY",
                "projectValue": 50000,
                "splitAdvancePct": 50,
                "splitMidPct": 30,
                "splitFinalPct": 20,
                "freeRevisions": 2,
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        project = created.data["data"]["project"]
        project_id = project["id"]
        portal_url = created.data["data"]["clientPortalUrl"]
        self.assertIn(f"/client/", portal_url)
        self.assertNotIn("clientAccessToken", project)

        listed = self.client.get("/api/v1/projects/")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.data["data"]), 1)
        self.assertNotIn("brandDNA", listed.data["data"][0])
        self.assertNotIn("notes", listed.data["data"][0])

        edited = self.client.patch(
            f"/api/v1/projects/{project_id}/",
            {
                "name": "Phase 1A Project Updated",
                "clientEmail": "updated-client@example.com",
                "projectValue": 65000,
            },
            format="json",
        )
        self.assertEqual(edited.status_code, 200)
        self.assertEqual(edited.data["data"]["name"], "Phase 1A Project Updated")

        status_updated = self.client.post(
            f"/api/v1/projects/{project_id}/status/",
            {"status": "PROFILE_COMPLETE"},
            format="json",
        )
        self.assertEqual(status_updated.status_code, 200)
        self.assertEqual(status_updated.data["data"]["completionPct"], 15)

        note = self.client.post(
            f"/api/v1/projects/{project_id}/notes/",
            {"type": "internal", "content": "Consultant workflow note"},
            format="json",
        )
        self.assertEqual(note.status_code, 201)
        notes = self.client.get(f"/api/v1/projects/{project_id}/notes/")
        self.assertEqual(notes.status_code, 200)
        self.assertEqual(notes.data["data"][0]["content"], "Consultant workflow note")

        notification = self.client.post(
            f"/api/v1/projects/{project_id}/notifications/",
            {
                "type": "CUSTOM",
                "title": "Consultant reminder",
                "body": "Internal workflow notification",
            },
            format="json",
        )
        self.assertEqual(notification.status_code, 201)
        notifications = self.client.get("/api/v1/notifications/")
        self.assertEqual(notifications.status_code, 200)
        self.assertEqual(notifications.data["data"][0]["title"], "Consultant reminder")
        marked = self.client.post("/api/v1/notifications/mark-all-read/", {}, format="json")
        self.assertEqual(marked.status_code, 200)

        activity = self.client.get(f"/api/v1/projects/{project_id}/activity/")
        self.assertEqual(activity.status_code, 200)
        actions = {item["action"] for item in activity.data["data"]}
        self.assertTrue(
            {"Project created", "Project updated", "Project status updated", "Project note added"}
            .issubset(actions)
        )

        updated_summary = self.client.get("/api/v1/dashboard/summary/")
        self.assertEqual(updated_summary.data["data"]["activeProjects"], 1)
        self.assertEqual(updated_summary.data["data"]["totalProjects"], 1)
        self.assertEqual(len(updated_summary.data["data"]["recentProjects"]), 1)
        self.assertNotIn("brandDNA", updated_summary.data["data"]["recentProjects"][0])

        detail = self.client.get(f"/api/v1/projects/{project_id}/")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["data"]["name"], "Phase 1A Project Updated")

        archived = self.client.post(
            f"/api/v1/projects/{project_id}/archive/", {}, format="json"
        )
        self.assertEqual(archived.status_code, 200)
        self.assertEqual(archived.data["data"]["status"], "ARCHIVED")
        final_summary = self.client.get("/api/v1/dashboard/summary/")
        self.assertEqual(final_summary.data["data"]["activeProjects"], 0)
        self.assertEqual(final_summary.data["data"]["totalProjects"], 1)

    def test_phase_1b_client_portal_workflow_and_security(self):
        project, raw_token = self.portal_project(
            name="Client Portal MVP",
            client_email="client@example.com",
            client_note="Meeting summary for the client.",
            project_value=75000,
            client_access_expires_at=timezone.now() + timedelta(days=7),
        )
        other_project, _ = self.portal_project(name="Other Project")
        other_moodboard = Moodboard.objects.create(
            project=other_project, name="Private Other Project Moodboard"
        )

        missing = self.client.post("/api/v1/client-portal/session/", {}, format="json")
        self.assertEqual(missing.status_code, 401)
        random = self.client.post(
            "/api/v1/client-portal/session/", {"token": "random-token"}, format="json"
        )
        self.assertEqual(random.status_code, 401)
        direct_without_session = self.client.get("/api/v1/client-portal/project/")
        self.assertEqual(direct_without_session.status_code, 401)
        profile_without_session = self.client.patch(
            "/api/v1/client-portal/profile/", {}, format="json"
        )
        self.assertEqual(profile_without_session.status_code, 401)
        draft_without_session = self.client.get(
            "/api/v1/client-portal/discovery/draft/"
        )
        self.assertEqual(draft_without_session.status_code, 401)
        raw_url_bypass = self.client.get(
            f"/api/v1/client-portal/project/?token={raw_token}"
        )
        self.assertEqual(raw_url_bypass.status_code, 401)

        session = self.client.post(
            "/api/v1/client-portal/session/", {"token": raw_token}, format="json"
        )
        self.assertEqual(session.status_code, 200)
        self.assertEqual(session.data["project"]["name"], project.name)
        self.assertEqual(
            session.data["project"]["meetingSummary"], project.client_note
        )
        self.assertNotIn("clientAccessToken", session.data["project"])
        portal_token = session.data["portal_token"]
        self.client.credentials(HTTP_X_CLIENT_PORTAL_TOKEN=portal_token)

        scoped_attack = self.client.post(
            f"/api/v1/client-portal/moodboards/{other_moodboard.id}/select/",
            {},
            format="json",
        )
        self.assertEqual(scoped_attack.status_code, 404)

        profile = self.client.patch(
            "/api/v1/client-portal/profile/",
            {
                "clientName": "Client Person",
                "clientCompany": "Client Company",
                "clientIndustry": "Technology / SaaS",
                "clientYearStart": 2020,
                "clientLocation": "Kochi",
                "clientPhone": "9999999999",
                "clientEmail": "client@example.com",
                "clientWebsite": "https://client.example.com",
            },
            format="json",
        )
        self.assertEqual(profile.status_code, 200)
        persisted = self.client.get("/api/v1/client-portal/project/")
        self.assertEqual(
            persisted.data["data"]["brandDNA"]["clientCompany"], "Client Company"
        )

        draft_payload = {
            "basics": {
                "whatDo": "Build software products",
                "targetCustomer": "Growing businesses",
                "whyChooseUs": "Clear product thinking",
                "brandFeeling": "Confident",
            },
            "sliders": {"playfulSerious": 1},
            "emotions": ["Trust", "Bold"],
            "persona": "Quality Seeker",
            "styles": ["Minimal Clean"],
            "comps": [
                {"name": "Competitor", "rating": "like", "reason": "Clear brand"}
            ],
        }
        saved_draft = self.client.patch(
            "/api/v1/client-portal/discovery/draft/",
            {"data": draft_payload, "currentStep": 5},
            format="json",
        )
        self.assertEqual(saved_draft.status_code, 200)
        resumed = self.client.get("/api/v1/client-portal/discovery/draft/")
        self.assertEqual(resumed.data["data"]["currentStep"], 5)
        self.assertEqual(
            resumed.data["data"]["data"]["basics"]["whatDo"],
            "Build software products",
        )

        submitted = self.client.post(
            "/api/v1/client-portal/discovery/",
            {
                "whatDo": "Build software products",
                "targetCustomer": "Growing businesses",
                "whyChooseUs": "Clear product thinking",
                "brandFeeling": "Confident",
                "clientSliders": {"playfulSerious": 1},
                "emotions": ["Trust", "Bold"],
                "audienceArchetype": "Quality Seeker",
                "competitors": draft_payload["comps"],
                "visualStyles": ["Minimal Clean"],
            },
            format="json",
        )
        self.assertEqual(submitted.status_code, 200)
        self.assertFalse(DiscoveryDraft.objects.filter(project=project).exists())

        project.status = Project.Status.FINAL_UPLOADED
        project.completion_pct = 90
        project.save(update_fields=["status", "completion_pct"])
        advanced_resubmission = self.client.post(
            "/api/v1/client-portal/discovery/",
            {
                "whatDo": "Updated software products",
                "targetCustomer": "Growing businesses",
                "whyChooseUs": "Clear product thinking",
                "brandFeeling": "Confident",
                "clientSliders": {"playfulSerious": 1},
                "emotions": ["Trust", "Bold"],
                "audienceArchetype": "Quality Seeker",
                "competitors": draft_payload["comps"],
                "visualStyles": ["Minimal Clean"],
            },
            format="json",
        )
        self.assertEqual(advanced_resubmission.status_code, 200)
        project.refresh_from_db()
        self.assertEqual(project.status, Project.Status.FINAL_UPLOADED)
        self.assertEqual(project.completion_pct, 90)

        actions = set(
            ActivityLog.objects.filter(project=project).values_list("action", flat=True)
        )
        self.assertTrue(
            {
                "Client portal opened",
                "Client profile saved",
                "Discovery started",
                "Discovery draft saved",
                "Discovery submitted",
            }.issubset(actions)
        )
        notification_types = set(
            Notification.objects.filter(project=project).values_list("type", flat=True)
        )
        self.assertTrue(
            {"PROFILE_COMPLETE", "DISCOVERY_COMPLETE"}.issubset(notification_types)
        )

        edited_profile = self.client.patch(
            "/api/v1/client-portal/profile/",
            {"clientLocation": "Bengaluru"},
            format="json",
        )
        self.assertEqual(edited_profile.status_code, 200)
        project.refresh_from_db()
        self.assertEqual(project.status, Project.Status.FINAL_UPLOADED)
        self.assertEqual(project.brand_dna.client_location, "Bengaluru")

        ClientPortalSession.objects.filter(
            token=hash_portal_token(portal_token)
        ).update(expires_at=timezone.now() - timedelta(seconds=1))
        expired_session = self.client.get("/api/v1/client-portal/project/")
        self.assertEqual(expired_session.status_code, 401)
        self.client.credentials()

        self.authenticate()
        consultant_view = self.client.get(f"/api/v1/projects/{project.id}/")
        self.assertEqual(consultant_view.status_code, 200)
        dna = consultant_view.data["data"]["brandDNA"]
        self.assertEqual(dna["clientCompany"], "Client Company")
        self.assertEqual(dna["brandFeeling"], "Confident")
        self.assertEqual(dna["competitors"][0]["reason"], "Clear brand")
        self.assertEqual(dna["visualStyles"], ["Minimal Clean"])

        self.client.credentials()

        expired_project, expired_token = self.portal_project(
            name="Expired",
            client_access_expires_at=timezone.now() - timedelta(minutes=1),
        )
        expired = self.client.post(
            "/api/v1/client-portal/session/",
            {"token": expired_token},
            format="json",
        )
        self.assertEqual(expired.status_code, 401)

        revoked_project, revoked_token = self.portal_project(
            name="Revoked", client_access_revoked=True
        )
        revoked = self.client.post(
            "/api/v1/client-portal/session/",
            {"token": revoked_token},
            format="json",
        )
        self.assertEqual(revoked.status_code, 401)
