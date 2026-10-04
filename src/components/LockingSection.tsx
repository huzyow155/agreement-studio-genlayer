import React from 'react'
import type { SpecRecord, SuiteReport } from '../types/contract'
import { useWallet } from '../context/WalletContext'
import { useTransaction } from '../context/TransactionContext'
import { submitSign, submitLock, getWriteClient, fetchSpec, fetchSuiteReport, fetchScenarioSuiteDigest } from '../services/contractService'
import { PenTool, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'

interface LockingSectionProps {
  spec: SpecRecord
  suiteReport: SuiteReport | null
  currentDigest?: string | null
  onSpecUpdated: (spec: SpecRecord) => void
  onSuiteReportUpdated?: (suiteReport: SuiteReport) => void
  onReload?: () => void
}

export const LockingSection: React.FC<LockingSectionProps> = ({
  spec,
  suiteReport,
  currentDigest,
  onSpecUpdated,
  onSuiteReportUpdated,
  onReload,
}) => {
  const { account, selectedWallet, requestAccountSwitch, openChooser } = useWallet()
  const { executeTransaction, isBusy } = useTransaction()

  const isLocked = spec.status === 'LOCKED'
  const isParty = account && spec.parties.some((p) => p.toLowerCase() === account.toLowerCase())

  const activeSuiteDigest = currentDigest || suiteReport?.scenario_suite_digest || spec.scenario_suite_digest || null

  const getPartyDigest = (p: string): string | null => {
    if (!spec.signed || Array.isArray(spec.signed)) return null
    const key = Object.keys(spec.signed).find((k) => k.toLowerCase() === p.toLowerCase())
    return key ? spec.signed[key] : null
  }

  const hasSignedAny = (p: string): boolean => {
    if (!spec.signed) return false
    if (Array.isArray(spec.signed)) {
      return spec.signed.some((s) => s.toLowerCase() === p.toLowerCase())
    }
    return Object.keys(spec.signed).some((k) => k.toLowerCase() === p.toLowerCase())
  }

  const hasSignedCurrent = (p: string): boolean => {
    if (!hasSignedAny(p)) return false
    const digest = getPartyDigest(p)
    if (activeSuiteDigest) {
      return Boolean(digest && digest === activeSuiteDigest)
    }
    if (suiteReport?.lock_problems?.some((prob) => prob.toLowerCase().includes(p.toLowerCase()) && prob.includes('must re-sign'))) {
      return false
    }
    if (spec.n_scenarios === 0) return true
    return false
  }

  const userSignedCurrent = Boolean(account && isParty && hasSignedCurrent(account))
  const userNeedsResign = Boolean(account && isParty && hasSignedAny(account) && !userSignedCurrent)

  const pendingParties = spec.parties.filter((p) => !hasSignedCurrent(p))
  const allPartiesSigned = spec.parties.length > 0 && pendingParties.length === 0
  const noRedScenarios = suiteReport ? suiteReport.red_scenarios.length === 0 && suiteReport.green_scenarios.length >= 4 : true
  const readyToLock = Boolean(suiteReport?.ready_to_lock && allPartiesSigned && noRedScenarios)

  const needsSwitchToOtherParty =
    !isLocked &&
    userSignedCurrent &&
    pendingParties.length > 0 &&
    account &&
    !pendingParties.some((p) => p.toLowerCase() === account.toLowerCase())

  const isExternalAccount = !isLocked && Boolean(account) && !isParty && pendingParties.length > 0

  const short = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '')

  const handleSign = async () => {
    if (!account || !selectedWallet) return

    const client = getWriteClient(account, selectedWallet.provider)
    await executeTransaction(
      userNeedsResign ? `Re-Sign Agreement Suite (v${spec.version})` : `Sign Agreement (v${spec.version})`,
      () => submitSign(client, spec.spec_id),
      async () => {
        const [updated, rep, liveDigest] = await Promise.all([
          fetchSpec(spec.spec_id),
          fetchSuiteReport(spec.spec_id),
          fetchScenarioSuiteDigest(spec.spec_id),
        ])
        if (updated) {
          const targetDigest = liveDigest || rep?.scenario_suite_digest || updated.scenario_suite_digest
          const signedMap = updated.signed || {}
          const userKey = Object.keys(signedMap).find((k) => k.toLowerCase() === account.toLowerCase())
          const userDigest = userKey ? (signedMap as any)[userKey] : null
          const signedCurrent = targetDigest ? userDigest === targetDigest : !!userKey

          if (signedCurrent) {
            if (targetDigest) {
              updated.scenario_suite_digest = targetDigest
            }
            onSpecUpdated(updated)
            if (rep && onSuiteReportUpdated) {
              onSuiteReportUpdated(rep)
            }
            if (onReload) onReload()
            return true
          }
        }
        return false
      },
      { specId: spec.spec_id }
    )
  }

  const handleLock = async () => {
    if (!account || !selectedWallet) return

    const client = getWriteClient(account, selectedWallet.provider)
    await executeTransaction(
      'Lock Agreement Spec',
      () => submitLock(client, spec.spec_id),
      async () => {
        const updated = await fetchSpec(spec.spec_id)
        if (updated && updated.status === 'LOCKED' && updated.spec_hash) {
          onSpecUpdated(updated)
          if (onReload) onReload()
          return true
        }
        return false
      },
      { specId: spec.spec_id }
    )
  }

  if (isLocked) {
    return (
      <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#18181b]">Agreement Spec is Locked</h3>
            <p className="text-xs text-[#71717a] mt-0.5">
              The clause and scenario suite are permanently frozen under digest{' '}
              <span className="font-mono font-medium text-[#18181b]">{spec.spec_hash}</span>.
              Counterparties can now stipulate facts for adjudication.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const formatLockProblem = (rawProblem: string): { title: string; description: string } => {
    if (rawProblem.includes('need at least 4 scenarios')) {
      return {
        title: 'Insufficient Scenarios',
        description: 'At least 4 adversarial edge cases are required before locking to ensure comprehensive test coverage.',
      }
    }
    if (rawProblem.includes('need at least 2 distinct expected labels')) {
      return {
        title: 'Diverse Outcomes Needed',
        description: 'Scenarios must test at least 2 distinct outcome labels (e.g., both DELIVERED and BREACH).',
      }
    }
    if (rawProblem.includes('party has proposed no scenario')) {
      const addr = rawProblem.split(': ')[1] || ''
      return {
        title: 'Counterparty Proposal Required (Contract Rule)',
        description: `Each registered party must propose at least one scenario before locking can succeed. Missing contribution from ${short(addr)}. Switch wallet to ${short(addr)} and submit an edge-case scenario.`,
      }
    }
    if (rawProblem.includes('party has not signed')) {
      const addr = rawProblem.split(': ')[1] || ''
      return {
        title: 'Pending Dual Signature',
        description: `Both counterparties must sign clause v${spec.version}. Waiting for signature from ${short(addr)}. Switch wallet to ${short(addr)} to sign.`,
      }
    }
    if (rawProblem.includes('must re-sign')) {
      const match = rawProblem.match(/party\s+(0x[a-fA-F0-9]+)\s+must re-sign/i)
      const addr = match ? match[1] : ''
      return {
        title: 'Re-Signature Required (Suite Changed)',
        description: `The scenario suite changed after signing. Party ${short(addr)} must re-sign the updated scenario suite before locking.`,
      }
    }
    if (rawProblem.includes('not run at current version')) {
      return {
        title: 'Stale Scenarios',
        description: `${rawProblem}. Click "Run Consensus" to validate against clause v${spec.version}.`,
      }
    }
    if (rawProblem.includes('is red')) {
      return {
        title: 'Ambiguity or Mismatch',
        description: `${rawProblem}. Amend clause wording or adjust scenarios so all tests reach green consensus.`,
      }
    }
    if (rawProblem.includes('no canary scenario available')) {
      return {
        title: 'Canary Allocation',
        description: 'A non-anchor scenario must be available for dynamic canary tamper detection during adjudication.',
      }
    }
    return {
      title: 'Condition Pending',
      description: rawProblem,
    }
  }

  const walletName = selectedWallet?.info?.name || 'Wallet'

  return (
    <div className="bg-white border border-[#e7e5e0] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-base font-bold text-[#18181b]">Dual Signatures & Spec Locking</h3>
        <p className="text-xs text-[#71717a] mt-0.5">
          All counterparties must sign version {spec.version}. Locking is only permitted once every adversarial scenario evaluates to green and each party has proposed at least one scenario.
        </p>
      </div>

      {/* Account switch prompt when Party B signature is needed */}
      {needsSwitchToOtherParty && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Clause v{spec.version} still requires signature from{' '}
              <strong>Party B ({short(pendingParties[0])})</strong>. Switch {walletName} account or switch to counterparty wallet extension to sign.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={requestAccountSwitch}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium rounded-lg border border-amber-300 transition-colors cursor-pointer text-xs"
            >
              Switch Account in {walletName}
            </button>
            <button
              type="button"
              onClick={openChooser}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 font-medium rounded-lg border border-amber-300 transition-colors cursor-pointer text-xs"
            >
              Switch Wallet Extension
            </button>
          </div>
        </div>
      )}

      {isExternalAccount && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              Connected as {short(account)}. To sign or lock, switch {walletName} to registered party{' '}
              <strong>{short(pendingParties[0])}</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={requestAccountSwitch}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-medium rounded-lg border border-blue-300 transition-colors cursor-pointer text-xs"
            >
              Switch Account in {walletName}
            </button>
            <button
              type="button"
              onClick={openChooser}
              className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 font-medium rounded-lg border border-blue-300 transition-colors cursor-pointer text-xs"
            >
              Switch Wallet Extension
            </button>
          </div>
        </div>
      )}

      {/* Plain-Language Explanation of Why Lock is Disabled */}
      {!readyToLock && suiteReport?.lock_problems && suiteReport.lock_problems.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5 text-xs text-amber-950">
          <div className="font-semibold flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Why is Lock disabled? Complete these steps first:</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {suiteReport.lock_problems.map((problem, i) => {
              const info = formatLockProblem(problem)
              return (
                <div key={i} className="flex items-start gap-2 pl-1 font-sans">
                  <span className="text-amber-600 font-bold leading-relaxed">•</span>
                  <div>
                    <strong className="text-amber-900 font-semibold">{info.title}:</strong>{' '}
                    <span className="text-amber-800/90 leading-relaxed">{info.description}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scenario Suite Digest & Counterparty Signature Binding Transparency */}
      <div className="p-4 bg-[#faf9f5] border border-[#e7e5e0] rounded-xl space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#e7e5e0] pb-2.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#18181b]" />
            <span className="font-semibold text-[#18181b]">Scenario Suite Binding Digest:</span>
          </div>
          <span className="font-mono text-[11px] font-medium text-[#18181b] bg-white px-2.5 py-1 rounded border border-[#e4e4e7] truncate max-w-full sm:max-w-xs" title={activeSuiteDigest || ''}>
            {activeSuiteDigest ? activeSuiteDigest : 'Computing on-chain digest...'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {spec.parties.map((p, idx) => {
            const digest = getPartyDigest(p)
            const isSignedCurrent = hasSignedCurrent(p)
            const hasSigned = hasSignedAny(p)
            const isMe = account && account.toLowerCase() === p.toLowerCase()
            return (
              <div key={p} className="p-2.5 bg-white border border-[#e7e5e0] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono font-medium text-[#18181b]">
                      Party {idx === 0 ? 'A' : 'B'} ({short(p)})
                    </span>
                    {isMe && (
                      <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-[#18181b] text-white">
                        You
                      </span>
                    )}
                  </div>
                  {isSignedCurrent ? (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Matches Suite
                    </span>
                  ) : hasSigned ? (
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Stale (Re-sign)
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#71717a] bg-[#f4f4f5] px-2 py-0.5 rounded-full font-medium">
                      Unsigned
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-[#71717a] flex items-center justify-between border-t border-[#f4f4f5] pt-1">
                  <span className="text-[10px] uppercase font-sans text-[#a1a1aa]">Stored:</span>
                  <span className={isSignedCurrent ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                    {digest ? `${digest.slice(0, 10)}...${digest.slice(-6)}` : 'None'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#faf9f5] border border-[#e7e5e0] rounded-xl">
        {/* Sign Status */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#18181b]">Your Signature Status</div>
          <div className="text-xs text-[#71717a]">
            {!account ? (
              'Connect wallet to sign'
            ) : !isParty ? (
              'You are not a registered party for this spec'
            ) : userNeedsResign ? (
              <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Scenario suite changed &mdash; re-signature required
              </span>
            ) : userSignedCurrent ? (
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Signed for clause v{spec.version} &amp; current suite
              </span>
            ) : (
              <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Signature required for clause v{spec.version}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Sign Button */}
          {isParty && !userSignedCurrent && (
            <button
              onClick={handleSign}
              disabled={isBusy}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#18181b] text-white hover:bg-[#27272a] rounded-lg text-xs font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{userNeedsResign ? 'Re-Sign Updated Suite' : `Sign Clause v${spec.version}`}</span>
            </button>
          )}

          {/* Lock Button */}
          <button
            onClick={handleLock}
            disabled={isBusy || !readyToLock || !isParty}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-xs cursor-pointer ${
              readyToLock && isParty
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-[#f4f4f5] text-[#a1a1aa] border border-[#e4e4e7] cursor-not-allowed'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Agreement Spec</span>
          </button>
        </div>
      </div>
    </div>
  )
}
