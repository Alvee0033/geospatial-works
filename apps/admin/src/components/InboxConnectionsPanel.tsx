'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Check, CircleAlert, Facebook, Mail, MessageCircle, ShieldCheck, X } from 'lucide-react';

type Status = { configured: boolean; connected: boolean; displayName: string | null; connectedAt: string | null; tokenExpiresAt: string | null };
export type InboxConfiguration = {
  whatsapp: boolean;
  messenger: boolean;
  gmail: { configured: boolean; connected: boolean; email: string | null };
  meta: { appId: string | null; whatsappConfigId: string | null; messengerConfigId: string | null; webhookReady: boolean; whatsapp: Status; messenger: Status };
};

type Props = {
  config: InboxConfiguration | null;
  getAuthHeaders: () => Record<string, string>;
  onRefresh: () => Promise<void>;
  onClose: () => void;
  canManageConnections: boolean;
};

type FbResponse = { authResponse?: { code?: string }; status?: string };
type FbApi = { init: (options: Record<string, unknown>) => void; login: (callback: (response: FbResponse) => void, options: Record<string, unknown>) => void };
declare global { interface Window { FB?: FbApi; fbAsyncInit?: () => void } }

const API = '/api/inbox/admin';

async function request<T>(url: string, headers: Record<string, string>, body?: unknown, method = 'POST'): Promise<T> {
  const response = await fetch(url, { method, headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(Array.isArray(data?.message) ? data.message.join(', ') : data?.message || 'Connection failed. Please try again.');
  return data as T;
}

function ChannelCard({ icon, name, tone, connected, detail, configured, onConnect, onDisconnect, busy, canManageConnections, children }: {
  icon: ReactNode; name: string; tone: string; connected: boolean; detail: string; configured: boolean; canManageConnections: boolean;
  onConnect: () => void; onDisconnect: () => void; busy: boolean; children?: ReactNode;
}) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-22px_#0c2340] sm:p-5">
    <div className="flex items-start gap-3">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-slate-950">{name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {connected ? 'Connected' : configured ? 'Ready to connect' : 'Setup needed'}
          </span>
        </div>
        <p className="mt-1 break-words text-xs leading-5 text-slate-500">{detail}</p>
      </div>
    </div>
    {children}
    {canManageConnections && <div className="mt-4 flex items-center gap-2">
      {connected ? <button type="button" onClick={onDisconnect} disabled={busy} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-700 disabled:opacity-50">Disconnect</button>
        : <button type="button" onClick={onConnect} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-[#143c78] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0a2d5d] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 cursor-pointer">
          {busy ? 'Connecting…' : configured ? 'Connect account' : 'Setup & Connect'} <ArrowUpRight size={13} />
        </button>}
    </div>}
  </article>;
}

export function InboxConnectionsPanel({ config, getAuthHeaders, onRefresh, onClose, canManageConnections }: Props) {
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState<'whatsapp' | 'messenger' | 'gmail' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pin, setPin] = useState('');
  const [setupChannel, setSetupChannel] = useState<'whatsapp' | 'messenger' | 'gmail' | null>(null);
  const [waPhoneId, setWaPhoneId] = useState('');
  const [waToken, setWaToken] = useState('');
  const [fbPageId, setFbPageId] = useState('');
  const [fbToken, setFbToken] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [metaVerifyToken, setMetaVerifyToken] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleRedirectUri, setGoogleRedirectUri] = useState('https://api.geospatialworks.com.bd/api/v1/inbox/google/callback');
  const [savingSetup, setSavingSetup] = useState(false);
  const [pageChoice, setPageChoice] = useState<{ pages: { id: string; name: string }[]; selectionToken: string } | null>(null);
  const whatsappSession = useRef<{ wabaId: string; phoneNumberId?: string; isOnBizApp: boolean } | null>(null);
  const whatsappCode = useRef('');
  const whatsappWait = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectingWhatsApp = useRef(false);
  const getAuthHeadersRef = useRef(getAuthHeaders);
  getAuthHeadersRef.current = getAuthHeaders;

  useEffect(() => {
    const appId = config?.meta?.appId;
    if (!appId) return;
    let mounted = true;
    const init = () => {
      window.FB?.init({ appId, cookie: false, xfbml: false, version: 'v27.0' });
      if (mounted) setSdkReady(Boolean(window.FB));
    };
    if (window.FB) init();
    else {
      window.fbAsyncInit = init;
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.onerror = () => { if (mounted) setError('Meta sign-in could not load. Check your connection and try again.'); };
        document.body.appendChild(script);
      }
    }
    return () => { mounted = false; };
  }, [config?.meta?.appId]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      let host = '';
      try { host = new URL(event.origin).hostname; } catch { return; }
      if (host !== 'facebook.com' && !host.endsWith('.facebook.com')) return;
      let payload: unknown = event.data;
      if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch { return; } }
      if (!payload || typeof payload !== 'object') return;
      const data = payload as { type?: string; event?: string; data?: Record<string, unknown> };
      if (data.type !== 'WA_EMBEDDED_SIGNUP' || !data.event?.startsWith('FINISH')) return;
      const details = data.data || {};
      const wabaId = String(details.waba_id || (Array.isArray(details.messaging_account_ids) ? details.messaging_account_ids[0] : '') || '');
      const phoneNumberId = String(details.phone_number_id || '');
      if (!/^\d+$/.test(wabaId) || (phoneNumberId && !/^\d+$/.test(phoneNumberId))) return;
      whatsappSession.current = { wabaId, ...(phoneNumberId ? { phoneNumberId } : {}), isOnBizApp: Boolean(details.is_on_biz_app) };
      if (whatsappWait.current) { clearTimeout(whatsappWait.current); whatsappWait.current = null; }
      void finishWhatsApp();
    };
    window.addEventListener('message', receive);
    return () => { window.removeEventListener('message', receive); if (whatsappWait.current) clearTimeout(whatsappWait.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  async function finishWhatsApp() {
    if (!whatsappCode.current || !whatsappSession.current || connectingWhatsApp.current) return;
    connectingWhatsApp.current = true;
    setBusy('whatsapp'); setError('');
    try {
      const result = await request<{ displayName: string; registrationRequested: boolean }>(`${API}/meta/whatsapp/connect`, getAuthHeadersRef.current(), {
        code: whatsappCode.current, ...whatsappSession.current, ...(pin ? { pin } : {}),
      });
      setNotice(`${result.displayName} connected. ${result.registrationRequested ? 'Phone registration requested.' : 'If this is a new API number, complete its registration in Meta Business Settings.'}`);
      await onRefresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not connect WhatsApp.'); }
    finally { connectingWhatsApp.current = false; whatsappCode.current = ''; whatsappSession.current = null; setBusy(null); }
  }

  function connectMeta(channel: 'whatsapp' | 'messenger') {
    if (!window.FB || !config?.meta?.appId) { setError('Meta sign-in is still loading. Please try again.'); return; }
    const configId = channel === 'whatsapp' ? config.meta.whatsappConfigId : config.meta.messengerConfigId;
    if (!configId) { setError('Meta app setup is incomplete.'); return; }
    setError(''); setNotice(''); setBusy(channel);
    if (channel === 'whatsapp') { whatsappCode.current = ''; whatsappSession.current = null; }
    window.FB.login((response) => {
      const code = response.authResponse?.code;
      if (!code) { setBusy(null); setError('Meta sign-in was cancelled or did not grant access.'); return; }
      if (channel === 'whatsapp') {
        whatsappCode.current = code;
        if (whatsappSession.current) void finishWhatsApp();
        else whatsappWait.current = setTimeout(() => {
          if (!whatsappSession.current) { whatsappCode.current = ''; setBusy(null); setError('Meta did not return a WhatsApp account. Complete signup and try again.'); }
        }, 8000);
      } else {
        void (async () => {
          try {
            const result = await request<{ pages: { id: string; name: string }[]; selectionToken: string }>(`${API}/meta/messenger/start`, getAuthHeadersRef.current(), { code });
            setPageChoice(result);
          } catch (err) { setError(err instanceof Error ? err.message : 'Could not load your Pages.'); }
          finally { setBusy(null); }
        })();
      }
    }, { config_id: configId, response_type: 'code', override_default_response_type: true, ...(channel === 'whatsapp' ? { extras: { setup: {} } } : {}) });
  }

  async function selectPage(pageId: string) {
    if (!pageChoice) return;
    setBusy('messenger'); setError('');
    try {
      await request(`${API}/meta/messenger/select`, getAuthHeaders(), { selectionToken: pageChoice.selectionToken, pageId });
      setPageChoice(null); setNotice('Facebook Page connected. New messages will appear here.'); await onRefresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not connect the Page.'); }
    finally { setBusy(null); }
  }

  async function connectGmail() {
    setBusy('gmail'); setError('');
    try {
      const result = await request<{ authorizationUrl: string }>(`${API}/gmail/connect`, getAuthHeaders());
      window.location.assign(result.authorizationUrl);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not start Gmail sign-in.'); setBusy(null); }
  }

  async function disconnect(channel: 'whatsapp' | 'messenger' | 'gmail') {
    if (!window.confirm(`Disconnect ${channel === 'messenger' ? 'Facebook Messenger' : channel === 'gmail' ? 'Gmail' : 'WhatsApp'} from this inbox? Existing messages will remain here.`)) return;
    setBusy(channel); setError('');
    try {
      await request(`${API}/${channel === 'gmail' ? 'gmail' : `meta/${channel}`}/connection`, getAuthHeaders(), undefined, 'DELETE');
      setNotice('Account disconnected. Existing messages are still available.'); await onRefresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not disconnect account.'); }
    finally { setBusy(null); }
  }

  async function saveChannelSetup(channel: 'whatsapp' | 'messenger' | 'gmail') {
    setSavingSetup(true);
    setError('');
    setNotice('');
    try {
      const payload: Record<string, string> = {};
      if (channel === 'whatsapp') {
        if (!waPhoneId.trim() || !waToken.trim()) throw new Error('Enter Phone Number ID and Access Token.');
        payload.whatsappPhoneNumberId = waPhoneId.trim();
        payload.whatsappAccessToken = waToken.trim();
        if (metaAppSecret.trim()) payload.metaAppSecret = metaAppSecret.trim();
        if (metaVerifyToken.trim()) payload.metaWebhookVerifyToken = metaVerifyToken.trim();
      } else if (channel === 'messenger') {
        if (!fbPageId.trim() || !fbToken.trim()) throw new Error('Enter Facebook Page ID and Page Access Token.');
        payload.messengerPageId = fbPageId.trim();
        payload.messengerPageAccessToken = fbToken.trim();
        if (metaAppSecret.trim()) payload.metaAppSecret = metaAppSecret.trim();
        if (metaVerifyToken.trim()) payload.metaWebhookVerifyToken = metaVerifyToken.trim();
      } else if (channel === 'gmail') {
        if (!googleClientId.trim() || !googleClientSecret.trim()) throw new Error('Enter Google Client ID and Client Secret.');
        payload.googleClientId = googleClientId.trim();
        payload.googleClientSecret = googleClientSecret.trim();
        payload.googleRedirectUri = googleRedirectUri.trim() || 'https://api.geospatialworks.com.bd/api/v1/inbox/google/callback';
      }

      await request(`${API}/setup`, getAuthHeaders(), payload, 'PUT');
      setSetupChannel(null);
      await onRefresh();
      if (channel === 'gmail') {
        await connectGmail();
      } else {
        setNotice(`${channel === 'whatsapp' ? 'WhatsApp' : 'Facebook Messenger'} connected and ready.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save channel credentials.');
    } finally {
      setSavingSetup(false);
    }
  }

  const meta = config?.meta;
  return <section aria-label="Message channel settings" className="shrink-0 overflow-hidden rounded-2xl border border-[#d9e2ee] bg-[#f7f9fc] shadow-[0_12px_38px_-34px_#123567]">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
      <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#e62934]">Message settings</p><h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#102d55]">Connect your accounts</h2><p className="mt-1 text-xs text-slate-500">Click Setup &amp; Connect on any channel to enter credentials or sign in directly.</p></div>
      <button type="button" onClick={onClose} aria-label="Close message settings" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X size={18} /></button>
    </div>
    <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-3">
      <ChannelCard icon={<MessageCircle size={21} />} name="WhatsApp Business" tone="bg-emerald-50 text-emerald-700" connected={Boolean(meta?.whatsapp.connected || config?.whatsapp)} configured={Boolean(meta?.whatsappConfigId && sdkReady)} busy={busy === 'whatsapp'} canManageConnections={canManageConnections}
        detail={meta?.whatsapp.displayName || (config?.whatsapp ? 'WhatsApp connected and active.' : 'Click Setup & Connect to enter your WhatsApp Phone ID & Token.')}
        onConnect={() => meta?.whatsappConfigId && sdkReady ? connectMeta('whatsapp') : setSetupChannel('whatsapp')} onDisconnect={() => void disconnect('whatsapp')}>
        {canManageConnections && !meta?.whatsapp.connected && meta?.whatsappConfigId && <label className="mt-3 block text-[11px] font-semibold text-slate-600">Two-step PIN for a new API number (optional)
          <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))} placeholder="6-digit PIN" className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#326df1]" />
        </label>}
      </ChannelCard>
      <ChannelCard icon={<Facebook size={21} />} name="Facebook Messenger" tone="bg-blue-50 text-blue-700" connected={Boolean(meta?.messenger.connected || config?.messenger)} configured={Boolean(meta?.messengerConfigId && sdkReady)} busy={busy === 'messenger'} canManageConnections={canManageConnections}
        detail={meta?.messenger.displayName || (config?.messenger ? 'Facebook Messenger connected and active.' : 'Click Setup & Connect to enter your Page ID & Access Token.')}
        onConnect={() => meta?.messengerConfigId && sdkReady ? connectMeta('messenger') : setSetupChannel('messenger')} onDisconnect={() => void disconnect('messenger')} />
      <ChannelCard icon={<Mail size={21} />} name="Gmail" tone="bg-rose-50 text-rose-700" connected={Boolean(config?.gmail.connected)} configured={Boolean(config?.gmail.configured)} busy={busy === 'gmail'} canManageConnections={canManageConnections}
        detail={config?.gmail.email || (config?.gmail.configured ? 'Choose your Google account and approve inbox access.' : 'Click Setup & Connect to enter your Google OAuth Client ID & Secret.')}
        onConnect={() => config?.gmail.configured ? void connectGmail() : setSetupChannel('gmail')} onDisconnect={() => void disconnect('gmail')} />
    </div>
    {setupChannel && (
      <div className="mx-3 mb-3 rounded-xl border border-indigo-200 bg-white p-4 sm:mx-4 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900">
            {setupChannel === 'whatsapp' ? 'Connect WhatsApp Business' : setupChannel === 'messenger' ? 'Connect Facebook Messenger' : 'Connect Gmail OAuth'}
          </h3>
          <button type="button" onClick={() => setSetupChannel(null)} className="text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>

        {setupChannel === 'whatsapp' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number ID *</label>
              <input value={waPhoneId} onChange={(e) => setWaPhoneId(e.target.value)} placeholder="e.g. 123456789012345" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cloud API Access Token *</label>
              <input type="password" value={waToken} onChange={(e) => setWaToken(e.target.value)} placeholder="EAA..." className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Meta App Secret (for incoming webhooks)</label>
              <input type="password" value={metaAppSecret} onChange={(e) => setMetaAppSecret(e.target.value)} placeholder="Optional" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Webhook Verify Token</label>
              <input value={metaVerifyToken} onChange={(e) => setMetaVerifyToken(e.target.value)} placeholder="Auto-generated if blank" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
          </div>
        )}

        {setupChannel === 'messenger' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Facebook Page ID *</label>
              <input value={fbPageId} onChange={(e) => setFbPageId(e.target.value)} placeholder="e.g. 109876543210" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Page Access Token *</label>
              <input type="password" value={fbToken} onChange={(e) => setFbToken(e.target.value)} placeholder="EAA..." className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Meta App Secret (for incoming webhooks)</label>
              <input type="password" value={metaAppSecret} onChange={(e) => setMetaAppSecret(e.target.value)} placeholder="Optional" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Webhook Verify Token</label>
              <input value={metaVerifyToken} onChange={(e) => setMetaVerifyToken(e.target.value)} placeholder="Auto-generated if blank" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
          </div>
        )}

        {setupChannel === 'gmail' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Google Client ID *</label>
              <input value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} placeholder="...apps.googleusercontent.com" className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Google Client Secret *</label>
              <input type="password" value={googleClientSecret} onChange={(e) => setGoogleClientSecret(e.target.value)} placeholder="GOCSPX-..." className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Authorized Redirect URI</label>
              <input value={googleRedirectUri} onChange={(e) => setGoogleRedirectUri(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => setSetupChannel(null)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={savingSetup}
            onClick={() => void saveChannelSetup(setupChannel)}
            className="px-4 py-1.5 rounded-lg bg-[#143c78] hover:bg-[#0a2d5d] text-white font-semibold cursor-pointer disabled:opacity-50"
          >
            {savingSetup ? 'Saving…' : setupChannel === 'gmail' ? 'Save & Sign in with Google' : 'Save & Connect'}
          </button>
        </div>
      </div>
    )}
    {canManageConnections && pageChoice && <div className="mx-3 mb-3 rounded-xl border border-blue-200 bg-white p-4 sm:mx-4"><h3 className="text-sm font-bold text-[#102d55]">Choose the Facebook Page</h3><p className="mt-1 text-xs text-slate-500">Messages from the selected Page will appear in this inbox.</p><div className="mt-3 flex flex-wrap gap-2">{pageChoice.pages.map((page) => <button type="button" key={page.id} disabled={busy === 'messenger'} onClick={() => void selectPage(page.id)} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-50 disabled:opacity-50"><Facebook size={14} />{page.name}<ArrowUpRight size={12} /></button>)}</div></div>}
    {(error || notice) && <p role={error ? 'alert' : 'status'} className={`mx-3 mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:mx-4 ${error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{error ? <CircleAlert size={15} /> : <Check size={15} />}{error || notice}</p>}
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-500 sm:px-5"><span className="inline-flex items-center gap-1.5 text-[#143c78]"><ShieldCheck size={14} /> Provider sign-in only</span><span>Admins can connect or disconnect accounts.</span>{!meta?.webhookReady && <span>Meta webhook setup is required for incoming messages.</span>}</div>
  </section>;
}
