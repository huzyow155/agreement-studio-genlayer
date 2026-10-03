import React, { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useTransaction } from '../context/TransactionContext'
import { submitCreateSpec, getWriteClient, fetchSpec, computeDeterministicSpecId } from '../services/contractService'
import { DEFAULT_SPEC_ID } from '../config/chain'
import { Search, Plus, X, Sparkles, BookOpen } from 'lucide-react'

const EXAMPLE_SPEC_1 = {
  title: 'Software Delivery Milestone Agreement',
  clause: 'The contractor shall deliver the repository with pure ASCII code and passing tests within 7 calendar days of contract creation.',
  labelsCsv: 'DELIVERED, BREACH',
}

const EXAMPLE_SPEC_2 = {
  title: 'Cloud Service Level Agreement (SLA)',
  clause: 'The cloud service provider shall maintain monthly API uptime of at least 99.9% and respond to critical outage incidents within 1 hour.',
  labelsCsv: 'COMPLIANT, VIOLATION',
}

const EXAMPLE_SPEC_3 = {
  title: 'Consulting Deliverable Quality Agreement',
  clause: 'The consultant shall produce work that is reasonably satisfactory and meets general professional expectations within a mutually agreeable timeframe.',
  labelsCsv: 'ACCEPTABLE, UNACCEPTABLE',
}

interface SpecSelectorProps {
  currentSpecId: string
  onSelectSpecId: (specId: string) => void
}

