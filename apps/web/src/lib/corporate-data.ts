export type Service = { slug: string; title: string; category: string; description: string; image: string; details: string[] };
export type Project = { slug: string; title: string; category: string; location: string; image: string; summary: string };

export const services: Service[] = [
  { slug: 'topographic-survey', title: 'Topographic & Engineering Survey', category: 'Digital Surveying', description: 'Terrain, elevation, and site feature mapping for planning and construction.', image: '/real-media/service-topographic-uav.png', details: ['Topographic mapping and contour plans', 'Construction alignment and setting out', 'Digital survey drawings and terrain models'] },
  { slug: 'uav-mapping', title: 'UAV Mapping & Photogrammetry', category: 'Aerial Survey', description: 'Aerial imagery and spatial models for large or hard-to-access sites.', image: '/real-media/service-uav-drone-lidar.png', details: ['Orthomosaic imagery', 'Digital surface models', 'Aerial site documentation'] },
  { slug: 'gis-solutions', title: 'GIS Mapping & Spatial Data', category: 'GIS Solutions', description: 'Spatial databases, analysis, and interactive maps that support decisions.', image: '/real-media/service-gis-remote-sensing.png', details: ['GIS data organization', 'Interactive map interfaces', 'Spatial analysis and reporting'] },
  { slug: 'boundary-survey', title: 'Mouza & Boundary Survey', category: 'Land Records', description: 'Land record interpretation and boundary mapping for site due diligence.', image: '/real-media/project-badc-jhopjhopia-river.jpg', details: ['Mouza map digitization', 'Boundary identification', 'Map overlays and documentation'] },
  { slug: 'bathymetric-survey', title: 'Bathymetric Survey', category: 'Hydrographic Survey', description: 'Water depth and riverbed mapping for waterways and coastal projects.', image: '/real-media/project-badc-web-ais-khulna.jpg', details: ['Depth profiles', 'Waterbed maps', 'Survey data for dredging plans'] },
  { slug: 'remote-sensing', title: 'Remote Sensing', category: 'Earth Observation', description: 'Satellite imagery analysis for land use and environmental change.', image: '/real-media/service-uav-drone-lidar.png', details: ['Land cover mapping', 'Change analysis', 'Image interpretation'] },
];

// These entries reflect work already presented by the existing website. Project
// imagery and partner attribution should be replaced with approved source assets.
export const projects: Project[] = [
  { slug: 'dhaka-ashulia-alignment', title: 'Dhaka–Ashulia Elevated Expressway Alignment', category: 'Infrastructure', location: 'Dhaka corridor', image: '/real-media/project-railway-abdulpur-bypass.jpg', summary: 'Survey and alignment work presented in the existing Geospatial Works portfolio.' },
  { slug: 'chittagong-economic-zone', title: 'Chittagong Economic Zone 3D Mapping', category: 'Aerial Survey', location: 'Mirsarai coast', image: '/real-media/service-uav-drone-lidar.png', summary: 'Aerial mapping and orthomosaic work presented in the existing portfolio.' },
  { slug: 'sylhet-floodplain', title: 'Sylhet Riverbank & Floodplain Modeling', category: 'GIS & Mapping', location: 'Surma basin', image: '/real-media/project-badc-jhopjhopia-river.jpg', summary: 'River and floodplain modeling work presented in the existing portfolio.' },
  { slug: 'coxs-bazar-topography', title: 'Cox’s Bazar Coastal Topographic Survey', category: 'Land Survey', location: 'Cox’s Bazar', image: '/real-media/project-moheshkhali-landfill.png', summary: 'Coastal topographic and land survey work presented in the existing portfolio.' },
];

export const partners = [
  { name: 'EQMS', image: '/partners/partner_1.png' },
  { name: 'Dhaka North City Corporation', image: '/partners/partner_2.webp' },
  { name: 'CEGIS', image: '/partners/partner_3.png' },
  { name: 'LGED', image: '/partners/partner_4.png' },
  { name: 'Bangladesh Power Development Board', image: '/partners/partner_5.png' },
  { name: 'BETS', image: '/partners/partner_6.png' },
  { name: 'Engineering & Planning Consultants', image: '/partners/partner_7.png' },
  { name: 'Rajshahi University', image: '/partners/partner_8.png' },
];
