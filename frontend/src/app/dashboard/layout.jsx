// src/app/dashboard/layout.tsx
'use client';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
export default function DashboardLayout({ children }) {
    return (<ProtectedRoute>
      <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 1 }}>
        <DashboardSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: '240px' }}>
          <DashboardTopbar />
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>);
}
