import re

with open('apps/admin/src/components/AboutWysiwygEditor.tsx', 'r') as f:
    text = f.read()

# ==========================================
# 1. OUR-STORY: Stats
# ==========================================
old_story_stats = """                  {/* 4 STATS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-800/80">
                    {storyData.stats.map((s: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                        <span className="block text-2xl font-extrabold text-white font-mono">
                          <EditableText
                            value={s.value}
                            onChange={(val) => {
                              const next = [...storyData.stats];
                              next[idx].value = val;
                              handleDataChange('our-story', 'stats', next);
                            }}
                          />
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                          <EditableText
                            value={s.label}
                            onChange={(val) => {
                              const next = [...storyData.stats];
                              next[idx].label = val;
                              handleDataChange('our-story', 'stats', next);
                            }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>"""

new_story_stats = """                  {/* DYNAMIC STATS */}
                  <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Hero Metrics</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...storyData.stats, { value: 'New Metric', label: 'Description' }];
                          handleDataChange('our-story', 'stats', next);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {storyData.stats.map((s: any, idx: number) => (
                        <div key={idx} className="relative group/stat bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (storyData.stats.length <= 1) return;
                              const next = storyData.stats.filter((_: any, i: number) => i !== idx);
                              handleDataChange('our-story', 'stats', next);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover/stat:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                            title="Remove metric"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="block text-2xl font-extrabold text-white font-mono">
                            <EditableText
                              value={s.value}
                              onChange={(val) => {
                                const next = [...storyData.stats];
                                next[idx].value = val;
                                handleDataChange('our-story', 'stats', next);
                              }}
                            />
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                            <EditableText
                              value={s.label}
                              onChange={(val) => {
                                const next = [...storyData.stats];
                                next[idx].label = val;
                                handleDataChange('our-story', 'stats', next);
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>"""

assert old_story_stats in text, "old_story_stats not found"
text = text.replace(old_story_stats, new_story_stats)

# ==========================================
# 2. OUR-STORY: Disciplines
# ==========================================
old_story_disc = """              {/* DISCIPLINES */}
              <section className="py-16 px-6 md:px-12 bg-white border-b border-neutral-200 space-y-8">
                <div className="max-w-3xl space-y-2">
                  <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                    THREE CORE DISCIPLINES
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                    An Integrated Engineering Ecosystem
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {storyData.disciplines.map((d: any, idx: number) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                        <EditablePhoto
                          src={d.image}
                          alt={d.title}
                          onPick={() =>
                            onOpenMediaPicker((url) => {
                              const next = [...storyData.disciplines];
                              next[idx].image = url;
                              handleDataChange('our-story', 'disciplines', next);
                            })
                          }
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-[#141212]">
                            <EditableText
                              value={d.title}
                              onChange={(val) => {
                                const next = [...storyData.disciplines];
                                next[idx].title = val;
                                handleDataChange('our-story', 'disciplines', next);
                              }}
                            />
                          </h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            <EditableText
                              value={d.desc}
                              onChange={(val) => {
                                const next = [...storyData.disciplines];
                                next[idx].desc = val;
                                handleDataChange('our-story', 'disciplines', next);
                              }}
                              multiline
                              rows={3}
                            />
                          </p>
                        </div>

                        <EditableBulletList
                          bullets={d.bullets}
                          onChange={(items) => {
                            const next = [...storyData.disciplines];
                            next[idx].bullets = items;
                            handleDataChange('our-story', 'disciplines', next);
                          }}
                          color="red"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>"""

