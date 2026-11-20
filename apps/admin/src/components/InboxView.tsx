'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Facebook, MessageCircle, RefreshCw, Send, Search, ShieldCheck, Smartphone, Mail } from 'lucide-react';

type Channel = 'WHATSAPP' | 'MESSENGER' | 'GMAIL';
type Conversation = { id: string; channel: Channel; participantId: string; participantName?: string | null; lastMessagePreview?: string | null; lastMessageAt?: string | null; lastInboundAt?: string | null; unreadCount: number };
type Message = { id: string; channel: Channel; text: string; fromBusiness: boolean; sentAt: string };
type Config = { whatsapp: boolean; messenger: boolean; gmail: { configured: boolean; connected: boolean; email: string | null }; callbackPath: string };

interface InboxViewProps {
  getAuthHeaders: () => Record<string, string>;
  triggerFeedback?: (message: string, type?: 'success' | 'error') => void;
}

const API = '/api/inbox/admin';

function relativeTime(value?: string | null) {
  if (!value) return 'No messages';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const ms = Date.now() - date.getTime();
  if (ms < 60_000) return 'Just now';
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function channelLabel(channel: Channel) { return channel === 'WHATSAPP' ? 'WhatsApp' : channel === 'MESSENGER' ? 'Messenger' : 'Gmail'; }

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

  const requestOptions = useCallback(() => ({ headers: getAuthHeaders(), cache: 'no-store' as RequestCache }), [getAuthHeaders]);
  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [threads, status] = await Promise.all([
        jsonRequest<Conversation[]>(`${API}/conversations`, requestOptions()),
        jsonRequest<Config>(`${API}/config`, requestOptions()),
      ]);
      setConversations(threads);
      setConfig(status);
      setError('');
      setSelectedId((current) => current && threads.some((item) => item.id === current) ? current : threads[0]?.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the inbox.');
    } finally { if (!quiet) setLoading(false); }
  }, [requestOptions]);

  useEffect(() => { void refresh(); const timer = window.setInterval(() => void refresh(true), 30_000); return () => window.clearInterval(timer); }, [refresh]);

  const selected = conversations.find((item) => item.id === selectedId) || null;
  const loadThread = useCallback(async (conversationId: string) => {
    setThreadLoading(true);
    try {
      const items = await jsonRequest<Message[]>(`${API}/conversations/${conversationId}/messages`, requestOptions());
      setMessages(items);
      setConversations((current) => current.map((item) => item.id === conversationId ? { ...item, unreadCount: 0 } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this conversation.');
      setMessages([]);
    } finally { setThreadLoading(false); }
  }, [requestOptions]);

  useEffect(() => { if (selectedId) void loadThread(selectedId); else setMessages([]); }, [selectedId, loadThread]);

  const filtered = useMemo(() => conversations.filter((item) => {
    const matchesChannel = filter === 'ALL' || item.channel === filter;
    const text = `${item.participantName || ''} ${item.participantId} ${item.lastMessagePreview || ''}`.toLowerCase();
    return matchesChannel && text.includes(query.toLowerCase());
  }), [conversations, filter, query]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!selected || !text || sending) return;
    setSending(true); setError('');
    try {
      const sent = await jsonRequest<Message>(`${API}/conversations/${selected.id}/reply`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ text }),
      });
      setMessages((items) => [...items, sent]); setDraft('');
      setConversations((items) => items.map((item) => item.id === selected.id ? { ...item, lastMessagePreview: text, lastMessageAt: sent.sentAt } : item));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send this message.';
      setError(message); triggerFeedback?.(message, 'error');
    } finally { setSending(false); }
  }

  async function connectGmail() {
    setConnectingGmail(true); setError('');
    try {
      const result = await jsonRequest<{ authorizationUrl: string }>(`${API}/gmail/connect`, { method: 'POST', headers: getAuthHeaders() });
      window.location.assign(result.authorizationUrl);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not start Gmail connection.'); setConnectingGmail(false); }
  }

  const windowOpen = selected?.channel === 'GMAIL' || (selected?.lastInboundAt ? Date.now() - new Date(selected.lastInboundAt).getTime() < 24 * 60 * 60 * 1000 : false);
  const connectedCount = Number(Boolean(config?.whatsapp)) + Number(Boolean(config?.messenger)) + Number(Boolean(config?.gmail?.connected));

  return (
    <section className="flex h-full min-h-[620px] flex-col gap-4 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold tracking-tight">Messages</h2><p className="mt-1 text-sm text-slate-500">WhatsApp, Facebook Page and Gmail conversations in one inbox.</p></div>
        <button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/> Refresh</button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={17} className={connectedCount ? 'text-emerald-600' : 'text-slate-400'}/>{connectedCount ? `${connectedCount} channel${connectedCount > 1 ? 's' : ''} connected` : 'Channels not connected yet'}</div>
        <div className="ml-auto flex flex-wrap gap-2 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${config?.whatsapp ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}><MessageCircle size={13}/> WhatsApp {config?.whatsapp ? 'ready' : 'setup needed'}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${config?.messenger ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-500'}`}><Facebook size={13}/> Messenger {config?.messenger ? 'ready' : 'setup needed'}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${config?.gmail?.connected ? 'bg-rose-50 text-rose-800' : 'bg-slate-100 text-slate-500'}`}><Mail size={13}/> Gmail {config?.gmail?.connected ? config.gmail.email : 'not connected'}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><div><p className="text-sm font-medium text-slate-800">Gmail inbox</p><p className="mt-0.5 text-xs text-slate-500">{config?.gmail?.connected ? `Connected as ${config.gmail.email}` : config?.gmail?.configured ? 'Connect a Google mailbox to receive and reply to email.' : 'Google OAuth credentials are needed on the API before connecting.'}</p></div><button onClick={() => void connectGmail()} disabled={connectingGmail || !config?.gmail?.configured} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Mail size={15}/>{config?.gmail?.connected ? 'Reconnect Gmail' : connectingGmail ? 'Opening Google…' : 'Connect Gmail'}</button></div>

      {!connectedCount && !loading && <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950"><strong>Connect Meta to receive messages.</strong> Add the WhatsApp Cloud API and/or Facebook Page credentials to the API environment, then register <code className="rounded bg-white/80 px-1.5 py-0.5">/api/v1/inbox/webhook</code> in Meta for Developers. The callback must be publicly reachable over HTTPS. Credentials stay on the server.</div>}
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">{error}</div>}

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className={`${selected ? 'hidden lg:flex' : 'flex'} min-h-[500px] flex-col border-r border-slate-200`}>
          <div className="space-y-3 border-b border-slate-100 p-3">
            <label className="relative block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"/></label>
            <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1"><button onClick={() => setFilter('ALL')} className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>All</button><button onClick={() => setFilter('WHATSAPP')} className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${filter === 'WHATSAPP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>WhatsApp</button><button onClick={() => setFilter('MESSENGER')} className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${filter === 'MESSENGER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Messenger</button><button onClick={() => setFilter('GMAIL')} className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${filter === 'GMAIL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Gmail</button></div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="space-y-3 p-4">{[0,1,2,3].map((n) => <div key={n} className="h-16 animate-pulse rounded-lg bg-slate-100"/>)}</div> : filtered.length ? filtered.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${selectedId === item.id ? 'bg-blue-50/70' : ''}`}><div className="flex items-center gap-2"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-700' : item.channel === 'MESSENGER' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{item.channel === 'WHATSAPP' ? <Smartphone size={15}/> : item.channel === 'MESSENGER' ? <Facebook size={15}/> : <Mail size={15}/>}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm font-medium">{item.participantName || item.participantId}</strong><time className="shrink-0 text-[11px] text-slate-400">{relativeTime(item.lastMessageAt)}</time></span><span className="mt-0.5 flex items-center justify-between gap-2"><span className="truncate text-xs text-slate-500">{item.lastMessagePreview || 'New conversation'}</span>{item.unreadCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">{item.unreadCount}</span>}</span></span></div></button>) : <div className="px-5 py-12 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-400"><MessageCircle size={19}/></div><p className="mt-3 text-sm font-medium text-slate-700">{conversations.length ? 'No matching conversations' : 'No messages yet'}</p><p className="mt-1 text-xs leading-5 text-slate-500">{conversations.length ? 'Try a different search or channel.' : 'Connect a channel to receive messages here.'}</p></div>}
          </div>
        </aside>

        <section className={`${selected ? 'flex' : 'hidden lg:flex'} min-h-[500px] min-w-0 flex-col bg-[#f8fafc]`}>
          {selected ? <>
            <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3"><button onClick={() => setSelectedId('')} className="mr-1 text-sm text-blue-700 lg:hidden">Back</button><div className={`grid h-9 w-9 place-items-center rounded-full ${selected.channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-700' : selected.channel === 'MESSENGER' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{selected.channel === 'WHATSAPP' ? <Smartphone size={17}/> : selected.channel === 'MESSENGER' ? <Facebook size={17}/> : <Mail size={17}/>}</div><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{selected.participantName || selected.participantId}</h3><p className="text-xs text-slate-500">{channelLabel(selected.channel)} · {selected.participantId}</p></div></header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">{threadLoading ? <div className="space-y-4">{[0,1,2].map((n) => <div key={n} className="h-12 w-2/3 animate-pulse rounded-xl bg-slate-200"/>)}</div> : messages.map((message) => <div key={message.id} className={`flex ${message.fromBusiness ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[72%] ${message.fromBusiness ? 'rounded-br-md bg-blue-700 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}><p className="whitespace-pre-wrap break-words text-sm leading-5">{message.text}</p><time className={`mt-1 block text-right text-[10px] ${message.fromBusiness ? 'text-blue-100' : 'text-slate-400'}`}>{new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.sentAt))}</time></div></div>)}</div>
            <div className="border-t border-slate-200 bg-white p-3 sm:p-4">{windowOpen ? <form onSubmit={send} className="flex items-end gap-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(event as unknown as FormEvent); } }} rows={1} maxLength={4000} placeholder="Write a reply…" aria-label="Write a reply" className="max-h-32 min-h-11 flex-1 resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white"/><button disabled={!draft.trim() || sending} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"><Send size={15}/><span className="hidden sm:inline">{sending ? 'Sending…' : 'Send'}</span></button></form> : <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">The 24-hour reply window is closed. Ask the customer to message again before replying here. Approved WhatsApp templates are not yet supported.</p>}<p className="mt-2 text-[11px] text-slate-400">Use this inbox for customer replies only. Meta messaging rules apply.</p></div>
          </> : <div className="m-auto max-w-sm px-6 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-slate-400 shadow-sm"><MessageCircle size={23}/></div><h3 className="mt-4 text-sm font-semibold text-slate-800">Choose a conversation</h3><p className="mt-1 text-sm text-slate-500">Select a message on the left to read and reply.</p></div>}
        </section>
      </div>
    </section>
  );
}
