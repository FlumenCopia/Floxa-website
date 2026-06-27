import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from './apiClient';
export const notificationService = {
    list() {
        return apiClient.get(API_ENDPOINTS.notifications);
    },
    markAllRead() {
        return apiClient.post('/notifications/mark-all-read/');
    },
};
