import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { CmsApi } from '@/lib/cms-api';
import '../../corporate.css';

export const dynamic = 'force-dynamic';

function ArticleBody({ content }: { content?: string }) {
  if (!content?.trim()) return null;
  return <div className="space-y-6 text-neutral-700 leading-[1.8]">{content.split(/\n\s*\n/).map((block, index) => {
    const value = block.trim();
    if (value.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold text-[#141212] pt-4">{value.slice(3)}</h2>;
    if (value.startsWith('> ')) return <blockquote key={index} className="border-l-4 border-[#F4382D] pl-5 text-xl font-semibold text-[#141212]">{value.slice(2)}</blockquote>;
    return <p key={index}>{value}</p>;
  })}</div>;
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([CmsApi.getArticle(slug), CmsApi.getArticles()]);
  if (!article) notFound();
  const related = allArticles.filter((item) => item.slug !== slug).slice(0, 3);

  return <CorporateShell><main className="wsp-insight-detail bg-white text-[#141212] font-sans antialiased">
    <header className="pt-28 pb-10 border-b border-neutral-100"><div className="max-w-[1440px] mx-auto px-6 md:px-12">
      <nav className="text-xs text-neutral-500 mb-6"><Link href="/insights" className="hover:text-[#F4382D]">News & Insights</Link> / {article.title}</nav>
      <div className="flex flex-wrap gap-3 items-center text-xs uppercase tracking-wider"><span className="bg-[#141212] text-white px-3 py-1 font-bold">{article.category}</span>{article.publishDate && <span className="text-[#F4382D] font-bold">{article.publishDate}</span>}{article.meta?.readTime && <span className="flex items-center gap-1 text-neutral-500"><Clock size={13}/>{article.meta.readTime}</span>}</div>
      <h1 className="max-w-4xl text-[32px] sm:text-[44px] lg:text-[50px] font-extrabold tracking-tight leading-tight mt-5">{article.title}</h1>
      <p className="max-w-3xl text-lg text-neutral-600 mt-5 leading-relaxed">{article.summary}</p>
      {article.author && <p className="text-sm text-neutral-500 mt-5">By {article.author}{article.meta?.authorRole ? ` · ${article.meta.authorRole}` : ''}</p>}
    </div></header>
    {article.imageUrl && <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8"><div className="relative aspect-[21/9] overflow-hidden bg-neutral-100"><Image src={article.imageUrl} alt={article.title} fill priority sizes="100vw" quality={78} className="object-cover" /></div></div>}
    <article className="max-w-[1440px] mx-auto px-6 md:px-12 py-12"><div className="max-w-3xl"><ArticleBody content={article.content} /><Link href="/insights" className="inline-flex items-center gap-2 mt-12 font-semibold hover:text-[#F4382D]"><ArrowLeft size={18}/> All articles</Link></div></article>
    {related.length > 0 && <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 border-t border-neutral-200"><h2 className="text-2xl font-bold mb-6">More insights</h2><div className="grid md:grid-cols-3 gap-5">{related.map((item) => <Link key={item.id} href={`/insights/${item.slug}`} className="border border-neutral-200 hover:border-[#F4382D] transition-colors group">{item.imageUrl && <div className="relative aspect-[16/10]"><Image src={item.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" quality={72} className="object-cover" /></div>}<div className="p-4"><span className="text-xs text-[#F4382D] font-bold uppercase">{item.category}</span><div className="flex justify-between gap-2 font-semibold mt-2">{item.title}<ArrowRight className="shrink-0 group-hover:translate-x-1 transition-transform" size={18}/></div></div></Link>)}</div></section>}
  </main></CorporateShell>;
}
