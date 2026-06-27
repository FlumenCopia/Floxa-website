import hashlib
import hmac
import uuid
from datetime import timedelta
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (
    ActivityLog, BrandDNA, ClientPortalSession, Concept, Deliverable, Moodboard,
    DiscoveryDraft, Notification, Payment, Project, ProjectNote, SmartBrief, UploadedAsset,
)
from .serializers import (
    ActivitySerializer, BrandDNASerializer, ClientProjectSerializer,
    ConceptSerializer, ConsultantProjectListSerializer, ConsultantProjectSerializer,
    DeliverableSerializer, DiscoveryDraftSerializer,
    MoodboardSerializer, NotificationSerializer, PaymentSerializer,
    ProjectNoteSerializer, SmartBriefSerializer, UploadSerializer,
)
from .tokens import generate_portal_token, hash_portal_token


def ok(data=None, message=None, code=status.HTTP_200_OK):
    payload = {"success": True}
    if data is not None:
        payload["data"] = data
    if message:
        payload["message"] = message
    return Response(payload, status=code)


def project_for_user(user, project_id):
    return get_object_or_404(
        Project.objects.select_related("consultant", "client").prefetch_related(
            "moodboards", "concepts", "deliverables", "notes"
        ),
        id=project_id,
        consultant=user,
    )


def portal_project(request):
    value = request.headers.get("X-Client-Portal-Token")
    if not value:
        return None
    session = (
        ClientPortalSession.objects.select_related("project__consultant")
        .filter(token=hash_portal_token(value), revoked=False, expires_at__gt=timezone.now())
        .first()
    )
    return session.project if session else None


def generate_brand_dna(dna):
    values = list((dna.client_sliders or {}).values())
    numeric = [float(value) for value in values if isinstance(value, (int, float))]
    average = sum(numeric) / len(numeric) if numeric else 0
    clusters = [
        (-3, -1.8, "Warm Human", "The Friend", "The Caregiver"),
        (-1.8, -0.8, "Heritage Craft", "The Storyteller", "The Creator"),
        (-0.8, -0.2, "Approachable Modern", "The Guide", "The Everyman"),
        (-0.2, 0.5, "Bold Challenger", "The Challenger", "The Rebel"),
        (0.5, 1.5, "Elevated Heritage", "The Expert", "The Ruler"),
        (1.5, 3.1, "Luxury Premium", "The Curator", "The Magician"),
    ]
    selected = clusters[3]
    for cluster in clusters:
        if cluster[0] <= average < cluster[1]:
            selected = cluster
            break
    dna.personality_cluster = selected[2]
    dna.tone_archetype = selected[3]
    dna.brand_archetype = selected[4]
    dna.tone_descriptors = list((dna.emotions or [])[:5])
    company = dna.client_company or dna.project.name
    audience = dna.audience_archetype or "its ideal customers"
    dna.positioning_statement = (
        f"{company} helps {audience} through a distinctive, "
        f"{dna.personality_cluster.lower()} brand experience."
    )
    dna.tagline_options = [
        f"{company}, made clear.",
        "Clarity before creation.",
        "Built to be remembered.",
    ]
    dna.brand_promise = dna.why_choose_us or "A clear and consistent brand experience."
    dna.emotion_summary = ", ".join(dna.emotions or [])
    dna.visual_brief = (
        f"Create a {dna.personality_cluster.lower()} visual system using "
        f"{', '.join(dna.visual_styles or ['a focused visual direction'])}."
    )
    dna.generated_at = timezone.now()
    dna.save()
    SmartBrief.objects.create(
        project=dna.project,
        version=(dna.project.smart_briefs.first().version + 1) if dna.project.smart_briefs.exists() else 1,
        positioning_statement=dna.positioning_statement,
        audience_profile=dna.audience_profile,
        positioning_gap=dna.positioning_gap,
        tone_archetype=dna.tone_archetype,
        brand_archetype=dna.brand_archetype,
        brand_promise=dna.brand_promise,
        visual_brief=dna.visual_brief,
        tagline_options=dna.tagline_options,
    )
    return dna


