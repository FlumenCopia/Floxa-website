// src/app/auth/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/auth/useAuth';
export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login({ email, password });
            const nextPath = new URLSearchParams(window.location.search).get('next');
            router.replace(nextPath || '/dashboard');
        }
        catch {
            setError('Something went wrong. Please try again.');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleGoogle() {
        setError('Google login will be enabled through the Django authentication API.');
    }
    // Demo login shortcut
    async function demoLogin() {
        setEmail('consultant@flumenx.com');
        setPassword('floxa2026');
        setLoading(true);
        try {
            await login({
                email: 'consultant@flumenx.com',
                password: 'floxa2026',
            });
            router.replace('/dashboard');
        }
        catch {
            setError('Demo login requires a matching user in the Django backend.');
        }
        finally {
            setLoading(false);
        }
    }
    return (<div style={{
            position: 'fixed', inset: 0, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
      <div className="floxa-rise" style={{
            width: 'min(420px, 92vw)',
            background: 'rgba(8,20,14,0.95)',
            border: '1px solid rgba(137,172,160,0.2)',
            borderRadius: '22px',
            padding: '40px 36px',
        }}>
        {/* Logo */}
        <div style={{ marginBottom: '8px' }}>
          <img src="/assets/floxa-logo-white.svg" alt="FLOXA" style={{ width: '110px', height: 'auto' }}/>
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
          Consultant Login
        </div>
        <div style={{ fontSize: '13px', color: '#89ACA0', marginBottom: '28px' }}>
          Access your FLOXA workspace
        </div>

        {error && (<div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF8080', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>)}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(10,25,18,0.5)', border: '1px solid rgba(137,172,160,0.15)', borderRadius: '8px', padding: '11px 14px', marginBottom: '12px', transition: 'border-color .25s' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#89ACA0" strokeWidth="1.6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "var(--font-jost,'Jost',sans-serif)", fontSize: '14px', color: '#F0F7F4' }}/>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(10,25,18,0.5)', border: '1px solid rgba(137,172,160,0.15)', borderRadius: '8px', padding: '11px 14px', marginBottom: '20px', transition: 'border-color .25s' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#89ACA0" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "var(--font-jost,'Jost',sans-serif)", fontSize: '14px', color: '#F0F7F4' }}/>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '8px', background: 'rgba(28,52,46,0.9)', border: '1px solid rgba(137,172,160,0.25)', color: '#F0F7F4', fontFamily: "var(--font-jost,'Jost',sans-serif)", fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: '14px', letterSpacing: '.04em' }}>
            {loading ? 'Signing in...' : 'Enter Dashboard'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(137,172,160,0.12)' }}/>
          <span style={{ fontSize: '11px', color: 'rgba(137,172,160,0.45)', letterSpacing: '.1em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(137,172,160,0.12)' }}/>
        </div>

        {/* Google SSO */}
        <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontFamily: "var(--font-jost,'Jost',sans-serif)", fontSize: '13px', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>G</span> Continue with Google
        </button>

        {/* Demo login */}
        <button onClick={demoLogin} disabled={loading} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(77,255,160,0.15)', color: '#4DFFA0', fontFamily: "var(--font-jost,'Jost',sans-serif)", fontSize: '12px', cursor: 'pointer', letterSpacing: '.04em' }}>
          ⚡ Demo mode — enter as FlumenX
        </button>

        <div style={{ marginTop: '14px', fontSize: '12px', color: '#89ACA0', textAlign: 'center' }}>
          New to FLOXA? <Link href="/auth/register" style={{ color: '#4DFFA0', textDecoration: 'none' }}>Create an account</Link>
        </div>

        <div style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(137,172,160,0.4)', textAlign: 'center' }}>
          FLOXA · Clarity Before Creation™ · floxa.io
        </div>
      </div>
    </div>);
}
