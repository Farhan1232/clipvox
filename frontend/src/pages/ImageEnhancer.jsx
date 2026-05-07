import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Download, Upload, RefreshCw, Shield } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const DEFAULT = { brightness: 100, contrast: 100, saturation: 100, sharpness: 0, upscale: 1 }

export default function ImageEnhancer() {
  const { isDark } = useTheme()
  const [original, setOriginal]  = useState(null)
  const [settings, setSettings]  = useState(DEFAULT)
  const [previewUrl, setPreview] = useState(null)
  const [sliderX, setSliderX]    = useState(50)
  const [dragging, setDragging]  = useState(false)
  const [downloading, setDl]     = useState(false)
  const inputRef   = useRef(null)
  const containerRef = useRef(null)
  const canvasRef  = useRef(null)

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setOriginal({ url, file })
    setPreview(url)
    setSettings(DEFAULT)
    setSliderX(50)
  }

  const onDrop = (e) => { e.preventDefault(); loadFile(e.dataTransfer.files[0]) }
  const set = (key) => (e) => setSettings(s => ({ ...s, [key]: +e.target.value }))

  /* Apply filters to canvas and get preview URL */
  const applyFilters = useCallback(async () => {
    if (!original) return
    const img = new Image()
    img.src = original.url
    await new Promise(r => { img.onload = r })

    const scale = settings.upscale
    const canvas = canvasRef.current
    canvas.width  = img.naturalWidth  * scale
    canvas.height = img.naturalHeight * scale
    const ctx = canvas.getContext('2d')

    ctx.filter = [
      `brightness(${settings.brightness}%)`,
      `contrast(${settings.contrast}%)`,
      `saturate(${settings.saturation}%)`,
    ].join(' ')

    ctx.imageSmoothingEnabled  = true
    ctx.imageSmoothingQuality  = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    ctx.filter = 'none'

    /* Sharpening convolution */
    if (settings.sharpness > 0) {
      const factor = settings.sharpness / 100
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const src = new Uint8ClampedArray(imageData.data)
      const d = imageData.data
      const w = canvas.width
      const kernel = [
        0,       -factor,    0,
        -factor, 1 + 4 * factor, -factor,
        0,       -factor,    0,
      ]
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          for (let c = 0; c < 3; c++) {
            let sum = 0
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                sum += src[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)]
              }
            }
            d[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, sum))
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    setPreview(canvas.toDataURL('image/jpeg', 0.95))
  }, [original, settings])

  useEffect(() => { applyFilters() }, [applyFilters])

  const download = () => {
    if (!canvasRef.current) return
    setDl(true)
    canvasRef.current.toBlob(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'mediaforge-enhanced.jpg'
      a.click()
      setDl(false)
    }, 'image/jpeg', 0.97)
  }

  /* Slider interaction */
  const onMouseDown = () => setDragging(true)
  const onMouseUp   = () => setDragging(false)
  const onMouseMove = (e) => {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setSliderX(Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100)))
  }
  const onTouchMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setSliderX(Math.max(2, Math.min(98, ((e.touches[0].clientX - rect.left) / rect.width) * 100)))
  }

  const textColor = isDark ? 'text-white' : 'text-slate-900'
  const cardBg    = isDark ? 'bg-white/[0.03] border-white/7' : 'bg-white border-black/8'

  const sliders = [
    { key: 'brightness', label: 'Brightness', min: 50,  max: 200, step: 1,  unit: '%' },
    { key: 'contrast',   label: 'Contrast',   min: 50,  max: 200, step: 1,  unit: '%' },
    { key: 'saturation', label: 'Saturation', min: 0,   max: 300, step: 1,  unit: '%' },
    { key: 'sharpness',  label: 'Sharpness',  min: 0,   max: 100, step: 5,  unit: '' },
    { key: 'upscale',    label: 'Upscale',    min: 1,   max: 4,   step: 1,  unit: 'x', marks: ['1x','2x','3x','4x'] },
  ]

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 sm:px-6 dot-grid ${isDark ? 'bg-[#030310]' : 'bg-[#f4f4fc]'}`}>
      <canvas ref={canvasRef} className="hidden" />
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}>
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl font-black tracking-tight ${textColor}`}>Image Enhancer</h1>
              <span className="pill pill-violet">Browser-side · Lossless</span>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Upscale up to 4×, sharpen, adjust brightness, contrast and saturation. Live preview.
            </p>
          </div>
        </div>

        {!original ? (
          /* Upload state */
          <div className="drop-zone min-h-[300px] p-10" onDrop={onDrop}
            onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => loadFile(e.target.files[0])} />
            <div className="flex flex-col items-center gap-4 pointer-events-none">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(124,58,237,0.2))' }}>
                <Upload size={32} className="text-indigo-400" />
              </div>
              <div className="text-center">
                <p className={`font-semibold ${textColor}`}>Drop an image to enhance</p>
                <p className="text-sm text-slate-400 mt-1">JPG · PNG · WebP — all supported</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-white/6' : 'border-black/6'}`}>
                  <span className={`text-sm font-semibold ${textColor}`}>Before / After — drag slider</span>
                  <button onClick={() => { setOriginal(null); setPreview(null) }}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                    <RefreshCw size={11} /> New image
                  </button>
                </div>

                <div ref={containerRef} className="relative overflow-hidden cursor-ew-resize select-none"
                  style={{ height: '380px' }}
                  onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                  onTouchMove={onTouchMove}>

                  {/* Enhanced (right side) */}
                  {previewUrl && <img src={previewUrl} alt="Enhanced"
                    className="absolute inset-0 w-full h-full object-contain" draggable={false} />}

                  {/* Original (left clip) */}
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderX}%` }}>
                    <img src={original.url} alt="Original"
                      className="absolute inset-0 h-full object-contain"
                      style={{ width: `${100 * 100 / sliderX}%`, maxWidth: 'none' }} draggable={false} />
                  </div>

                  {/* Handle */}
                  <div className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
                    style={{ left: `${sliderX}%`, transform: 'translateX(-50%)', width: '44px', zIndex: 20 }}
                    onMouseDown={onMouseDown}>
                    <div className="w-0.5 h-full bg-white/80 absolute" />
                    <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center relative z-10">
                      <span className="text-slate-700 text-sm font-bold select-none">⟺</span>
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg">ORIGINAL</div>
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg">ENHANCED</div>
                </div>
              </div>

              {/* Info */}
              {original && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: 'Upscale', v: `${settings.upscale}×` },
                    { l: 'Sharpness', v: `${settings.sharpness}%` },
                    { l: 'Saturation', v: `${settings.saturation}%` },
                  ].map(({ l, v }) => (
                    <div key={l} className={`rounded-xl border p-3 text-center ${cardBg}`}>
                      <div className={`text-xl font-black g-text`}>{v}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className={`rounded-2xl border p-5 ${cardBg}`}>
                <h3 className={`text-sm font-bold mb-4 ${textColor}`}>Adjustments</h3>
                {sliders.map(({ key, label, min, max, step, unit, marks }) => (
                  <div key={key} className="mb-5">
                    <div className="flex justify-between mb-1.5">
                      <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
                      <span className="text-xs font-mono text-violet-400">{settings[key]}{unit}</span>
                    </div>
                    <input type="range" min={min} max={max} step={step}
                      value={settings[key]} onChange={set(key)} />
                    {marks && (
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                        {marks.map(m => <span key={m}>{m}</span>)}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => setSettings(DEFAULT)}
                  className="btn-ghost w-full justify-center py-2 rounded-xl text-sm mt-1">
                  Reset Defaults
                </button>
              </div>

              <button onClick={download} disabled={!previewUrl || downloading}
                className="btn-forge w-full justify-center py-3.5 rounded-2xl text-base disabled:opacity-50">
                {downloading ? 'Preparing…' : <><Download size={16} /> Download Enhanced Image</>}
              </button>

              <div className={`p-4 rounded-xl border text-xs text-slate-400 ${cardBg}`}>
                <Shield size={11} className="inline mr-1.5 text-violet-400" />
                Everything processes in your browser. No uploads, ever.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
