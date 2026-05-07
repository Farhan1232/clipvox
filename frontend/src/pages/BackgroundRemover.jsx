import { useState, useRef } from 'react'
import { Scissors, Download, Upload, RefreshCw, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function BackgroundRemover() {
  const { isDark } = useTheme()
  const [original, setOriginal] = useState(null)  // { url, file }
  const [result, setResult]     = useState(null)  // blob URL of PNG
  const [status, setStatus]     = useState('idle')
  const [stage, setStage]       = useState('')
  const [sliderX, setSliderX]   = useState(50)
  const [dragging, setDragging] = useState(false)
  const inputRef  = useRef(null)
  const containerRef = useRef(null)

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setOriginal({ url: URL.createObjectURL(file), file })
    setResult(null)
    setStatus('idle')
    setSliderX(50)
  }

  const onDrop = (e) => {
    e.preventDefault()
    loadFile(e.dataTransfer.files[0])
  }

  const process = async () => {
    if (!original) return
    setStatus('processing')
    setStage('Loading AI model (first time may take 30s)…')

    try {
      const { removeBackground } = await import('@imgly/background-removal')
      setStage('Analysing image…')
      const blob = await removeBackground(original.file, { debug: false })
      setStage('Finalising…')
      setResult(URL.createObjectURL(blob))
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  /* Before/after slider mouse handling */
  const onMouseDown = () => setDragging(true)
  const onMouseMove = (e) => {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setSliderX(x)
  }
  const onMouseUp = () => setDragging(false)

  const onTouchMove = (e) => {
    if (!containerRef.current) return
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100))
    setSliderX(x)
  }

  const textColor = isDark ? 'text-white' : 'text-slate-900'
  const subColor  = isDark ? 'text-slate-400' : 'text-slate-500'
  const cardBg    = isDark ? 'bg-white/[0.03] border-white/7' : 'bg-white border-black/8'

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 sm:px-6 dot-grid ${isDark ? 'bg-[#030310]' : 'bg-[#f4f4fc]'}`}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#f97316,#f43f5e)' }}>
            <Scissors size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl font-black tracking-tight ${textColor}`}>Background Remover</h1>
              <span className="pill pill-orange">Real AI · Browser-Only</span>
              <span className="pill pill-green"><Shield size={10} /> 100% Private</span>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Uses a real AI model running in your browser — images never leave your device.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — upload + result */}
          <div className="lg:col-span-3 space-y-5">

            {/* Upload zone */}
            {!original && (
              <div
                className="drop-zone min-h-[280px] p-8"
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => loadFile(e.target.files[0])} />
                <div className="flex flex-col items-center gap-4 pointer-events-none">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.2),rgba(244,63,94,0.2))' }}>
                    <Upload size={32} className="text-orange-400" />
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${textColor}`}>Drop an image or click to browse</p>
                    <p className="text-sm text-slate-400 mt-1">JPG · PNG · WebP · AVIF</p>
                  </div>
                </div>
              </div>
            )}

            {/* Before/After */}
            {original && (
              <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className={`px-4 py-3 border-b flex items-center justify-between
                  ${isDark ? 'border-white/6' : 'border-black/6'}`}>
                  <span className={`text-sm font-semibold ${textColor}`}>
                    {result ? 'Before / After — drag slider' : 'Original'}
                  </span>
                  <button onClick={() => { setOriginal(null); setResult(null); setStatus('idle') }}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                    <RefreshCw size={11} /> New image
                  </button>
                </div>

                {result ? (
                  /* Slider comparison */
                  <div ref={containerRef} className="ba-container select-none"
                    style={{ height: '380px' }}
                    onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                    onTouchMove={onTouchMove}>

                    {/* Checkered bg for transparent */}
                    <div className="absolute inset-0"
                      style={{ backgroundImage: 'repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%)', backgroundSize: '20px 20px' }} />

                    {/* Result (after) — full width */}
                    <img src={result} alt="Result" className="absolute inset-0 w-full h-full object-contain" draggable={false} />

                    {/* Original (before) — clipped to left of slider */}
                    <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderX}%` }}>
                      <img src={original.url} alt="Original" className="absolute inset-0 h-full object-contain"
                        style={{ width: `${100 * 100 / sliderX}%`, maxWidth: 'none' }} draggable={false} />
                    </div>

                    {/* Handle */}
                    <div className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
                      style={{ left: `${sliderX}%`, transform: 'translateX(-50%)', width: '40px', zIndex: 20 }}
                      onMouseDown={onMouseDown}>
                      <div className="w-0.5 h-full bg-white/80 absolute" />
                      <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center relative z-10">
                        <span className="text-slate-700 text-sm font-bold select-none">⟺</span>
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg">BEFORE</div>
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg">AFTER</div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <img src={original.url} alt="Original" className="max-h-56 max-w-full object-contain rounded-xl" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — controls */}
          <div className="lg:col-span-2 space-y-4">

            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-bold mb-4 ${textColor}`}>How It Works</h3>
              {[
                { n: '1', t: 'AI Model', d: 'Downloads a real segmentation model (~30MB, cached after first use)' },
                { n: '2', t: 'In-Browser', d: 'Model runs entirely in your browser — your images never leave your device' },
                { n: '3', t: 'Transparent PNG', d: 'Output is a high-quality PNG with transparency' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-3 mb-4 last:mb-0">
                  <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg,#f97316,#f43f5e)' }}>{n}</div>
                  <div>
                    <p className={`text-xs font-semibold ${textColor}`}>{t}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Remove button */}
            {original && status !== 'done' && (
              <button onClick={process} disabled={status === 'processing'}
                className="btn-forge w-full justify-center py-3.5 text-base rounded-2xl disabled:opacity-50">
                {status === 'processing'
                  ? <><Loader2 size={17} className="animate-spin" /> Processing…</>
                  : <><Scissors size={17} /> Remove Background</>
                }
              </button>
            )}

            {status === 'processing' && (
              <div className={`p-4 rounded-xl border ${cardBg}`}>
                <p className="text-xs text-slate-400 mb-2">{stage}</p>
                <div className="progress-track">
                  <div className="progress-fill animate-pulse" style={{ width: '70%' }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">First run downloads ~30MB model. Cached afterwards.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">Processing failed. Try a different image format (JPG/PNG).</p>
              </div>
            )}

            {result && (
              <>
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Background removed!</span>
                  </div>
                  <a href={result} download="mediaforge-no-bg.png"
                    className="btn w-full justify-center py-2.5 rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                    <Download size={15} /> Download PNG (Transparent)
                  </a>
                </div>
                <button onClick={() => { setResult(null); setStatus('idle') }}
                  className="btn-ghost w-full justify-center py-2.5 rounded-xl text-sm">
                  Try Another Image
                </button>
              </>
            )}

            <div className={`p-4 rounded-xl border text-xs text-slate-400 leading-relaxed ${cardBg}`}>
              <Shield size={12} className="inline mr-1.5 text-violet-400" />
              Your images are <strong className="text-violet-400">never uploaded</strong>. The AI runs 100% inside your browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
