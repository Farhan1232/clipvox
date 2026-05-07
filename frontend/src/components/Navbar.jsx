import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Zap, Sun, Moon, Menu, X, ChevronDown, Image, Video, FileText } from 'lucide-react'

const CATEGORIES = [
  {
    label: 'Image Tools', icon: Image, color: '#7c3aed', bg: '#f3e8ff',
    tools: [
      { to: '/background-remover', label: 'Background Remover', desc: 'Remove BG with AI' },
      { to: '/image-enhancer',     label: 'Image Enhancer',     desc: 'Upscale & sharpen' },
      { to: '/image-to-pdf',       label: 'Image to PDF',       desc: 'Combine images' },
    ]
  },
  {
    label: 'Video Tools', icon: Video, color: '#2563eb', bg: '#eff6ff',
    tools: [
      { to: '/video-compressor',   label: 'Video Compressor',   desc: 'Reduce file size' },
      { to: '/quality-changer',    label: 'Video Quality',      desc: '480p to 4K' },
      { to: '/add-music',          label: 'Add Music to Video', desc: 'Mix & overlay audio' },
      { to: '/video-to-gif',       label: 'Video to GIF',       desc: 'Create shareable GIFs' },
    ]
  },
  {
    label: 'File Converter', icon: FileText, color: '#059669', bg: '#ecfdf5',
    tools: [
      { to: '/pdf-merger',   label: 'PDF Merger',   desc: 'Combine PDFs' },
      { to: '/html-to-pdf',  label: 'HTML to PDF',  desc: 'Webpage to PDF' },
      { to: '/word-to-pdf',  label: 'Word to PDF',  desc: 'DOCX → PDF' },
      { to: '/pdf-to-word',  label: 'PDF to Word',  desc: 'PDF → DOCX' },
    ]
  },
]

export default function Navbar() {
  const { theme, toggle, isDark } = useTheme()
  const location = useLocation()
  const [scrolled, setScrolled]   = useState(false)
  const [openCat, setOpenCat]     = useState(null)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setOpenCat(null) }, [location.pathname])

  const navBg = scrolled
    ? isDark
      ? 'bg-[#07071a]/95 backdrop-blur-2xl border-b border-white/8 shadow-xl'
      : 'bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-md'
    : isDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-sm'

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-[18px] font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Clip<span className="g-text">Vox</span>
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="relative">
                <button
                  onClick={() => setOpenCat(openCat === cat.label ? null : cat.label)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${openCat === cat.label
                      ? isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-white/8' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}>
                  <cat.icon size={14} />
                  {cat.label}
                  <ChevronDown size={12} className={`transition-transform ${openCat === cat.label ? 'rotate-180' : ''}`} />
                </button>

                {openCat === cat.label && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenCat(null)} />
                    <div className={`absolute top-full left-0 mt-2 w-64 rounded-2xl border shadow-2xl z-50 p-2 overflow-hidden
                      ${isDark ? 'bg-[#0d0d25] border-white/10' : 'bg-white border-slate-200'}`}>
                      <div className="px-3 py-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: cat.color }}>{cat.label}</span>
                      </div>
                      {cat.tools.map(({ to, label, desc }) => (
                        <Link key={to} to={to}
                          className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                            ${location.pathname === to
                              ? '' : isDark
                                ? 'text-slate-300 hover:bg-white/6 hover:text-white'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          style={location.pathname === to ? { background: cat.bg, color: cat.color } : {}}>
                          <div>
                            <div className="text-sm font-semibold">{label}</div>
                            <div className="text-xs opacity-60 mt-0.5">{desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/8' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button onClick={() => setMenuOpen(o => !o)}
              className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all
                ${isDark ? 'text-slate-300 hover:bg-white/8' : 'text-slate-500 hover:bg-slate-100'}`}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-[700px]' : 'max-h-0'}`}>
        <div className={`px-4 pb-4 border-t ${isDark ? 'bg-[#07071a]/98 border-white/8' : 'bg-white border-slate-200'}`}>
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="mt-3">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                <cat.icon size={14} style={{ color: cat.color }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.color }}>
                  {cat.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {cat.tools.map(({ to, label }) => (
                  <Link key={to} to={to}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${location.pathname === to
                        ? '' : isDark
                          ? 'text-slate-300 hover:bg-white/6 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    style={location.pathname === to ? { background: cat.bg, color: cat.color } : {}}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
