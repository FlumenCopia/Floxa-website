// src/app/dashboard/projects/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectService } from '@/services/projectService';
const STATUS_META = {
    CREATED: { label: 'New', badge: 'badge-discovery', phase: 1 },
    PROFILE_COMPLETE: { label: 'Profile done', badge: 'badge-discovery', phase: 2 },
    DISCOVERY_COMPLETE: { label: 'Discovery', badge: 'badge-discovery', phase: 3 },
    VISUAL_SELECTED: { label: 'Visual', badge: 'badge-moodboard', phase: 4 },
    AGREEMENT_SIGNED: { label: 'Signed', badge: 'badge-moodboard', phase: 5 },
    ADVANCE_PAID: { label: 'Paid — active', badge: 'badge-delivery', phase: 6 },
    MOODBOARD_UPLOADED: { label: 'Moodboard ready', badge: 'badge-moodboard', phase: 6 },
    MOODBOARD_SELECTED: { label: 'Moodboard', badge: 'badge-moodboard', phase: 7 },
    CONCEPTS_UPLOADED: { label: 'Concepts', badge: 'badge-concept', phase: 7 },
    CONCEPT_APPROVED: { label: 'Concept approved', badge: 'badge-concept', phase: 8 },
    MID_PAID: { label: 'Mid paid', badge: 'badge-delivery', phase: 8 },
    FINAL_UPLOADED: { label: 'Final uploaded', badge: 'badge-delivery', phase: 9 },
    FINAL_APPROVED: { label: 'Final approved', badge: 'badge-delivery', phase: 9 },
    FINAL_PAID: { label: 'Final paid', badge: 'badge-delivery', phase: 9 },
    DELIVERED: { label: 'Delivered ✓', badge: 'badge-delivery', phase: 9 },
    ARCHIVED: { label: 'Archived', badge: 'badge-moodboard', phase: 9 },
};
export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', clientEmail: '', sector: 'BRAND_IDENTITY', projectValue: '', splitAdvancePct: '50', splitMidPct: '30', splitFinalPct: '20', freeRevisions: '2', clientNote: '' });
    const [creating, setCreating] = useState(false);
    const [newLink, setNewLink] = useState('');
    const load = () => {
        setLoading(true);
        projectService.list()
            .then(d => { if (d.success && d.data)
            setProjects(d.data); })
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);
    const filtered = projects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.clientEmail ?? '').toLowerCase().includes(search.toLowerCase());
        if (!matchSearch)
            return false;
        if (filter === 'active')
            return !['DELIVERED', 'ARCHIVED'].includes(p.status);
        if (filter === 'discovery')
            return ['CREATED', 'PROFILE_COMPLETE', 'DISCOVERY_COMPLETE', 'VISUAL_SELECTED'].includes(p.status);
        if (filter === 'delivery')
            return ['FINAL_UPLOADED', 'FINAL_APPROVED', 'FINAL_PAID', 'DELIVERED'].includes(p.status);
        if (filter === 'archived')
            return p.status === 'ARCHIVED';
        return true;
    });
    async function createProject() {
        setCreating(true);
        try {
            const data = await projectService.create(form);
            if (data.success && data.data) {
                setNewLink(data.data.clientPortalUrl ?? '');
                load();
                setForm({ name: '', clientEmail: '', sector: 'BRAND_IDENTITY', projectValue: '', splitAdvancePct: '50', splitMidPct: '30', splitFinalPct: '20', freeRevisions: '2', clientNote: '' });
            }
        }
        finally {
            setCreating(false);
        }
    }
    const FILTERS = [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'discovery', label: 'Discovery' },
        { key: 'delivery', label: 'Delivery' },
        { key: 'archived', label: 'Archived' },
    ];
    return (<div className="floxa-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>All Projects</div>
        <button onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.28)', color: '#4DFFA0', fontFamily: "'Jost',sans-serif", fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          + New project
        </button>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="floxa-input" style={{ maxWidth: '280px', padding: '8px 14px', fontSize: '13px' }}/>
        <div style={{ display: 'flex', gap: '4px' }}>
          {FILTERS.map(f => (<button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: filter === f.key ? 600 : 400, background: filter === f.key ? 'rgba(77,255,160,0.09)' : 'transparent', border: filter === f.key ? '1px solid rgba(77,255,160,0.2)' : '1px solid rgba(137,172,160,0.13)', color: filter === f.key ? '#4DFFA0' : '#89ACA0', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
              {f.label}
            </button>))}
        </div>
      </div>

      {/* Project list */}
      {loading ? (<div style={{ textAlign: 'center', color: '#89ACA0', padding: '40px' }}>Loading projects...</div>) : filtered.length === 0 ? (<div style={{ textAlign: 'center', padding: '40px', color: '#89ACA0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📁</div>
          <div>{search ? `No projects matching "${search}"` : 'No projects yet'}</div>
        </div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(project => {
                const meta = STATUS_META[project.status] ?? { label: project.status, badge: 'badge-discovery', phase: 1 };
                const needsAction = ['DISCOVERY_COMPLETE', 'MOODBOARD_SELECTED', 'CONCEPT_APPROVED'].includes(project.status);
                return (<div key={project.id} style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(10,25,18,0.5)', border: `1px solid ${needsAction ? 'rgba(77,255,160,0.18)' : 'rgba(137,172,160,0.13)'}`, borderLeft: needsAction ? '3px solid #4DFFA0' : '1px solid rgba(137,172,160,0.13)', transition: 'all .25s', position: 'relative' }}>
                {/* Row 1 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{project.name}</div>
                    <div style={{ fontSize: '12px', color: '#89ACA0' }}>
                      {project.clientEmail ?? 'No client'} · ₹{project.projectValue.toLocaleString('en-IN')} · {project.sector.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className={`floxa-badge ${meta.badge}`}>{meta.label}</span>
                    {needsAction && <span className="floxa-badge badge-danger">Action needed</span>}
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(137,172,160,0.5)', marginBottom: '5px' }}>
                    <span>Phase {meta.phase} of 9</span><span>{project.completionPct}%</span>
                  </div>
                  <div className="floxa-progress-track">
                    <div className="floxa-progress-fill" style={{ width: `${project.completionPct}%` }}/>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                  <button onClick={() => { navigator.clipboard.writeText(project.clientPortalUrl ?? ''); }} style={{ padding: '6px 12px', borderRadius: '7px', background: 'transparent', border: '1px solid rgba(137,172,160,0.15)', color: '#89ACA0', fontSize: '11px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                    Copy client link
                  </button>
                  <button onClick={async () => {
                        await navigator.clipboard.writeText(project.clientPortalUrl ?? '');
                    }} style={{ padding: '6px 12px', borderRadius: '7px', background: 'transparent', border: '1px solid rgba(137,172,160,0.15)', color: '#89ACA0', fontSize: '11px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                    Ready to share
                  </button>
                  <Link href={`/dashboard/projects/${project.id}`} style={{ padding: '6px 12px', borderRadius: '7px', background: 'rgba(77,255,160,0.08)', border: '1px solid rgba(77,255,160,0.2)', color: '#4DFFA0', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif", textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    Open project →
                  </Link>
                </div>
              </div>);
            })}
        </div>)}

      {/* New Project Modal */}
      {showModal && (<div onClick={() => { setShowModal(false); setNewLink(''); }} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(520px,94vw)', maxHeight: '90vh', overflowY: 'auto', background: 'rgba(4,12,8,0.98)', border: '1px solid rgba(137,172,160,0.2)', borderRadius: '22px', padding: '30px' }}>
            {newLink ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>✓</div>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Project created!</div>
                <div style={{ fontSize: '13px', color: '#89ACA0', marginBottom: '20px' }}>Client portal link created. Copy it below when you are ready to share.</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input readOnly value={newLink} style={{ flex: 1, background: 'rgba(5,14,10,0.6)', border: '1px solid rgba(137,172,160,0.15)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#89ACA0', fontFamily: 'monospace' }}/>
                  <button onClick={() => navigator.clipboard.writeText(newLink)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.25)', color: '#4DFFA0', fontSize: '12px', cursor: 'pointer', fontFamily: "'Jost',sans-serif", fontWeight: 600, whiteSpace: 'nowrap' }}>Copy</button>
                </div>
                <button onClick={() => { setShowModal(false); setNewLink(''); }} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(137,172,160,0.06)', border: '1px solid rgba(137,172,160,0.15)', color: '#89ACA0', fontFamily: "'Jost',sans-serif", cursor: 'pointer' }}>Close</button>
              </div>) : (<>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>New project</div>
                    <div style={{ fontSize: '12px', color: '#89ACA0' }}>Creates the project and generates a portal link to copy</div>
                  </div>
                  <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#89ACA0', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
                </div>

                {/* Form fields */}
                {[
                    { label: 'Project name', key: 'name', type: 'text', placeholder: 'e.g. Craft & Co — Brand Identity' },
                    { label: 'Client email', key: 'clientEmail', type: 'email', placeholder: 'client@company.com' },
                    { label: 'Project value (₹)', key: 'projectValue', type: 'number', placeholder: '75000' },
                ].map(f => (<div key={f.key} style={{ marginBottom: '14px' }}>
                    <label className="floxa-label">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="floxa-input"/>
                  </div>))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="floxa-label">Sector</label>
                    <select value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))} className="floxa-input" style={{ cursor: 'pointer' }}>
                      {['BRAND_IDENTITY', 'DIGITAL_MARKETING', 'UI_UX_DESIGN', 'IT_DEVELOPMENT', 'CONTENT_VIDEO', 'EVENTS'].map(s => (<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="floxa-label">Free revisions</label>
                    <select value={form.freeRevisions} onChange={e => setForm(p => ({ ...p, freeRevisions: e.target.value }))} className="floxa-input" style={{ cursor: 'pointer' }}>
                      {['1', '2', '3'].map(n => <option key={n} value={n}>{n} revision{n !== '1' ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="floxa-label">Advance %</label>
                    <input type="number" value={form.splitAdvancePct} onChange={e => setForm(p => ({ ...p, splitAdvancePct: e.target.value }))} className="floxa-input" min="0" max="100"/>
                  </div>
                  <div>
                    <label className="floxa-label">Mid % / Final %</label>
                    <input type="number" value={form.splitMidPct} onChange={e => setForm(p => ({ ...p, splitMidPct: e.target.value }))} className="floxa-input" placeholder="30" min="0" max="100"/>
                  </div>
                </div>

                <div style={{ marginTop: '14px', marginBottom: '20px' }}>
                  <label className="floxa-label">Note to client (optional)</label>
                  <textarea value={form.clientNote} onChange={e => setForm(p => ({ ...p, clientNote: e.target.value }))} className="floxa-input" rows={2} placeholder="Welcome! Please complete your discovery at your earliest convenience."/>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: 'rgba(137,172,160,0.06)', border: '1px solid rgba(137,172,160,0.13)', borderRadius: '10px', color: '#89ACA0', fontFamily: "'Jost',sans-serif", cursor: 'pointer' }}>Cancel</button>
                  <button onClick={createProject} disabled={creating || !form.name || !form.clientEmail} style={{ flex: 2, padding: '12px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.28)', borderRadius: '10px', color: '#4DFFA0', fontFamily: "'Jost',sans-serif", fontWeight: 600, cursor: 'pointer', opacity: (creating || !form.name || !form.clientEmail) ? 0.6 : 1 }}>
                    {creating ? 'Creating...' : 'Create & copy link →'}
                  </button>
                </div>
              </>)}
          </div>
        </div>)}
    </div>);
}
