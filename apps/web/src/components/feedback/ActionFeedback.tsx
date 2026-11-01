'use client';

import { useEffect, useState } from 'react';
import { Check, CircleAlert, Info, X } from 'lucide-react';

export type ActionFeedbackTone = 'success' | 'error' | 'info';
type ActionFeedbackMessage = {
  title: string;
  message: string;
  tone: ActionFeedbackTone;
  id: number;
};

const EVENT_NAME = 'gw:action-feedback';

export function notifyAction(
  message: string,
  tone: ActionFeedbackTone = 'success',
  title?: string,
) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { message, tone, title },
    }),
  );
}

export function ActionFeedbackHost() {
  const [active, setActive] = useState<ActionFeedbackMessage | null>(null);

  useEffect(() => {
    let nextId = 0;
    let dismissTimer: ReturnType<typeof setTimeout> | undefined;
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<{
        message?: string;
        tone?: ActionFeedbackTone;
        title?: string;
      }>).detail;
      if (!detail?.message) return;
      if (dismissTimer) clearTimeout(dismissTimer);
      const tone = detail.tone || 'success';
      setActive({
        id: ++nextId,
        title: detail.title || (tone === 'error' ? 'Could not complete action' : tone === 'info' ? 'Update' : 'Action complete'),
        message: detail.message,
        tone,
      });
      dismissTimer = setTimeout(() => setActive(null), 5000);
    };
    window.addEventListener(EVENT_NAME, receive);
    return () => {
      window.removeEventListener(EVENT_NAME, receive);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  if (!active) return null;
  const icon = active.tone === 'success' ? <Check size={18} /> : active.tone === 'error' ? <CircleAlert size={18} /> : <Info size={18} />;
  const colors = active.tone === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : active.tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-sky-200 bg-sky-50 text-sky-700';

  return (
    <div
      key={active.id}
      role={active.tone === 'error' ? 'alert' : 'status'}
      aria-live={active.tone === 'error' ? 'assertive' : 'polite'}
      className="fixed bottom-4 right-4 z-[9999] w-[min(24rem,calc(100vw-2rem))] animate-in slide-in-from-bottom-2 duration-200 rounded-xl border border-slate-200 bg-white/95 shadow-[0_12px_36px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:bottom-5 sm:right-5"
    >
      <div className="flex items-start gap-2.5 p-3">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${colors}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-5 text-slate-900">{active.title}</p>
          <p className="mt-0.5 text-xs leading-4 text-slate-600 [overflow-wrap:anywhere]">{active.message}</p>
        </div>
        <button type="button" onClick={() => setActive(null)} aria-label="Dismiss action update" className="-mr-1 -mt-1 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
