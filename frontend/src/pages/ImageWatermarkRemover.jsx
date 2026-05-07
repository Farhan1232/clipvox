import { useState, useRef, useEffect, useCallback } from 'react'
import { Wand2, Download, Upload, RefreshCw, Info, CheckCircle2, Loader2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Import worker via Vite's ?worker syntax — bundled separately, no main-thread blocking
import InpaintWorker from '../workers/inpaintWorker.js?worker'

export default function ImageWatermarkRemover() {
    const { isDark } = useTheme()
    const [imgUrl, setImgUrl]         = useState(null)
    const [resultUrl, setResult]      = useState(null)
    const [selecting, setSelecting]   = useState(false)
    const [selection, setSelection]   = useState(null)
    const [dragStart, setDragStart]   = useState(null)
    const [processing, setProcessing] = useState(false)
    const canvasRef = useRef(null)
    const resultRef = useRef(null)
    const inputRef  = useRef(null)
    const imgRef    = useRef(new Image())

    const loadFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setImgUrl(URL.createObjectURL(file))
        setResult(null); setSelection(null)
    }

    const redraw = useCallback(() => {
        const canvas = canvasRef.current
        const img    = imgRef.current
        if (!canvas || !img.complete || !img.naturalWidth) return
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        if (selection) {
            ctx.strokeStyle = '#7c3aed'
            ctx.lineWidth   = 2
            ctx.setLineDash([6, 3])
            ctx.strokeRect(selection.x, selection.y, selection.w, selection.h)
            ctx.fillStyle = 'rgba(124,58,237,0.12)'
            ctx.fillRect(selection.x, selection.y, selection.w, selection.h)
        }
    }, [selection])

    useEffect(() => {
        if (!imgUrl || !canvasRef.current) return
        const img = imgRef.current
        img.onload = () => {
            const canvas = canvasRef.current
            if (!canvas) return
            const maxW  = canvas.parentElement.clientWidth || 600
            const scale = Math.min(1, maxW / img.naturalWidth)
            canvas.width  = Math.round(img.naturalWidth  * scale)
            canvas.height = Math.round(img.naturalHeight * scale)
            canvas.dataset.scale = scale
            redraw()
        }
        img.src = imgUrl
    }, [imgUrl])

    useEffect(() => { redraw() }, [redraw])

    const getPos = (e) => {
        const canvas = canvasRef.current
        const rect   = canvas.getBoundingClientRect()
        const scaleX = canvas.width  / rect.width
        const scaleY = canvas.height / rect.height
        const cx = e.touches ? e.touches[0].clientX : e.clientX
        const cy = e.touches ? e.touches[0].clientY : e.clientY
        return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY }
    }

    const onMouseDown = (e) => {
        if (!imgUrl) return
        setDragStart(getPos(e)); setSelecting(true); setSelection(null); setResult(null)
    }
    const onMouseMove = (e) => {
        if (!selecting || !dragStart) return
        const p = getPos(e)
        setSelection({
            x: Math.min(dragStart.x, p.x), y: Math.min(dragStart.y, p.y),
            w: Math.abs(p.x - dragStart.x), h: Math.abs(p.y - dragStart.y),
        })
    }
    const onMouseUp = () => setSelecting(false)

    const removeWatermark = () => {
        if (!selection || selection.w < 5 || selection.h < 5 || processing) return
        setProcessing(true); setResult(null)

        const canvas = canvasRef.current
        const result = resultRef.current
        const img    = imgRef.current

        // Draw original at full natural resolution
        result.width  = img.naturalWidth
        result.height = img.naturalHeight
        const ctx = result.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)

        const scale = parseFloat(canvas.dataset.scale || '1')
        const W  = img.naturalWidth
        const H  = img.naturalHeight
        const x0 = Math.max(0, Math.round(selection.x / scale))
        const y0 = Math.max(0, Math.round(selection.y / scale))
        const x1 = Math.min(W, Math.round((selection.x + selection.w) / scale))
        const y1 = Math.min(H, Math.round((selection.y + selection.h) / scale))

        // Extract full image as ArrayBuffer and transfer to worker (zero-copy)
        const imgData = ctx.getImageData(0, 0, W, H)
        const buf     = imgData.data.buffer.slice(0)   // copy so we can still use imgData

        // Spin up a fresh worker for this job
        const worker = new InpaintWorker()

        worker.onmessage = ({ data: { buf: resultBuf } }) => {
            // Write worker result back to canvas
            const outData = new ImageData(new Uint8ClampedArray(resultBuf), W, H)
            ctx.putImageData(outData, 0, 0)
            setResult(result.toDataURL('image/jpeg', 0.96))
            setProcessing(false)
            worker.terminate()
        }

        worker.onerror = (e) => {
            console.error('Worker error:', e)
            setProcessing(false)
            worker.terminate()
        }

        // Transfer buffer to worker (no copy — instant)
        worker.postMessage({ buf, W, H, x0, y0, x1, y1 }, [buf])
    }

    const card = isDark ? 'bg-[#111130] border-white/8' : 'bg-white border-slate-200'
    const text  = isDark ? 'text-white' : 'text-slate-900'
    const sub   = isDark ? 'text-slate-400' : 'text-slate-500'

    return (
        <div className={`page-bg px-4 sm:px-6 ${isDark ? 'bg-[#07071a]' : 'bg-[#f5f5ff]'}`}>
            <canvas ref={resultRef} className="hidden" />
            <div className="max-w-5xl mx-auto">
                <div className="page-header">
                    <div className="page-header-icon" style={{ background: 'linear-gradient(135deg,#7c3aed,#9333ea)' }}>
                        <Wand2 size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className={`text-2xl font-black tracking-tight ${text}`}>Image Watermark Remover</h1>
                            <span className="pill pill-violet">Smart Inpainting · Instant</span>
                        </div>
                        <p className={`text-sm mt-1 ${sub}`}>
                            Draw a box over the watermark — the algorithm matches surrounding texture and fills it in, not just blurs.
                        </p>
                    </div>
                </div>

                {!imgUrl ? (
                    <div className="dz dz-default min-h-[300px]"
                        onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]) }}
                        onDragOver={e => e.preventDefault()}
                        onClick={() => inputRef.current?.click()}>
                        <input ref={inputRef} type="file" accept="image/*" className="hidden"
                            onChange={e => loadFile(e.target.files[0])} />
                        <Upload size={32} className="text-violet-500 mb-3" />
                        <p className={`font-semibold ${text}`}>Drop an image to remove its watermark</p>
                        <p className={`text-sm mt-1 ${sub}`}>JPG · PNG · WebP · No loading delay</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className={`rounded-2xl border overflow-hidden ${card}`}>
                                <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-white/8' : 'border-slate-200'}`}>
                                    <span className={`text-sm font-semibold ${text}`}>
                                        {selection
                                            ? '✓ Area selected — click Remove Watermark'
                                            : 'Click and drag to draw a rectangle over the watermark'}
                                    </span>
                                    <button
                                        onClick={() => { setImgUrl(null); setResult(null); setSelection(null) }}
                                        className={`text-xs flex items-center gap-1 ${sub} hover:text-red-400 transition-colors`}>
                                        <RefreshCw size={11} /> New Image
                                    </button>
                                </div>
                                <div className="p-2" style={{ cursor: 'crosshair' }}>
                                    <canvas
                                        ref={canvasRef}
                                        className="w-full rounded-xl"
                                        onMouseDown={onMouseDown}
                                        onMouseMove={onMouseMove}
                                        onMouseUp={onMouseUp}
                                        onTouchStart={onMouseDown}
                                        onTouchMove={onMouseMove}
                                        onTouchEnd={onMouseUp}
                                    />
                                </div>
                            </div>

                            {resultUrl && (
                                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                                    <div className={`px-4 py-3 border-b ${isDark ? 'border-white/8' : 'border-slate-200'}`}>
                                        <span className={`text-sm font-semibold ${text} flex items-center gap-2`}>
                                            <CheckCircle2 size={14} className="text-emerald-500" /> Result Preview
                                        </span>
                                    </div>
                                    <div className="p-2">
                                        <img src={resultUrl} alt="Result" className="w-full rounded-xl object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className={`rounded-2xl border p-5 ${card}`}>
                                <h3 className={`text-sm font-bold mb-4 ${text}`}>How It Works</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: '🎯', t: 'Select',  d: 'Draw tightly around the watermark area' },
                                        { icon: '🔍', t: 'Match',   d: 'Finds rows and columns from outside the area that best match the surrounding content' },
                                        { icon: '🖼️', t: 'Fill',    d: 'Copies real texture in — no blur or smear' },
                                    ].map(({ icon, t: title, d }) => (
                                        <div key={title} className="flex gap-3">
                                            <span className="text-xl shrink-0">{icon}</span>
                                            <div>
                                                <p className={`text-xs font-semibold ${text}`}>{title}</p>
                                                <p className={`text-[11px] mt-0.5 ${sub}`}>{d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={`mt-4 flex gap-2 p-3 rounded-xl text-[11px] leading-relaxed ${isDark ? 'bg-white/4 text-slate-400' : 'bg-violet-50 text-violet-700'}`}>
                                    <Info size={11} className="shrink-0 mt-0.5" />
                                    Best results on solid colors, gradients, and simple patterns. Draw the selection as tightly as possible around the watermark.
                                </div>
                            </div>

                            <button
                                onClick={removeWatermark}
                                disabled={!selection || selection.w < 5 || processing}
                                className="btn btn-image w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                {processing
                                    ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                                    : <><Wand2 size={16} /> Remove Watermark</>
                                }
                            </button>

                            {resultUrl && !processing && (
                                <a href={resultUrl} download="mediaforge-clean.jpg"
                                    className="btn btn-file w-full justify-center">
                                    <Download size={16} /> Download Clean Image
                                </a>
                            )}

                            {!selection && (
                                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-white/4 border-white/8 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                    <p className="font-semibold mb-1.5" style={{ color: 'var(--text)' }}>Tips for best results:</p>
                                    <ol className="space-y-1.5 list-decimal list-inside">
                                        <li>Draw the selection tightly — include only the watermark</li>
                                        <li>Works best on solid, gradient, or repeating backgrounds</li>
                                        <li>For large watermarks, try removing in smaller sections</li>
                                        <li>You can repeat the process to refine the result</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
