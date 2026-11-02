'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sections = document.querySelectorAll<HTMLElement>('.reference-home .reveal, .interior-page .reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        target.classList.add('is-revealing');
        observer.unobserve(target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
