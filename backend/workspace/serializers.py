from pathlib import Path

from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import (
    ActivityLog,
    BrandDNA,
    Concept,
    Deliverable,
    Moodboard,
    Notification,
    Payment,
    Project,
    ProjectNote,
    DiscoveryDraft,
    SmartBrief,
    UploadedAsset,
)


class BrandDNASerializer(serializers.ModelSerializer):
    projectId = serializers.UUIDField(source="project_id", read_only=True)
    whatDo = serializers.CharField(source="what_do", allow_blank=True, required=False)
    targetCustomer = serializers.CharField(source="target_customer", allow_blank=True, required=False)
    whyChooseUs = serializers.CharField(source="why_choose_us", allow_blank=True, required=False)
    clientSliders = serializers.JSONField(source="client_sliders", required=False)
    consultantSliders = serializers.JSONField(source="consultant_sliders", required=False)
    brandFeeling = serializers.CharField(source="brand_feeling", allow_blank=True, required=False)
    audienceArchetype = serializers.CharField(source="audience_archetype", allow_blank=True, required=False)
    visualStyles = serializers.JSONField(source="visual_styles", required=False)
    personalityCluster = serializers.CharField(source="personality_cluster", allow_blank=True, required=False)
    audienceProfile = serializers.CharField(source="audience_profile", allow_blank=True, required=False)
    positioningGap = serializers.CharField(source="positioning_gap", allow_blank=True, required=False)
    toneArchetype = serializers.CharField(source="tone_archetype", allow_blank=True, required=False)
    toneDescriptors = serializers.JSONField(source="tone_descriptors", required=False)
    toneDos = serializers.JSONField(source="tone_dos", required=False)
    toneDonts = serializers.JSONField(source="tone_donts", required=False)
    brandArchetype = serializers.CharField(source="brand_archetype", allow_blank=True, required=False)
    positioningStatement = serializers.CharField(source="positioning_statement", allow_blank=True, required=False)
    taglineOptions = serializers.JSONField(source="tagline_options", required=False)
    selectedTagline = serializers.CharField(source="selected_tagline", allow_blank=True, required=False)
    brandPromise = serializers.CharField(source="brand_promise", allow_blank=True, required=False)
    emotionSummary = serializers.CharField(source="emotion_summary", allow_blank=True, required=False)
    visualBrief = serializers.CharField(source="visual_brief", allow_blank=True, required=False)
    clientName = serializers.CharField(source="client_name", allow_blank=True, required=False)
    clientCompany = serializers.CharField(source="client_company", allow_blank=True, required=False)
    clientIndustry = serializers.CharField(source="client_industry", allow_blank=True, required=False)
    clientYearStart = serializers.IntegerField(source="client_year_start", allow_null=True, required=False)
    clientLocation = serializers.CharField(source="client_location", allow_blank=True, required=False)
    clientPhone = serializers.CharField(source="client_phone", allow_blank=True, required=False)
    clientEmail = serializers.EmailField(source="client_email", allow_blank=True, required=False)
    clientWebsite = serializers.URLField(source="client_website", allow_blank=True, required=False)
    consultantNotes = serializers.CharField(source="consultant_notes", allow_blank=True, required=False)
    clientNotes = serializers.CharField(source="client_notes", allow_blank=True, required=False)
    generatedAt = serializers.DateTimeField(source="generated_at", read_only=True)

    class Meta:
        model = BrandDNA
        fields = (
            "id", "projectId", "whatDo", "targetCustomer", "whyChooseUs",
            "clientSliders", "consultantSliders", "emotions", "brandFeeling",
            "audienceArchetype", "competitors", "visualStyles", "personalityCluster",
            "audienceProfile", "positioningGap", "toneArchetype", "toneDescriptors",
            "toneDos", "toneDonts", "brandArchetype", "positioningStatement",
            "taglineOptions", "selectedTagline", "brandPromise", "emotionSummary",
            "visualBrief", "clientName", "clientCompany", "clientIndustry",
            "clientYearStart", "clientLocation", "clientPhone", "clientEmail",
            "clientWebsite", "consultantNotes", "clientNotes", "generatedAt",
        )


