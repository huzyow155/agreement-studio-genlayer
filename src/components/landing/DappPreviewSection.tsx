import React, { memo } from 'react'
import { ArrowUpRight, CheckCircle2, Lock, Terminal } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL, DEFAULT_SPEC_ID } from '../../config/chain'
import type { SpecRecord, RulingRecord } from '../../types/contract'

interface DappPreviewSectionProps {
  onEnterApp: () => void
  liveSpec: SpecRecord | null
  liveRuling: RulingRecord | null
}

export const DappPreviewSection: React.FC<DappPreviewSectionProps> = memo(({
  onEnterApp,
  liveSpec,
  liveRuling,
}) => {
  return (
    <section id="preview" className="relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
      {/* Background Soft Glow */}
      <div className="glow-ambient top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-emerald-600/[0.04]" />

      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 relative z-10">
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
          Interactive Workbench
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight mb-6">
          The agreement verification terminal.
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed font-normal">
          A dedicated pre-signing and dispute adjudication environment connected directly to GenLayer Studionet.
        </p>
      </div>

      {/* Simulated Premium Browser / App Window Frame */}
      <div className="relative z-10 rounded-2xl overflow-hidden border border-white/15 bg-[#121216] shadow-2xl shadow-black/80">
        {/* Browser Top Window Bar */}
        <div className="bg-[#18181f] px-4 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#10b981]/80 inline-block" />
          </div>

          <div className="flex items-center gap-2 bg-[#09090b]/80 px-4 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-zinc-400 max-w-sm truncate">
            <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-zinc-300">studionet.genlayer.com/app/spec/</span>
            <span className="text-emerald-400 font-semibold">{liveSpec?.spec_id || DEFAULT_SPEC_ID}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">Chain ID 61999</span>
          </div>
        </div>

        {/* Inner Preview Content Displaying Real On-Chain Fields */}
        <div className="p-6 sm:p-10 space-y-8 bg-gradient-to-b from-[#121216] to-[#0c0c0e]">
          {/* Header Mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Agreement Status: Locked &amp; Calibrated</span>
              </div>
              <h3 className="text-2xl font-serif text-white">
                {liveSpec?.title || 'Software Delivery Agreement'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-white/[0.05] border border-white/10 text-zinc-300 px-3 py-1.5 rounded-lg">
                Spec Digest: {liveSpec?.spec_hash ? `${liveSpec.spec_hash.slice(0, 10)}...${liveSpec.spec_hash.slice(-6)}` : 'ca1a92e7a8...5571c'}
              </span>
            </div>
          </div>

          {/* Natural Language Clause Box */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="text-[11px] font-mono uppercase text-zinc-400 flex items-center justify-between">
              <span>Locked Clause Text</span>
              <span className="text-emerald-400">Validated Equivalence</span>
            </div>
            <p className="font-serif italic text-lg sm:text-xl text-zinc-200 leading-relaxed">
              &ldquo;{liveSpec?.clause || 'The contractor shall deliver a satisfactory software package promptly.'}&rdquo;
            </p>
          </div>

          {/* Grid: Scenarios + Verified On-Chain Ruling */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenarios Overview */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-mono uppercase text-zinc-400">Adversarial Scenarios</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">4 / 4 Green (0 Red)</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                  <span>Scenario #0 (Baseline prompt delivery)</span>
                  <span className="font-bold">PASS &bull; DELIVERED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                  <span>Scenario #1 (Delivery after deadline)</span>
                  <span className="font-bold">PASS &bull; BREACH</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                  <span>Scenario #2 (Minor bug delivered on time)</span>
                  <span className="font-bold">PASS &bull; DELIVERED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                  <span>Scenario #3 (Incomplete feature delivery)</span>
                  <span className="font-bold">PASS &bull; BREACH</span>
                </div>
              </div>
            </div>

            {/* Adjudication Ruling Mockup */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <span className="text-xs font-mono uppercase text-zinc-400">Adjudicated Ruling</span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Canary PASS (1)</span>
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1">
                  <div className="text-[11px] font-mono uppercase text-emerald-400">Consensus Verdict</div>
                  <div className="text-3xl font-mono font-bold text-white tracking-wider">
                    {liveRuling?.verdict || 'DELIVERED'}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-zinc-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Facts Stipulation ID:</span>
                  <span className="text-zinc-300">f1830b46947f</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Consensus Status:</span>
                  <span className="text-emerald-400">ACCEPTED by Validators</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Overlay */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <span className="text-xs text-zinc-400">
              Contract Address:{' '}
              <a
                href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-white underline underline-offset-2 font-mono"
              >
                {CONTRACT_ADDRESS}
              </a>
            </span>

            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-sm rounded-full shadow-lg transition-all cursor-pointer"
            >
              <span>Launch Full Studio App</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-950" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})
