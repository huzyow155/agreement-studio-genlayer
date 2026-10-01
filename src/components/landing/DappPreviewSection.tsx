import React, { memo } from 'react'
import { ArrowUpRight, CheckCircle2, Lock, Terminal } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL, DEFAULT_SPEC_ID } from '../../config/chain'
import type { SpecRecord, RulingRecord } from '../../types/contract'
import { useScrollReveal } from '../../hooks/useScrollReveal'

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
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 })

  return (
    <section
      id="preview"
      ref={ref}
      className={`relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[var(--border-subtle)] transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 relative z-10">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Interactive Workbench
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-tight leading-tight mb-6">
          The agreement verification terminal.
        </h2>
        <div className="w-16 h-px bg-[#D8C9A7] mx-auto mb-6" />
        <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed font-normal">
          A dedicated pre-signing and dispute adjudication environment connected directly to GenLayer Studionet.
        </p>
      </div>

      {/* Luxury Terminal / Workbench Presentation (Obsidian Dark / Warm Ivory Light) */}
      <div className="relative z-10 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface)] shadow-xl transition-all">
        {/* Terminal Top Window Bar */}
        <div className="bg-[var(--surface-elevated)] px-4 sm:px-6 py-3.5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#111311]/20 dark:bg-[#F5F7F3]/20 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#111311]/20 dark:bg-[#F5F7F3]/20 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#D8C9A7] inline-block" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-[var(--surface)] px-2.5 sm:px-4 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[10px] sm:text-xs font-mono text-[var(--text-secondary)] max-w-[190px] xs:max-w-[240px] sm:max-w-sm truncate shadow-xs">
            <Terminal className="w-3.5 h-3.5 text-[#D8C9A7] shrink-0" />
            <span className="text-[var(--text-muted)] truncate hidden xs:inline">studionet.genlayer.com/app/spec/</span>
            <span className="text-[var(--text-muted)] xs:hidden">spec/</span>
            <span className="text-[var(--text-primary)] font-semibold shrink-0">{liveSpec?.spec_id || DEFAULT_SPEC_ID}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">Chain ID 61999</span>
          </div>
        </div>

        {/* Inner Preview Content Displaying Real On-Chain Fields */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Header Mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#9EAA9B] flex items-center gap-2 mb-1">
                <Lock className="w-3.5 h-3.5 text-[#D8C9A7]" />
                <span>Agreement Status: Locked &amp; Calibrated</span>
              </div>
              <h3 className="text-2xl font-serif text-[var(--text-primary)]">
                {liveSpec?.title || 'Software Delivery Agreement'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg shadow-xs">
                Spec Digest: {liveSpec?.spec_hash ? `${liveSpec.spec_hash.slice(0, 10)}...${liveSpec.spec_hash.slice(-6)}` : 'ca1a92e7a8...5571c'}
              </span>
            </div>
          </div>

          {/* Natural Language Clause Box */}
          <div className="p-5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-2">
            <div className="text-[11px] font-mono uppercase text-[var(--text-muted)] flex items-center justify-between">
              <span>Locked Clause Text</span>
              <span className="text-[#9EAA9B] font-sans">Validated Equivalence</span>
            </div>
            <p className="font-serif italic text-lg sm:text-xl text-[var(--text-primary)] leading-relaxed">
              &ldquo;{liveSpec?.clause || 'The contractor shall deliver the repository with pure ASCII code and passing tests within 7 calendar days of contract creation.'}&rdquo;
            </p>
          </div>

          {/* Grid: Scenarios + Verified On-Chain Ruling */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenarios Overview */}
            <div className="p-5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-xs font-mono uppercase text-[var(--text-muted)]">Adversarial Scenarios</span>
                <span className="text-xs font-mono text-[#9EAA9B] font-semibold">4 / 4 Green (0 Red)</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Scenario #0 (Baseline prompt delivery)</span>
                  <span className="font-semibold text-[var(--text-primary)]">PASS &bull; DELIVERED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Scenario #1 (Delivery after deadline)</span>
                  <span className="font-semibold text-[var(--text-primary)]">PASS &bull; BREACH</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Scenario #2 (Minor bug delivered on time)</span>
                  <span className="font-semibold text-[var(--text-primary)]">PASS &bull; DELIVERED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Scenario #3 (Incomplete feature delivery)</span>
                  <span className="font-semibold text-[var(--text-primary)]">PASS &bull; BREACH</span>
                </div>
              </div>
            </div>

            {/* Adjudication Ruling Mockup */}
            <div className="p-5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-3">
                  <span className="text-xs font-mono uppercase text-[var(--text-muted)]">Adjudicated Ruling</span>
                  <span className="text-xs font-mono text-[#9EAA9B] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Canary PASS (1)</span>
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] text-center space-y-1">
                  <div className="text-[11px] font-mono uppercase text-[#D8C9A7]">Consensus Verdict</div>
                  <div className="text-3xl font-mono font-bold text-[var(--text-primary)] tracking-wider">
                    {liveRuling?.verdict || 'DELIVERED'}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-[var(--text-muted)] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Facts Stipulation ID:</span>
                  <span className="text-[var(--text-secondary)]">f1830b46947f</span>
                </div>
                <div className="flex justify-between">
                  <span>Consensus Status:</span>
                  <span className="text-[var(--text-primary)] font-medium">ACCEPTED by Validators</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Overlay */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-muted)]">
              Contract Address:{' '}
              <a
                href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2 font-mono"
              >
                {CONTRACT_ADDRESS}
              </a>
            </span>

            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#111311] text-[#F5F7F3] dark:bg-[#F5F7F3] dark:text-[#111311] hover:opacity-90 font-semibold text-sm rounded-full shadow-md transition-all cursor-pointer"
            >
              <span>Launch Full Studio App</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})
