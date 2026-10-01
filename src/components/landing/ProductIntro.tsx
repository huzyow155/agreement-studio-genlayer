import React from 'react'
import { AlertTriangle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react'

export const ProductIntro: React.FC = () => {
  return (
    <section id="story" className="relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Subtle Ambient Radial Highlight */}
      <div className="glow-ambient -top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/[0.04]" />

      <div className="relative z-10 text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
          The Problem with AI Adjudication
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight mb-6">
          Single models guess. Consensus verifies.
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed font-normal">
          When counterparties sign vague contractual language, LLM-based arbiters frequently hallucinate decisive verdicts on ambiguous edge cases. Agreement Studio forces counterparties to benchmark and lock the text before signing.
        </p>
      </div>

      {/* Side-by-Side Comparison: Naive LLM Oracle vs GenLayer Agreement Studio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Naive AI Adjudication */}
        <div className="liquid-glass-card rounded-2xl p-6 sm:p-8 space-y-5 border-red-500/10 hover:border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Conventional AI Oracle
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
            The Ambiguity &amp; Hallucination Trap
          </h3>

          <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Forced Decisions:</strong> Single LLMs always attempt to output a binary decision, even when contract clauses are fundamentally undecidable.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Unmeasured Model Drift:</strong> Zero mechanism to verify if the underlying model weights or prompt interpretations drifted over time.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Post-Dispute Surprises:</strong> Parties discover critical ambiguities only after thousands of dollars are at stake in performance.</span>
            </li>
          </ul>
        </div>

        {/* Right: Agreement Studio on GenLayer */}
        <div className="liquid-glass-card rounded-2xl p-6 sm:p-8 space-y-5 border-emerald-500/20 hover:border-emerald-500/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.08] blur-2xl rounded-full pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GenLayer Studionet Engine
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
            Pre-Signing Ambiguity Benchmark
          </h3>

          <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Multi-Validator Consensus:</strong> Independent validators test edge cases pre-signing; ambiguous text yields <code className="text-emerald-400 font-mono text-xs">UNDECIDABLE</code> until reworded.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>In-Band Canary Calibration:</strong> Adjudication validates an in-band held-back scenario with known truth before evaluating actual disputed facts.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Principled Abstention:</strong> If consensus fails or the canary misses, the contract safely outputs <code className="text-emerald-400 font-mono text-xs">UNRELIABLE</code> instead of guessing.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
