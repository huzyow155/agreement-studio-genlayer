import React, { useState, memo } from 'react'
import { ArrowUpRight, Menu, X, ExternalLink } from 'lucide-react'

interface LandingNavbarProps {
  onEnterApp: () => void
}

export const LandingNavbar: React.FC<LandingNavbarProps> = memo(({ onEnterApp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'The Problem', href: '#story' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Workbench Preview', href: '#preview' },
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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#overview"
          onClick={(e) => handleLinkClick(e, '#overview')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/[0.08] border border-white/20 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10">
            AS
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base sm:text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              Agreement Studio
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Studionet
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="hover:text-white transition-colors duration-200 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/huzyow155/agreement-studio-genlayer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
          >
            GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-xs sm:text-sm rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch App</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-950" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-zinc-950 font-semibold text-xs rounded-full shadow-sm"
          >
            <span>App</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-950" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#09090b]/95 backdrop-blur-2xl px-4 py-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-medium text-zinc-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/huzyow155/agreement-studio-genlayer"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg hover:bg-white/[0.05] hover:text-white transition-colors flex items-center gap-2 text-zinc-400"
            >
              GitHub Repository <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onEnterApp()
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-zinc-950 font-semibold text-sm rounded-full shadow-md"
            >
              <span>Launch Studio App</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-950" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
})