new_story_disc = """              {/* DISCIPLINES */}
              <section className="py-16 px-6 md:px-12 bg-white border-b border-neutral-200 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      CORE DISCIPLINES
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      An Integrated Engineering Ecosystem
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...storyData.disciplines,
                        {
                          number: `0${storyData.disciplines.length + 1}`,
                          title: 'New Engineering Discipline',
                          desc: 'Description of the engineering capability, methodologies, and deliverables.',
                          bullets: ['Core deliverable point one', 'Standard compliance point two'],
                          image: '/real-media/service-topographic-uav.png',
                        },
                      ];
                      handleDataChange('our-story', 'disciplines', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#F4382D] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Discipline Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storyData.disciplines.map((d: any, idx: number) => (
                    <div key={idx} className="relative group/disc bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      <button
                        type="button"
                        onClick={() => {
                          if (storyData.disciplines.length <= 1) return;
                          const next = storyData.disciplines.filter((_: any, i: number) => i !== idx);
                          handleDataChange('our-story', 'disciplines', next);
                        }}
                        className="absolute top-3 left-3 z-30 opacity-0 group-hover/disc:opacity-100 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-lg transition"
                        title="Delete discipline card"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                        <EditablePhoto
                          src={d.image}
                          alt={d.title}
                          onPick={() =>
                            onOpenMediaPicker((url) => {
                              const next = [...storyData.disciplines];
                              next[idx].image = url;
                              handleDataChange('our-story', 'disciplines', next);
                            })
                          }
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-[#141212]">
                            <EditableText
                              value={d.title}
                              onChange={(val) => {
                                const next = [...storyData.disciplines];
                                next[idx].title = val;
                                handleDataChange('our-story', 'disciplines', next);
                              }}
                            />
                          </h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            <EditableText
                              value={d.desc}
                              onChange={(val) => {
                                const next = [...storyData.disciplines];
                                next[idx].desc = val;
                                handleDataChange('our-story', 'disciplines', next);
                              }}
                              multiline
                              rows={3}
                            />
                          </p>
                        </div>

                        <EditableBulletList
                          bullets={d.bullets || []}
                          onChange={(items) => {
                            const next = [...storyData.disciplines];
                            next[idx].bullets = items;
                            handleDataChange('our-story', 'disciplines', next);
                          }}
                          color="red"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>"""

assert old_story_disc in text, "old_story_disc not found"
text = text.replace(old_story_disc, new_story_disc)

# ==========================================
# 3. OUR-STORY: Milestones
# ==========================================
old_story_mile = """              {/* TIMELINE */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-8">
                <div className="max-w-3xl space-y-2">
                  <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                    NATIONAL TRACK RECORD
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Key Milestones &amp; Project Evolution
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storyData.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                      <span className="block text-lg font-extrabold text-[#F4382D] font-mono">
                        <EditableText
                          value={m.year}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].year = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                        />
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        <EditableText
                          value={m.title}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].title = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                        />
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        <EditableText
                          value={m.desc}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].desc = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                          multiline
                          rows={3}
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </section>"""

new_story_mile = """              {/* TIMELINE */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      NATIONAL TRACK RECORD
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Key Milestones &amp; Project Evolution
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...storyData.milestones,
                        {
                          year: '2025–Future',
                          title: 'Next Evolution Milestone',
                          desc: 'Description of the major milestone achievement and nationwide impact.',
                        },
                      ];
                      handleDataChange('our-story', 'milestones', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#3B82F6] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Milestone Card
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storyData.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="relative group/mile bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (storyData.milestones.length <= 1) return;
                          const next = storyData.milestones.filter((_: any, i: number) => i !== idx);
                          handleDataChange('our-story', 'milestones', next);
                        }}
                        className="absolute top-2.5 right-2.5 opacity-0 group-hover/mile:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                        title="Delete milestone"
                      >
                        <Trash2 size={13} />
                      </button>
                      <span className="block text-lg font-extrabold text-[#F4382D] font-mono">
                        <EditableText
                          value={m.year}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].year = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                        />
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        <EditableText
                          value={m.title}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].title = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                        />
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        <EditableText
                          value={m.desc}
                          onChange={(val) => {
                            const next = [...storyData.milestones];
                            next[idx].desc = val;
                            handleDataChange('our-story', 'milestones', next);
                          }}
                          multiline
                          rows={3}
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </section>"""

assert old_story_mile in text, "old_story_mile not found"
text = text.replace(old_story_mile, new_story_mile)

