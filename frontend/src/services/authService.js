import { API_ENDPOINTS } from '@/config/api';
import { apiClient, tokenStorage } from './apiClient';
export const authService = {
    async register(data) {
        return apiClient.post(API_ENDPOINTS.auth.register, data, { auth: false });
    },
    async login(credentials) {
        const response = await apiClient.post(API_ENDPOINTS.auth.login, credentials, { auth: false });
        const access = response.access ??
            response.access_token ??
            response.data?.access;
        const refresh = response.refresh ??
            response.refresh_token ??
            response.data?.refresh;
        if (!access)
            throw new Error('The login response did not include an access token.');
        tokenStorage.setTokens({ access, refresh });
        return response.user ?? response.data?.user ?? this.getCurrentUser();
    },
    getCurrentUser() {
        return apiClient.get(API_ENDPOINTS.auth.me);
    },
    updateCurrentUser(data) {
        return apiClient.patch(API_ENDPOINTS.auth.me, data);
    },
    async logout() {
        const refresh = tokenStorage.getRefreshToken();
        try {
            await apiClient.post(API_ENDPOINTS.auth.logout, refresh ? { refresh } : {}, { retryOnUnauthorized: false });
        }
        finally {
            tokenStorage.clear();
        }
    },
    hasSession() {
        return Boolean(tokenStorage.getAccessToken() || tokenStorage.getRefreshToken());
    },
};
