import { notFound } from 'next/navigation';
import CorporateShell from '@/components/CorporateShell';
import { InteriorHeading, InteriorHero } from '@/components/InteriorDesign';
import { InsightGrid } from '@/components/CorporateSections';
import { insights } from '@/lib/corporate-data';
import { insightContent } from '@/lib/insight-content';
import '../../corporate.css';
import '../../interior.css';

export function generateStaticParams() { return insights.map(({ slug }) => ({ slug })); }

export default async function InsightDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = insights.find(item => item.slug === slug);
  if (!insight) notFound();
  return <CorporateShell><main className="interior-page interior-detail">
    <InteriorHero eyebrow={`INSIGHTS / ${insight.category}`} title={insight.title} description={insight.summary} image="/inner/banner-insights.webp" mobileImage="/inner/river-aerial.webp" imageAlt="Aerial view of river and settled landscape" />
    <section className="interior-section reveal"><div className="interior-shell interior-article"><div className="interior-photo interior-article-photo"><img src={insight.image} alt="" loading="lazy" /></div><div className="interior-article-body"><span className="interior-kicker">ARTICLE / {insight.category}</span><h2>{insight.title}</h2><p className="interior-article-lead">{insight.summary}</p>{insightContent[slug]?.map(section => <section key={section.heading}><h3>{section.heading}</h3>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}</div></div></section>
    <section className="interior-section interior-soft reveal"><div className="interior-shell"><InteriorHeading number="02" eyebrow="MORE ARTICLES" title="Read more about our work" href="/insights" linkText="All articles" /><InsightGrid limit={3} /></div></section>
  </main></CorporateShell>;
}