# ==========================================
# 4. FUTURE-READY: Stats
# ==========================================
old_future_stats = """                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-800/80">
                    {futureReadyData.stats.map((s: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                        <span className="block text-2xl font-extrabold text-[#3B82F6] font-mono">
                          <EditableText
                            value={s.value}
                            onChange={(val) => {
                              const next = [...futureReadyData.stats];
                              next[idx].value = val;
                              handleDataChange('future-ready', 'stats', next);
                            }}
                          />
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                          <EditableText
                            value={s.label}
                            onChange={(val) => {
                              const next = [...futureReadyData.stats];
                              next[idx].label = val;
                              handleDataChange('future-ready', 'stats', next);
                            }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>"""

new_future_stats = """                  {/* DYNAMIC SENSOR METRICS */}
                  <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Sensor Metrics</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...futureReadyData.stats, { value: 'New Spec', label: 'Metric Description' }];
                          handleDataChange('future-ready', 'stats', next);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {futureReadyData.stats.map((s: any, idx: number) => (
                        <div key={idx} className="relative group/stat bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (futureReadyData.stats.length <= 1) return;
                              const next = futureReadyData.stats.filter((_: any, i: number) => i !== idx);
                              handleDataChange('future-ready', 'stats', next);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover/stat:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                            title="Remove metric"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="block text-2xl font-extrabold text-[#3B82F6] font-mono">
                            <EditableText
                              value={s.value}
                              onChange={(val) => {
                                const next = [...futureReadyData.stats];
                                next[idx].value = val;
                                handleDataChange('future-ready', 'stats', next);
                              }}
                            />
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                            <EditableText
                              value={s.label}
                              onChange={(val) => {
                                const next = [...futureReadyData.stats];
                                next[idx].label = val;
                                handleDataChange('future-ready', 'stats', next);
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>"""

assert old_future_stats in text, "old_future_stats not found"
text = text.replace(old_future_stats, new_future_stats)

# ==========================================
# 5. FUTURE-READY: Fleet
# ==========================================
old_future_fleet = """              {/* FLEET */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-8">
                <div className="max-w-3xl space-y-2">
                  <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                    SURVEY-GRADE HARDWARE FLEET
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                    Precision Sensors for Bangladesh Ground &amp; Waters
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {futureReadyData.fleet.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      <div className="relative h-56 w-full bg-neutral-900 overflow-hidden">
                        <EditablePhoto
                          src={item.image}
                          alt={item.name}
                          onPick={() =>
                            onOpenMediaPicker((url) => {
                              const next = [...futureReadyData.fleet];
                              next[idx].image = url;
                              handleDataChange('future-ready', 'fleet', next);
                            })
                          }
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#3B82F6] font-bold block">
                            <EditableText
                              value={item.discipline}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].discipline = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                            />
                          </span>
                          <h3 className="text-base font-bold text-[#141212]">
                            <EditableText
                              value={item.name}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].name = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                            />
                          </h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            <EditableText
                              value={item.specs}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].specs = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                              multiline
                              rows={2}
                            />
                          </p>
                        </div>

                        <EditableBulletList
                          bullets={item.bullets}
                          onChange={(items) => {
                            const next = [...futureReadyData.fleet];
                            next[idx].bullets = items;
                            handleDataChange('future-ready', 'fleet', next);
                          }}
                          color="red"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>"""

