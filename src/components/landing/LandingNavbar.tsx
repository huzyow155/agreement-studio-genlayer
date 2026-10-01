import React, { useState, memo } from 'react'
import { ArrowUpRight, Menu, X, ExternalLink, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface LandingNavbarProps {
  onEnterApp: () => void
}

export const LandingNavbar: React.FC<LandingNavbarProps> = memo(({ onEnterApp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Protocol Story', href: '#story' },
    { label: 'Pillars', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Workbench', href: '#preview' },
  ]

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--nav-bg)] backdrop-blur-xl transition-colors duration-250">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#overview"
          onClick={(e) => handleLinkClick(e, '#overview')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] font-serif font-bold text-base tracking-tight shadow-xs transition-all group-hover:border-[var(--accent-champagne-border)]">
            AS
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base sm:text-lg tracking-tight text-[var(--text-primary)] transition-colors">
              Agreement Studio
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              Studionet
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="hover:text-[var(--text-primary)] transition-colors duration-200 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-champagne-border)] transition-all cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#D8C9A7] transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#626762] transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          <a
            href="https://github.com/huzyow155/agreement-studio-genlayer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5"
          >
            GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Primary CTA (Theme adaptive solid) */}
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#111311] text-[#F5F7F3] dark:bg-[#F5F7F3] dark:text-[#111311] hover:opacity-90 font-semibold text-xs sm:text-sm rounded-full shadow-md btn-luxury-cta cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch App</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu & Theme Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[#D8C9A7]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#626762]" />
            )}
          </button>

          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#111311] text-[#F5F7F3] dark:bg-[#F5F7F3] dark:text-[#111311] font-semibold text-xs rounded-full shadow-xs"
          >
            <span>App</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-color)] bg-[var(--surface)] px-4 py-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-medium text-[var(--text-secondary)]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-2 rounded-lg hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/huzyow155/agreement-studio-genlayer"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 text-[var(--text-muted)]"
            >
              GitHub Repository <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)]">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onEnterApp()
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#111311] text-[#F5F7F3] dark:bg-[#F5F7F3] dark:text-[#111311] font-semibold text-sm rounded-full shadow-md"
            >
              <span>Launch Studio App</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
})
