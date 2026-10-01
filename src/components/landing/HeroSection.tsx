import React, { memo } from 'react'
import { ArrowUpRight, ArrowDown, ExternalLink, CheckCircle2 } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL, DEFAULT_SPEC_ID } from '../../config/chain'
import type { SpecRecord, RulingRecord } from '../../types/contract'

interface HeroSectionProps {
  onEnterApp: () => void
  liveSpec: SpecRecord | null
  liveRuling: RulingRecord | null
  loadingTeaser: boolean
}

export const HeroSection: React.FC<HeroSectionProps> = memo(({
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
      className="relative min-h-[88vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-16 sm:pt-24 pb-20 overflow-hidden light-sweep-container"
    >
      {/* Edge Fades blending with theme canvas */}
      <div className="edge-fade-top" aria-hidden="true" />
      <div className="edge-fade-bottom" aria-hidden="true" />

      {/* Atmospheric Light Fields (Champagne & Muted Sage) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft champagne light field */}
        <div className="atmosphere-field-1 absolute -top-[12%] left-[15%] w-[420px] sm:w-[620px] h-[420px] sm:h-[620px] rounded-full bg-[#D8C9A7]/14 dark:bg-[#D8C9A7]/09 blur-[100px]" />
        {/* Subtle sage light field */}
        <div className="atmosphere-field-2 absolute top-[30%] -right-[10%] w-[380px] sm:w-[560px] h-[380px] sm:h-[560px] rounded-full bg-[#9EAA9B]/12 dark:bg-[#9EAA9B]/07 blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full luxury-pill text-[10px] sm:text-xs font-mono tracking-wider sm:tracking-widest text-[var(--text-secondary)] uppercase mb-8 max-w-[94vw]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8C9A7] animate-pulse shrink-0" />
          <span className="truncate">Agreement Studio &bull; Ambiguity Benchmark</span>
        </div>

        {/* Editorial Headline */}
        <h1 className="font-serif italic font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[var(--text-primary)] max-w-4xl leading-[1.05] mb-6 sm:mb-8 text-balance">
          Trust through Verifiable Consensus.
        </h1>

        {/* Barlow Subtext */}
        <p className="font-sans text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-10 sm:mb-12 font-normal text-pretty">
          Benchmark natural-language clauses against adversarial edge cases with multi-validator LLM consensus.
          Lock calibrated agreements that safely abstain with <span className="font-mono text-[var(--text-primary)] px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--surface-elevated)] text-xs">UNRELIABLE</span> rather than guessing when uncertain.
        </p>

        {/* Luxury CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16 sm:mb-20">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#111311] text-[#F5F7F3] dark:bg-[#F5F7F3] dark:text-[#111311] hover:opacity-90 font-semibold text-base rounded-full btn-luxury-cta cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch App</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <a
            href="#story"
            onClick={handleScrollToStory}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 luxury-glass text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-base rounded-full transition-all cursor-pointer group"
          >
            <span>Explore Protocol</span>
            <ArrowDown className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Hero Glass Card (Live Studionet Teaser) */}
        <div className="w-full max-w-2xl luxury-glass rounded-2xl p-5 sm:p-6 text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  loadingTeaser ? 'bg-[#D8C9A7] animate-ping' : 'bg-[#9EAA9B]'
                }`}
              />
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--text-primary)]">
                {loadingTeaser ? 'Querying Studionet RPC...' : 'Live On Studionet • Calibrated Agreement State'}
              </span>
            </div>
            <a
              href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
            >
              Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] space-y-1">
              <div className="text-[var(--text-muted)] uppercase text-[10px]">Spec ID</div>
              <div className="text-[var(--text-primary)] font-semibold truncate">{liveSpec?.spec_id || DEFAULT_SPEC_ID}</div>
            </div>
            <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] space-y-1">
              <div className="text-[var(--text-muted)] uppercase text-[10px]">Scenarios</div>
              <div className="text-[var(--text-primary)] font-semibold">
                {liveSpec ? `${liveSpec.n_scenarios} Green (0 Red)` : '4 Green'}
              </div>
            </div>
            <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] space-y-1">
              <div className="text-[var(--text-muted)] uppercase text-[10px]">Verdict</div>
              <div className="text-[var(--text-primary)] font-semibold font-mono">{liveRuling?.verdict || 'DELIVERED'}</div>
            </div>
            <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] space-y-1">
              <div className="text-[var(--text-muted)] uppercase text-[10px]">In-Band Canary</div>
              <div className="text-[var(--text-primary)] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#9EAA9B]" />
                <span>{liveRuling ? (liveRuling.canary_pass ? 'PASS (1)' : 'FAIL (0)') : 'PASS (1)'}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[var(--text-muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
            <span>Intelligent Contract deployed on GenLayer Studionet (Chain ID 61999)</span>
            <button
              onClick={onEnterApp}
              className="text-[var(--text-primary)] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              Open in interactive workbench &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})
