'use client';

import { Calendar } from 'lucide-react';

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function formatDate(value: string) {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : '';
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Calendar size={13} className="text-slate-400" /> {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={formatDate(value)}
          placeholder="DD/MM/YYYY"
          aria-label={`${label}, day/month/year`}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
        />
        <label className="relative shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:border-indigo-300 hover:text-indigo-600" aria-label={`Choose ${label}`}>
          <Calendar size={16} />
          <input
            type="date"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`Choose ${label}`}
          />
        </label>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">DD/MM/YYYY</p>
    </div>
  );
}
