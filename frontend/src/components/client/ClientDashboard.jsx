'use client';

import { useState } from 'react';
import { clientPortalService } from '@/services/clientPortalService';

const PHASE_LABELS = [
    'Profile', 'Discovery', 'Visual', 'Agreement',
    'Moodboard', 'Concepts', 'Delivery', 'Sign Off',
];

export function ClientDashboard({ project, onNext, onSignOut, onProjectRefresh }) {
    const pct = project.completionPct;
    const activePhaseIndex = Math.min(PHASE_LABELS.length - 1, Math.floor(pct / 12.5));
    const [panel, setPanel] = useState(null);
    const [working, setWorking] = useState('');

    async function selectMoodboard(id) {
        setWorking(id);
        try {
            await clientPortalService.selectMoodboard(id);
            await onProjectRefresh?.();
        } finally {
            setWorking('');
        }
    }

    async function decideConcept(id, decision) {
        const comment = decision === 'REJECTED'
            ? window.prompt('Tell your consultant what should change:', '') ?? ''
            : '';
        setWorking(id);
        try {
            await clientPortalService.decideConcept(id, decision, comment);
            await onProjectRefresh?.();
        } finally {
            setWorking('');
        }
    }

    async function downloadDeliverable(id) {
        setWorking(id);
        try {
            const response = await clientPortalService.downloadDeliverable(id);
            if (response.success && response.data?.fileUrl) {
                window.open(response.data.fileUrl, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to download this file.');
        } finally {
            setWorking('');
        }
    }

    const cards = [
        { symbol: '01', title: 'Discovery Report', sub: 'View your Brand DNA', active: pct >= 30, panel: 'discovery' },
        { symbol: '02', title: 'Moodboards', sub: `${project.moodboards?.length ?? 0} directions ready`, active: (project.moodboards?.length ?? 0) > 0, panel: 'moodboards' },
        { symbol: '03', title: 'Concepts', sub: `${project.concepts?.length ?? 0} concepts ready`, active: (project.concepts?.length ?? 0) > 0, panel: 'concepts' },
        { symbol: '04', title: 'Delivery', sub: `${project.deliverables?.length ?? 0} files ready`, active: (project.deliverables?.length ?? 0) > 0, panel: 'delivery' },
    ];

    return (
        <div className="client-dashboard-screen">
            <header className="client-dashboard-header">
                <div>
                    <div className="client-dashboard-wordmark">FLOXA</div>
                    <p>Welcome back, {project.brandDNA?.clientName ?? 'Client'}.</p>
                </div>
                <div className="client-dashboard-actions">
                    <button onClick={() => onNext?.('profile')}>Edit profile</button>
                    <button onClick={() => onProjectRefresh?.()}>Refresh</button>
                    <button onClick={() => onSignOut?.()}>Sign out</button>
                </div>
            </header>

            <section className="client-dashboard-hero">
                <div className="client-dashboard-orb" style={{ '--client-progress': `${pct * 3.6}deg` }}>
                    <div>
                        <strong>{pct}%</strong>
                        <span>complete</span>
                    </div>
                </div>

                <div className="client-dashboard-project">
                    <span className="client-dashboard-kicker">Your brand journey</span>
                    <h1>{project.name}</h1>
                    <p>
                        Phase {activePhaseIndex + 1} of {PHASE_LABELS.length} · {PHASE_LABELS[activePhaseIndex]}
                    </p>
                    <div className="client-dashboard-progress">
                        <span style={{ width: `${pct}%` }} />
                    </div>
                </div>

                <div className="client-dashboard-stage-list">
                    {PHASE_LABELS.map((label, index) => (
                        <div
                            key={label}
                            className={
                                index < activePhaseIndex
                                    ? 'complete'
                                    : index === activePhaseIndex
                                        ? 'active'
                                        : ''
                            }
                        >
                            <span />
                            {label}
                        </div>
                    ))}
                </div>
            </section>

            <section className="client-dashboard-grid">
                {cards.map(card => (
                    <button
                        key={card.panel}
                        type="button"
                        disabled={!card.active}
                        className={`client-journey-card ${card.active ? 'available' : ''}`}
                        onClick={() => card.active && setPanel(card.panel)}
                    >
                        <span className="client-card-number">{card.symbol}</span>
                        <span className="client-card-arrow">↗</span>
                        <strong>{card.title}</strong>
                        <small>{card.sub}</small>
                    </button>
                ))}
            </section>

            {panel && (
                <section className="client-dashboard-panel client-design-enter">
                    <div className="client-panel-heading">
                        <div>
                            <span>Project workspace</span>
                            <h2>{panel}</h2>
                        </div>
                        <button onClick={() => setPanel(null)}>Close</button>
                    </div>

                    {panel === 'discovery' && (
                        <div className="client-brand-summary">
                            <span>Personality cluster</span>
                            <h3>{project.brandDNA?.personalityCluster || 'Brand discovery complete'}</h3>
                            <p>{project.brandDNA?.positioningStatement || 'Your consultant is preparing the next stage.'}</p>
                        </div>
                    )}

                    {panel === 'moodboards' && (
                        <div className="client-panel-grid">
                            {project.moodboards?.map(item => (
                                <article key={item.id} className={item.clientSelected ? 'selected' : ''}>
                                    {item.coverUrl && <img src={item.coverUrl} alt={item.name} />}
                                    <h3>{item.name}</h3>
                                    <button
                                        disabled={item.clientSelected || working === item.id}
                                        onClick={() => selectMoodboard(item.id)}
                                        className="client-panel-action"
                                    >
                                        {item.clientSelected ? 'Selected' : working === item.id ? 'Saving...' : 'Select direction'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}

                    {panel === 'concepts' && (
                        <div className="client-panel-stack">
                            {project.concepts?.map(item => (
                                <article key={item.id}>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                    <div>
                                        <button
                                            disabled={working === item.id || item.clientStatus === 'SELECTED'}
                                            onClick={() => decideConcept(item.id, 'SELECTED')}
                                            className="client-panel-action"
                                        >
                                            {item.clientStatus === 'SELECTED' ? 'Approved' : 'Approve'}
                                        </button>
                                        <button
                                            disabled={working === item.id}
                                            onClick={() => decideConcept(item.id, 'REJECTED')}
                                            className="client-panel-action secondary"
                                        >
                                            Request changes
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {panel === 'delivery' && (
                        <div className="client-panel-stack">
                            {project.deliverables?.map(item => (
                                <article key={item.id} className="client-delivery-row">
                                    <div>
                                        <h3>{item.label}</h3>
                                        <p>{item.fileFormat || item.category}</p>
                                    </div>
                                    <button
                                        disabled={working === item.id}
                                        onClick={() => downloadDeliverable(item.id)}
                                        className="client-panel-action"
                                    >
                                        Download
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
