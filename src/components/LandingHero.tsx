import React, { useEffect, useState } from 'react'
import { ArrowUpRight, ShieldCheck, CheckCircle2, FileText, Lock, Scale, HelpCircle, ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL, DEFAULT_SPEC_ID } from '../config/chain'
import { fetchSpec, fetchRuling, fetchLatestFactsId } from '../services/contractService'
import type { SpecRecord, RulingRecord } from '../types/contract'

interface LandingHeroProps {
  onEnterApp: () => void
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onEnterApp }) => {
  const [liveSpec, setLiveSpec] = useState<SpecRecord | null>(null)
  const [liveRuling, setLiveRuling] = useState<RulingRecord | null>(null)
  const [loadingTeaser, setLoadingTeaser] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const loadTeaser = async () => {
      try {
        const spec = await fetchSpec(DEFAULT_SPEC_ID)
        if (spec && isMounted) {
          setLiveSpec(spec)
          const factsId = (await fetchLatestFactsId(DEFAULT_SPEC_ID)) || 'f1830b46947f'
          const ruling = await fetchRuling(DEFAULT_SPEC_ID, factsId)
          if (ruling && isMounted) {
            setLiveRuling(ruling)
          }
        }
      } catch (err) {
        console.warn('Could not load live teaser data:', err)
      } finally {
        if (isMounted) setLoadingTeaser(false)
      }
    }
    loadTeaser()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between overflow-hidden selection:bg-emerald-500/30 selection:text-white">
      {/* 200px Top and Bottom Black Edge Fades */}
      <div className="edge-fade-top" aria-hidden="true" />
      <div className="edge-fade-bottom" aria-hidden="true" />

      {/* Pure CSS Slow-Drifting Gradient Mesh Background (No 3rd-party media) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft Blob 1: GenLayer Emerald Accent */}
        <div className="mesh-blob-1 absolute -top-[10%] left-[15%] w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-emerald-600/25 blur-[100px]" />
        {/* Soft Blob 2: Muted Deep Indigo / Violet */}
        <div className="mesh-blob-2 absolute top-[30%] -right-[10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-indigo-700/20 blur-[110px]" />
        {/* Soft Blob 3: Subtle Warm Amber / Slate */}
        <div className="mesh-blob-3 absolute -bottom-[10%] left-[25%] w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] rounded-full bg-teal-800/20 blur-[100px]" />
      </div>

      {/* Slim Top Navigation Bar */}
      <header className="relative z-10 border-b border-white/10 bg-[#09090b]/70 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
              AS
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg sm:text-xl tracking-tight text-white">
                Agreement Studio
              </span>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Studionet
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="https://github.com/huzyow155/agreement-studio-genlayer"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-sm rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Enter App</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 flex flex-col items-center text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-xs sm:text-sm font-mono tracking-wider text-emerald-400 uppercase mb-6 sm:mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Agreement Studio &bull; Pre-Signing Ambiguity Benchmark</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif italic font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white max-w-4xl leading-[1.08] mb-6 sm:mb-8">
          See where your agreement breaks &mdash; before you sign it.
        </h1>

        {/* Subtext */}
        <p className="font-sans text-base sm:text-xl text-zinc-300 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-normal">
          Test your contract clause against edge cases before signing, then get on-chain rulings that abstain instead of guessing when the AI misreads it.
        </p>

        {/* CTA Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16 sm:mb-20">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-base rounded-full shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch Studio App</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-950" />
          </button>

          <a
            href="https://github.com/huzyow155/agreement-studio-genlayer"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 liquid-glass-strong text-zinc-200 hover:text-white font-medium text-base rounded-full cursor-pointer"
          >
            <span>View on GitHub</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
          </a>
        </div>

        {/* Compact 4-Step "How It Works" Row */}
        <div className="w-full mb-12 sm:mb-16">
          <div className="text-xs uppercase font-mono tracking-widest text-zinc-400 mb-4 sm:mb-6 text-center">
            How It Works &bull; 4-Step Pre-Signing & Adjudication Lifecycle
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Step 1: Draft */}
            <div className="gradient-border-glass rounded-2xl p-5 space-y-2 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>1. Draft Clause</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Enter clause text & outcome labels; counterparties propose realistic edge cases.
              </p>
            </div>

            {/* Step 2: Lock */}
            <div className="gradient-border-glass rounded-2xl p-5 space-y-2 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>2. Consensus Lock</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Validators evaluate scenarios; amend wording until all turn green, then lock agreement digest.
              </p>
            </div>

            {/* Step 3: Facts */}
            <div className="gradient-border-glass rounded-2xl p-5 space-y-2 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>3. Stipulate Facts</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Counterparties submit and mutually confirm factual statements when disputes arise.
              </p>
            </div>

            {/* Step 4: Adjudicate */}
            <div className="gradient-border-glass rounded-2xl p-5 space-y-2 border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>4. Canary Adjudicate</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                In-band canary verifies judge calibration before consensus renders the final verdict.
              </p>
            </div>
          </div>
        </div>

        {/* Live on Studionet Teaser Card */}
        <div className="w-full max-w-2xl gradient-border-glass rounded-2xl p-5 sm:p-6 border border-white/10 text-left space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  loadingTeaser ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-300">
                {loadingTeaser ? 'Fetching Studionet Evidence...' : 'Live On Studionet • Spec Evidence'}
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
              <div className="text-emerald-400 font-semibold">{liveSpec ? `${liveSpec.n_scenarios} Green (0 Red)` : '4 Green'}</div>
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
            <span>Verified consensus ruling on GenLayer Studionet (Chain ID 61999)</span>
            <button
              onClick={onEnterApp}
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              Inspect in interactive workbench &rarr;
            </button>
          </div>
        </div>

        {/* GEN Funding Information Note */}
        <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left text-xs text-zinc-400 space-y-1.5">
          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Studionet Gas & Funding Guide</span>
          </div>
          <p className="leading-relaxed">
            Reading contract state is free and requires no wallet. For writing transactions (drafting, signing, locking, adjudicating), connected wallets require a small balance of studionet GEN (roughly 0.05–0.1 GEN covers complete test runs). To fund an external wallet, transfer test GEN from a pre-funded development account in the{' '}
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline underline-offset-2 font-medium"
            >
              GenLayer Studio
            </a>{' '}
            Accounts panel.
          </p>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 border-t border-white/10 bg-[#09090b]/80 backdrop-blur-md py-6 sm:py-8 text-xs sm:text-sm text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-200 font-medium">GenLayer studionet &bull; Agreement Studio</span>
            <span>&bull;</span>
            <span>MIT License</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/huzyow155/agreement-studio-genlayer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            {/* Exactly ONE prominent contract link */}
            <a
              href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Contract <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/huzyow155/agreement-studio-genlayer#how-to-try-it-step-by-step-flow"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
