'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Facebook,
  MessageCircle,
  RefreshCw,
  Send,
  Search,
  Smartphone,
  Mail,
  Settings2,
  ArrowUpRight,
} from 'lucide-react';
import { Button, Badge, PageHeader } from './ui';
import { InboxConnectionsPanel, InboxConfiguration } from './InboxConnectionsPanel';

type Channel = 'WHATSAPP' | 'MESSENGER' | 'GMAIL';
type Conversation = {
  id: string;
  channel: Channel;
  participantId: string;
  participantName?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  lastInboundAt?: string | null;
  unreadCount: number;
};
type Message = { id: string; channel: Channel; text: string; fromBusiness: boolean; sentAt: string };
type Config = InboxConfiguration & { callbackPath: string };

interface InboxViewProps {
  getAuthHeaders: () => Record<string, string>;
  triggerFeedback?: (message: string, type?: 'success' | 'error') => void;
  canManageConnections?: boolean;
}

const API = '/api/inbox/admin';

function relativeTime(value?: string | null) {
  if (!value) return 'New';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const ms = Date.now() - date.getTime();
  if (ms < 60_000) return 'Now';
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

const CHANNEL_STYLE: Record<
  Channel,
  { label: string; bg: string; text: string; border: string; bubble: string }
> = {
  WHATSAPP: {
    label: 'WhatsApp',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    bubble: 'bg-emerald-600 text-white',
  },
  MESSENGER: {
    label: 'Messenger',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    bubble: 'bg-blue-600 text-white',
  },
  GMAIL: {
    label: 'Gmail',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    bubble: 'bg-rose-600 text-white',
  },
};

function ChannelIcon({ channel, size = 15 }: { channel: Channel; size?: number }) {
  if (channel === 'WHATSAPP') return <Smartphone size={size} />;
  if (channel === 'MESSENGER') return <Facebook size={size} />;
  return <Mail size={size} />;
}

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || 'Could not complete the request.');
  return payload as T;
}

