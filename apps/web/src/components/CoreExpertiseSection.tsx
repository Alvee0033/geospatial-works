'use client';
import React, { useState } from 'react';
import { Compass, Crosshair, FileCheck, Waves, Ruler, Scale, Database, Activity, ArrowRight, LayoutGrid } from 'lucide-react';
import ServiceDetailsModal from './ServiceDetailsModal';
import ScrollReveal from './ScrollReveal';
import { motion } from 'framer-motion';

const CoreExpertiseSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedDetailsCard, setSelectedDetailsCard] = useState<any>(null);

  const categories = [
    { id: 'all', label: 'All Solutions', icon: <LayoutGrid size={13} /> },
    { id: 'surveying', label: 'Digital Surveying', icon: <Ruler size={13} /> },
    { id: 'gis', label: 'Mapping & GIS', icon: <Database size={13} /> },
    { id: 'remote-sensing', label: 'Remote Sensing', icon: <Activity size={13} /> },
    { id: 'consultancy', label: 'Consultancy', icon: <Scale size={13} /> }
  ];

  const expertiseCards = [
    {
      id: 1,
      category: 'surveying',
      title: 'Topographical Survey',
      description: 'Accurate 3D terrain and elevation mapping for land development and construction planning.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=75&w=600',
      icon: <Compass className="w-4 h-4 text-emerald-500" />,
      tags: ['3D Terrain', 'Elevation Maps', 'CAD Ready'],
      specs: {
        instrumentation: 'Total Station & RTK GNSS Receiver',
        accuracy: 'Survey-grade precision tied to national datum',
        standards: 'Survey of Bangladesh (SOB) Datum Aligned',
        deliverables: 'CAD Drawings (.DWG), 3D DTM Surface, Contour Maps'
      }
    },
    {
      id: 2,
      category: 'surveying',
      title: 'UAV Drone Aerial Survey',
      description: 'High-resolution aerial photography, 3D surface models, and large-area drone mapping.',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=75&w=600',
      icon: <Crosshair className="w-4 h-4 text-emerald-500" />,
      tags: ['Aerial Photos', '3D Models', 'Drone Mapping'],
      specs: {
        instrumentation: 'UAV Drones & High-Res Camera Sensors',
        accuracy: 'Sub-centimeter aerial resolution',
        standards: 'ASPRS Digital Geospatial Standards',
        deliverables: 'Orthomosaic TIFF, 3D Point Cloud, Digital Elevation Model'
      }
    },
    {
      id: 3,
      category: 'gis',
      title: 'Mouza & Boundary Survey',
      description: 'Digital Mouza map conversion and exact land boundary verification for legal peace of mind.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=75&w=600',
      icon: <FileCheck className="w-4 h-4 text-emerald-500" />,
      tags: ['Mouza Maps', 'Boundary Limits', 'Legal Verification'],
      specs: {
        instrumentation: 'Calibrated Map Digitizers & GNSS Boundary Pins',
        accuracy: 'Exact alignment to CS, SA, RS & BS records',
        standards: 'Directorate of Land Records & Surveys Bangladesh',
        deliverables: 'Superimposed Mouza Maps, Legal Demarcation Reports'
      }
    },
    {
      id: 4,
      category: 'surveying',
      title: 'Bathymetric Hydro Survey',
      description: 'Underwater depth mapping and waterbed profiling for rivers, lakes, and coastal projects.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=75&w=600',
      icon: <Waves className="w-4 h-4 text-emerald-500" />,
      tags: ['Underwater Depth', 'River Channels', 'Dredging Volume'],
      specs: {
        instrumentation: 'Hydrographic Echo Sounder & GPS Vessel',
        accuracy: 'Sub-centimeter depth and position profiling',
        standards: 'IHO Standards for Hydrographic Surveys',
        deliverables: 'Bathymetric Charts, Channel Profiles, Dredging Volume Reports'
      }
    },
    {
      id: 5,
      category: 'remote-sensing',
      title: 'Satellite Remote Sensing',
      description: 'Satellite imagery analysis, land cover mapping, and regional change monitoring.',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=75&w=600',
      icon: <Activity className="w-4 h-4 text-emerald-500" />,
      tags: ['Land Cover', 'Satellite Analysis', 'Change Monitoring'],
      specs: {
        instrumentation: 'Multi-Spectral Satellite Data Processing Engine',
        accuracy: 'High-confidence land cover classification',
        standards: 'Remote Sensing Data Processing Standards',
        deliverables: 'Land Cover Maps, Environmental Change Analysis'
      }
    },
    {
      id: 6,
      category: 'surveying',
      title: 'Construction Site Layout',
      description: 'Exact field marking for building columns, roads, bridges, and infrastructure alignment.',
      image: '/construction-site.png',
      icon: <Ruler className="w-4 h-4 text-emerald-500" />,
      tags: ['Building Axes', 'Road Alignment', 'Site Staking'],
      specs: {
        instrumentation: 'Precision Total Station & Laser Level Machine',
        accuracy: 'Tolerance within ±2mm on site',
        standards: 'Infrastructure Geometric Control Specifications',
        deliverables: 'Axis Reference Points, Pile Location Certificates'
      }
    },
    {
      id: 7,
      category: 'consultancy',
      title: 'Geospatial Consultancy',
      description: 'Expert advice and strategic planning for enterprise GIS, spatial data, and survey projects.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=75&w=600',
      icon: <Scale className="w-4 h-4 text-emerald-500" />,
      tags: ['GIS Strategy', 'Expert Advisory', 'Spatial Planning'],
      specs: {
        instrumentation: 'Senior Licensed Surveyors & GIS Consultants',
        accuracy: 'Data-driven decision support and policy alignment',
        standards: 'National & International Geospatial Standards',
        deliverables: 'Custom Consultancy Reports, System Architecture Roadmap'
      }
    },
    {
      id: 8,
      category: 'gis',
      title: 'GIS Mapping & Databases',
      description: 'Custom GIS map development and spatial database organization for organizations and cities.',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=75&w=600',
      icon: <Database className="w-4 h-4 text-emerald-500" />,
      tags: ['Digital Maps', 'GIS Database', 'Web Dashboards'],
      specs: {
        instrumentation: 'ArcGIS & QGIS Enterprise Spatial Software',
        accuracy: 'Clean, validated vector geodatabase structures',
        standards: 'Open Geospatial Consortium (OGC) Standards',
        deliverables: 'Geodatabase Files (.gdb), Interactive Web GIS Portals'
      }
    }
  ];

  const filteredCards = activeCategory === 'all' 
    ? expertiseCards 
    : expertiseCards.filter(c => c.category === activeCategory);

  return (
    <section 
      id="expertise" 
      className="w-full relative bg-transparent pt-20 pb-28"
    >

      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <ScrollReveal variant="pop-zoom">
          <div className="mb-14 text-center flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-[2px] bg-[#20bc2e] rounded-full"></div>
              <span className="text-[#20bc2e] font-bold text-xs md:text-sm tracking-[0.2em] uppercase">Core Solutions</span>
              <div className="w-10 h-[2px] bg-[#20bc2e] rounded-full"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20bc2e] to-[#127a1b]">Expertise</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base font-normal max-w-xl mx-auto leading-relaxed">
              Professional surveying, mapping, and GIS consultancy tailored for infrastructure and land planning.
            </p>
          </div>
        </ScrollReveal>

        {/* Minimal Pill Filter Bar */}
        <ScrollReveal variant="pop-zoom" delay={0.1}>
          {/* Desktop Filter Bar */}
          <div className="hidden sm:flex justify-center mb-14">
            <div className="bg-white/85 backdrop-blur-xl p-1.5 rounded-2xl flex flex-wrap gap-1 justify-center border border-gray-200/50 shadow-md">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center space-x-2 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-md scale-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`}
                >
                  <span className={activeCategory === cat.id ? 'text-white' : 'text-emerald-600'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Mobile Filter Grid (No Scroll) */}
          <div className="grid grid-cols-2 gap-1.5 sm:hidden mb-8 w-full px-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 text-center cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#122417] text-white shadow-sm border border-[#122417]'
                    : 'bg-white border border-gray-200/50 text-gray-500'
                } ${cat.id === 'all' ? 'col-span-2' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Stunning Square Grid - Visible on Desktop/Tablet */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCards.map((card, idx) => (
            <ScrollReveal 
              key={card.id} 
              variant="pop-zoom" 
              delay={(idx % 4) * 0.08}
              className="w-full h-full"
            >
              <div
                className="group relative bg-white rounded-3xl p-5 border border-gray-200/60 hover:border-emerald-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(32,188,46,0.12)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between h-full cursor-pointer overflow-hidden"
                onClick={() => setSelectedDetailsCard(card)}
              >
                {/* Luminous soft hover background blob */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(32,188,46,0.06)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

                {/* Top Border Active Gradient Accent Line */}
                <div className="absolute top-0 inset-x-8 h-[3px] bg-gradient-to-r from-emerald-500 to-green-400 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full" />

                <div>
                  {/* Photo Frame */}
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative mb-5 bg-gray-50 border border-gray-100/30">
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    
                    {/* Subtle Colored Tint on Image (fades on hover to full rich photo) */}
                    <div className="absolute inset-0 bg-emerald-900/10 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Floating Tech Icon */}
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md text-[#20bc2e] group-hover:bg-[#20bc2e] group-hover:text-white transition-all duration-300">
                      {card.icon}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#20bc2e] transition-colors mb-2.5 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-5 font-normal line-clamp-3">
                    {card.description}
                  </p>
                </div>

                {/* Tags & Action Button */}
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {card.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-emerald-50/80 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold transition-all duration-300 group-hover:bg-emerald-500/10 group-hover:text-[#20bc2e] group-hover:border-emerald-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-[#20bc2e] group-hover:text-emerald-700">
                    <span>Explore Details</span>
                    <ArrowRight size={13} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bento Visual Tiles Grid - Visible on Mobile Only */}
        <div className="grid grid-cols-2 gap-3.5 sm:hidden px-2">
          {filteredCards.map((card) => (
            <motion.div
              key={card.id}
              whileTap={{ scale: 0.96 }}
              className="relative w-full aspect-[3/4] rounded-[2.2rem] bg-[#f4faf6] p-3 border border-[#20bc2e]/30 shadow-[0_8px_25px_rgba(32,188,46,0.05)] flex flex-col justify-between cursor-pointer group"
              onClick={() => setSelectedDetailsCard(card)}
            >
              {/* Card Photo frame with portrait aspect ratio inside */}
              <div className="w-full aspect-[3/3.2] rounded-[1.5rem] overflow-hidden relative bg-white border border-emerald-500/10">
                <img 
                  src={card.image} 
                  alt={card.title} 
                  loading="lazy"
                  decoding="async"
                  width={200}
                  height={220}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Minimal Card Header / Icon Badge */}
              <div className="px-1 py-0.5 flex flex-col justify-center">
                <h4 className="text-xs font-black text-gray-900 leading-tight line-clamp-2">
                  {card.title}
                </h4>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-bold text-[#20bc2e] uppercase tracking-wider">
                    {card.category}
                  </span>
                  <ArrowRight size={12} className="text-gray-400 group-hover:text-[#20bc2e]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Interactive Service Details Popup Modal */}
      {selectedDetailsCard && (
        <ServiceDetailsModal
          card={selectedDetailsCard}
          onClose={() => setSelectedDetailsCard(null)}
        />
      )}

    </section>
  );
};

export default CoreExpertiseSection;
