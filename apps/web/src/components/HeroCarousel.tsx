'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HeroSlideData } from '@/lib/cms-api';

interface HeroCarouselProps {
  initialSlides?: HeroSlideData[];
}

const defaultSlides: HeroSlideData[] = [
  {
    id: '1',
    imageUrl: '/delta-hero-v2.webp',
    eyebrow: 'PEOPLE • DATA • RESILIENT BANGLADESH',
    heading: 'Know the Ground. Shape the Future.',
    description: 'Precision geospatial surveying, drone photogrammetry, and spatial intelligence supporting major infrastructure and development across Bangladesh.',
    primaryActionHref: '/services',
    primaryActionText: 'Explore Our Services',
    secondaryActionHref: '/contact',
    secondaryActionText: 'Send Enquiry',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: '2',
    imageUrl: '/geospatial-river-hero.webp',
    eyebrow: 'PRECISION • PERSPECTIVE • PROGRESS',
    heading: 'Understand Every Place. Plan with Clarity.',
    description: 'From sub-centimeter field measurements to GIS modeling, providing engineering teams and institutions with actionable spatial insights.',
    primaryActionHref: '/projects',
    primaryActionText: 'View Our Projects',
    secondaryActionHref: '/contact',
    secondaryActionText: 'Send Enquiry',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: '3',
    imageUrl: '/hero-poster.jpg',
    eyebrow: 'FROM THE GROUND TO THE SKY',
    heading: 'Better Data. Better Maps. Better Decisions.',
    description: 'Advanced aerial surveying and terrain analytics bringing complex river basins, urban corridors, and remote landscapes into sharp focus.',
    primaryActionHref: '/contact',
    primaryActionText: 'Start a Conversation',
    secondaryActionHref: '/contact',
    secondaryActionText: 'Send Enquiry',
    sortOrder: 3,
    isActive: true,
  },
];

export default function HeroCarousel({ initialSlides }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides && initialSlides.length > 0 ? initialSlides : defaultSlides);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Sync with live API if initialSlides not provided or update dynamically
  useEffect(() => {
    if (!initialSlides || initialSlides.length === 0) {
      fetch('/api/v1/cms/hero-slides')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSlides(data);
          }
        })
        .catch(() => {});
    }
  }, [initialSlides]);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches || slides.length <= 1) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[active] || slides[0] || defaultSlides[0];
  const go = (direction: number) => setActive((index) => (index + direction + slides.length) % slides.length);

  return (
    <section
      className="reference-hero reference-carousel"
      aria-label="Featured geospatial work"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <link rel="preload" as="image" href={slides[0]?.imageUrl || '/delta-hero-v2.webp'} fetchPriority="high" />
      {slides.map((item, index) => (
        <div
          key={item.id || item.imageUrl}
          className={`reference-slide-image${active === index ? ' is-active' : ''}`}
          style={{ backgroundImage: `url('${item.imageUrl}')` }}
          aria-hidden="true"
        />
      ))}
      <div className="reference-hero-inner" key={active}>
        <span className="reference-overline">{slide.eyebrow}</span>
        <h1>{slide.heading}</h1>
        <p>{slide.description}</p>
        <div className="reference-hero-actions">
          <Link href={slide.primaryActionHref || '/services'} className="reference-dark-button">
            <span>{slide.primaryActionText || 'Explore Our Services'}</span>
            <ArrowRight size={18} />
          </Link>
          <Link href={slide.secondaryActionHref || '/contact'} className="reference-hero-secondary-btn">
            <span>{slide.secondaryActionText || 'Send Enquiry'}</span>
          </Link>
        </div>
      </div>
      <div className="reference-carousel-controls" aria-label="Hero carousel controls">
        <button type="button" onClick={() => go(-1)} aria-label="Previous slide">
          <ArrowLeft size={17} />
        </button>
        <div>
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={index === active ? 'is-active' : ''}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Next slide">
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