class ClientBrandDNASerializer(BrandDNASerializer):
    class Meta(BrandDNASerializer.Meta):
        fields = tuple(
            field for field in BrandDNASerializer.Meta.fields
            if field not in ("consultantNotes", "consultantSliders", "clientPhone", "clientEmail")
        )


class MoodboardSerializer(serializers.ModelSerializer):
    projectId = serializers.UUIDField(source="project_id", read_only=True)
    imageUrls = serializers.JSONField(source="image_urls", required=False)
    coverUrl = serializers.URLField(source="cover_url", allow_blank=True, required=False)
    sortOrder = serializers.IntegerField(source="sort_order", required=False)
    clientSelected = serializers.BooleanField(source="client_selected", read_only=True)
    selectedAt = serializers.DateTimeField(source="selected_at", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Moodboard
        fields = (
            "id", "projectId", "name", "keywords", "imageUrls", "coverUrl",
            "sortOrder", "clientSelected", "selectedAt", "createdAt",
        )


class ConceptSerializer(serializers.ModelSerializer):
    projectId = serializers.UUIDField(source="project_id", read_only=True)
    optionNumber = serializers.IntegerField(source="option_number", required=False)
    mockupUrls = serializers.JSONField(source="mockup_urls", required=False)
    logoUrl = serializers.URLField(source="logo_url", allow_blank=True, required=False)
    colorPalette = serializers.JSONField(source="color_palette", required=False)
    typographyNote = serializers.CharField(source="typography_note", allow_blank=True, required=False)
    clientStatus = serializers.CharField(source="client_status", read_only=True)
    clientComment = serializers.CharField(source="client_comment", read_only=True)
    selectedAt = serializers.DateTimeField(source="selected_at", read_only=True)
    rejectedAt = serializers.DateTimeField(source="rejected_at", read_only=True)
    reworkNote = serializers.CharField(source="rework_note", allow_blank=True, required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Concept
        fields = (
            "id", "projectId", "round", "optionNumber", "title", "description",
            "mockupUrls", "logoUrl", "colorPalette", "typographyNote",
            "clientStatus", "clientComment", "selectedAt", "rejectedAt",
            "reworkNote", "createdAt",
        )


class DeliverableSerializer(serializers.ModelSerializer):
    projectId = serializers.UUIDField(source="project_id", read_only=True)
    fileUrl = serializers.URLField(source="file_url", allow_blank=True, required=False)
    previewUrl = serializers.URLField(source="preview_url", allow_blank=True, required=False)
    fileSize = serializers.IntegerField(source="file_size", allow_null=True, required=False)
    fileFormat = serializers.CharField(source="file_format", allow_blank=True, required=False)
    uploadedAt = serializers.DateTimeField(source="uploaded_at", read_only=True)
    downloadedAt = serializers.DateTimeField(source="downloaded_at", read_only=True)
    downloadCount = serializers.IntegerField(source="download_count", read_only=True)

    class Meta:
        model = Deliverable
        fields = (
            "id", "projectId", "category", "label", "fileUrl", "previewUrl",
            "fileSize", "fileFormat", "gated", "uploadedAt", "downloadedAt",
            "downloadCount",
        )


class ProjectNoteSerializer(serializers.ModelSerializer):
    projectId = serializers.UUIDField(source="project_id", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = ProjectNote
        fields = ("id", "projectId", "type", "content", "author", "createdAt")


class ActivitySerializer(serializers.ModelSerializer):
    projectId = serializers.UUIDField(source="project_id", read_only=True)
    userId = serializers.UUIDField(source="user_id", read_only=True)
    user = UserSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = ActivityLog
        fields = ("id", "projectId", "userId", "user", "action", "details", "metadata", "createdAt")


class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source="user_id", read_only=True)
    projectId = serializers.UUIDField(source="project_id", read_only=True)
    actionUrl = serializers.CharField(source="action_url", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    readAt = serializers.DateTimeField(source="read_at", read_only=True)

    class Meta:
        model = Notification
        fields = (
            "id", "userId", "projectId", "type", "title", "body", "read",
            "actionUrl", "createdAt", "readAt",
        )


class ConsultantProjectSerializer(serializers.ModelSerializer):
    consultantId = serializers.UUIDField(source="consultant_id", read_only=True)
    consultant = UserSerializer(read_only=True)
    clientId = serializers.UUIDField(source="client_id", read_only=True)
    clientPortalUrl = serializers.URLField(source="client_portal_url", read_only=True)
    clientEmail = serializers.EmailField(source="client_email", allow_blank=True, required=False)
    clientNote = serializers.CharField(source="client_note", allow_blank=True, required=False)
    completionPct = serializers.IntegerField(source="completion_pct", read_only=True)
    projectValue = serializers.DecimalField(
        source="project_value", max_digits=14, decimal_places=2, coerce_to_string=False
    )
    splitAdvancePct = serializers.IntegerField(source="split_advance_pct", required=False)
    splitMidPct = serializers.IntegerField(source="split_mid_pct", required=False)
    splitFinalPct = serializers.IntegerField(source="split_final_pct", required=False)
    freeRevisions = serializers.IntegerField(source="free_revisions", required=False)
    reworkUsed = serializers.IntegerField(source="rework_used", read_only=True)
    extraRevisionCost = serializers.DecimalField(
        source="extra_revision_cost", max_digits=12, decimal_places=2,
        coerce_to_string=False, required=False,
    )
    gateFilesBehindPayment = serializers.BooleanField(source="gate_files_behind_payment", required=False)
    publishedToPortfolio = serializers.BooleanField(source="published_to_portfolio", read_only=True)
    publishedAt = serializers.DateTimeField(source="published_at", read_only=True)
    portfolioSlug = serializers.CharField(source="portfolio_slug", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    brandDNA = BrandDNASerializer(source="brand_dna", read_only=True)
    moodboards = MoodboardSerializer(many=True, read_only=True)
    concepts = ConceptSerializer(many=True, read_only=True)
    deliverables = DeliverableSerializer(many=True, read_only=True)
    notes = ProjectNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = (
            "id", "name", "sector", "status", "completionPct", "consultantId",
            "consultant", "clientId", "clientPortalUrl", "clientEmail", "clientNote",
            "projectValue", "splitAdvancePct", "splitMidPct", "splitFinalPct",
            "freeRevisions", "reworkUsed", "extraRevisionCost",
            "gateFilesBehindPayment", "publishedToPortfolio", "publishedAt",
            "portfolioSlug", "createdAt", "updatedAt", "brandDNA", "moodboards",
            "concepts", "deliverables", "notes",
        )
        read_only_fields = ("status",)


class ConsultantProjectListSerializer(serializers.ModelSerializer):
    clientPortalUrl = serializers.URLField(source="client_portal_url", read_only=True)
    clientEmail = serializers.EmailField(source="client_email", read_only=True)
    completionPct = serializers.IntegerField(source="completion_pct", read_only=True)
    projectValue = serializers.DecimalField(
        source="project_value", max_digits=14, decimal_places=2, coerce_to_string=False,
        read_only=True,
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Project
        fields = (
            "id", "name", "sector", "status", "completionPct", "clientPortalUrl",
            "clientEmail", "projectValue", "createdAt", "updatedAt",
        )


class ClientProjectSerializer(serializers.ModelSerializer):
    completionPct = serializers.IntegerField(source="completion_pct", read_only=True)
    clientEmail = serializers.EmailField(source="client_email", read_only=True)
    meetingSummary = serializers.CharField(source="client_note", read_only=True)
    consultantName = serializers.CharField(source="consultant.name", read_only=True)
    consultantCompany = serializers.CharField(source="consultant.company_name", read_only=True)
    brandPrimaryColor = serializers.CharField(source="consultant.brand_primary_color", read_only=True)
    brandNeonColor = serializers.CharField(source="consultant.brand_neon_color", read_only=True)
    clientPortalHeading = serializers.CharField(source="consultant.client_portal_heading", read_only=True)
    brandDNA = ClientBrandDNASerializer(source="brand_dna", read_only=True)
    moodboards = MoodboardSerializer(many=True, read_only=True)
    concepts = ConceptSerializer(many=True, read_only=True)
    deliverables = DeliverableSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = (
            "id", "name", "sector", "status", "completionPct", "clientEmail",
            "meetingSummary", "consultantName", "consultantCompany",
            "brandPrimaryColor", "brandNeonColor", "clientPortalHeading",
            "brandDNA", "moodboards", "concepts", "deliverables",
        )


class DiscoveryDraftSerializer(serializers.ModelSerializer):
    currentStep = serializers.IntegerField(source="current_step", required=False)
    startedAt = serializers.DateTimeField(source="started_at", read_only=True)
    savedAt = serializers.DateTimeField(source="saved_at", read_only=True)

    class Meta:
        model = DiscoveryDraft
        fields = ("data", "currentStep", "startedAt", "savedAt")


class SmartBriefSerializer(serializers.ModelSerializer):
    projectId = serializers.UUIDField(source="project_id", read_only=True)
    positioningStatement = serializers.CharField(source="positioning_statement", allow_blank=True, required=False)
    audienceProfile = serializers.CharField(source="audience_profile", allow_blank=True, required=False)
    positioningGap = serializers.CharField(source="positioning_gap", allow_blank=True, required=False)
    toneArchetype = serializers.CharField(source="tone_archetype", allow_blank=True, required=False)
    brandArchetype = serializers.CharField(source="brand_archetype", allow_blank=True, required=False)
    brandPromise = serializers.CharField(source="brand_promise", allow_blank=True, required=False)
    visualBrief = serializers.CharField(source="visual_brief", allow_blank=True, required=False)
    taglineOptions = serializers.JSONField(source="tagline_options", required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = SmartBrief
        fields = (
            "id", "projectId", "version", "positioningStatement", "audienceProfile",
            "positioningGap", "toneArchetype", "brandArchetype", "brandPromise",
            "visualBrief", "taglineOptions", "createdAt", "updatedAt",
        )
        read_only_fields = ("version",)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ("id", "type", "amount", "percentage", "status", "paid_at")


class UploadSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    publicId = serializers.CharField(source="id", read_only=True)
    fileName = serializers.SerializerMethodField()
    fileSize = serializers.SerializerMethodField()
    fileFormat = serializers.SerializerMethodField()

    ALLOWED_EXTENSIONS = {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg",
        ".pdf", ".zip", ".ai", ".eps", ".psd", ".doc", ".docx",
    }
    MAX_FILE_SIZE = 20 * 1024 * 1024

    class Meta:
        model = UploadedAsset
        fields = ("url", "publicId", "fileName", "fileSize", "fileFormat")

    @classmethod
    def validate_upload(cls, uploaded):
        if uploaded.size > cls.MAX_FILE_SIZE:
            raise serializers.ValidationError("File size must not exceed 20 MB.")
        if Path(uploaded.name).suffix.lower() not in cls.ALLOWED_EXTENSIONS:
            raise serializers.ValidationError("This file type is not supported.")

    def get_url(self, obj):
        return self.context["request"].build_absolute_uri(obj.file.url)

    def get_fileName(self, obj):
        return obj.file.name.rsplit("/", 1)[-1]

    def get_fileSize(self, obj):
        return obj.file.size

    def get_fileFormat(self, obj):
        return obj.file.name.rsplit(".", 1)[-1] if "." in obj.file.name else ""
