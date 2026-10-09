"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PenTool, 
  MessageSquare, 
  Users, 
  FileText, 
  Bot,
  Settings as SettingsIcon,
  Menu, 
  X, 
  LogOut,
  Globe,
  ChevronRight
} from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isFullWidthPage = pathname === '/admin/support';

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Page Editor', href: '/admin/pages', icon: PenTool },
    { name: 'Support Inbox', href: '/admin/support', icon: MessageSquare },
    { name: 'Leads & Inquiries', href: '/admin/leads', icon: Users },
    { name: 'Blog Manager', href: '/admin/blog', icon: FileText },
    { name: 'AI Assistant', href: '/admin/ai-settings', icon: Bot },
    { name: 'Settings & Contact', href: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-x-hidden text-gray-900 font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-30 shadow-xs sticky top-0">
        <Link href="/admin" className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
          <span className="text-base font-bold text-gray-900 tracking-tight">Geospatial Works</span>
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen z-50 bg-white border-r border-gray-200 w-64 flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Logo Header */}
        <div className="p-5 hidden md:flex items-center space-x-3 border-b border-gray-100">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 tracking-tight leading-tight">Geospatial Works</span>
            <span className="text-[11px] text-gray-500 font-medium">Admin Panel</span>
          </div>
        </div>
        
        {/* Navigation Section */}
        <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group
                  ${isActive 
                    ? 'bg-gray-900 text-white shadow-xs' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'} transition-colors`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-gray-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <Link 
            href="/" 
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Globe size={16} className="text-gray-400" />
              <span>View Live Website</span>
            </div>
          </Link>

          <Link href="/" className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut size={16} />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen w-full min-w-0">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-2xs">
          <div className="text-xs text-gray-500 font-medium">
            Management Portal
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-xs border border-gray-200">
              GW
            </div>
            <div className="text-xs font-semibold text-gray-800">Admin Account</div>
          </div>
        </header>

        {/* Page Content - Full Bleed Width without Side Gaps */}
        <div className={`flex-1 bg-gray-50/80 ${isFullWidthPage ? 'p-0' : 'p-4 md:p-8'}`}>
          <div className={`w-full ${isFullWidthPage ? 'h-full' : 'max-w-[1600px] mx-auto'}`}>
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}

export default AdminLayout;
