'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, LoaderCircle, MessageCircle, RefreshCw, Send } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { UserAvatar } from '@/components/ui/UserAvatar';

type LeaveComment = {
  id: string;
  authorId?: string;
  authorName: string;
  authorRole: string;
  authorAvatarUrl?: string;
  text: string;
  createdAt?: string;
};

type LeaveClarificationThreadProps = {
  leaveId: string;
  employeeName?: string;
};

function normalizeComments(value: unknown): LeaveComment[] {
  let rows: unknown = value;
  while (rows && !Array.isArray(rows) && typeof rows === 'object') {
    const record = rows as Record<string, unknown>;
    rows = record.data ?? record.comments ?? record.results;
  }
  if (!Array.isArray(rows)) throw new Error('The server returned an invalid message list.');
  return rows.map((raw, index) => {
    const row = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `comment-${index}`),
      authorId: String(row.authorId ?? row.author_id ?? ''),
      authorName: String(row.authorName ?? row.author_name ?? 'Team member'),
      authorRole: String(row.authorRole ?? row.author_role ?? 'project_member'),
      authorAvatarUrl: String(row.authorAvatarUrl ?? row.author_avatar_url ?? row.avatarUrl ?? ''),
      text: String(row.text ?? row.comment ?? row.comment_text ?? ''),
      createdAt: String(row.createdAt ?? row.created_at ?? ''),
    };
  });
}

function roleLabel(role: string) {
  const normalized = role.toLowerCase();
  if (normalized.includes('main_admin') || normalized.includes('super')) return 'Super Admin';
  if (normalized.includes('admin')) return 'Admin';
  if (normalized.includes('finance')) return 'Finance';
  if (normalized.includes('manager')) return 'Project Manager';
  return 'Employee';
}

export function LeaveClarificationThread({ leaveId, employeeName }: LeaveClarificationThreadProps) {
  const [comments, setComments] = useState<LeaveComment[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setComments(normalizeComments(await ApiClient.getLeaveComments(leaveId)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load leave messages.');
    } finally {
      setLoading(false);
    }
  }, [leaveId]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('gw_user') || '{}');
      setCurrentUserId(String(user.id ?? user.userId ?? ''));
    } catch {
      setCurrentUserId('');
    }
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (!loading) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [comments.length, loading]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    try {
      await ApiClient.addLeaveComment(leaveId, text);
      setDraft('');
      await loadComments();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Message could not be sent. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-label="Leave clarification thread" className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <MessageCircle size={17} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">Leave clarification</h3>
            <p className="text-[11px] text-slate-500">A private conversation between {employeeName || 'the employee'} and the review team</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
          {comments.length} {comments.length === 1 ? 'message' : 'messages'}
        </span>
      </header>

      <div ref={listRef} aria-live="polite" className="max-h-[360px] min-h-[190px] flex-1 space-y-3 overflow-y-auto overscroll-contain bg-white p-4 sm:p-5">
        {loading ? (
          <div className="flex min-h-[170px] items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <LoaderCircle size={16} className="animate-spin text-indigo-600" /> Loading conversation…
          </div>
        ) : error && comments.length === 0 ? (
          <div role="alert" className="flex min-h-[170px] flex-col items-center justify-center text-center">
            <AlertCircle size={20} className="mb-2 text-amber-600" />
            <p className="max-w-sm text-xs text-slate-600">{error}</p>
            <button type="button" onClick={() => void loadComments()} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <RefreshCw size={13} /> Retry loading messages
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex min-h-[170px] flex-col items-center justify-center text-center">
            <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><MessageCircle size={20} /></span>
            <p className="text-xs font-semibold text-slate-800">No messages yet</p>
            <p className="mt-1 max-w-xs text-[11px] text-slate-500">Ask a question or add context. The other person will be notified.</p>
          </div>
        ) : comments.map((comment) => {
          const isMine = Boolean(currentUserId && comment.authorId === currentUserId);
          const isReviewer = ['main_admin', 'admin', 'project_manager', 'finance', 'finance_manager'].includes(comment.authorRole.toLowerCase());
          return (
            <article key={comment.id} className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
              <UserAvatar src={comment.authorAvatarUrl} name={comment.authorName} size="sm" shape="circle" />
              <div className={`max-w-[88%] min-w-0 sm:max-w-[78%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`mb-1 flex flex-wrap items-center gap-1.5 px-1 ${isMine ? 'justify-end' : ''}`}>
                  <span className="text-[11px] font-semibold text-slate-800">{isMine ? 'You' : comment.authorName}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${isReviewer ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{roleLabel(comment.authorRole)}</span>
                </div>
                <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${isMine ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800'}`}>
                  <p className="whitespace-pre-wrap break-words">{comment.text}</p>
                </div>
                <time className="mt-1 px-1 text-[10px] text-slate-400">
                  {comment.createdAt && !Number.isNaN(Date.parse(comment.createdAt))
                    ? new Date(comment.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                    : ''}
                </time>
              </div>
            </article>
          );
        })}
      </div>

      {error && comments.length > 0 && <p role="alert" className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-[11px] text-amber-800">{error}</p>}

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-slate-100 bg-white p-3 sm:p-4">
        <label htmlFor={`leave-comment-${leaveId}`} className="sr-only">Write a leave clarification message</label>
        <textarea
          id={`leave-comment-${leaveId}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          maxLength={2000}
          rows={2}
          placeholder="Ask for clarification or reply…"
          disabled={sending}
          className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
        />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Send clarification message" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45">
          {sending ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
          <span className="hidden sm:inline">{sending ? 'Sending' : 'Send'}</span>
        </button>
      </form>
    </section>
  );
}