new_future_fleet = """              {/* FLEET */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      SURVEY-GRADE HARDWARE FLEET
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      Precision Sensors for Bangladesh Ground &amp; Waters
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...futureReadyData.fleet,
                        {
                          name: 'New Survey Sensor System',
                          discipline: 'Geospatial Equipment Subsystem',
                          specs: 'Sensor technical specifications, pulse frequencies, accuracy thresholds, and operational limits.',
                          bullets: ['Statutory calibration and verification', 'Direct coordinate integration'],
                          image: '/real-media/equipment-rtk-gnss-station.jpg',
                        },
                      ];
                      handleDataChange('future-ready', 'fleet', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#F4382D] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Equipment Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {futureReadyData.fleet.map((item: any, idx: number) => (
                    <div key={idx} className="relative group/fleet bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      <button
                        type="button"
                        onClick={() => {
                          if (futureReadyData.fleet.length <= 1) return;
                          const next = futureReadyData.fleet.filter((_: any, i: number) => i !== idx);
                          handleDataChange('future-ready', 'fleet', next);
                        }}
                        className="absolute top-3 left-3 z-30 opacity-0 group-hover/fleet:opacity-100 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-lg transition"
                        title="Delete equipment"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="relative h-56 w-full bg-neutral-900 overflow-hidden">
                        <EditablePhoto
                          src={item.image}
                          alt={item.name}
                          onPick={() =>
                            onOpenMediaPicker((url) => {
                              const next = [...futureReadyData.fleet];
                              next[idx].image = url;
                              handleDataChange('future-ready', 'fleet', next);
                            })
                          }
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#3B82F6] font-bold block">
                            <EditableText
                              value={item.discipline}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].discipline = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                            />
                          </span>
                          <h3 className="text-base font-bold text-[#141212]">
                            <EditableText
                              value={item.name}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].name = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                            />
                          </h3>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            <EditableText
                              value={item.specs}
                              onChange={(val) => {
                                const next = [...futureReadyData.fleet];
                                next[idx].specs = val;
                                handleDataChange('future-ready', 'fleet', next);
                              }}
                              multiline
                              rows={2}
                            />
                          </p>
                        </div>

                        <EditableBulletList
                          bullets={item.bullets || []}
                          onChange={(items) => {
                            const next = [...futureReadyData.fleet];
                            next[idx].bullets = items;
                            handleDataChange('future-ready', 'fleet', next);
                          }}
                          color="red"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>"""

assert old_future_fleet in text, "old_future_fleet not found"
text = text.replace(old_future_fleet, new_future_fleet)

# ==========================================
# 6. FUTURE-READY: Workstation Specs Table
# ==========================================
old_future_table = """              {/* COMPUTING LAB TABLE */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-6">
                <div className="max-w-3xl space-y-2">
                  <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                    COMPUTATIONAL LAB ARCHITECTURE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Dual Xeon 64-Core Photogrammetry Engine
                  </h2>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/10 text-neutral-300 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-3 px-5">Hardware Subsystem</th>
                        <th className="py-3 px-5">Laboratory Specification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-neutral-300">
                      {futureReadyData.workstationSpecs.map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3 px-5 font-mono font-bold text-[#F4382D]">
                            <EditableText
                              value={row.component}
                              onChange={(val) => {
                                const next = [...futureReadyData.workstationSpecs];
                                next[idx].component = val;
                                handleDataChange('future-ready', 'workstationSpecs', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 text-white">
                            <EditableText
                              value={row.spec}
                              onChange={(val) => {
                                const next = [...futureReadyData.workstationSpecs];
                                next[idx].spec = val;
                                handleDataChange('future-ready', 'workstationSpecs', next);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>"""

new_future_table = """              {/* COMPUTING LAB TABLE */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      COMPUTATIONAL LAB ARCHITECTURE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Dual Xeon 64-Core Photogrammetry Engine
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...futureReadyData.workstationSpecs,
                        { component: 'New Hardware Subsystem', spec: 'Technical Specification' },
                      ];
                      handleDataChange('future-ready', 'workstationSpecs', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#3B82F6] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/10 text-neutral-300 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                      <tr>
                        <th className="py-3 px-5">Hardware Subsystem</th>
                        <th className="py-3 px-5">Laboratory Specification</th>
                        <th className="py-3 px-5 text-right w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-neutral-300">
                      {futureReadyData.workstationSpecs.map((row: any, idx: number) => (
                        <tr key={idx} className="group/row">
                          <td className="py-3 px-5 font-mono font-bold text-[#F4382D]">
                            <EditableText
                              value={row.component}
                              onChange={(val) => {
                                const next = [...futureReadyData.workstationSpecs];
                                next[idx].component = val;
                                handleDataChange('future-ready', 'workstationSpecs', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 text-white">
                            <EditableText
                              value={row.spec}
                              onChange={(val) => {
                                const next = [...futureReadyData.workstationSpecs];
                                next[idx].spec = val;
                                handleDataChange('future-ready', 'workstationSpecs', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (futureReadyData.workstationSpecs.length <= 1) return;
                                const next = futureReadyData.workstationSpecs.filter((_: any, i: number) => i !== idx);
                                handleDataChange('future-ready', 'workstationSpecs', next);
                              }}
                              className="opacity-0 group-hover/row:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>"""