export function InboxView({ getAuthHeaders, triggerFeedback, canManageConnections = false }: InboxViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | Channel>('ALL');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [autoReplyModalOpen, setAutoReplyModalOpen] = useState(false);
  const [autoReplyDraft, setAutoReplyDraft] = useState('');
  const [savingAutoReply, setSavingAutoReply] = useState(false);

  const requestOptions = useCallback(
    () => ({ headers: getAuthHeaders(), cache: 'no-store' as RequestCache }),
    [getAuthHeaders]
  );

  const refresh = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const [threads, status] = await Promise.all([
          jsonRequest<Conversation[]>(`${API}/conversations`, requestOptions()),
          jsonRequest<Config>(`${API}/config`, requestOptions()),
        ]);
        setConversations(threads);
        setConfig(status);
        setError('');
        setSelectedId((current) =>
          current && threads.some((item) => item.id === current) ? current : threads[0]?.id || ''
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load messages.');
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [requestOptions]
  );

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(true), 30_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const selected = conversations.find((item) => item.id === selectedId) || null;

  const loadThread = useCallback(
    async (conversationId: string) => {
      setThreadLoading(true);
      try {
        const items = await jsonRequest<Message[]>(
          `${API}/conversations/${conversationId}/messages`,
          requestOptions()
        );
        setMessages(items);
        setConversations((current) =>
          current.map((item) => (item.id === conversationId ? { ...item, unreadCount: 0 } : item))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load this conversation.');
        setMessages([]);
      } finally {
        setThreadLoading(false);
      }
    },
    [requestOptions]
  );

  useEffect(() => {
    if (selectedId) void loadThread(selectedId);
    else setMessages([]);
  }, [selectedId, loadThread]);

  const filtered = useMemo(
    () =>
      conversations.filter((item) => {
        const matchesChannel = filter === 'ALL' || item.channel === filter;
        const text = `${item.participantName || ''} ${item.participantId} ${item.lastMessagePreview || ''}`.toLowerCase();
        return matchesChannel && text.includes(query.toLowerCase());
      }),
    [conversations, filter, query]
  );

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!selected || !text || sending) return;
    setSending(true);
    setError('');
    try {
      const sent = await jsonRequest<Message>(`${API}/conversations/${selected.id}/reply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text }),
      });
      setMessages((items) => [...items, sent]);
      setDraft('');
      setConversations((items) =>
        items.map((item) =>
          item.id === selected.id ? { ...item, lastMessagePreview: text, lastMessageAt: sent.sentAt } : item
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send this message.';
      setError(message);
      triggerFeedback?.(message, 'error');
    } finally {
      setSending(false);
    }
  }

  const windowOpen =
    selected?.channel === 'GMAIL' ||
    (selected?.lastInboundAt
      ? Date.now() - new Date(selected.lastInboundAt).getTime() < 24 * 60 * 60 * 1000
      : false);
  const connectedCount =
    Number(Boolean(config?.whatsapp)) +
    Number(Boolean(config?.messenger)) +
    Number(Boolean(config?.gmail?.connected));

  return (
    <section className="flex flex-col gap-3 h-[calc(100vh-8.5rem)] min-h-[600px]">
      <PageHeader
        title="Messages"
        description="Unified inbox for WhatsApp, Messenger, and Gmail"
        className="pb-3!"
        actions={<div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => void refresh()} loading={loading} icon={<RefreshCw size={13} />}>Refresh</Button>
          <Button variant="secondary" size="sm" onClick={() => setChannelsOpen((open) => !open)} icon={<Settings2 size={14} />}>
            {channelsOpen ? 'Close settings' : 'Connection settings'}
          </Button>
        </div>}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-600">
          <span className="font-bold text-[#102d55]">Connected {connectedCount}/3</span>
          {([
            ['WhatsApp', config?.whatsapp],
            ['Messenger', config?.messenger],
            ['Gmail', config?.gmail?.connected],
          ] as const).map(([name, connected]) => (
            <span key={name} className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {canManageConnections && (
            <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
              <button
                type="button"
                disabled={savingAutoReply}
                onClick={async () => {
                  setSavingAutoReply(true);
                  try {
                    const nextVal = !config?.autoReplyEnabled;
                    const updated = await jsonRequest<Config>(`${API}/setup`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                      body: JSON.stringify({ autoReplyEnabled: nextVal }),
                    });
                    setConfig(updated);
                    triggerFeedback?.(`Auto-reply ${nextVal ? 'enabled' : 'disabled'}.`, 'success');
                  } catch (err) {
                    triggerFeedback?.(err instanceof Error ? err.message : 'Could not update auto-reply.', 'error');
                  } finally {
                    setSavingAutoReply(false);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                  config?.autoReplyEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${config?.autoReplyEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>Auto-Reply: {config?.autoReplyEnabled ? 'ON' : 'OFF'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoReplyDraft(config?.autoReplyMessage || 'Thank you for contacting Geospatial Works. Our team has received your message and will reply shortly.');
                  setAutoReplyModalOpen(true);
                }}
                className="text-[11px] font-semibold text-slate-600 hover:text-indigo-700 cursor-pointer"
              >
                Configure
              </button>
            </div>
          )}
          <button type="button" onClick={() => setChannelsOpen((open) => !open)} className="text-[11px] font-bold text-[#143c78] hover:text-[#e62934] cursor-pointer">
            {channelsOpen ? 'Hide settings' : 'Manage connections'}
          </button>
        </div>
      </div>

      {channelsOpen && (
        <InboxConnectionsPanel
          config={config}
          getAuthHeaders={getAuthHeaders}
          onRefresh={() => refresh(true)}
          onClose={() => setChannelsOpen(false)}
          canManageConnections={canManageConnections}
        />
      )}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-800 shrink-0">
          {error}
        </div>
      )}

      {/* Maximum-Space Split Message Box */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        {/* Conversation List */}
        <aside className={`${selected ? 'hidden lg:flex' : 'flex'} min-h-0 flex-col border-r border-slate-200`}>
          <div className="p-2.5 space-y-2 border-b border-slate-100 shrink-0">
            <label className="relative block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:border-indigo-500 focus:bg-white"
              />
            </label>
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-0.5 rounded-lg">
              {(
                [
                  { id: 'ALL', label: 'All' },
                  { id: 'WHATSAPP', label: 'WA' },
                  { id: 'MESSENGER', label: 'FB' },
                  { id: 'GMAIL', label: 'Mail' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    filter === tab.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className="h-14 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : filtered.length ? (
              filtered.map((item) => {
                const st = CHANNEL_STYLE[item.channel];
                const isActive = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full px-3 py-2.5 text-left transition hover:bg-slate-50 cursor-pointer flex items-center gap-2.5 ${
                      isActive ? 'bg-indigo-50/70 border-l-2 border-l-indigo-600' : ''
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${st.bg} ${st.text}`}>
                      <ChannelIcon channel={item.channel} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {item.participantName || item.participantId}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{relativeTime(item.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <span className="text-[11px] text-slate-500 truncate">
                          {item.lastMessagePreview || 'New conversation'}
                        </span>
                        {item.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-12 text-center text-xs text-slate-500">
                {conversations.length ? 'No matching conversations.' : 'No messages yet.'}
              </div>
            )}
          </div>
        </aside>

        {/* Active Message Thread */}
        <section className={`${selected ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 flex-col bg-slate-50/60`}>
          {selected ? (
            <>
              <header className="px-4 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId('')}
                    className="text-xs font-semibold text-indigo-600 lg:hidden cursor-pointer"
                  >
                    Back
                  </button>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${CHANNEL_STYLE[selected.channel].bg} ${CHANNEL_STYLE[selected.channel].text}`}
                  >
                    <ChannelIcon channel={selected.channel} size={15} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {selected.participantName || selected.participantId}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">{selected.participantId}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    selected.channel === 'WHATSAPP'
                      ? 'success'
                      : selected.channel === 'MESSENGER'
                      ? 'brand'
                      : 'danger'
                  }
                >
                  {CHANNEL_STYLE[selected.channel].label}
                </Badge>
              </header>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
                {threadLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((n) => (
                      <div key={n} className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-200" />
                    ))}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.fromBusiness ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-2xs ${
                          message.fromBusiness
                            ? `${CHANNEL_STYLE[selected.channel].bubble} rounded-br-sm`
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}
                      >
                        <div className="space-y-1.5 text-xs leading-relaxed">
                          {message.text.split('\n').map((line, li) => {
                            const imgMatch = line.match(/^\[\[IMG:(.+?)\]\]$/);
                            if (imgMatch) {
                              return (
                                <a key={li} href={imgMatch[1]} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-black/10">
                                  <img src={imgMatch[1]} alt="Attachment" className="max-h-60 w-auto rounded-xl object-cover" />
                                </a>
                              );
                            }
                            const fileMatch = line.match(/^\[\[FILE:(.+?)\|(.+?)\]\]$/);
                            if (fileMatch) {
                              return (
                                <a
                                  key={li}
                                  href={fileMatch[2]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border ${
                                    message.fromBusiness
                                      ? 'border-white/25 bg-white/15 text-white hover:bg-white/25'
                                      : 'border-slate-200 bg-slate-50 text-indigo-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>📎 {fileMatch[1]}</span>
                                  <ArrowUpRight size={12} />
                                </a>
                              );
                            }
                            return (
                              <p key={li} className="whitespace-pre-wrap break-words">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                        <time
                          className={`mt-1 block text-right text-[10px] ${
                            message.fromBusiness ? 'text-white/75' : 'text-slate-400'
                          }`}
                        >
                          {new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(
                            new Date(message.sentAt)
                          )}
                        </time>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-3 shrink-0 space-y-2">
                {!windowOpen && (
                  <p className="rounded-lg bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 text-[11px] text-amber-800">
                    Older than 24h — Messenger replies will attempt delivery using Human Agent / standard messaging.
                  </p>
                )}
                <form onSubmit={send} className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void send(e as unknown as FormEvent);
                      }
                    }}
                    rows={2}
                    maxLength={4000}
                    placeholder="Write a reply... (Enter to send)"
                    className="flex-1 min-h-[44px] max-h-32 resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <Button type="submit" disabled={!draft.trim()} loading={sending} icon={<Send size={14} />}>
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="m-auto text-center px-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-2xs">
                <MessageCircle size={20} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">Select a conversation</p>
              <p className="mt-1 text-xs text-slate-500">Choose a message on the left to read and reply.</p>
            </div>
          )}
        </section>
      </div>
      {autoReplyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAutoReplyModalOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-xs">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configure Auto-Reply</h3>
                <p className="text-[11px] text-slate-500">Sent automatically when a new message arrives</p>
              </div>
              <button type="button" onClick={() => setAutoReplyModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-[11px] font-semibold text-slate-600">Auto-Reply Message</label>
              <textarea
                rows={4}
                value={autoReplyDraft}
                onChange={(e) => setAutoReplyDraft(e.target.value)}
                placeholder="Thank you for messaging us..."
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="border-t border-slate-200 px-4 py-2.5 bg-slate-50 flex justify-end gap-2">
              <button type="button" onClick={() => setAutoReplyModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                disabled={savingAutoReply || !autoReplyDraft.trim()}
                onClick={async () => {
                  setSavingAutoReply(true);
                  try {
                    const updated = await jsonRequest<Config>(`${API}/setup`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                      body: JSON.stringify({ autoReplyEnabled: true, autoReplyMessage: autoReplyDraft.trim() }),
                    });
                    setConfig(updated);
                    setAutoReplyModalOpen(false);
                    triggerFeedback?.('Auto-reply message saved & enabled.', 'success');
                  } catch (err) {
                    triggerFeedback?.(err instanceof Error ? err.message : 'Could not save auto-reply.', 'error');
                  } finally {
                    setSavingAutoReply(false);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-[#143c78] hover:bg-[#0a2d5d] text-white font-semibold cursor-pointer disabled:opacity-50"
              >
                {savingAutoReply ? 'Saving…' : 'Save & Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
