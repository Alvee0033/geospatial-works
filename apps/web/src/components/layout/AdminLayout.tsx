'use client';

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopNav } from './AdminTopNav';

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
    </div>
  );
};