assert old_future_table in text, "old_future_table not found"
text = text.replace(old_future_table, new_future_table)

# ==========================================
# 7. SAFETY: Stats
# ==========================================
old_safety_stats = """                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-800/80">
                    {safetyData.stats.map((s: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                        <span className="block text-2xl font-extrabold text-[#F4382D] font-mono">
                          <EditableText
                            value={s.value}
                            onChange={(val) => {
                              const next = [...safetyData.stats];
                              next[idx].value = val;
                              handleDataChange('safety', 'stats', next);
                            }}
                          />
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                          <EditableText
                            value={s.label}
                            onChange={(val) => {
                              const next = [...safetyData.stats];
                              next[idx].label = val;
                              handleDataChange('safety', 'stats', next);
                            }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>"""

new_safety_stats = """                  {/* DYNAMIC SAFETY METRICS */}
                  <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Safety Metrics</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...safetyData.stats, { value: 'New Metric', label: 'Safety Metric Label' }];
                          handleDataChange('safety', 'stats', next);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {safetyData.stats.map((s: any, idx: number) => (
                        <div key={idx} className="relative group/stat bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (safetyData.stats.length <= 1) return;
                              const next = safetyData.stats.filter((_: any, i: number) => i !== idx);
                              handleDataChange('safety', 'stats', next);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover/stat:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                            title="Remove metric"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="block text-2xl font-extrabold text-[#F4382D] font-mono">
                            <EditableText
                              value={s.value}
                              onChange={(val) => {
                                const next = [...safetyData.stats];
                                next[idx].value = val;
                                handleDataChange('safety', 'stats', next);
                              }}
                            />
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                            <EditableText
                              value={s.label}
                              onChange={(val) => {
                                const next = [...safetyData.stats];
                                next[idx].label = val;
                                handleDataChange('safety', 'stats', next);
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>"""

assert old_safety_stats in text, "old_safety_stats not found"
text = text.replace(old_safety_stats, new_safety_stats)

# ==========================================
# 8. SAFETY: Pillars
# ==========================================
old_safety_pillars = """              {/* PILLARS */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-8">
                <div className="max-w-3xl space-y-2">
                  <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                    SAFETY BY DESIGN
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                    Our Four Health, Safety &amp; Environment Pillars
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {safetyData.safetyPillars.map((p: any, idx: number) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                          <EditableText
                            value={p.category}
                            onChange={(val) => {
                              const next = [...safetyData.safetyPillars];
                              next[idx].category = val;
                              handleDataChange('safety', 'safetyPillars', next);
                            }}
                          />
                        </span>
                        <h3 className="text-lg font-bold text-[#141212]">
                          <EditableText
                            value={p.title}
                            onChange={(val) => {
                              const next = [...safetyData.safetyPillars];
                              next[idx].title = val;
                              handleDataChange('safety', 'safetyPillars', next);
                            }}
                          />
                        </h3>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        <EditableText
                          value={p.desc}
                          onChange={(val) => {
                            const next = [...safetyData.safetyPillars];
                            next[idx].desc = val;
                            handleDataChange('safety', 'safetyPillars', next);
                          }}
                          multiline
                          rows={3}
                        />
                      </p>

                      <EditableBulletList
                        bullets={p.bullets}
                        onChange={(items) => {
                          const next = [...safetyData.safetyPillars];
                          next[idx].bullets = items;
                          handleDataChange('safety', 'safetyPillars', next);
                        }}
                        color="red"
                      />
                    </div>
                  ))}
                </div>
              </section>"""

