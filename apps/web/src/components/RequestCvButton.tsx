'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CheckCircle2, LoaderCircle, X } from 'lucide-react';
import { CmsApi } from '@/lib/cms-api';

type Props = { memberName: string; className?: string };

export default function RequestCvButton({ memberName, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open && wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
      return;
    }
    if (!open) return;
    wasOpenRef.current = true;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setStatus('sending');
    try {
      await CmsApi.submitInquiry({
        fullName: String(values.get('fullName') || '').trim(),
        email: String(values.get('email') || '').trim(),
        phone: String(values.get('phone') || '').trim() || undefined,
        serviceType: 'CV request',
        message: `CV request for ${memberName}. Organization: ${String(values.get('organization') || '').trim() || 'Not provided'}. Reason: ${String(values.get('reason') || '').trim()}`,
      });
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <button ref={triggerRef} type="button" className={className} onClick={() => { setStatus('idle'); setOpen(true); }} aria-haspopup="dialog">
        Request CV <ArrowRight size={14} />
      </button>
      {open && (
        <div className="gw-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section ref={dialogRef} tabIndex={-1} className="gw-dialog" role="dialog" aria-modal="true" aria-labelledby="cv-dialog-title">
            <button type="button" onClick={() => setOpen(false)} className="gw-dialog-close" aria-label="Close CV request"><X size={19} /></button>
            {status === 'sent' ? (
              <div className="gw-form-success"><CheckCircle2 size={34} /><h2 id="cv-dialog-title">Request received</h2><p>Thank you. Our team will review your request and get back to you.</p><button type="button" className="gw-dialog-action" onClick={() => setOpen(false)}>Done</button></div>
            ) : (
              <>
                <p className="gw-dialog-eyebrow">TEAM PROFILE</p>
                <h2 id="cv-dialog-title">Request a CV</h2>
                <p className="gw-dialog-description">Tell us how to reach you about <strong>{memberName}</strong>.</p>
                <form className="gw-cv-form" onSubmit={handleSubmit}>
                  <label>Your name<input name="fullName" autoComplete="name" required maxLength={120} /></label>
                  <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
                  <label>Phone number <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
                  <label>Organization <span>(optional)</span><input name="organization" autoComplete="organization" maxLength={160} /></label>
                  <label>Reason for request<textarea name="reason" rows={3} required maxLength={1000} /></label>
                  {status === 'error' && <p className="gw-form-error" role="alert">We couldn’t send your request. Please try again.</p>}
                  <button className="gw-dialog-action" type="submit" disabled={status === 'sending'}>{status === 'sending' ? <><LoaderCircle className="gw-spin" size={16} /> Sending…</> : <>Send request <ArrowRight size={16} /></>}</button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
