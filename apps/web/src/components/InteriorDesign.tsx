import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

type HeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  imageAlt: string;
  dark?: boolean;
  action?: { label: string; href: string };
};

export function InteriorHero({ eyebrow, title, description, image, mobileImage, imageAlt, dark = false, action }: HeroProps) {
  return <section className={`interior-hero${dark ? ' interior-hero-dark' : ''}`}>
    <div className="interior-hero-copy">
      <span className="interior-kicker">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {action && <Link className="interior-action" href={action.href}>{action.label}<ArrowUpRight size={17} aria-hidden="true" /></Link>}
    </div>
    <div className="interior-hero-media">{mobileImage ? <><Image src={image} alt={imageAlt} fill sizes="(max-width: 650px) 1px, 52vw" quality={76} className="hidden min-[651px]:block object-cover" /><Image src={mobileImage} alt="" fill sizes="(max-width: 650px) 100vw, 1px" quality={72} className="min-[651px]:hidden object-cover" /></> : <Image src={image} alt={imageAlt} fill sizes="(max-width: 650px) 100vw, 52vw" quality={76} className="object-cover" />}<span aria-hidden="true">PEOPLE / DATA / PLACES</span></div>
  </section>;
}

export function InteriorHeading({ number, eyebrow, title, description, href, linkText }: {
  number?: string;
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkText?: string;
}) {
  return <div className="interior-heading"><div><span className="interior-kicker">{number && <b>{number} / </b>}{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>{href && <Link href={href} className="interior-text-link">{linkText || 'Explore more'} <ArrowUpRight size={18} aria-hidden="true" /></Link>}</div>;
}

export function InteriorCta({ title, description = 'Tell us what you need to understand about your site.', image = '/inner/wetland-aerial.webp' }: {
  title: string;
  description?: string;
  image?: string;
}) {
  return <section className="interior-cta" style={{ backgroundImage: `linear-gradient(90deg,rgba(11,31,68,.95),rgba(15,43,92,.75)),url('${image}')` }}>
    <div className="interior-shell interior-cta-inner"><div><span className="interior-kicker">LET’S WORK TOGETHER</span><h2>{title}</h2><p>{description}</p></div><Link href="/contact" className="interior-action">Start a conversation <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
  </section>;
}
