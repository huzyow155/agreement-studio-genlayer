import React, { memo } from 'react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export const ProductIntro: React.FC = memo(() => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 })

  return (
    <section
      id="story"
      ref={ref}
      className={`relative py-24 sm:py-32 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[var(--border-subtle)] transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3">
          The Problem with AI Adjudication
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-tight leading-tight mb-6">
          Single models guess. Consensus verifies.
        </h2>
        <div className="w-16 h-px bg-[#D8C9A7] mx-auto mb-6" />
        <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed font-normal">
          When counterparties sign natural-language agreements without adversarial testing, single-model LLM arbiters inevitably hallucinate decisive verdicts on ambiguous edge cases. Agreement Studio surfaces ambiguity before signing.
        </p>
      </div>

      {/* Editorial Minimal Contrast (Not a colorful dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        {/* Left: Single-Model Arbiters */}
        <div className="luxury-card rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Single-Model Arbiters
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-serif text-[var(--text-primary)]">
            Forced Binary Guessing
          </h3>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Conventional AI oracles lack an abstention mechanism. When presented with ambiguous contract language, a standalone model is forced to choose an arbitrary outcome, introducing unmeasured model bias and unpredictable dispute results.
          </p>

          <div className="pt-2 text-xs font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
            Result: Hallucinated certainty on undecidable clauses
          </div>
        </div>

        {/* Right: Multi-Validator Consensus */}
        <div className="luxury-card rounded-2xl p-7 sm:p-9 space-y-5 border-[var(--accent-champagne-border)]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#D8C9A7]">
              GenLayer Multi-Validator Consensus
            </span>
            <span className="w-2 h-2 rounded-full bg-[#D8C9A7]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-serif text-[var(--text-primary)]">
            Calibrated Pre-Signing Consensus
          </h3>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Independent validators evaluate edge cases before signing under the Equivalence Principle. If validators disagree, the clause surfaces as UNDECIDABLE. At adjudication, an in-band canary verifies calibration before evaluating dispute facts.
          </p>

          <div className="pt-2 text-xs font-mono text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
            Result: Principled abstention (<span className="text-[var(--text-primary)] font-semibold">UNRELIABLE</span>) when uncalibrated
          </div>
        </div>
      </div>
    </section>
  )
})
