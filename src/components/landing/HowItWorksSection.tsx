import React, { memo } from 'react'
import { FileEdit, CheckCircle2, ShieldCheck, Scale, ArrowRight } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

interface HowItWorksSectionProps {
  onEnterApp: () => void
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = memo(({ onEnterApp }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 })

  const steps = [
    {
      num: '01',
      icon: FileEdit,
      title: 'Draft & Propose Edge Cases',
      description:
        'The author inputs proposed natural-language text and allowed outcome labels (e.g. DELIVERED, BREACH). Both counterparties propose concrete hypothetical scenarios representing borderline situations.',
      badge: 'Interactive Drafting',
    },
    {
      num: '02',
      icon: CheckCircle2,
      title: 'Validator Consensus & Lock',
      description:
        'Independent GenLayer validators evaluate each scenario. Ambiguous wording surfaces as UNDECIDABLE. Once at least 4 green scenarios exist across 2 labels and both parties sign, the agreement locks.',
      badge: '4 Green Scenarios Req.',
    },
    {
      num: '03',
      icon: ShieldCheck,
      title: 'Stipulate & Confirm Facts',
      description:
        'If a dispute occurs after performance, one party enters the factual situation. The counterparty reviews and confirms the factual claim on-chain before adjudication can proceed.',
      badge: 'Dual-Party Consent',
    },
    {
      num: '04',
      icon: Scale,
      title: 'Canary Adjudication',
      description:
        'Validators run atomic consensus evaluating a held-back canary scenario alongside the disputed facts. If the canary passes, the verdict is rendered; if it fails, the contract halts with UNRELIABLE.',
      badge: 'In-Band Calibration',
    },
  ]

  return (
    <section
      id="how-it-works"
      ref={ref}
      className={`relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[var(--border-subtle)] transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Step-by-Step Lifecycle
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-tight leading-tight mb-6">
          From draft to calibrated ruling.
        </h2>
        <div className="w-16 h-px bg-[#D8C9A7] mx-auto mb-6" />
        <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed font-normal">
          Agreement Studio guides counterparties through an adversarial 4-stage agreement lifecycle.
        </p>
      </div>

      {/* Cinematic Timeline Progress Line (scaleX from 0 to 1 on viewport reveal) */}
      <div className="relative mb-8 hidden lg:block">
        <div
          className={`h-0.5 bg-[var(--accent-champagne-border)] w-full timeline-line origin-left ${
            isVisible ? 'scale-x-100' : 'scale-x-0'
          }`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.num}
              className="luxury-card rounded-2xl p-6 flex flex-col justify-between space-y-6 relative group hover:border-[var(--accent-champagne-border)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-normal text-[#D8C9A7]">
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Icon className="w-4 h-4 text-[#626762] dark:text-[#AEB5AC] group-hover:text-[#D8C9A7] transition-colors" />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  {step.badge}
                </div>

                <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Phase {step.num}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-[var(--text-primary)] transition-all" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-14 text-center">
        <button
          onClick={onEnterApp}
          className="inline-flex items-center gap-2 px-6 py-3 luxury-glass text-[var(--text-primary)] hover:border-[var(--accent-champagne-border)] text-sm font-semibold rounded-full transition-all cursor-pointer shadow-xs"
        >
          <span>Walk through the interactive workflow</span>
          <ArrowRight className="w-4 h-4 text-[#D8C9A7]" />
        </button>
      </div>
    </section>
  )
})
