import { useState } from 'react'
import axios from 'axios'
import { Clapperboard, Download, Settings2, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import DropZone from '../components/DropZone'

const FPS_OPTIONS   = [5, 10, 12, 15, 20, 24]
const WIDTH_OPTIONS = [240, 320, 480, 640, 800, 1080]
const MAX_DURATION  = 30

export default function VideoToGif() {
  const { isDark } = useTheme()
  const [file, setFile]       = useState(null)
  const [startSec, setStart]  = useState(0)
  const [duration, setDur]    = useState(5)
  const [fps, setFps]         = useState(12)
  const [width, setWidth]     = useState(480)
  const [loop, setLoop]       = useState(true)
  const [status, setStatus]   = useState('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  const convert = async () => {
    if (!file) return
    setStatus('processing'); setProgress(10); setError(''); setResult(null)

    const form = new FormData()
    form.append('video', file)
    form.append('start',    startSec.toString())
    form.append('duration', duration.toString())
    form.append('fps',      fps.toString())
    form.append('width',    width.toString())
    form.append('loop',     loop ? '0' : '1')

    try {
      const res = await axios.post('/api/gif', form, {
        responseType: 'blob',
        onUploadProgress: e => setProgress(10 + Math.round((e.loaded / e.total) * 30)),
      })
      setProgress(95)
      const blob = new Blob([res.data], { type: 'image/gif' })
      setResult({ url: URL.createObjectURL(blob), size: (blob.size / 1024).toFixed(0) })
      setProgress(100); setStatus('done')
    } catch {
      setError('Conversion failed. Please try a shorter clip or smaller width.')
      setStatus('error')
    }
  }

  const textColor = isDark ? 'text-white' : 'text-slate-900'
  const cardBg    = isDark ? 'bg-white/[0.03] border-white/7' : 'bg-white border-black/8'
  const labelColor = isDark ? 'text-slate-300' : 'text-slate-700'

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 sm:px-6 dot-grid ${isDark ? 'bg-[#030310]' : 'bg-[#f4f4fc]'}`}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
            <Clapperboard size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl font-black tracking-tight ${textColor}`}>Video → GIF</h1>
              <span className="pill pill-cyan">Smooth · High Quality</span>
            </div>
            <p className="text-sm dark:text-slate-400 text-slate-600 mt-1">
              Convert any video clip to a smooth, shareable GIF. Trim start, duration, set FPS and width.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Upload + preview */}
          <div className="lg:col-span-2 space-y-5">
            <DropZone
              onFiles={setFile}
              accept="video/mp4,video/webm,.mp4,.mov,.avi,.mkv,.webm"
              label="Drop your video here"
              sublabel="MP4 · MOV · AVI · MKV · WebM"
              icon={Clapperboard}
            />

            {file && (
              <div className={`rounded-2xl border p-4 flex items-center gap-4 ${cardBg}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(6,182,212,0.15)' }}>
                  <Clapperboard size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${textColor}`}>{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {/* GIF preview */}
            {result && (
              <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-white/6' : 'border-black/6'}`}>
                  <span className={`text-sm font-semibold ${textColor}`}>GIF Preview — {result.size} KB</span>
                </div>
                <div className="p-4 flex items-center justify-center min-h-[200px]"
                  style={{ backgroundImage: 'repeating-conic-gradient(#888 0% 25%, #fff 0% 50%)', backgroundSize: '14px 14px' }}>
                  <img src={result.url} alt="GIF" className="max-h-64 rounded-xl object-contain" />
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-5">
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <div className="flex items-center gap-2 mb-5">
                <Settings2 size={15} className="text-cyan-400" />
                <span className={`text-sm font-bold ${textColor}`}>GIF Settings</span>
              </div>

              {/* Start time */}
              <div className="mb-5">
                <div className="flex justify-between mb-1.5">
                  <span className={`text-xs font-semibold ${textColor}`}>Start Time</span>
                  <span className="text-xs font-mono text-cyan-400">{startSec}s</span>
                </div>
                <input type="range" min="0" max="300" step="1" value={startSec}
                  onChange={e => setStart(+e.target.value)} />
              </div>

              {/* Duration */}
              <div className="mb-5">
                <div className="flex justify-between mb-1.5">
                  <span className={`text-xs font-semibold ${textColor}`}>Duration</span>
                  <span className="text-xs font-mono text-cyan-400">{duration}s</span>
                </div>
                <input type="range" min="1" max={MAX_DURATION} step="1" value={duration}
                  onChange={e => setDur(+e.target.value)} />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>1s</span><span>Max {MAX_DURATION}s</span>
                </div>
              </div>

              {/* FPS */}
              <div className="s-row">
                <span className={`text-sm ${labelColor}`}>Frame Rate</span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {FPS_OPTIONS.map(f => (
                    <button key={f} onClick={() => setFps(f)}
                      className={`w-9 h-8 rounded-lg text-xs font-bold transition-all ${
                        fps === f ? 'bg-cyan-500 text-white' : isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-black/5'
                      }`}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Width */}
              <div className="s-row">
                <span className={`text-sm ${labelColor}`}>Width</span>
                <select value={width} onChange={e => setWidth(+e.target.value)} className="sel">
                  {WIDTH_OPTIONS.map(w => <option key={w} value={w}>{w}px</option>)}
                </select>
              </div>

              {/* Loop */}
              <div className="s-row border-0">
                <span className={`text-sm ${labelColor}`}>Loop</span>
                <button onClick={() => setLoop(l => !l)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${loop ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${loop ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Tip */}
              <div className={`flex gap-2 mt-3 p-3 rounded-xl ${isDark ? 'bg-white/3' : 'bg-slate-50'} border ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400">
                  Lower FPS = smaller file. 10-15 FPS is ideal for sharing. Max 30s clip for best results.
                </p>
              </div>
            </div>

            <button onClick={convert} disabled={!file || status === 'processing'}
              className="btn-forge w-full justify-center py-3.5 rounded-2xl text-base disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#0891b2,#0284c7)' }}>
              {status === 'processing'
                ? <><Loader2 size={16} className="animate-spin" /> Converting…</>
                : <><Clapperboard size={16} /> Convert to GIF</>
              }
            </button>

            {status === 'processing' && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Converting to GIF…</span><span>{progress}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            {status === 'done' && result && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">GIF ready — {result.size} KB</span>
                </div>
                <a href={result.url} download="mediaforge.gif"
                  className="btn w-full justify-center py-2.5 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                  <Download size={15} /> Download GIF
                </a>
              </div>
            )}

            {status === 'error' && (
              <div className="flex gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
