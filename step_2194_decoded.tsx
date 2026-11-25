"          {/* Section Header with Carousel Navigation */}
          <div className="flex items-center justify-between pb-10 border-b border-neutral-200">
            <div>
              <span className="block text-[11px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-semibold mb-2">
                CORE CAPABILITIES & SPECIALIZATIONS
              </span>
              <h2 className="text-[34px] sm:text-[44px] md:text-[54px] font-extrabold tracking-[-0.03em] leading-none text-[#141212]">
                Shaping the future
              </h2>
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollServices('left')}
                className="w-12 h-12 rounded-none border border-neutral-300 hover:border-[#3B82F6] hover:text-[#3B82F6] flex items-center justify-center transition-colors"
                aria-label="Previous capabilities"
              >
                <ChevronLeft size={20} className="text-current" />
              </button>
              <button
                type="button"
                onClick={() => scrollServices('right')}
                className="w-12 h-12 rounded-none border border-neutral-300 hover:border-[#3B82F6] hover:text-[#3B82F6] flex items-center justify-center transition-colors"
                aria-label="Next capabilities"
              >
                <ChevronRight size={20} className="text-current" />
              </button>
            </div>
          </div>

          {/* Horizontal Card Row */}
          <div
            ref={servicesScrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar pt-10 pb-6 scroll-smooth"
          >
            {serviceList.map((svc, i) => (
              <Link
                key={svc.slug || i}
                href={`/services/${svc.slug}`}
                className="group flex-none w-[280px] sm:w-
<truncated 1031 bytes>