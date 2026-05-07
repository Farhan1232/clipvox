import { useState } from 'react'
import api from '../utils/api'
import { Wand2, Download, Film, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import DropZone from '../components/DropZone'

export default function VideoWatermarkRemover() {
  const { isDark } = useTheme()
  const [file, setFile]     = useState(null)
  const [x, setX]           = useState('10')
  const [y, setY]           = useState('10')
  const [w, setW]           = useState('200')
  const [h, setH]           = useState('60')
  const [method, setMethod] = useState('blur')
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')

  // Parse coordinate string to int, fallback to 0
  const num = (v, fallback = 0) => { const n = parseInt(v, 10); return isNaN(n) ? fallback : n }

  const process = async () => {
    if (!file) return
    setStatus('processing'); setProgress(10); setError(''); setResult(null)

    const form = new FormData()
    form.append('video', file)
    form.append('x', num(x));  form.append('y', num(y))
    form.append('w', num(w, 1)); form.append('h', num(h, 1))
    form.append('method', method)

    try {
      const res = await api.post('/api/remove-video-watermark', form, {
        responseType: 'blob',
        onUploadProgress: e => setProgress(10 + Math.round((e.loaded / e.total) * 35)),
      })
      setProgress(95)
      const blob = new Blob([res.data], { type: 'video/mp4' })
      setResult(URL.createObjectURL(blob))
      setProgress(100); setStatus('done')
    } catch {
      setError('Processing failed. Check watermark coordinates and try again.')
      setStatus('error')
    }
  }

  const card = isDark ? 'bg-[#111130] border-white/8' : 'bg-white border-slate-200'
  const text  = isDark ? 'text-white' : 'text-slate-900'
  const sub   = isDark ? 'text-slate-400' : 'text-slate-500'

  const NumInput = ({ label, value, onChange, max = 9999 }) => (
    <div className="flex items-center justify-between py-2">
      <span className={`text-sm font-medium ${text}`}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9]/g, '')
            onChange(raw)
          }}
          onBlur={e => {
            const n = Math.min(Math.max(parseInt(e.target.value, 10) || 0, 0), max)
            onChange(String(n))
          }}
          placeholder="0"
          className="w-20 px-2 py-1.5 rounded-lg border text-sm text-center font-mono outline-none"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f8f8ff', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0', color: isDark ? 'white' : '#1e293b' }}
        />
        <span className={`text-xs ${sub}`}>px</span>
      </div>
    </div>
  )

  return (
    <div className={`page-bg px-4 sm:px-6 ${isDark ? 'bg-[#07071a]' : 'bg-[#f5f5ff]'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="page-header">
          <div className="page-header-icon" style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)' }}>
            <Wand2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl font-black tracking-tight ${text}`}>Video Watermark Remover</h1>
              <span className="pill pill-blue">FFmpeg Powered</span>
            </div>
            <p className={`text-sm mt-1 ${sub}`}>
              Specify the watermark position on your video. FFmpeg will blur or reconstruct that area in every frame.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <DropZone
              onFiles={setFile}
              accept="video/mp4,video/webm,.mp4,.mov,.avi,.mkv"
              label="Drop your video here"
              sublabel="MP4 · MOV · AVI · MKV · WebM"
              icon={Film}
              className={file ? 'dz-video-loaded' : ''}
            />

            {file && (
              <div className="file-row">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(37,99,235,0.12)' }}>
                  <Film size={18} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${text}`}>{file.name}</p>
                  <p className={`text-xs ${sub}`}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {/* Visual guide */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-3 ${text}`}>Watermark Position Guide</h3>
              <div className="relative rounded-xl overflow-hidden border" style={{ height: '160px', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', background: isDark ? 'rgba(255,255,255,0.04)' : '#f8f8ff' }}>
                <div className="absolute text-[10px] font-mono" style={{ color: 'var(--text-muted)', top: 4, left: 4 }}>
                  (0,0)
                </div>
                <div className="absolute text-[10px] font-mono" style={{ color: 'var(--text-muted)', bottom: 4, right: 4 }}>
                  (video width, height)
                </div>
                {/* Watermark indicator */}
                <div
                  className="absolute rounded border-2 border-dashed border-red-400 bg-red-400/15 flex items-center justify-center"
                  style={{
                    left: `${(num(x) / 1920) * 100}%`,
                    top: `${(num(y) / 1080) * 100}%`,
                    width: `${Math.max(num(w), 1) / 1920 * 100}%`,
                    height: `${Math.max(num(h), 1) / 1080 * 100}%`,
                    minWidth: 20, minHeight: 10,
                  }}>
                  <span className="text-red-500 text-[8px] font-bold">WATERMARK</span>
                </div>
              </div>
              <p className={`text-[11px] mt-2 ${sub}`}>
                Assumes 1920×1080 resolution for the preview. Enter actual pixel coordinates from your video.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-4 ${text}`}>Watermark Coordinates</h3>

              <div className={`divide-y ${isDark ? 'divide-white/6' : 'divide-slate-100'}`}>
                <NumInput label="X (left edge)" value={x} onChange={setX} />
                <NumInput label="Y (top edge)"  value={y} onChange={setY} />
                <NumInput label="Width"         value={w} onChange={setW} />
                <NumInput label="Height"        value={h} onChange={setH} />
              </div>

              <div className="mt-4">
                <p className={`text-xs font-semibold mb-2 ${text}`}>Removal Method</p>
                <div className="space-y-2">
                  {[
                    { v: 'blur',   l: 'Blur',   d: 'Blurs the watermark area (recommended)' },
                    { v: 'delogo', l: 'Delogo',  d: 'FFmpeg delogo filter (edge-blend)' },
                  ].map(({ v, l, d }) => (
                    <label key={v}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                        ${method === v
                          ? isDark ? 'border-blue-500 bg-blue-500/10' : 'border-blue-300 bg-blue-50'
                          : isDark ? 'border-white/6 hover:border-white/12' : 'border-slate-200 hover:border-slate-300'
                        }`}>
                      <input type="radio" name="method" value={v} checked={method === v}
                        onChange={() => setMethod(v)} className="mt-0.5 accent-blue-500" />
                      <div>
                        <p className={`text-xs font-semibold ${text}`}>{l}</p>
                        <p className={`text-[11px] ${sub}`}>{d}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={`flex gap-2 mt-4 p-3 rounded-xl text-[11px] ${isDark ? 'bg-white/4 text-slate-400' : 'bg-blue-50 text-blue-700'}`}>
                <Info size={11} className="shrink-0 mt-0.5" />
                Tip: Use a media player or image editor to find the exact pixel coordinates of the watermark in your video.
              </div>
            </div>

            <button onClick={process} disabled={!file || status === 'processing'}
              className="btn btn-video w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'processing'
                ? <><Loader2 size={16} className="animate-spin" /> Removing Watermark…</>
                : <><Wand2 size={16} /> Remove Video Watermark</>
              }
            </button>

            {status === 'processing' && (
              <div>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-sub)' }}>
                  <span>Processing with FFmpeg…</span><span>{progress}%</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#2563eb,#0891b2)' }} />
                </div>
              </div>
            )}

            {status === 'done' && result && (
              <div className="alert-success">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Watermark removed!</p>
                  <a href={result} download="clipvox-clean-video.mp4"
                    className="btn mt-2 text-xs py-2 text-white rounded-xl"
                    style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                    <Download size={13} /> Download Clean Video
                  </a>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="alert-error">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
