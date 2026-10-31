import React from 'react';

export type BadgeStatus = 'approved' | 'pending' | 'rejected' | 'office' | 'field' | 'home' | 'paid' | 'ongoing' | 'completed';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let display = label || status;

  if (norm === 'approved' || norm === 'paid' || norm === 'completed' || norm === 'present' || norm === 'taken') {
    styles = 'bg-[#E8FAF2] text-[#0EA971] border-[#C7F4DE]';
  } else if (norm === 'pending' || norm === 'submitted' || norm === 'ongoing' || norm === 'review') {
    styles = 'bg-[#EEF2FF] text-[#4F46E5] border-[#DCE4FF]';
  } else if (norm === 'field') {
    styles = 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]';
    display = display || 'Field Site';
  } else if (norm === 'home' || norm === 'home_office') {
    styles = 'bg-[#FAF5FF] text-[#9333EA] border-[#E9D5FF]';
    display = display || 'Home Office';
  } else if (norm === 'office') {
    styles = 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
    display = display || 'Office HQ';
  } else if (norm === 'rejected' || norm === 'absent' || norm === 'missed') {
    styles = 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles}`}>
      {display}
    </span>
  );
};
