      {/* =========================================================================
          SECTION 3: "SHAPING THE FUTURE" (SECTORS & SERVICES CAROUSEL)
          Exact WSP Layout: Pure white background (#FFFFFF), Title with < > navigation,
          4-column horizontal card carousel, paragraph below, and red outline button "What we do".
          ========================================================================= */}
      <section className="wsp-shaping bg-[#FFFFFF] text-[#141212] py-24 md:py-32 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 45, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1440px] mx-auto px-6 md:px-12"
        >
          {/* Section Header with Carousel Navigation */}
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-neutral-200 gap-6">
            <div>
              <span className="block text-[13px] sm:text-[14px] font-mono uppercase tracking-[0.22em] text-[#FB1D10] font-bold mb-2">
                OUR EXPERTISE
              </span>
              <h2 className="text-[38px] sm:text-[50px] md:text-[62px] lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[1.02] text-[#141212]">
                Core Capabilities & <span className="text-[#3B82F6]">Specializations</span>
              </h2>
              <p className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold text-neutral-500 tracking-tight mt-2">
                Shaping the future through precision geospatial intelligence.
              </p>
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => scrollServices('left')}
                className
<truncated 3882 bytes>