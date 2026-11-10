'use client';

import { useEffect, useState } from 'react';
import { normalizeContactInfo, PublicContactInfo } from '@/lib/contact-info';

export function usePublicContactInfo(): PublicContactInfo | null {
  const [contactInfo, setContactInfo] = useState<PublicContactInfo | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/cms/sections/contact', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Contact details unavailable');
        const data = await response.json();
        const section = Array.isArray(data)
          ? data.find((item: { sectionKey?: string }) => item.sectionKey === 'contact_info')
          : data?.contact_info || data;
        if (section?.content) setContactInfo(normalizeContactInfo(section.content));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('Could not load public contact details', error);
      });

    return () => controller.abort();
  }, []);

  return contactInfo;
}
