import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Zap, Mail, MapPin, Image, Video, FileText } from 'lucide-react'

const SECTIONS = [
  {
    label: 'Image Tools', icon: Image, color: '#7c3aed',
    tools: [
      { to: '/background-remover',       label: 'Background Remover' },
      { to: '/image-enhancer',           label: 'Image Enhancer' },
      { to: '/image-to-pdf',             label: 'Image to PDF' },
    ]
  },
  {
    label: 'Video Tools', icon: Video, color: '#2563eb',
    tools: [
      { to: '/video-compressor',         label: 'Video Compressor' },
      { to: '/quality-changer',          label: 'Video Quality Changer' },
      { to: '/add-music',                label: 'Add Music to Video' },
      { to: '/video-to-gif',             label: 'Video to GIF' },
    ]
  },
  {
    label: 'File Converter', icon: FileText, color: '#059669',
    tools: [
      { to: '/pdf-merger',   label: 'PDF Merger' },
      { to: '/html-to-pdf',  label: 'HTML to PDF' },
      { to: '/word-to-pdf',  label: 'Word to PDF' },
      { to: '/pdf-to-word',  label: 'PDF to Word' },
    ]
  },
]

export default function Footer() {
  const { isDark } = useTheme()

  const bg      = isDark ? 'bg-[#0a0a1f]' : 'bg-white'
  const border  = isDark ? 'border-white/8' : 'border-slate-200'
  const text    = isDark ? 'text-white' : 'text-slate-900'
  const sub     = isDark ? 'text-slate-400' : 'text-slate-500'
  const linkCls = isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'

  return (
    <footer className={`${bg} border-t ${border} mt-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand + Contact */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 w-fit">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                <Zap size={17} className="text-white" />
              </div>
              <span className={`text-xl font-black tracking-tight ${text}`}>
                Media<span className="g-text">Forge</span>
              </span>
            </Link>

            <p className={`text-sm leading-relaxed mb-6 max-w-xs ${sub}`}>
              Free professional media tools. No watermarks, no account required,
              no hidden fees. Privacy-first. Built for everyone.
            </p>

            {/* Promise pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['✦ Zero Watermarks', '✦ Free Forever', '✦ Privacy First'].map(t => (
                <span key={t} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isDark ? 'bg-white/8 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {t}
                </span>
              ))}
            </div>

            {/* Developer Contact */}
            <div className={`rounded-2xl border p-5 ${isDark ? 'bg-white/4 border-white/8' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${sub}`}>Developer Contact</p>
              <div className="space-y-2.5">
                <a href="mailto:dartuveer@gmail.com"
                  className={`flex items-center gap-2.5 text-sm transition-colors ${linkCls} hover:text-violet-500`}>
                  <Mail size={14} className="text-violet-500 shrink-0" />
                  dartuveer@gmail.com
                </a>
                <div className={`flex items-center gap-2.5 text-sm ${sub}`}>
                  <MapPin size={14} className="text-violet-500 shrink-0" />
                  Lahore, Pakistan
                </div>
              </div>
              <p className={`text-[11px] mt-3 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                For new feature requests, custom tools, or business inquiries — reach out anytime.
              </p>
            </div>
          </div>

          {/* Tool sections */}
          {SECTIONS.map(({ label, icon: Icon, color, tools }) => (
            <div key={label}>
              <div className="flex items-center gap-2 mb-4">
                <Icon size={15} style={{ color }} />
                <h3 className={`text-xs font-bold uppercase tracking-widest`} style={{ color }}>{label}</h3>
              </div>
              <ul className="space-y-2.5">
                {tools.map(({ to, label: tl }) => (
                  <li key={to}>
                    <Link to={to} className={`text-sm transition-colors ${linkCls}`}>{tl}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={`pt-6 border-t ${border} flex items-center justify-center`}>
          <p className={`text-xs ${sub}`}>
            © 2026 MediaForge. All rights reserved. Free forever.
          </p>
        </div>
      </div>
    </footer>
  )
}
