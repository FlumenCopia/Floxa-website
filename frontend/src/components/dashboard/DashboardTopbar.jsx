'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { notificationService } from '@/services/notificationService';
import { projectService } from '@/services/projectService';
export function DashboardTopbar() {
    const { user } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [form, setForm] = useState({ name: '', clientEmail: '', projectValue: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [notificationsLoaded, setNotificationsLoaded] = useState(false);
    useEffect(() => {
        const loadNotifications = () => {
            notificationService.list()
                .then(result => {
                setNotifications(result.data ?? []);
                setNotificationsLoaded(true);
            })
                .catch(() => undefined);
        };
        window.addEventListener('floxa:notifications-updated', loadNotifications);
        return () => window.removeEventListener('floxa:notifications-updated', loadNotifications);
    }, []);
    useEffect(() => {
        if (!notifOpen || notificationsLoaded)
            return;
        notificationService.list()
            .then(result => {
            setNotifications(result.data ?? []);
            setNotificationsLoaded(true);
        })
            .catch(() => undefined);
    }, [notifOpen, notificationsLoaded]);
    async function markRead() {
        await notificationService.markAllRead();
        setNotifications(current => current.map(item => ({ ...item, read: true })));
    }
    async function createProject() {
        if (!form.name.trim())
            return;
        setSaving(true);
        setMessage('');
        try {
            const result = await projectService.create({
                ...form,
                sector: 'BRAND_IDENTITY',
                projectValue: Number(form.projectValue || 0),
                splitAdvancePct: 50,
                splitMidPct: 30,
                splitFinalPct: 20,
                freeRevisions: 2,
            });
            const url = result.data?.clientPortalUrl;
            if (url)
                await navigator.clipboard.writeText(url);
            setMessage(url ? 'Project created. Client link copied.' : 'Project created.');
            setForm({ name: '', clientEmail: '', projectValue: '' });
        }
        catch (caught) {
            setMessage(caught instanceof Error ? caught.message : 'Unable to create project.');
        }
        finally {
            setSaving(false);
        }
    }
    const unread = notifications.some(item => !item.read);
    return (<>
      <header style={{ padding: '12px 24px', borderBottom: '1px solid rgba(137,172,160,0.13)', background: 'rgba(2,8,6,0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 600 }}>Dashboard</div>
          <div style={{ fontSize: '12px', color: '#89ACA0' }}>{user?.name ?? 'Consultant'} · {user?.companyName ?? 'FLOXA'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(137,172,160,0.06)', border: '1px solid rgba(137,172,160,0.13)', cursor: 'pointer', color: '#89ACA0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🔔{unread && <span className="floxa-notif-pulse"/>}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-floxa btn-floxa-primary btn-floxa-sm" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(77,255,160,0.28)', background: 'rgba(77,255,160,0.1)', color: '#4DFFA0', borderRadius: '10px' }}>+ New project</button>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#1C342E,#89ACA0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#020806' }}>{user?.name?.charAt(0)?.toUpperCase() ?? 'A'}</div>
        </div>
      </header>

      {notifOpen && (<div style={{ position: 'fixed', right: '16px', top: '64px', width: '320px', zIndex: 200, background: 'rgba(4,12,8,0.97)', border: '1px solid rgba(137,172,160,0.2)', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(137,172,160,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Notifications</span>
            <span style={{ fontSize: '11px', color: '#4DFFA0', cursor: 'pointer' }} onClick={markRead}>Mark all read</span>
          </div>
          {notifications.length === 0 ? <div style={{ padding: '22px 18px', color: '#89ACA0', fontSize: '12px' }}>No notifications yet.</div> : notifications.map(item => (<div key={item.id} style={{ padding: '12px 18px', borderBottom: '1px solid rgba(137,172,160,0.06)' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: item.read ? 'transparent' : '#4DFFA0', marginTop: '5px', flexShrink: 0 }}/>
                <div><div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{item.title}</div><div style={{ fontSize: '11px', color: '#89ACA0', marginBottom: '3px' }}>{item.body}</div><div style={{ fontSize: '10px', color: 'rgba(137,172,160,0.5)' }}>{new Date(item.createdAt).toLocaleString('en-IN')}</div></div>
              </div>
            </div>))}
        </div>)}

      {showModal && (<div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div style={{ width: 'min(500px,92vw)', background: 'rgba(4,12,8,0.98)', border: '1px solid rgba(137,172,160,0.2)', borderRadius: '22px', padding: '30px' }} onClick={event => event.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>New project</div>
            <div style={{ fontSize: '12px', color: '#89ACA0', marginBottom: '22px' }}>Create a client project and copy the portal link</div>
            <input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="floxa-input" placeholder="Project name (e.g. Craft & Co — Brand Identity)" style={{ marginBottom: '12px' }}/>
            <input value={form.clientEmail} onChange={event => setForm(current => ({ ...current, clientEmail: event.target.value }))} className="floxa-input" type="email" placeholder="Client email" style={{ marginBottom: '12px' }}/>
            <input value={form.projectValue} onChange={event => setForm(current => ({ ...current, projectValue: event.target.value }))} className="floxa-input" type="number" placeholder="Project value (₹)" style={{ marginBottom: '12px' }}/>
            {message && <div style={{ color: message.includes('Unable') ? '#FF8080' : '#4DFFA0', fontSize: '12px', marginBottom: '12px' }}>{message}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', background: 'rgba(137,172,160,0.06)', border: '1px solid rgba(137,172,160,0.13)', borderRadius: '10px', color: '#89ACA0', cursor: 'pointer', fontFamily: 'var(--font-jost)' }}>Cancel</button>
              <button disabled={saving} onClick={createProject} style={{ flex: 2, padding: '11px', background: 'rgba(77,255,160,0.1)', border: '1px solid rgba(77,255,160,0.28)', borderRadius: '10px', color: '#4DFFA0', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-jost)' }}>{saving ? 'Creating...' : 'Create & copy link →'}</button>
            </div>
          </div>
        </div>)}
    </>);
}
