/* Snapshot of public content before CMS migration. Inserted only when the slug is absent. */
export const importedContent = {
  "articles": [
    {
      "slug": "river-delta-resilience-bathymetry",
      "title": "River Delta Resilience: Advanced Bathymetric Sounding and Riverbed Morphology Modeling",
      "category": "Case Study",
      "publishDate": "2026-11-04",
      "summary": "How dual-frequency sonar and acoustic Doppler current profilers (ADCP) provide civil engineers with the cross-section hydrography required to stabilize river training structures along the Jamuna basin.",
      "content": "## The Dynamics of Tidal Floodplain Sedimentation\n\nThe Bengal Delta represents one of the most morphologically active river systems on earth. Annual monsoon discharges carry over a billion tons of suspended sediment through the Padma, Jamuna, and Meghna braided rivers, resulting in drastic channel shifting, scour hole formation, and embankment destabilization.\n\nConventional single-beam or manual lead-line soundings cannot capture the volumetric bathymetry necessary to design resilient river defense revetments. By integrating dual-frequency survey-grade echo sounders with RTK-corrected heave, pitch, and roll sensors, Geospatial Works captures 3D underwater terrain with decimeter-level volumetric fidelity.\n\n> Precision underwater topographic models are no longer a luxury; they are the fundamental baseline required to prevent multi-million dollar embankment failures.\n\n## Sensor Integration and Velocity Profiling\n\nDuring our field missions on the Jamuna corridor, our hydrographic team paired multibeam bathymetric systems with Acoustic Doppler Current Profilers (ADCP). This dual deployment enabled simultaneous mapping of riverbed contours and 3D velocity vectors across the water column.\n\nThe resulting datasets allow hydraulic engineers to model localized turbulence near guide bunds and spur dikes, pinpointing areas where high-velocity eddies are carving underwater scour pools before surface bank collapse occurs.\n\n## Actionable Deliverables for River Basin Authorities\n\nDeliverables included calibrated cross-sectional bathymetric profiles every 50 meters, hydrodynamic digital elevation models, and change-detection heatmaps comparing pre- and post-monsoon riverbed elevations.\n\nThese insights empowered the Bangladesh Water Development Board (BWDB) and donor agencies to target dredging and geotextile bag revetments precisely where scour risk was highest, saving critical capital expenditure.",
      "author": "Engr. Mahbubur Rahman",
      "imageUrl": "/geospatial-river-hero.webp",
      "meta": {
        "readTime": "6 min read",
        "authorRole": "Head of Hydrographic & Bathymetric Engineering",
        "authorImage": "/inner/team-01.webp"
      },
      "isPublished": true,
      "sortOrder": 1
    },
    {
      "slug": "rtk-gnss-national-corridor-geodesy",
      "title": "Sub-Centimeter Geodesy: Establishing Reliable Vertical Control for National Transport Corridors",
      "category": "Technical Bulletin",
      "publishDate": "2026-10-29",
      "summary": "A deep dive into high-precision RTK GNSS base-rover networks, geoid undulation corrections, and benchmark tying across tidal delta floodplains.",
      "content": "## The Challenge of Vertical Control in Delta Soil\n\nIn major infrastructure projects such as elevated expressways, high-speed rail, and long-span river bridges, vertical precision is paramount. A 2-centimeter elevation error over a 500-meter span can cause catastrophic alignment defects, drainage pooling, and bridge bearing mismatches.\n\nIn Bangladesh, establishing rigid vertical benchmarks is complicated by deep alluvial soil settlement, seasonal water table variations, and differing historical datum baselines (PWD vs. MSL vs. SOB).\n\n> Vertical precision is where good surveys become engineering truth. Without strict geodetic datum transformations, modern design models cannot translate to ground realities.\n\n## Closed-Loop Geodetic Networks & CORS Integration\n\nTo establish uncompromised control, Geospatial Works deploys multi-constellation GNSS receivers (GPS, GLONASS, Galileo, BeiDou) linked to continuously operating reference stations (CORS) and permanent concrete geodetic pillars.\n\nEvery primary monument undergoes static GNSS observation sessions lasting 6 to 12 hours, followed by rigorous least-squares network adjustments and digital leveling using barcode invar staffs to achieve millimeter-level closure.\n\n## Seamless CAD & BIM Handover\n\nThe adjusted coordinates and elevations are converted directly into project-specific localized grid coordinates (such as BTM - Bangladesh Transverse Mercator) with documented scale factors, ensuring contractor survey teams experience zero coordinate divergence throughout construction.",
      "author": "Tanvir Hossain",
      "imageUrl": "/field-surveyor-v2.webp",
      "meta": {
        "readTime": "5 min read",
        "authorRole": "Lead Geodetic Surveyor & GNSS Specialist",
        "authorImage": "/inner/team-02.webp"
      },
      "isPublished": true,
      "sortOrder": 2
    },
    {
      "slug": "dhaka-wasa-smart-utility-digital-twin",
      "title": "Transforming Municipal Water Distribution into Enterprise GIS Digital Twins",
      "category": "Press Release",
      "publishDate": "2026-10-15",
      "summary": "Geospatial Works successfully completes subsurface pipeline detection and valve geodatabase integration covering 450 km of municipal pipelines in Dhaka.",
      "content": "## Modernizing Dhaka’s Underground Water Arteries\n\nManaging water distribution for a metropolis of over 20 million residents requires precise real-time knowledge of buried pipeline networks. Over decades of urban expansion, unmapped pipe segments, buried valve chambers, and undocumented spurs created significant non-revenue water (NRW) loss.\n\nGeospatial Works was commissioned to create a comprehensive digital twin of Dhaka WASA’s municipal supply infrastructure, combining non-destructive subsurface utility engineering with spatial database architecture.\n\n> Transforming legacy paper records and hidden underground valves into an interactive 3D GIS platform empowers municipal authorities to prevent leaks and respond to pipe bursts in minutes.\n\n## Subsurface Electromagnetic Locating and GIS Modeling\n\nOur engineering teams deployed high-frequency electromagnetic pipe locators and dual-frequency ground penetrating radar (GPR) across arterial roadways, mapping pipeline material, depth of cover, and joint configurations without tearing up road surfaces.\n\nEvery above-ground valve, flow meter, and fire hydrant was surveyed with sub-centimeter RTK receivers and cataloged with custom mobile GIS collection tablets.\n\n## Empowering Operation & Maintenance\n\nThe finalized dataset comprises over 450 kilometers of digitized, topological pipeline networks formatted as an enterprise PostgreSQL/PostGIS spatial database seamlessly integrated with hydraulic modeling software.",
      "author": "Farhana Akter",
      "imageUrl": "/delta-hero-v2.webp",
      "meta": {
        "readTime": "4 min read",
        "authorRole": "Director of GIS & Spatial Enterprise Architecture",
        "authorImage": "/inner/team-03.webp"
      },
      "isPublished": true,
      "sortOrder": 3
    },
    {
      "slug": "high-density-uav-lidar-flood-defenses",
      "title": "High-Density Airborne UAV LiDAR: Piercing Dense Vegetative Canopy for Flood Modeling",
      "category": "Technical Bulletin",
      "publishDate": "2026-09-28",
      "summary": "Extracting bare-earth digital elevation models (DEM) through dense mangrove and delta vegetation to assist disaster management boards.",
      "content": "## Overcoming Canopy Blind Spots\n\nTraditional aerial photogrammetry relies on optical sightlines, meaning dense vegetation like bamboo groves, fruit orchards, and mangrove belts appear as solid green canopies, hiding the true ground elevation beneath.\n\nGeospatial Works deployed triple-return airborne LiDAR sensor payloads capable of sending up to 300,000 laser pulses per second. These multiple returns penetrate gaps in leaves and branches to capture reflections directly from the ground floor.\n\n## Automated Ground Classification and Hydrological Inundation\n\nUsing advanced point cloud classification algorithms, our spatial analysts filter out vegetation and man-made structures, generating seamless bare-earth digital terrain models (DTM) with 5-centimeter vertical precision.\n\nThese high-fidelity DTMs are critical inputs for hydrodynamic 2D flood simulation models, allowing engineers to predict flash-flood overflow pathways and optimize embankment crest elevations.",
      "author": "Tanvir Hossain",
      "imageUrl": "/hero-poster.jpg",
      "meta": {
        "readTime": "5 min read",
        "authorRole": "Lead Geodetic Surveyor & GNSS Specialist",
        "authorImage": "/inner/team-02.webp"
      },
      "isPublished": true,
      "sortOrder": 4
    },
    {
      "slug": "ground-penetrating-radar-urban-expressway",
      "title": "Ground Penetrating Radar in Dense Urban Corridors: Mitigating Utility Strikes",
      "category": "Case Study",
      "publishDate": "2026-09-12",
      "summary": "Best practices for multi-frequency electromagnetic locating and GPR radargrams prior to deep piling for elevated viaducts.",
      "content": "## Eliminating the Risk of Utility Strikes\n\nDeep bored piling in city centers presents severe risks to buried gas lines, fiber optic backbones, and high-voltage transmission cables. A single utility strike can trigger massive blackouts, gas leaks, and multi-week project delays.\n\nGeospatial Works provides comprehensive Subsurface Utility Engineering (SUE) Quality Level B and A services, utilizing shielded ground penetrating radar arrays and electromagnetic induction to produce 3D underground collision maps.",
      "author": "Engr. Mahbubur Rahman",
      "imageUrl": "/field-surveyor-v2.webp",
      "meta": {
        "readTime": "6 min read",
        "authorRole": "Head of Hydrographic & Bathymetric Engineering",
        "authorImage": "/inner/team-01.webp"
      },
      "isPublished": true,
      "sortOrder": 5
    },
    {
      "slug": "coastal-erosion-drone-orthomosaics",
      "title": "Multi-Temporal Drone Orthomosaics for Coastal Erosion and Mangrove Monitoring",
      "category": "Case Study",
      "publishDate": "2026-08-20",
      "summary": "Tracking shoreline retreat and afforestation dynamics along the Cox’s Bazar and Kuakata coastal shelf with centimeter-level aerial photogrammetry.",
      "content": "## Monitoring Bangladesh’s Shifting Coastal Frontier\n\nThe Bay of Bengal coastline experiences intense tidal currents, monsoon storm surges, and cyclonic wave action. Accurate spatial monitoring of shoreline progression and mangrove canopy density is essential for coastal defense infrastructure.\n\nBy flying calibrated RGB and multispectral drone surveys on fixed seasonal schedules, Geospatial Works generates high-resolution orthomosaics and normalized difference vegetation index (NDVI) models to track real shoreline movement over time.",
      "author": "Farhana Akter",
      "imageUrl": "/geospatial-river-hero.webp",
      "meta": {
        "readTime": "5 min read",
        "authorRole": "Director of GIS & Spatial Enterprise Architecture",
        "authorImage": "/inner/team-03.webp"
      },
      "isPublished": true,
      "sortOrder": 6
    },
    {
      "slug": "dtca-bus-route-rationalization",
      "title": "Rapid Deployment of DJI Matrice 4E UAV Photogrammetry for DTCA Bus Route Rationalization",
      "category": "Case Study",
      "publishDate": "2026-09-30",
      "summary": "Execution of 35.15 sq km UAV drone and traffic OD survey across 150 km of Dhaka arterial transit corridors in 30 days.",
      "content": "## Rapid Turnaround for Megacity Transit Restructuring\n\nDhaka Transport Coordination Authority (DTCA) commissioned Geospatial Works to execute comprehensive corridor drone photogrammetry and traffic counts to modernize bus route networks across Dhaka.\n\nDeploying RTK-enabled enterprise drone fleets during early dawn windows permitted complete orthomosaic surface capture without disrupting heavy daytime traffic.",
      "author": "Geospatial Engineering Team",
      "imageUrl": "/projects-extracted/page_31/img_01.jpg",
      "meta": {
        "readTime": "6 min read",
        "authorRole": "Aerial Survey & Traffic Planning",
        "authorImage": "/inner/team-02.webp"
      },
      "isPublished": true,
      "sortOrder": 7
    },
    {
      "slug": "abdulpur-railway-bypass",
      "title": "Generating 2 cm Digital Terrain Models & High-Resolution Orthomosaics for Railway Bypasses",
      "category": "Technical Bulletin",
      "publishDate": "2026-08-15",
      "summary": "Sub-centimeter RTK topographic and UAV photogrammetry survey producing DSM, DTM, and 0.20m interval contours for Bangladesh Railway bypass under RCIPF.",
      "content": "## Millimeter Geodetic Control for Railway Infrastructure\n\nUnder the ADB-funded RCIPF subproject 2, our surveyors completed rigorous corridor mapping and bare-earth DTM extraction within 14 days, directly facilitating international alignment engineering.",
      "author": "Tanvir Hossain",
      "imageUrl": "/projects-extracted/page_29/img_02.jpg",
      "meta": {
        "readTime": "5 min read",
        "authorRole": "Lead Geodetic Surveyor & Photogrammetrist",
        "authorImage": "/inner/team-02.webp"
      },
      "isPublished": true,
      "sortOrder": 8
    },
    {
      "slug": "coastal-mangrove-assessment",
      "title": "Coastal Mangrove Accretion Assessment Using RTK-Enabled UAVs for Bangladesh Forest Department",
      "category": "Environmental Research",
      "publishDate": "2026-07-10",
      "summary": "Monitoring newly accreted coastal silt formations and mangrove afforestation canopy health using multi-spectral drone analytics.",
      "content": "## Coastal Delta Dynamics and Mangrove Ecosystems\n\nHigh-precision multispectral sensor flights allowed rapid NDVI calculation and accretion land-cover mapping across difficult intertidal delta zones.",
      "author": "Farhana Akter",
      "imageUrl": null,
      "meta": {
        "readTime": "5 min read",
        "authorRole": "Director of GIS & Remote Sensing",
        "authorImage": "/inner/team-03.webp"
      },
      "isPublished": true,
      "sortOrder": 9
    }
  ],
  "services": [
    {
      "slug": "topographic-survey",
      "title": "Topographic & Engineering Survey",
      "category": "Digital Surveying",
      "description": "We execute comprehensive land surveys combining dual-frequency GNSS RTK and high-accuracy robotic total stations. Every contour and ground feature is referenced to national Survey of Bangladesh (SOB) benchmarks.",
      "features": [
        "Topographic Surface Contours (0.25m / 0.5m intervals)",
        "Ground Control Point (GCP) Geodetic Network Dossier",
        "Civil 3D Digital Terrain Models (.TIN / .DWG)",
        "Cross-Sections and Longitudinal Profiles"
      ],
      "imageUrl": "/real-media/service-topographic-uav.png",
      "sortOrder": 1,
      "isActive": true,
      "details": {
        "lead": "Sub-centimeter geodetic baselines, contour mapping, and digital terrain modeling for civil engineering and infrastructure.",
        "equipment": [
          "Trimble / Leica Dual-Frequency GNSS RTK Receivers",
          "1-Second Robotic Total Stations",
          "Digital Invar Barcode Leveling Instruments"
        ],
        "standards": [
          "Survey of Bangladesh (SOB) PWD Datum",
          "BTM (Bangladesh Transverse Mercator) Coordinate Projection",
          "ISO 17123-5 Geodetic Quality Assurance Protocol"
        ],
        "benefits": [
          "Zero vertical alignment errors during highway and bridge piling",
          "Eliminate costly earthwork volume recalculations",
          "Certified drawings accepted by all government authorities"
        ]
      }
    },
    {
      "slug": "uav-mapping",
      "title": "UAV Mapping & Aerial Photogrammetry",
      "category": "Aerial Survey",
      "description": "Our certified drone pilots fly multi-rotor and fixed-wing UAVs equipped with RTK/PPK GNSS and calibrated high-resolution RGB/multispectral sensors to capture vast sites with centimeter-level accuracy.",
      "features": [
        "Sub-5cm Ground Sampling Distance (GSD) Orthomosaics",
        "Classified 3D Point Clouds (.LAS / .LAZ)",
        "Digital Surface Models (DSM) and Bare-Earth DEMs",
        "Progressive Volumetric Cut/Fill Stockpile Computations"
      ],
      "imageUrl": "/real-media/service-uav-drone-lidar.png",
      "sortOrder": 2,
      "isActive": true,
      "details": {
        "lead": "High-resolution orthomosaics, 3D point clouds, and multispectral aerial analytics across expansive corridors.",
        "equipment": [
          "DJI Enterprise Matrice 350 RTK / Phantom 4 RTK",
          "Zenmuse P1 45MP Full-Frame Photogrammetry Camera",
          "Zenmuse L2 Triple-Return Airborne LiDAR"
        ],
        "standards": [
          "Civil Aviation Authority of Bangladesh (CAAB) UAV Compliant",
          "ASPRS Positional Accuracy Standards for Digital Geospatial Data",
          "RTK-GCP Redundant Ground Benchmark Verification"
        ],
        "benefits": [
          "Survey hundreds of hectares in hours instead of weeks",
          "Safely map hazardous or inaccessible marshes and riverbanks",
          "Provides stunning high-definition visual assets for stakeholders"
        ]
      }
    },
    {
      "slug": "gis-solutions",
      "title": "Enterprise GIS & Spatial Digital Twins",
      "category": "GIS Solutions",
      "description": "We build enterprise geodatabases, hydraulic digital twins, and cloud-hosted GIS web portals that bring CAD drawings, drone imagery, and field sensor data together for utilities and smart cities.",
      "features": [
        "Enterprise Geodatabase Architecture & Data Dictionary",
        "Interactive Web GIS Dashboard with Multi-Layer Overlays",
        "Subsurface Pipeline Hydraulic Network Topologies",
        "Automated PDF Map Generation & Reporting Engine"
      ],
      "imageUrl": "/real-media/service-gis-remote-sensing.png",
      "sortOrder": 3,
      "isActive": true,
      "details": {
        "lead": "Transforming complex spatial infrastructure and field telemetry into real-time decision intelligence platforms.",
        "equipment": [
          "PostgreSQL 16 + PostGIS Spatial Engine",
          "QGIS / ESRI ArcGIS Pro Geoprocessing Workstations",
          "Custom WebGL / Leaflet / Mapbox Frontend Frameworks"
        ],
        "standards": [
          "OGC (Open Geospatial Consortium) Compliant Standards",
          "ISO 19115 Geographic Information Metadata Standard",
          "Role-Based Access Control (RBAC) & Secure Data Hosting"
        ],
        "benefits": [
          "Pinpoint valve locations and pipe leaks within minutes",
          "Eliminate data silos between field teams and headquarters",
          "Seamless integration with existing enterprise ERP and SCADA"
        ]
      }
    },
    {
      "slug": "bathymetric-survey",
      "title": "Hydrographic & Bathymetric Sounding",
      "category": "Hydrographic Survey",
      "description": "We deploy survey vessels equipped with dual-frequency echo sounders, Acoustic Doppler Current Profilers (ADCP), and RTK heave-pitch-roll sensors to map underwater terrain and sediment dynamics.",
      "features": [
        "Riverbed Bathymetry Contours and 3D Underwater Meshes",
        "Pre- and Post-Dredging Volumetric Calculation Reports",
        "3D Flow Velocity Vector Maps across Channel Cross-Sections",
        "Submerged Hazard and Obstruction Location Charts"
      ],
      "imageUrl": "/real-media/project-badc-jhopjhopia-river.jpg",
      "sortOrder": 4,
      "isActive": true,
      "details": {
        "lead": "High-precision riverbed topography, velocity profiling, and scour detection in tidal delta waterways.",
        "equipment": [
          "Dual-Frequency Survey-Grade Digital Echo Sounders",
          "Teledyne / SonTek Acoustic Doppler Current Profilers (ADCP)",
          "Real-Time Heave, Pitch, and Roll Motion Sensors"
        ],
        "standards": [
          "IHO (International Hydrographic Organization) Standards S-44",
          "BIWTA (Bangladesh Inland Water Transport Authority) Specifications",
          "Tidal Gauge Benchmarking to PWD / Chart Datum"
        ],
        "benefits": [
          "Target dredging precisely where sediment shoals obstruct navigation",
          "Detect underwater embankment scour holes before surface collapse",
          "Accurate cubic meter volume certifications for contractor billing"
        ]
      }
    },
    {
      "slug": "boundary-survey",
      "title": "Mouza & Cadastral Land Boundary Survey",
      "category": "Land Records",
      "description": "We digitize, rectify, and georeference historical CS, RS, and BS Mouza map sheets to resolve land ownership conflicts, establish project right-of-way (RoW), and ensure legally sound site acquisitions.",
      "features": [
        "Georeferenced Mouza Map Overlays on Satellite Imagery",
        "Right-of-Way (RoW) Demarcation CAD Plans",
        "Land Ownership, Plot Schedule, and Discrepancy Audits",
        "Boundary Pillar Staking and Physical Monumentation"
      ],
      "imageUrl": "/real-media/service-road-bridge-engineering.jpg",
      "sortOrder": 5,
      "isActive": true,
      "details": {
        "lead": "Reconciling historical Mouza land sheets with modern satellite imagery and millimeter-level RTK coordinates.",
        "equipment": [
          "High-Precision Large-Format Calibrated Document Scanners",
          "Dual-Frequency RTK GNSS Rovers",
          "ArcGIS Advanced Georeferencing & Polygon Topology Engines"
        ],
        "standards": [
          "Land Record & Survey Department (DLRS) Frameworks",
          "Bangladesh Transverse Mercator (BTM) Projections",
          "Legally Defensible Expert Survey Documentation"
        ],
        "benefits": [
          "Prevent costly land ownership litigation prior to construction",
          "Clear demarcation for acquisition compensation packages",
          "Complete transparency for international development financiers"
        ]
      }
    },
    {
      "slug": "subsurface-utility",
      "title": "Subsurface Utility Engineering (SUE)",
      "category": "Underground Infrastructure",
      "description": "We identify and map buried electric cables, fiber optics, water mains, and gas lines prior to urban excavation, piling, and micro-tunneling.",
      "features": [
        "3D CAD Utility Trench Collision Models",
        "ASCE 38-02 Quality Level A, B, and C Survey Plans",
        "Depth-of-Cover and Pipe Diameter Attribute Schedules",
        "Conflict Matrix for Piling and Excavation Works"
      ],
      "imageUrl": "/real-media/equipment-rtk-gnss-station.jpg",
      "sortOrder": 6,
      "isActive": true,
      "details": {
        "lead": "Multi-frequency Ground Penetrating Radar (GPR) and electromagnetic locating to eliminate underground utility strikes.",
        "equipment": [
          "Dual-Frequency Shielded Ground Penetrating Radar (GPR)",
          "Electromagnetic Precision Pipe & Cable Locators (EML)",
          "Direct-Connection Signal Transmitters (Induction & Clamp)"
        ],
        "standards": [
          "ASCE Standard 38-02 Guidelines for SUE",
          "Strict No-Strike Safety Clearance Protocols"
        ],
        "benefits": [
          "Zero utility strike incidents during deep excavation",
          "Prevent massive municipal fines and emergency repair costs",
          "Maintain public safety and traffic flow during construction"
        ]
      }
    },
    {
      "slug": "building-engineering",
      "title": "Architectural, Civil & Structural Design",
      "category": "Engineering & Design",
      "description": "We deliver comprehensive architectural planning, finite element structural engineering, civil cross-sections, and detailed bills of quantities (BOQ) for municipal terminals, transport facilities, and public infrastructure across Bangladesh.",
      "features": [
        "Detailed Architectural Floor Plans",
        "3D Finite Element Structural Models",
        "Reinforced Concrete (RCC) Structural Drawings",
        "Tender-Ready BOQ and Cost Estimation Dossiers"
      ],
      "imageUrl": "/projects-extracted/page_17/img_05.jpg",
      "sortOrder": 7,
      "isActive": true,
      "details": {
        "lead": "Architectural floor plans, 3D structural analysis (ETABS), environmental drainage engineering, and construction supervision.",
        "equipment": [
          "ETABS Structural Modeling Engine",
          "AutoCAD Civil 3D & Revit Workstations",
          "Soil & Foundation Settlement Analytical Software"
        ],
        "standards": [
          "Bangladesh National Building Code (BNBC)",
          "ACI 318 Reinforced Concrete Standards",
          "Dhaka North City Corporation (DNCC) Architectural Guidelines"
        ],
        "benefits": [
          "Safe, disaster-resilient structural layouts",
          "Streamlined statutory building and civic approvals",
          "Precise material quantity schedules eliminating construction overruns"
        ]
      }
    },
    {
      "slug": "road-bridge-infrastructure",
      "title": "Road, Bridge & Highway Corridor Alignment",
      "category": "Transportation Infrastructure",
      "description": "Specialized highway and transport infrastructure engineering from high-traffic urban arterials to rural connectivity bridges. Includes geometric road profile drafting, storm drain hydraulics, pedestrian passenger shelters, and palisading.",
      "features": [
        "Corridor Geometric Alignment Profiles",
        "RCC Box Drain Cross-Sections & Outfall Hydraulics",
        "Passenger Waiting Shelter Architectural CAD",
        "Road Asset Inventory & Strip Maps"
      ],
      "imageUrl": "/projects-extracted/page_18/img_02.jpg",
      "sortOrder": 8,
      "isActive": true,
      "details": {
        "lead": "Highway geometric design, drainage network engineering, median alignments, and bridge hydraulic bathymetry.",
        "equipment": [
          "Trimble GNSS RTK Base & Rover Systems",
          "Robotic Total Stations",
          "Civil 3D Highway Geometric Design Suite"
        ],
        "standards": [
          "Roads and Highways Department (RHD) Standards",
          "AASHTO Geometric Design Guidelines",
          "LGED Rural Road Design Standards"
        ],
        "benefits": [
          "Smooth traffic circulation and congestion relief",
          "Monsoon-proof stormwater runoff management",
          "Fully compliant with municipal right-of-way (RoW) limits"
        ]
      }
    },
    {
      "slug": "environmental-monitoring",
      "title": "Environmental & Coastal Assessment",
      "category": "Spatial Intelligence",
      "description": "Precision remote sensing and aerial surveys monitoring dynamic river delta sedimentation, mangrove canopy density, and coastal afforestation in southern Bangladesh.",
      "features": [
        "Coastal Accretion Maps",
        "Multispectral NDVI Vegetation Health Indices",
        "Mangrove Forest Canopy Density Reports",
        "Climate-Smart Rural Transport Models"
      ],
      "imageUrl": "/projects-extracted/page_25/img_02.jpg",
      "sortOrder": 9,
      "isActive": true,
      "details": {
        "lead": "Drone-enabled assessment of newly accreted coastal lands, mangrove forest monitoring, and climate-smart rural infrastructure.",
        "equipment": [
          "Multispectral UAV Sensors",
          "Dual-Frequency RTK Drones",
          "GIS Remote Sensing Analytics Workstations"
        ],
        "standards": [
          "Bangladesh Forest Department Protocols",
          "CEGIS Environmental GIS Guidelines"
        ],
        "benefits": [
          "Real-time shoreline movement tracking",
          "Evidence-based ecological conservation data",
          "Targeted coastal protection infrastructure planning"
        ]
      }
    },
    {
      "slug": "engineering-design",
      "title": "Feasibility, BOQ & Civil Design",
      "category": "Engineering & Approach",
      "description": "Comprehensive feasibility studies and detailed civil designs conforming to national engineering codes, providing clients with precise cost estimation and statutory tender documents.",
      "features": [
        "Measured BOQ & BOM Schedules",
        "Road Corridor & Junction Designs",
        "Project Cost Estimation & Budgeting"
      ],
      "imageUrl": "/projects-extracted/page_19/img_02.jpg",
      "sortOrder": 10,
      "isActive": true,
      "details": {
        "lead": "Preparation of Bills of Quantities (BOQ), Bills of Materials (BOM), structural analysis, and feasibility studies.",
        "equipment": [
          "AutoCAD Civil 3D",
          "ETABS",
          "Cost Estimation Databases"
        ],
        "standards": [
          "BNBC & RHD Standards",
          "Public Procurement Rules (PPR)"
        ],
        "benefits": [
          "Accurate project budgeting",
          "Zero contractor dispute on material quantities",
          "Fast-tracked approvals"
        ]
      }
    }
  ],
  "projects": [
    {
      "slug": "page-16-passenger-facilities-modernization-at-gabtoli",
      "title": "Passenger Facilities Modernization at Gabtoli Inter-District Bus Terminal",
      "client": "Dhaka North City Corporation (DNCC)",
      "category": "CIVIL & ARCHITECTURAL",
      "location": "Gabtoli, Dhaka",
      "description": "Comprehensive digital surveying and improvement planning for Gabtoli Bus Terminal. Prepared detailed architectural floor plans for modern ticket counters, comfortable passenger waiting lounges, sanitary facilities, drainage systems, and optimized pedestrian walkways to relieve terminal congestion.",
      "deliverables": "Digital Topographic Survey, Master Plan, Congestion Mitigation Layout",
      "imageUrl": "/projects-extracted/page_16/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 1,
      "isActive": true,
      "details": {
        "subtitle": "Digital Survey & Improvement Planning",
        "images": [
          "/projects-extracted/page_16/img_02.jpg"
        ],
        "overview": "Comprehensive digital surveying and improvement planning for Gabtoli Bus Terminal. Prepared detailed architectural floor plans for modern ticket counters, comfortable passenger waiting lounges, sanitary facilities, drainage systems, and optimized pedestrian walkways to relieve terminal congestion.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "June 2026 – September 2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-17-gabtoli-terminal-3d-engineering---structural",
      "title": "Gabtoli Terminal 3D Engineering & Structural Models",
      "client": "Dhaka North City Corporation (DNCC)",
      "category": "CIVIL & ARCHITECTURAL",
      "location": "Gabtoli, Dhaka",
      "description": "Advanced 3D structural modeling (ETABS), Ground Floor architectural layouts, and digital survey verification for Gabtoli Inter-District Bus Terminal modernization.",
      "deliverables": "3D Model Output (ETABS), Digital Survey Plotting, Ground Floor Layout, Typical Floor Plan",
      "imageUrl": "/projects-extracted/page_17/img_05.jpg",
      "isMilestone": true,
      "sortOrder": 2,
      "isActive": true,
      "details": {
        "subtitle": "ETABS Modeling & Floor Plan Outputs",
        "images": [
          "/projects-extracted/page_17/img_05.jpg",
          "/projects-extracted/page_17/img_04.jpg",
          "/projects-extracted/page_17/img_06.jpg",
          "/projects-extracted/page_17/img_03.jpg",
          "/projects-extracted/page_17/img_02.jpg"
        ],
        "overview": "Advanced 3D structural modeling (ETABS), Ground Floor architectural layouts, and digital survey verification for Gabtoli Inter-District Bus Terminal modernization.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-18-gulshan-1-intersection-to-progati-sarani-high",
      "title": "Gulshan-1 Intersection to Progati Sarani Highway & Drain Improvement",
      "client": "Dhaka North City Corporation (DNCC)",
      "category": "ROAD & TRANSPORT",
      "location": "Gulshan-1 to Progati Sarani, Dhaka",
      "description": "Road infrastructure improvement works along the critical Gulshan-1 to Progati Sarani link corridor, including construction of RCC medians, drainage network, pedestrian walkways, passenger sheds, grill fencing, and traffic signage.",
      "deliverables": "Road Geometric Alignment, Subsurface Drain Network, Median Demarcation, Traffic Circulation Plan",
      "imageUrl": "/projects-extracted/page_18/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 3,
      "isActive": true,
      "details": {
        "subtitle": "Gulshan-Badda Link Road Infrastructure Works",
        "images": [
          "/projects-extracted/page_18/img_02.jpg"
        ],
        "overview": "Road infrastructure improvement works along the critical Gulshan-1 to Progati Sarani link corridor, including construction of RCC medians, drainage network, pedestrian walkways, passenger sheds, grill fencing, and traffic signage.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "August 2026 – October 2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-19-gulshan-badda-corridor-passenger-waiting-shel",
      "title": "Gulshan-Badda Corridor Passenger Waiting Shelter & Road Sections",
      "client": "Dhaka North City Corporation (DNCC)",
      "category": "ROAD & TRANSPORT",
      "location": "Gulshan-Badda Corridor, Dhaka",
      "description": "3D Model Output of passenger waiting shelters, drain layout plans, waiting shelter architectural floor plans, and detailed civil cross-sections for Gulshan-Badda Link Road.",
      "deliverables": "3D Waiting Shelter Model, Drain Layout Plan, Waiting Shelter Plan, Section for Road",
      "imageUrl": "/projects-extracted/page_19/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 4,
      "isActive": true,
      "details": {
        "subtitle": "3D Waiting Shelter & Civil Cross-Sections",
        "images": [
          "/projects-extracted/page_19/img_02.jpg",
          "/projects-extracted/page_19/img_05.jpg",
          "/projects-extracted/page_19/img_04.jpg",
          "/projects-extracted/page_19/img_03.jpg"
        ],
        "overview": "3D Model Output of passenger waiting shelters, drain layout plans, waiting shelter architectural floor plans, and detailed civil cross-sections for Gulshan-Badda Link Road.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-20-passenger-facilities-modernization-at-mohakha",
      "title": "Passenger Facilities Modernization at Mohakhali Inter-District Bus Terminal",
      "client": "Dhaka North City Corporation (DNCC)",
      "category": "CIVIL & ARCHITECTURAL",
      "location": "Mohakhali, Dhaka",
      "description": "Comprehensive digital surveying, structural engineering, and passenger facility modernization at Mohakhali Inter-District Bus Terminal, upgrading ticketing facilities, passenger waiting areas, sanitation blocks, and site drainage.",
      "deliverables": "Digital Boundary Survey, Terminal Traffic Flow Study, Facility Zoning Plan",
      "imageUrl": "/projects-extracted/page_20/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 5,
      "isActive": true,
      "details": {
        "subtitle": "Digital Survey & Passenger Flow Planning",
        "images": [
          "/projects-extracted/page_20/img_02.jpg"
        ],
        "overview": "Comprehensive digital surveying, structural engineering, and passenger facility modernization at Mohakhali Inter-District Bus Terminal, upgrading ticketing facilities, passenger waiting areas, sanitation blocks, and site drainage.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "September 2026 - Continue",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-21-mohakhali-terminal-ticketing-counters---3d-ar",
      "title": "Mohakhali Terminal Ticketing Counters & 3D Architectural Plans",
      "client": "Dhaka North City Corporation (DNCC)",
      "category": "CIVIL & ARCHITECTURAL",
      "location": "Mohakhali, Dhaka",
      "description": "Architectural floor plans and 3D perspectives separating AC and Non-AC bus counters, digital survey integration, and multi-tier passenger waiting amenities for Mohakhali Terminal.",
      "deliverables": "Bus Counter Floor Plan, AC Bus Counter Plan, Non-AC Bus Counter Plan, 3D Model Perspective",
      "imageUrl": "/projects-extracted/page_21/img_06.jpg",
      "isMilestone": true,
      "sortOrder": 6,
      "isActive": true,
      "details": {
        "subtitle": "AC & Non-AC Bus Counter Floor Plans",
        "images": [
          "/projects-extracted/page_21/img_06.jpg",
          "/projects-extracted/page_21/img_05.jpg",
          "/projects-extracted/page_21/img_04.jpg",
          "/projects-extracted/page_21/img_02.jpg",
          "/projects-extracted/page_21/img_03.jpg"
        ],
        "overview": "Architectural floor plans and 3D perspectives separating AC and Non-AC bus counters, digital survey integration, and multi-tier passenger waiting amenities for Mohakhali Terminal.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-22-mohakhali-terminal-drainage-network---palisad",
      "title": "Mohakhali Terminal Drainage Network & Palisading Engineering",
      "client": "Dhaka North City Corporation (DNCC)",
      "category": "CIVIL & ARCHITECTURAL",
      "location": "Mohakhali, Dhaka",
      "description": "Detailed civil structural drawings including heavy-load RCC box drain sections, retaining drop palisading details, and apron stormwater discharge layouts.",
      "deliverables": "Section for Drain, Section for Palisading, Stormwater Retention Details",
      "imageUrl": "/projects-extracted/page_22/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 7,
      "isActive": true,
      "details": {
        "subtitle": "Civil Structural Cross-Sections",
        "images": [
          "/projects-extracted/page_22/img_02.jpg",
          "/projects-extracted/page_22/img_03.jpg"
        ],
        "overview": "Detailed civil structural drawings including heavy-load RCC box drain sections, retaining drop palisading details, and apron stormwater discharge layouts.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-23-ltp-of-sanitary-landfill-at-moheshkhali-solid",
      "title": "LTP of Sanitary Landfill at Moheshkhali Solid Waste Management",
      "client": "LGED / JICA / Nippon Koei / OSMO CORPORATION",
      "category": "ENVIRONMENTAL & CIVIL",
      "location": "Moheshkhali, Cox’s Bazar",
      "description": "Structural design and preparation of drawings for the Leachate Treatment Plant (LTP) under the Moheshkhali Solid Waste Management initiative funded by JICA, including manual calculations, maximum bending moment/shear force assessment, and reinforcement detailing.",
      "deliverables": "Structural Calculations, Reinforcement Schedules, Technical Review with Nippon Koei, LTP Holding Cell Design",
      "imageUrl": "/projects-extracted/page_24/img_02.png",
      "isMilestone": true,
      "sortOrder": 8,
      "isActive": true,
      "details": {
        "subtitle": "Structural Design & Drawing for JICA Project",
        "images": [
          "/projects-extracted/page_24/img_02.png",
          "/projects-extracted/page_24/img_03.png"
        ],
        "overview": "Structural design and preparation of drawings for the Leachate Treatment Plant (LTP) under the Moheshkhali Solid Waste Management initiative funded by JICA, including manual calculations, maximum bending moment/shear force assessment, and reinforcement detailing.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "April 2025 - May 2025",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-24-moheshkhali-sanitary-landfill-structural-draw",
      "title": "Moheshkhali Sanitary Landfill Structural Drawing Outputs",
      "client": "LGED / Nippon Koei / OSMO CORPORATION",
      "category": "ENVIRONMENTAL & CIVIL",
      "location": "Moheshkhali, Cox’s Bazar",
      "description": "Engineering drawing outputs and reinforcement schedules for the Leachate Treatment Plant at Moheshkhali Sanitary Landfill.",
      "deliverables": "LTP Plan & Elevations, Structural Details, Bar Bending Schedules",
      "imageUrl": "/projects-extracted/page_24/img_02.png",
      "isMilestone": true,
      "sortOrder": 9,
      "isActive": true,
      "details": {
        "subtitle": "Leachate Treatment Plant Engineering Drawings",
        "images": [
          "/projects-extracted/page_24/img_02.png",
          "/projects-extracted/page_24/img_03.png"
        ],
        "overview": "Engineering drawing outputs and reinforcement schedules for the Leachate Treatment Plant at Moheshkhali Sanitary Landfill.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2025",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-25-web-ais-pilot-research-project-on-irrigation",
      "title": "WEB-AIS Pilot Research Project on Irrigation Water Management",
      "client": "Bangladesh Agricultural Development Corporation (BADC)",
      "category": "WATER RESOURCES & GIS",
      "location": "Manikganj, Bangladesh",
      "description": "Pilot research project to improve irrigation water management and agricultural planning through high-precision spatial data, satellite remote sensing, canal distribution mapping, and TBM/GCP network establishment.",
      "deliverables": "Canal Distribution Mapping, TBM & GCP Geodetic Network, Remote Sensing Baseline, GIS Database",
      "imageUrl": "/projects-extracted/page_25/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 10,
      "isActive": true,
      "details": {
        "subtitle": "Agricultural Information System for Bangladesh",
        "images": [
          "/projects-extracted/page_25/img_02.jpg"
        ],
        "overview": "Pilot research project to improve irrigation water management and agricultural planning through high-precision spatial data, satellite remote sensing, canal distribution mapping, and TBM/GCP network establishment.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "September 2025 - Continue",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-26-web-ais-spatial-data-outputs--tbm--land-cover",
      "title": "WEB-AIS Spatial Data Outputs: TBM, Land Cover & Irrigation Canals",
      "client": "Bangladesh Agricultural Development Corporation (BADC)",
      "category": "WATER RESOURCES & GIS",
      "location": "Manikganj, Bangladesh",
      "description": "Comprehensive spatial datasets: Distribution of TBM & GCP Grid, Primary & Secondary Geodetic Controls, Land Cover Classification, Hydrological Network, Irrigation Canal alignments, and Distribution of Agricultural Pumps.",
      "deliverables": "Distribution of TBM and GCP Grid, Primary & Secondary Control Maps, Land Cover Classification, Irrigation Canal Distribution, Pump Distribution Analysis",
      "imageUrl": "/projects-extracted/page_26/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 11,
      "isActive": true,
      "details": {
        "subtitle": "Geodatabase & Hydrological Network Maps",
        "images": [
          "/projects-extracted/page_26/img_02.jpg",
          "/projects-extracted/page_26/img_03.jpg",
          "/projects-extracted/page_26/img_04.jpg",
          "/projects-extracted/page_26/img_05.jpg",
          "/projects-extracted/page_26/img_06.jpg",
          "/projects-extracted/page_26/img_07.jpg",
          "/projects-extracted/page_26/img_08.jpg"
        ],
        "overview": "Comprehensive spatial datasets: Distribution of TBM & GCP Grid, Primary & Secondary Geodetic Controls, Land Cover Classification, Hydrological Network, Irrigation Canal alignments, and Distribution of Agricultural Pumps.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2025 - 2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-27-installation-of-water-level-gauge-readers---t",
      "title": "Installation of Water-Level Gauge Readers & Topographic Survey",
      "client": "Bangladesh Agricultural Development Corporation (BADC)",
      "category": "WATER RESOURCES & GIS",
      "location": "Gangarampur Union, Batiaghata, Khulna",
      "description": "Installation and adjustment of river water level gauge readers at three critical monitoring locations in Gangarampur under BADC. Conducted levelling surveys for Reduced Levels (RLs), RTK GNSS observations for geodetic control, and water depth soundings.",
      "deliverables": "Water Level Gauge Calibration, TBM Datum Transfer, River Water Depth Profiling, Bamboo Support Rig Installation",
      "imageUrl": "/projects-extracted/page_27/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 12,
      "isActive": true,
      "details": {
        "subtitle": "Hydrological Monitoring at Gangarampur",
        "images": [
          "/projects-extracted/page_27/img_02.jpg"
        ],
        "overview": "Installation and adjustment of river water level gauge readers at three critical monitoring locations in Gangarampur under BADC. Conducted levelling surveys for Reduced Levels (RLs), RTK GNSS observations for geodetic control, and water depth soundings.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "September 2025 - Continue",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-28-gangarampur-hydrological-water-level-monitori",
      "title": "Gangarampur Hydrological Water Level Monitoring Sites",
      "client": "Bangladesh Agricultural Development Corporation (BADC)",
      "category": "WATER RESOURCES & GIS",
      "location": "Batiaghata Upazila, Khulna",
      "description": "River gauging station outputs and calibrated water level readings across Jhopjhopia River Site (1.83 m), Guiyer Canal Opening near Amtola Canal (0.229 m), and Y-Section Point of Guiyer Canal (1.273 m).",
      "deliverables": "Jhopjhopia River Water Level: 1.83m, Guiyer Canal Opening: 0.229m, Guiyer Canal Y-Section: 1.273m, Topographic Bank Profiles",
      "imageUrl": "/projects-extracted/page_28/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 13,
      "isActive": true,
      "details": {
        "subtitle": "Jhopjhopia River & Guiyer Canal Water Levels",
        "images": [
          "/projects-extracted/page_28/img_02.jpg",
          "/projects-extracted/page_28/img_04.jpg",
          "/projects-extracted/page_28/img_03.jpg"
        ],
        "overview": "River gauging station outputs and calibrated water level readings across Jhopjhopia River Site (1.83 m), Guiyer Canal Opening near Amtola Canal (0.229 m), and Y-Section Point of Guiyer Canal (1.273 m).",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2025 - 2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-29-abdulpur-railway-bypass-topographic---uav-pho",
      "title": "Abdulpur Railway Bypass Topographic & UAV Photogrammetry Survey",
      "client": "Bangladesh Railway / Oriental Consultants Global (OCG)",
      "category": "RAPID MAPPING & INFRASTRUCTURE",
      "location": "Abdulpur Bypass Station, Natore",
      "description": "Rapid delivery topographic and physical feature survey using RTK and RTK-enabled UAV drone flights for the Abdulpur Railway Bypass under subproject 2 of Railway Connectivity Improvement Preparatory Facility (RCIPF).",
      "deliverables": "Topographic Survey, UAV Flight Missions, Track Alignment Geometry, Rapid 14-Day Delivery",
      "imageUrl": "/projects-extracted/page_29/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 14,
      "isActive": true,
      "details": {
        "subtitle": "RCIPF Project (ADB Loan No: 6030 BAN)",
        "images": [
          "/projects-extracted/page_29/img_02.jpg"
        ],
        "overview": "Rapid delivery topographic and physical feature survey using RTK and RTK-enabled UAV drone flights for the Abdulpur Railway Bypass under subproject 2 of Railway Connectivity Improvement Preparatory Facility (RCIPF).",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "August 2026 (Completed within 14 Days)",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-30-abdulpur-railway-bypass-photogrammetry---surf",
      "title": "Abdulpur Railway Bypass Photogrammetry & Surface Outputs",
      "client": "Bangladesh Railway / OCG",
      "category": "RAPID MAPPING & INFRASTRUCTURE",
      "location": "Abdulpur, Natore",
      "description": "High-precision engineering surface outputs: Digital Surface Model (DSM), Digital Terrain Model (DTM), High-Resolution Orthomosaic, 0.20m Interval Contours, Land Use Land Cover (LULC), and Existing Railway Utilities.",
      "deliverables": "Digital Surface Model (DSM), Digital Terrain Model (DTM), High Resolution Orthomosaic, 0.20m Contours, LULC Classification, Railway Infrastructure Features",
      "imageUrl": "/projects-extracted/page_30/img_03.jpg",
      "isMilestone": true,
      "sortOrder": 15,
      "isActive": true,
      "details": {
        "subtitle": "DSM, DTM, Orthomosaic & 0.20m Contours",
        "images": [
          "/projects-extracted/page_30/img_03.jpg",
          "/projects-extracted/page_30/img_02.jpg",
          "/projects-extracted/page_30/img_05.jpg",
          "/projects-extracted/page_30/img_06.jpg",
          "/projects-extracted/page_30/img_07.jpg",
          "/projects-extracted/page_30/img_08.jpg",
          "/projects-extracted/page_30/img_04.jpg"
        ],
        "overview": "High-precision engineering surface outputs: Digital Surface Model (DSM), Digital Terrain Model (DTM), High-Resolution Orthomosaic, 0.20m Interval Contours, Land Use Land Cover (LULC), and Existing Railway Utilities.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-31-bus-route-rationalization---corridor-concept",
      "title": "Bus Route Rationalization & Corridor Concept Design for Dhaka",
      "client": "Dhaka Transport Coordination Authority (DTCA)",
      "category": "RAPID MAPPING & INFRASTRUCTURE",
      "location": "Dhaka Metropolitan Corridors",
      "description": "Preparation of Concept Design & Implementation Plan for Bus Route Rationalization and company-based bus service in Dhaka. Undertook Traffic Count Surveys, UAV-based Drone Surveys, and Origin-Destination passenger interviews within a rapid 30-day window.",
      "deliverables": "UAV Drone Corridor Flights, Classified Traffic Count Survey, Origin-Destination Surveys, Corridor Concept Design",
      "imageUrl": "/projects-extracted/page_31/img_01.jpg",
      "isMilestone": true,
      "sortOrder": 16,
      "isActive": true,
      "details": {
        "subtitle": "Company-Based Bus Service Implementation",
        "images": [
          "/projects-extracted/page_31/img_01.jpg",
          "/projects-extracted/page_31/img_02.png"
        ],
        "overview": "Preparation of Concept Design & Implementation Plan for Bus Route Rationalization and company-based bus service in Dhaka. Undertook Traffic Count Surveys, UAV-based Drone Surveys, and Origin-Destination passenger interviews within a rapid 30-day window.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "September 2026 (Completed within 30 Days)",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    },
    {
      "slug": "page-32-dtca-arterial-corridor-digital-surface-model",
      "title": "DTCA Arterial Corridor Digital Surface Model & Orthomosaic",
      "client": "Dhaka Transport Coordination Authority (DTCA)",
      "category": "RAPID MAPPING & INFRASTRUCTURE",
      "location": "Dhaka Arterial Roads",
      "description": "Dense urban corridor drone photogrammetry outputs: Digital Surface Model (DSM) and High-Resolution Orthomosaic covering key arterial transit routes in Dhaka.",
      "deliverables": "Corridor Digital Surface Model, High Resolution Orthomosaic, Junction Geometry Models",
      "imageUrl": "/projects-extracted/page_32/img_02.jpg",
      "isMilestone": true,
      "sortOrder": 17,
      "isActive": true,
      "details": {
        "subtitle": "High-Resolution Drone Corridor Deliverables",
        "images": [
          "/projects-extracted/page_32/img_02.jpg",
          "/projects-extracted/page_32/img_03.jpg"
        ],
        "overview": "Dense urban corridor drone photogrammetry outputs: Digital Surface Model (DSM) and High-Resolution Orthomosaic covering key arterial transit routes in Dhaka.",
        "challenges": [
          "Stringent engineering tolerances and tight delivery deadlines",
          "Complex field logistics across active urban corridors and dynamic river systems",
          "Full integration with municipal, railway, and national geospatial standards"
        ],
        "approach": [
          "Millimeter-precision geodetic control networks tied to Survey of Bangladesh benchmarks",
          "High-resolution RTK-enabled UAV drone flights and 3D photogrammetric processing",
          "Advanced structural design (ETABS), hydraulic calculations, and CAD civil drafting"
        ],
        "results": [
          "Approved statutory engineering drawings, 3D BIM models, and contour maps",
          "Delivered on-time to client authorities with complete QA/QC documentation"
        ],
        "toolsUsed": [
          "RTK GNSS",
          "UAV Drones",
          "Total Station",
          "AutoCAD Civil 3D",
          "ETABS",
          "GIS Databases"
        ],
        "timeline": "2026",
        "sector": "National Infrastructure & Urban Planning",
        "disciplines": [
          "Digital Survey",
          "Civil Engineering",
          "Photogrammetry",
          "GIS Modeling"
        ]
      }
    }
  ],
  "teams": [
    {
      "id": "39ce8c44-4306-4e79-b8ed-e627d7fcbe93",
      "slug": "mak-khan",
      "name": "Engr. Mohammad Abdul Karim Khan",
      "role": "Senior Project Manager & Technical Operations Lead",
      "category": "Project Management & Civil",
      "credentials": "B.Sc Civil Engg (UAP, 2012) • M.Sc Civil Engg (MIST, 2020) • PMP® (No: 3885755)",
      "bio": "Certified Project Management Professional (PMP®) with comprehensive civil engineering and master of science degree from MIST. Directs complex infrastructure schedule tracking, multidisciplinary QA/QC, and field survey deployment.",
      "image": "/team-photos/mak_khan.jpeg",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2026-11-08T19:18:04.719Z",
      "updatedAt": "2026-11-08T19:18:04.719Z"
    },
    {
      "id": "22415ff4-9622-4fa0-93d4-c4e5c8dc4694",
      "slug": "abdullah-al-mamun-asif",
      "name": "Ar. Abdullah Al Mamun (Asif)",
      "role": "Principal Architect & Infrastructure Lead",
      "category": "Architecture & Planning",
      "credentials": "B.Arch (SUST, 2013) • ADB Individual Consultant (CMS: 278284) • Member IAB",
      "bio": "12+ years of architectural planning, transit station design, and master planning. Led architectural designs for Railway Connectivity Improvement Preparatory Facility Project (RCIPF) under Bangladesh Railway and ADB across stations, diesel & electric locomotive workshops, and TOD circulation planning.",
      "image": "/team-photos/abdullah_al_mamun_asif.png",
      "sortOrder": 2,
      "isActive": true,
      "createdAt": "2026-11-08T19:18:54.569Z",
      "updatedAt": "2026-11-08T19:18:54.569Z"
    },
    {
      "id": "aa328149-8387-494b-b6d3-f7c5d8f7cd2a",
      "slug": "jarjina-kabir-priti",
      "name": "Ar. Jarjina Kabir Priti",
      "role": "Senior Station & Workshop Architect",
      "category": "Architecture & Planning",
      "credentials": "B.Arch (7+ Years Experience) • Climate & Master Planning Specialist",
      "bio": "Leads station and depot architectural design under Bangladesh Railway modernization programs with Oriental Consultants Global. Expert in large-scale master planning, 95-acre township layouts, working drawings, climate responsive design, and tender documentation.",
      "image": "/team-photos/jarjina_kabir_priti.png",
      "sortOrder": 3,
      "isActive": true,
      "createdAt": "2026-11-08T19:18:04.704Z",
      "updatedAt": "2026-11-08T19:18:04.704Z"
    },
    {
      "id": "766c8ae6-4826-4df6-827e-86de1ddad515",
      "slug": "kifayet-jahangir",
      "name": "Engr. Md. Kifayet Jahangir",
      "role": "Senior Structural Design & QA/QC Engineer",
      "category": "Leadership & Structural",
      "credentials": "B.Sc in Civil Engineering • Structural Analysis & Project Management Specialist",
      "bio": "Specialized in structural design compliance, ETABS/STAAD modeling, BNBC 2020 seismic/wind standards, and on-site engineering execution across heavy industrial and transit structures.",
      "image": "/team-photos/kifayet_jahangir.jpeg",
      "sortOrder": 4,
      "isActive": true,
      "createdAt": "2026-11-08T19:18:04.735Z",
      "updatedAt": "2026-11-08T19:18:04.735Z"
    },
    {
      "id": "a8da0c9e-47fb-4ff6-a93a-9126ead25a43",
      "slug": "shahid-hasan-khan",
      "name": "Engr. Muhammad Shahid Hasan Khan",
      "role": "Senior Civil & Environmental Engineer",
      "category": "Civil & Environmental",
      "credentials": "B.Sc Civil Engg (UITS, 2017) • M.Sc Environmental Science (SUB, 2023) • M.Sc Civil (IUBAT)",
      "bio": "Extensive experience in construction supervision, environmental drainage impact assessments, CAD modeling, and field engineering coordination on major infrastructure and municipal developments.",
      "image": "/team-photos/shahid_hasan_khan.jpg",
      "sortOrder": 5,
      "isActive": true,
      "createdAt": "2026-11-08T19:18:04.752Z",
      "updatedAt": "2026-11-08T19:18:04.752Z"
    },
    {
      "id": "93792e35-c7ba-4104-9aae-51e786c04869",
      "slug": "sabina-aktarin",
      "name": "Engr. Sabina Aktarin",
      "role": "Lead AutoCAD & Civil 3D Infrastructure Engineer",
      "category": "CAD & Civil 3D",
      "credentials": "17+ Years Professional Experience • AutoCAD | Civil 3D | BOQ & Cost Estimator",
      "bio": "17 years of specialized expertise in technical drafting, railway plan & profile, embankment cross-sections, RHD highway geometry, river training erosion protection walls, and detailed BOQs.",
      "image": "/team-photos/sabina_aktarin.jpg",
      "sortOrder": 6,
      "isActive": true,
      "createdAt": "2026-11-08T19:18:04.769Z",
      "updatedAt": "2026-11-08T19:18:04.769Z"
    },
    {
      "id": "c71b6b12-4849-4823-a327-d9c3bb59745e",
      "slug": "kazi-shah-alam",
      "name": "Kazi Md. Shah Alam",
      "role": "Senior Resettlement & Social Survey Specialist",
      "category": "Survey & Resettlement",
      "credentials": "B.S.S. (BNU, 1996) • 25+ Years Experience in Land Acquisition & Social Impact",
      "bio": "Veteran leader in socio-economic surveys, land acquisition impact assessment, corridor census data collection, and stakeholder coordination for national transport and water resources megaprojects.",
      "image": "/team-photos/kazi_md_shah_alam.jpg",
      "sortOrder": 7,
      "isActive": true,
      "createdAt": "2026-11-08T19:18:04.785Z",
      "updatedAt": "2026-11-08T19:18:04.785Z"
    },
    {
      "id": "d4587ca2-ffdc-4e58-8fc1-d39014ea4505",
      "slug": "rakibul-islam",
      "name": "Rakibul Islam",
      "role": "Senior CAD Alignment & Railway Drafter",
      "category": "CAD & Civil 3D",
      "credentials": "CAD & Civil Drafting Specialist • RCIPF Bangladesh Railway Project",
      "bio": "Specialized in General Arrangement Drawings (GAD), plan and profile generation, track geometry, and civil infrastructure documentation for Bangladesh Railway in association with Oriental Consultants Global.",
      "image": "/team-photos/rakibul_islam.jpg",
      "sortOrder": 8,
      "isActive": true,
      "createdAt": "2026-11-08T19:18:04.877Z",
      "updatedAt": "2026-11-08T19:18:04.877Z"
    }
  ]
} as const;
