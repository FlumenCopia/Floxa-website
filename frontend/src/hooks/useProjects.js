// src/hooks/useProjects.ts
// SWR-like hook for fetching and refreshing projects
import { useState, useEffect, useCallback } from 'react';
import { projectService } from '@/services/projectService';
import { notificationService } from '@/services/notificationService';
export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await projectService.list();
            if (data.success && data.data)
                setProjects(data.data);
            else
                setError(data.error ?? 'Failed to load projects');
        }
        catch {
            setError('Network error');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { projects, loading, error, refresh: load };
}
export function useProject(id) {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const load = useCallback(async () => {
        if (!id)
            return;
        setLoading(true);
        try {
            const data = await projectService.get(id);
            if (data.success && data.data)
                setProject(data.data);
            else
                setError(data.error ?? 'Project not found');
        }
        catch {
            setError('Network error');
        }
        finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => { load(); }, [load]);
    return { project, loading, error, refresh: load };
}
export function useNotifications(pollInterval = 30000) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const load = async () => {
        try {
            const data = await notificationService.list();
            if (data.success && data.data) {
                setNotifications(data.data);
                setUnreadCount(data.data.filter((n) => !n.read).length);
            }
        }
        catch { /* silent */ }
    };
    useEffect(() => {
        load();
        const interval = setInterval(load, pollInterval);
        return () => clearInterval(interval);
    }, [pollInterval]);
    const markAllRead = async () => {
        await notificationService.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };
    return { notifications, unreadCount, markAllRead, refresh: load };
}
