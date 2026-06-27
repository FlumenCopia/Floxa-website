'use client';
import { createContext, useCallback, useEffect, useMemo, useState, } from 'react';
import { authService, } from '@/services/authService';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshUser = useCallback(async () => {
        if (!authService.hasSession()) {
            setUser(null);
            return null;
        }
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            return currentUser;
        }
        catch {
            setUser(null);
            return null;
        }
    }, []);
    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);
    const login = useCallback(async (credentials) => {
        const currentUser = await authService.login(credentials);
        setUser(currentUser);
        return currentUser;
    }, []);
    const register = useCallback(async (data) => {
        const currentUser = await authService.register(data);
        setUser(currentUser);
        return currentUser;
    }, []);
    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
    }, []);
    const value = useMemo(() => ({
        user,
        loading,
        authenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
    }), [user, loading, login, register, logout, refreshUser]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
