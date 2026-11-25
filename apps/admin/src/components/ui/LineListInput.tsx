'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface LineListInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  addLabel?: string;
  separator?: '\n' | ',';
  pillMode?: boolean;
}

export function LineListInput({
  value,
  onChange,
  placeholder = 'Add item...',
  addLabel = 'Add',
  separator = '\n',
  pillMode = false,
}: LineListInputProps) {
  const [draft, setDraft] = useState('');

  const items = value
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);

  const commitItems = (next: string[]) => {
    onChange(next.join(separator === ',' ? ', ' : '\n'));
  };

  const handleAdd = () => {
    const clean = draft.trim();
    if (!clean) return;
    commitItems([...items, clean]);
    setDraft('');
  };

  const handleRemove = (idx: number) => {
    commitItems(items.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx: number, nextVal: string) => {
    const next = [...items];
    next[idx] = nextVal;
    commitItems(next);
  };

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className={pillMode ? 'flex flex-wrap gap-1.5' : 'space-y-1.5'}>
          {items.map((item, idx) =>
            pillMode ? (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-800 text-xs font-semibold"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-indigo-500 hover:text-rose-600 cursor-pointer"
                  aria-label="Remove item"
                >
                  <X size={12} />
                </button>
              </span>
            ) : (
              <div key={idx} className="flex items-center gap-1.5 group">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleEdit(idx, e.target.value)}
                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition cursor-pointer shrink-0"
                  aria-label="Remove item"
                >
                  <X size={13} />
                </button>
              </div>
            )
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-solid focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!draft.trim()}
          className="h-9 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Plus size={13} /> {addLabel}
        </button>
      </div>
    </div>
  );
}
