'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { projects } from '@/lib/corporate-data';

export function ProjectListing() {
  const [category, setCategory] = useState('All Projects');
  const categories = ['All Projects', ...new Set(projects.map(item => item.category))];
  const filtered = category === 'All Projects' ? projects : projects.filter(item => item.category === category);
  return <><div className="corporate-filter-row" aria-label="Filter projects">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="corporate-card-grid">{filtered.map(project => <article className="corporate-card" key={project.slug}><Link href={`/projects/${project.slug}`} className="corporate-card-image"><Image src={project.image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" quality={72} /><span className="corporate-image-tag">{project.category}</span></Link><div className="corporate-card-body"><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.location}</p><Link href={`/projects/${project.slug}`} className="corporate-card-link">View Project <ArrowUpRight size={15} /></Link></div></article>)}</div></>;
}

