'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
export function ProtectedRoute({ children }) {
    const { authenticated, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    useEffect(() => {
        if (!loading && !authenticated) {
            const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
            router.replace(`/auth/login${next}`);
        }
    }, [authenticated, loading, pathname, router]);
    if (loading || !authenticated) {
        return (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020806' }}>
        <div style={{ color: '#4DFFA0', fontFamily: 'var(--font-jost)', letterSpacing: '.12em' }}>FLOXA</div>
      </div>);
    }
    return children;
}
