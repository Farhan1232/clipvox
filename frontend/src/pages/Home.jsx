import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Scissors, Sparkles, FileImage, Image,
  Film, Sliders, Music2, Clapperboard,
  Link2, Globe, FileText, ArrowRight,
  Shield, Zap, Lock, CheckCircle2, Star, Mail
} from 'lucide-react'

/* ─── Tool data ────────────────────────────────── */
const IMAGE_TOOLS = [
  {
    to: '/background-remover', icon: Scissors, label: 'Background Remover',
    desc: 'Remove any background instantly using a real AI model running in your browser. Export as transparent PNG. No uploads.',
    accent: '#7c3aed', accentBg: '#f3e8ff', pill: 'Real AI · Browser Only',
    features: ['AI-powered segmentation', 'Transparent PNG export', 'Before/After slider', 'Files never leave device'],
  },
  {
    to: '/image-enhancer', icon: Sparkles, label: 'Image Enhancer',
    desc: 'Upscale up to 4×, sharpen, adjust brightness, contrast and saturation with a live before/after preview.',
    accent: '#7c3aed', accentBg: '#f3e8ff', pill: '4× Upscale · Live Preview',
    features: ['2× / 4× upscale', 'Sharpening filter', 'Live before/after', 'Lossless JPEG export'],
  },
  {
    to: '/image-to-pdf', icon: FileImage, label: 'Image to PDF',
    desc: 'Combine any number of JPG, PNG or WebP images into a perfectly sized PDF. Drag to reorder. Runs in browser.',
    accent: '#7c3aed', accentBg: '#f3e8ff', pill: 'Browser-side · Instant',
    features: ['Batch upload', 'Drag to reorder', 'A4 / Letter / Custom', 'Zero server upload'],
  },
]

const VIDEO_TOOLS = [
  {
    to: '/video-compressor', icon: Film, label: 'Video Compressor',
    desc: 'Compress video file size by up to 90% without visible quality loss. Smart presets for WhatsApp, Instagram, YouTube.',
    accent: '#2563eb', accentBg: '#eff6ff', pill: 'Server-side · No Watermark',
    features: ['Up to 90% smaller', 'Social media presets', 'Quality control', 'H.264 / H.265'],
  },
  {
    to: '/quality-changer', icon: Sliders, label: 'Video Quality Changer',
    desc: 'Change video resolution from 360p all the way to 4K. Choose codec, bitrate and frame rate. One-click platform presets.',
    accent: '#2563eb', accentBg: '#eff6ff', pill: '360p → 4K',
    features: ['360p / 720p / 1080p / 4K', 'H.264 / H.265 / VP9', 'Custom FPS & bitrate', 'Platform presets'],
  },
  {
    to: '/add-music', icon: Music2, label: 'Add Music to Video',
    desc: 'Upload a video and an audio file. Overlay, replace or mute original audio. Control volume, fade in/out, loop.',
    accent: '#2563eb', accentBg: '#eff6ff', pill: 'Mix · Fade · Loop',
    features: ['Overlay or replace', 'Volume mixing', 'Fade in / fade out', 'Auto-loop audio'],
  },
  {
    to: '/video-to-gif', icon: Clapperboard, label: 'Video to GIF',
    desc: 'Convert any video clip to a high-quality shareable GIF. Trim start time, set duration, FPS and width.',
    accent: '#2563eb', accentBg: '#eff6ff', pill: 'High Quality · Shareable',
    features: ['Trim any clip', 'Custom FPS (5–24)', 'Optimised palette', 'No watermark'],
  },
]

