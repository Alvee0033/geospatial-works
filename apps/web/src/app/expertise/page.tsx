'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Crosshair, Waves, Ruler, Scale, Database, Activity, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ExpertisePage() {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const services = [
    {
      id: 1,
      category: 'surveying',
      title: 'Topographical & Engineering Surveying',
      icon: <Ruler className="w-5 h-5 text-white" />,
      desc: "Millimeter-grade 3D elevation models, contour lines, and physical feature mapping. We align baseline reference loops directly to Survey of Bangladesh Geodetic control points for maximum accuracy.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=70&w=600",
      features: ["Ellipsoid & Orthometric Height Matching", "Site Boundary & Total Station Setups", "Volumetric Earthwork Computations"],
      specs: {
        instrumentation: "Leica TS07 Reflectorless Total Station, Trimble R12 GNSS receivers",
        accuracy: "Horizontal: 8mm + 0.5ppm | Vertical: 15mm + 1ppm (tied to local bench monuments)",
        standards: "Survey of Bangladesh (SOB) Datum Grid, WGS84 mapping coordinates",
        deliverables: "Georeferenced CAD files (.dwg), raw ASCII point logs (.xyz, .csv), PDF contour maps"
      }
    },
    {
      id: 2,
      category: 'uav',
      title: 'UAV Drone Photogrammetry & LiDAR',
      icon: <Crosshair className="w-5 h-5 text-white" />,
      desc: "Deploying commercial mapping drones calibrated with dual-frequency Ground Control Points (GCPs). Ideal for fast topological audits, stockpile calculation, and orthophoto compilation.",
      image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=70&w=600",
      features: ["1cm/pixel Ground Sample Distance (GSD)", "3D Digital Surface Models (DSM)", "Large-scale Orthomosaic Mapping"],
      specs: {
        instrumentation: "DJI Matrice 300 RTK with Zenmuse L1 LiDAR, Phantom 4 RTK",
        accuracy: "Absolute Vertical: <5cm | Absolute Horizontal: <3cm (ASPRS Class I)",
        standards: "ASPRS Accuracy Standards for Digital Geospatial Data",
        deliverables: "High-resolution geoTIFF Orthomosaic, Las/Laz point clouds, DTM/DSM elevation matrices"
      }
    },
    {
      id: 3,
      category: 'gis',
      title: 'GIS Database Development & Analytics',
      icon: <Database className="w-5 h-5 text-white" />,
      desc: "Creating geo-databases, mapping holdings, zoning boundaries, and web-GIS interactive portal panels. We convert raw vector files into visual intelligence.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=70&w=600",
      features: ["Vectorization of Cadastral Mouza Maps", "Dynamic Web Map Portals (Leaflet, Mapbox)", "Multi-Criteria Decision Analysis (MCDA)"],
      specs: {
        instrumentation: "Esri ArcGIS Pro, QGIS Desktop, PostgreSQL / PostGIS spatial databases",
        accuracy: "Topological consistency check, mapping tolerances under 0.1m",
        standards: "OGC (Open Geospatial Consortium) Spatial Interoperability Standards",
        deliverables: "Enterprise Geodatabase exports (.gdb, .shp), custom hosted web dashboard links"
      }
    },
    {
      id: 4,
      category: 'hydro',
      title: 'Bathymetric & Hydrographic Surveying',
      icon: <Waves className="w-5 h-5 text-white" />,
      desc: "Echolocation profile mapping for waterbeds, rivers, and ponds. Essential for channel dredging computations, bridge pier designs, and coastal revetment audits.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=70&w=600",
      features: ["Single-Beam Depth Profiling", "River Bed Siltation Volumetric Analysis", "Cross-Section Channel Worksheets"],
      specs: {
        instrumentation: "South SDE-28S Echo Sounder, georeferenced RTK positioning receiver",
        accuracy: "Vertical depth measurement resolution: ±1cm tied to local water level datums",
        standards: "IHO (International Hydrographic Organization) Standards for Hydrographic Surveys",
        deliverables: "Bathymetric depth charts, volumetric dredging reports, riverbed cross-sections"
      }
    },
    {
      id: 5,
      category: 'remote',
      title: 'Satellite Remote Sensing & Monitoring',
      icon: <Activity className="w-5 h-5 text-white" />,
      desc: "Processing multi-spectral satellite imagery to track regional land cover, urban expansion, vegetation health, and environmental change over time.",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=70&w=600",
      features: ["Vegetation Index Mapping (NDVI)", "Urban Heat Island & Surface Temperature", "Land Use / Land Cover Classification"],
      specs: {
        instrumentation: "Sentinel-2, Landsat-8/9 datasets, Google Earth Engine API processing",
        accuracy: "Spatial resolutions ranging from 30m down to 3m PlanetScope band overlays",
        standards: "USGS & ESA Imagery Quality Standards",
        deliverables: "Classified geotIFF maps, temporal change report folders, NDWI index charts"
      }
    },
    {
      id: 6,
      category: 'valuation',
      title: 'Certified Land & Property Valuation',
      icon: <Scale className="w-5 h-5 text-white" />,
      desc: "Legally compliant asset appraisals, land acquisitions valuations, and building structural worksheets. Accepted by leading banking institutions and court benches.",
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=70&w=600",
      features: ["Bank Enlisted Appraisals", "Legal Land Acquisition Audits", "Mouza Registry Superimposition Reports"],
      specs: {
        instrumentation: "Land registration databases, comparative real estate models, physical area confirmation",
        accuracy: "Aligned with prevailing Sub-Registry and Public Works Department (PWD) schedule rates",
        standards: "Bangladesh land registry laws, RICS appraisal standards guidelines",
        deliverables: "Stamping-ready certified valuation report folders with detailed structural sheets"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-100 selection:text-green-900 overflow-x-hidden flex flex-col justify-between">
      <Navbar />
      <FloatingContact />

      <main className="flex-grow pt-24 md:pt-32">
        {/* Banner Hero */}
        <section className="relative w-full py-16 md:py-28 overflow-hidden bg-gradient-to-br from-[#0c1a10] via-[#050b07] to-[#0a140d] border-b border-emerald-950">
          <div 
            className="absolute inset-0 opacity-[0.18] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(32, 188, 46, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(32, 188, 46, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b07] via-transparent to-[#0c1a10] opacity-80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[400px] bg-[#20bc2e]/15 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
            <ScrollReveal variant="slide-up">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Our Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] via-emerald-400 to-[#10b981]">Capabilities</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
                Utilizing advanced field instrumentation and GIS databases to power infrastructure, delta management, and property verification in Bangladesh.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Dynamic canvas */}
        <div 
          className="w-full relative overflow-hidden pb-16 sm:pb-24"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, rgba(244, 250, 246, 0.6) 30%, rgba(32, 188, 46, 0.03) 70%, #f0fdf4 100%)'
          }}
        >
          {/* Subtle Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.1] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(32, 188, 46, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(32, 188, 46, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 60%, transparent 100%)'
            }}
          />

          {/* Grid of expertise */}
          <section className="py-12 sm:py-20 max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {services.map((srv, idx) => (
                <ScrollReveal key={srv.id} variant="slide-up" delay={idx * 0.05}>
                  <Link 
                    href={`/expertise/${srv.id}`}
                    className="bg-white border border-emerald-500/10 rounded-[2rem] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:border-[#20bc2e]/40 transition-all duration-500 group flex flex-col justify-between h-full cursor-pointer block transform hover:-translate-y-1.5"
                  >
                    <div>
                      {/* Image header */}
                      <div className="h-48 sm:h-52 w-full overflow-hidden relative">
                        <img 
                          src={srv.image} 
                          alt={srv.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050b07]/85 via-[#050b07]/30 to-transparent"></div>
                        
                        {/* Floating Icon Badge */}
                        <div className="absolute bottom-4 left-4 p-3 bg-gradient-to-br from-emerald-800 to-green-700 rounded-2xl shadow-lg border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                          {srv.icon}
                        </div>

                        {/* Top-Right Badge */}
                        <span className="absolute top-4 right-4 bg-emerald-950/80 backdrop-blur-md text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/20">
                          SPECIFICATION DOC
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="p-6 sm:p-8 space-y-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight group-hover:text-[#20bc2e] transition-colors leading-snug">
                          {srv.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-light">
                          {srv.desc}
                        </p>
                        
                        {/* Bullet checklist */}
                        <ul className="space-y-2 pt-2 border-t border-gray-100">
                          {srv.features.map((feat, fidx) => (
                            <li key={fidx} className="flex items-center gap-2 text-xs text-gray-700 font-light">
                              <CheckCircle2 size={13} className="text-[#20bc2e] flex-shrink-0" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2">
                      <div className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-[#f4faf6] border border-[#20bc2e]/15 group-hover:bg-gradient-to-r group-hover:from-emerald-800 group-hover:to-green-700 transition-all duration-300">
                        <span className="text-[10px] sm:text-xs font-black text-emerald-800 group-hover:text-white uppercase tracking-widest transition-colors">
                          View Full Specs & Overview
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-[#20bc2e] group-hover:bg-white text-white group-hover:text-emerald-800 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Workflow description */}
          <section className="py-8 sm:py-16 max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
            <ScrollReveal variant="slide-up" className="bg-white border border-[#20bc2e]/10 rounded-[2.5rem] p-6 sm:p-14 shadow-[0_15px_50px_rgba(0,0,0,0.02)]">
              <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-12">
                Our Geodetic Work Cycle
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative">
                {/* Horizontal line for desktop connection */}
                <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-[2px] bg-emerald-500/10 -z-10" />

                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto bg-[#f4faf6] border border-[#20bc2e]/20 rounded-2xl flex items-center justify-center font-black text-emerald-800 text-lg shadow-sm">
                    1
                  </div>
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg">Field Data Acquisition</h4>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-light px-2 sm:px-4">
                    Deploying L1/L2 GNSS base-rovers, total stations, or LiDAR drones to collect millions of physical coordinate coordinates.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto bg-[#f4faf6] border border-[#20bc2e]/20 rounded-2xl flex items-center justify-center font-black text-emerald-800 text-lg shadow-sm">
                    2
                  </div>
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg">Triangulation & Superimposition</h4>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-light px-2 sm:px-4">
                    Correcting elevation shifts, transforming coordinate ellipsoids, and matching layers on local CS, SA, RS, BS archives.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto bg-[#f4faf6] border border-[#20bc2e]/20 rounded-2xl flex items-center justify-center font-black text-emerald-800 text-lg shadow-sm">
                    3
                  </div>
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg">Precision Auditing & Stamps</h4>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-light px-2 sm:px-4">
                    Running ASPRS accuracy metrics, producing certified valuation stamps, and delivering fully stamped geodatabases.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
