import React, { memo } from 'react'
import { ArrowUpRight, HelpCircle, ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL } from '../../config/chain'

interface FinalCTAProps {
  onEnterApp: () => void
}

export const FinalCTA: React.FC<FinalCTAProps> = memo(({ onEnterApp }) => {
  return (
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 overflow-hidden border-t border-white/[0.06]">
      {/* Ambient Radial Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="glow-ambient -bottom-20 left-1/2 -translate-x-1/2 w-[550px] h-[280px] bg-emerald-600/[0.06]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono tracking-widest text-emerald-400 uppercase mb-8">
          <span>Start Benchmarking</span>
        </div>

        {/* Editorial Headline */}
        <h2 className="font-serif italic font-normal text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.08] mb-6 sm:mb-8 text-balance">
          Ready to see where your agreement breaks?
        </h2>

        {/* Barlow Subtext */}
        <p className="font-sans text-base sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10 sm:mb-12 font-normal">
          Draft natural-language clauses, test adversarial edge cases with live GenLayer validators, and inspect canary-calibrated rulings on Studionet.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-base rounded-full shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch Studio App</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-950" />
          </button>

          <a
            href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 liquid-glass-card text-zinc-300 hover:text-white font-medium text-base rounded-full transition-all cursor-pointer"
          >
            <span>Contract Explorer</span>
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </a>
        </div>

        {/* Studionet Gas & Funding Guidance Note */}
        <div className="w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 text-left text-xs text-zinc-400 space-y-1.5 backdrop-blur-md">
          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Studionet Gas &amp; Testing Information</span>
          </div>
          <p className="leading-relaxed">
            Browsing specifications and inspecting verified rulings is free and requires zero GEN. State-changing transactions consume nominal studionet gas. Accounts in GenLayer Studio come pre-funded for testing; if your external wallet shows 0 GEN, check Studio's Accounts panel for test accounts and faucet options (the standalone public faucet targets Asimov/Bradbury, not studionet).
          </p>
        </div>
      </div>
    </section>
  )
})