const FILE_TOOLS = [
  {
    to: '/pdf-merger', icon: Link2, label: 'PDF Merger',
    desc: 'Merge multiple PDF files into one. Drag to reorder documents. Runs entirely in your browser — no uploads.',
    accent: '#059669', accentBg: '#ecfdf5', pill: 'Browser-side · Unlimited',
    features: ['Unlimited PDFs', 'Drag to reorder', 'No file size cap', 'Zero upload'],
  },
  {
    to: '/html-to-pdf', icon: Globe, label: 'HTML to PDF',
    desc: 'Convert any HTML file or webpage code to a clean PDF document. Renders exactly as it looks in the browser.',
    accent: '#059669', accentBg: '#ecfdf5', pill: 'Browser Render · Accurate',
    features: ['Paste or upload HTML', 'Accurate rendering', 'Full page capture', 'Instant download'],
  },
  {
    to: '/word-to-pdf', icon: FileText, label: 'Word to PDF',
    desc: 'Convert Microsoft Word (.docx) files to PDF. Preserves formatting, headings, tables and images.',
    accent: '#059669', accentBg: '#ecfdf5', pill: 'DOCX → PDF',
    features: ['Preserves formatting', 'Tables & images', 'No Microsoft Word needed', 'Fast conversion'],
  },
  {
    to: '/pdf-to-word', icon: FileText, label: 'PDF to Word',
    desc: 'Convert PDF files to editable Microsoft Word documents. Extract text and structure for easy editing.',
    accent: '#059669', accentBg: '#ecfdf5', pill: 'PDF → DOCX',
    features: ['Editable Word output', 'Text extraction', 'Structure preserved', 'Download DOCX'],
  },
]

const MARQUEE_ITEMS = [
  'Free Tools', 'No Watermarks', 'No Account', 'Privacy First',
  'Browser-side PDF', 'Real AI Background Removal',
  'Dark & Light Mode', 'No File Limits', 'Free Forever', 'Made in Lahore, Pakistan',
]

