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
  ArrowUpRight,
  CircleCheck,
  ChevronDown,
  ChevronUp,
  PlugZap,
} from 'lucide-react';
import { Button, Badge, PageHeader } from './ui';

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
type Config = {
  whatsapp: boolean;
  messenger: boolean;
  gmail: { configured: boolean; connected: boolean; email: string | null };
  callbackPath: string;
};

interface InboxViewProps {
  getAuthHeaders: () => Record<string, string>;
  triggerFeedback?: (message: string, type?: 'success' | 'error') => void;
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

export function InboxView({ getAuthHeaders, triggerFeedback }: InboxViewProps) {
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
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState('');
  const [channelsOpen, setChannelsOpen] = useState(false);

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

  async function connectGmail() {
    setConnectingGmail(true);
    setError('');
    try {
      const result = await jsonRequest<{ authorizationUrl: string }>(`${API}/gmail/connect`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Gmail connection.');
      setConnectingGmail(false);
    }
  }

  function connectMeta(channel: 'facebook' | 'whatsapp') {
    setConnectionNotice(
      channel === 'facebook'
        ? 'Add Meta App credentials on the API server to enable Facebook Page sign-in.'
        : 'Add Meta App & WhatsApp Business credentials on the API server to enable WhatsApp sign-in.'
    );
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
        actions={
          <Button variant="secondary" size="sm" onClick={() => void refresh()} loading={loading} icon={<RefreshCw size={13} />}>
            Refresh
          </Button>
        }
      />

      {/* Tiny Collapsible Connect Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0 overflow-hidden">
        <button
          type="button"
          onClick={() => setChannelsOpen((o) => !o)}
          className="w-full px-3.5 py-2 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <PlugZap size={13} className="text-indigo-600" />
              Channels ({connectedCount}/3)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${config?.whatsapp ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              WhatsApp
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${config?.messenger ? 'bg-blue-500' : 'bg-slate-300'}`} />
              Messenger
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${config?.gmail?.connected ? 'bg-rose-500' : 'bg-slate-300'}`} />
              Gmail
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 shrink-0">
            {channelsOpen ? 'Hide' : 'Configure'}
            {channelsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {channelsOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/50">
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">WhatsApp</p>
                  <p className="text-[10px] text-slate-500 truncate">{config?.whatsapp ? 'Connected' : 'Not connected'}</p>
                </div>
              </div>
              <Button size="sm" variant={config?.whatsapp ? 'secondary' : 'primary'} onClick={() => connectMeta('whatsapp')}>
                {config?.whatsapp ? <CircleCheck size={13} /> : 'Connect'}
              </Button>
            </div>

            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Facebook size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">Messenger</p>
                  <p className="text-[10px] text-slate-500 truncate">{config?.messenger ? 'Connected' : 'Not connected'}</p>
                </div>
              </div>
              <Button size="sm" variant={config?.messenger ? 'secondary' : 'primary'} onClick={() => connectMeta('facebook')}>
                {config?.messenger ? <CircleCheck size={13} /> : 'Connect'}
              </Button>
            </div>

            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Mail size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">Gmail</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {config?.gmail?.connected ? config.gmail.email : 'Not connected'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={config?.gmail?.connected ? 'secondary' : 'primary'}
                disabled={!config?.gmail?.connected && !config?.gmail?.configured}
                loading={connectingGmail}
                onClick={() => void connectGmail()}
                icon={!config?.gmail?.connected ? <ArrowUpRight size={13} /> : undefined}
              >
                {config?.gmail?.connected ? 'Connected' : 'Connect'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {connectionNotice && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs text-blue-900 shrink-0">
          <span>{connectionNotice}</span>
          <button type="button" onClick={() => setConnectionNotice('')} className="font-bold text-blue-700 cursor-pointer">
            ×
          </button>
        </div>
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
                        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">{message.text}</p>
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

              <div className="border-t border-slate-200 bg-white p-3 shrink-0">
                {windowOpen ? (
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
                ) : (
                  <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                    The 24-hour reply window is closed. Wait for a new message from this contact before replying.
                  </p>
                )}
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
    </section>
  );
}
