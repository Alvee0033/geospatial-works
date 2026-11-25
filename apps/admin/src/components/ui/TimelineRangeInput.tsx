'use client';

import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

interface TimelineRangeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthValue(ym: string): string {
  const m = ym.match(/^(\d{4})-(\d{2})$/);
  if (!m) return ym;
  const monthIdx = Number(m[2]) - 1;
  return `${MONTHS[monthIdx] || m[2]} ${m[1]}`;
}

function parseToMonthInput(part: string): string {
  const clean = part.trim();
  // "Jan 2025" or "January 2025"
  const mText = clean.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (mText) {
    const idx = MONTHS.findIndex((m) => m.toLowerCase() === mText[1].slice(0, 3).toLowerCase());
    if (idx >= 0) return `${mText[2]}-${String(idx + 1).padStart(2, '0')}`;
  }
  // "2025-01"
  if (/^\d{4}-\d{2}$/.test(clean)) return clean;
  // "2025"
  if (/^\d{4}$/.test(clean)) return `${clean}-01`;
  return '';
}

export function TimelineRangeInput({ value, onChange }: TimelineRangeInputProps) {
  const { startYm, endYm, isOngoing } = useMemo(() => {
    const parts = (value || '').split(/\s*(?:–|—|-|\bto\b)\s*/i).filter(Boolean);
    const s = parts[0] ? parseToMonthInput(parts[0]) : '';
    const last = parts[1] || '';
    const ongoing = /ongoing|present|current/i.test(last);
    const e = !ongoing && last ? parseToMonthInput(last) : '';
    return { startYm: s, endYm: e, isOngoing: ongoing };
  }, [value]);

  const emit = (nextStart: string, nextEnd: string, nextOngoing: boolean) => {
    const sLabel = nextStart ? formatMonthValue(nextStart) : '';
    const eLabel = nextOngoing ? 'Ongoing' : nextEnd ? formatMonthValue(nextEnd) : '';
    if (sLabel && eLabel) onChange(`${sLabel} – ${eLabel}`);
    else if (sLabel) onChange(sLabel);
    else if (eLabel) onChange(eLabel);
    else onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <span className="text-[11px] font-medium text-slate-500 block mb-1">From</span>
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="month"
              value={startYm}
              onChange={(e) => emit(e.target.value, endYm, isOngoing)}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">To</span>
            <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isOngoing}
                onChange={(e) => emit(startYm, endYm, e.target.checked)}
                className="rounded text-indigo-600 w-3.5 h-3.5 cursor-pointer"
              />
              Ongoing
            </label>
          </div>
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="month"
              disabled={isOngoing}
              value={isOngoing ? '' : endYm}
              onChange={(e) => emit(startYm, e.target.value, false)}
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
        </div>
      </div>

      {value && (
        <p className="text-[11px] text-slate-500">
          Formatted display: <strong className="text-slate-800">{value}</strong>
        </p>
      )}
    </div>
  );
}