class DashboardSummaryView(APIView):
    def get(self, request):
        projects = Project.objects.filter(consultant=request.user)
        counts = projects.aggregate(
            activeProjects=Count(
                "id", filter=~Q(status__in=["DELIVERED", "ARCHIVED"])
            ),
            awaitingAction=Count(
                "id",
                filter=Q(
                    status__in=[
                        "DISCOVERY_COMPLETE", "MOODBOARD_SELECTED", "CONCEPT_APPROVED"
                    ]
                ),
            ),
            completedProjects=Count("id", filter=Q(status="DELIVERED")),
            totalProjects=Count("id"),
        )
        recent_projects = projects.order_by("-updated_at")[:5]
        return ok({
            **counts,
            "recentProjects": ConsultantProjectListSerializer(
                recent_projects, many=True
            ).data,
        })


class ProjectListCreateView(APIView):
    def get(self, request):
        projects = Project.objects.filter(consultant=request.user).order_by("-updated_at")
        return ok(ConsultantProjectListSerializer(projects, many=True).data)

    @transaction.atomic
    def post(self, request):
        serializer = ConsultantProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_token = generate_portal_token()
        project = serializer.save(
            consultant=request.user,
            client_access_token=hash_portal_token(raw_token),
            client_access_expires_at=timezone.now() + timedelta(days=90),
        )
        project.client_portal_url = f"{settings.FRONTEND_URL}/client/{raw_token}"
        project.save(update_fields=["client_portal_url"])
        BrandDNA.objects.create(project=project)
        ActivityLog.objects.create(
            project=project, user=request.user, action="Project created",
            details=f'Project "{project.name}" created. Client link generated.',
        )
        return ok(
            {
                "project": ConsultantProjectSerializer(project).data,
                "clientPortalUrl": project.client_portal_url,
            },
            code=status.HTTP_201_CREATED,
        )


