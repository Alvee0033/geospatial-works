import ExpertiseDetailClient, { ExpertiseItemData } from '@/components/ExpertiseDetailClient';

const expertiseItems: ExpertiseItemData[] = [
  {
    id: 1,
    category: 'topo',
    title: 'Topographical & Engineering Surveying',
    iconName: 'Ruler',
    desc: "Millimeter-grade 3D elevation models, contour lines, and physical feature mapping. We align baseline reference loops directly to Survey of Bangladesh Geodetic control points for maximum accuracy.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=70&w=600",
    features: ["Ellipsoid & Orthometric Height Matching", "Site Boundary & Total Station Setups", "Volumetric Earthwork Computations"],
    fullDetails: {
      overview: "Topographical and engineering surveys form the foundational backbone for all civil engineering, mega infrastructure, and industrial developments. Our team deploys multi-frequency RTK GNSS receivers coupled with Leica total stations to map exact terrain contours, physical boundaries, utilities, and ground features.",
      methodology: "We establish physical geodetic control networks anchored to SOB (Survey of Bangladesh) primary datum monuments. Using precise leveling loops and reflectorless laser electronic total stations, we record millions of physical coordinate observations.",
      applications: [
        "Highway and railway alignment planning",
        "Industrial factory layout and structural grid positioning",
        "Drainage network elevation profiling",
        "Volumetric earthwork computation for cut-and-fill auditing"
      ],
      deliverables: [
        "DWG / DXF CAD Contour & Topo Maps",
        "Digital Elevation Models (DEM / DTM)",
        "Cross-Section and Longitudinal Elevation Profiles",
        "Certified Boundary Coordinates Worksheet"
      ],
      accuracyStandards: "Horizontal: ±5mm, Vertical: ±8mm (ASPRS Class 1)"
    }
  },
  {
    id: 2,
    category: 'uav',
    title: 'UAV Drone Photogrammetry & LiDAR',
    iconName: 'Crosshair',
    desc: "Deploying commercial mapping drones calibrated with dual-frequency Ground Control Points (GCPs). Ideal for fast topological audits, stockpile calculation, and orthophoto compilation.",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=70&w=600",
    features: ["1cm/pixel Ground Sample Distance (GSD)", "3D Digital Surface Models (DSM)", "Large-scale Orthomosaic Mapping"],
    fullDetails: {
      overview: "Aerial photogrammetry and airborne LiDAR technology enable rapid spatial data collection across massive geographic regions. By acquiring high-density point clouds from above, we produce sub-centimeter orthomosaics and digital terrain models (DTM) that pierce through vegetation layers.",
      methodology: "Using multi-frequency RTK mapping drones like the DJI Matrice 300 RTK paired with Zenmuse L1 LiDAR sensors, we execute automated flight paths. Physical Ground Control Points (GCPs) measured via GNSS receivers correct lens distortion and spatial drift.",
      applications: [
        "Large-scale agricultural land mapping",
        "Mining and quarry volume measurement",
        "Disaster damage & river erosion assessment",
        "Smart city 3D mesh reconstruction"
      ],
      deliverables: [
        "Sub-centimeter GeoTIFF Orthomosaics",
        "High-density LAS / LAZ Point Clouds",
        "3D Textured Mesh Models (.OBJ, .FBX)",
        "Stockpile Cut & Fill Volumetric Reports"
      ],
      accuracyStandards: "Ground Sample Distance: 0.8cm/pixel, Vertical: ±15mm"
    }
  },
  {
    id: 3,
    category: 'gis',
    title: 'GIS Database Development & Analytics',
    iconName: 'Database',
    desc: "Creating geo-databases, mapping holdings, zoning boundaries, and web-GIS interactive portal panels. We convert raw vector files into visual intelligence.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=70&w=600",
    features: ["Vectorization of Cadastral Mouza Maps", "Dynamic Web Map Portals (Leaflet, Mapbox)", "Multi-Criteria Decision Analysis (MCDA)"],
    fullDetails: {
      overview: "Geographic Information Systems (GIS) synthesize disparate spatial data streams into actionable intelligence. We architect spatial relational databases that enable municipal authorities, telecom operators, and real estate developers to visualize property holdings and utility networks.",
      methodology: "Raw vector shapefiles, CAD drawings, and raster maps are integrated into PostgreSQL/PostGIS databases. We build custom ETL pipelines to clean topological errors and build dynamic Web-GIS dashboards.",
      applications: [
        "Municipal holding tax digitizations and zone auditing",
        "Telecom fiber optic network route planning",
        "Environmental vulnerability and flood risk index mapping",
        "Real estate land parcel management"
      ],
      deliverables: [
        "PostGIS Relational Geo-Databases",
        "Interactive React + Mapbox Web Portals",
        "High-Resolution GeoPDF Maps",
        "Spatial Query Analytics Dashboards"
      ],
      accuracyStandards: "OGC Standard Compliant Spatial Topology"
    }
  },
  {
    id: 4,
    category: 'hydro',
    title: 'Bathymetric & Hydrographic Surveying',
    iconName: 'Waves',
    desc: "Echolocation profile mapping for waterbeds, rivers, and ponds. Essential for channel dredging computations, bridge pier designs, and coastal revetment audits.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=70&w=600",
    features: ["Single-Beam Depth Profiling", "River Bed Siltation Volumetric Analysis", "Cross-Section Channel Worksheets"],
    fullDetails: {
      overview: "Bangladesh's dynamic river systems require constant underwater bathymetric depth profiling to maintain navigable shipping channels and prevent vessel groundings. Our hydrographic team measures underwater topography and sediment accumulation.",
      methodology: "Survey vessels equipped with South SDE-28S single-beam echo sounders tied to RTK GPS receivers record bathymetric depths. Data points are corrected for real-time water tide variations.",
      applications: [
        "Capital dredging quantity calculation",
        "Bridge foundation & riverbed scour monitoring",
        "Port & jetty bathymetric depth charting",
        "Reservoir capacity and siltation mapping"
      ],
      deliverables: [
        "3D Underwater Bed Elevation Meshes",
        "Dredging Cut / Fill Volume Certificates",
        "IHO Standard Bathymetric Charts",
        "River Channel Cross-Section Drawings"
      ],
      accuracyStandards: "Depth Resolution: ±1cm, IHO Special Order Compliant"
    }
  },
  {
    id: 5,
    category: 'remote',
    title: 'Satellite Remote Sensing & Monitoring',
    iconName: 'Activity',
    desc: "Processing multi-spectral satellite imagery to track regional land cover, urban expansion, vegetation health, and environmental change over time.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=70&w=600",
    features: ["Vegetation Index Mapping (NDVI)", "Urban Heat Island & Surface Temperature", "Land Use / Land Cover Classification"],
    fullDetails: {
      overview: "Satellite remote sensing provides macro-level environmental observations across large time horizons. By leveraging multi-spectral bands from Sentinel-2, Landsat, and commercial satellites, we calculate vegetation indices, surface moisture, and land surface temperatures.",
      methodology: "Using cloud processing engines like Google Earth Engine API, we run supervised machine learning classifiers to track land cover transformations over decades.",
      applications: [
        "Regional deforestation and crop yield forecasting",
        "Urban footprint expansion tracking",
        "Waterbody shrink & wetland conservation audits",
        "Disaster inundation & flood extent mapping"
      ],
      deliverables: [
        "Land Use / Land Cover (LULC) Raster Maps",
        "NDVI / EVI Crop Health Analytics",
        "Thermal Island Surface Heat Profiles",
        "Time-Series Environmental Change Reports"
      ],
      accuracyStandards: "Classification Confidence >92%"
    }
  },
  {
    id: 6,
    category: 'valuation',
    title: 'Certified Land & Property Valuation',
    iconName: 'Scale',
    desc: "Legally compliant asset appraisals, land acquisitions valuations, and building structural worksheets. Accepted by leading banking institutions and court benches.",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=70&w=600",
    features: ["Bank Enlisted Appraisals", "Legal Land Acquisition Audits", "Mouza Registry Superimposition Reports"],
    fullDetails: {
      overview: "Accurate property valuation requires blending geodetic boundary verification with financial appraisal metrics. Our certified valuation experts evaluate real estate assets for bank collateral, corporate balance sheets, and government acquisitions.",
      methodology: "We perform physical on-site measurements, verify mouza sheet boundaries against sub-registry records, and calculate comparative market values using government Mouza rate schedules.",
      applications: [
        "Bank loan collateral valuations",
        "Infrastructure land acquisition compensation audits",
        "Corporate asset appraisal & balance sheet auditing",
        "Property partition & estate valuation"
      ],
      deliverables: [
        "Certified Valuation Report (Bank Enlisted)",
        "Mouza Boundary Superimposition Drawing",
        "Market vs. Government Rate Comparison Schedule",
        "Structural Depreciation Worksheet"
      ],
      accuracyStandards: "100% Compliant with Bangladesh Bank Valuation Directives"
    }
  }
];

export function generateStaticParams() {
  return expertiseItems.map((item) => ({
    id: item.id.toString(),
  }));
}

export default async function ExpertiseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const numericId = parseInt(resolvedParams.id, 10);
  const item = expertiseItems.find((e) => e.id === numericId) || expertiseItems[0];

  return <ExpertiseDetailClient item={item} />;
}
