import { useState } from 'react'
import axios from 'axios'
import DropZone from '../components/DropZone'
import { Sliders, Download, Settings2, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react'

const RESOLUTIONS = [
  { label: '360p',  value: '360',  w: 640,  h: 360,  desc: 'Low data usage',      color: 'text-slate-400' },
  { label: '480p',  value: '480',  w: 854,  h: 480,  desc: 'SD · WhatsApp',       color: 'text-amber-400' },
  { label: '720p',  value: '720',  w: 1280, h: 720,  desc: 'HD · Recommended',    color: 'text-cyan-400' },
  { label: '1080p', value: '1080', w: 1920, h: 1080, desc: 'Full HD · YouTube',   color: 'text-violet-400' },
  { label: '1440p', value: '1440', w: 2560, h: 1440, desc: '2K · High quality',   color: 'text-emerald-400' },
  { label: '4K',    value: '2160', w: 3840, h: 2160, desc: 'Ultra HD',             color: 'text-rose-400' },
]

const CODECS = [
  { value: 'libx264', label: 'H.264 (Most Compatible)', desc: 'Works on all devices and platforms' },
  { value: 'libx265', label: 'H.265 / HEVC (50% smaller)', desc: 'Smaller files, modern devices' },
  { value: 'libvpx-vp9', label: 'VP9 (Web optimized)', desc: 'Best for web/YouTube streaming' },
]

const SOCIAL_PRESETS = [
  { label: 'WhatsApp',   icon: '📱', res: '480',  codec: 'libx264', fps: 30  },
  { label: 'Instagram',  icon: '📷', res: '1080', codec: 'libx264', fps: 30  },
  { label: 'YouTube',    icon: '▶️', res: '1080', codec: 'libx264', fps: 60  },
  { label: 'TikTok',     icon: '🎵', res: '1080', codec: 'libx264', fps: 30  },
  { label: 'Twitter/X',  icon: '𝕏',  res: '720',  codec: 'libx264', fps: 30  },
  { label: 'LinkedIn',   icon: '💼', res: '1080', codec: 'libx264', fps: 30  },
]

export default function QualityChanger() {
  const [file, setFile]         = useState(null)
  const [resolution, setRes]    = useState('1080')
  const [codec, setCodec]       = useState('libx264')
  const [fps, setFps]           = useState(30)
  const [bitrate, setBitrate]   = useState('')
  const [status, setStatus]     = useState('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')

  const applyPreset = (p) => {
    setRes(p.res); setCodec(p.codec); setFps(p.fps)
  }

  const process = async () => {
    if (!file) return
    setStatus('processing'); setProgress(10); setError(''); setResult(null)

    const form = new FormData()
    form.append('video', file)
    form.append('resolution', resolution)
    form.append('codec', codec)
    form.append('fps', fps.toString())
    if (bitrate) form.append('bitrate', bitrate)

    try {
      const res = await axios.post('/api/quality', form, {
        responseType: 'blob',
        onUploadProgress: e => setProgress(10 + Math.round((e.loaded / e.total) * 35)),
      })
      setProgress(95)
      const blob = new Blob([res.data], { type: 'video/mp4' })
      setResult({ url: URL.createObjectURL(blob), size: (blob.size / 1024 / 1024).toFixed(2) })
      setProgress(100); setStatus('done')
    } catch {
      setError('Processing failed. Please try a different file or settings.')
      setStatus('error')
    }
  }

  const selectedRes = RESOLUTIONS.find(r => r.value === resolution)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
              <Sliders size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold dark:text-white text-slate-900">Quality Changer</h1>
              <p className="text-sm dark:text-slate-400 text-slate-600 truncate">Change resolution · codec · frame rate · bitrate</p>
            </div>
          </div>
          <div className="h-px w-full dark:bg-white/5 bg-black/5 mt-4" />
        </div>

        {/* Social presets */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Platform Presets</p>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border dark:border-white/10 border-black/10 dark:text-slate-300 text-slate-600 dark:hover:border-emerald-500/50 hover:border-emerald-500/50 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200">
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Upload + resolution picker */}
          <div className="lg:col-span-2 space-y-5">
            <DropZone
              onFiles={setFile}
              accept="video/mp4,video/webm,.mp4,.mov,.avi,.mkv,.webm"
              label="Drop your video here or click to browse"
              sublabel="MP4 · MOV · AVI · MKV · WebM"
              icon={Sliders}
            />

            {/* Resolution grid */}
            <div>
              <p className="text-sm font-semibold dark:text-white text-slate-800 mb-3">Target Resolution</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {RESOLUTIONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRes(r.value)}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      resolution === r.value
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'dark:border-white/5 border-black/5 dark:bg-white/3 bg-white dark:hover:border-white/15 hover:border-black/15'
                    }`}
                  >
                    <span className={`text-2xl font-black ${resolution === r.value ? 'gradient-text' : r.color}`}>
                      {r.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{r.w}×{r.h}</span>
                    <span className="text-[10px] text-slate-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedRes && (
              <div className="flex items-center gap-3 p-4 rounded-xl dark:bg-white/3 bg-gray-50 border dark:border-white/5 border-black/5">
                <Zap size={16} className="text-violet-400 shrink-0" />
                <p className="text-sm text-slate-400">
                  Output will be <strong className="text-violet-400">{selectedRes.w}×{selectedRes.h}</strong> pixels
                  · {selectedRes.desc} · {fps} fps
                </p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-5">
            <div className="rounded-2xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white p-5">
              <div className="flex items-center gap-2 mb-5">
                <Settings2 size={16} className="text-emerald-400" />
                <span className="text-sm font-bold dark:text-white text-slate-800">Advanced Settings</span>
              </div>

              {/* Codec */}
              <div className="mb-4">
                <p className="text-sm dark:text-slate-300 text-slate-700 mb-2">Video Codec</p>
                <div className="space-y-2">
                  {CODECS.map(c => (
                    <label key={c.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        codec === c.value
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'dark:border-white/5 border-black/5 dark:hover:border-white/15 hover:border-black/10'
                      }`}
                    >
                      <input type="radio" name="codec" value={c.value} checked={codec === c.value}
                        onChange={e => setCodec(e.target.value)} className="mt-0.5 accent-emerald-500" />
                      <div>
                        <p className="text-xs font-semibold dark:text-white text-slate-800">{c.label}</p>
                        <p className="text-[11px] text-slate-400">{c.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* FPS */}
              <div className="settings-row">
                <span className="text-sm dark:text-slate-300 text-slate-700">Frame Rate</span>
                <select value={fps} onChange={e => setFps(+e.target.value)}
                  className="forge-select dark:text-white text-slate-800">
                  {[24, 25, 30, 48, 60, 120].map(f => (
                    <option key={f} value={f}>{f} fps</option>
                  ))}
                </select>
              </div>

              {/* Custom bitrate */}
              <div className="settings-row">
                <span className="text-sm dark:text-slate-300 text-slate-700">Bitrate (optional)</span>
                <input
                  type="text" placeholder="e.g. 2M"
                  value={bitrate} onChange={e => setBitrate(e.target.value)}
                  className="forge-select w-24 dark:text-white text-slate-800 dark:bg-slate-800 border dark:border-slate-700 border-slate-200"
                />
              </div>
            </div>

            <button onClick={process} disabled={!file || status === 'processing'}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
              <span className="flex items-center gap-2">
                {status === 'processing'
                  ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                  : <><Sliders size={16} /> Change Quality</>
                }
              </span>
            </button>

            {status === 'processing' && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Re-encoding video…</span><span>{progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            {status === 'done' && result && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Done! Output: {result.size} MB</span>
                </div>
                <a href={result.url} download="clipvox-quality.mp4"
                  className="btn-primary w-full justify-center"
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
