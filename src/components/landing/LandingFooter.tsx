import React from 'react'
import { ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL } from '../../config/chain'

interface LandingFooterProps {
  onEnterApp: () => void
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onEnterApp }) => {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#09090b] py-12 sm:py-16 text-xs sm:text-sm text-zinc-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Purpose */}
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.08] border border-white/20 flex items-center justify-center text-white font-bold text-xs">
              AS
            </div>
            <span className="font-semibold text-white tracking-tight text-base">
              Agreement Studio
            </span>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Pre-signing contractual ambiguity benchmark and canary-calibrated dispute adjudication on GenLayer Studionet.
          </p>
          <div className="text-[11px] text-zinc-400">
            Network: GenLayer Studionet &bull; Chain ID 61999 &bull; MIT License
          </div>
        </div>

        {/* Links Column */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm">
          <button
            onClick={onEnterApp}
            className="hover:text-white transition-colors cursor-pointer text-left"
          >
            Launch App
          </button>

          <a
            href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Contract Explorer</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>

          <a
            href="https://github.com/huzyow155/agreement-studio-genlayer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>

          <a
            href="https://github.com/huzyow155/clauselab-genlayer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Smart Contract (ClauseLab)</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
        <span>&copy; 2026 huzyow155. Released under the MIT License.</span>
        <span>Built for GenLayer Studionet</span>
      </div>
    </footer>
  )
}
