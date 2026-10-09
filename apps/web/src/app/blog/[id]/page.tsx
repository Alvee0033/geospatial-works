import BlogDetailClient, { BlogPostData } from '@/components/BlogDetailClient';

const posts: BlogPostData[] = [
  {
    id: 1,
    category: 'uav',
    title: "Deploying DJI Matrice 300 RTK & LiDAR in Bangladesh's Deltaic Terrain",
    subtitle: "A technical study on active laser scanning, vegetation penetration, and elevation accuracy verification.",
    summary: "A technical overview of utilizing multi-frequency LiDAR mapping systems in the high-humidity, vegetation-dense areas of central Bangladesh.",
    content: [
      "Bangladesh's deltaic river channels and floodplains feature highly dynamic terrain under constant monsoonal influence. Capturing accurate elevation models is critical for flood mitigation, highway design, and bridge planning. However, dense foliage and aquatic plants pose severe barriers to standard optical camera drone photogrammetry.",
      "Optical cameras cannot pierce thick canopies; they only capture the top leaf layers, leading to digital elevation models that skew vertical accuracy by several meters in forested tracts. To solve this, we deploy active light detection and ranging (LiDAR) sensors on a DJI Matrice 300 RTK platform.",
      "LiDAR works by emitting millions of laser pulses per second, which pass through small gaps in leaves and bounce back from the underlying soil. By classifying these returns, we strip away vegetation layers mathematically to reveal the true bare-earth Digital Terrain Model (DTM).",
      "We set up physical geodetic Ground Control Points (GCPs) across the survey area using dual-frequency Trimble R12 GNSS receivers, tied directly to the Survey of Bangladesh (SOB) Geodetic Control Network monument datum points. These control points allow us to calculate the absolute vertical and horizontal error limits of the LiDAR scans. The resulting vertical absolute accuracy matches ASPRS Class 1 mapping thresholds (under 5 centimeters), providing engineering-grade topo data for structural designs."
    ],
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=70&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-thick-forest-and-river-34448-large.mp4",
    date: "May 12, 2026",
    readTime: "5 min read",
    author: "Engr. Alvee Rahman",
    details: {
      equipment: "DJI Matrice 300 RTK, Zenmuse L1 LiDAR, Trimble R12 GNSS",
      accuracy: "Vertical: <5cm absolute, Horizontal: <3cm absolute",
      datum: "SOB Grid Zone 45N (Everest 1830 Ellipsoid)"
    }
  },
  {
    id: 2,
    category: 'cadastral',
    title: "Resolving Mouza Sheet Conflicts: The Math of Georeferencing CS, SA, RS, and BS",
    subtitle: "Helmert boundary coordinate transformations and geodetic control networks in Bangladesh.",
    summary: "How scale ratios, Sobel edge matching, and SOB geodetic monument links superimpose century-old cadastral records onto modern coordinates.",
    content: [
      "Property boundaries in Bangladesh are governed by cadastral maps called Mouza sheets. These maps were drafted across different decades under varying survey regimes: CS (Cadastral Survey 1888-1940), SA (State Acquisition 1956-1963), RS (Revisional Survey 1965-1998), and modern BS (Bangladesh Survey 1998-present).",
      "Because legacy maps were drawn by hand on paper using units like links (Gunter's Chain), they warp, stretch, and contract over decades due to atmospheric humidity. When modern real estate developers buy land, overlaying a GPS boundary onto a warped paper map introduces substantial overlap conflicts.",
      "Our georeferencing pipeline uses a mathematical Helmert coordinate transformation model (affine scale, translation, and rotation matching) to correct paper distortion. We first locate historical benchmarks in the field, map them using Total Stations, and cross-reference them with geodetic control monuments established by the Survey of Bangladesh (SOB).",
      "We digitize original mouza sheets at high resolution and run scale-invariant feature extraction to identify original plot boundary lines. This allows us to superimpose the historical plot limits onto modern satellite imagery and GNSS coordinates, resolving overlap conflicts with transparent, court-admissible surveyor reports."
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=70&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-designer-working-on-a-tablet-41270-large.mp4",
    date: "April 28, 2026",
    readTime: "7 min read",
    author: "L.S. Kabir Ahmed",
    details: {
      equipment: "Helmert Affine Engine, SOB Benchmark Records, Digitizer Tables",
      accuracy: "Sub-pixel map matching, field verification ±15mm",
      datum: "WGS84 Ellipsoid to local Everest 1830 coordinates"
    }
  },
  {
    id: 3,
    category: 'gis',
    title: "Building Interactive Web-GIS Map Portals for Municipal Development",
    subtitle: "A case study on building web-GIS map dashboard panels to track municipal tax zones.",
    summary: "How smart web-GIS map dashboard panels can visualize property holdings, road networks, and tax parameters for city corporations.",
    content: [
      "Municipalities (Pourashavas) and City Corporations in Bangladesh struggle to maintain updated registers of building developments. Property holdings expand faster than tax records can be audited manually, leading to major leaks in municipal revenue streams.",
      "A spatial solution integrates GIS maps directly with tax databases. Using high-resolution aerial orthomosaics, we digitize every single building footprint (holding boundary) and assign a unique spatial ID. These shapes are stored in a relational PostgreSQL database equipped with PostGIS spatial extensions.",
      "We can then run complex spatial SQL queries. For example, we can calculate building footprint areas, check them against the declared building plans, and identify holding extensions that violate code or avoid proper tax brackets.",
      "Finally, this database is exposed on an interactive, secure React-based Mapbox portal. Municipal officers can search by holding ID, view building height profiles, water connections, road widths, and tax billing statuses directly on the map, drastically increasing tax compliance and auditing speed."
    ],
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=70&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-data-processing-screen-of-a-server-42289-large.mp4",
    date: "March 18, 2026",
    readTime: "6 min read",
    author: "GIS Lead J. Hossain",
    details: {
      equipment: "QGIS Desktop, PostgreSQL, PostGIS, Mapbox WebGL engines",
      accuracy: "Footprint matching tolerance <0.1m",
      datum: "Bangladesh Transverse Mercator (BTM) projection"
    }
  },
  {
    id: 4,
    category: 'hydro',
    title: "River Delta Bathymetric Surveys: Single-Beam Echolocation in Silt-Heavy Channels",
    subtitle: "Sediment transport mapping and volumetric computations for capital dredging.",
    summary: "How sediment shifts and dynamic riverbed contours require constant bathymetric mapping to prevent commercial shipping groundings.",
    content: [
      "Bangladesh features the largest river delta system in the world. Rivers like the Padma, Meghna, and Jamuna transport over one billion tons of sediment annually. This silt accumulates rapidly, shifting shipping channels, reducing riverbed capacity, and causing shipping container vessels to run aground.",
      "Maintaining navigability requires constant bathymetric depth surveys. We deploy compact hydrographic survey boats equipped with high-frequency single-beam echo sounders (e.g., South SDE-28S). The echo sounders record depth parameters, while L1/L2 RTK GPS receivers capture coordinates concurrently.",
      "We correct the raw depth measurements using real-time tide telemetry gauges. The data points are compiled inside specialized bathymetric processing engines to generate 3D underwater contour meshes.",
      "Comparing these meshes with previous surveys allows us to calculate absolute silt accumulation volume. Dredging companies use our volumetric worksheets to target dredging sites and audit the amount of material excavated from riverbeds."
    ],
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=70&w=600",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-water-flowing-under-a-small-bridge-in-a-forest-34288-large.mp4",
    date: "Feb 05, 2026",
    readTime: "4 min read",
    author: "Hydrographer S. Dewan",
    details: {
      equipment: "South SDE-28S Echo Sounder, georeferenced RTK base",
      accuracy: "Depth Resolution: ±1cm, Position accuracy: ±10mm",
      datum: "BIWTA Hydrographic Chart Datum"
    }
  }
];

export function generateStaticParams() {
  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const numericId = parseInt(resolvedParams.id, 10);
  const post = posts.find((p) => p.id === numericId) || posts[0];

  return <BlogDetailClient post={post} />;
}
