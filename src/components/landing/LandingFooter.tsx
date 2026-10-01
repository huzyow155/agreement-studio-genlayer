import React, { memo } from 'react'
import { ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL } from '../../config/chain'

interface LandingFooterProps {
  onEnterApp: () => void
}

export const LandingFooter: React.FC<LandingFooterProps> = memo(({ onEnterApp }) => {
  return (
    <footer className="relative border-t border-[var(--border-color)] bg-[var(--surface)] py-12 sm:py-16 text-xs sm:text-sm text-[var(--text-secondary)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Purpose */}
        <div className="space-y-2.5 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] font-bold text-xs tracking-wider font-mono">
              AS
            </div>
            <span className="font-semibold text-[var(--text-primary)] tracking-tight text-base font-sans">
              Agreement Studio
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-sans">
            Pre-signing contractual ambiguity benchmark and canary-calibrated dispute adjudication on GenLayer Studionet.
          </p>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            Network: GenLayer Studionet &bull; Chain ID 61999 &bull; MIT License
          </div>
        </div>

        {/* Links Column */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm font-sans">
          <button
            onClick={onEnterApp}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer text-left"
          >
            Launch App
          </button>

          <a
            href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <span>Contract Explorer</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
          </a>

          <a
            href="https://github.com/huzyow155/agreement-studio-genlayer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
          </a>

          <a
            href="https://github.com/huzyow155/clauselab-genlayer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <span>Smart Contract (ClauseLab)</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
        <span>&copy; 2026 huzyow155. Released under the MIT License.</span>
        <span>Built for GenLayer Studionet</span>
      </div>
    </footer>
  )
})

