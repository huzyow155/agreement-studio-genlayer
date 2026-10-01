import React from 'react'
import { Users2, ShieldCheck, Scale, Binary } from 'lucide-react'

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Users2,
      tag: 'EQUIVALENCE PRINCIPLE',
      title: 'Adversarial Edge-Case Consensus',
      description:
        'Counterparties submit realistic hypothetical edge cases. Independent GenLayer validators evaluate whether the clause unambiguously classifies each scenario, turning ambiguous scenarios red until amended.',
    },
    {
      icon: ShieldCheck,
      tag: 'IN-BAND CALIBRATION',
      title: 'Held-Back Canary Verification',
      description:
        'At adjudication time, validators must evaluate an in-band canary scenario with a known ground-truth outcome alongside the dispute. A missed canary halts the ruling with UNRELIABLE.',
    },
    {
      icon: Binary,
      tag: 'TWO-PARTY CONSENT',
      title: 'Mutual On-Chain Fact Stipulation',
      description:
        'No rogue third-party scraping or unverified oracle feeds. Rulings evaluate real-world dispute facts only after both counterparties have signed and confirmed the statement on-chain.',
    },
    {
      icon: Scale,
      tag: 'SAFETY FIRST',
      title: 'Cryptographic Digest Binding',
      description:
        'Once 4 green scenarios exist across multiple outcome labels and both parties sign, the agreement locks an immutable SHA-256 spec digest that cryptographically binds all future rulings.',
    },
  ]

  return (
    <section id="features" className="relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
          Architecture &amp; Protocol Pillars
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight mb-6">
          Engineered for consensus integrity.
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed font-normal">
          Every capability is built directly into the ClauseLab Intelligent Contract running on GenLayer Studionet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="liquid-glass-card rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/10 tracking-wider">
                    {feature.tag}
                  </span>
                </div>

                <div className="text-zinc-500 font-mono text-xs">0{idx + 1}</div>

                <h3 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
                  {feature.title}
                </h3>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
