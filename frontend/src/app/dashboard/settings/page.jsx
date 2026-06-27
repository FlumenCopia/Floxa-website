// src/app/dashboard/settings/page.tsx
'use client';
import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { authService } from '@/services/authService';
const TABS = [
    { key: 'profile', label: 'Profile' },
    { key: 'branding', label: 'Branding & White-label' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'plan', label: 'Plan & Billing' },
    { key: 'account', label: 'Account' },
];
const PLANS = [
    { key: 'free', label: 'Starter', price: 'Free', sub: '1 project', color: '#89ACA0' },
    { key: 'pro', label: 'Pro', price: '₹699/mo', sub: '10 projects/month', color: '#4DFFA0' },
    { key: 'agency', label: 'Agency', price: '₹3,999/mo', sub: 'Unlimited', color: '#A8C5BB' },
    { key: 'enterprise', label: 'Enterprise', price: 'Custom', sub: 'White-label + API', color: '#F0B429' },
];
export default function SettingsPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState('profile');
    const [saved, setSaved] = useState('');
    const [colors, setColors] = useState({ primary: '#0A1912', secondary: '#1C342E', accent: '#89ACA0', neon: '#4DFFA0' });
    const [notifs, setNotifs] = useState({ email: true, whatsapp: false, autoNotify: true, paymentReminders: true });
    async function save(label) {
        if (label === 'Profile') {
            await authService.updateCurrentUser({
                name: document.getElementById('settings-name')?.value,
                companyName: document.getElementById('settings-company')?.value,
                email: document.getElementById('settings-email')?.value,
                phone: document.getElementById('settings-phone')?.value,
            });
        }
        if (label === 'Branding') {
            await authService.updateCurrentUser({
                portfolioSlug: document.getElementById('settings-slug')?.value,
                clientPortalHeading: document.getElementById('settings-heading')?.value,
                brandPrimaryColor: colors.primary, brandSecondaryColor: colors.secondary,
                brandAccentColor: colors.accent, brandNeonColor: colors.neon,
            });
        }
        if (label === 'Notification settings') {
            await authService.updateCurrentUser({
                emailNotifications: notifs.email,
                whatsappNotifications: notifs.whatsapp,
                autoNotifyOnAction: notifs.autoNotify,
            });
        }
        setSaved(label + ' saved ✓');
        setTimeout(() => setSaved(''), 2500);
    }
    return (<div className="floxa-fade-in">
      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Settings</div>

      {saved && (<div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(77,255,160,0.08)', border: '1px solid rgba(77,255,160,0.2)', color: '#4DFFA0', fontSize: '13px', marginBottom: '16px' }}>
          {saved}
        </div>)}

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
        {/* Sidebar nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {TABS.map(t => (<button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: tab === t.key ? '#4DFFA0' : '#89ACA0', background: tab === t.key ? 'rgba(77,255,160,0.08)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Jost',sans-serif", textAlign: 'left', transition: 'all .22s' }}>
              {t.label}
            </button>))}
        </div>

        {/* Panel */}
        <div style={{ padding: '26px 30px', borderRadius: '22px', background: 'rgba(10,25,18,0.5)', border: '1px solid rgba(137,172,160,0.13)' }}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (<>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(137,172,160,0.1)' }}>Profile</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                {[
                { label: 'Full name', key: 'name', type: 'text', defaultValue: user?.name ?? '' },
                { label: 'Studio name', key: 'company', type: 'text', defaultValue: 'FlumenX' },
                { label: 'Email', key: 'email', type: 'email', defaultValue: user?.email ?? '' },
                { label: 'Phone', key: 'phone', type: 'tel', defaultValue: '' },
            ].map(f => (<div key={f.key}>
                    <label className="floxa-label">{f.label}</label>
                    <input id={`settings-${f.key}`} type={f.type} defaultValue={f.defaultValue} className="floxa-input"/>
                  </div>))}
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="floxa-label">Bio</label>
                <textarea className="floxa-input" rows={3} defaultValue="Founder & Creative Business Systems Architect at FlumenX. 12+ years in branding, digital marketing, and AV production."/>
              </div>
              <button onClick={() => save('Profile')} className="btn-floxa btn-floxa-primary btn-floxa-sm">Save changes</button>
            </>)}

          {/* ── BRANDING ── */}
          {tab === 'branding' && (<>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', paddingBottom: 0 }}>Branding & White-label</div>
              <div style={{ fontSize: '12px', color: '#89ACA0', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid rgba(137,172,160,0.1)' }}>
                Customise how the client portal appears to your clients. FLOXA identity is preserved.
              </div>

              {/* Live preview */}
              <div style={{ padding: '18px', borderRadius: '12px', border: '1px solid rgba(137,172,160,0.13)', background: 'rgba(5,14,10,0.4)', marginBottom: '18px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(137,172,160,0.5)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600 }}>Client portal preview</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(5,14,10,0.5)', borderRadius: '8px', border: '1px solid rgba(137,172,160,0.1)' }}>
                  <img src="/assets/floxa-logo-white.svg" alt="FLOXA" style={{ width: '60px', height: 'auto' }}/>
                  <div style={{ fontSize: '11px', color: 'rgba(137,172,160,0.5)' }}>Powered by FLOXA · FlumenX</div>
                </div>

                {/* Color swatches */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {[
                { label: 'Primary', key: 'primary' },
                { label: 'Secondary', key: 'secondary' },
                { label: 'Accent', key: 'accent' },
                { label: 'Neon', key: 'neon' },
            ].map(c => (<div key={c.key} title={c.label}>
                      <div style={{ fontSize: '9px', color: 'rgba(137,172,160,0.4)', marginBottom: '4px', textAlign: 'center' }}>{c.label}</div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: colors[c.key], border: '1px solid rgba(137,172,160,0.15)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                        <input type="color" value={colors[c.key]} onChange={e => setColors(p => ({ ...p, [c.key]: e.target.value }))} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}/>
                      </div>
                    </div>))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="floxa-label">Portfolio URL slug</label>
                <input id="settings-slug" className="floxa-input" defaultValue={user?.portfolioSlug ?? ''}/>
                <div style={{ fontSize: '10px', color: 'rgba(137,172,160,0.4)', marginTop: '4px' }}>floxa.io/p/flumenx</div>
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label className="floxa-label">Client portal heading</label>
                <input id="settings-heading" className="floxa-input" defaultValue={user?.clientPortalHeading ?? 'Discover Your Brand Clarity.'}/>
              </div>
              <button onClick={() => save('Branding')} className="btn-floxa btn-floxa-primary btn-floxa-sm">Save branding</button>
            </>)}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (<>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(137,172,160,0.1)' }}>Notifications</div>
              {[
                { key: 'email', label: 'Email notifications', desc: 'Receive email for all project events' },
                { key: 'whatsapp', label: 'WhatsApp notifications', desc: 'Phase 2 — WATI integration required' },
                { key: 'autoNotify', label: 'Auto-notify on client actions', desc: 'Notify you when client completes a step' },
                { key: 'paymentReminders', label: 'Payment reminders to clients', desc: 'Automated reminders for pending payments' },
            ].map(n => (<div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(137,172,160,0.07)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{n.label}</div>
                    <div style={{ fontSize: '11px', color: '#89ACA0' }}>{n.desc}</div>
                  </div>
                  <label className="floxa-toggle">
                    <input type="checkbox" checked={notifs[n.key]} onChange={e => setNotifs(p => ({ ...p, [n.key]: e.target.checked }))}/>
                    <div className="floxa-toggle-track"/>
                    <div className="floxa-toggle-thumb"/>
                  </label>
                </div>))}
              <button onClick={() => save('Notification settings')} className="btn-floxa btn-floxa-primary btn-floxa-sm" style={{ marginTop: '16px' }}>Save preferences</button>
            </>)}

          {/* ── PLAN ── */}
          {tab === 'plan' && (<>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(137,172,160,0.1)' }}>Plan & Billing</div>
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(77,255,160,0.05)', border: '1px solid rgba(77,255,160,0.15)', marginBottom: '18px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#4DFFA0', marginBottom: '3px' }}>Pro Plan · Active</div>
                <div style={{ fontSize: '12px', color: '#89ACA0' }}>₹699/month · Up to 10 active projects · Renews April 23, 2026</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '18px' }}>
                {PLANS.map(plan => (<div key={plan.key} style={{ padding: '14px', borderRadius: '10px', border: plan.key === 'pro' ? '2px solid rgba(77,255,160,0.3)' : '1px solid rgba(137,172,160,0.13)', background: plan.key === 'pro' ? 'rgba(77,255,160,0.04)' : 'rgba(10,25,18,0.4)', textAlign: 'center', cursor: 'pointer', transition: 'all .22s' }}>
                    <div style={{ fontSize: '10px', color: plan.key === 'pro' ? '#4DFFA0' : 'rgba(137,172,160,0.5)', marginBottom: '4px', fontWeight: plan.key === 'pro' ? 600 : 400 }}>{plan.label}{plan.key === 'pro' && ' · Current'}</div>
                    <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '3px' }}>{plan.price}</div>
                    <div style={{ fontSize: '10px', color: '#89ACA0' }}>{plan.sub}</div>
                  </div>))}
              </div>

              <button disabled className="btn-floxa btn-floxa-secondary btn-floxa-sm">Billing is not part of this MVP</button>
            </>)}

          {/* ── ACCOUNT ── */}
          {tab === 'account' && (<>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(137,172,160,0.1)' }}>Account</div>
              <div style={{ fontSize: '13px', color: '#89ACA0', marginBottom: '20px' }}>
                Signed in as: <strong style={{ color: '#F0F7F4' }}>{user?.email}</strong>
              </div>
              <button disabled className="btn-floxa btn-floxa-danger btn-floxa-sm">
                Account deletion is not available in this MVP
              </button>
            </>)}
        </div>
      </div>
    </div>);
}
