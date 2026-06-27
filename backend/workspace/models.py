import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models


from .tokens import generate_hashed_portal_token, hash_portal_token


def token():
    """Compatibility callable retained for the initial migration."""
    return generate_hashed_portal_token()


class Project(models.Model):
    class Sector(models.TextChoices):
        BRAND_IDENTITY = "BRAND_IDENTITY", "Brand identity"
        DIGITAL_MARKETING = "DIGITAL_MARKETING", "Digital marketing"
        UI_UX_DESIGN = "UI_UX_DESIGN", "UI/UX design"
        IT_DEVELOPMENT = "IT_DEVELOPMENT", "IT development"
        CONTENT_VIDEO = "CONTENT_VIDEO", "Content/video"
        EVENTS = "EVENTS", "Events"
        ARCHITECTURE = "ARCHITECTURE", "Architecture"
        PHOTOGRAPHY = "PHOTOGRAPHY", "Photography"

    class Status(models.TextChoices):
        CREATED = "CREATED", "Created"
        PROFILE_COMPLETE = "PROFILE_COMPLETE", "Profile complete"
        DISCOVERY_COMPLETE = "DISCOVERY_COMPLETE", "Discovery complete"
        VISUAL_SELECTED = "VISUAL_SELECTED", "Visual selected"
        AGREEMENT_SENT = "AGREEMENT_SENT", "Agreement sent"
        AGREEMENT_SIGNED = "AGREEMENT_SIGNED", "Agreement signed"
        ADVANCE_PAID = "ADVANCE_PAID", "Advance paid"
        MOODBOARD_UPLOADED = "MOODBOARD_UPLOADED", "Moodboard uploaded"
        MOODBOARD_SELECTED = "MOODBOARD_SELECTED", "Moodboard selected"
        CONCEPTS_UPLOADED = "CONCEPTS_UPLOADED", "Concepts uploaded"
        CONCEPT_APPROVED = "CONCEPT_APPROVED", "Concept approved"
        MID_PAID = "MID_PAID", "Mid paid"
        FINAL_UPLOADED = "FINAL_UPLOADED", "Final uploaded"
        FINAL_APPROVED = "FINAL_APPROVED", "Final approved"
        FINAL_PAID = "FINAL_PAID", "Final paid"
        DELIVERED = "DELIVERED", "Delivered"
        ARCHIVED = "ARCHIVED", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    sector = models.CharField(max_length=40, choices=Sector.choices, default=Sector.BRAND_IDENTITY)
    status = models.CharField(max_length=40, choices=Status.choices, default=Status.CREATED)
    completion_pct = models.PositiveSmallIntegerField(default=5)
    consultant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="consultant_projects"
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="client_projects",
    )
    client_access_token = models.CharField(
        max_length=128, unique=True, default=generate_hashed_portal_token
    )
    client_access_expires_at = models.DateTimeField(null=True, blank=True)
    client_access_revoked = models.BooleanField(default=False)
    client_portal_url = models.URLField(blank=True)
    client_email = models.EmailField(blank=True)
    client_note = models.TextField(blank=True)
    project_value = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    split_advance_pct = models.PositiveSmallIntegerField(default=50)
    split_mid_pct = models.PositiveSmallIntegerField(default=30)
    split_final_pct = models.PositiveSmallIntegerField(default=20)
    free_revisions = models.PositiveSmallIntegerField(default=2)
    rework_used = models.PositiveSmallIntegerField(default=0)
    extra_revision_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("5000"))
    gate_files_behind_payment = models.BooleanField(default=True)
    custom_branding = models.BooleanField(default=False)
    published_to_portfolio = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    portfolio_slug = models.SlugField(max_length=255, blank=True)
    show_client_name = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_client_access_token(self, raw_token):
        self.client_access_token = hash_portal_token(raw_token)


class ClientPortalSession(models.Model):
    token = models.CharField(
        max_length=128, primary_key=True, default=generate_hashed_portal_token, editable=False
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="portal_sessions")
    expires_at = models.DateTimeField()
    revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class DiscoveryDraft(models.Model):
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name="discovery_draft"
    )
    data = models.JSONField(default=dict, blank=True)
    current_step = models.PositiveSmallIntegerField(default=1)
    started_at = models.DateTimeField(null=True, blank=True)
    saved_at = models.DateTimeField(auto_now=True)


