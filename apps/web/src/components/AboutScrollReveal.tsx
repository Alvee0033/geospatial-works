'use client';

import { useEffect } from 'react';

export default function AboutScrollReveal() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.about-detail-page > section:not(.about-editorial-hero)');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('about-section-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        target.classList.add('about-section-visible');
        observer.unobserve(target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -36px 0px' });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}