export const SpecSelector: React.FC<SpecSelectorProps> = ({ currentSpecId, onSelectSpecId }) => {
  const { account, selectedWallet } = useWallet()
  const { executeTransaction, isBusy } = useTransaction()

  const [inputSpecId, setInputSpecId] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalMode, setModalMode] = useState<'example1' | 'example2' | 'example3' | 'custom'>('example1')

  // Form fields for new spec
  const [title, setTitle] = useState(EXAMPLE_SPEC_1.title)
  const [clause, setClause] = useState(EXAMPLE_SPEC_1.clause)
  const [labelsCsv, setLabelsCsv] = useState(EXAMPLE_SPEC_1.labelsCsv)

  const openCreateModal = (mode: 'example1' | 'example2' | 'example3' | 'custom') => {
    setModalMode(mode)
    if (mode === 'example1') {
      setTitle(EXAMPLE_SPEC_1.title)
      setClause(EXAMPLE_SPEC_1.clause)
      setLabelsCsv(EXAMPLE_SPEC_1.labelsCsv)
    } else if (mode === 'example2') {
      setTitle(EXAMPLE_SPEC_2.title)
      setClause(EXAMPLE_SPEC_2.clause)
      setLabelsCsv(EXAMPLE_SPEC_2.labelsCsv)
    } else if (mode === 'example3') {
      setTitle(EXAMPLE_SPEC_3.title)
      setClause(EXAMPLE_SPEC_3.clause)
      setLabelsCsv(EXAMPLE_SPEC_3.labelsCsv)
    } else {
      setTitle('')
      setClause('')
      setLabelsCsv('DELIVERED, BREACH')
    }
    setShowCreateModal(true)
  }

  const handleSelectTab = (mode: 'example1' | 'example2' | 'example3' | 'custom') => {
    setModalMode(mode)
    if (mode === 'example1') {
      setTitle(EXAMPLE_SPEC_1.title)
      setClause(EXAMPLE_SPEC_1.clause)
      setLabelsCsv(EXAMPLE_SPEC_1.labelsCsv)
    } else if (mode === 'example2') {
      setTitle(EXAMPLE_SPEC_2.title)
      setClause(EXAMPLE_SPEC_2.clause)
      setLabelsCsv(EXAMPLE_SPEC_2.labelsCsv)
    } else if (mode === 'example3') {
      setTitle(EXAMPLE_SPEC_3.title)
      setClause(EXAMPLE_SPEC_3.clause)
      setLabelsCsv(EXAMPLE_SPEC_3.labelsCsv)
    } else {
      setTitle('')
      setClause('')
      setLabelsCsv('DELIVERED, BREACH')
    }
  }

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputSpecId.trim()) {
      onSelectSpecId(inputSpecId.trim())
      setInputSpecId('')
    }
  }

  const handleCreateSpec = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || !selectedWallet || !title.trim() || !clause.trim()) return

    const trimmedTitle = title.trim()
    const trimmedClause = clause.trim()
    const trimmedLabels = labelsCsv.trim()

    // 1. Compute deterministic spec_id on-chain formula: _sha(author|title|clause)[:12]
    const deterministicId = computeDeterministicSpecId(account, trimmedTitle, trimmedClause)

    // 2. Pre-check if spec already exists on-chain for this author/text
    try {
      const existingSpec = await fetchSpec(deterministicId)
      if (existingSpec && existingSpec.spec_id) {
        // Spec already exists! Automatically select and load it instead of crashing.
        onSelectSpecId(existingSpec.spec_id)
        setShowCreateModal(false)
        setTitle('')
        setClause('')
        return
      }
    } catch (err) {
      console.warn('Pre-check for existing spec encountered an error:', err)
    }

    const client = getWriteClient(account, selectedWallet.provider)

    await executeTransaction(
      'Create Agreement Spec',
      () => submitCreateSpec(client, trimmedTitle, trimmedClause, trimmedLabels),
      async () => {
        // First check the expected deterministic ID directly
        const loadedDirect = await fetchSpec(deterministicId)
        if (loadedDirect && loadedDirect.spec_id) {
          onSelectSpecId(loadedDirect.spec_id)
          setShowCreateModal(false)
          setTitle('')
          setClause('')
          return true
        }

        // Fallback to get_latest_spec
        const rawLatest = await client.readContract({
          address: '0xf227D68595178A2192888c85E3550fEff4b79406',
          functionName: 'get_latest_spec',
          args: [account],
        })
        const latestId = typeof rawLatest === 'string' ? rawLatest.replace(/^"|"$/g, '') : null
        if (latestId && latestId.length >= 8) {
          const loaded = await fetchSpec(latestId)
          if (loaded) {
            onSelectSpecId(latestId)
            setShowCreateModal(false)
            setTitle('')
            setClause('')
            return true
          }
        }
        return false
      }
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      {/* Active Spec Selector Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[#71717a] font-medium">Agreement Case:</span>
        <button
          onClick={() => onSelectSpecId('b38ab2fac8a8')}
          className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all cursor-pointer ${
            currentSpecId === 'b38ab2fac8a8'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-red-50 border border-red-200 text-red-800 hover:border-red-400'
          }`}
        >
          b38ab2fac8a8 (Demo 3 Ambiguous ⚠)
        </button>

        <button
          onClick={() => onSelectSpecId('a003a9db5998')}
          className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all cursor-pointer ${
            currentSpecId === 'a003a9db5998'
              ? 'bg-[#18181b] text-white shadow-xs'
              : 'bg-white border border-[#e7e5e0] text-[#52525b] hover:border-[#a1a1aa]'
          }`}
        >
          a003a9db5998 (Demo 2 SLA Locked)
        </button>

        <button
          onClick={() => onSelectSpecId('b1e0205a4909')}
          className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all cursor-pointer ${
            currentSpecId === 'b1e0205a4909'
              ? 'bg-[#18181b] text-white shadow-xs'
              : 'bg-white border border-[#e7e5e0] text-[#52525b] hover:border-[#a1a1aa]'
          }`}
        >
          b1e0205a4909 (Dual-Wallet Locked)
        </button>

        <button
          onClick={() => onSelectSpecId('0b60bff5d312')}
          className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all cursor-pointer ${
            currentSpecId === '0b60bff5d312'
              ? 'bg-[#18181b] text-white shadow-xs'
              : 'bg-white border border-[#e7e5e0] text-[#52525b] hover:border-[#a1a1aa]'
          }`}
        >
          0b60bff5d312 (Walkthrough Case)
        </button>

        <button
          onClick={() => onSelectSpecId(DEFAULT_SPEC_ID)}
          className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all cursor-pointer ${
            currentSpecId === DEFAULT_SPEC_ID
              ? 'bg-[#18181b] text-white shadow-xs'
              : 'bg-white border border-[#e7e5e0] text-[#52525b] hover:border-[#a1a1aa]'
          }`}
        >
          {DEFAULT_SPEC_ID} (Baseline Demo)
        </button>

        {currentSpecId !== DEFAULT_SPEC_ID && currentSpecId !== '0b60bff5d312' && currentSpecId !== 'b1e0205a4909' && currentSpecId !== 'a003a9db5998' && currentSpecId !== 'b38ab2fac8a8' && (
          <span className="px-3 py-1.5 bg-[#18181b] text-white rounded-lg font-mono font-medium shadow-xs">
            {currentSpecId} (Active)
          </span>
        )}
      </div>

      {/* Action buttons: Lookup, Try Example, or Create Custom */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <form onSubmit={handleLookup} className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputSpecId}
            onChange={(e) => setInputSpecId(e.target.value)}
            placeholder="Spec ID (12 hex)..."
            className="w-28 sm:w-36 text-xs p-1.5 px-2.5 border border-[#e7e5e0] dark:border-[var(--border-color)] bg-white dark:bg-[var(--surface-elevated)] text-[#18181b] dark:text-[var(--text-primary)] rounded-md font-mono focus:outline-hidden focus:ring-1 focus:ring-[#18181b]"
          />
          <button
            type="submit"
            disabled={!inputSpecId.trim()}
            className="p-1.5 px-2.5 bg-white dark:bg-[var(--surface-elevated)] border border-[#e7e5e0] dark:border-[var(--border-color)] text-[#52525b] dark:text-[var(--text-secondary)] hover:text-[#18181b] dark:hover:text-[var(--text-primary)] rounded-md text-xs font-medium hover:bg-[#f4f4f5] dark:hover:bg-[var(--surface)] transition-colors disabled:opacity-40 cursor-pointer"
            title="Load Spec"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Try Demo 1 button */}
        <button
          onClick={() => openCreateModal('example1')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] dark:bg-amber-950/20 border border-[#d8c9a7] dark:border-amber-700/40 text-[#18181b] dark:text-[#F5F7F3] hover:bg-[#f3efdf] dark:hover:bg-amber-900/30 rounded-md font-medium transition-colors shadow-2xs cursor-pointer"
          title="Try Demo 1 (Software Delivery Agreement)"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#a89260] dark:text-[#D8C9A7]" />
          <span>Demo 1 (Software)</span>
        </button>

        {/* Try Demo 2 button */}
        <button
          onClick={() => openCreateModal('example2')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f7fa] dark:bg-sky-950/30 border border-[#a8c2d8] dark:border-sky-700/40 text-[#18181b] dark:text-[#F5F7F3] hover:bg-[#e7eff6] dark:hover:bg-sky-900/40 rounded-md font-medium transition-colors shadow-2xs cursor-pointer"
          title="Try Demo 2 (Cloud SLA Agreement)"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#3b7ea1] dark:text-[#38BDF8]" />
          <span>Demo 2 (Cloud SLA)</span>
        </button>

        {/* Try Demo 3 button — negative example with ambiguous clause */}
        <button
          onClick={() => onSelectSpecId('b38ab2fac8a8')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md font-medium transition-colors shadow-2xs cursor-pointer"
          title="View Demo 3: Ambiguous clause where Lock is blocked by red scenarios"
        >
          <BookOpen className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span>Demo 3 (Ambiguous ⚠)</span>
        </button>

        {/* Start Your Own button */}
        <button
          onClick={() => openCreateModal('custom')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[var(--surface-elevated)] border border-[#e7e5e0] dark:border-[var(--border-color)] text-[#18181b] dark:text-[var(--text-primary)] hover:bg-[#faf9f5] dark:hover:bg-[var(--surface)] rounded-md font-medium transition-colors shadow-2xs cursor-pointer"
          title="Draft a custom agreement spec from scratch"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Start Your Own</span>
        </button>
      </div>

      {/* Create Spec Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-[#e7e5e0] rounded-xl shadow-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f4f4f5]">
              <div>
                <h3 className="text-base font-bold text-[#18181b]">
                  {modalMode === 'example1'
                    ? 'Try Demo 1: Software Delivery Agreement'
                    : modalMode === 'example2'
                    ? 'Try Demo 2: Cloud Service Level Agreement (SLA)'
                    : 'Draft Custom Agreement Spec'}
                </h3>
                <p className="text-xs text-[#71717a] mt-0.5">
                  {modalMode === 'example1' || modalMode === 'example2'
                    ? 'Pre-filled with tested wording that pairs directly with tested scenario templates.'
                    : 'Propose an agreement clause with custom text and outcome labels.'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#a1a1aa] hover:text-[#18181b] p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f4f4f5] dark:bg-[var(--surface-elevated)] rounded-lg text-xs font-medium border border-transparent dark:border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => handleSelectTab('example1')}
                className={`flex-1 py-1.5 px-2.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  modalMode === 'example1'
                    ? 'bg-white dark:bg-[var(--surface)] text-[#18181b] dark:text-[var(--text-primary)] shadow-2xs font-semibold'
                    : 'text-[#71717a] dark:text-[var(--text-secondary)] hover:text-[#18181b] dark:hover:text-[var(--text-primary)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#a89260] dark:text-[#D8C9A7]" />
                <span>Demo 1 (Software)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('example2')}
                className={`flex-1 py-1.5 px-2.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  modalMode === 'example2'
                    ? 'bg-white dark:bg-[var(--surface)] text-[#18181b] dark:text-[var(--text-primary)] shadow-2xs font-semibold'
                    : 'text-[#71717a] dark:text-[var(--text-secondary)] hover:text-[#18181b] dark:hover:text-[var(--text-primary)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#3b7ea1] dark:text-[#38BDF8]" />
                <span>Demo 2 (Cloud SLA)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('custom')}
                className={`flex-1 py-1.5 px-2.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  modalMode === 'custom'
                    ? 'bg-white dark:bg-[var(--surface)] text-[#18181b] dark:text-[var(--text-primary)] shadow-2xs font-semibold'
                    : 'text-[#71717a] dark:text-[var(--text-secondary)] hover:text-[#18181b] dark:hover:text-[var(--text-primary)]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom</span>
              </button>
            </div>

            {modalMode === 'example1' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-950 space-y-1">
                <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ready-Made Demo 1 Specification</span>
                </div>
                <p className="text-amber-900/90 leading-relaxed font-sans">
                  This Software Delivery agreement has verified unambiguous phrasing. Once created on Studionet, invite Party B, and ensure <strong>both Party A and Party B</strong> each propose scenarios from their respective wallets (or use the 4 One-Click Scenario Templates across both wallets) so the on-chain lock rule is satisfied!
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSpecId('b1e0205a4909')
                      setShowCreateModal(false)
                    }}
                    className="text-amber-800 underline font-medium hover:text-amber-950 cursor-pointer"
                  >
                    Load Dual-Signed Demo 1 (b1e0205a4909) &rarr;
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'example2' && (
              <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-lg text-xs text-sky-950 space-y-1">
                <div className="font-semibold text-sky-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                  <span>Ready-Made Demo 2 Specification (Cloud SLA)</span>
                </div>
                <p className="text-sky-900/90 leading-relaxed font-sans">
                  This Cloud Service Level Agreement evaluates monthly uptime (&ge; 99.9%) and incident response times (&le; 1 hour). Each party proposes scenarios testing uptime breaches and response latencies to satisfy the multi-proposer lock rule.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSpecId('a003a9db5998')
                      setShowCreateModal(false)
                    }}
                    className="text-sky-800 underline font-medium hover:text-sky-950 cursor-pointer"
                  >
                    Load Locked & Adjudicated Demo 2 (a003a9db5998) &rarr;
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateSpec} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[#52525b] block mb-1">
                  Agreement Title (Max 200 chars)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Software Delivery Agreement"
                  maxLength={200}
                  className="w-full text-xs p-2.5 border border-[#d4d4d8] rounded-md font-sans bg-white focus:outline-hidden focus:ring-1 focus:ring-[#18181b]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#52525b] block mb-1">
                  Natural-Language Clause (Max 2000 chars)
                </label>
                <textarea
                  value={clause}
                  onChange={(e) => setClause(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="e.g. The contractor shall deliver the repository with pure ASCII code and passing tests within 7 calendar days of contract creation."
                  className="w-full text-xs p-2.5 border border-[#d4d4d8] rounded-md font-mono bg-white focus:outline-hidden focus:ring-1 focus:ring-[#18181b]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#52525b] block mb-1">
                  Allowed Outcome Labels (2 to 5 comma-separated)
                </label>
                <input
                  type="text"
                  value={labelsCsv}
                  onChange={(e) => setLabelsCsv(e.target.value)}
                  placeholder="DELIVERED, BREACH"
                  className="w-full text-xs p-2.5 border border-[#d4d4d8] rounded-md font-mono bg-white focus:outline-hidden focus:ring-1 focus:ring-[#18181b]"
                  required
                />
                <span className="text-[11px] text-[#a1a1aa] mt-1 block">
                  Upper-case alphanumeric tags only. UNDECIDABLE and UNRELIABLE are reserved.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#f4f4f5]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-[#e7e5e0] rounded-md text-xs font-medium text-[#52525b] hover:bg-[#f4f4f5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy || !account || !title.trim() || !clause.trim()}
                  className="px-4 py-1.5 bg-[#18181b] text-white rounded-md text-xs font-medium hover:bg-[#27272a] disabled:opacity-50 transition-all cursor-pointer"
                >
                  Create Spec on Studionet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
