'use client';

import { useEffect, useRef, useState } from 'react';
import { partners } from '@/lib/corporate-data';

export default function PartnersCarousel() {
  const listRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    if (paused || interacting) return;
    const list = listRef.current;
    if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(max-width: 700px)').matches) return;

    const timer = window.setInterval(() => {
      const firstCard = list.querySelector('li');
      if (!firstCard) return;
      const step = firstCard.getBoundingClientRect().width + 10;
      const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 8;
      list.scrollTo({ left: atEnd ? 0 : list.scrollLeft + step, behavior: 'smooth' });
    }, 3200);

    return () => window.clearInterval(timer);
  }, [paused, interacting]);

  return <>
    <ul
      className="reference-partners-grid"
      ref={listRef}
      aria-label="Partner organizations"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onTouchStart={() => setInteracting(true)}
      onTouchEnd={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
    >
      {partners.map(partner => <li key={partner.name}>
        <div className="reference-partner-logo"><img src={partner.image} alt={`${partner.name} logo`} loading="lazy" /></div>
        <span>{partner.name}</span>
      </li>)}
    </ul>
    <div className="reference-partners-mobile-controls">
      <p className="reference-partners-scroll-hint">Swipe or scroll to see all partners <span aria-hidden="true">→</span></p>
      <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>
        {paused ? 'Play carousel' : 'Pause carousel'}
      </button>
    </div>
  </>;
}
