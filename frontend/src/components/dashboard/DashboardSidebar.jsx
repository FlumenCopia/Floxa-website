// src/components/dashboard/DashboardSidebar.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { href: '/dashboard/projects', label: 'Projects', icon: '◫', badge: '7' },
    { href: '/dashboard/portfolio', label: 'Portfolio', icon: '◪' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];
export function DashboardSidebar() {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [navigatingTo, setNavigatingTo] = useState('');
    useEffect(() => {
        setNavigatingTo('');
    }, [pathname]);
    useEffect(() => {
        const warmRoutes = () => {
            for (const item of NAV_ITEMS) {
                if (item.href === pathname)
                    continue;
                router.prefetch(item.href);
                // Next.js development mode compiles routes on first request and does
                // not provide the same automatic Link prefetching as production.
                // Warming the route in the background removes the multi-second delay
                // from the consultant's first sidebar click.
                if (process.env.NODE_ENV === 'development') {
                    fetch(item.href, { credentials: 'same-origin' }).catch(() => undefined);
                }
            }
        };
        const windowWithIdle = window;
        if (windowWithIdle.requestIdleCallback) {
            const idleId = windowWithIdle.requestIdleCallback(warmRoutes);
            return () => windowWithIdle.cancelIdleCallback?.(idleId);
        }
        const timeoutId = window.setTimeout(warmRoutes, 250);
        return () => window.clearTimeout(timeoutId);
    }, [pathname, router]);
    return (<aside style={{
            width: collapsed ? '56px' : '240px',
            position: 'fixed', top: 0, left: 0, height: '100vh',
            background: 'rgba(4,12,8,0.93)',
            borderRight: '1px solid rgba(137,172,160,0.13)',
            display: 'flex', flexDirection: 'column',
            transition: 'width .28s cubic-bezier(.4,0,.2,1)',
            overflow: 'hidden', zIndex: 100,
        }}>
      {/* Header */}
      <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(137,172,160,0.13)', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '64px' }}>
        {!collapsed && (<Image src="/assets/floxa-logo-white.svg" alt="FLOXA" width={80} height={22} style={{ objectFit: 'contain' }} priority/>)}
        <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: 'auto', width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(137,172,160,0.06)', border: '1px solid rgba(137,172,160,0.13)', cursor: 'pointer', color: '#89ACA0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: '10px 8px', flex: 1 }}>
        {!collapsed && <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.48)', letterSpacing: '.12em', textTransform: 'uppercase', padding: '0 6px', marginBottom: '6px' }}>Workspace</div>}
        {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (<Link key={item.href} href={item.href} prefetch onClick={() => {
                    if (!active)
                        setNavigatingTo(item.href);
                }} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '9px 10px', borderRadius: '8px',
                    color: active ? '#4DFFA0' : '#89ACA0',
                    background: active ? 'rgba(77,255,160,0.09)' : 'transparent',
                    border: active ? '1px solid rgba(77,255,160,0.15)' : '1px solid transparent',
                    fontSize: '13px', fontWeight: active ? 600 : 400,
                    marginBottom: '2px', textDecoration: 'none',
                    transition: 'all .25s',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (<>
                  <span style={{ flex: 1 }}>
                    {navigatingTo === item.href ? `${item.label}…` : item.label}
                  </span>
                  {item.badge && (<span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(77,255,160,0.15)', color: '#4DFFA0', padding: '1px 6px', borderRadius: '20px' }}>
                      {item.badge}
                    </span>)}
                </>)}
            </Link>);
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(137,172,160,0.13)' }}>
        <button onClick={async () => {
            await logout();
            router.replace('/auth/login');
        }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 10px', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#89ACA0', fontSize: '13px', borderRadius: '8px', transition: 'all .25s', whiteSpace: 'nowrap', overflow: 'hidden' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <span style={{ fontSize: '16px' }}>⏏</span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>);
}
