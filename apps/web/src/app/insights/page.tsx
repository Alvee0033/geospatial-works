import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { InsightListing } from '@/components/CorporateListings';
import { InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import { insights } from '@/lib/corporate-data';
import '../corporate.css';
import '../interior.css';

const featured = insights[0];

export default function InsightsPage() {
  return <CorporateShell><main className="interior-page interior-insights">
    <InteriorHero eyebrow="IDEAS AND STORIES" title="Insights" description="Simple articles about maps, land, and the work behind them." image="/inner/banner-insights.webp" mobileImage="/inner/river-aerial.webp" imageAlt="Aerial view of a Bangladesh river landscape" />
    <section className="interior-section interior-feature-section reveal"><div className="interior-shell"><div className="interior-featured-header"><span className="interior-kicker">01 / FEATURED ARTICLE</span><Link href="/insights#articles" className="interior-text-link">More articles <ArrowUpRight size={17} /></Link></div><Link href={`/insights/${featured.slug}`} className="interior-feature"><div className="interior-feature-image"><img src={featured.image} alt="Aerial view of land being mapped" loading="lazy" /></div><div className="interior-feature-copy"><span className="interior-kicker">{featured.category}</span><h2>{featured.title}</h2><p>{featured.summary}</p><span className="interior-feature-read">Read the article <ArrowUpRight size={18} /></span></div></Link></div></section>
    <section className="interior-section interior-soft reveal" id="articles"><div className="interior-shell"><InteriorHeading number="02" eyebrow="ARTICLES AND UPDATES" title="More stories from our work" description="Read simple guides to surveying, mapping, and the places we work." /><InsightListing excludeSlug={featured.slug} /></div></section>
  </main></CorporateShell>;
}