class ProjectDetailView(APIView):
    def get(self, request, project_id):
        return ok(ConsultantProjectSerializer(project_for_user(request.user, project_id)).data)

    def patch(self, request, project_id):
        project = project_for_user(request.user, project_id)
        serializer = ConsultantProjectSerializer(project, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        ActivityLog.objects.create(
            project=project,
            user=request.user,
            action="Project updated",
            details=f'Project "{project.name}" details updated.',
        )
        return ok(serializer.data)

    def delete(self, request, project_id):
        return Response(
            {"error": "Projects must be archived instead of deleted."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


class ProjectArchiveView(APIView):
    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        project.status = Project.Status.ARCHIVED
        project.client_access_revoked = True
        project.portal_sessions.update(revoked=True)
        project.save(update_fields=["status", "client_access_revoked", "updated_at"])
        ActivityLog.objects.create(
            project=project, user=request.user, action="Project archived"
        )
        return ok(ConsultantProjectSerializer(project).data)


class ProjectStatusView(APIView):
    STATUS_ORDER = [
        Project.Status.CREATED,
        Project.Status.PROFILE_COMPLETE,
        Project.Status.DISCOVERY_COMPLETE,
        Project.Status.MOODBOARD_UPLOADED,
        Project.Status.MOODBOARD_SELECTED,
        Project.Status.CONCEPTS_UPLOADED,
        Project.Status.CONCEPT_APPROVED,
        Project.Status.FINAL_UPLOADED,
        Project.Status.DELIVERED,
    ]
    STATUS_PROGRESS = {
        Project.Status.CREATED: 5,
        Project.Status.PROFILE_COMPLETE: 15,
        Project.Status.DISCOVERY_COMPLETE: 30,
        Project.Status.MOODBOARD_UPLOADED: 58,
        Project.Status.MOODBOARD_SELECTED: 65,
        Project.Status.CONCEPTS_UPLOADED: 68,
        Project.Status.CONCEPT_APPROVED: 80,
        Project.Status.FINAL_UPLOADED: 90,
        Project.Status.DELIVERED: 100,
    }

    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        if project.status == Project.Status.ARCHIVED:
            return Response({"error": "Archived projects cannot be reactivated."}, status=400)
        requested = request.data.get("status")
        if requested not in self.STATUS_ORDER:
            return Response({"error": "Unsupported MVP project status."}, status=400)
        current_index = self.STATUS_ORDER.index(project.status) if project.status in self.STATUS_ORDER else -1
        requested_index = self.STATUS_ORDER.index(requested)
        if requested_index < current_index:
            return Response({"error": "Project status cannot move backwards."}, status=400)
        project.status = requested
        project.completion_pct = self.STATUS_PROGRESS[requested]
        project.save(update_fields=["status", "completion_pct", "updated_at"])
        ActivityLog.objects.create(
            project=project,
            user=request.user,
            action="Project status updated",
            details=project.get_status_display(),
        )
        return ok(ConsultantProjectSerializer(project).data)


class ProjectResendLinkView(APIView):
    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        ActivityLog.objects.create(
            project=project, user=request.user, action="Client link requested",
            details=f"Email integration pending for {project.client_email}.",
        )
        return ok({"clientPortalUrl": project.client_portal_url})


class ProjectNotifyView(APIView):
    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        notification = Notification.objects.create(
            user=request.user,
            project=project,
            type=request.data.get("type", "CUSTOM"),
            title=request.data.get("title", "Project update"),
            body=request.data.get("body", ""),
            action_url=f"/dashboard/projects/{project.id}",
        )
        return ok(NotificationSerializer(notification).data, code=status.HTTP_201_CREATED)

##dummy for teting
from rest_framework.permissions import AllowAny


# Public endpoint used by external portfolio websites to read published projects.
class PublicPortfolioProjectsView(APIView):
    # No login is required because this data is meant for public portfolio display.
    permission_classes = [AllowAny]

    def get(self, request):
        # Only projects explicitly published from Floxa should appear here.
        projects = Project.objects.filter(
            published_to_portfolio=True
        ).order_by("-published_at")

        # Convert the project queryset into JSON data for the frontend.
        data = ConsultantProjectSerializer(projects, many=True).data

        return Response(data)


class ProjectPublishView(APIView):
    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        project.published_to_portfolio = True
        project.published_at = timezone.now()
        project.save(update_fields=["published_to_portfolio", "published_at"])
        return ok(ConsultantProjectSerializer(project).data)


class ProjectActivityView(APIView):
    def get(self, request, project_id):
        project = project_for_user(request.user, project_id)
        logs = project.activity_logs.select_related("user").order_by("-created_at")[:50]
        return ok(ActivitySerializer(logs, many=True).data)


class ProjectNotesView(APIView):
    def get(self, request, project_id):
        project = project_for_user(request.user, project_id)
        return ok(ProjectNoteSerializer(project.notes.order_by("-created_at"), many=True).data)

    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        serializer = ProjectNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = serializer.save(project=project, author=request.user.name)
        ActivityLog.objects.create(
            project=project,
            user=request.user,
            action="Project note added",
            details="Internal note added." if note.type == "internal" else "Client note added.",
        )
        return ok(ProjectNoteSerializer(note).data, code=status.HTTP_201_CREATED)


class BrandDNAView(APIView):
    def get(self, request, project_id):
        project = project_for_user(request.user, project_id)
        dna, _ = BrandDNA.objects.get_or_create(project=project)
        return ok(BrandDNASerializer(dna).data)


class DiscoveryView(APIView):
    def put(self, request, project_id):
        project = project_for_user(request.user, project_id)
        dna, _ = BrandDNA.objects.get_or_create(project=project)
        serializer = BrandDNASerializer(dna, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return ok(serializer.data)


class BrandDNAGenerateView(APIView):
    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        dna, _ = BrandDNA.objects.get_or_create(project=project)
        return ok(BrandDNASerializer(generate_brand_dna(dna)).data)


class SmartBriefView(APIView):
    def get(self, request, project_id):
        project = project_for_user(request.user, project_id)
        brief = project.smart_briefs.first()
        if not brief:
            dna, _ = BrandDNA.objects.get_or_create(project=project)
            generate_brand_dna(dna)
            brief = project.smart_briefs.first()
        return ok(SmartBriefSerializer(brief).data)

    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        latest = project.smart_briefs.first()
        serializer = SmartBriefSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        brief = serializer.save(
            project=project,
            version=(latest.version + 1) if latest else 1,
        )
        dna, _ = BrandDNA.objects.get_or_create(project=project)
        for field in (
            "positioning_statement", "audience_profile", "positioning_gap",
            "tone_archetype", "brand_archetype", "brand_promise",
            "visual_brief", "tagline_options",
        ):
            setattr(dna, field, getattr(brief, field))
        dna.save()
        ActivityLog.objects.create(
            project=project, user=request.user, action="Smart Brief saved",
            details=f"Version {brief.version}",
        )
        return ok(SmartBriefSerializer(brief).data, code=201)


class ClientPortalSessionView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "portal_exchange"

    def post(self, request):
        link_token = request.data.get("token")
        project = Project.objects.select_related("consultant").filter(
            client_access_token=hash_portal_token(link_token or ""),
            client_access_revoked=False,
        ).first()
        if not project:
            return Response({"error": "Invalid or revoked client link."}, status=401)
        if project.client_access_expires_at and project.client_access_expires_at <= timezone.now():
            return Response({"error": "This client link has expired."}, status=401)
        raw_session = generate_portal_token()
        session = ClientPortalSession.objects.create(
            token=hash_portal_token(raw_session),
            project=project,
            expires_at=timezone.now() + timedelta(hours=8),
        )
        ActivityLog.objects.create(
            project=project,
            action="Client portal opened",
            details="A secure client portal session was created.",
        )
        return Response({
            "portal_token": raw_session,
            "project": ClientProjectSerializer(project).data,
        })


class ClientPortalProjectView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        project = portal_project(request)
        if not project:
            return Response({"error": "Invalid or expired portal session."}, status=401)
        if (
            project.client_access_revoked
            or (
                project.client_access_expires_at
                and project.client_access_expires_at <= timezone.now()
            )
        ):
            return Response({"error": "Invalid or expired client link."}, status=401)
        return ok(ClientProjectSerializer(project).data)


class ClientPortalProfileView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request):
        project = portal_project(request)
        if not project:
            return Response({"error": "Invalid portal session."}, status=401)
        first_completion = project.status == Project.Status.CREATED
        dna, _ = BrandDNA.objects.get_or_create(project=project)
        serializer = BrandDNASerializer(dna, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if first_completion:
            project.status = Project.Status.PROFILE_COMPLETE
            project.completion_pct = 15
            project.save(update_fields=["status", "completion_pct"])
        ActivityLog.objects.create(
            project=project,
            action="Client profile saved",
            details=serializer.instance.client_company or serializer.instance.client_name,
        )
        if first_completion:
            Notification.objects.create(
                user=project.consultant,
                project=project,
                type="PROFILE_COMPLETE",
                title="Client profile completed",
                body=f"Client profile was saved for {project.name}.",
                action_url=f"/dashboard/projects/{project.id}",
            )
        return ok(serializer.data)


class ClientPortalDiscoveryDraftView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        project = portal_project(request)
        if not project:
            return Response({"error": "Invalid portal session."}, status=401)
        draft, _ = DiscoveryDraft.objects.get_or_create(project=project)
        return ok(DiscoveryDraftSerializer(draft).data)

    def patch(self, request):
        project = portal_project(request)
        if not project:
            return Response({"error": "Invalid portal session."}, status=401)
        draft, _ = DiscoveryDraft.objects.get_or_create(project=project)
        first_save = not draft.started_at
        serializer = DiscoveryDraftSerializer(draft, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if not draft.started_at:
            draft.started_at = timezone.now()
        draft = serializer.save(started_at=draft.started_at)
        if first_save:
            ActivityLog.objects.create(
                project=project,
                action="Discovery started",
                details="Client started the discovery questionnaire.",
            )
        ActivityLog.objects.create(
            project=project,
            action="Discovery draft saved",
            details=f"Saved at step {draft.current_step}.",
        )
        return ok(DiscoveryDraftSerializer(draft).data)


class ClientPortalDiscoveryView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        project = portal_project(request)
        if not project:
            return Response({"error": "Invalid portal session."}, status=401)
        payload = request.data.copy()
        payload.pop("token", None)
        dna, _ = BrandDNA.objects.get_or_create(project=project)
        required = {
            "whatDo": payload.get("whatDo") or dna.what_do,
            "targetCustomer": payload.get("targetCustomer") or dna.target_customer,
            "whyChooseUs": payload.get("whyChooseUs") or dna.why_choose_us,
            "brandFeeling": payload.get("brandFeeling") or dna.brand_feeling,
            "audienceArchetype": payload.get("audienceArchetype") or dna.audience_archetype,
            "emotions": payload.get("emotions") or dna.emotions,
            "visualStyles": payload.get("visualStyles") or dna.visual_styles,
        }
        missing = [field for field, value in required.items() if not value]
        if missing:
            return Response(
                {"error": f"Required discovery fields are missing: {', '.join(missing)}."},
                status=400,
            )
        serializer = BrandDNASerializer(dna, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        generate_brand_dna(dna)
        DiscoveryDraft.objects.filter(project=project).delete()
        if project.status in (
            Project.Status.CREATED,
            Project.Status.PROFILE_COMPLETE,
        ):
            project.status = Project.Status.DISCOVERY_COMPLETE
            project.completion_pct = 30
            project.save(update_fields=["status", "completion_pct"])
        ActivityLog.objects.create(
            project=project,
            action="Discovery submitted",
            details="Client completed and submitted discovery.",
        )
        Notification.objects.create(
            user=project.consultant, project=project, type="DISCOVERY_COMPLETE",
            title="Discovery complete",
            body=f"Client completed discovery for {project.name}.",
            action_url=f"/dashboard/projects/{project.id}",
        )
        return ok(BrandDNASerializer(dna).data)


class ClientPortalLogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        value = request.headers.get("X-Client-Portal-Token")
        if value:
            ClientPortalSession.objects.filter(token=hash_portal_token(value)).update(revoked=True)
        return Response(status=204)


class ClientPortalMoodboardSelectView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, moodboard_id):
        project = portal_project(request)
        if not project:
            return Response({"error": "Invalid portal session."}, status=401)
        moodboard = get_object_or_404(Moodboard, id=moodboard_id, project=project)
        project.moodboards.update(client_selected=False, selected_at=None)
        moodboard.client_selected = True
        moodboard.selected_at = timezone.now()
        moodboard.save(update_fields=["client_selected", "selected_at"])
        project.status = Project.Status.MOODBOARD_SELECTED
        project.completion_pct = 65
        project.save(update_fields=["status", "completion_pct"])
        ActivityLog.objects.create(
            project=project,
            action="Moodboard selected by client",
            details=moodboard.name,
        )
        Notification.objects.create(
            user=project.consultant,
            project=project,
            type="MOODBOARD_SELECTED",
            title="Moodboard selected",
            body=f"Client selected {moodboard.name} for {project.name}.",
            action_url=f"/dashboard/projects/{project.id}",
        )
        return ok(MoodboardSerializer(moodboard).data)


class ClientPortalConceptDecisionView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, concept_id):
        project = portal_project(request)
        if not project:
            return Response({"error": "Invalid portal session."}, status=401)
        concept = get_object_or_404(Concept, id=concept_id, project=project)
        decision = request.data.get("status", "").upper()
        if decision not in (Concept.Status.SELECTED, Concept.Status.REJECTED):
            return Response({"error": "Status must be SELECTED or REJECTED."}, status=400)
        concept.client_status = decision
        concept.client_comment = request.data.get("comment", "")
        concept.selected_at = timezone.now() if decision == Concept.Status.SELECTED else None
        concept.rejected_at = timezone.now() if decision == Concept.Status.REJECTED else None
        concept.save()
        if decision == Concept.Status.SELECTED:
            project.status = Project.Status.CONCEPT_APPROVED
            project.completion_pct = 80
        else:
            project.rework_used += 1
        project.save(update_fields=["status", "completion_pct", "rework_used"])
        ActivityLog.objects.create(
            project=project,
            action=f"Concept {decision.lower()} by client",
            details=concept.client_comment,
        )
        Notification.objects.create(
            user=project.consultant,
            project=project,
            type="CONCEPT_APPROVED" if decision == Concept.Status.SELECTED else "REWORK_REQUESTED",
            title="Concept approved" if decision == Concept.Status.SELECTED else "Concept rejected",
            body=f"Client reviewed {concept.title} for {project.name}.",
            action_url=f"/dashboard/projects/{project.id}",
        )
        return ok(ConceptSerializer(concept).data)


class ClientPortalDeliverableDownloadView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, deliverable_id):
        project = portal_project(request)
        if not project:
            return Response({"error": "Invalid portal session."}, status=401)
        deliverable = get_object_or_404(Deliverable, id=deliverable_id, project=project)
        deliverable.download_count += 1
        deliverable.downloaded_at = timezone.now()
        deliverable.save(update_fields=["download_count", "downloaded_at"])
        return ok({"fileUrl": deliverable.file_url})


class ProjectMoodboardsView(APIView):
    def get(self, request, project_id):
        project = project_for_user(request.user, project_id)
        return ok(MoodboardSerializer(project.moodboards.order_by("sort_order"), many=True).data)

    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        serializer = MoodboardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        moodboard = serializer.save(project=project)
        project.status = Project.Status.MOODBOARD_UPLOADED
        project.completion_pct = 58
        project.save(update_fields=["status", "completion_pct"])
        return ok(MoodboardSerializer(moodboard).data, code=201)


class ProjectMoodboardDetailView(APIView):
    def delete(self, request, project_id, item_id):
        project = project_for_user(request.user, project_id)
        get_object_or_404(Moodboard, id=item_id, project=project).delete()
        return Response(status=204)


class ProjectConceptsView(APIView):
    def get(self, request, project_id):
        project = project_for_user(request.user, project_id)
        return ok(ConceptSerializer(project.concepts.order_by("round", "option_number"), many=True).data)

    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        serializer = ConceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        concept = serializer.save(project=project)
        project.status = Project.Status.CONCEPTS_UPLOADED
        project.completion_pct = 68
        project.save(update_fields=["status", "completion_pct"])
        return ok(ConceptSerializer(concept).data, code=201)


class ProjectConceptDetailView(APIView):
    def delete(self, request, project_id, item_id):
        project = project_for_user(request.user, project_id)
        get_object_or_404(Concept, id=item_id, project=project).delete()
        return Response(status=204)


class ProjectDeliverablesView(APIView):
    def get(self, request, project_id):
        project = project_for_user(request.user, project_id)
        return ok(DeliverableSerializer(project.deliverables.all(), many=True).data)

    def post(self, request, project_id):
        project = project_for_user(request.user, project_id)
        serializer = DeliverableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deliverable = serializer.save(project=project, uploaded_at=timezone.now())
        project.status = Project.Status.FINAL_UPLOADED
        project.completion_pct = 90
        project.save(update_fields=["status", "completion_pct"])
        return ok(DeliverableSerializer(deliverable).data, code=201)


class ProjectDeliverableDetailView(APIView):
    def delete(self, request, project_id, item_id):
        project = project_for_user(request.user, project_id)
        get_object_or_404(Deliverable, id=item_id, project=project).delete()
        return Response(status=204)


class UploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response({"error": "No file provided."}, status=400)
        try:
            UploadSerializer.validate_upload(uploaded)
        except Exception as exc:
            detail = getattr(exc, "detail", str(exc))
            return Response({"error": detail}, status=400)
        asset = UploadedAsset.objects.create(
            owner=request.user,
            file=uploaded,
            folder=request.data.get("folder", "general"),
        )
        return ok(UploadSerializer(asset, context={"request": request}).data, code=201)


class NotificationsView(APIView):
    def get(self, request):
        items = request.user.notifications.order_by("-created_at")[:30]
        return ok(NotificationSerializer(items, many=True).data)


class MarkNotificationsReadView(APIView):
    def post(self, request):
        request.user.notifications.filter(read=False).update(read=True, read_at=timezone.now())
        return ok()


class CreatePaymentOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        project = portal_project(request)
        if not project and request.data.get("token"):
            project = Project.objects.filter(
                id=request.data.get("projectId"),
                client_access_token=hash_portal_token(request.data.get("token", "")),
            ).first()
        if not project:
            return Response({"error": "Invalid portal session."}, status=401)
        payment_type = request.data.get("paymentType", "advance")
        percentage = {
            "advance": project.split_advance_pct,
            "mid": project.split_mid_pct,
            "final": project.split_final_pct,
        }.get(payment_type, project.split_advance_pct)
        amount = (project.project_value * Decimal(percentage) / Decimal("100")).quantize(Decimal("1"))
        order_id = f"placeholder_{uuid.uuid4().hex}"
        Payment.objects.update_or_create(
            project=project,
            type=payment_type,
            defaults={
                "amount": amount,
                "percentage": percentage,
                "status": Payment.Status.INITIATED,
                "gateway_order_id": order_id,
            },
        )
        return ok({
            "orderId": order_id,
            "amount": int(amount * 100),
            "currency": "INR",
            "keyId": settings.RAZORPAY_KEY_ID,
            "projectName": project.name,
        })


class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not settings.RAZORPAY_KEY_SECRET:
            return Response(
                {"error": "Razorpay verification is not configured."},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )
        order_id = request.data.get("razorpay_order_id", "")
        payment_id = request.data.get("razorpay_payment_id", "")
        signature = request.data.get("razorpay_signature", "")
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{order_id}|{payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            return Response({"error": "Invalid payment signature."}, status=400)
        payment = get_object_or_404(Payment, gateway_order_id=order_id)
        payment.status = Payment.Status.PAID
        payment.gateway_payment_id = payment_id
        payment.gateway_signature = signature
        payment.paid_at = timezone.now()
        payment.save()
        return ok(PaymentSerializer(payment).data)
