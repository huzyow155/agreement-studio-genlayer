import React, { memo } from 'react'
import { Users2, ShieldCheck, Scale, Binary } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export const FeaturesSection: React.FC = memo(() => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 })

  const pillars = [
    {
      icon: Users2,
      tag: 'EQUIVALENCE PRINCIPLE',
      title: 'Adversarial Edge-Case Consensus',
      description:
        'Counterparties propose realistic borderline edge cases. Independent GenLayer validators evaluate whether the natural-language clause unambiguously classifies each scenario, turning ambiguous scenarios red until amended.',
    },
    {
      icon: ShieldCheck,
      tag: 'IN-BAND CALIBRATION',
      title: 'Held-Back Canary Verification',
      description:
        'During adjudication, validators must evaluate an in-band canary scenario with a known ground-truth outcome alongside the dispute. A misjudged canary immediately halts the ruling with UNRELIABLE.',
    },
    {
      icon: Binary,
      tag: 'TWO-PARTY CONSENT',
      title: 'Mutual On-Chain Fact Stipulation',
      description:
        'No unauthorized third-party scraping or rogue oracle feeds. Adjudications evaluate real-world dispute facts only after both counterparties have signed and confirmed the statement on-chain.',
    },
    {
      icon: Scale,
      tag: 'INTEGRITY BINDING',
      title: 'Cryptographic Digest Binding',
      description:
        'Once at least 4 green scenarios exist across outcome labels and both counterparties sign, the agreement locks an immutable SHA-256 digest binding all downstream rulings.',
    },
  ]

  return (
    <section
      id="features"
      ref={ref}
      className={`relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[var(--border-subtle)] transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Architecture &amp; Protocol Pillars
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-tight leading-tight mb-6">
          Engineered for consensus integrity.
        </h2>
        <div className="w-16 h-px bg-[#D8C9A7] mx-auto mb-6" />
        <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed font-normal">
          Four protocol pillars built natively into the ClauseLab Intelligent Contract running on GenLayer Studionet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon
          return (
            <div
              key={pillar.title}
              className="luxury-card rounded-2xl p-7 sm:p-9 space-y-4 flex flex-col justify-between group hover:border-[var(--accent-champagne-border)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {/* Icon: Dark graphite in Light mode, soft ivory in Dark mode */}
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] group-hover:border-[var(--accent-champagne-border)] transition-colors">
                    <Icon className="w-5 h-5 text-[#626762] dark:text-[#AEB5AC] group-hover:text-[#D8C9A7] transition-colors" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-color)] tracking-wider">
                    {pillar.tag}
                  </span>
                </div>

                <div className="text-[var(--text-muted)] font-mono text-xs">0{idx + 1}</div>

                <h3 className="text-xl sm:text-2xl font-serif text-[var(--text-primary)] tracking-tight">
                  {pillar.title}
                </h3>

                <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
})
