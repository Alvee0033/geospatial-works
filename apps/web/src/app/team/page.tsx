import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { InteriorCta, InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import '../corporate.css';
import '../interior.css';

const teamRoles = [
  ['Field Survey Lead', 'Plans the measurements we need at each site.'],
  ['Drone Operator', 'Takes aerial photos that show the full site.'],
  ['Map Analyst', 'Checks information and turns it into clear maps.'],
  ['Senior Surveyor', 'Guides careful field measurements and quality checks.'],
  ['Field Coordinator', 'Helps the site team work safely and on time.'],
  ['Water Surveyor', 'Measures rivers and other waterways.'],
  ['Land Records Specialist', 'Compares boundary records with site maps.'],
  ['Site Surveyor', 'Records land levels, roads, and key features.'],
  ['Digital Map Maker', 'Builds easy-to-use maps for project teams.'],
] as const;

const moments = [
  { image: '/inner/field-surveyor.webp', caption: 'Measure the land' },
  { image: '/inner/field-team.webp', caption: 'Plan together' },
  { image: '/inner/drone-fields.webp', caption: 'See the whole site' },
  { image: '/inner/gis-analyst.webp', caption: 'Make useful maps' },
];

export default function TeamPage() {
  return <CorporateShell><main className="interior-page interior-team">
    <InteriorHero eyebrow="PEOPLE BEHIND THE MAPS" title="Our Team" description="Meet the people who work in the field, study the information, and make the maps." image="/inner/banner-team.webp" mobileImage="/inner/field-team.webp" imageAlt="Field team reviewing a map" action={{ label: 'Work with us', href: '/contact' }} />
    <section className="interior-section reveal"><div className="interior-shell"><InteriorHeading number="01" eyebrow="LEADERSHIP" title="Chief Executive Officer" description="Guiding the team’s work across land surveys, aerial photos, and clear maps." /><div className="interior-team-lead"><div className="interior-team-lead-image"><img src="/inner/team-01.webp" alt="Illustrative portrait representing the chief executive role" loading="lazy" /><span>ILLUSTRATIVE PORTRAIT</span></div><div className="interior-team-lead-copy"><span className="interior-kicker">LEADERSHIP / GEOSPATIAL WORKS</span><h3>Leading the work forward</h3><p className="interior-team-lead-role">Chief Executive Officer</p><p>The CEO guides how our field and office teams work together. The focus is simple: careful measurements, clear maps, and information clients can use with confidence.</p><div className="interior-team-lead-social"><span>Connect with Geospatial Works</span><a href="https://www.linkedin.com/company/geospatial-works-bangladesh/" target="_blank" rel="noopener noreferrer" aria-label="Geospatial Works on LinkedIn"><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.5V9.2h2.84v1.3h.04c.39-.74 1.36-1.52 2.8-1.52 3 0 3.57 1.98 3.57 4.55v5.22Z" /></svg></a><a href="mailto:info@geospatialworks.com.bd" aria-label="Email Geospatial Works"><Mail size={19} aria-hidden="true" /></a></div></div></div></div></section>
    <section className="interior-section interior-soft reveal"><div className="interior-shell"><InteriorHeading number="02" eyebrow="THE TEAM" title="People with different skills" description="Field and office roles work together on every project. These portraits illustrate the roles; they are not staff photos." /><div className="interior-team-grid">{teamRoles.map(([title, text], index) => <article key={title}><img src={`/inner/team-${String(index + 2).padStart(2, '0')}.webp`} alt={`Illustrative portrait for the ${title} role`} loading="lazy" /><div><span>{String(index + 2).padStart(2, '0')} / TEAM ROLE</span><h3>{title}</h3><p>{text}</p><a className="interior-team-card-contact" href={`mailto:info@geospatialworks.com.bd?subject=${encodeURIComponent(`Question about ${title}`)}`}>Contact our team <Mail size={14} aria-hidden="true" /></a></div></article>)}</div></div></section>
    <section className="interior-section reveal"><div className="interior-shell"><InteriorHeading number="03" eyebrow="AT WORK" title="In the field and at the desk" /><div className="interior-mosaic">{moments.map(({image,caption}) => <div key={caption}><img src={image} alt={caption} loading="lazy" /><span>{caption}</span></div>)}</div></div></section>
    <section className="interior-section reveal"><div className="interior-shell interior-team-note"><div><span className="interior-kicker">WORKING TOGETHER</span><h2>One clear picture, made together.</h2></div><div><p>Each project needs the right mix of field work, photos, maps, and local knowledge. We bring those parts together around the questions you need answered.</p><Link className="interior-text-link" href="/career">Explore careers <ArrowUpRight size={18} /></Link></div></div></section>
    <InteriorCta title="Talk to our team about your project." image="/inner/field-team.webp" />
  </main></CorporateShell>;
}
