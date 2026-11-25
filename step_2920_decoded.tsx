"          {/* Section Header with Carousel Navigation */}
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-neutral-200 gap-6">
            <div>
              <span className="block text-[12px] sm:text-[13px] font-mono uppercase tracking-[0.25em] text-[#3B82F6] font-bold mb-3">
                CORE CAPABILITIES & SPECIALIZATIONS
              </span>
              <h2 className="text-[44px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-extrabold tracking-[-0.035em] leading-[0.98] text-[#141212]">
                Shaping the <span className="text-[#3B82F6]">future</span>
              </h2>
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => scrollServices('left')}
                className="w-13 h-13 p-3.5 rounded-none border border-neutral-300 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-blue-50/50 flex items-center justify-center transition-all duration-200"
                aria-label="Previous capabilities"
              >
                <ChevronLeft size={22} className="text-current" />
              </button>
              <button
                type="button"
                onClick={() => scrollServices('right')}
                className="w-13 h-13 p-3.5 rounded-none border border-neutral-300 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-blue-50/50 flex items-center justify-center transition-all duration-200"
                aria-label="Next capabilities"
              >
                <ChevronRight size={22} className="text-current" />
              </button>
            </div>
          </div>

          {/* Horizontal Card Row with refined brand card styling */}
          <div
            ref={servicesScrollRef}
            className="flex gap-7 overflow-x-auto no-scrollbar pt-12 pb-6 scroll-smooth"
          
<truncated 2033 bytes>