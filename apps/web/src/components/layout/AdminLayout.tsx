'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopNav } from './AdminTopNav';
import { ActionFeedbackHost } from '@/components/feedback/ActionFeedback';
import { ApiClient } from '@/lib/api';
import { canAccessRouteForRole } from '@/lib/roleAccess';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
  contentClassName?: string;
  noScroll?: boolean;
  hideTopNav?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title = 'Geospatial Works Admin',
  subtitle,
  onRefresh,
  onExport,
  isRefreshing,
  contentClassName,
  noScroll = false,
  hideTopNav = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setAuthChecked(false);
    if (!ApiClient.getToken()) {
      router.replace('/login');
      return;
    }
    let role: string | undefined;
    try { role = JSON.parse(localStorage.getItem('gw_user') || 'null')?.role; } catch {}
    if (!canAccessRouteForRole(role, pathname)) {
      router.replace('/dashboard');
      return;
    }
    setAuthChecked(true);
  }, [pathname, router]);

  if (!authChecked) {
    return <div className="min-h-screen bg-[#F7F8F6]" aria-label="Checking session" />;
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8F6] text-slate-900 font-sans">
      <AdminSidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 max-h-screen ${
          noScroll ? 'overflow-y-auto xl:overflow-hidden h-screen' : 'overflow-y-auto'
        }`}
      >
        {!hideTopNav && (
          <AdminTopNav
            title={title}
            subtitle={subtitle}
            onRefresh={onRefresh}
            onExport={onExport}
            isRefreshing={isRefreshing}
          />
        )}
        <main className={`flex-1 ${contentClassName || 'px-8 pb-12'}`}>{children}</main>
      </div>
      <ActionFeedbackHost />
    </div>
  );
};
