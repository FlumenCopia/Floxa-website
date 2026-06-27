// src/app/client/[token]/page.tsx
// This is the page clients open from their unique link
'use client';
import { useEffect, useState } from 'react';
// Import all discovery step components
import { SplashScreen, LoginScreen } from '@/components/client/SplashScreen';
import { ProfileScreen } from '@/components/client/ProfileScreen';
import { DiscoveryFlow } from '@/components/client/DiscoveryFlow';
import { ClientDashboard } from '@/components/client/ClientDashboard';
import { clientPortalService } from '@/services/clientPortalService';
export default function ClientPortalPage({ params }) {
    const { token } = params;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [screen, setScreen] = useState('splash');
    const [clientData, setClientData] = useState({});

    const getResumeScreen = (status) => {
        if (status === 'CREATED')
            return 'profile';
        if (status === 'PROFILE_COMPLETE')
            return 'discovery';
        return 'dashboard';
    };

    const applyProject = (portalProject) => {
        setProject(portalProject);
        setClientData(portalProject.brandDNA ?? {});
    };
    const refreshProject = async () => {
        const response = await clientPortalService.getProject();
        const portalProject = 'success' in response ? response.data : response;
        if (portalProject)
            applyProject(portalProject);
        return portalProject;
    };
    useEffect(() => {
        clientPortalService.createSession(token)
            .then(async (sessionProject) => {
            if (sessionProject)
                return sessionProject;
            const response = await clientPortalService.getProject();
            return 'success' in response ? response.data : response;
        })
            .then(portalProject => {
            if (portalProject) {
                applyProject(portalProject);
            }
            else {
                setError('Invalid link');
            }
        })
            .catch(() => setError('Something went wrong. Please try again.'))
            .finally(() => setLoading(false));
    }, [token]);
    if (loading) {
        return (<div className="client-portal-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: '#4DFFA0', fontFamily: "'Jost',sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '.12em', animation: 'floxa-breathe 2s ease-in-out infinite' }}>FLOXA</div>
      </div>);
    }
    if (error) {
        return (<div className="client-portal-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🔒</div>
        <div style={{ color: '#F0F7F4', fontSize: '18px', fontWeight: 600 }}>Link not found</div>
        <div style={{ color: '#89ACA0', fontSize: '14px', textAlign: 'center', maxWidth: '320px' }}>{error}</div>
        <div style={{ color: 'rgba(137,172,160,0.5)', fontSize: '12px' }}>Contact your consultant for a new link.</div>
      </div>);
    }
    const branding = {
        primary: project?.brandPrimaryColor ?? '#1C342E',
        neon: project?.brandNeonColor ?? '#4DFFA0',
        heading: project?.clientPortalHeading ?? 'Discover Your Brand Clarity.',
    };
    const screenProps = {
        project: project,
        branding,
        clientData,
        setClientData,
        resumeScreen: getResumeScreen(project?.status),
        onNext: (s) => setScreen(s),
        onProjectRefresh: refreshProject,
    };
    return (<main className="client-portal-shell">
      {screen === 'splash' && <SplashScreen {...screenProps}/>}
      {screen === 'login' && <LoginScreen {...screenProps}/>}
      {screen === 'profile' && <ProfileScreen {...screenProps}/>}
      {screen === 'discovery' && <DiscoveryFlow {...screenProps}/>}
      {screen === 'dashboard' && (<ClientDashboard {...screenProps} onSignOut={async () => {
                await clientPortalService.logout();
                window.location.href = '/';
            }}/>)}
    </main>);
}
