import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { partners, projects, services } from '@/lib/corporate-data';

export function PageHero({ eyebrow, title, description, image }: { eyebrow: string; title: string; description: string; image?: string }) {
  return <section className="corporate-page-hero" style={image ? { backgroundImage: `linear-gradient(90deg,rgba(0,26,38,.94),rgba(0,32,46,.64)),url('${image}')` } : undefined}>
    <div className="corporate-container"><span className="corporate-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
  </section>;
}

export function SectionHeading({ eyebrow, title, description, href, linkText }: { eyebrow: string; title: string; description?: string; href?: string; linkText?: string }) {
  return <div className="corporate-section-heading"><div><span className="corporate-eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>{href && <Link href={href} className="corporate-text-link">{linkText || 'View All'} <ArrowRight size={17} /></Link>}</div>;
}

export function ServiceGrid({ limit }: { limit?: number }) {
  return <div className="corporate-card-grid">{services.slice(0, limit).map(service => <article className="corporate-card" key={service.slug}>
    <Link href={`/services/${service.slug}`} className="corporate-card-image"><img src={service.image} alt="" loading="lazy" /></Link>
    <div className="corporate-card-body"><span className="corporate-card-category">{service.category}</span><h3><Link href={`/services/${service.slug}`}>{service.title}</Link></h3><p>{service.description}</p><Link href={`/services/${service.slug}`} className="corporate-card-link">Read More <ArrowUpRight size={15} /></Link></div>
  </article>)}</div>;
}

export function ProjectGrid({ limit }: { limit?: number }) {
  return <div className="corporate-card-grid">{projects.slice(0, limit).map(project => <article className="corporate-card" key={project.slug}>
    <Link href={`/projects/${project.slug}`} className="corporate-card-image"><img src={project.image} alt="" loading="lazy" /><span className="corporate-image-tag">{project.category}</span></Link>
    <div className="corporate-card-body"><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.location}</p><Link href={`/projects/${project.slug}`} className="corporate-card-link">View Project <ArrowUpRight size={15} /></Link></div>
  </article>)}</div>;
}

export function PartnerStrip() {
  return <section className="corporate-partners"><div className="corporate-container"><h2>Our Partners</h2><div className="corporate-partner-logos">{partners.map(partner => <img key={partner.name} src={partner.image} alt={`${partner.name} logo`} loading="lazy" />)}</div></div></section>;
}
