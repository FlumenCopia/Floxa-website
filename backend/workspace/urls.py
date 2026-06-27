from django.urls import path
from .views import (
    BrandDNAGenerateView, BrandDNAView, ClientPortalDiscoveryDraftView, ClientPortalDiscoveryView,
    ClientPortalConceptDecisionView, ClientPortalDeliverableDownloadView,
    ClientPortalLogoutView, ClientPortalProfileView, ClientPortalProjectView,
    ClientPortalMoodboardSelectView,
    ClientPortalSessionView, DashboardSummaryView,
    DiscoveryView, MarkNotificationsReadView, NotificationsView,
    ProjectActivityView, ProjectArchiveView, ProjectConceptDetailView,
    ProjectConceptsView, ProjectDeliverableDetailView, ProjectDeliverablesView,
    ProjectDetailView, ProjectListCreateView, ProjectMoodboardDetailView,
    ProjectMoodboardsView, ProjectStatusView, PublicPortfolioProjectsView, SmartBriefView,
    ProjectNotesView, ProjectNotifyView, ProjectPublishView,
    ProjectResendLinkView, UploadView,
)
 
urlpatterns = [
    
    path("dashboard/summary/", DashboardSummaryView.as_view()),
    path("projects/", ProjectListCreateView.as_view()),
    path("projects/<uuid:project_id>/", ProjectDetailView.as_view()),
    path("projects/<uuid:project_id>/archive/", ProjectArchiveView.as_view()),
    path("projects/<uuid:project_id>/status/", ProjectStatusView.as_view()),
    path("projects/<uuid:project_id>/resend-client-link/", ProjectResendLinkView.as_view()),
    path("projects/<uuid:project_id>/notifications/", ProjectNotifyView.as_view()),
    path("projects/<uuid:project_id>/publish/", ProjectPublishView.as_view()),
    path("projects/<uuid:project_id>/activity/", ProjectActivityView.as_view()),
    path("projects/<uuid:project_id>/notes/", ProjectNotesView.as_view()),
    path("projects/<uuid:project_id>/brand-dna/", BrandDNAView.as_view()),
    path("projects/<uuid:project_id>/brand-dna/generate/", BrandDNAGenerateView.as_view()),
    path("projects/<uuid:project_id>/smart-brief/", SmartBriefView.as_view()),
    path("projects/<uuid:project_id>/discovery/", DiscoveryView.as_view()),
    path("projects/<uuid:project_id>/moodboards/", ProjectMoodboardsView.as_view()),
    path("projects/<uuid:project_id>/moodboards/<int:item_id>/", ProjectMoodboardDetailView.as_view()),
    path("projects/<uuid:project_id>/concepts/", ProjectConceptsView.as_view()),
    path("projects/<uuid:project_id>/concepts/<int:item_id>/", ProjectConceptDetailView.as_view()),
    path("projects/<uuid:project_id>/deliverables/", ProjectDeliverablesView.as_view()),
    path("projects/<uuid:project_id>/deliverables/<int:item_id>/", ProjectDeliverableDetailView.as_view()),
    path("client-portal/session/", ClientPortalSessionView.as_view()),
    path("client-portal/project/", ClientPortalProjectView.as_view()),
    path("client-portal/profile/", ClientPortalProfileView.as_view()),
    path("client-portal/discovery/", ClientPortalDiscoveryView.as_view()),
    path("client-portal/discovery/draft/", ClientPortalDiscoveryDraftView.as_view()),
    path("client-portal/logout/", ClientPortalLogoutView.as_view()),
    path("client-portal/moodboards/<int:moodboard_id>/select/", ClientPortalMoodboardSelectView.as_view()),
    path("client-portal/concepts/<int:concept_id>/decision/", ClientPortalConceptDecisionView.as_view()),
    path("client-portal/deliverables/<int:deliverable_id>/download/", ClientPortalDeliverableDownloadView.as_view()),
    path("uploads/", UploadView.as_view()),
    path("notifications/", NotificationsView.as_view()),
    path("notifications/mark-all-read/", MarkNotificationsReadView.as_view()),




    # path(
    #     "public/projects/",
    #     PublicPortfolioProjectsView.as_view(),
    #     name="public-projects",
    # ),
]
 