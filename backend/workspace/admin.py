from django.contrib import admin
from .models import (
    ActivityLog, BrandDNA, ClientPortalSession, Concept, Deliverable, DiscoveryDraft, Moodboard,
    Notification, Payment, Project, ProjectNote, SmartBrief, UploadedAsset,
)

for model in (
    Project, ClientPortalSession, DiscoveryDraft, BrandDNA, SmartBrief, Moodboard, Concept, Deliverable,
    Payment, ProjectNote, ActivityLog, Notification, UploadedAsset,
):
    admin.site.register(model)
