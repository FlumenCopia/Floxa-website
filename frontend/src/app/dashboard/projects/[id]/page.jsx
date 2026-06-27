// src/app/dashboard/projects/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscoveryTab, MoodboardsTab, ConceptsTab, DeliveryTab, NotesTab, ActivityTab } from '@/components/dashboard/tabs/ProjectTabs';
import { projectService } from '@/services/projectService';
const TABS = [
    { key: 'discovery', label: 'Discovery Report' },
    { key: 'moodboards', label: 'Moodboards' },
    { key: 'concepts', label: 'Concepts' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'notes', label: 'Notes' },
    { key: 'activity', label: 'Activity' },
];
const STATUS_PCT = {
    CREATED: 20, PROFILE_COMPLETE: 25, DISCOVERY_COMPLETE: 30,
    VISUAL_SELECTED: 40, AGREEMENT_SIGNED: 50, ADVANCE_PAID: 55,
    MOODBOARD_UPLOADED: 58, MOODBOARD_SELECTED: 65,
    CONCEPTS_UPLOADED: 68, CONCEPT_APPROVED: 80, MID_PAID: 83,
    FINAL_UPLOADED: 90, FINAL_APPROVED: 95, FINAL_PAID: 98,
    DELIVERED: 100, ARCHIVED: 100,
};
export default function ProjectDetailPage({ params }) {
    const { id } = params;
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('discovery');
    const [copyMsg, setCopyMsg] = useState('');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', clientEmail: '', projectValue: '' });
    useEffect(() => {
        projectService.get(id)
            .then(d => { if (d.success && d.data)
            setProject(d.data); })
            .finally(() => setLoading(false));
    }, [id]);
    function copyLink() {
        if (!project)
            return;
        navigator.clipboard.writeText(project.clientPortalUrl ?? '');
        setCopyMsg('Copied!');
        setTimeout(() => setCopyMsg(''), 2000);
    }
    async function refreshProject() {
        const data = await projectService.get(id);
        if (data.success && data.data)
            setProject(data.data);
    }
    async function sendEmail() {
        await projectService.resendClientLink(id);
        copyLink();
        setCopyMsg('Client link copied');
    }
    async function addReminder() {
        const msg = prompt('Internal reminder:', 'Follow up on this project.');
        if (!msg)
            return;
        await projectService.notify(id, { type: 'CUSTOM', title: `Reminder: ${project?.name ?? 'Project'}`, body: msg });
        window.dispatchEvent(new Event('floxa:notifications-updated'));
        setCopyMsg('Reminder added');
        setTimeout(() => setCopyMsg(''), 2500);
    }
    async function saveEdit() {
        const result = await projectService.update(id, {
            name: editForm.name,
            clientEmail: editForm.clientEmail,
            projectValue: Number(editForm.projectValue || 0),
        });
        if (result.success && result.data)
            setProject(result.data);
        setEditing(false);
    }
    async function archiveProject() {
        if (!confirm('Archive this project? The client portal link will be revoked.'))
            return;
        const result = await projectService.archive(id);
        if (result.success && result.data)
            setProject(result.data);
    }
    async function changeStatus(nextStatus) {
        const result = await projectService.updateStatus(id, nextStatus);
        if (result.success && result.data)
            setProject(result.data);
    }
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px', color: '#89ACA0' }}>Loading project...</div>;
    }
    if (!project) {
        return (<div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '14px', color: '#89ACA0', marginBottom: '12px' }}>Project not found</div>
        <button onClick={() => router.push('/dashboard/projects')} className="btn-floxa btn-floxa-secondary btn-floxa-sm">← Back to projects</button>
      </div>);
    }
    const pct = STATUS_PCT[project.status] ?? project.completionPct;
    return (<div className="floxa-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <button onClick={() => router.push('/dashboard/projects')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.15)', color: '#89ACA0', fontSize: '13px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
          ← Projects
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>{project.name}</div>
          <div style={{ fontSize: '13px', color: '#89ACA0' }}>
            Phase {Math.ceil(pct / 12.5)} of 9 · {project.status.replace(/_/g, ' ')} · {pct}%
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => { setEditForm({ name: project.name, clientEmail: project.clientEmail ?? '', projectValue: String(project.projectValue) }); setEditing(true); }} style={{ padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontSize: '12px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>Edit</button>
          <select value={project.status} onChange={event => changeStatus(event.target.value)} className="floxa-input" style={{ width: '170px', padding: '7px 10px', fontSize: '12px' }}>
            {['CREATED', 'PROFILE_COMPLETE', 'DISCOVERY_COMPLETE', 'MOODBOARD_UPLOADED', 'MOODBOARD_SELECTED', 'CONCEPTS_UPLOADED', 'CONCEPT_APPROVED', 'FINAL_UPLOADED', 'DELIVERED'].map(status => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
          </select>
          <button onClick={copyLink} style={{ padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontSize: '12px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
            {copyMsg || 'Copy client link'}
          </button>
          <button onClick={sendEmail} style={{ padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontSize: '12px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
            Email client
          </button>
          <button onClick={addReminder} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.25)', color: '#4DFFA0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
            Add reminder
          </button>
          <button onClick={archiveProject} className="btn-floxa btn-floxa-danger btn-floxa-sm">Archive</button>
        </div>
      </div>

      {/* Project overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
            { label: 'Client', value: project.clientEmail ?? 'No client', sub: project.sector.replace(/_/g, ' ') },
            { label: 'Value', value: `₹${project.projectValue.toLocaleString('en-IN')}`, sub: 'Total project value' },
            { label: 'Advance', value: `₹${Math.round(project.projectValue * project.splitAdvancePct / 100).toLocaleString('en-IN')}`, sub: `${project.splitAdvancePct}% — ${(project.payments ?? []).some((p) => p.type === 'advance' && p.status === 'PAID') ? 'Received ✓' : 'Pending'}` },
            { label: 'Revisions', value: `${project.reworkUsed} / ${project.freeRevisions}`, sub: `₹${project.extraRevisionCost.toLocaleString('en-IN')} extra` },
            { label: 'Progress', value: `${pct}%`, sub: `Phase ${Math.ceil(pct / 12.5)} of 9` },
            { label: 'Started', value: new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), sub: `${Math.floor((Date.now() - new Date(project.createdAt).getTime()) / 86400000)} days active` },
        ].map(card => (<div key={card.label} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(10,25,18,0.45)', border: '1px solid rgba(137,172,160,0.1)' }}>
            <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{card.label}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0F7F4', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.value}</div>
            <div style={{ fontSize: '10px', color: 'rgba(137,172,160,0.5)' }}>{card.sub}</div>
          </div>))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(137,172,160,0.5)', marginBottom: '6px' }}>
          <span>Project progress</span><span>{pct}%</span>
        </div>
        <div className="floxa-progress-track" style={{ height: '5px' }}>
          <div className="floxa-progress-fill" style={{ width: `${pct}%`, height: '5px' }}/>
        </div>
      </div>

      {/* Client link */}
      <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(10,25,18,0.4)', border: '1px solid rgba(77,255,160,0.12)', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Client portal link</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input readOnly value={project.clientPortalUrl ?? ''} style={{ flex: 1, background: 'rgba(5,14,10,0.6)', border: '1px solid rgba(137,172,160,0.12)', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', color: '#89ACA0', fontFamily: 'monospace', minWidth: '200px' }}/>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={copyLink} style={{ padding: '9px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontSize: '12px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>Copy</button>
            <button onClick={sendEmail} style={{ padding: '9px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.18)', color: '#89ACA0', fontSize: '12px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>Email</button>
            <button onClick={() => window.open(project.clientPortalUrl ?? '', '_blank')} style={{ padding: '9px 14px', borderRadius: '8px', background: 'rgba(77,255,160,0.08)', border: '1px solid rgba(77,255,160,0.2)', color: '#4DFFA0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>Open portal →</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(137,172,160,0.13)', marginBottom: '20px', overflowX: 'auto' }}>
        {TABS.map(t => (<button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '9px 16px', fontSize: '12px', color: activeTab === t.key ? '#4DFFA0' : '#89ACA0', background: 'none', border: 'none', borderBottom: activeTab === t.key ? '2px solid #4DFFA0' : '2px solid transparent', cursor: 'pointer', fontFamily: "'Jost',sans-serif", fontWeight: activeTab === t.key ? 600 : 400, whiteSpace: 'nowrap', transition: 'all .22s' }}>
            {t.label}
          </button>))}
      </div>

      {/* Tab content */}
      {activeTab === 'discovery' && <DiscoveryTab project={project} onRefresh={refreshProject}/>}
      {activeTab === 'moodboards' && <MoodboardsTab project={project} onRefresh={refreshProject}/>}
      {activeTab === 'concepts' && <ConceptsTab project={project} onRefresh={refreshProject}/>}
      {activeTab === 'delivery' && <DeliveryTab project={project} onRefresh={refreshProject}/>}
      {activeTab === 'notes' && <NotesTab project={project} onRefresh={refreshProject}/>}
      {activeTab === 'activity' && <ActivityTab projectId={project.id}/>}

      {editing && (<div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditing(false)}>
          <div style={{ width: 'min(500px,92vw)', background: 'rgba(4,12,8,0.98)', border: '1px solid rgba(137,172,160,0.2)', borderRadius: '22px', padding: '30px' }} onClick={event => event.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '18px' }}>Edit project</div>
            <input className="floxa-input" value={editForm.name} onChange={event => setEditForm(current => ({ ...current, name: event.target.value }))} style={{ marginBottom: '12px' }}/>
            <input className="floxa-input" type="email" value={editForm.clientEmail} onChange={event => setEditForm(current => ({ ...current, clientEmail: event.target.value }))} style={{ marginBottom: '12px' }}/>
            <input className="floxa-input" type="number" value={editForm.projectValue} onChange={event => setEditForm(current => ({ ...current, projectValue: event.target.value }))} style={{ marginBottom: '20px' }}/>
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setEditing(false)} className="btn-floxa btn-floxa-secondary btn-floxa-sm">Cancel</button><button onClick={saveEdit} className="btn-floxa btn-floxa-primary btn-floxa-sm">Save changes</button></div>
          </div>
        </div>)}
    </div>);
}