new_safety_pillars = """              {/* PILLARS */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      SAFETY BY DESIGN
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      Health, Safety &amp; Environment Pillars
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...safetyData.safetyPillars,
                        {
                          title: 'New HSE Safety Protocol',
                          category: 'Operational Risk Governance',
                          desc: 'Description of protocol standards, field execution safety gates, and statutory adherence.',
                          bullets: ['Mandatory compliance checklist item', 'Continuous risk monitoring protocol'],
                        },
                      ];
                      handleDataChange('safety', 'safetyPillars', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#F4382D] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Safety Pillar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {safetyData.safetyPillars.map((p: any, idx: number) => (
                    <div key={idx} className="relative group/pillar bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
                      <button
                        type="button"
                        onClick={() => {
                          if (safetyData.safetyPillars.length <= 1) return;
                          const next = safetyData.safetyPillars.filter((_: any, i: number) => i !== idx);
                          handleDataChange('safety', 'safetyPillars', next);
                        }}
                        className="absolute top-4 right-4 opacity-0 group-hover/pillar:opacity-100 text-neutral-400 hover:text-rose-500 p-1.5 transition"
                        title="Delete safety pillar"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                          <EditableText
                            value={p.category}
                            onChange={(val) => {
                              const next = [...safetyData.safetyPillars];
                              next[idx].category = val;
                              handleDataChange('safety', 'safetyPillars', next);
                            }}
                          />
                        </span>
                        <h3 className="text-lg font-bold text-[#141212]">
                          <EditableText
                            value={p.title}
                            onChange={(val) => {
                              const next = [...safetyData.safetyPillars];
                              next[idx].title = val;
                              handleDataChange('safety', 'safetyPillars', next);
                            }}
                          />
                        </h3>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        <EditableText
                          value={p.desc}
                          onChange={(val) => {
                            const next = [...safetyData.safetyPillars];
                            next[idx].desc = val;
                            handleDataChange('safety', 'safetyPillars', next);
                          }}
                          multiline
                          rows={3}
                        />
                      </p>

                      <EditableBulletList
                        bullets={p.bullets || []}
                        onChange={(items) => {
                          const next = [...safetyData.safetyPillars];
                          next[idx].bullets = items;
                          handleDataChange('safety', 'safetyPillars', next);
                        }}
                        color="red"
                      />
                    </div>
                  ))}
                </div>
              </section>"""

assert old_safety_pillars in text, "old_safety_pillars not found"
text = text.replace(old_safety_pillars, new_safety_pillars)

# ==========================================
# 9. STANDARDS: Stats
# ==========================================
old_standards_stats = """                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-800/80">
                    {standardsData.stats.map((s: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                        <span className="block text-2xl font-extrabold text-[#3B82F6] font-mono">
                          <EditableText
                            value={s.value}
                            onChange={(val) => {
                              const next = [...standardsData.stats];
                              next[idx].value = val;
                              handleDataChange('standards', 'stats', next);
                            }}
                          />
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                          <EditableText
                            value={s.label}
                            onChange={(val) => {
                              const next = [...standardsData.stats];
                              next[idx].label = val;
                              handleDataChange('standards', 'stats', next);
                            }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>"""

new_standards_stats = """                  {/* DYNAMIC STANDARDS METRICS */}
                  <div className="pt-6 border-t border-neutral-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Geodetic Standards Metrics</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...standardsData.stats, { value: 'New Standard', label: 'Compliance Level' }];
                          handleDataChange('standards', 'stats', next);
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={12} /> Add Metric
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {standardsData.stats.map((s: any, idx: number) => (
                        <div key={idx} className="relative group/stat bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (standardsData.stats.length <= 1) return;
                              const next = standardsData.stats.filter((_: any, i: number) => i !== idx);
                              handleDataChange('standards', 'stats', next);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover/stat:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition"
                            title="Remove metric"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="block text-2xl font-extrabold text-[#3B82F6] font-mono">
                            <EditableText
                              value={s.value}
                              onChange={(val) => {
                                const next = [...standardsData.stats];
                                next[idx].value = val;
                                handleDataChange('standards', 'stats', next);
                              }}
                            />
                          </span>
                          <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                            <EditableText
                              value={s.label}
                              onChange={(val) => {
                                const next = [...standardsData.stats];
                                next[idx].label = val;
                                handleDataChange('standards', 'stats', next);
                              }}
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>"""

assert old_standards_stats in text, "old_standards_stats not found"
text = text.replace(old_standards_stats, new_standards_stats)

