import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
const ACCESS_TOKEN_KEY = 'floxa_access_token';
const REFRESH_TOKEN_KEY = 'floxa_refresh_token';
export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}
let refreshPromise = null;
const isBrowser = () => typeof window !== 'undefined';
export const tokenStorage = {
    getAccessToken() {
        return isBrowser() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    },
    getRefreshToken() {
        return isBrowser() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    },
    setTokens(tokens) {
        if (!isBrowser())
            return;
        window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
        if (tokens.refresh) {
            window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
        }
    },
    clear() {
        if (!isBrowser())
            return;
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};
function resolveUrl(path) {
    if (/^https?:\/\//.test(path))
        return path;
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
async function parseResponse(response) {
    if (response.status === 204)
        return undefined;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json'))
        return response.json();
    return response.text();
}
function getErrorMessage(data, fallback) {
    if (data && typeof data === 'object') {
        const record = data;
        const message = record.detail ?? record.error ?? record.message;
        if (typeof message === 'string')
            return message;
        for (const [field, value] of Object.entries(record)) {
            const fieldMessage = typeof value === 'string'
                ? value
                : Array.isArray(value) && typeof value[0] === 'string'
                    ? value[0]
                    : null;
            if (fieldMessage) {
                const label = field.replace(/_/g, ' ');
                return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${fieldMessage}`;
            }
        }
    }
    return fallback;
}
async function refreshAccessToken() {
    if (refreshPromise)
        return refreshPromise;
    refreshPromise = (async () => {
        const refresh = tokenStorage.getRefreshToken();
        const response = await fetch(resolveUrl(API_ENDPOINTS.auth.refresh), {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(refresh ? { refresh } : {}),
        });
        if (!response.ok) {
            tokenStorage.clear();
            return null;
        }
        const data = (await parseResponse(response));
        const access = typeof data.access === 'string'
            ? data.access
            : typeof data.access_token === 'string'
                ? data.access_token
                : null;
        if (!access) {
            tokenStorage.clear();
            return null;
        }
        const nextRefresh = typeof data.refresh === 'string'
            ? data.refresh
            : typeof data.refresh_token === 'string'
                ? data.refresh_token
                : undefined;
        tokenStorage.setTokens({ access, refresh: nextRefresh });
        return access;
    })().finally(() => {
        refreshPromise = null;
    });
    return refreshPromise;
}
export async function apiRequest(path, options = {}) {
    const { auth = true, retryOnUnauthorized = true, headers, body, ...requestInit } = options;
    const requestHeaders = new Headers(headers);
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body && !isFormData && !requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
    }
    const accessToken = auth ? tokenStorage.getAccessToken() : null;
    if (accessToken)
        requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    const response = await fetch(resolveUrl(path), {
        ...requestInit,
        body,
        headers: requestHeaders,
        credentials: 'include',
    });
    if (response.status === 401 && auth && retryOnUnauthorized) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
            return apiRequest(path, {
                ...options,
                retryOnUnauthorized: false,
            });
        }
    }
    const data = await parseResponse(response);
    if (!response.ok) {
        throw new ApiError(getErrorMessage(data, `Request failed with status ${response.status}`), response.status, data);
    }
    return data;
}
export const apiClient = {
    get(path, options) {
        return apiRequest(path, { ...options, method: 'GET' });
    },
    post(path, data, options) {
        return apiRequest(path, {
            ...options,
            method: 'POST',
            body: data instanceof FormData ? data : data === undefined ? undefined : JSON.stringify(data),
        });
    },
    put(path, data, options) {
        return apiRequest(path, {
            ...options,
            method: 'PUT',
            body: data instanceof FormData ? data : data === undefined ? undefined : JSON.stringify(data),
        });
    },
    patch(path, data, options) {
        return apiRequest(path, {
            ...options,
            method: 'PATCH',
            body: data instanceof FormData ? data : data === undefined ? undefined : JSON.stringify(data),
        });
    },
    delete(path, options) {
        return apiRequest(path, { ...options, method: 'DELETE' });
    },
};
