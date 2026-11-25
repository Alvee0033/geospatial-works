'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  msg: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ toast, onDismiss, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [toast, onDismiss, durationMs]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-[70] max-w-sm w-full sm:w-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
          isError
            ? 'bg-rose-950 text-rose-50 border-rose-800'
            : 'bg-slate-900 text-white border-slate-800'
        }`}
      >
        {isError ? (
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
        ) : (
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
        )}
        <span className="flex-1 leading-snug">{toast.msg}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
