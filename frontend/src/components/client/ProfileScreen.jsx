// src/components/client/ProfileScreen.tsx
'use client';
import { useState, useCallback } from 'react';
import { clientPortalService } from '@/services/clientPortalService';
const INDUSTRIES = [
    'Branding & Design', 'Technology / SaaS', 'Food & Beverage',
    'Fashion & Apparel', 'Real Estate', 'Healthcare', 'Education',
    'Hospitality', 'Finance & Banking', 'Retail', 'Manufacturing',
    'Architecture & Interior', 'Events & Entertainment', 'Media & Publishing',
];
const STAGE_LABELS = ['Profile', 'Discovery', 'Visual', 'Agreement', 'Moodboard', 'Concepts', 'Delivery', 'Sign Off'];
export function ProfileScreen({ project, clientData, setClientData, onNext, onProjectRefresh }) {
    const [fields, setFields] = useState({
        name: clientData.clientName ?? '',
        company: clientData.clientCompany ?? '',
        industry: clientData.clientIndustry ?? '',
        yearStart: clientData.clientYearStart?.toString() ?? '',
        location: clientData.clientLocation ?? '',
        phone: clientData.clientPhone ?? '',
        email: clientData.clientEmail ?? project.clientEmail ?? '',
        website: clientData.clientWebsite ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const filledCount = Object.values(fields).filter(v => v.trim()).length;
    const pct = Math.round((filledCount / 8) * 100);
    const update = useCallback((key, val) => {
        setFields(prev => ({ ...prev, [key]: val }));
    }, []);
    const handleNext = async () => {
        if (!fields.name.trim() || !fields.company.trim() || !fields.email.trim()) {
            setError('Please enter your name, company, and email address.');
            return;
        }
        const profile = {
            ...clientData,
            clientName: fields.name,
            clientCompany: fields.company,
            clientIndustry: fields.industry,
            clientYearStart: fields.yearStart ? parseInt(fields.yearStart) : undefined,
            clientLocation: fields.location,
            clientPhone: fields.phone,
            clientEmail: fields.email,
            clientWebsite: fields.website,
        };
        setSaving(true);
        setError('');
        try {
            const response = await clientPortalService.updateProfile(profile);
            if (!response.success || !response.data) {
                throw new Error(response.error ?? 'Unable to save your profile.');
            }
            setClientData(response.data);
            await onProjectRefresh();
            onNext(
                ['CREATED', 'PROFILE_COMPLETE'].includes(project.status)
                    ? 'discovery'
                    : 'dashboard'
            );
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to save your profile.');
        }
        finally {
            setSaving(false);
        }
    };
    // SVG circle ring for orb
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (circumference * pct) / 100;
    return (<div className="client-profile-screen" style={{ width: '100vw', height: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', zIndex: 1 }}>

      {/* LEFT — Form */}
      <div className="client-profile-form-panel" style={{ padding: 'clamp(32px,5vw,64px) clamp(28px,5vw,68px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(137,172,160,0.08)', overflowY: 'auto' }}>
        <img src="/assets/floxa-logo-white.svg" alt="FLOXA" style={{ width: '90px', marginBottom: '28px', opacity: .9 }}/>

        <h1 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 700, lineHeight: 1.15, marginBottom: '6px' }}>
          Let&apos;s Know More<br />About You <span style={{ fontSize: '.5em', color: 'rgba(137,172,160,0.5)', verticalAlign: 'super' }}>®</span>
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(137,172,160,0.5)', marginBottom: '28px' }}>Your brand clarity journey starts with knowing who you are.</p>

        {/* Fields - Figma underline style */}
        {[
            { key: 'name', placeholder: 'Enter Your Name', type: 'text', icon: 'pencil' },
            { key: 'company', placeholder: 'Enter Your Company Name', type: 'text', icon: 'pencil' },
        ].map(f => (<div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(137,172,160,0.18)', padding: '14px 0', transition: 'border-color .25s' }}>
            <input type={f.type} placeholder={f.placeholder} value={fields[f.key]} onChange={e => update(f.key, e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Jost',sans-serif", fontSize: '15px', color: fields[f.key] ? '#F0F7F4' : 'rgba(137,172,160,0.4)', transition: 'color .25s' }}/>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(137,172,160,0.35)" strokeWidth="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>))}

        {/* Industry + Year inline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(137,172,160,0.18)', padding: '14px 0' }}>
            <select value={fields.industry} onChange={e => update('industry', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Jost',sans-serif", fontSize: '15px', color: fields.industry ? '#F0F7F4' : 'rgba(137,172,160,0.4)', cursor: 'pointer' }}>
              <option value="" disabled>Enter Your Industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i} style={{ background: '#0A1912' }}>{i}</option>)}
            </select>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(137,172,160,0.35)" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(137,172,160,0.18)', padding: '14px 0' }}>
            <input type="number" placeholder="Year Started" value={fields.yearStart} onChange={e => update('yearStart', e.target.value)} min="1950" max="2026" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Jost',sans-serif", fontSize: '15px', color: fields.yearStart ? '#F0F7F4' : 'rgba(137,172,160,0.4)' }}/>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(137,172,160,0.35)" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        {[
            { key: 'location', placeholder: 'Enter Your Location', type: 'text' },
            { key: 'phone', placeholder: 'Phone Number', type: 'tel' },
            { key: 'email', placeholder: 'Email ID', type: 'email' },
            { key: 'website', placeholder: 'Website', type: 'url' },
        ].map(f => (<div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(137,172,160,0.18)', padding: '14px 0' }}>
            <input type={f.type} placeholder={f.placeholder} value={fields[f.key]} onChange={e => update(f.key, e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Jost',sans-serif", fontSize: '15px', color: fields[f.key] ? '#F0F7F4' : 'rgba(137,172,160,0.4)', transition: 'color .25s' }}/>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(137,172,160,0.35)" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>))}

        {error && (<div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF8080', fontSize: '12px' }}>
            {error}
          </div>)}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
          <button onClick={() => onNext('login')} style={{ padding: '10px 22px', borderRadius: '32px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontFamily: "'Jost',sans-serif", fontSize: '13px', cursor: 'pointer' }}>← Back</button>
          <button onClick={handleNext} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '32px', background: 'rgba(28,52,46,0.9)', border: '1px solid rgba(137,172,160,0.3)', color: '#F0F7F4', fontFamily: "'Jost',sans-serif", fontSize: '14px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .65 : 1 }}>
            {saving ? 'Saving...' : 'Begin Discovery →'}
          </button>
        </div>
      </div>

      {/* RIGHT — Orb + Stage nav */}
      <div className="client-profile-visual-panel" style={{ display: 'grid', gridTemplateColumns: '1fr auto', background: 'rgba(5,14,10,0.2)' }}>
        {/* Orb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="client-profile-orb" style={{ position: 'relative', animation: 'floxa-breathe 3.5s ease-in-out infinite' }}>
            <svg width="min(340px, 40vw)" height="min(340px, 40vw)" viewBox="0 0 200 200">
              <defs>
                <clipPath id="orbClip"><circle cx="100" cy="100" r="88"/></clipPath>
              </defs>
              <circle cx="100" cy="100" r="88" fill="rgba(10,25,18,0.6)" stroke="rgba(137,172,160,0.2)" strokeWidth="1.5"/>
              {/* Fill segment rises with pct */}
              <rect x="12" y={200 - 176 * (pct / 100)} width="176" height={176 * (pct / 100)} fill="rgba(28,52,46,0.55)" clipPath="url(#orbClip)"/>
              {/* Progress ring */}
              <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(77,255,160,0.28)" strokeWidth="2" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset .6s ease' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: '#F0F7F4' }}>
              {pct}%
            </div>
          </div>
        </div>

        {/* Stage nav — right edge, matches Figma */}
        <div className="client-profile-stage-rail" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 28px 32px 0', gap: '10px', borderLeft: '1px solid rgba(137,172,160,0.08)', minWidth: '180px' }}>
          {STAGE_LABELS.map((stage, i) => (<div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', borderRight: i === 0 ? '2px solid #F0F7F4' : '2px solid transparent' }}>
              <div style={{ width: '2px', height: '28px', borderRadius: '1px', background: i === 0 ? '#F0F7F4' : 'rgba(137,172,160,0.12)', marginLeft: 'auto' }}/>
              <div style={{ fontSize: 'clamp(11px,1.1vw,14px)', color: i === 0 ? '#F0F7F4' : 'rgba(137,172,160,0.5)', fontWeight: i === 0 ? 700 : 400, textAlign: 'right', flex: 1 }}>{stage}</div>
              {i === 0 && <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid #F0F7F4', position: 'absolute', right: '-4px' }}/>}
            </div>))}
        </div>
      </div>
    </div>);
}
