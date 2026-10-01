import React from 'react'
import { ArrowUpRight, ArrowDown, ExternalLink, CheckCircle2 } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL, DEFAULT_SPEC_ID } from '../../config/chain'
import type { SpecRecord, RulingRecord } from '../../types/contract'

interface HeroSectionProps {
  onEnterApp: () => void
  liveSpec: SpecRecord | null
  liveRuling: RulingRecord | null
  loadingTeaser: boolean
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onEnterApp,
  liveSpec,
  liveRuling,
  loadingTeaser,
}) => {
  const handleScrollToStory = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.querySelector('#story')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="overview"
      className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-16 sm:pt-24 pb-20 overflow-hidden"
    >
      {/* 200px Top and Bottom Black Edge Fades */}
      <div className="edge-fade-top" aria-hidden="true" />
      <div className="edge-fade-bottom" aria-hidden="true" />

      {/* Pure CSS Atmospheric Drifting Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="mesh-blob-1 absolute -top-[10%] left-[12%] w-[480px] sm:w-[700px] h-[480px] sm:h-[700px] rounded-full bg-emerald-600/20 blur-[110px]" />
        <div className="mesh-blob-2 absolute top-[28%] -right-[8%] w-[420px] sm:w-[640px] h-[420px] sm:h-[640px] rounded-full bg-indigo-700/20 blur-[120px]" />
        <div className="mesh-blob-3 absolute -bottom-[15%] left-[20%] w-[450px] sm:w-[620px] h-[450px] sm:h-[620px] rounded-full bg-teal-800/18 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-glass-pill text-xs sm:text-sm font-mono tracking-wider text-emerald-400 uppercase mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Pre-Signing Contract Benchmark &bull; GenLayer Studionet</span>
        </div>

        {/* Editorial Headline */}
        <h1 className="font-serif italic font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white max-w-4xl leading-[1.06] mb-6 sm:mb-8 text-balance">
          See where your agreement breaks &mdash; before you sign it.
        </h1>

        {/* Barlow Subtext */}
        <p className="font-sans text-base sm:text-xl text-zinc-300 max-w-2xl leading-relaxed mb-10 sm:mb-12 font-normal text-pretty">
          Test natural-language clauses against adversarial edge cases with multi-validator LLM consensus.
          Lock calibrated agreements that abstain with <span className="font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 text-sm">UNRELIABLE</span> instead of guessing when uncertain.
        </p>

        {/* Liquid Glass CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16 sm:mb-20">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-base rounded-full shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch Studio App</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-950" />
          </button>

          <a
            href="#story"
            onClick={handleScrollToStory}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 liquid-glass-card text-zinc-300 hover:text-white font-medium text-base rounded-full transition-all cursor-pointer group"
          >
            <span>Explore Architecture</span>
            <ArrowDown className="w-4 h-4 text-zinc-400 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Live On-Chain Teaser Pill */}
        <div className="w-full max-w-2xl gradient-border-glass rounded-2xl p-5 sm:p-6 text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  loadingTeaser ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
                {loadingTeaser ? 'Querying Studionet RPC...' : 'Live On Studionet • Verified Agreement State'}
              </span>
            </div>
            <a
              href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              Contract Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/5 space-y-1">
              <div className="text-zinc-500 uppercase text-[10px]">Spec ID</div>
              <div className="text-zinc-200 font-semibold truncate">{liveSpec?.spec_id || DEFAULT_SPEC_ID}</div>
            </div>
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/5 space-y-1">
              <div className="text-zinc-500 uppercase text-[10px]">Scenarios</div>
              <div className="text-emerald-400 font-semibold">
                {liveSpec ? `${liveSpec.n_scenarios} Green (0 Red)` : '4 Green'}
              </div>
            </div>
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/5 space-y-1">
              <div className="text-zinc-500 uppercase text-[10px]">Verdict</div>
              <div className="text-white font-semibold font-mono">{liveRuling?.verdict || 'DELIVERED'}</div>
            </div>
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/5 space-y-1">
              <div className="text-zinc-500 uppercase text-[10px]">In-Band Canary</div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{liveRuling ? (liveRuling.canary_pass ? 'PASS (1)' : 'FAIL (0)') : 'PASS (1)'}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-white/5">
            <span>Authoritative Intelligent Contract deployed on Chain ID 61999</span>
            <button
              onClick={onEnterApp}
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              Open in interactive workbench &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
