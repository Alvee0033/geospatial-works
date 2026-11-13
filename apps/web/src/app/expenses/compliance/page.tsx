'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplianceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/approvals');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm font-semibold text-slate-600">Redirecting to Approvals...</p>
      </div>
    </div>
  );
}
