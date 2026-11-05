'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Receipt,
  Calendar,
  AlertTriangle,
  Info,
  ChevronRight,
  Filter,
  UserPlus,
  X,
  Trash2,
} from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

export interface NotificationItem {
  id: string;
  userId?: string;
  actorId?: string | null;
  actorName?: string | null;
  actorAvatarUrl?: string | null;
  title: string;
  message: string;
  fullExplanation?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedProjectId?: string | null;
  relatedExpenseId?: string | null;
}

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [desktopPermission, setDesktopPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const panelRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Check desktop notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopPermission(Notification.permission);
    }
  }, []);

  const requestDesktopPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setDesktopPermission(res);
      } catch (err) {
        console.error('Failed to request desktop notification permission', err);
      }
    }
  };

  // Fetch notifications
  const loadNotifications = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await ApiClient.getNotifications({ bypassCache: true });
      if (Array.isArray(data)) {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Check for newly arrived unread notifications to trigger native Desktop OS push
        if (
          !isFirstLoadRef.current &&
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          for (const item of sorted) {
            if (!item.isRead && !seenIdsRef.current.has(item.id)) {
              try {
                const desktopNotif = new Notification(item.title, {
                  body: item.message || item.fullExplanation || 'New update in Geospatial Works',
                  icon: '/favicon.ico',
                });
                desktopNotif.onclick = () => {
                  window.focus();
                  const meta = getTypeMeta(item);
                  if (meta?.link) {
                    window.location.href = meta.link;
                  }
                };
              } catch (e) {
                console.error('Failed to display desktop notification:', e);
              }
            }
          }
        }

        const newSeen = new Set<string>();
        for (const item of sorted) {
          newSeen.add(item.id);
        }
        seenIdsRef.current = newSeen;
        isFirstLoadRef.current = false;
        setNotifications(sorted);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(false);

    let eventSource: EventSource | null = null;
    let reconnectTimer: any = null;
    let isDestroyed = false;

    const connectSSE = () => {
      if (isDestroyed || typeof window === 'undefined') return;
      try {
        const streamUrl = ApiClient.getNotificationStreamUrl();
        const token = ApiClient.getToken();
        if (!token) return;

        eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (!payload || payload.type === 'ping') return;

            const item: NotificationItem = {
              id: payload.id || `notif_${Date.now()}`,
              userId: payload.userId,
              actorId: payload.actorId,
              actorName: payload.actorName,
              actorAvatarUrl: payload.actorAvatarUrl,
              title: payload.title || 'New Notification',
              message: payload.message || '',
              fullExplanation: payload.fullExplanation || payload.message,
              type: payload.type || 'info',
              isRead: Boolean(payload.isRead),
              createdAt: payload.createdAt || new Date().toISOString(),
              relatedProjectId: payload.relatedProjectId,
              relatedExpenseId: payload.relatedExpenseId,
            };

            // Avoid duplicate processing if already seen
            if (seenIdsRef.current.has(item.id)) return;
            seenIdsRef.current.add(item.id);

            // Fire native Desktop OS push notification if granted
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                const desktopNotif = new Notification(item.title, {
                  body: item.message || item.fullExplanation || 'New update in Geospatial Works',
                  icon: '/favicon.ico',
                });
                desktopNotif.onclick = () => {
                  window.focus();
                  const meta = getTypeMeta(item);
                  if (meta?.link) {
                    window.location.href = meta.link;
                  }
                };
              } catch (e) {
                console.error('Failed to display desktop notification:', e);
              }
            }

            // Instantly prepend new notification with zero latency
            setNotifications((prev) => [item, ...prev.filter((n) => n.id !== item.id)]);

            // Dispatch global event so dashboards update counts
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('gw-api-data-refreshed', {
                  detail: { endpoint: '/notifications', item },
                })
              );
            }
          } catch (parseErr) {
            console.error('Failed to parse SSE notification payload:', parseErr);
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!isDestroyed) {
            reconnectTimer = setTimeout(connectSSE, 3000);
          }
        };
      } catch (err) {
        console.error('Error establishing notification SSE connection:', err);
        if (!isDestroyed) {
          reconnectTimer = setTimeout(connectSSE, 5000);
        }
      }
    };

    connectSSE();

    // Fast fallback silent poll every 4 seconds in background
    const interval = setInterval(() => {
      loadNotifications(true);
    }, 4000);

    // Fast refresh on window focus and tab visibility change
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadNotifications(true);
      }
    };
    const handleFocus = () => loadNotifications(true);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Subscribe to internal data refresh events
    const unsubRefresh = ApiClient.subscribeToDataRefresh?.(() => {
      loadNotifications(true);
    });

    return () => {
      isDestroyed = true;
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (unsubRefresh) unsubRefresh();
    };
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await ApiClient.markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await ApiClient.markAllNotificationsRead(unreadIds);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await ApiClient.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      loadNotifications(); // revert on error
    }
  };

  const handleDeleteAll = async () => {
    setNotifications([]);
    try {
      await ApiClient.deleteAllNotifications();
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
      loadNotifications();
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getTypeMeta = (notif: NotificationItem) => {
    switch (notif.type) {
      case 'expense_submitted':
      case 'expense_pending':
        return {
          icon: <Receipt size={14} className="text-amber-600" />,
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          link: '/approvals',
          linkText: 'Review in Approvals',
        };
      case 'expense_approved':
        return {
          icon: <Check size={14} className="text-emerald-600" />,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          link: '/expenses',
          linkText: 'View Expenses',
        };
      case 'attendance_reminder':
        return {
          icon: <Clock size={14} className="text-sky-600" />,
          badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
          link: '/attendance',
          linkText: 'Open Attendance',
        };
      case 'attendance_late':
      case 'attendance_early':
        return {
          icon: <AlertTriangle size={14} className="text-rose-600" />,
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          link: '/leaves/early-departures',
          linkText: 'View Anomaly',
        };
      case 'employee_registration':
      case 'user_registration':
        return {
          icon: <UserPlus size={14} className="text-blue-600" />,
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          link: '/employees?filter=pending',
          linkText: 'Review & Approve',
        };
      case 'account_approved':
        return {
          icon: <Check size={14} className="text-emerald-600" />,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          link: '/employees',
          linkText: 'View Employees',
        };
      default:
        return {
          icon: <Info size={14} className="text-slate-600" />,
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
          link: '/dashboard',
          linkText: 'Open Dashboard',
        };
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        title="Notifications"
        aria-label="Open notifications panel"
        className={`relative rounded-md p-2 transition-colors ${
          isOpen
            ? 'bg-amber-100 text-amber-900'
            : 'text-amber-600 hover:bg-amber-50'
        }`}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
                  title="Delete all notifications"
                >
                  <Trash2 size={12} />
                  <span>Clear all</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Push Banner (if permission is default) */}
          {desktopPermission === 'default' && (
            <div className="px-3.5 py-2 bg-linear-to-r from-amber-50 to-orange-50 border-b border-amber-200/70 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                <Bell size={13} className="text-amber-600 shrink-0" />
                <span className="text-[11px] font-semibold truncate">Enable desktop push notifications</span>
              </div>
              <button
                type="button"
                onClick={requestDesktopPermission}
                className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                Enable
              </button>
            </div>
          )}

          {/* Subheader Filters */}
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs bg-white">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filter === 'unread'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <button
              onClick={() => loadNotifications(false)}
              disabled={loading}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[460px]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Bell size={18} />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filter === 'unread'
                    ? 'You have caught up with all alerts!'
                    : 'New alerts and workflow actions will appear here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const meta = getTypeMeta(notif);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative hover:bg-slate-50 ${
                      notif.isRead ? 'bg-white' : 'bg-amber-50/20'
                    }`}
                  >
                    {!notif.isRead && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}

                    <div className="shrink-0 mt-0.5">
                      {notif.actorName ? (
                        <UserAvatar
                          src={notif.actorAvatarUrl || undefined}
                          name={notif.actorName}
                          size="sm"
                          shape="circle"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-2xs">
                          {meta.icon}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-semibold text-slate-400">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                          <button
                            onClick={(e) => handleDeleteNotification(notif.id, e)}
                            className="p-0.5 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Delete notification"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message || notif.fullExplanation}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Link
                          href={meta.link}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2 py-0.5 rounded-md transition-colors"
                        >
                          <span>{meta.linkText}</span>
                          <ChevronRight size={11} />
                        </Link>

                        {!notif.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center flex items-center justify-between px-4">
            <span className="text-[10px] text-slate-400 font-semibold">
              Live Gateway Sync Active
            </span>
            <Link
              href="/approvals"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-slate-700 hover:text-slate-900"
            >
              Approvals Center &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
