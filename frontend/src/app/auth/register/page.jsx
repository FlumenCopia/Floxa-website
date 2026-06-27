'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/useAuth';
export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', company_name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    async function submit(event) {
        event.preventDefault();
        if (form.password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }
        if (/^\d+$/.test(form.password)) {
            setError('Password cannot contain only numbers.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await register(form);
            router.replace('/auth/login');
        }
        catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Unable to create your account.');
        }
        finally {
            setLoading(false);
        }
    }
    return (<div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="floxa-rise" style={{ width: 'min(420px,92vw)', background: 'rgba(8,20,14,0.95)', border: '1px solid rgba(137,172,160,0.2)', borderRadius: '22px', padding: '40px 36px' }}>
        <div style={{ marginBottom: '8px' }}><img src="/assets/floxa-logo-white.svg" alt="FLOXA" style={{ width: '110px', height: 'auto' }}/></div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Create Consultant Account</div>
        <div style={{ fontSize: '13px', color: '#89ACA0', marginBottom: '28px' }}>Set up your FLOXA workspace</div>
        {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF8080', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        <form onSubmit={submit}>
          {[
            { key: 'name', placeholder: 'Full name', type: 'text' },
            { key: 'company_name', placeholder: 'Studio name', type: 'text' },
            { key: 'email', placeholder: 'Email address', type: 'email' },
            { key: 'password', placeholder: 'Password', type: 'password' },
        ].map(field => (<div key={field.key} style={{ background: 'rgba(10,25,18,0.5)', border: '1px solid rgba(137,172,160,0.15)', borderRadius: '8px', padding: '11px 14px', marginBottom: '12px' }}>
              <input type={field.type} placeholder={field.placeholder} value={form[field.key]} onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))} required minLength={field.key === 'password' ? 8 : undefined} autoComplete={field.key === 'password' ? 'new-password' : field.key === 'email' ? 'email' : undefined} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: "var(--font-jost,'Jost',sans-serif)", fontSize: '14px', color: '#F0F7F4' }}/>
            </div>))}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '8px', background: 'rgba(28,52,46,0.9)', border: '1px solid rgba(137,172,160,0.25)', color: '#F0F7F4', fontFamily: "var(--font-jost,'Jost',sans-serif)", fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#89ACA0', textAlign: 'center' }}>Already have an account? <Link href="/auth/login" style={{ color: '#4DFFA0', textDecoration: 'none' }}>Sign in</Link></div>
      </div>
    </div>);
}
