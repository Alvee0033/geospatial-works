'use client';

import Link from 'next/link';
import { ArrowUpRight, Compass, Crosshair, Navigation, Radio, Satellite, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [coords, setCoords] = useState({ lat: 23.8103, lng: 90.4125 });
  const [alt, setAlt] = useState(128.4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCoords({
        lat: Number((23.8103 + (Math.random() - 0.5) * 0.002).toFixed(6)),
        lng: Number((90.4125 + (Math.random() - 0.5) * 0.002).toFixed(6)),
      });
      setAlt(Number((128.4 + (Math.random() - 0.5) * 0.8).toFixed(1)));
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="tech-hero" aria-label="Geospatial Engineering Bangladesh">
      <div className="tech-hero-contour" aria-hidden="true" />
      
      <div className="tech-hero-container">
        {/* Left Column: Editorial Brand Copy */}
        <div className="tech-hero-copy">
          <div className="tech-hero-badge">
            <span className="tech-badge-dot" />
            <span>SUB-CENTIMETER RTK FIX • AUTONOMOUS UAV MAPPING</span>
          </div>

          <h1 className="tech-hero-title">
            Pioneering <span className="tech-hero-accent">Geospatial Engineering</span> in Bangladesh.
          </h1>

          <p className="tech-hero-description">
            High-precision digital surveying, LiDAR mapping, bathymetric modeling, and GIS consultancy for nation-building infrastructure.
          </p>

          <div className="tech-hero-actions">
            <Link href="/contact" className="tech-btn-primary">
              <span>Start Your Project</span>
              <ArrowUpRight size={17} />
            </Link>

            <Link href="/services" className="tech-btn-secondary">
              <span>Explore Our Tech</span>
            </Link>
          </div>

          <div className="tech-hero-metrics">
            <div className="tech-metric-item">
              <span className="tech-metric-val">±2mm</span>
              <span className="tech-metric-lbl">RTK GNSS Accuracy</span>
            </div>
            <div className="tech-metric-div" />
            <div className="tech-metric-item">
              <span className="tech-metric-val">64</span>
              <span className="tech-metric-lbl">Districts Coverage</span>
            </div>
            <div className="tech-metric-div" />
            <div className="tech-metric-item">
              <span className="tech-metric-val">100%</span>
              <span className="tech-metric-lbl">Verified Deliverables</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Relief Visual & Floating Glassmorphic Telemetry HUD */}
        <div className="tech-hero-visual-wrap">
          <div className="tech-visual-stage">
            <img 
              src="/bangladesh-geospatial-hero.jpg" 
              alt="3D Relief Map of Bangladesh with GNSS RTK base stations and autonomous UAV drones"
              className="tech-visual-img"
              loading="eager"
            />

            {/* Floating Top Telemetry Card (Drone Status) */}
            <div className="tech-hud-card tech-hud-top" aria-hidden="true">
              <div className="tech-hud-header">
                <div className="tech-hud-icon"><Radio size={14} /></div>
                <div>
                  <strong>Matrice 350 RTK</strong>
                  <small>Airborne • Mapping Grid</small>
                </div>
                <span className="tech-status-chip">ACTIVE</span>
              </div>
              <div className="tech-hud-grid">
                <div>
                  <span className="tech-hud-lbl">Altitude</span>
                  <span className="tech-hud-num">{alt} m</span>
                </div>
                <div>
                  <span className="tech-hud-lbl">Overlap</span>
                  <span className="tech-hud-num">80% / 75%</span>
                </div>
                <div>
                  <span className="tech-hud-lbl">GSD</span>
                  <span className="tech-hud-num">1.2 cm/px</span>
                </div>
              </div>
              <div className="tech-hud-progress">
                <div className="tech-hud-bar" />
              </div>
            </div>

            {/* Floating Bottom Telemetry Card (GNSS Coordinates) */}
            <div className="tech-hud-card tech-hud-bottom" aria-hidden="true">
              <div className="tech-hud-header">
                <div className="tech-hud-icon tech-hud-icon-red"><Crosshair size={14} /></div>
                <div>
                  <strong>RTK Base Station</strong>
                  <small>CHCNAV i83 GNSS</small>
                </div>
                <span className="tech-status-chip tech-chip-green">FIXED</span>
              </div>
              <div className="tech-coords-list">
                <div className="tech-coord-row">
                  <span>LAT</span>
                  <code>{coords.lat.toFixed(6)}° N</code>
                </div>
                <div className="tech-coord-row">
                  <span>LON</span>
                  <code>{coords.lng.toFixed(6)}° E</code>
                </div>
              </div>
              <div className="tech-hud-footer">
                <span><Satellite size={12} /> 28 Satellites Tracked</span>
                <span>HDOP: 0.6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

