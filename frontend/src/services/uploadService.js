import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from './apiClient';
export const uploadService = {
    upload(file, folder = 'general', onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        // Fetch does not currently expose upload progress. Keep the callback in the
        // service contract so the Django implementation can later use XHR if needed.
        onProgress?.(0);
        return apiClient
            .post(API_ENDPOINTS.uploads, formData)
            .then((response) => {
            onProgress?.(100);
            return response;
        });
    },
};