# ==========================================
# 10. STANDARDS: Datum Parameters Table
# ==========================================
old_standards_table = """              {/* SOB DATUM TABLE */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-6">
                <div className="max-w-3xl space-y-2">
                  <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                    MATHEMATICAL RIGOR
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                    Official National Geodetic Baseline Parameters
                  </h2>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 text-neutral-700 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="py-3 px-5">Geodetic Parameter</th>
                        <th className="py-3 px-5">Survey of Bangladesh Reference Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {standardsData.datumParameters.map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3 px-5 font-mono font-bold text-[#F4382D]">
                            <EditableText
                              value={row.parameter}
                              onChange={(val) => {
                                const next = [...standardsData.datumParameters];
                                next[idx].parameter = val;
                                handleDataChange('standards', 'datumParameters', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 font-medium">
                            <EditableText
                              value={row.value}
                              onChange={(val) => {
                                const next = [...standardsData.datumParameters];
                                next[idx].value = val;
                                handleDataChange('standards', 'datumParameters', next);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>"""

new_standards_table = """              {/* SOB DATUM TABLE */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] border-b border-neutral-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#F4382D] font-bold block">
                      MATHEMATICAL RIGOR
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      Official National Geodetic Baseline Parameters
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...standardsData.datumParameters,
                        { parameter: 'New Parameter', value: 'Reference Datum Value' },
                      ];
                      handleDataChange('standards', 'datumParameters', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#F4382D] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Datum Parameter
                  </button>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 text-neutral-700 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-200">
                      <tr>
                        <th className="py-3 px-5">Geodetic Parameter</th>
                        <th className="py-3 px-5">Survey of Bangladesh Reference Value</th>
                        <th className="py-3 px-5 text-right w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {standardsData.datumParameters.map((row: any, idx: number) => (
                        <tr key={idx} className="group/row">
                          <td className="py-3 px-5 font-mono font-bold text-[#F4382D]">
                            <EditableText
                              value={row.parameter}
                              onChange={(val) => {
                                const next = [...standardsData.datumParameters];
                                next[idx].parameter = val;
                                handleDataChange('standards', 'datumParameters', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 font-medium">
                            <EditableText
                              value={row.value}
                              onChange={(val) => {
                                const next = [...standardsData.datumParameters];
                                next[idx].value = val;
                                handleDataChange('standards', 'datumParameters', next);
                              }}
                            />
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (standardsData.datumParameters.length <= 1) return;
                                const next = standardsData.datumParameters.filter((_: any, i: number) => i !== idx);
                                handleDataChange('standards', 'datumParameters', next);
                              }}
                              className="opacity-0 group-hover/row:opacity-100 text-neutral-400 hover:text-rose-500 p-1 transition"
                              title="Delete parameter"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>"""

assert old_standards_table in text, "old_standards_table not found"
text = text.replace(old_standards_table, new_standards_table)

# ==========================================
# 11. STANDARDS: QA Gates
# ==========================================
old_standards_gates = """              {/* 3 QA GATES */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-6">
                <div className="max-w-3xl space-y-2">
                  <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                    QUALITY ASSURANCE ARCHITECTURE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Three-Gate Verification Protocol
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {standardsData.qaGates.map((g: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#F4382D] font-bold block">
                          STAGE 0{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-white">
                          <EditableText
                            value={g.gate}
                            onChange={(val) => {
                              const next = [...standardsData.qaGates];
                              next[idx].gate = val;
                              handleDataChange('standards', 'qaGates', next);
                            }}
                          />
                        </h3>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          <EditableText
                            value={g.desc}
                            onChange={(val) => {
                              const next = [...standardsData.qaGates];
                              next[idx].desc = val;
                              handleDataChange('standards', 'qaGates', next);
                            }}
                            multiline
                            rows={3}
                          />
                        </p>
                      </div>

                      <EditableBulletList
                        bullets={g.bullets}
                        onChange={(items) => {
                          const next = [...standardsData.qaGates];
                          next[idx].bullets = items;
                          handleDataChange('standards', 'qaGates', next);
                        }}
                        color="blue"
                      />
                    </div>
                  ))}
                </div>
              </section>"""

