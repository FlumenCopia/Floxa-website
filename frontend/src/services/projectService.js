import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from './apiClient';
const projectPath = (id) => `${API_ENDPOINTS.projects}${id}/`;
export const projectService = {
    list() {
        return apiClient.get(API_ENDPOINTS.projects);
    },
    get(id) {
        return apiClient.get(projectPath(id));
    },
    create(data) {
        return apiClient.post(API_ENDPOINTS.projects, data);
    },
    update(id, data) {
        return apiClient.patch(projectPath(id), data);
    },
    remove(id) {
        return apiClient.delete(projectPath(id));
    },
    archive(id) {
        return apiClient.post(`${projectPath(id)}archive/`);
    },
    updateStatus(id, status) {
        return apiClient.post(`${projectPath(id)}status/`, { status });
    },
    summary() {
        return apiClient.get(API_ENDPOINTS.dashboard.summary);
    },
    resendClientLink(id) {
        return apiClient.post(`${projectPath(id)}resend-client-link/`);
    },
    notify(id, data) {
        return apiClient.post(`${projectPath(id)}notifications/`, data);
    },
    getActivity(id) {
        return apiClient.get(`${projectPath(id)}activity/`);
    },
    addNote(id, data) {
        return apiClient.post(`${projectPath(id)}notes/`, data);
    },
    publish(id) {
        return apiClient.post(`${projectPath(id)}publish/`);
    },
    createMoodboard(id, data) {
        return apiClient.post(`${projectPath(id)}moodboards/`, data);
    },
    deleteMoodboard(id, itemId) {
        return apiClient.delete(`${projectPath(id)}moodboards/${itemId}/`);
    },
    createConcept(id, data) {
        return apiClient.post(`${projectPath(id)}concepts/`, data);
    },
    deleteConcept(id, itemId) {
        return apiClient.delete(`${projectPath(id)}concepts/${itemId}/`);
    },
    createDeliverable(id, data) {
        return apiClient.post(`${projectPath(id)}deliverables/`, data);
    },
    deleteDeliverable(id, itemId) {
        return apiClient.delete(`${projectPath(id)}deliverables/${itemId}/`);
    },
    getSmartBrief(id) {
        return apiClient.get(`${projectPath(id)}smart-brief/`);
    },
    saveSmartBrief(id, data) {
        return apiClient.post(`${projectPath(id)}smart-brief/`, data);
    },
};
