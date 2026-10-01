import React, { useEffect, useState } from 'react'
import { LandingNavbar } from './LandingNavbar'
import { HeroSection } from './HeroSection'
import { ProductIntro } from './ProductIntro'
import { FeaturesSection } from './FeaturesSection'
import { HowItWorksSection } from './HowItWorksSection'
import { DappPreviewSection } from './DappPreviewSection'
import { FinalCTA } from './FinalCTA'
import { LandingFooter } from './LandingFooter'
import { DEFAULT_SPEC_ID } from '../../config/chain'
import { fetchSpec, fetchRuling, fetchLatestFactsId } from '../../services/contractService'
import type { SpecRecord, RulingRecord } from '../../types/contract'

interface LandingPageProps {
  onEnterApp: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
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
        console.warn('Could not load live teaser data on landing page:', err)
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
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-emerald-500/30 selection:text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Floating Glass Navigation */}
      <LandingNavbar onEnterApp={onEnterApp} />

      {/* Main Content Sections */}
      <main className="flex-1 w-full">
        {/* 1. Cinematic Hero Section */}
        <HeroSection
          onEnterApp={onEnterApp}
          liveSpec={liveSpec}
          liveRuling={liveRuling}
          loadingTeaser={loadingTeaser}
        />

        {/* 2. Product Intro: The Ambiguity Problem vs Consensus */}
        <ProductIntro />

        {/* 3. Features: 4 Protocol Pillars */}
        <FeaturesSection />

        {/* 4. How It Works: 4-Step Lifecycle */}
        <HowItWorksSection onEnterApp={onEnterApp} />

        {/* 5. DApp Preview: Terminal Mockup */}
        <DappPreviewSection
          onEnterApp={onEnterApp}
          liveSpec={liveSpec}
          liveRuling={liveRuling}
        />

        {/* 6. Final High-Impact CTA */}
        <FinalCTA onEnterApp={onEnterApp} />
      </main>

      {/* 7. Minimalist Footer */}
      <LandingFooter onEnterApp={onEnterApp} />
    </div>
  )
}
