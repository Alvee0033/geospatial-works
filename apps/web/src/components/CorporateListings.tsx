'use client';

import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { insights, projects } from '@/lib/corporate-data';

export function ProjectListing() {
  const [category, setCategory] = useState('All Projects');
  const categories = ['All Projects', ...new Set(projects.map(item => item.category))];
  const filtered = category === 'All Projects' ? projects : projects.filter(item => item.category === category);
  return <><div className="corporate-filter-row" aria-label="Filter projects">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="corporate-card-grid">{filtered.map(project => <article className="corporate-card" key={project.slug}><Link href={`/projects/${project.slug}`} className="corporate-card-image"><img src={project.image} alt="" loading="lazy" /><span className="corporate-image-tag">{project.category}</span></Link><div className="corporate-card-body"><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.location}</p><Link href={`/projects/${project.slug}`} className="corporate-card-link">View Project <ArrowUpRight size={15} /></Link></div></article>)}</div></>;
}

export function InsightListing({ excludeSlug }: { excludeSlug?: string }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => insights.filter(item => item.slug !== excludeSlug && `${item.title} ${item.category} ${item.summary}`.toLowerCase().includes(query.trim().toLowerCase())), [query, excludeSlug]);
  return <><label className="corporate-search"><Search size={18} /><span className="sr-only">Search insights</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search insights" /></label>{filtered.length ? <div className="corporate-card-grid">{filtered.map(item => <article className="corporate-card" key={item.slug}><Link href={`/insights/${item.slug}`} className="corporate-card-image"><img src={item.image} alt="" loading="lazy" /></Link><div className="corporate-card-body"><span className="corporate-card-category">{item.category}</span><h3><Link href={`/insights/${item.slug}`}>{item.title}</Link></h3><p>{item.summary}</p><Link href={`/insights/${item.slug}`} className="corporate-card-link">Read More <ArrowUpRight size={15} /></Link></div></article>)}</div> : <div className="corporate-empty">No insights match your search.</div>}</>;
}
