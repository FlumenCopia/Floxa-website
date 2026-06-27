// src/app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectService } from '@/services/projectService';
const STATUS_BADGE = {
    DISCOVERY_COMPLETE: { label: 'Discovery', cls: 'badge-discovery' },
    MOODBOARD_SELECTED: { label: 'Moodboard', cls: 'badge-moodboard' },
    CONCEPTS_UPLOADED: { label: 'Concepts', cls: 'badge-concept' },
    DELIVERED: { label: 'Delivered', cls: 'badge-delivery' },
    CREATED: { label: 'New', cls: 'badge-discovery' },
    ADVANCE_PAID: { label: 'Active', cls: 'badge-delivery' },
};
export default function DashboardPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        activeProjects: 0, awaitingAction: 0, completedProjects: 0, totalProjects: 0,
        recentProjects: [],
    });
    useEffect(() => {
        projectService.summary()
            .then(summaryResult => {
            if (summaryResult.success && summaryResult.data) {
                setSummary(summaryResult.data);
                setProjects(summaryResult.data.recentProjects ?? []);
            }
        })
            .finally(() => setLoading(false));
    }, []);
    const liveStats = [
        { label: 'Active projects', value: summary.activeProjects, delta: 'Currently in progress', color: '#4DFFA0' },
        { label: 'Awaiting action', value: summary.awaitingAction, delta: 'Needs attention', color: '#F0B429' },
        { label: 'Completed', value: summary.completedProjects, delta: 'Delivered projects', color: '#4DFFA0' },
        { label: 'Total projects', value: summary.totalProjects, delta: 'All project records', color: '#89ACA0' },
    ];
    return (<div className="floxa-fade-in">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {liveStats.map((s, i) => (<div key={i} className="floxa-stat-card" style={{ borderRadius: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(137,172,160,0.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1, marginBottom: '5px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: s.color, fontWeight: 500 }}>{s.delta}</div>
          </div>))}
      </div>

      {/* Projects header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>Active projects</div>
        <Link href="/dashboard/projects" style={{ fontSize: '12px', color: '#4DFFA0', textDecoration: 'none' }}>View all →</Link>
      </div>

      {/* Project list */}
      {loading ? (<div style={{ textAlign: 'center', color: '#89ACA0', padding: '40px' }}>Loading...</div>) : projects.length === 0 ? (<div style={{ textAlign: 'center', padding: '40px', color: '#89ACA0' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎯</div>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>No projects yet</div>
          <div style={{ fontSize: '12px' }}>Create your first project using the button above</div>
        </div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projects.slice(0, 5).map(project => {
                const badge = STATUS_BADGE[project.status] ?? { label: project.status, cls: 'badge-discovery' };
                return (<Link key={project.id} href={`/dashboard/projects/${project.id}`} style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(10,25,18,0.5)', border: '1px solid rgba(137,172,160,0.13)', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all .25s', borderLeft: project.completionPct < 30 ? '3px solid #4DFFA0' : '1px solid rgba(137,172,160,0.13)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(137,172,160,0.28)'; e.currentTarget.style.background = 'rgba(28,52,46,0.38)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(137,172,160,0.13)'; e.currentTarget.style.background = 'rgba(10,25,18,0.5)'; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{project.name}</div>
                    <div style={{ fontSize: '12px', color: '#89ACA0' }}>{project.clientEmail ?? 'No client assigned'} · ₹{project.projectValue.toLocaleString('en-IN')}</div>
                  </div>
                  <span className={`floxa-badge ${badge.cls}`}>{badge.label}</span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(137,172,160,0.5)', marginBottom: '5px' }}>
                    <span>Phase {Math.ceil(project.completionPct / 10)} of 9</span>
                    <span>{project.completionPct}%</span>
                  </div>
                  <div className="floxa-progress-track">
                    <div className="floxa-progress-fill" style={{ width: `${project.completionPct}%` }}/>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'rgba(137,172,160,0.5)' }}>
                  <span>{project.status.replace(/_/g, ' ')}</span>
                  <span>·</span>
                  <span>{new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </Link>);
            })}
        </div>)}
    </div>);
}
