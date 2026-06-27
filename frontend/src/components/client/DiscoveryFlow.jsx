// src/components/client/DiscoveryFlow.tsx
'use client';
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PERSONALITY_CLUSTERS } from '@/types';
import { clientPortalService } from '@/services/clientPortalService';
const SLIDERS_1 = [
    { key: 'playfulSerious', left: 'Playful', right: 'Serious' },
    { key: 'unconventionalMainstream', left: 'Unconventional', right: 'Mainstream' },
    { key: 'industrialNatural', left: 'Industrial', right: 'Natural' },
    { key: 'approachableElite', left: 'Approachable', right: 'Elite' },
    { key: 'casualElegant', left: 'Casual', right: 'Elegant' },
    { key: 'refinedStrong', left: 'Refined', right: 'Strong' },
];
const SLIDERS_2 = [
    { key: 'feminineMasculine', left: 'Feminine', right: 'Masculine' },
    { key: 'simpleComplex', left: 'Simple', right: 'Complex' },
    { key: 'youthfulEstablished', left: 'Youthful', right: 'Established' },
    { key: 'subtleBright', left: 'Subtle', right: 'Bright' },
    { key: 'classicContemporary', left: 'Classic', right: 'Contemporary' },
    { key: 'friendlyAuthoritative', left: 'Friendly', right: 'Authoritative' },
    { key: 'economicalExpensive', left: 'Economical', right: 'Expensive' },
];
const EMOTIONS = ['Trust', 'Bold', 'Warm', 'Calm', 'Raw', 'Sharp', 'Fresh', 'Playful', 'Refined', 'Strong', 'Soft', 'Vibrant', 'Heritage', 'Modern', 'Honest', 'Edgy', 'Friendly', 'Prestige', 'Pure', 'Fun', 'Confident', 'Subtle', 'Dynamic', 'Quiet', 'Elegant', 'Earthy', 'Electric', 'Classic'];
const PERSONAS = [
    { name: 'Budget Conscious', desc: 'Price-sensitive, value-focused buyers' },
    { name: 'Quality Seeker', desc: 'Research-driven, pay premium for quality' },
    { name: 'Trend Follower', desc: 'Culture-aware early adopters' },
    { name: 'Premium Loyalist', desc: 'Exclusive tastes, brand-loyal, high LTV' },
];
const STYLES = ['Minimal Clean', 'Bold Geometric', 'Organic Warm', 'Luxury Editorial', 'Retro Craft', 'Tech Forward', 'Playful Illustrative', 'Classic Heritage', 'Street Urban'];
export function DiscoveryFlow({ project, clientData, setClientData, onNext, onProjectRefresh }) {
    const [step, setStep] = useState(1);
    const [sliders, setSliders] = useState({});
    const [emotions, setEmotions] = useState([]);
    const [persona, setPersona] = useState('');
    const [styles, setStyles] = useState([]);
    const [comps, setComps] = useState([
        { name: 'Competitor 1', rating: '', reason: '' },
        { name: 'Competitor 2', rating: '', reason: '' },
        { name: 'Competitor 3', rating: '', reason: '' },
    ]);
    const [basics, setBasics] = useState({ whatDo: '', targetCustomer: '', whyChooseUs: '', brandFeeling: '' });
    const [saving, setSaving] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const pcts = [28, 36, 44, 54, 64, 75];
    const pct = pcts[step - 1];
    const draftKey = `floxa-discovery-${project.id}`;
    useEffect(() => {
        clientPortalService.getDiscoveryDraft()
            .then(response => {
            const serverDraft = response.data;
            const localValue = window.localStorage.getItem(draftKey);
            const localDraft = localValue ? JSON.parse(localValue) : {};
            const draft = serverDraft?.data && Object.keys(serverDraft.data).length
                ? serverDraft.data
                : localDraft;
            setBasics(current => ({ ...current, ...(draft.basics ?? {}) }));
            setSliders(draft.sliders ?? {});
            setEmotions(draft.emotions ?? []);
            setPersona(draft.persona ?? '');
            setStyles(draft.styles ?? []);
            setComps(draft.comps ?? comps);
            setStep(Math.min(6, Math.max(1, serverDraft?.currentStep ?? 1)));
        })
            .catch(() => undefined)
            .finally(() => setHydrated(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftKey]);
    useEffect(() => {
        if (!hydrated)
            return;
        const draft = { basics, sliders, emotions, persona, styles, comps };
        window.localStorage.setItem(draftKey, JSON.stringify(draft));
        const timeout = window.setTimeout(() => {
            clientPortalService.saveDiscoveryDraft(draft, step).catch(() => undefined);
        }, 800);
        return () => window.clearTimeout(timeout);
    }, [draftKey, hydrated, step, basics, sliders, emotions, persona, styles, comps]);
    const updateSlider = useCallback((key, val) => {
        setSliders(prev => ({ ...prev, [key]: val }));
    }, []);
    const getCluster = () => {
        const vals = Object.values(sliders).filter(v => v !== undefined);
        if (!vals.length)
            return 'Calculating...';
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return PERSONALITY_CLUSTERS.find(c => avg >= c.min && avg < c.max)?.name ?? 'Bold Challenger';
    };
    const handleFinish = async () => {
        if (!styles.length) {
            toast.error('Choose at least one visual style.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...clientData,
                ...basics,
                brandFeeling: basics.brandFeeling,
                clientSliders: sliders,
                emotions,
                audienceArchetype: persona,
                competitors: comps,
                visualStyles: styles,
            };
            const data = await clientPortalService.submitDiscovery(payload);
            if (data.success) {
                if (data.data)
                    setClientData(data.data);
                await onProjectRefresh();
                window.localStorage.removeItem(draftKey);
                toast.success('Discovery submitted and brand summary created.');
                onNext('dashboard');
            }
            else {
                toast.error(data.error ?? 'Something went wrong');
            }
        }
        catch (error) {
            toast.error(error instanceof Error
                ? error.message
                : 'Unable to submit discovery. Please try again.');
        }
        finally {
            setSaving(false);
        }
    };
    function nextStep() {
        const valid = (step !== 1 || Boolean(basics.whatDo && basics.targetCustomer && basics.whyChooseUs && basics.brandFeeling)) &&
            (step !== 4 || emotions.length > 0) &&
            (step !== 5 || Boolean(persona && comps.some(item => item.name && item.rating && item.reason)));
        if (!valid) {
            toast.error('Please complete the required fields before continuing.');
            return;
        }
        setStep(current => current + 1);
    }
    return (<div className="client-discovery-screen" style={{ width: '100vw', height: '100vh', display: 'grid', gridTemplateColumns: '1fr 320px', position: 'relative', zIndex: 1 }}>

      {/* LEFT — Step content */}
      <div className="client-discovery-content" style={{ padding: 'clamp(20px,4vw,48px)', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(137,172,160,0.08)', overflowY: 'auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <img src="/assets/floxa-logo-white.svg" alt="FLOXA" style={{ width: '72px' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(10,25,18,0.5)', border: '1px solid rgba(137,172,160,0.15)', fontSize: '12px', color: '#89ACA0' }}>
            Phase 2 of 9 · <span style={{ color: '#4DFFA0', fontWeight: 700 }}>{pct}%</span>
          </div>
        </div>

        {/* Step indicator dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#4DFFA0', letterSpacing: '.12em', textTransform: 'uppercase', marginRight: '8px' }}>Step {step} of 6</span>
          {[1, 2, 3, 4, 5, 6].map(s => (<div key={s} style={{ borderRadius: s === step ? '3px' : '50%', width: s === step ? '18px' : '6px', height: '6px', background: s < step ? '#4DFFA0' : s === step ? '#F0F7F4' : 'rgba(137,172,160,0.15)', transition: 'all .3s' }}/>))}
        </div>

        {/* ── STEP 1: Business Basics ── */}
        {step === 1 && (<>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>Business Essentials</h2>
            <p style={{ fontSize: '14px', color: 'rgba(137,172,160,0.5)', marginBottom: '24px' }}>Tell us the core of what you do — in your own words.</p>
            {[
                { key: 'whatDo', label: "What does your business do?", placeholder: 'We help...' },
                { key: 'targetCustomer', label: 'Who is your target customer?', placeholder: 'Our customer is...' },
                { key: 'whyChooseUs', label: 'Why should they choose you?', placeholder: 'Unlike others, we...' },
                { key: 'brandFeeling', label: 'How should your brand make people feel?', placeholder: 'People should feel...' },
            ].map(f => (<div key={f.key} style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#89ACA0', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{f.label}</div>
                <textarea value={basics[f.key]} onChange={e => setBasics(prev => ({ ...prev, [f.key]: e.target.value }))} className="floxa-input" placeholder={f.placeholder} rows={3}/>
              </div>))}
          </>)}

        {/* ── STEP 2: Sliders Screen 1 ── */}
        {step === 2 && (<>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>How do you want<br />to be perceived?</h2>
            <p style={{ fontSize: '14px', color: 'rgba(137,172,160,0.5)', marginBottom: '24px' }}>Move each slider to describe your brand&apos;s character.</p>
            {SLIDERS_1.map(({ key, ...slider }) => (<SliderRow key={key} {...slider} value={sliders[key] ?? 0} onChange={v => updateSlider(key, v)}/>))}
          </>)}

        {/* ── STEP 3: Sliders Screen 2 ── */}
        {step === 3 && (<>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>What does your brand<br />look and feel like?</h2>
            <p style={{ fontSize: '14px', color: 'rgba(137,172,160,0.5)', marginBottom: '24px' }}>Define the visual and structural identity.</p>
            {SLIDERS_2.map(({ key, ...slider }) => (<SliderRow key={key} {...slider} value={sliders[key] ?? 0} onChange={v => updateSlider(key, v)}/>))}
          </>)}

        {/* ── STEP 4: Emotions ── */}
        {step === 4 && (<>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>Pick up to 8 words your<br />brand should feel like</h2>
            <p style={{ fontSize: '14px', color: 'rgba(137,172,160,0.5)', marginBottom: '24px' }}>These guide your visual direction and tone of voice.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px', marginBottom: '12px' }}>
              {EMOTIONS.map(w => (<button key={w} onClick={() => {
                    if (emotions.includes(w))
                        setEmotions(prev => prev.filter(e => e !== w));
                    else if (emotions.length < 8)
                        setEmotions(prev => [...prev, w]);
                }} className={`floxa-chip ${emotions.includes(w) ? 'active' : ''}`}>{w}</button>))}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(137,172,160,0.5)' }}>{emotions.length} / 8 selected</div>
          </>)}

        {/* ── STEP 5: Audience & Competitors ── */}
        {step === 5 && (<>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>Who is your<br />primary customer?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '22px' }}>
              {PERSONAS.map(p => (<button key={p.name} onClick={() => setPersona(p.name)} style={{ padding: '14px 16px', borderRadius: '14px', border: persona === p.name ? '1.5px solid rgba(77,255,160,0.38)' : '1.5px solid rgba(137,172,160,0.15)', background: persona === p.name ? 'rgba(77,255,160,0.05)' : 'rgba(10,25,18,0.4)', cursor: 'pointer', textAlign: 'left', transition: 'all .25s' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: persona === p.name ? '#4DFFA0' : '#F0F7F4', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(137,172,160,0.6)' }}>{p.desc}</div>
                </button>))}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#89ACA0', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Rate competitor brands</div>
            {comps.map((c, i) => (<div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(137,172,160,0.12)', background: 'rgba(10,25,18,0.35)', marginBottom: '8px' }}>
                <input value={c.name} onChange={e => setComps(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#F0F7F4', fontFamily: "'Jost',sans-serif" }}/>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['like', 'dislike'].map(r => (<button key={r} onClick={() => setComps(prev => prev.map((x, j) => j === i ? { ...x, rating: x.rating === r ? '' : r } : x))} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, border: c.rating === r ? (r === 'like' ? '1px solid rgba(77,255,160,0.3)' : '1px solid rgba(255,107,107,0.3)') : '1px solid rgba(137,172,160,0.15)', background: c.rating === r ? (r === 'like' ? 'rgba(77,255,160,0.1)' : 'rgba(255,107,107,0.1)') : 'transparent', color: c.rating === r ? (r === 'like' ? '#4DFFA0' : '#FF8080') : '#89ACA0', cursor: 'pointer' }}>
                      {r === 'like' ? 'Like' : 'Dislike'}
                    </button>))}
                </div>
                <input value={c.reason} onChange={e => setComps(prev => prev.map((x, j) => j === i ? { ...x, reason: e.target.value } : x))} placeholder="Why do you like or dislike this brand?" style={{ gridColumn: '1 / -1', background: 'transparent', border: 'none', borderTop: '1px solid rgba(137,172,160,0.08)', paddingTop: '8px', outline: 'none', fontSize: '12px', color: '#89ACA0', fontFamily: "'Jost',sans-serif" }}/>
              </div>))}
          </>)}

        {/* ── STEP 6: Visual Direction ── */}
        {step === 6 && (<>
            <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>Choose up to 3<br />visual styles</h2>
            <p style={{ fontSize: '14px', color: 'rgba(137,172,160,0.5)', marginBottom: '22px' }}>Select the aesthetic directions that resonate most.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px', marginBottom: '20px' }}>
              {STYLES.map(s => (<button key={s} onClick={() => {
                    if (styles.includes(s))
                        setStyles(prev => prev.filter(x => x !== s));
                    else if (styles.length < 3)
                        setStyles(prev => [...prev, s]);
                }} className={`floxa-chip ${styles.includes(s) ? 'active' : ''}`}>{s}</button>))}
            </div>
          </>)}

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '20px' }}>
          {step > 1 ? (<button onClick={() => setStep(s => s - 1)} style={{ padding: '10px 22px', borderRadius: '32px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontFamily: "'Jost',sans-serif", fontSize: '13px', cursor: 'pointer' }}>← Back</button>) : (<button onClick={() => onNext('profile')} style={{ padding: '10px 22px', borderRadius: '32px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontFamily: "'Jost',sans-serif", fontSize: '13px', cursor: 'pointer' }}>← Back</button>)}

          {step < 6 ? (<button onClick={nextStep} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '32px', background: 'rgba(28,52,46,0.9)', border: '1px solid rgba(137,172,160,0.3)', color: '#F0F7F4', fontFamily: "'Jost',sans-serif", fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
              Next →
            </button>) : (<button onClick={handleFinish} disabled={saving} style={{ padding: '14px 36px', borderRadius: '32px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.35)', color: '#4DFFA0', fontFamily: "'Jost',sans-serif", fontSize: '14px', fontWeight: 600, cursor: 'pointer', letterSpacing: '.04em', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Submitting Discovery...' : 'Submit Discovery — Create Brand Summary'}
            </button>)}
        </div>
      </div>

      {/* RIGHT — Live DNA preview */}
      <div className="client-discovery-preview" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', background: 'rgba(5,14,10,0.2)', gap: '24px' }}>
        {/* Mini orb */}
        <div style={{ position: 'relative' }}>
          <svg width="160" height="160" viewBox="0 0 200 200" style={{ animation: 'floxa-breathe 3.5s ease-in-out infinite' }}>
            <defs><clipPath id="dOrbClip"><circle cx="100" cy="100" r="88"/></clipPath></defs>
            <circle cx="100" cy="100" r="88" fill="rgba(10,25,18,0.6)" stroke="rgba(137,172,160,0.18)" strokeWidth="1.5"/>
            <rect x="12" y={200 - 176 * (pct / 100)} width="176" height={176 * (pct / 100)} fill="rgba(28,52,46,0.55)" clipPath="url(#dOrbClip)"/>
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(77,255,160,0.28)" strokeWidth="2" strokeDasharray={553} strokeDashoffset={553 - 553 * (pct / 100)} strokeLinecap="round" transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset .6s ease' }}/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#4DFFA0' }}>{pct}%</div>
        </div>

        {/* Live DNA items */}
        {[
            { label: 'Personality cluster', value: getCluster() },
            { label: 'Emotions selected', value: emotions.length ? emotions.slice(0, 3).join(', ') + (emotions.length > 3 ? '...' : '') : 'None yet' },
            { label: 'Audience archetype', value: persona || 'Not selected' },
            { label: 'Visual direction', value: styles.length ? styles.slice(0, 2).join(', ') : 'Not selected' },
        ].map(item => (<div key={item.label} style={{ width: '100%', maxWidth: '240px', paddingBottom: '12px', borderBottom: '1px solid rgba(137,172,160,0.08)' }}>
            <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontSize: '12px', color: '#89ACA0' }}>{item.value}</div>
          </div>))}
      </div>
    </div>);
}
// ── Slider Row sub-component ──────────────────
function SliderRow({ left, right, value, onChange }) {
    const pct = ((value + 3) / 6) * 100;
    const fillStyle = `linear-gradient(to right, rgba(77,255,160,0.45) 0%, rgba(77,255,160,0.6) ${pct}%, rgba(137,172,160,0.12) ${pct}%, rgba(137,172,160,0.12) 100%)`;
    return (<div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#F0F7F4' }}>{left}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#4DFFA0', background: 'rgba(77,255,160,0.1)', padding: '2px 8px', borderRadius: '20px', minWidth: '26px', textAlign: 'center' }}>{value > 0 ? `+${value}` : value}</span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#F0F7F4' }}>{right}</span>
      </div>
      <input type="range" min="-3" max="3" step="1" value={value} onChange={e => onChange(parseInt(e.target.value))} className="floxa-slider" style={{ background: fillStyle }}/>
    </div>);
}
