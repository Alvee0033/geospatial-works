'use client';
import React, { useEffect, useMemo, useRef, ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollFloatProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'top bottom+=20%',
  scrollEnd = 'bottom top-=20%',
  stagger = 0.03
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span key={index} className="inline-block" style={{ transformStyle: 'preserve-3d' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll('span');
    if (!chars.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          opacity: 0,
          y: 40,
          scaleY: 1.4,
          scaleX: 0.8,
          transformOrigin: '0% 50%',
        },
        {
          opacity: 1,
          y: 0,
          scaleY: 1,
          scaleX: 1,
          stagger: stagger,
          duration: animationDuration,
          ease: ease,
          scrollTrigger: {
            trigger: el,
            start: scrollStart,
            end: scrollEnd,
            scrub: 1,
            scroller: scrollContainerRef?.current || window,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2 ref={containerRef} className={`overflow-hidden flex flex-wrap justify-center ${containerClassName}`}>
      <span className={`inline-block ${textClassName}`}>
        {splitText}
      </span>
    </h2>
  );
};

export default ScrollFloat;
