'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote, BriefcaseBusiness, CalendarDays, CheckSquare, ChevronDown, FileBarChart,
  ChevronsLeft, ChevronsRight, CircleHelp, FolderKanban, LayoutDashboard,
  MessageSquare, Receipt, Settings, UserCheck, Users, Smartphone,
} from 'lucide-react';
import { ApiClient } from '@/lib/api';

type NavItem = { href: string; label: string; icon: React.ElementType; badgeKey?: 'approvals' | 'leaves' | 'messages' };

const workspaceItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/payroll', label: 'Cash flow', icon: Banknote },
];

const peopleItems: NavItem[] = [
  { href: '/employees', label: 'People', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: UserCheck },
  { href: '/leaves', label: 'Leave', icon: CalendarDays, badgeKey: 'leaves' },
  { href: '/chat', label: 'Messages', icon: MessageSquare, badgeKey: 'messages' },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(true);
  const [badges, setBadges] = useState<{ approvals: number; leaves: number; messages: number }>({
    approvals: 0,
    leaves: 0,
    messages: 0,
  });

  const fetchBadgeCounts = async () => {
    try {
      const [expensesRes, leavesRes, chatRes] = await Promise.allSettled([
        ApiClient.getExpenses(),
        ApiClient.getLeaves(),
        ApiClient.getChatUnreadCount(),
      ]);

      let approvalsCount = 0;
      if (expensesRes.status === 'fulfilled' && Array.isArray(expensesRes.value)) {
        approvalsCount = expensesRes.value.filter(
          (e: any) => String(e.status || '').toLowerCase() === 'pending'
        ).length;
      }

      let leavesCount = 0;
      if (leavesRes.status === 'fulfilled' && Array.isArray(leavesRes.value)) {
        leavesCount = leavesRes.value.filter(
          (l: any) => String(l.status || (l.isApproved || l.is_approved ? 'approved' : 'pending')).toLowerCase() === 'pending'
        ).length;
      }

      let messagesCount = 0;
      if (chatRes.status === 'fulfilled' && chatRes.value?.unreadCount != null) {
        messagesCount = Number(chatRes.value.unreadCount) || 0;
      }

      setBadges({ approvals: approvalsCount, leaves: leavesCount, messages: messagesCount });
    } catch {
      // ignore badge fetch failures gracefully
    }
  };

  useEffect(() => {
    try { setCollapsed(localStorage.getItem('gw_sidebar_collapsed') === 'true'); } catch {}
    void fetchBadgeCounts();
    const interval = setInterval(() => { void fetchBadgeCounts(); }, 30000);
    const unsubscribe = ApiClient.subscribeToDataRefresh(() => { void fetchBadgeCounts(); });
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const nextValue = !value;
      try { localStorage.setItem('gw_sidebar_collapsed', String(nextValue)); } catch {}
      return nextValue;
    });
  };

  const isCurrent = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  const transactionsActive = isCurrent('/expenses') || isCurrent('/approvals');

  const renderBadge = (count: number, isCollapsed = false) => {
    if (count <= 0) return null;
    if (isCollapsed) {
      return (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-xs">
          {count > 99 ? '99+' : count}
        </span>
      );
    }
    return (
      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-xs">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const navigationLink = (item: NavItem) => {
    const Icon = item.icon;
    const active = isCurrent(item.href);
    const count = item.badgeKey ? badges[item.badgeKey] : 0;

    return (
      <Link key={item.href} href={item.href} prefetch title={collapsed ? item.label : undefined}
        className={`group relative flex h-9 items-center rounded-lg transition-colors ${collapsed ? 'justify-center px-0' : 'gap-3 px-2.5'} ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
        <div className="relative flex items-center justify-center">
          <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'} />
          {collapsed && renderBadge(count, true)}
        </div>
        {!collapsed && (
          <>
            <span className="truncate text-[13px] font-medium">{item.label}</span>
            {renderBadge(count, false)}
          </>
        )}
      </Link>
    );
  };

  const section = (label: string, items: NavItem[]) => (
    <section className="space-y-1">
      {!collapsed && <p className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">{label}</p>}
      <nav className="space-y-0.5" aria-label={label}>{items.map(navigationLink)}</nav>
    </section>
  );

  return (
    <aside className={`${collapsed ? 'w-[68px] min-w-[68px] px-2' : 'w-60 min-w-60 px-3'} sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white py-2.5 text-slate-900 transition-[width,padding] duration-200`}>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        <div className={`mb-4 flex h-11 items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-1.5'}`}>
          <Image src="/logo.png" alt="Geospatial Works" width={42} height={42} className="h-10 w-10 shrink-0 object-contain" priority />
          {!collapsed && <div className="min-w-0 leading-tight"><p className="truncate text-sm font-semibold tracking-tight text-slate-900">Geospatial Works</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Operations</p></div>}
        </div>

        <div className="space-y-4">
          {section('Workspace', workspaceItems)}

          <section className="space-y-1">
            {!collapsed && <p className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Finance</p>}
            {collapsed ? (
              <div className="relative">
                <Link href="/expenses" prefetch title="Transactions" className={`flex h-9 items-center justify-center rounded-lg transition-colors ${transactionsActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Receipt size={17} strokeWidth={transactionsActive ? 2.2 : 1.8} />
                </Link>
                {renderBadge(badges.approvals, true)}
              </div>
            ) : (
              <div className="space-y-1">
                <button type="button" onClick={() => setTransactionsOpen((value) => !value)} className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-[13px] font-medium transition-colors ${transactionsActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`} aria-expanded={transactionsOpen}>
                  <span className="flex items-center gap-3">
                    <Receipt size={17} strokeWidth={transactionsActive ? 2.2 : 1.8} />
                    <span>Transactions</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {badges.approvals > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                        {badges.approvals > 99 ? '99+' : badges.approvals}
                      </span>
                    )}
                    <ChevronDown size={15} className={`text-slate-400 transition-transform ${transactionsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {transactionsOpen && <div className="ml-[18px] space-y-0.5 border-l border-slate-200 pl-3">
                  {[
                    { href: '/expenses', label: 'Activity' },
                    { href: '/approvals', label: 'Approvals', count: badges.approvals },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} prefetch className={`flex h-7 items-center justify-between rounded-md px-2 text-xs transition-colors ${pathname === item.href ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                      <span>{item.label}</span>
                      {Boolean(item.count && item.count > 0) && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                          {item.count! > 99 ? '99+' : item.count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>}
              </div>
            )}
          </section>

          {section('Team', peopleItems)}
          <section className="border-t border-slate-100 pt-3"><nav className="space-y-0.5" aria-label="Administration">{navigationLink({ href: '/clients', label: 'Clients', icon: BriefcaseBusiness })}{navigationLink({ href: '/app-releases', label: 'Mobile App', icon: Smartphone })}{navigationLink({ href: '/settings', label: 'Settings', icon: Settings })}</nav></section>
        </div>
      </div>

      <div className="mt-2 border-t border-slate-100 pt-2">
        {!collapsed && <div className="mb-1 flex items-center gap-2.5 px-2.5 py-1"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">GW</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-slate-700">GW Admin</p><p className="text-[11px] text-slate-400">Administrator</p></div><CircleHelp size={16} className="text-slate-400" aria-label="Help" /></div>}
        <button type="button" onClick={toggleCollapsed} className={`flex h-9 w-full items-center rounded-lg text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 ${collapsed ? 'justify-center' : 'gap-2.5 px-2.5'}`} title={collapsed ? 'Expand menu' : 'Collapse menu'} aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}>
          {collapsed ? <ChevronsRight size={17} /> : <><ChevronsLeft size={17} /><span>Collapse menu</span></>}
        </button>
      </div>
    </aside>
  );
};

