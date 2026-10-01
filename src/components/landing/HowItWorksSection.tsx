import React from 'react'
import { FileEdit, CheckCircle2, ShieldCheck, Scale, ArrowRight } from 'lucide-react'

interface HowItWorksSectionProps {
  onEnterApp: () => void
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onEnterApp }) => {
  const steps = [
    {
      num: '01',
      icon: FileEdit,
      title: 'Draft & Propose Edge Cases',
      description:
        'The author inputs proposed natural-language text and allowed outcome labels (e.g. DELIVERED, BREACH). Both parties propose concrete hypothetical scenarios representing borderline situations.',
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
    <section id="how-it-works" className="relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
          Step-by-Step Lifecycle
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight mb-6">
          From draft to calibrated ruling.
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed font-normal">
          Agreement Studio guides counterparties through an adversarial 4-stage agreement lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.num}
              className="gradient-border-glass rounded-2xl p-6 flex flex-col justify-between space-y-6 relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-normal text-emerald-400/80">
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-300">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  {step.badge}
                </div>

                <h3 className="text-lg font-semibold text-white tracking-tight">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span>Phase {step.num}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onEnterApp}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15 text-sm font-semibold rounded-full transition-all cursor-pointer"
        >
          <span>Walk through the interactive workflow</span>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </section>
  )
}
