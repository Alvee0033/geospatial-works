'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';

type Stat = { value: string; label: string };

type Props = {
  kicker: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  pageName: string;
  stats: Stat[];
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export default function AboutEditorialHero({
  kicker, title, description, image, imageAlt, pageName, stats, primaryLabel, secondaryLabel, secondaryHref,
}: Props) {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

  return (
    <section className="about-editorial-hero">
      <div className="about-editorial-hero-inner">
        <div className="about-editorial-copy">
          <motion.nav className="about-editorial-breadcrumb" aria-label="Breadcrumb" {...enter} transition={{ duration: 0.45 }}>
            <Link href="/">Home</Link><ChevronRight size={13} /><Link href="/about/our-story">About</Link><ChevronRight size={13} /><span>{pageName}</span>
          </motion.nav>
          <motion.p className="about-editorial-kicker" {...enter} transition={{ duration: 0.5, delay: 0.05 }}><span />{kicker}</motion.p>
          <motion.h1 {...enter} transition={{ duration: 0.6, delay: 0.1 }}>{title}</motion.h1>
          <motion.p className="about-editorial-description" {...enter} transition={{ duration: 0.6, delay: 0.17 }}>{description}</motion.p>
          <motion.div className="about-editorial-actions" {...enter} transition={{ duration: 0.5, delay: 0.23 }}>
            <Link href="/contact" className="about-editorial-primary">{primaryLabel}<ArrowRight size={16} /></Link>
            <Link href={secondaryHref} className="about-editorial-secondary">{secondaryLabel}<ArrowRight size={15} /></Link>
          </motion.div>
        </div>
        <motion.figure className="about-editorial-image" initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>
          <Image src={image} alt={imageAlt} fill priority sizes="(max-width: 850px) 100vw, 46vw" className="about-editorial-image-photo" />
          <figcaption><span className="about-editorial-image-dot" />Geospatial Works <span>/</span> Bangladesh</figcaption>
        </motion.figure>
        <div className="about-editorial-stats" aria-label="Key facts">
          {stats.slice(0, 4).map((stat, index) => (
            <motion.div key={`${stat.value}-${index}`} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.32 + index * 0.07 }}>
              <strong>{stat.value}</strong><span>{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
