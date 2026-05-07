import { useState } from 'react'
import axios from 'axios'
import DropZone from '../components/DropZone'
import { Film, Download, Settings2, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'

const PRESETS = [
  { label: 'WhatsApp',    icon: '📱', crf: 28, preset: 'fast',    maxSize: '16MB' },
  { label: 'Instagram',  icon: '📷', crf: 23, preset: 'medium',  maxSize: '100MB' },
  { label: 'YouTube',    icon: '▶️', crf: 18, preset: 'slow',    maxSize: 'Unlimited' },
  { label: 'Twitter/X',  icon: '𝕏',  crf: 26, preset: 'fast',    maxSize: '512MB' },
  { label: 'Email',      icon: '📧', crf: 32, preset: 'veryfast', maxSize: '25MB' },
  { label: 'Custom',     icon: '⚙️', crf: null, preset: null,    maxSize: '' },
]

const QUALITY_LABELS = ['', 'Very Low', 'Low', 'Medium', 'Good', 'Great', 'Excellent', 'Lossless']

export default function VideoCompressor() {
  const [file, setFile] = useState(null)
  const [preset, setPreset] = useState(PRESETS[1])
  const [crf, setCrf] = useState(23)
  const [speed, setSpeed] = useState('medium')
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)  // { url, originalSize, newSize }
  const [error, setError] = useState('')

  const selectPreset = (p) => {
    setPreset(p)
    if (p.crf) setCrf(p.crf)
    if (p.preset) setSpeed(p.preset)
  }

  const qualityLabel = () => {
    if (crf <= 15) return QUALITY_LABELS[7]
    if (crf <= 18) return QUALITY_LABELS[6]
    if (crf <= 22) return QUALITY_LABELS[5]
    if (crf <= 26) return QUALITY_LABELS[4]
    if (crf <= 30) return QUALITY_LABELS[3]
    if (crf <= 35) return QUALITY_LABELS[2]
    return QUALITY_LABELS[1]
  }

  const qualityColor = () => {
    if (crf <= 18) return 'text-emerald-400'
    if (crf <= 26) return 'text-cyan-400'
    if (crf <= 32) return 'text-amber-400'
    return 'text-red-400'
  }

  const compress = async () => {
    if (!file) return
    setStatus('processing')
    setProgress(10)
    setError('')
    setResult(null)

    const form = new FormData()
    form.append('video', file)
    form.append('crf', crf.toString())
    form.append('preset', speed)

    try {
      const res = await axios.post('/api/compress', form, {
        responseType: 'blob',
        onUploadProgress: e => setProgress(10 + Math.round((e.loaded / e.total) * 30)),
      })
      setProgress(90)
      const blob = new Blob([res.data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const origSize = (file.size / 1024 / 1024).toFixed(2)
      const newSize = (blob.size / 1024 / 1024).toFixed(2)
      setResult({ url, origSize, newSize, saved: (((file.size - blob.size) / file.size) * 100).toFixed(1) })
      setProgress(100)
      setStatus('done')
    } catch {
      setError('Compression failed. Please check your file and try again.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#0891b2,#2563eb)' }}>
              <Film size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold dark:text-white text-slate-900">Video Compressor</h1>
              <p className="text-sm dark:text-slate-400 text-slate-600 truncate">Smart compression · No quality loss · No watermarks</p>
            </div>
          </div>
          <div className="h-px w-full dark:bg-white/5 bg-black/5 mt-4" />
        </div>

        {/* Social presets */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => selectPreset(p)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  preset.label === p.label
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'dark:border-white/10 border-black/10 dark:text-slate-300 text-slate-600 dark:hover:border-violet-500/50 hover:border-violet-500/50'
                }`}
              >
                <span>{p.icon}</span> {p.label}
                {p.maxSize && <span className="text-[10px] opacity-60">({p.maxSize})</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Upload */}
          <div className="lg:col-span-2 space-y-5">
            <DropZone
              onFiles={setFile}
              accept="video/mp4,video/webm,video/mov,video/avi,video/mkv,.mp4,.mov,.avi,.mkv,.webm"
              label="Drop your video here or click to browse"
              sublabel="MP4 · MOV · AVI · MKV · WebM supported"
              icon={Film}
            />

            {file && (
              <div className="rounded-2xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <Film size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type.split('/')[1].toUpperCase()}
                  </p>
                </div>
                {result && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">Reduced by</p>
                    <p className="text-lg font-bold text-emerald-400">{result.saved}%</p>
                  </div>
                )}
              </div>
            )}

            {/* Before/After */}
            {result && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Original Size', value: `${result.origSize} MB`, color: 'text-red-400' },
                  { label: 'Compressed',    value: `${result.newSize} MB`, color: 'text-emerald-400' },
                  { label: 'Space Saved',   value: `${result.saved}%`,    color: 'text-cyan-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white p-4 text-center">
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-slate-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-5">
            <div className="rounded-2xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white p-5">
              <div className="flex items-center gap-2 mb-5">
                <Settings2 size={16} className="text-cyan-400" />
                <span className="text-sm font-bold dark:text-white text-slate-800">Compression Settings</span>
              </div>

              {/* CRF */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm dark:text-slate-300 text-slate-700">Quality (CRF)</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${qualityColor()}`}>{qualityLabel()}</span>
                    <span className="text-xs text-slate-400 font-mono">{crf}</span>
                  </div>
                </div>
                <input
                  type="range" min="10" max="45" value={crf}
                  onChange={e => { setCrf(+e.target.value); setPreset(PRESETS[5]) }}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Highest Quality</span><span>Smallest Size</span>
                </div>
              </div>

              {/* Speed */}
              <div className="settings-row">
                <span className="text-sm dark:text-slate-300 text-slate-700">Speed</span>
                <select value={speed} onChange={e => { setSpeed(e.target.value); setPreset(PRESETS[5]) }}
                  className="forge-select dark:text-white text-slate-800">
                  {['ultrafast','superfast','veryfast','faster','fast','medium','slow','slower','veryslow'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Info tip */}
              <div className="flex gap-2 mt-4 p-3 rounded-xl dark:bg-white/3 bg-gray-50 border dark:border-white/5 border-black/5">
                <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lower CRF = better quality, bigger file. CRF 23 is ideal for most uses. Slower speed = smaller file size.
                </p>
              </div>
            </div>

            <button
              onClick={compress}
              disabled={!file || status === 'processing'}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {status === 'processing'
                  ? <><Loader2 size={16} className="animate-spin" /> Compressing…</>
                  : <><Film size={16} /> Compress Video</>
                }
              </span>
            </button>

            {status === 'processing' && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Processing your video…</span><span>{progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            {status === 'done' && result && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Compressed! Saved {result.saved}%</span>
                </div>
                <a href={result.url} download="mediaforge-compressed.mp4" className="btn-primary w-full justify-center"
                  style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                  <span className="flex items-center gap-2"><Download size={16} /> Download Video</span>
                </a>
              </div>
            )}

            {status === 'error' && (
              <div className="flex gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
