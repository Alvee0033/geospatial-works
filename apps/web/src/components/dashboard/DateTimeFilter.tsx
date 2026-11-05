'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarDays, Clock, ChevronDown, X, RotateCcw, Check } from 'lucide-react';

export type DateFilterPreset = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'last30' | 'custom';

export interface DateTimeFilterValue {
  from: string; // ISO string or 'YYYY-MM-DDTHH:mm'
  to: string;
  preset: DateFilterPreset;
}

interface DateTimeFilterProps {
  value: DateTimeFilterValue;
  onChange: (value: DateTimeFilterValue) => void;
  className?: string;
}

export const DateTimeFilter: React.FC<DateTimeFilterProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Local state for the custom inputs inside the popover
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('');

  // Sync internal custom inputs whenever `value` changes
  useEffect(() => {
    if (value.from) {
      const d = new Date(value.from);
      if (!Number.isNaN(d.getTime())) {
        setFromDate(d.toISOString().slice(0, 10));
        setFromTime(
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        );
      }
    } else {
      setFromDate('');
      setFromTime('');
    }

    if (value.to) {
      const d = new Date(value.to);
      if (!Number.isNaN(d.getTime())) {
        setToDate(d.toISOString().slice(0, 10));
        setToTime(
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        );
      }
    } else {
      setToDate('');
      setToTime('');
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Apply a quick preset
  const applyPreset = (preset: DateFilterPreset) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    if (preset === 'all') {
      onChange({ from: '', to: '', preset: 'all' });
      setIsOpen(false);
      return;
    }

    if (preset === 'today') {
      const start = new Date(year, month, date, 0, 0, 0, 0);
      const end = new Date(year, month, date, 23, 59, 59, 999);
      onChange({ from: start.toISOString(), to: end.toISOString(), preset: 'today' });
      setIsOpen(false);
      return;
    }

    if (preset === 'yesterday') {
      const start = new Date(year, month, date - 1, 0, 0, 0, 0);
      const end = new Date(year, month, date - 1, 23, 59, 59, 999);
      onChange({ from: start.toISOString(), to: end.toISOString(), preset: 'yesterday' });
      setIsOpen(false);
      return;
    }

    if (preset === 'week') {
      const currentDay = now.getDay(); // 0 is Sunday
      const diffToMonday = (currentDay + 6) % 7;
      const start = new Date(year, month, date - diffToMonday, 0, 0, 0, 0);
      const end = new Date(year, month, date + (6 - diffToMonday), 23, 59, 59, 999);
      onChange({ from: start.toISOString(), to: end.toISOString(), preset: 'week' });
      setIsOpen(false);
      return;
    }

    if (preset === 'month') {
      const start = new Date(year, month, 1, 0, 0, 0, 0);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      onChange({ from: start.toISOString(), to: end.toISOString(), preset: 'month' });
      setIsOpen(false);
      return;
    }

    if (preset === 'last30') {
      const start = new Date(year, month, date - 30, 0, 0, 0, 0);
      const end = new Date(year, month, date, 23, 59, 59, 999);
      onChange({ from: start.toISOString(), to: end.toISOString(), preset: 'last30' });
      setIsOpen(false);
      return;
    }
  };

  // Apply custom dates
  const applyCustomRange = () => {
    let fromIso = '';
    let toIso = '';

    if (fromDate) {
      const [h, m] = fromTime ? fromTime.split(':').map(Number) : [0, 0];
      const [yr, mo, dy] = fromDate.split('-').map(Number);
      fromIso = new Date(yr, mo - 1, dy, h, m, 0).toISOString();
    }

    if (toDate) {
      const [h, m] = toTime ? toTime.split(':').map(Number) : [23, 59];
      const [yr, mo, dy] = toDate.split('-').map(Number);
      toIso = new Date(yr, mo - 1, dy, h, m, 59).toISOString();
    }

    onChange({
      from: fromIso,
      to: toIso,
      preset: fromIso || toIso ? 'custom' : 'all',
    });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: '', to: '', preset: 'all' });
  };

  const isFiltered = value.preset !== 'all' || Boolean(value.from) || Boolean(value.to);

  // Formatted trigger label
  const label = useMemo(() => {
    if (value.preset === 'today') return 'Today';
    if (value.preset === 'yesterday') return 'Yesterday';
    if (value.preset === 'week') return 'This week';
    if (value.preset === 'month') return 'This month';
    if (value.preset === 'last30') return 'Last 30 days';

    if (value.from && value.to) {
      const d1 = new Date(value.from);
      const d2 = new Date(value.to);
      const fmt = (d: Date) =>
        d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const timeFmt = (d: Date) =>
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

      if (fromDate && toDate && fromDate === toDate) {
        return `${fmt(d1)} (${timeFmt(d1)}–${timeFmt(d2)})`;
      }
      return `${fmt(d1)} – ${fmt(d2)}`;
    }

    if (value.from) {
      const d = new Date(value.from);
      return `From ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }

    if (value.to) {
      const d = new Date(value.to);
      return `To ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }

    return 'Filter by time';
  }, [value, fromDate, toDate]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Filter by time and date"
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
          isFiltered
            ? 'border-indigo-400 bg-indigo-50/80 text-indigo-900 shadow-xs ring-2 ring-indigo-500/10'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        <CalendarDays
          size={14}
          className={isFiltered ? 'text-indigo-600' : 'text-slate-400'}
        />
        <span className="truncate max-w-[130px] sm:max-w-[190px]">{label}</span>
        {isFiltered ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            title="Reset date filter"
            className="ml-0.5 rounded-full p-0.5 text-indigo-400 hover:bg-indigo-200/70 hover:text-indigo-800"
          >
            <X size={12} />
          </span>
        ) : (
          <ChevronDown size={13} className="text-slate-400" />
        )}
      </button>

      {/* Flyout Popover */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-10.5 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Clock size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Time & Date Filter</h4>
                <p className="text-[10px] text-slate-500">Show data within selected window</p>
              </div>
            </div>
            {isFiltered && (
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quick Presets
            </span>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'last30', label: 'Last 30 Days' },
              ].map((p) => {
                const active = value.preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id as DateFilterPreset)}
                    className={`rounded-lg py-1.5 px-2 text-[11px] font-medium transition-all ${
                      active
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 font-bold text-slate-400">Or Custom Range</span>
            </div>
          </div>

          {/* From Selector */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700">From Date & Time</label>
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  placeholder="00:00"
                  className="h-8 w-24 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* To Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700">To Date & Time</label>
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  placeholder="23:59"
                  className="h-8 w-24 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setFromTime('');
                setToDate('');
                setToTime('');
                applyPreset('all');
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={applyCustomRange}
              disabled={!fromDate && !toDate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={13} />
              <span>Apply Range</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
