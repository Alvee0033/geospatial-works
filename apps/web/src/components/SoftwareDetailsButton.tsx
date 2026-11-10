'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SoftwareTool } from '@/lib/software-expertise';

export default function SoftwareDetailsButton({ tool, children }: { tool: SoftwareTool; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      dialogRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="w-full text-left">
        {children}
      </button>
      {open && (
        <div className="gw-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section ref={dialogRef} tabIndex={-1} className="gw-dialog gw-software-dialog" role="dialog" aria-modal="true" aria-labelledby="software-dialog-title">
            <div className="gw-software-dialog-accent" aria-hidden="true" />
            <button type="button" onClick={() => setOpen(false)} className="gw-dialog-close" aria-label="Close software details"><X size={19} /></button>
            <div className="gw-software-dialog-layout">
              <div className="gw-software-dialog-logo-wrap">
                <div className="gw-software-dialog-logo">
                  <Image src={tool.logo} alt={`${tool.name} logo`} width={200} height={120} sizes="200px" loading="eager" />
                </div>
                <span className="gw-software-dialog-label">GEOSPATIAL WORKS · SOFTWARE</span>
              </div>
              <div className="gw-software-dialog-copy">
                <p className="gw-dialog-eyebrow">SOFTWARE PROFILE</p>
                <span className="gw-software-category">{tool.category}</span>
                <h2 id="software-dialog-title">{tool.name}</h2>
                <p className="gw-dialog-description">{tool.description}</p>
                <div className="gw-software-dialog-footer">
                  <span>Part of our digital toolkit</span>
                  <button type="button" className="gw-dialog-action" onClick={() => setOpen(false)}>Close details <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
