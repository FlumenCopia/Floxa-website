// src/components/dashboard/tabs/ProjectTabs.tsx
// All 7 project tabs: Discovery, Moodboards, Concepts, Delivery, Payment, Notes, Activity
'use client';
import { useState, useEffect } from 'react';
import { projectService } from '@/services/projectService';
import { FileUploader } from '@/components/dashboard/FileUploader';
// ══════════════════════════════════════════════════════
// TAB 1 — DISCOVERY REPORT
// ══════════════════════════════════════════════════════
export function DiscoveryTab({ project, onRefresh }) {
    const dna = project.brandDNA;
    const [editingBrief, setEditingBrief] = useState(false);
    const [brief, setBrief] = useState({
        positioningStatement: dna?.positioningStatement ?? '',
        audienceProfile: dna?.audienceProfile ?? '',
        positioningGap: dna?.positioningGap ?? '',
        toneArchetype: dna?.toneArchetype ?? '',
        brandArchetype: dna?.brandArchetype ?? '',
        brandPromise: dna?.brandPromise ?? '',
        visualBrief: dna?.visualBrief ?? '',
        taglineOptions: dna?.taglineOptions ?? [],
    });
    if (!dna)
        return <p style={{ color: '#89ACA0' }}>Discovery not yet completed by client.</p>;
    async function saveBrief() {
        await projectService.saveSmartBrief(project.id, brief);
        setEditingBrief(false);
        await onRefresh?.();
    }
    const sliders = [
        { label: 'Playful → Serious', c: dna.s_playfulSerious, cons: dna.c_playfulSerious },
        { label: 'Unconventional → Mainstream', c: dna.s_unconventionalMainstream, cons: dna.c_unconventionalMainstream },
        { label: 'Industrial → Natural', c: dna.s_industrialNatural, cons: dna.c_industrialNatural },
        { label: 'Approachable → Elite', c: dna.s_approachableElite, cons: dna.c_approachableElite },
        { label: 'Casual → Elegant', c: dna.s_casualElegant, cons: dna.c_casualElegant },
        { label: 'Feminine → Masculine', c: dna.s_feminineMasculine, cons: dna.c_feminineMasculine },
        { label: 'Simple → Complex', c: dna.s_simpleComplex, cons: dna.c_simpleComplex },
        { label: 'Economical → Expensive', c: dna.s_economicalExpensive, cons: dna.c_economicalExpensive },
    ];
    const emotions = Array.isArray(dna.emotions) ? dna.emotions : [];
    const taglines = Array.isArray(dna.taglineOptions) ? dna.taglineOptions : [];
    return (<div className="floxa-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', color: '#89ACA0' }}>
          Auto-generated · <span style={{ color: '#4DFFA0' }}>Complete</span>
          {dna.generatedAt && <span> · {new Date(dna.generatedAt).toLocaleDateString('en-IN')}</span>}
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <button className="btn-floxa btn-floxa-secondary btn-floxa-sm" onClick={() => window.print()}>Download PDF</button>
          <button className="btn-floxa btn-floxa-primary btn-floxa-sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(dna, null, 2)); alert('Brief copied!'); }}>Copy brief</button>
          <button className="btn-floxa btn-floxa-secondary btn-floxa-sm" onClick={() => setEditingBrief(value => !value)}>Edit brief</button>
        </div>
      </div>
      {editingBrief && (<UploadPanel>
          {[
                ['positioningStatement', 'Positioning statement'],
                ['audienceProfile', 'Audience profile'],
                ['positioningGap', 'Positioning gap'],
                ['toneArchetype', 'Tone archetype'],
                ['brandArchetype', 'Brand archetype'],
                ['brandPromise', 'Brand promise'],
                ['visualBrief', 'Visual brief'],
            ].map(([key, label]) => (<div key={key}><label className="floxa-label">{label}</label><textarea className="floxa-input" value={String(brief[key] ?? '')} onChange={event => setBrief(current => ({ ...current, [key]: event.target.value }))}/></div>))}
          <button className="btn-floxa btn-floxa-primary btn-floxa-sm" onClick={saveBrief}>Save Smart Brief</button>
        </UploadPanel>)}

      {/* Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {[
            { k: 'Company', v: dna.clientCompany },
            { k: 'Industry', v: dna.clientIndustry },
            { k: 'Location', v: dna.clientLocation },
            { k: 'Founded', v: dna.clientYearStart?.toString() },
            { k: 'Email', v: dna.clientEmail },
            { k: 'Website', v: dna.clientWebsite },
        ].map(item => item.v ? (<div key={item.k} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)' }}>
            <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '5px' }}>{item.k}</div>
            <div style={{ fontSize: '13px', color: '#F0F7F4' }}>{item.v}</div>
          </div>) : null)}
      </div>

      {/* Core DNA blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <Block label="Business" value={dna.whatDo}/>
        <Block label="Core emotion summary" value={dna.emotionSummary} generated/>
        <Block label="Personality cluster" value={dna.personalityCluster} generated/>
        <Block label="Brand archetype" value={dna.brandArchetype} generated/>
        <Block label="Tone archetype" value={dna.toneArchetype} generated/>
        <Block label="Audience profile" value={dna.audienceProfile} generated/>
        <Block label="Competitor gap" value={dna.positioningGap} generated/>
        <Block label="Target customer" value={dna.targetCustomer}/>
      </div>

      {/* Emotions */}
      {emotions.length > 0 && (<div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)', marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Emotion map</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {emotions.map((e) => <span key={e} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(77,255,160,0.07)', color: '#4DFFA0', border: '1px solid rgba(77,255,160,0.18)' }}>{e}</span>)}
          </div>
        </div>)}

      {/* Positioning */}
      <div style={{ padding: '16px 18px', borderRadius: '12px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)', marginBottom: '12px' }}>
        <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Positioning statement</div>
        <div style={{ fontSize: '14px', color: '#F0F7F4', lineHeight: 1.65, fontStyle: 'italic' }}>&ldquo;{dna.positioningStatement}&rdquo;</div>
      </div>

      {/* Taglines */}
      {taglines.length > 0 && (<div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)', marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Tagline directions</div>
          {taglines.map((t, i) => (<div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(137,172,160,0.1)', marginBottom: '6px', cursor: 'pointer' }}>
              <span style={{ fontSize: '12px', color: 'rgba(137,172,160,0.4)', minWidth: '20px' }}>0{i + 1}</span>
              <span style={{ fontSize: '14px', color: '#F0F7F4' }}>{t}</span>
            </div>))}
        </div>)}

      {/* Visual brief */}
      {dna.visualBrief && (<div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)', marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Visual brief (designer-ready)</div>
          <div style={{ fontSize: '13px', color: '#89ACA0', lineHeight: 1.65, fontStyle: 'italic' }}>&ldquo;{dna.visualBrief}&rdquo;</div>
        </div>)}

      {/* Slider comparison */}
      {sliders.some(s => s.c !== 0 || s.cons !== 0) && (<div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)' }}>
          <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Personality comparison — <span style={{ color: '#4DFFA0' }}>● Client</span>  <span style={{ color: '#6B9FFF', marginLeft: '8px' }}>▲ Consultant</span>
          </div>
          {sliders.map(s => (<div key={s.label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#89ACA0' }}>{s.label}</span>
              <div style={{ position: 'relative', height: '8px', background: 'rgba(137,172,160,0.1)', borderRadius: '4px' }}>
                <div style={{ position: 'absolute', left: `${((s.c + 3) / 6) * 100}%`, top: '-4px', width: '14px', height: '14px', borderRadius: '50%', background: 'rgba(10,25,18,0.8)', border: '2px solid #4DFFA0', transform: 'translateX(-50%)' }} title={`Client: ${s.c > 0 ? '+' : ''}${s.c}`}/>
                <div style={{ position: 'absolute', left: `${((s.cons + 3) / 6) * 100}%`, top: '-2px', width: '10px', height: '10px', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid #6B9FFF' }} title={`Consultant: ${s.cons > 0 ? '+' : ''}${s.cons}`}/>
              </div>
            </div>))}
        </div>)}
    </div>);
}
function Block({ label, value, generated }) {
    if (!value)
        return null;
    return (<div style={{ padding: '13px 15px', borderRadius: '10px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)' }}>
      <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: generated ? '#89ACA0' : '#F0F7F4', fontStyle: generated ? 'italic' : 'normal', lineHeight: 1.6 }}>{value}</div>
    </div>);
}
function UploadPanel({ children }) {
    return (<div style={{ display: 'grid', gap: '10px', padding: '16px', borderRadius: '12px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.13)', marginBottom: '16px' }}>
      {children}
    </div>);
}
// ══════════════════════════════════════════════════════
// TAB 2 — MOODBOARDS
// ══════════════════════════════════════════════════════
export function MoodboardsTab({ project, onRefresh }) {
    const moodboards = (project.moodboards ?? []);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');
    const [keywords, setKeywords] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    async function saveMoodboard() {
        if (!name || !coverUrl)
            return;
        await projectService.createMoodboard(project.id, {
            name, coverUrl, imageUrls: [coverUrl],
            keywords: keywords.split(',').map(item => item.trim()).filter(Boolean),
            sortOrder: moodboards.length + 1,
        });
        setUploading(false);
        setName('');
        setKeywords('');
        setCoverUrl('');
        await onRefresh?.();
    }
    return (<div className="floxa-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', color: '#89ACA0' }}>Upload up to 3 moodboards for client selection</div>
        <button onClick={() => setUploading(value => !value)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.25)', color: '#4DFFA0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>+ Upload moodboard</button>
      </div>
      {uploading && <UploadPanel>
        <input className="floxa-input" placeholder="Moodboard name" value={name} onChange={event => setName(event.target.value)}/>
        <input className="floxa-input" placeholder="Keywords, comma separated" value={keywords} onChange={event => setKeywords(event.target.value)}/>
        <FileUploader folder={`projects/${project.id}/moodboards`} label="Upload moodboard image" onUpload={file => setCoverUrl(file.url)}/>
        <button className="btn-floxa btn-floxa-primary btn-floxa-sm" disabled={!coverUrl || !name} onClick={saveMoodboard}>Save moodboard</button>
      </UploadPanel>}

      {moodboards.length === 0 ? (<div style={{ textAlign: 'center', padding: '40px', border: '2px dashed rgba(137,172,160,0.15)', borderRadius: '14px', color: '#89ACA0' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>🎨</div>
          <div style={{ fontSize: '14px', marginBottom: '6px' }}>No moodboards uploaded yet</div>
          <div style={{ fontSize: '12px' }}>Upload 3 moodboard directions for the client to choose from</div>
        </div>) : (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {moodboards.map(mb => (<div key={mb.id} style={{ borderRadius: '14px', overflow: 'hidden', border: mb.clientSelected ? '2px solid #4DFFA0' : '1px solid rgba(137,172,160,0.15)', background: 'rgba(10,25,18,0.4)' }}>
              <div style={{ height: '130px', background: 'linear-gradient(135deg,#0a1912,#1c342e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'rgba(137,172,160,0.4)' }}>
                {mb.coverUrl ? <img src={mb.coverUrl} alt={mb.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : 'No image'}
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{mb.name}</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {mb.keywords.map((k) => <span key={k} style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '20px', background: 'rgba(137,172,160,0.08)', color: '#89ACA0' }}>{k}</span>)}
                </div>
                {mb.clientSelected && <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(77,255,160,0.1)', color: '#4DFFA0', fontWeight: 600 }}>Selected ✓</span>}
                {!mb.clientSelected && <span style={{ fontSize: '10px', color: 'rgba(137,172,160,0.5)' }}>Awaiting selection</span>}
                <button onClick={async () => { await projectService.deleteMoodboard(project.id, mb.id); await onRefresh?.(); }} className="btn-floxa btn-floxa-danger btn-floxa-sm" style={{ marginTop: '9px' }}>Delete</button>
              </div>
            </div>))}
        </div>)}
    </div>);
}
// ══════════════════════════════════════════════════════
// TAB 3 — CONCEPTS
// ══════════════════════════════════════════════════════
export function ConceptsTab({ project, onRefresh }) {
    const concepts = (project.concepts ?? []);
    const reworkLeft = project.freeRevisions - project.reworkUsed;
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    async function saveConcept() {
        if (!title || !logoUrl)
            return;
        await projectService.createConcept(project.id, {
            title, description, logoUrl, mockupUrls: [logoUrl],
            optionNumber: concepts.length + 1, round: Math.max(1, project.reworkUsed + 1),
        });
        setUploading(false);
        setTitle('');
        setDescription('');
        setLogoUrl('');
        await onRefresh?.();
    }
    return (<div className="floxa-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '13px', color: '#89ACA0' }}>Round {Math.max(1, project.reworkUsed + 1)} · {reworkLeft} revision{reworkLeft !== 1 ? 's' : ''} remaining</div>
        <button onClick={() => setUploading(value => !value)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.25)', color: '#4DFFA0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>+ Upload concepts</button>
      </div>
      {uploading && <UploadPanel>
        <input className="floxa-input" placeholder="Concept title" value={title} onChange={event => setTitle(event.target.value)}/>
        <textarea className="floxa-input" placeholder="Concept description" value={description} onChange={event => setDescription(event.target.value)}/>
        <FileUploader folder={`projects/${project.id}/concepts`} label="Upload concept image" onUpload={file => setLogoUrl(file.url)}/>
        <button className="btn-floxa btn-floxa-primary btn-floxa-sm" disabled={!logoUrl || !title} onClick={saveConcept}>Save concept</button>
      </UploadPanel>}

      {reworkLeft <= 1 && (<div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.18)', color: '#F0B429', fontSize: '12px', marginBottom: '14px' }}>
          {reworkLeft === 0 ? `No free revisions remaining — additional rounds: ₹${project.extraRevisionCost.toLocaleString('en-IN')} each` : `1 revision remaining · additional rounds: ₹${project.extraRevisionCost.toLocaleString('en-IN')} each`}
        </div>)}

      {concepts.length === 0 ? (<div style={{ textAlign: 'center', padding: '40px', border: '2px dashed rgba(137,172,160,0.15)', borderRadius: '14px', color: '#89ACA0' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>⭐</div>
          <div>No concepts uploaded yet. Upload 3 options for client review.</div>
        </div>) : (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {concepts.map((con, i) => (<div key={con.id} style={{ borderRadius: '14px', overflow: 'hidden', border: con.clientStatus === 'SELECTED' ? '2px solid #4DFFA0' : con.clientStatus === 'REJECTED' ? '1px solid rgba(255,107,107,0.2)' : '1px solid rgba(137,172,160,0.15)', opacity: con.clientStatus === 'REJECTED' ? 0.45 : 1 }}>
              <div style={{ height: '110px', background: 'rgba(10,25,18,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'rgba(137,172,160,0.3)' }}>
                {con.logoUrl ? <img src={con.logoUrl} alt={con.title} style={{ maxHeight: '80px', maxWidth: '90%' }}/> : `Option 0${con.optionNumber}`}
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(10,25,18,0.5)' }}>
                <div style={{ fontSize: '9px', color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Option 0{con.optionNumber}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{con.title}</div>
                <div style={{ fontSize: '11px', color: '#89ACA0', marginBottom: '10px', lineHeight: 1.5 }}>{con.description}</div>
                {con.clientStatus === 'SELECTED' && <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(77,255,160,0.1)', color: '#4DFFA0', fontWeight: 600 }}>Selected ✓</span>}
                {con.clientStatus === 'REJECTED' && (<div>
                    <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '20px', background: 'rgba(255,107,107,0.1)', color: '#FF8080', fontWeight: 600 }}>Rejected</span>
                    {con.clientComment && <div style={{ fontSize: '11px', color: 'rgba(137,172,160,0.6)', marginTop: '6px', fontStyle: 'italic' }}>&ldquo;{con.clientComment}&rdquo;</div>}
                  </div>)}
                {con.clientStatus === 'PENDING' && <span style={{ fontSize: '10px', color: 'rgba(137,172,160,0.5)' }}>Awaiting client review</span>}
                <button onClick={async () => { await projectService.deleteConcept(project.id, con.id); await onRefresh?.(); }} className="btn-floxa btn-floxa-danger btn-floxa-sm" style={{ marginTop: '9px' }}>Delete</button>
              </div>
            </div>))}
        </div>)}
    </div>);
}
// ══════════════════════════════════════════════════════
// TAB 4 — DELIVERY
// ══════════════════════════════════════════════════════
export function DeliveryTab({ project, onRefresh }) {
    const deliverables = (project.deliverables ?? []);
    const finalPaid = (project.payments ?? []).some((p) => p.type === 'final' && p.status === 'PAID');
    const [uploading, setUploading] = useState(false);
    const [label, setLabel] = useState('');
    const [category, setCategory] = useState('logo');
    const [file, setFile] = useState(null);
    async function saveDeliverable() {
        if (!label || !file)
            return;
        await projectService.createDeliverable(project.id, {
            label, category, fileUrl: file.url, previewUrl: file.url,
            fileSize: file.size, fileFormat: file.format, gated: false,
        });
        setUploading(false);
        setLabel('');
        setFile(null);
        await onRefresh?.();
    }
    const DEFAULT_DELIVERABLES = [
        { category: 'logo_pack', label: 'Logo Pack', icon: '⬡', size: 'SVG + PNG + AI · 12 MB' },
        { category: 'color_palette', label: 'Colour Palette', icon: '◈', size: 'ASE + PDF · 1.2 MB' },
        { category: 'typography', label: 'Typography Guide', icon: 'T', size: 'PDF · 3.4 MB' },
        { category: 'brand_manual', label: 'Brand Manual', icon: '⊟', size: 'PDF · 28 MB' },
        { category: 'stationery', label: 'Stationery Pack', icon: '□', size: 'ZIP · 45 MB' },
        { category: 'social_kit', label: 'Social Media Kit', icon: '⊞', size: 'ZIP · 22 MB' },
    ];
    return (<div className="floxa-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', background: 'rgba(77,255,160,0.04)', border: '1px solid rgba(77,255,160,0.12)', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#4DFFA0', marginBottom: '3px' }}>
            {project.status === 'DELIVERED' ? 'Project delivered ✓' : 'Manage final files'}
          </div>
          <div style={{ fontSize: '12px', color: '#89ACA0' }}>
            {finalPaid ? 'Final payment received — all files unlocked' : 'Files gated behind final payment'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setUploading(value => !value)} style={{ padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.2)', color: '#89ACA0', fontSize: '12px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>+ Upload files</button>
          <button onClick={() => {
            if (confirm('Publish this project to your portfolio?'))
                alert('Published! floxa.io/p/flumenx/' + project.id);
        }} style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.25)', color: '#4DFFA0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
            1-click publish →
          </button>
        </div>
      </div>
      {uploading && <UploadPanel>
        <input className="floxa-input" placeholder="Deliverable label" value={label} onChange={event => setLabel(event.target.value)}/>
        <select className="floxa-input" value={category} onChange={event => setCategory(event.target.value)}>{DEFAULT_DELIVERABLES.map(item => <option key={item.category} value={item.category}>{item.label}</option>)}</select>
        <FileUploader folder={`projects/${project.id}/deliverables`} accept=".jpg,.jpeg,.png,.webp,.pdf,.zip,.ai,.eps,.psd,.doc,.docx" label="Upload deliverable file" onUpload={uploaded => setFile({ url: uploaded.url, size: uploaded.size, format: uploaded.format })}/>
        <button className="btn-floxa btn-floxa-primary btn-floxa-sm" disabled={!file || !label} onClick={saveDeliverable}>Save deliverable</button>
      </UploadPanel>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {DEFAULT_DELIVERABLES.map(d => {
            const uploaded = deliverables.find(del => del.category === d.category);
            const locked = !finalPaid && !uploaded;
            return (<div key={d.category} style={{ padding: '18px 16px', borderRadius: '12px', border: '1px solid rgba(137,172,160,0.12)', background: 'rgba(10,25,18,0.45)', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: uploaded ? 'rgba(77,255,160,0.1)' : 'rgba(240,180,41,0.1)', color: uploaded ? '#4DFFA0' : '#F0B429', border: `1px solid ${uploaded ? 'rgba(77,255,160,0.2)' : 'rgba(240,180,41,0.2)'}` }}>
                {uploaded ? 'Ready' : 'Pending'}
              </span>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{d.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>{d.label}</div>
              <div style={{ fontSize: '11px', color: 'rgba(137,172,160,0.5)', marginBottom: '12px' }}>{d.size}</div>
              <button onClick={() => { if (uploaded?.fileUrl)
                window.open(uploaded.fileUrl, '_blank');
            else
                alert('File not yet uploaded'); }} style={{ width: '100%', padding: '8px', borderRadius: '8px', fontFamily: "'Jost',sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', cursor: uploaded ? 'pointer' : 'default', border: `1px solid ${uploaded ? 'rgba(77,255,160,0.22)' : 'rgba(240,180,41,0.18)'}`, background: uploaded ? 'rgba(77,255,160,0.06)' : 'rgba(240,180,41,0.04)', color: uploaded ? '#4DFFA0' : '#F0B429' }}>
                {uploaded ? 'View / Download' : 'Not uploaded'}
              </button>
              {uploaded && <button onClick={async () => { await projectService.deleteDeliverable(project.id, uploaded.id); await onRefresh?.(); }} className="btn-floxa btn-floxa-danger btn-floxa-sm" style={{ width: '100%', marginTop: '7px' }}>Delete</button>}
            </div>);
        })}
      </div>
    </div>);
}
// ══════════════════════════════════════════════════════
// TAB 5 — PAYMENT
// ══════════════════════════════════════════════════════
export function PaymentTab({ project }) {
    const payments = (project.payments ?? []);
    const getPayment = (type) => payments.find(p => p.type === type);
    const splits = [
        { type: 'advance', label: 'Advance', pct: project.splitAdvancePct },
        { type: 'mid', label: 'Mid-point', pct: project.splitMidPct },
        { type: 'final', label: 'Final', pct: project.splitFinalPct },
    ];
    return (<div className="floxa-fade-in">
      {/* Payment cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
        {splits.map(s => {
            const payment = getPayment(s.type);
            const amount = Math.round((project.projectValue * s.pct) / 100);
            const isPaid = payment?.status === 'PAID';
            return (<div key={s.type} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${isPaid ? 'rgba(77,255,160,0.2)' : 'rgba(137,172,160,0.12)'}`, background: 'rgba(10,25,18,0.45)' }}>
              <div style={{ fontSize: '10px', color: 'rgba(137,172,160,0.5)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>{s.label} ({s.pct}%)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '5px' }}>₹{amount.toLocaleString('en-IN')}</div>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', background: isPaid ? 'rgba(77,255,160,0.1)' : 'rgba(137,172,160,0.08)', color: isPaid ? '#4DFFA0' : 'rgba(137,172,160,0.5)' }}>
                {isPaid ? `Received ✓ ${payment?.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN') : ''}` : 'Pending'}
              </span>
            </div>);
        })}
      </div>

      {/* Per-project payment settings */}
      <div style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid rgba(137,172,160,0.12)', background: 'rgba(10,25,18,0.4)', marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Payment settings for this project</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label className="floxa-label">Advance %</label>
            <input type="number" defaultValue={project.splitAdvancePct} className="floxa-input"/>
          </div>
          <div>
            <label className="floxa-label">Extra revision cost (₹)</label>
            <input type="number" defaultValue={project.extraRevisionCost} className="floxa-input"/>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid rgba(137,172,160,0.08)' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>Gate files behind final payment</div>
            <div style={{ fontSize: '11px', color: '#89ACA0' }}>Client cannot download until balance paid</div>
          </div>
          <label className="floxa-toggle">
            <input type="checkbox" defaultChecked={project.gateFilesBehindPayment}/>
            <div className="floxa-toggle-track"/>
            <div className="floxa-toggle-thumb"/>
          </label>
        </div>
        <button onClick={() => alert('Payment settings saved')} className="btn-floxa btn-floxa-primary btn-floxa-sm" style={{ marginTop: '14px' }}>Save settings</button>
      </div>
    </div>);
}
// ══════════════════════════════════════════════════════
// TAB 6 — NOTES
// ══════════════════════════════════════════════════════
export function NotesTab({ project, onRefresh }) {
    const [internalNote, setInternalNote] = useState('');
    const [savedMessage, setSavedMessage] = useState('');
    const notes = (project.notes ?? []);
    const clientNotes = notes.filter(n => n.type === 'client');
    const internalNotes = notes.filter(n => n.type === 'internal');
    async function saveNote() {
        if (!internalNote.trim())
            return;
        await projectService.addNote(project.id, { type: 'internal', content: internalNote });
        setInternalNote('');
        setSavedMessage('Note saved');
        await onRefresh?.();
        setTimeout(() => setSavedMessage(''), 2000);
    }
    return (<div className="floxa-fade-in">
      {/* Internal notes */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'rgba(137,172,160,0.5)', marginBottom: '10px' }}>Internal notes — not visible to client</div>
        <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} className="floxa-input" rows={5} placeholder="Add notes about this project, client preferences, internal decisions, meeting summaries..." style={{ marginBottom: '10px' }}/>
        <button onClick={saveNote} className="btn-floxa btn-floxa-primary btn-floxa-sm">Save note</button>
        {savedMessage && <span style={{ marginLeft: '10px', color: '#4DFFA0', fontSize: '12px' }}>{savedMessage}</span>}

        {internalNotes.length > 0 && (<div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {internalNotes.map(n => (<div key={n.id} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)' }}>
                <div style={{ fontSize: '11px', color: 'rgba(137,172,160,0.4)', marginBottom: '5px' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '13px', color: '#F0F7F4', lineHeight: 1.65 }}>{n.content}</div>
              </div>))}
          </div>)}
      </div>

      {/* Client notes */}
      {clientNotes.length > 0 && (<div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Client notes from discovery</div>
          {clientNotes.map(n => (<div key={n.id} style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(137,172,160,0.1)', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(137,172,160,0.4)', marginBottom: '6px' }}>Submitted · {new Date(n.createdAt).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '13px', color: '#F0F7F4', lineHeight: 1.7 }}>{n.content}</div>
            </div>))}
        </div>)}

      {notes.length === 0 && (<div style={{ padding: '20px', border: '2px dashed rgba(137,172,160,0.1)', borderRadius: '12px', textAlign: 'center', color: 'rgba(137,172,160,0.4)', fontSize: '13px' }}>
          No notes yet. Add your first note above.
        </div>)}
    </div>);
}
// ══════════════════════════════════════════════════════
// TAB 7 — ACTIVITY LOG
// ══════════════════════════════════════════════════════
export function ActivityTab({ projectId }) {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        projectService.getActivity(projectId)
            .then(d => { if (d.success && d.data)
            setLogs(d.data); });
    }, [projectId]);
    const displayLogs = logs;
    const colorMap = { client: '#4DFFA0', payment: '#F0B429', system: 'rgba(137,172,160,0.5)' };
    return (<div className="floxa-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {displayLogs.length === 0 && <div style={{ padding: '20px', border: '2px dashed rgba(137,172,160,0.1)', borderRadius: '12px', textAlign: 'center', color: 'rgba(137,172,160,0.4)', fontSize: '13px' }}>No activity recorded yet.</div>}
      {displayLogs.map((log, i) => (<div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: 'rgba(10,25,18,0.35)', borderRadius: '10px', border: '1px solid rgba(137,172,160,0.1)' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colorMap[log.type] ?? colorMap.system, marginTop: '5px', flexShrink: 0 }}/>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{log.action}</div>
            {log.details && <div style={{ fontSize: '11px', color: '#89ACA0', marginBottom: '3px' }}>{log.details}</div>}
            <div style={{ fontSize: '10px', color: 'rgba(137,172,160,0.4)' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</div>
          </div>
        </div>))}
    </div>);
}