class BrandDNA(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name="brand_dna")
    what_do = models.TextField(blank=True)
    target_customer = models.TextField(blank=True)
    why_choose_us = models.TextField(blank=True)
    client_sliders = models.JSONField(default=dict, blank=True)
    consultant_sliders = models.JSONField(default=dict, blank=True)
    emotions = models.JSONField(default=list, blank=True)
    brand_feeling = models.TextField(blank=True)
    audience_archetype = models.CharField(max_length=255, blank=True)
    competitors = models.JSONField(default=list, blank=True)
    visual_styles = models.JSONField(default=list, blank=True)
    personality_cluster = models.CharField(max_length=255, blank=True)
    audience_profile = models.TextField(blank=True)
    positioning_gap = models.TextField(blank=True)
    tone_archetype = models.CharField(max_length=255, blank=True)
    tone_descriptors = models.JSONField(default=list, blank=True)
    tone_dos = models.JSONField(default=list, blank=True)
    tone_donts = models.JSONField(default=list, blank=True)
    brand_archetype = models.CharField(max_length=255, blank=True)
    positioning_statement = models.TextField(blank=True)
    tagline_options = models.JSONField(default=list, blank=True)
    selected_tagline = models.CharField(max_length=255, blank=True)
    brand_promise = models.TextField(blank=True)
    emotion_summary = models.TextField(blank=True)
    visual_brief = models.TextField(blank=True)
    client_name = models.CharField(max_length=255, blank=True)
    client_company = models.CharField(max_length=255, blank=True)
    client_industry = models.CharField(max_length=255, blank=True)
    client_year_start = models.PositiveIntegerField(null=True, blank=True)
    client_location = models.CharField(max_length=255, blank=True)
    client_phone = models.CharField(max_length=50, blank=True)
    client_email = models.EmailField(blank=True)
    client_website = models.URLField(blank=True)
    consultant_notes = models.TextField(blank=True)
    client_notes = models.TextField(blank=True)
    generated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SmartBrief(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="smart_briefs")
    version = models.PositiveIntegerField(default=1)
    positioning_statement = models.TextField(blank=True)
    audience_profile = models.TextField(blank=True)
    positioning_gap = models.TextField(blank=True)
    tone_archetype = models.CharField(max_length=255, blank=True)
    brand_archetype = models.CharField(max_length=255, blank=True)
    brand_promise = models.TextField(blank=True)
    visual_brief = models.TextField(blank=True)
    tagline_options = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-version", "-updated_at")
        constraints = [
            models.UniqueConstraint(
                fields=("project", "version"), name="unique_project_smart_brief_version"
            )
        ]


class Moodboard(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="moodboards")
    name = models.CharField(max_length=255, default="Moodboard")
    keywords = models.JSONField(default=list, blank=True)
    image_urls = models.JSONField(default=list, blank=True)
    cover_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=1)
    client_selected = models.BooleanField(default=False)
    selected_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Concept(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PINNED = "PINNED", "Pinned"
        SELECTED = "SELECTED", "Selected"
        REJECTED = "REJECTED", "Rejected"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="concepts")
    round = models.PositiveIntegerField(default=1)
    option_number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    mockup_urls = models.JSONField(default=list, blank=True)
    logo_url = models.URLField(blank=True)
    color_palette = models.JSONField(default=list, blank=True)
    typography_note = models.TextField(blank=True)
    client_status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    client_comment = models.TextField(blank=True)
    selected_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rework_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Deliverable(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="deliverables")
    category = models.CharField(max_length=100)
    label = models.CharField(max_length=255)
    file_url = models.URLField(blank=True)
    preview_url = models.URLField(blank=True)
    file_size = models.PositiveBigIntegerField(null=True, blank=True)
    file_format = models.CharField(max_length=50, blank=True)
    gated = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(null=True, blank=True)
    downloaded_at = models.DateTimeField(null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        INITIATED = "INITIATED", "Initiated"
        PAID = "PAID", "Paid"
        FAILED = "FAILED", "Failed"
        REFUNDED = "REFUNDED", "Refunded"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="payments")
    type = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    percentage = models.PositiveSmallIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    gateway = models.CharField(max_length=20, default="RAZORPAY")
    gateway_order_id = models.CharField(max_length=255, blank=True)
    gateway_payment_id = models.CharField(max_length=255, blank=True)
    gateway_signature = models.CharField(max_length=255, blank=True)
    invoice_url = models.URLField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("project", "type"), name="unique_project_payment_type")
        ]


class ProjectNote(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="notes")
    type = models.CharField(max_length=20, default="internal")
    content = models.TextField()
    author = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ActivityLog(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="activity_logs"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="activity_logs",
    )
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    project = models.ForeignKey(
        Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="notifications"
    )
    type = models.CharField(max_length=50, default="CUSTOM")
    title = models.CharField(max_length=255)
    body = models.TextField()
    read = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    whatsapp_sent = models.BooleanField(default=False)
    action_url = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)


class UploadedAsset(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to="uploads/%Y/%m/")
    folder = models.CharField(max_length=100, default="general")
    created_at = models.DateTimeField(auto_now_add=True)
