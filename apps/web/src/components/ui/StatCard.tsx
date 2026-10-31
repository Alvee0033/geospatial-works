import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'rose' | 'indigo' | 'mint' | 'amber';
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'indigo',
  compact = false,
}) => {
  const variantStyles = {
    rose: {
      gradient: 'from-[#FFF2F2] to-[#FFE8EB] border-[#FFD8DF]',
      iconBg: 'bg-rose-500/10 text-rose-600',
    },
    indigo: {
      gradient: 'from-[#F0F4FF] to-[#E5ECFF] border-[#D6E2FF]',
      iconBg: 'bg-indigo-500/10 text-indigo-600',
    },
    mint: {
      gradient: 'from-[#EEF9F5] to-[#DDF3EB] border-[#C8EBDD]',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
    },
    amber: {
      gradient: 'from-[#FFF9ED] to-[#FEF0D2] border-[#FDE3B0]',
      iconBg: 'bg-amber-500/10 text-amber-600',
    },
  }[variant];

  return (
    <div
      className={`${compact ? 'p-3 rounded-xl' : 'p-5 rounded-[24px]'} bg-gradient-to-br ${variantStyles.gradient} border shadow-xs transition-transform hover:-translate-y-0.5 duration-200`}
    >
      <div className={`flex items-center justify-between ${compact ? 'mb-1' : 'mb-3'}`}>
        <span className={`${compact ? 'text-[10px] uppercase tracking-wide' : 'text-xs'} font-semibold text-slate-700 tracking-tight`}>{title}</span>
        <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full flex items-center justify-center ${variantStyles.iconBg}`}>
          <Icon size={compact ? 13 : 16} />
        </div>
      </div>
      <div className={`${compact ? 'text-base' : 'text-2xl'} font-bold text-slate-900 tracking-tight`}>{value}</div>
      {subtitle && <p className={`${compact ? 'text-[10px] mt-0.5' : 'text-[11px] mt-1'} text-slate-500 font-medium`}>{subtitle}</p>}
    </div>
  );
};
