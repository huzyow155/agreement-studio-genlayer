import React, { memo } from 'react'
import { ArrowUpRight, HelpCircle, ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL } from '../../config/chain'
import { useScrollReveal } from '../../hooks/useScrollReveal'

interface FinalCTAProps {
  onEnterApp: () => void
}

export const FinalCTA: React.FC<FinalCTAProps> = memo(({ onEnterApp }) => {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="relative py-28 sm:py-36 px-4 sm:px-6 overflow-hidden border-t border-[var(--border-subtle)]">
      {/* Ambient Atmospheric Light (Restrained Champagne & Sage) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="atmosphere-field-1 absolute -bottom-24 left-1/2 -translate-x-1/2 w-[580px] h-[300px] rounded-[100%] bg-[var(--accent-champagne)]/12 blur-[100px]" />
        <div className="atmosphere-field-2 absolute -bottom-10 left-1/3 w-[360px] h-[220px] rounded-[100%] bg-[var(--accent-sage)]/10 blur-[90px]" />
      </div>

      <div
        ref={ref}
        className={`relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center reveal-init ${
          isVisible ? 'reveal-visible' : ''
        }`}
      >
        {/* Luxury Pill Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full luxury-pill text-xs font-mono tracking-widest text-[var(--text-secondary)] uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-champagne)] animate-pulse" />
          <span>Start Benchmarking</span>
        </div>

        {/* Editorial Headline */}
        <h2 className="font-serif italic font-normal text-4xl sm:text-6xl md:text-7xl text-[var(--text-primary)] tracking-tight leading-[1.08] mb-6 sm:mb-8 text-balance">
          Ready to see where your agreement breaks?
        </h2>

        {/* Barlow Subtext */}
        <p className="font-sans text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-10 sm:mb-12 font-normal">
          Draft natural-language clauses, test adversarial edge cases with live GenLayer validators, and inspect canary-calibrated rulings on Studionet.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-[#111311] text-white hover:bg-black dark:bg-[#F5F7F3] dark:text-[#080A09] dark:hover:bg-white font-medium text-base rounded-full btn-luxury-cta cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch Studio App</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <a
            href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 luxury-glass text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-champagne-border)] rounded-full transition-all duration-200 cursor-pointer"
          >
            <span>Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </a>
        </div>

        {/* Studionet Gas & Funding Guidance Note */}
        <div className="w-full max-w-xl luxury-card rounded-2xl p-4 sm:p-5 text-left text-xs text-[var(--text-secondary)] space-y-1.5">
          <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-champagne)]" />
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

