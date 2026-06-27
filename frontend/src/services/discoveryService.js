import { apiClient } from './apiClient';
export const discoveryService = {
    get(projectId) {
        return apiClient.get(`/projects/${projectId}/brand-dna/`);
    },
    save(projectId, data) {
        return apiClient.put(`/projects/${projectId}/discovery/`, data);
    },
    generate(projectId) {
        return apiClient.post(`/projects/${projectId}/brand-dna/generate/`);
    },
};