/* ─── Tool card ────────────────────────────────── */
function ToolCard({ tool }) {
  const { isDark } = useTheme()
  const { to, icon: Icon, label, desc, accent, accentBg, pill, features } = tool
  return (
    <Link to={to} className="tool-card group block">
      {/* Colored top accent */}
      <div className="tool-card-header" style={{ background: `linear-gradient(135deg, ${accent}dd, ${accent}88)` }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-end justify-between w-full">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon size={24} className="text-white" />
          </div>
          <span className="text-[10px] font-bold text-white/80 bg-white/20 px-2.5 py-1 rounded-full">
            {pill}
          </span>
        </div>
      </div>

      <div className="tool-card-body">
        <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</h3>
        <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
        <ul className="space-y-1.5 mb-4">
          {features.map(f => (
            <li key={f} className={`flex items-center gap-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <CheckCircle2 size={11} style={{ color: accent, flexShrink: 0 }} />
              {f}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1 text-sm font-semibold transition-all group-hover:gap-2"
          style={{ color: accent }}>
          Open Tool <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  )
}

/* ─── Section block ────────────────────────────── */
function Section({ id, icon: Icon, title, subtitle, tools, accent, dividerColor }) {
  const { isDark } = useTheme()
  return (
    <section id={id} className="mb-20">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg,${accent}22,${accent}44)` }}>
          <Icon size={22} style={{ color: accent }} />
        </div>
        <div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
          <div className="h-1 w-12 rounded-full mt-2" style={{ background: accent }} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {tools.map(t => <ToolCard key={t.to} tool={t} />)}
      </div>
      {tools.length === 5 && (
        /* 5-column special case for video tools */
        <div className="mt-5">
          <ToolCard tool={tools[4]} />
        </div>
      )}
    </section>
  )
}

export default function Home() {
  const { isDark } = useTheme()
  const heroBg = isDark ? 'bg-[#07071a]' : 'bg-gradient-to-br from-slate-50 via-violet-50/50 to-blue-50/50'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#07071a]' : 'bg-[#f5f5ff]'}`}>

      {/* ─── Hero ────────────────────────────────── */}
      <section className={`relative pt-24 pb-20 px-4 sm:px-6 overflow-hidden ${heroBg}`}>
        {/* Subtle orbs */}
        {isDark && <>
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </>}

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 anim-fade
            ${isDark ? 'bg-white/8 text-slate-300 border border-white/10' : 'bg-violet-50 text-violet-700 border border-violet-200'}`}>
            <Zap size={12} className="shrink-0" />
            <span className="hidden sm:inline">Free Tools · No Account · No Watermarks · Made in Lahore, Pakistan</span>
            <span className="sm:hidden">Free Tools · No Watermarks · Lahore, Pakistan</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight mb-6 anim-up
            ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Every Media Tool<br />
            <span className="g-text">You Will Ever Need</span>
          </h1>

          <p className={`text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto anim-up d-2 px-4 sm:px-0
            ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Remove backgrounds with real AI, enhance image quality, convert files,
            compress videos, add music — all completely <strong>free</strong>, all <strong>private</strong>,
            zero watermarks.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-12 anim-up d-3 px-4 sm:px-0">
            <Link to="/background-remover"
              className="btn btn-primary btn-lg shadow-xl justify-center">
              <Scissors size={18} /> Remove Background Free
            </Link>
            <Link to="/image-enhancer"
              className={`btn btn-outline btn-lg justify-center ${isDark ? 'text-white border-white/20 hover:bg-white/8' : ''}`}>
              <Sparkles size={18} /> Enhance an Image
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto anim-up d-5 w-full px-2 sm:px-0">
            {[
              { v: 'Free',  l: 'Forever',          icon: '✅' },
              { v: 'Zero',  l: 'Watermarks',       icon: '🛡️' },
              { v: '100%',  l: 'Private for PDF',  icon: '🔒' },
              { v: 'Real',  l: 'AI Onboard',       icon: '🤖' },
            ].map(({ v, l, icon }) => (
              <div key={l} className={`rounded-2xl p-5 text-center border ${isDark ? 'bg-white/4 border-white/8' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-black g-text">{v}</div>
                <div className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Marquee ─────────────────────────────── */}
      <div className={`marquee-wrap py-4 border-y ${isDark ? 'bg-[#0a0a20] border-white/6' : 'bg-white border-slate-200'}`}>
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <span key={i} className={`px-10 text-sm font-semibold whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              ✦ {t}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Tool Sections ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

        {/* Image Tools */}
        <section className="mb-20">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#f3e8ff,#ede9fe)' }}>
              <Image size={22} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Image Tools
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Enhance, convert and clean up your images — all browser-side, zero uploads
              </p>
              <div className="h-1 w-12 rounded-full mt-2 bg-violet-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {IMAGE_TOOLS.map(t => <ToolCard key={t.to} tool={t} />)}
          </div>
        </section>

        {/* Video Tools */}
        <section className="mb-20">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
              <Film size={22} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Video Tools
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Compress, convert, enhance and edit your videos — fast, server-side processing
              </p>
              <div className="h-1 w-12 rounded-full mt-2 bg-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VIDEO_TOOLS.map(t => <ToolCard key={t.to} tool={t} />)}
          </div>
        </section>

        {/* File Converter */}
        <section className="mb-16">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)' }}>
              <FileText size={22} style={{ color: '#059669' }} />
            </div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                File Converter
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Convert between PDF, Word, HTML and more — free, fast, no subscriptions
              </p>
              <div className="h-1 w-12 rounded-full mt-2 bg-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {FILE_TOOLS.map(t => <ToolCard key={t.to} tool={t} />)}
          </div>
        </section>
      </div>

      {/* ─── Why MediaForge ───────────────────────── */}
      <section className={`py-16 px-4 sm:px-6 ${isDark ? 'bg-[#0a0a20]' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Why <span className="g-text">MediaForge</span>?
            </h2>
            <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              We fixed every pain point users have with existing tools
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield,       title: 'Zero Watermarks',     desc: 'Every download is 100% clean. No premium needed.',            color: '#7c3aed' },
              { icon: Lock,         title: 'Privacy First',       desc: 'Image & PDF tools process in your browser. No uploads.',      color: '#2563eb' },
              { icon: Zap,          title: 'Lightning Fast',       desc: 'Fast server-side processing. Results in seconds.',            color: '#ea580c' },
              { icon: Star,         title: 'Real AI Included',     desc: 'Background removal uses an actual ML model, not a fake.',     color: '#f59e0b' },
              { icon: CheckCircle2, title: 'No Account, Ever',     desc: 'Open any tool, use it, download. Zero friction.',            color: '#059669' },
              { icon: Lock,         title: 'All Tools, One Site',   desc: 'Everything you need in one place — no account required.',   color: '#0891b2' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1
                  ${isDark ? 'bg-white/3 border-white/7 hover:border-white/14' : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18` }}>
                  <Icon size={19} style={{ color }} />
                </div>
                <h3 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact CTA ─────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-3xl p-10 text-center border ${isDark ? 'bg-[#0d0d25] border-white/8' : 'bg-white border-slate-200 shadow-lg'}`}>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Need a Custom Feature?
            </h2>
            <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Contact the developer directly for custom tool requests, new features or business enquiries.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="mailto:dartuveer@gmail.com"
                className="btn btn-primary">
                <Mail size={15} /> dartuveer@gmail.com
              </a>
            </div>
            <p className={`text-xs mt-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Based in Lahore, Pakistan · Available for custom tool development
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