new_standards_gates = """              {/* QA GATES */}
              <section className="py-16 px-6 md:px-12 bg-[#141212] text-white space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      QUALITY ASSURANCE ARCHITECTURE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Verification Gates Protocol
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...standardsData.qaGates,
                        {
                          gate: `Gate 0${standardsData.qaGates.length + 1}: Technical Peer Verification`,
                          desc: 'Description of the verification gate, cross-examination tolerance checks, and deliverables verification.',
                          bullets: ['Statutory validation checklist', 'Signed engineering sign-off stamp'],
                        },
                      ];
                      handleDataChange('standards', 'qaGates', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#3B82F6] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add QA Gate
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standardsData.qaGates.map((g: any, idx: number) => (
                    <div key={idx} className="relative group/gate bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (standardsData.qaGates.length <= 1) return;
                          const next = standardsData.qaGates.filter((_: any, i: number) => i !== idx);
                          handleDataChange('standards', 'qaGates', next);
                        }}
                        className="absolute top-3 right-3 opacity-0 group-hover/gate:opacity-100 text-neutral-400 hover:text-rose-400 p-1.5 transition"
                        title="Delete QA Gate"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#F4382D] font-bold block">
                          STAGE 0{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-white">
                          <EditableText
                            value={g.gate}
                            onChange={(val) => {
                              const next = [...standardsData.qaGates];
                              next[idx].gate = val;
                              handleDataChange('standards', 'qaGates', next);
                            }}
                          />
                        </h3>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          <EditableText
                            value={g.desc}
                            onChange={(val) => {
                              const next = [...standardsData.qaGates];
                              next[idx].desc = val;
                              handleDataChange('standards', 'qaGates', next);
                            }}
                            multiline
                            rows={3}
                          />
                        </p>
                      </div>

                      <EditableBulletList
                        bullets={g.bullets || []}
                        onChange={(items) => {
                          const next = [...standardsData.qaGates];
                          next[idx].bullets = items;
                          handleDataChange('standards', 'qaGates', next);
                        }}
                        color="blue"
                      />
                    </div>
                  ))}
                </div>
              </section>"""

assert old_standards_gates in text, "old_standards_gates not found"
text = text.replace(old_standards_gates, new_standards_gates)

# ==========================================
# 12. IMPACT: Projects
# ==========================================
old_impact_projects = """              {/* PROJECT CARDS (420PX, WHITE TITLES ON PHOTO) */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {impactData.projects.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-neutral-200 rounded-2xl bg-white flex flex-col overflow-hidden shadow-sm"
                    >"""

new_impact_projects = """              {/* PROJECT CARDS (420PX, WHITE TITLES ON PHOTO) */}
              <section className="py-16 px-6 md:px-12 bg-[#FAFAFA] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] font-bold block">
                      FEATURED SHOWCASE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141212]">
                      Landmark Infrastructure Projects
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...impactData.projects,
                        {
                          id: `proj-${Date.now()}`,
                          title: 'New Infrastructure Landmark Project',
                          client: 'Government / Private Authority',
                          category: 'Topographic & Engineering Survey',
                          location: 'Dhaka, Bangladesh',
                          description: 'Comprehensive geodetic baseline survey, UAV drone mapping, and construction-grade engineering deliverables.',
                          imageUrl: '/real-media/hero-corridor-infrastructure.jpg',
                        },
                      ];
                      handleDataChange('impact', 'projects', next);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#3B82F6] text-white text-xs font-bold font-mono flex items-center gap-1.5 transition shrink-0 shadow"
                  >
                    <Plus size={14} /> Add Project Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {impactData.projects.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative group/proj border border-neutral-200 rounded-2xl bg-white flex flex-col overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (impactData.projects.length <= 1) return;
                          const next = impactData.projects.filter((_: any, i: number) => i !== idx);
                          handleDataChange('impact', 'projects', next);
                        }}
                        className="absolute top-3 right-3 z-30 opacity-0 group-hover/proj:opacity-100 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-lg transition"
                        title="Delete project card"
                      >
                        <Trash2 size={13} />
                      </button>"""

assert old_impact_projects in text, "old_impact_projects not found"
text = text.replace(old_impact_projects, new_impact_projects)

with open('apps/admin/src/components/AboutWysiwygEditor.tsx', 'w') as f:
    f.write(text)

print("All 12 collections and sections patched successfully with Add/Remove buttons!")
