'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote, BriefcaseBusiness, CalendarDays, CheckSquare, ChevronDown, FileBarChart,
  ChevronsLeft, ChevronsRight, CircleHelp, FolderKanban, LayoutDashboard,
  MessageSquare, Receipt, Settings, UserCheck, Users,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: React.ElementType };

const workspaceItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
];

const peopleItems: NavItem[] = [
  { href: '/employees', label: 'People', icon: Users },
  { href: '/leaves', label: 'Leave', icon: CalendarDays },
  { href: '/chat', label: 'Messages', icon: MessageSquare },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(true);
  const [attendanceOpen, setAttendanceOpen] = useState(pathname.startsWith('/attendance'));
  const [payrollOpen, setPayrollOpen] = useState(pathname.startsWith('/payroll'));

  useEffect(() => {
    try { setCollapsed(localStorage.getItem('gw_sidebar_collapsed') === 'true'); } catch {}
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
  const attendanceActive = isCurrent('/attendance');
  const payrollActive = isCurrent('/payroll');

  const navigationLink = (item: NavItem) => {
    const Icon = item.icon;
    const active = isCurrent(item.href);
    return (
      <Link key={item.href} href={item.href} prefetch title={collapsed ? item.label : undefined}
        className={`group flex h-9 items-center rounded-lg transition-colors ${collapsed ? 'justify-center px-0' : 'gap-3 px-2.5'} ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'} />
        {!collapsed && <span className="truncate text-[13px] font-medium">{item.label}</span>}
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
              <Link href="/expenses" prefetch title="Transactions" className={`flex h-9 items-center justify-center rounded-lg transition-colors ${transactionsActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}><Receipt size={17} strokeWidth={transactionsActive ? 2.2 : 1.8} /></Link>
            ) : (
              <div className="space-y-1">
                <button type="button" onClick={() => setTransactionsOpen((value) => !value)} className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-[13px] font-medium transition-colors ${transactionsActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`} aria-expanded={transactionsOpen}>
                  <span className="flex items-center gap-3"><Receipt size={17} strokeWidth={transactionsActive ? 2.2 : 1.8} /><span>Transactions</span></span>
                  <ChevronDown size={15} className={`text-slate-400 transition-transform ${transactionsOpen ? 'rotate-180' : ''}`} />
                </button>
                {transactionsOpen && <div className="ml-[18px] space-y-0.5 border-l border-slate-200 pl-3">
                  {[{ href: '/expenses', label: 'Activity' }, { href: '/approvals', label: 'Approvals' }, { href: '/expenses/compliance', label: 'Voucher audit' }].map((item) => (
                    <Link key={item.href} href={item.href} prefetch className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${pathname === item.href ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>{item.label}</Link>
                  ))}
                </div>}
              </div>
            )}
          </section>

          <section className="space-y-1">
            {collapsed ? <Link href="/payroll" prefetch title="Payroll" className={`flex h-9 items-center justify-center rounded-lg transition-colors ${payrollActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}><Banknote size={17}/></Link> : <div className="space-y-0.5"><button type="button" onClick={() => setPayrollOpen((value) => !value)} className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-[13px] font-medium transition-colors ${payrollActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`} aria-expanded={payrollOpen}><span className="flex items-center gap-3"><Banknote size={17}/><span>Payroll</span></span><ChevronDown size={15} className={`text-slate-400 transition-transform ${payrollOpen ? 'rotate-180' : ''}`}/></button>{payrollOpen && <div className="ml-[18px] space-y-0.5 border-l border-slate-200 pl-3">{[{href:'/payroll',label:'Payroll overview'},{href:'/settings?tab=payroll',label:'Salary settings'},{href:'/settings?tab=schedule',label:'Holidays & schedule'}].map((item)=><Link key={item.href} href={item.href} prefetch className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${pathname === item.href.split('?')[0] ? 'text-indigo-700 hover:bg-indigo-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>{item.label}</Link>)}</div>}</div>}
          </section>

          <section className="space-y-1">
            {!collapsed && <p className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Team</p>}
            {collapsed ? <Link href="/attendance" prefetch title="Attendance" className={`flex h-9 items-center justify-center rounded-lg transition-colors ${attendanceActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}><UserCheck size={17}/></Link> : <div className="space-y-0.5"><button type="button" onClick={() => setAttendanceOpen((value) => !value)} className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-[13px] font-medium transition-colors ${attendanceActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`} aria-expanded={attendanceOpen}><span className="flex items-center gap-3"><UserCheck size={17}/><span>Attendance</span></span><ChevronDown size={15} className={`text-slate-400 transition-transform ${attendanceOpen ? 'rotate-180' : ''}`}/></button>{attendanceOpen && <div className="ml-[18px] space-y-0.5 border-l border-slate-200 pl-3">{[{href:'/attendance',label:'Team attendance'},{href:'/attendance/map',label:'Live locations'},{href:'/settings?tab=schedule',label:'Shift settings'}].map((item)=><Link key={item.href} href={item.href} prefetch className={`flex h-7 items-center rounded-md px-2 text-xs transition-colors ${pathname === item.href.split('?')[0] ? 'text-indigo-700 hover:bg-indigo-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>{item.label}</Link>)}</div>}</div>}
            {!collapsed && <nav className="space-y-0.5">{peopleItems.map(navigationLink)}</nav>}
          </section>
          <section className="border-t border-slate-100 pt-3"><nav className="space-y-0.5" aria-label="Administration">{navigationLink({ href: '/clients', label: 'Clients', icon: BriefcaseBusiness })}{navigationLink({ href: '/settings', label: 'Settings', icon: Settings })}</nav></section>
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
