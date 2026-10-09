'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'pop-zoom' | 'cinematic';
  delay?: number;
  duration?: number;
  margin?: string;
}

const ScrollReveal = ({
  children,
  className = '',
  variant = 'cinematic',
  delay = 0,
  duration = 0.5,
  margin
}: ScrollRevealProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getVariants = () => {
    // On mobile, use lighter shifts and remove blur filters to prevent GPU frame drops & white screen lag
    const yShift = isMobile ? 20 : 35;
    const xShift = isMobile ? 15 : 35;

    switch (variant) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
      case 'slide-up':
        return {
          hidden: { opacity: 0, y: yShift },
          visible: { opacity: 1, y: 0 }
        };
      case 'slide-down':
        return {
          hidden: { opacity: 0, y: -yShift },
          visible: { opacity: 1, y: 0 }
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: xShift },
          visible: { opacity: 1, x: 0 }
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -xShift },
          visible: { opacity: 1, x: 0 }
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.96 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'pop-zoom':
        return {
          hidden: { opacity: 0, scale: isMobile ? 0.92 : 0.88, y: isMobile ? 15 : 30 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: {
              type: "spring" as const,
              stiffness: isMobile ? 180 : 120,
              damping: isMobile ? 18 : 14,
              mass: 0.7,
              delay: isMobile ? Math.min(delay, 0.1) : delay
            }
          }
        };
      case 'cinematic':
        return {
          hidden: { 
            opacity: 0, 
            y: yShift, 
            scale: isMobile ? 0.99 : 0.97,
            filter: isMobile ? 'none' : 'blur(4px)' 
          },
          visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            filter: 'none' 
          }
        };
      default:
        return {
          hidden: { opacity: 0, y: yShift },
          visible: { opacity: 1, y: 0 }
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      // Generous positive rootMargin (100px) triggers reveal BEFORE reaching element on mobile touch scroll
      viewport={{ 
        once: true, 
        margin: margin || "100px 0px 100px 0px",
        amount: 0.05
      }}
      transition={{
        duration: isMobile ? Math.min(duration, 0.4) : duration,
        delay: isMobile ? Math.min(delay, 0.15) : delay,
        ease: [0.22, 1, 0.36, 1] // Fast, buttery smooth cubic bezier
      }}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
