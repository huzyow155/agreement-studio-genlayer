import React from 'react'
import { useWallet } from '../context/WalletContext'
import { useTheme } from '../context/ThemeContext'
import { CONTRACT_ADDRESS, STUDIONET_EXPLORER_URL } from '../config/chain'
import { ExternalLink, Wallet, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react'

interface HeaderProps {
  onOpenHowItWorks: () => void
  onNavigateHome?: () => void
  isAppRoute?: boolean
}

export const Header: React.FC<HeaderProps> = ({ onOpenHowItWorks, onNavigateHome, isAppRoute }) => {
  const { walletState, account, openChooser, disconnectWallet, switchToStudionet } = useWallet()
  const { theme, toggleTheme } = useTheme()

  const shortAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <header className="border-b border-[var(--border-color)] bg-[var(--nav-bg)] backdrop-blur sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand & Home Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          {isAppRoute && onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer flex items-center gap-1 text-xs sm:text-sm font-medium"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </button>
          )}

          <div
            onClick={onNavigateHome}
            className={`flex items-center gap-2.5 ${onNavigateHome ? 'cursor-pointer' : ''}`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] font-serif font-bold text-base tracking-tight shadow-xs transition-all group-hover:border-[var(--accent-champagne-border)]">
              AS
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl text-[var(--text-primary)] tracking-tight">Agreement Studio</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-[var(--text-secondary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded">
                Studionet
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm sm:text-base font-medium text-[var(--text-secondary)]">
            <button
              onClick={onOpenHowItWorks}
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              How it works
            </button>
          </nav>
        </div>

        {/* Right side: Theme Toggle, Explorer utility link & Wallet connection */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-champagne-border)] transition-all cursor-pointer shadow-xs shrink-0"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#D8C9A7] transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#626762] transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {/* Quiet Compact Explorer Utility Link */}
          <a
            href={`${STUDIONET_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface)] border border-[var(--border-color)] px-2.5 py-1 rounded-md transition-colors shadow-2xs"
            title={`ClauseLab Contract: ${CONTRACT_ADDRESS}`}
          >
            <span>Explorer</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
          </a>

          {/* Wrong Chain Alert */}
          {walletState === 'WRONG_CHAIN' && (
            <button
              onClick={switchToStudionet}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Switch to Studionet</span>
            </button>
          )}

          {/* Connected State */}
          {walletState === 'CONNECTED' && account ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border-color)] px-3 py-1.5 rounded-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-mono font-medium text-[var(--text-primary)]">
                  {shortAddress(account)}
                </span>
              </div>
              <button
                onClick={openChooser}
                className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] bg-[var(--surface)] px-2.5 py-1.5 rounded-md hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                title="Switch active wallet extension or account"
              >
                Switch Wallet
              </button>
              <button
                onClick={disconnectWallet}
                className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] bg-[var(--surface)] px-2.5 py-1.5 rounded-md hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            /* Disconnected / Connecting State */
            <button
              onClick={openChooser}
              disabled={walletState === 'CONNECTING'}
              className="flex items-center gap-2 bg-[#18181b] text-white dark:bg-[#F5F7F3] dark:text-[#111311] hover:opacity-90 px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{walletState === 'CONNECTING' ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
