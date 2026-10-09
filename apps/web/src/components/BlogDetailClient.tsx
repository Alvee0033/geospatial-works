'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, User, Sparkles, Database, Compass, Landmark, Play, Pause, Volume2, Maximize } from 'lucide-react';

export interface BlogPostData {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string[];
  image: string;
  videoUrl: string;
  date: string;
  readTime: string;
  author: string;
  details: {
    equipment: string;
    accuracy: string;
    datum: string;
  };
}

export default function BlogDetailClient({ post }: { post: BlogPostData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-100 selection:text-green-900 overflow-x-hidden flex flex-col justify-between">
      <Navbar />
      <FloatingContact />

      <main className="flex-grow pt-24 md:pt-32">
        {/* Navigation Link back */}
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 mb-6">
          <Link 
            href="/blog" 
            className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 hover:text-[#20bc2e] tracking-widest uppercase transition-colors group cursor-pointer"
          >
            <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Back to Vlog Center</span>
          </Link>
        </div>

        {/* Dynamic article layout */}
        <article className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-24 space-y-10">
          
          {/* Header block */}
          <ScrollReveal variant="slide-up" className="space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-[#f4faf6] border border-[#20bc2e]/20 text-emerald-800 font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                VLOG CATEGORY: {post.category === 'uav' ? 'UAV Photogrammetry' :
                 post.category === 'cadastral' ? 'Cadastral Surveying' :
                 post.category === 'gis' ? 'GIS Database Systems' : 'Hydrographic Depth'}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                {post.title}
              </h1>
              <p className="text-gray-500 text-sm sm:text-lg font-light leading-relaxed">
                {post.subtitle}
              </p>
            </div>

            {/* Author row */}
            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-emerald-500/10 text-xs text-gray-500 font-medium">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#f4faf6] flex items-center justify-center text-[10px] font-black text-emerald-800 border border-[#20bc2e]/10">
                  <User size={14} />
                </div>
                <div>
                  <span className="text-gray-900 block font-bold">{post.author}</span>
                  <span className="text-[10px] text-gray-400 font-light block">Survey Consultant</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#20bc2e]" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#20bc2e]" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Interactive Vlog Video Player */}
          <ScrollReveal variant="pop-zoom" className="w-full space-y-4">
            <h3 className="text-sm font-extrabold text-emerald-800 tracking-wider uppercase flex items-center gap-2">
              <Play size={14} className="text-[#20bc2e] fill-[#20bc2e]" />
              <span>Watch Technical Vlog</span>
            </h3>
            
            <div className="relative rounded-[2.5rem] overflow-hidden border border-emerald-500/20 shadow-xl bg-black aspect-video group">
              <video 
                ref={videoRef}
                src={post.videoUrl} 
                className="w-full h-full object-cover"
                loop
                playsInline
                onClick={togglePlay}
              />
              
              {/* Custom play overlay */}
              {!isPlaying && (
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-black/30"
                  onClick={togglePlay}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#20bc2e] hover:bg-[#1ba829] text-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 group-hover:scale-105 active:scale-95 pl-1.5">
                    <Play size={32} className="fill-white" />
                  </div>
                </div>
              )}

              {/* Minimal player controls HUD bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between text-white text-xs">
                <button onClick={togglePlay} className="p-1 hover:text-[#20bc2e] transition-colors cursor-pointer">
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <div className="flex items-center space-x-3">
                  <Volume2 size={18} />
                  <Maximize size={18} />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-mono text-center">Interactive Vlog Stream: Mixkit Photogrammetry Preview Data</p>
          </ScrollReveal>

          {/* Two column grid context */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6">
            {/* Left reading side */}
            <div className="lg:col-span-8 space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed font-light font-sans">
              <h3 className="text-xl font-bold text-gray-900 mb-2 border-b border-[#20bc2e]/10 pb-2">Vlog Overview & Transcript</h3>
              {post.content.map((para, pidx) => (
                <p key={pidx}>{para}</p>
              ))}
            </div>

            {/* Right details sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#f4faf6] border border-[#20bc2e]/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <h4 className="font-extrabold text-gray-900 text-sm tracking-wider uppercase border-b border-[#20bc2e]/10 pb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#20bc2e]" />
                  <span>Technical Specs</span>
                </h4>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium uppercase tracking-wider block mb-1">Field Equipment</span>
                    <div className="flex items-start gap-2">
                      <Compass size={14} className="text-[#20bc2e] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800 font-bold leading-tight">{post.details.equipment}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase tracking-wider block mb-1">Target Precision</span>
                    <div className="flex items-start gap-2">
                      <Database size={14} className="text-[#20bc2e] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800 font-bold leading-tight">{post.details.accuracy}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase tracking-wider block mb-1">Grid Coordinate Reference</span>
                    <div className="flex items-start gap-2">
                      <Landmark size={14} className="text-[#20bc2e] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800 font-bold leading-tight">{post.details.datum}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
