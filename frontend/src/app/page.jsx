// src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/useAuth';
export default function RootPage() {
    const { authenticated, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!loading) {
            router.replace(authenticated ? '/dashboard' : '/auth/login');
        }
    }, [authenticated, loading, router]);
    return (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020806' }}>
      <div style={{ color: '#4DFFA0', fontFamily: 'var(--font-jost)', letterSpacing: '.12em' }}>FLOXA</div>
    </div>);
}
