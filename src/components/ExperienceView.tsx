import React from 'react';
import { Film, Volume2, Eye, Sparkles, ArrowLeft } from 'lucide-react';

export function ExperienceView({ onExploreMovies }: { onExploreMovies: () => void }) {
  const formats = [
    {
      title: 'IMAX with Laser 4K',
      tagline: 'Immersion beyond cinema borders.',
      icon: Eye,
      description:
        'Next-generation 4K dual-laser projection system delivers razor-sharp resolution, pristine brightness, and deeper contrast. Paired with custom 12-channel immersive acoustic tuning.',
      specs: ['1.43:1 / 1.90:1 expanded aspect ratio', 'Dual 4K RGB laser engines', '12-channel sound matrix'],
    },
    {
      title: 'Dolby Cinema & Atmos',
      tagline: 'Spectacular vision and moving audio.',
      icon: Volume2,
      description:
        'Dolby Vision high dynamic range delivers 1,000,000:1 contrast with ultra-deep blacks. Dolby Atmos moves individual sound objects around you in three-dimensional space.',
      specs: ['Dolby Vision HDR technology', '128 simultaneous sound objects', 'Sub-bass transducer seating'],
    },
    {
      title: '4DX Synchronized Motion',
      tagline: 'Feel every turn, explosion, and storm.',
      icon: Sparkles,
      description:
        'Multi-axis heave, pitch, and roll motion seats synchronized directly to the director cut, supplemented by atmospheric environmental effects including wind, fog, lightning, and scents.',
      specs: ['20+ environmental sensory effects', 'Dynamic multi-axis heave seats', 'Intense cinematic immersion'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      <button
        onClick={onExploreMovies}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold mb-5 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Movies</span>
      </button>

      <div className="max-w-2xl mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          State-of-the-Art Cinema Experiences
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          IMovies partners with certified premium large format exhibitors to deliver benchmark audio-visual presentation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          return (
            <div
              key={fmt.title}
              className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-amber-500/40 transition-colors"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">{fmt.title}</h3>
                <p className="text-xs text-amber-300 font-medium mt-0.5">{fmt.tagline}</p>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{fmt.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1.5">
                  {fmt.specs.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/20 rounded-3xl text-center">
        <h2 className="text-xl font-bold text-white font-display mb-2">
          Ready to experience the cinema?
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto mb-5">
          Select showtimes in premium formats with instant seat locking and digital ticket passes.
        </p>
        <button
          onClick={onExploreMovies}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all inline-block"
        >
          Browse Showing Movies
        </button>
      </div>
    </div>
  );
}
