import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from './apiClient';
const CLIENT_PORTAL_TOKEN_KEY = 'floxa_client_portal_token';
const portalTokenStorage = {
    get() {
        return typeof window === 'undefined'
            ? null
            : window.sessionStorage.getItem(CLIENT_PORTAL_TOKEN_KEY);
    },
    set(token) {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(CLIENT_PORTAL_TOKEN_KEY, token);
        }
    },
    clear() {
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(CLIENT_PORTAL_TOKEN_KEY);
        }
    },
};
function portalHeaders() {
    const token = portalTokenStorage.get();
    return token ? { 'X-Client-Portal-Token': token } : {};
}
export const clientPortalService = {
    async createSession(linkToken) {
        portalTokenStorage.clear();
        const response = await apiClient.post(API_ENDPOINTS.clientPortal.session, { token: linkToken }, { auth: false });
        const portalToken = response.portal_token ??
            response.token ??
            response.data?.portal_token;
        if (portalToken)
            portalTokenStorage.set(portalToken);
        return response.project ?? response.data?.project;
    },
    getProject(linkToken) {
        const suffix = linkToken ? `?token=${encodeURIComponent(linkToken)}` : '';
        return apiClient.get(`${API_ENDPOINTS.clientPortal.project}${suffix}`, { auth: false, headers: portalHeaders() });
    },
    async refreshProject() {
        const response = await this.getProject();
        return 'success' in response ? response.data : response;
    },
    updateProfile(data) {
        return apiClient.patch(API_ENDPOINTS.clientPortal.profile, data, { auth: false, headers: portalHeaders() });
    },
    submitDiscovery(data) {
        return apiClient.post(API_ENDPOINTS.clientPortal.discovery, data, { auth: false, headers: portalHeaders() });
    },
    getDiscoveryDraft() {
        return apiClient.get(API_ENDPOINTS.clientPortal.discoveryDraft, { auth: false, headers: portalHeaders() });
    },
    saveDiscoveryDraft(data, currentStep) {
        return apiClient.patch(API_ENDPOINTS.clientPortal.discoveryDraft, { data, currentStep }, { auth: false, headers: portalHeaders() });
    },
    selectMoodboard(moodboardId) {
        return apiClient.post(`/client-portal/moodboards/${moodboardId}/select/`, {}, { auth: false, headers: portalHeaders() });
    },
    decideConcept(conceptId, status, comment = '') {
        return apiClient.post(`/client-portal/concepts/${conceptId}/decision/`, { status, comment }, { auth: false, headers: portalHeaders() });
    },
    downloadDeliverable(deliverableId) {
        return apiClient.post(`/client-portal/deliverables/${deliverableId}/download/`, {}, { auth: false, headers: portalHeaders() });
    },
    async logout() {
        try {
            await apiClient.post(API_ENDPOINTS.clientPortal.logout, {}, { auth: false, headers: portalHeaders() });
        }
        finally {
            portalTokenStorage.clear();
        }
    },
};
