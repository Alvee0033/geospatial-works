'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const slides = [
  { image: '/delta-hero-v2.png', eyebrow: 'PEOPLE / DATA / A MORE RESILIENT BANGLADESH', lines: ['Know the', 'ground.', 'Shape the future.'], description: 'Geospatial surveying, drone mapping, GIS and remote sensing for a clearer, safer and more resilient Bangladesh.', href: '/services', action: 'Explore our work' },
  { image: '/geospatial-river-hero.png', eyebrow: 'PRECISION / PERSPECTIVE / PROGRESS', lines: ['Understand', 'every place.', 'Plan with clarity.'], description: 'From field measurements to spatial insight, we help teams see the whole picture.', href: '/projects', action: 'View our projects' },
  { image: '/hero-poster.jpg', eyebrow: 'FROM THE GROUND TO THE SKY', lines: ['Better data.', 'Better maps.', 'Better decisions.'], description: 'Surveying and aerial mapping that bring complex landscapes into focus.', href: '/contact', action: 'Start a conversation' },
] as const;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[active];
  const go = (direction: number) => setActive(index => (index + direction + slides.length) % slides.length);

  return <section className="reference-hero reference-carousel" aria-label="Featured geospatial work" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    {slides.map((item, index) => <div key={item.image} className={`reference-slide-image${active === index ? ' is-active' : ''}`} style={{ backgroundImage: `url('${item.image}')` }} aria-hidden="true" />)}
    <div className="reference-hero-inner" key={active}><span className="reference-overline">{slide.eyebrow}</span><h1>{slide.lines.map((line, index) => <span key={line}>{line}{index < slide.lines.length - 1 && <br />}</span>)}</h1><p>{slide.description}</p><Link href={slide.href} className="reference-dark-button">{slide.action} <ArrowRight size={17}/></Link></div>
    <div className="reference-hero-side">LAND<br/>WATER<br/>PEOPLE<br/>POSSIBILITIES</div>
    <div className="reference-carousel-controls" aria-label="Hero carousel controls"><button type="button" onClick={() => go(-1)} aria-label="Previous slide"><ArrowLeft size={17}/></button><div>{slides.map((_, index) => <button key={index} type="button" className={index === active ? 'is-active' : ''} aria-label={`Show slide ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} />)}</div><button type="button" onClick={() => go(1)} aria-label="Next slide"><ArrowRight size={17}/></button></div>
  </section>;
}
