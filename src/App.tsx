import React, { useState, useEffect, useCallback } from 'react'
import { LandingPage } from './components/landing/LandingPage'
import { Header } from './components/Header'
import { WalletModal } from './components/WalletModal'
import { TransactionOverlay } from './components/TransactionOverlay'
import { WorkflowIndicator } from './components/WorkflowIndicator'
import type { StepKey } from './components/WorkflowIndicator'
import { SpecSelector } from './components/SpecSelector'
import { SpecOverview } from './components/SpecOverview'
import { ScenariosTable } from './components/ScenariosTable'
import { LockingSection } from './components/LockingSection'
import { FactsSection } from './components/FactsSection'
import { AdjudicationSection } from './components/AdjudicationSection'
import { AdjudicationResultView } from './components/AdjudicationResultView'
import { HowItWorks } from './components/HowItWorks'
import {
  fetchSpec,
  fetchScenario,
  fetchSuiteReport,
  fetchFacts,
  fetchRuling,
  fetchLatestFactsId
} from './services/contractService'
import type { SpecRecord, ScenarioRecord, SuiteReport, FactsRecord, RulingRecord } from './types/contract'
import { DEFAULT_SPEC_ID, DEFAULT_FACTS_ID, CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL } from './config/chain'
import { useWallet } from './context/WalletContext'
import { Loader2, RefreshCw, ExternalLink, ChevronDown, ChevronRight, Shield, Layers } from 'lucide-react'

// Downstream consumer contract address
const CONSUMER_CONTRACT_ADDRESS = '0x9Fe97e71A0eeF88594abDea901B978519C98df34'

