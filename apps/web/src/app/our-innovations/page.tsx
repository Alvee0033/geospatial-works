import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { InteriorCta, InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import '../corporate.css';
import '../interior.css';

const solutions = [
  { number: '01', title: 'See a site from above', description: 'Drone photos help us see large places clearly, even when they are hard to reach on foot.', image: '/inner/drone-fields.webp', href: '/services/uav-mapping', label: 'See drone mapping' },
  { number: '02', title: 'Put the pieces together', description: 'We bring maps and site information into one clear picture.', image: '/inner/river-aerial.webp', href: '/services/gis-solutions', label: 'See our map services' },
  { number: '03', title: 'Share a useful map', description: 'Online maps help your team explore a place and share what they find.', image: '/inner/gis-analyst.webp', href: '/services/gis-solutions', label: 'See online maps' },
];

export default function InnovationsPage() {
  return <CorporateShell><main className="interior-page">
    <InteriorHero eyebrow="A BETTER VIEW" title="Our Innovations" description="New ways to see a site, understand it, and share a clear map." image="/inner/banner-innovations.webp" mobileImage="/inner/gis-analyst.webp" imageAlt="GIS analyst examining digital maps" dark />
    <section className="interior-section reveal"><div className="interior-shell"><InteriorHeading number="01" eyebrow="WHAT WE MAKE" title="Good information, made easy to use." description="We use cameras, maps, and simple tools to help you see what matters." /><div className="interior-innovation-grid">{solutions.map(item => <article key={item.number}><div className="interior-card-image"><img src={item.image} alt="" loading="lazy" /></div><div><span className="interior-kicker">{item.number} / OUR WORK</span><h3>{item.title}</h3><p>{item.description}</p><Link href={item.href} className="interior-text-link">{item.label} <ArrowUpRight size={18} /></Link></div></article>)}</div></div></section>
    <section className="interior-section interior-soft reveal"><div className="interior-shell"><InteriorHeading number="02" eyebrow="HOW IT WORKS" title="See it. Understand it. Share it." /><div className="interior-process"><div><b>01</b><h3>Visit</h3><p>We learn about your site and what you need.</p></div><div><b>02</b><h3>Record</h3><p>We collect photos and measurements.</p></div><div><b>03</b><h3>Make sense</h3><p>We put the information into a clear map.</p></div><div><b>04</b><h3>Share</h3><p>Your team gets a map it can use.</p></div></div></div></section>
    <InteriorCta title="See your project more clearly." />
  </main></CorporateShell>;
}
