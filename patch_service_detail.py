with open('apps/web/src/app/services/[slug]/page.tsx', 'r') as f:
    text = f.read()

# Let's inspect imports and add CmsApi
old_imports = """import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowRight, CheckCircle2, ShieldCheck, Wrench, Layers } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import '../../corporate.css';"""

new_imports = """import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowRight, CheckCircle2, ShieldCheck, Wrench, Layers } from 'lucide-react';
import CorporateShell from '@/components/CorporateShell';
import { CmsApi } from '@/lib/cms-api';
import '../../corporate.css';

export const revalidate = 10;"""

assert old_imports in text, "old_imports not found"
text = text.replace(old_imports, new_imports)

# Replace all legacy /inner/ and demo images in serviceDetails dictionary
replacements = [
    ("image: '/field-surveyor-v2.webp',", "image: '/real-media/service-topographic-uav.png',"),
    ("image: '/inner/drone-fields.webp',", "image: '/real-media/service-uav-drone-lidar.png',"),
    ("image: '/inner/gis-analyst.webp',", "image: '/real-media/service-gis-remote-sensing.png',"),
    ("image: '/geospatial-river-hero.webp',", "image: '/real-media/project-badc-jhopjhopia-river.jpg',"),
    ("image: '/delta-hero-v2.webp',", "image: '/real-media/service-road-bridge-engineering.jpg',"),
    ("image: '/hero-poster.jpg',", "image: '/real-media/equipment-rtk-gnss-station.jpg',"),
]

for old_str, new_str in replacements:
    assert old_str in text, f"{old_str} not found in text"
    text = text.replace(old_str, new_str)

# In ServiceDetailPage component, dynamically fetch from CmsApi so admin edits override static defaults!
old_comp = """export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceDetails[slug];

  if (!service) notFound();"""

new_comp = """export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Try fetching service data from Admin CMS backend first
  const cmsServices = await CmsApi.getServices().catch(() => []);
  const dbService = cmsServices.find((s: any) => s.slug === slug || s.id === slug);

  const baseService = serviceDetails[slug] || (dbService ? {
    slug: dbService.slug,
    title: dbService.title,
    category: dbService.category || 'Engineering Services',
    lead: dbService.description || '',
    description: dbService.description || '',
    image: dbService.imageUrl || '/real-media/service-topographic-uav.png',
    equipment: ['Trimble / Leica Dual-Frequency GNSS RTK Receivers', 'Robotic Total Stations', 'Digital Leveling Instruments'],
    deliverables: dbService.features && dbService.features.length > 0 ? dbService.features : ['CAD Topographic Plans', '3D Surface Models', 'Engineering Survey Dossier'],
    standards: ['Survey of Bangladesh (SOB) PWD Datum', 'BTM (Bangladesh Transverse Mercator) Projection'],
    benefits: ['Sub-centimeter spatial accuracy', 'Certified legal defensibility', 'Eliminate redesign & earthwork volume errors'],
  } : null);

  if (!baseService) notFound();

  // Merge live admin CMS fields if available
  const service: ServiceDetail = {
    ...baseService,
    title: dbService?.title || baseService.title,
    category: dbService?.category || baseService.category,
    description: dbService?.description || baseService.description,
    image: dbService?.imageUrl || baseService.image,
    deliverables: (dbService?.features && dbService.features.length > 0) ? dbService.features : baseService.deliverables,
  };"""

assert old_comp in text, "old_comp not found"
text = text.replace(old_comp, new_comp)

with open('apps/web/src/app/services/[slug]/page.tsx', 'w') as f:
    f.write(text)

print("services/[slug]/page.tsx successfully patched with real media and dynamic CMS override!")
