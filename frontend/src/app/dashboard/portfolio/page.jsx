// src/app/dashboard/portfolio/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { projectService } from '@/services/projectService';
export default function PortfolioPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [portfolioSlug] = useState('flumenx');
    useEffect(() => {
        projectService.list()
            .then(d => { if (d.success && d.data)
            setProjects(d.data.filter((p) => p.status === 'DELIVERED' || p.publishedToPortfolio)); })
            .finally(() => setLoading(false));
    }, []);
    async function publish(projectId) {
        const data = await projectService.publish(projectId);
        if (data.success) {
            setProjects(p => p.map(pr => pr.id === projectId ? { ...pr, publishedToPortfolio: true } : pr));
            alert('Published! floxa.io/p/' + portfolioSlug + '/' + projectId);
        }
    }
    return (<div className="floxa-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '3px' }}>Portfolio</div>
          <div style={{ fontSize: '12px', color: '#89ACA0' }}>
            floxa.io/p/{portfolioSlug}
            <button onClick={() => navigator.clipboard.writeText(`https://floxa.io/p/${portfolioSlug}`)} style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: '#4DFFA0', fontSize: '12px', cursor: 'pointer' }}>Copy URL</button>
          </div>
        </div>
      </div>

      {loading ? (<div style={{ textAlign: 'center', padding: '40px', color: '#89ACA0' }}>Loading...</div>) : projects.length === 0 ? (<div style={{ textAlign: 'center', padding: '40px', border: '2px dashed rgba(137,172,160,0.12)', borderRadius: '14px', color: '#89ACA0' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>🏆</div>
          <div style={{ fontSize: '14px', marginBottom: '6px' }}>No portfolio items yet</div>
          <div style={{ fontSize: '12px' }}>Completed projects can be published to your portfolio with 1 click</div>
        </div>) : (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
          {projects.map(project => (<div key={project.id} style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(137,172,160,0.13)', background: 'rgba(10,25,18,0.5)', transition: 'all .25s' }}>
              <div style={{ height: '130px', background: 'linear-gradient(135deg,#0a1912,#1c342e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, color: 'rgba(137,172,160,0.25)', letterSpacing: '.1em' }}>
                {project.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{project.name}</div>
                  {project.publishedToPortfolio
                    ? <span style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(77,255,160,0.1)', color: '#4DFFA0', fontWeight: 700 }}>Live</span>
                    : <span style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(240,180,41,0.1)', color: '#F0B429', fontWeight: 700 }}>Draft</span>}
                </div>
                <div style={{ fontSize: '11px', color: '#89ACA0', marginBottom: '14px' }}>
                  {project.sector.replace(/_/g, ' ')} · {new Date(project.createdAt).getFullYear()}
                </div>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <button onClick={() => window.open(`https://floxa.io/p/${portfolioSlug}/${project.id}`, '_blank')} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.15)', color: '#89ACA0', fontSize: '11px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>Preview</button>
                  {!project.publishedToPortfolio && (<button onClick={() => publish(project.id)} style={{ flex: 2, padding: '8px', borderRadius: '8px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.25)', color: '#4DFFA0', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>Publish →</button>)}
                  {project.publishedToPortfolio && (<button onClick={() => alert('Unpublish: coming in Phase 2')} style={{ flex: 2, padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(137,172,160,0.13)', color: '#89ACA0', fontSize: '11px', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>Manage</button>)}
                </div>
              </div>
            </div>))}
        </div>)}
    </div>);
}