export const App: React.FC = () => {
  // Client-side routing: '/' for Landing Hero, '/app' for Workbench
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase()
    return path.startsWith('/app') ? '/app' : '/'
  })

  // Deep-linking & browser history synchronization
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase()
      setCurrentRoute(path.startsWith('/app') ? '/app' : '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path)
    setCurrentRoute(path.startsWith('/app') ? '/app' : '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleEnterApp = useCallback(() => {
    navigate('/app')
  }, [navigate])

  const handleNavigateHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  // App / Spec State
  const [currentSpecId, setCurrentSpecId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('spec')
      if (param) return param
    }
    return DEFAULT_SPEC_ID
  })
  const [spec, setSpec] = useState<SpecRecord | null>(null)
  const [scenarios, setScenarios] = useState<ScenarioRecord[]>([])
  const [suiteReport, setSuiteReport] = useState<SuiteReport | null>(null)
  const [facts, setFacts] = useState<FactsRecord | null>(null)
  const [ruling, setRuling] = useState<RulingRecord | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeStep, setActiveStep] = useState<StepKey>('DRAFT')
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false)

  // Track connected account so spec data reloads when wallet switches
  const { account: connectedAccount } = useWallet()

  // Load complete spec state from contract
  const loadSpecData = useCallback(async (specId: string) => {
    setIsLoading(true)
    try {
      const loadedSpec = await fetchSpec(specId)
      setSpec(loadedSpec)

      if (loadedSpec) {
        // Load all scenarios
        const scList: ScenarioRecord[] = []
        for (let i = 1; i <= loadedSpec.n_scenarios; i++) {
          const sc = await fetchScenario(specId, i)
          if (sc) scList.push(sc)
        }
        setScenarios(scList)

        // Load suite report
        const rep = await fetchSuiteReport(specId)
        setSuiteReport(rep)

        // Load facts
        const factsId = (await fetchLatestFactsId(specId)) || DEFAULT_FACTS_ID
        const loadedFacts = await fetchFacts(specId, factsId)
        setFacts(loadedFacts)

        // Load ruling if facts exist
        if (loadedFacts) {
          const loadedRuling = await fetchRuling(specId, loadedFacts.facts_id)
          setRuling(loadedRuling)

          // Determine appropriate active step
          if (loadedRuling) {
            setActiveStep('RESULT')
          } else if ((loadedFacts.by?.length || 0) >= 2) {
            setActiveStep('ADJUDICATE')
          } else if (loadedSpec.status === 'LOCKED') {
            setActiveStep('FACTS')
          } else {
            setActiveStep('DRAFT')
          }
        } else {
          setRuling(null)
          if (loadedSpec.status === 'LOCKED') {
            setActiveStep('FACTS')
          } else {
            setActiveStep('DRAFT')
          }
        }
      } else {
        setScenarios([])
        setSuiteReport(null)
        setFacts(null)
        setRuling(null)
      }
    } catch (err) {
      console.error('Error loading spec data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reload spec data when route, spec ID, or connected wallet changes
  useEffect(() => {
    if (currentRoute === '/app') {
      loadSpecData(currentSpecId)
    }
  }, [currentRoute, currentSpecId, connectedAccount, loadSpecData])

  const handleSelectSpecId = (newId: string) => {
    setCurrentSpecId(newId)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('spec', newId)
      window.history.replaceState(null, '', url.toString())
    }
  }

  const isLocked = spec?.status === 'LOCKED'
  const hasConfirmedFacts = (facts?.by?.length || 0) >= 2
  const hasRuling = Boolean(ruling)

  // --------------------------------------------------------------------------
  // Route 1: Landing Page (root /)
  // --------------------------------------------------------------------------
  if (currentRoute !== '/app') {
    return (
      <>
        <LandingPage onEnterApp={handleEnterApp} />
        <WalletModal />
        <TransactionOverlay />
        <HowItWorks
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
        />
      </>
    )
  }

  // --------------------------------------------------------------------------
  // Route 2: Interactive App Workbench (/app)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] text-[#18181b]">
      {/* Top Header */}
      <Header
        onOpenHowItWorks={() => setShowHowItWorks(true)}
        onNavigateHome={handleNavigateHome}
        isAppRoute={true}
      />

      {/* Main Content Canvas */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Focused Workbench Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181b]">
              Agreement Workbench
            </h1>
            <p className="text-sm text-[#71717a] mt-0.5">
              Draft natural-language clauses, test adversarial edge cases, and inspect canary rulings.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#e7e5e0] rounded-full text-xs font-mono text-[#52525b] shadow-xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Studionet &bull; Chain 61999</span>
          </div>
        </div>

        {/* Spec Selector & Active Case Navigator */}
        <SpecSelector
          currentSpecId={currentSpecId}
          onSelectSpecId={handleSelectSpecId}
        />

        {/* Workflow Progress Indicator */}
        <WorkflowIndicator
          currentStep={activeStep}
          isLocked={Boolean(isLocked)}
          hasConfirmedFacts={hasConfirmedFacts}
          hasRuling={hasRuling}
          onStepClick={(step) => setActiveStep(step)}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 text-center bg-white border border-[#e7e5e0] rounded-2xl shadow-xs space-y-3">
            <Loader2 className="w-7 h-7 text-[#18181b] animate-spin mx-auto" />
            <div className="text-sm text-[#71717a] font-medium">
              Loading contract state from GenLayer Studionet...
            </div>
          </div>
        )}

        {/* Loaded Spec Workspace */}
        {!isLoading && spec && (
          <div className="space-y-6">
            {/* Primary Ruling View (if ruling exists and Result step selected) */}
            {ruling && (activeStep === 'RESULT' || activeStep === 'ADJUDICATE') && (
              <AdjudicationResultView ruling={ruling} />
            )}

            {/* Spec Overview (Clause, Parties, Signatures) */}
            <SpecOverview
              spec={spec}
              onSpecUpdated={(updated) => setSpec(updated)}
            />

            {/* Stage 1 & 2: Adversarial Scenarios Matrix & Pre-Signing Gate */}
            {(!isLocked || activeStep === 'DRAFT' || activeStep === 'LOCK') && (
              <>
                <ScenariosTable
                  spec={spec}
                  scenarios={scenarios}
                  suiteReport={suiteReport}
                  onScenarioAdded={(newSc) => setScenarios((prev) => [...prev, newSc])}
                  onScenarioUpdated={(upSc) =>
                    setScenarios((prev) => prev.map((s) => (s.n === upSc.n ? upSc : s)))
                  }
                  onSuiteReportUpdated={(rep) => setSuiteReport(rep)}
                  onSpecReload={() => loadSpecData(currentSpecId)}
                />

                <LockingSection
                  spec={spec}
                  suiteReport={suiteReport}
                  onSpecUpdated={(updated) => setSpec(updated)}
                />
              </>
            )}

            {/* Stage 3: Dispute Facts Stipulation & Confirmation */}
            {isLocked && (
              <FactsSection
                spec={spec}
                facts={facts}
                onFactsUpdated={(updated) => setFacts(updated)}
              />
            )}

            {/* Stage 4: Adjudication Trigger */}
            {isLocked && !ruling && (
              <AdjudicationSection
                spec={spec}
                facts={facts}
                ruling={ruling}
                onRulingReceived={(newRuling) => {
                  setRuling(newRuling)
                  setActiveStep('RESULT')
                }}
              />
            )}
          </div>
        )}

        {/* Spec Not Found Empty State */}
        {!isLoading && !spec && (
          <div className="py-20 text-center bg-white border border-[#e7e5e0] rounded-2xl shadow-xs space-y-4 px-4">
            <h3 className="text-lg font-semibold text-[#18181b]">Agreement Spec Not Found</h3>
            <p className="text-sm text-[#71717a] max-w-sm mx-auto">
              Spec <code className="font-mono text-[#18181b]">{currentSpecId}</code> does not exist on the deployed contract.
            </p>
            <button
              onClick={() => handleSelectSpecId(DEFAULT_SPEC_ID)}
              className="px-5 py-2.5 bg-[#18181b] text-white text-sm font-medium rounded-lg hover:bg-[#27272a] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Load Verified Demo Spec ({DEFAULT_SPEC_ID})</span>
            </button>
          </div>
        )}

        {/* Collapsed Technical Details & Secondary Contract Addresses (Section 2) */}
        <div className="border border-[#e7e5e0] rounded-2xl bg-white overflow-hidden shadow-xs">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-medium text-[#52525b] hover:text-[#18181b] hover:bg-[#faf9f5] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#71717a]" />
              <span className="font-semibold text-[#18181b]">Contract Addresses & Technical Details</span>
              <span className="text-xs text-[#71717a] hidden sm:inline">(GenLayer Studionet)</span>
            </div>
            {showTechnicalDetails ? (
              <ChevronDown className="w-4 h-4 text-[#71717a]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#71717a]" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="px-5 pb-5 pt-2 border-t border-[#e7e5e0] bg-[#faf9f5] space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Intelligent Contract */}
                <div className="p-4 bg-white rounded-xl border border-[#e7e5e0] space-y-1.5">
                  <div className="font-semibold text-[#18181b] flex items-center justify-between">
                    <span>ClauseLab (Primary Contract)</span>
                    <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#52525b] break-all">{CONTRACT_ADDRESS}</div>
                  <a
                    href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#18181b] hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    View Primary Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Downstream Consumer Contract (Secondary) */}
                <div className="p-4 bg-white rounded-xl border border-[#e7e5e0] space-y-1.5">
                  <div className="font-semibold text-[#18181b] flex items-center justify-between">
                    <span>ClauseLabConsumer (Downstream)</span>
                    <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                      Secondary
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#52525b] break-all">{CONSUMER_CONTRACT_ADDRESS}</div>
                  <a
                    href={`${STUDIONET_EXPLORER_URL}/address/${CONSUMER_CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#71717a] hover:text-[#18181b] hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    View Consumer Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-[#71717a] leading-relaxed flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#52525b] shrink-0" />
                <span>
                  Network: GenLayer Studionet (Chain ID 61999) &bull; Equivalence Principle strictly evaluated by independent validator nodes.
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Single Prominent Explorer Link */}
      <footer className="border-t border-[#e7e5e0] bg-white py-8 mt-12 text-xs sm:text-sm text-[#71717a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#18181b]">Agreement Studio</span>
            <span>&bull;</span>
            <span>Powered by ClauseLab Intelligent Contract</span>
          </div>

          <div className="flex items-center gap-5 text-xs sm:text-sm">
            <span>Studionet (61999)</span>
            <span>&bull;</span>
            {/* Quiet compact explorer utility link */}
            <a
              href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#71717a] hover:text-[#18181b] flex items-center gap-1 transition-colors"
            >
              <span>Explorer</span>
              <ExternalLink className="w-3 h-3 text-[#a1a1aa]" />
            </a>
            <span>&bull;</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Overlays */}
      <WalletModal />
      <TransactionOverlay />
      <HowItWorks
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </div>
  )
}
