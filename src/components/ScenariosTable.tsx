import React, { useState } from 'react'
import type { SpecRecord, ScenarioRecord, SuiteReport } from '../types/contract'
import { useWallet } from '../context/WalletContext'
import { useTransaction } from '../context/TransactionContext'
import {
  submitAddScenario,
  submitRunScenario,
  getWriteClient,
  fetchScenario,
  fetchSuiteReport,
  fetchSpec
} from '../services/contractService'
import { Play, Plus, AlertCircle, CheckCircle2, Clock, ShieldAlert, Info, Sparkles } from 'lucide-react'

const SCENARIO_TEMPLATES = [
  {
    title: 'On-time Delivery',
    text: 'Contractor delivers the complete repository with pure ASCII code and all passing tests on day 2.',
    expected: 'DELIVERED',
  },
  {
    title: 'Passing CI Submission',
    text: 'Contractor submits pull request containing complete repository with passing tests on day 5, verified by test suite.',
    expected: 'DELIVERED',
  },
  {
    title: 'Ghosting / No Delivery',
    text: 'Contractor disappears for 3 weeks and delivers nothing.',
    expected: 'BREACH',
  },
  {
    title: 'Late Missing Files',
    text: 'Contractor sends an email saying done with no files attached 10 days later, exceeding deadline.',
    expected: 'BREACH',
  },
]

interface ScenariosTableProps {
  spec: SpecRecord
  scenarios: ScenarioRecord[]
  suiteReport: SuiteReport | null
  onScenarioAdded: (scenario: ScenarioRecord) => void
  onScenarioUpdated: (scenario: ScenarioRecord) => void
  onSuiteReportUpdated: (report: SuiteReport) => void
  onSpecReload: () => void
}

