'use client';
import React, { useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import ScrollFloat from './ScrollFloat';

const categories = ['All Projects', 'Cadastral & Mouza', 'Drone & LiDAR', 'Infrastructure'];

const projectsData = [
  {
    id: 1,
    title: 'Dhaka-Ashulia Elevated Expressway Alignment',
    category: 'Infrastructure',
    location: 'Dhaka Corridor',
    image: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&q=75&w=600'
  },
  {
    id: 3,
    title: 'Chittagong Economic Zone 3D Mesh & Orthomosaic',
    category: 'Drone & LiDAR',
    location: 'Mirsarai Coast',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=75&w=600'
  },
  {
    id: 4,
    title: 'Sylhet Division Riverbank & Floodplain Modeling',
    category: 'Infrastructure',
    location: 'Surma Basin',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=75&w=600'
  },
  {
    id: 5,
    title: 'Cox’s Bazar Coastal Topographic & Land Survey',
    category: 'Cadastral & Mouza',
    location: 'Cox’s Bazar Coast',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=75&w=600'
  }
];

const ProjectsShowcaseSection = () => {
  const [activeCategory, setActiveCategory] = useState('All Projects');

  const filteredProjects = activeCategory === 'All Projects'
    ? projectsData
    : projectsData.filter(p => p.category === activeCategory);

  return (
    <section className="w-full py-24 md:py-36 relative bg-transparent overflow-hidden">
      {/* Decorative Brand Ambient Glowing Blob */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#20bc2e]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <ScrollReveal variant="fade">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-28 gap-8">
            <div>
              <ScrollFloat 
                containerClassName="text-left justify-start"
                textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight"
                scrollStart="top bottom+=10%"
                scrollEnd="bottom center+=20%"
              >
                Featured Works
              </ScrollFloat>
              <p className="text-gray-400 text-xs sm:text-sm font-semibold mt-3 max-w-sm">
                High-precision geospatial engineering and digital cadastral mappings deployed across Bangladesh.
              </p>
            </div>

            {/* Category Filter - Minimalist Text links */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-black tracking-widest uppercase transition-all duration-300 relative py-1 cursor-pointer ${
                    activeCategory === cat
                      ? 'text-[#20bc2e]'
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#20bc2e] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Projects Grid - Staggered Asymmetric grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-20 pb-20">
          {filteredProjects.map((project, index) => (
            <ScrollReveal 
              key={project.id} 
              variant="pop-zoom"
              className={index % 2 === 1 ? 'md:mt-16' : ''}
            >
              <div className="group relative w-full aspect-[16/10] sm:aspect-[16/11] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(32,188,46,0.12)] hover:shadow-[0_35px_65px_rgba(32,188,46,0.28)] transition-all duration-700 ease-out border border-[#20bc2e]/25">
                
                {/* Full-bleed background image with lazy load */}
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={400}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 z-0"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent z-10 pointer-events-none" />

                {/* Top-Right Capsule Badging */}
                <div className="absolute top-5 right-5 z-20">
                  <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-black/55 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-full border border-white/10 shadow-sm">
                    <MapPin className="w-3 h-3 text-[#20bc2e]" />
                    {project.location}
                  </span>
                </div>

                {/* Overlaid details directly on bottom edge */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 z-20 flex flex-col justify-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#20bc2e] mb-1.5">
                    {project.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    {project.title}
                  </h3>
                  
                  {/* View Specs Trigger on Hover */}
                  <div className="flex items-center space-x-1.5 mt-3 text-[9px] font-black text-gray-300 group-hover:text-white transition-colors duration-300">
                    <span>Explore Case Study</span>
                    <ArrowRight size={10} className="text-[#20bc2e] transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProjectsShowcaseSection;
