export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
    'http://localhost:8000/api/v1';
export const API_ENDPOINTS = {
    auth: {
        login: '/auth/login/',
        register: '/auth/register/',
        refresh: '/auth/token/refresh/',
        logout: '/auth/logout/',
        me: '/auth/me/',
    },
    dashboard: {
        summary: '/dashboard/summary/',
    },
    projects: '/projects/',

    notifications: '/notifications/',
    uploads: '/uploads/',
    clientPortal: {
        session: '/client-portal/session/',
        project: '/client-portal/project/',
        profile: '/client-portal/profile/',
        discovery: '/client-portal/discovery/',
        discoveryDraft: '/client-portal/discovery/draft/',
        logout: '/client-portal/logout/',
    },
};