export const ScenariosTable: React.FC<ScenariosTableProps> = ({
  spec,
  scenarios,
  suiteReport,
  onScenarioAdded,
  onScenarioUpdated,
  onSuiteReportUpdated,
  onSpecReload,
}) => {
  const { account, selectedWallet } = useWallet()
  const { executeTransaction, isBusy } = useTransaction()

  const [isAdding, setIsAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [newExpected, setNewExpected] = useState(spec.labels[0] || 'DELIVERED')

  const isLocked = spec.status === 'LOCKED'
  const isParty = account && spec.parties.some((p) => p.toLowerCase() === account.toLowerCase())

  const handleApplyTemplate = (tpl: typeof SCENARIO_TEMPLATES[0]) => {
    setIsAdding(true)
    setNewText(tpl.text)
    const match = spec.labels.find((l) => l.toUpperCase() === tpl.expected.toUpperCase())
    if (match) {
      setNewExpected(match)
    } else if (spec.labels.length > 0) {
      setNewExpected(spec.labels[0])
    }
  }

  const handleAddScenario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || !selectedWallet || !newText.trim()) return

    const client = getWriteClient(account, selectedWallet.provider)
    await executeTransaction(
      'Add Edge-Case Scenario',
      () => submitAddScenario(client, spec.spec_id, newText.trim(), newExpected),
      async () => {
        const nextSpec = await fetchSpec(spec.spec_id)
        if (nextSpec && nextSpec.n_scenarios > spec.n_scenarios) {
          const newSc = await fetchScenario(spec.spec_id, nextSpec.n_scenarios)
          if (newSc) {
            onScenarioAdded(newSc)
            const rep = await fetchSuiteReport(spec.spec_id)
            if (rep) onSuiteReportUpdated(rep)
            setNewText('')
            setIsAdding(false)
            onSpecReload()
            return true
          }
        }
        return false
      },
      { specId: spec.spec_id }
    )
  }

  const handleRunScenario = async (n: number) => {
    if (!account || !selectedWallet) return

    const client = getWriteClient(account, selectedWallet.provider)
    await executeTransaction(
      `Run Validator Consensus (Scenario #${n})`,
      () => submitRunScenario(client, spec.spec_id, n),
      async () => {
        const updatedSc = await fetchScenario(spec.spec_id, n)
        if (updatedSc && updatedSc.ran_version === spec.version) {
          onScenarioUpdated(updatedSc)
          const rep = await fetchSuiteReport(spec.spec_id)
          if (rep) onSuiteReportUpdated(rep)
          return true
        }
        return false
      },
      { specId: spec.spec_id }
    )
  }

  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f4f4f5]">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-[#18181b]">
            Adversarial Scenarios ({scenarios.length})
          </h3>
          <p className="text-sm text-[#71717a] mt-1">
            Counterparties test hypothetical edge cases against the clause using GenLayer validator consensus.
          </p>
        </div>

        {!isLocked && isParty && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#18181b] text-white hover:bg-[#27272a] rounded-lg text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Cancel' : 'Propose Scenario'}</span>
          </button>
        )}
      </div>

      {/* 1-Click Scenario Templates */}
      {!isLocked && isParty && (
        <div className="p-3.5 sm:p-4 bg-[#faf9f5] border border-[#e7e5e0] rounded-xl space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="text-xs font-semibold text-[#18181b] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#a89260]" />
              <span>One-Click Scenario Templates</span>
            </div>
            <span className="text-[11px] text-[#71717a]">
              Pre-fill known edge cases to reach 4 green consensus scenarios quickly
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-0.5">
            {SCENARIO_TEMPLATES.map((tpl) => (
              <button
                key={tpl.title}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e7e5e0] hover:border-[#18181b] rounded-lg text-xs text-[#18181b] font-medium transition-colors shadow-2xs cursor-pointer group"
              >
                <span>{tpl.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f4f4f5] text-[#52525b] border border-[#e4e4e7] group-hover:bg-[#18181b] group-hover:text-white transition-colors">
                  {tpl.expected}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Scenario Form */}
      {isAdding && (
        <form onSubmit={handleAddScenario} className="p-4 sm:p-5 bg-[#faf9f5] border border-[#e7e5e0] rounded-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#18181b]">Propose Edge Case Scenario</h4>
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-[#71717a]">
              <span className="font-medium text-[#52525b] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#a89260]" />
                Template:
              </span>
              {SCENARIO_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2 py-0.5 rounded bg-white border border-[#e7e5e0] hover:border-[#18181b] text-[11px] text-[#18181b] font-medium transition-colors cursor-pointer"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#71717a] block mb-1.5">
              Hypothetical Situation (Max 600 chars)
            </label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={2}
              maxLength={600}
              placeholder="e.g. Contractor delivers files on day 4 without formal email confirmation..."
              className="w-full text-sm p-3 border border-[#d4d4d8] rounded-lg bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-[#18181b]"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-[#52525b]">Expected Label:</label>
              <select
                value={newExpected}
                onChange={(e) => setNewExpected(e.target.value)}
                className="text-xs sm:text-sm font-medium border border-[#d4d4d8] rounded-lg bg-white px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[#18181b]"
              >
                {spec.labels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isBusy || !newText.trim()}
              className="px-4 py-2 bg-[#18181b] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#27272a] transition-all disabled:opacity-50 cursor-pointer"
            >
              Submit to Spec
            </button>
          </div>
        </form>
      )}

      {/* Scenarios Matrix */}
      <div className="space-y-3.5">
        {scenarios.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[#e7e5e0] rounded-xl text-sm text-[#71717a]">
            No scenarios added yet. Parties must add at least 4 scenarios before locking.
          </div>
        ) : (
          scenarios.map((sc) => {
            const isStale = sc.ran_version !== spec.version
            const isGreen = !isStale && sc.matches === true
            const isRed = !isStale && sc.matches === false
            const isUndecidable = sc.label === 'UNDECIDABLE'

            let statusPill = (
              <span className="text-xs sm:text-sm font-sans px-2.5 py-1 rounded-full bg-[#f4f4f5] text-[#71717a] inline-flex items-center gap-1.5 border border-[#e4e4e7]">
                <Clock className="w-3.5 h-3.5" />
                {isStale ? `Stale (Ran on v${sc.ran_version})` : 'Unrun'}
              </span>
            )

            if (isGreen) {
              statusPill = (
                <span className="text-xs sm:text-sm font-sans px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Green (Consensus Matches)
                </span>
              )
            } else if (isRed) {
              statusPill = (
                <span className="text-xs sm:text-sm font-sans px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {isUndecidable ? 'Red (UNDECIDABLE Ambiguity)' : 'Red (Mismatch)'}
                </span>
              )
            }

            return (
              <div
                key={sc.n}
                className={`p-4 sm:p-5 border rounded-xl transition-all space-y-3 ${
                  isRed
                    ? 'border-red-200 bg-red-50/20'
                    : isGreen
                    ? 'border-[#e7e5e0] bg-white'
                    : 'border-[#e7e5e0] bg-[#faf9f5]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm sm:text-base text-[#18181b]">Scenario #{sc.n}</span>
                    <span className="text-[#a1a1aa]">&bull;</span>
                    <span className="text-[#71717a] font-mono text-xs sm:text-sm">By {short(sc.proposer)}</span>
                  </div>
                  <div>{statusPill}</div>
                </div>

                {/* Scenario text - Enlarged and high-readability */}
                <p className="text-sm sm:text-base font-mono text-[#18181b] leading-relaxed select-text font-normal">
                  &ldquo;{sc.text}&rdquo;
                </p>

                {/* Expected vs Consensus classification */}
                <div className="pt-2.5 border-t border-[#f4f4f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs sm:text-sm font-mono flex-wrap">
                    <span>
                      Expected: <strong className="text-[#18181b] font-semibold">{sc.expected}</strong>
                    </span>
                    <span className="text-[#d4d4d8]">&bull;</span>
                    <span>
                      Validator Consensus:{' '}
                      {sc.label ? (
                        <strong
                          className={
                            isUndecidable
                              ? 'text-red-600 font-bold'
                              : isGreen
                              ? 'text-emerald-700 font-bold'
                              : 'text-amber-700 font-bold'
                          }
                        >
                          {sc.label}
                        </strong>
                      ) : (
                        <em className="text-[#a1a1aa]">Not evaluated</em>
                      )}
                    </span>
                  </div>

                  {!isLocked && isParty && (
                    <button
                      onClick={() => handleRunScenario(sc.n)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#18181b] rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isStale || !sc.label ? 'Run Consensus' : 'Re-Run Consensus'}</span>
                    </button>
                  )}
                </div>

                {/* Educational Guided Path for Red / UNDECIDABLE */}
                {isRed && (
                  <div className="mt-3 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-start gap-2.5 text-xs text-amber-950">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <span>{isUndecidable ? 'Clause Ambiguity Detected' : 'Consensus Discrepancy'}</span>
                        <span className="font-normal text-[11px] text-amber-700">(Guided Next Step)</span>
                      </div>
                      <p className="text-amber-900/90 leading-relaxed font-sans">
                        {isUndecidable
                          ? 'This is expected when a clause is ambiguous or lacks clear objective criteria. Use "Amend Clause" above to clarify wording, then re-run your scenarios.'
                          : 'Validator consensus differed from the expected outcome. Review the clause wording or expected outcome, amend the clause if needed, and re-run consensus.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Suite Report & Lock Prerequisites Checklist */}
      {suiteReport && (
        <div className="p-4 sm:p-5 bg-[#faf9f5] border border-[#e7e5e0] rounded-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-semibold text-[#18181b] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#71717a]" />
              Spec Lock Prerequisites
            </h4>
            <span
              className={`text-xs sm:text-sm font-medium px-2.5 py-1 rounded-full ${
                suiteReport.ready_to_lock
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-zinc-200 text-zinc-700'
              }`}
            >
              {suiteReport.ready_to_lock ? 'Ready to Lock' : 'Conditions Pending'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm font-mono text-center">
            <div className="bg-white p-3 border border-[#e7e5e0] rounded-lg">
              <div className="text-xs text-[#71717a]">Total Scenarios</div>
              <div className="font-bold text-sm sm:text-base text-[#18181b] mt-1">
                {suiteReport.total_scenarios} / 4 min
              </div>
            </div>
            <div className="bg-white p-3 border border-[#e7e5e0] rounded-lg">
              <div className="text-xs text-[#71717a]">Green Consensus</div>
              <div className="font-bold text-sm sm:text-base text-emerald-700 mt-1">
                {suiteReport.green_scenarios.length}
              </div>
            </div>
            <div className="bg-white p-3 border border-[#e7e5e0] rounded-lg">
              <div className="text-xs text-[#71717a]">Red Scenarios</div>
              <div
                className={`font-bold text-sm sm:text-base mt-1 ${
                  suiteReport.red_scenarios.length > 0 ? 'text-red-600' : 'text-[#71717a]'
                }`}
              >
                {suiteReport.red_scenarios.length}
              </div>
            </div>
            <div className="bg-white p-3 border border-[#e7e5e0] rounded-lg">
              <div className="text-xs text-[#71717a]">Distinct Labels</div>
              <div className="font-bold text-sm sm:text-base text-[#18181b] mt-1">
                {Object.keys(suiteReport.label_distribution || {}).length} / 2 min
              </div>
            </div>
          </div>

          {/* Missing conditions reported by the contract */}
          {suiteReport.lock_problems && suiteReport.lock_problems.length > 0 && !isLocked && (
            <div className="text-xs sm:text-sm text-[#71717a] space-y-1 pt-1.5 border-t border-[#e7e5e0]">
              <div className="font-medium text-[#52525b]">Unsatisfied Lock Conditions:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-amber-900 font-mono">
                {suiteReport.lock_problems.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
