'use client';

import React from 'react';

const BACKEND_BASE = 'http://xqeqm4yyv7fqxryrkm6phk55.163.227.239.97.sslip.io';

export function resolveAvatarUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_BASE}${cleanPath}`;
}

export function getAvatarColor(name: string): string {
  const gradients = [
    'from-emerald-500 to-teal-700',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-700',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'rounded';
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  className = '',
  size = 'md',
  shape = 'rounded',
}) => {
  const [imageError, setImageError] = React.useState(false);
  const resolved = src ? resolveAvatarUrl(src) : '';
  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  if (resolved && !imageError) {
    return (
      <img
        src={resolved}
        alt={name || 'Avatar'}
        className={`${sizeClass} ${shapeClass} object-cover border border-slate-200/90 shadow-2xs shrink-0 bg-slate-100 ${className}`}
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
      />
    );
  }

  const grad = getAvatarColor(name || 'User');
  return (
    <div
      className={`${sizeClass} ${shapeClass} bg-gradient-to-tr ${grad} text-white font-extrabold flex items-center justify-center shrink-0 shadow-2xs border border-white/20 ${className}`}
    >
      {initial}
    </div>
  );
};
