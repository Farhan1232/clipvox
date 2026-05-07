import { useState, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from '../components/DropZone'
import {
  FileImage, Download, Trash2, ArrowUp, ArrowDown,
  CheckCircle2, Shield, Loader2, Settings2, X
} from 'lucide-react'

const PAGE_SIZES = {
  A4:         [595.28, 841.89],
  Letter:     [612, 792],
  A3:         [841.89, 1190.55],
  Legal:      [612, 1008],
}

const ORIENTATIONS = ['Portrait', 'Landscape']
const MARGINS = { None: 0, Small: 10, Medium: 20, Large: 40 }

export default function ImageToPDF() {
  const [images, setImages] = useState([])   // { file, url, name }
  const [pageSize, setPageSize] = useState('A4')
  const [orientation, setOrientation] = useState('Portrait')
  const [margin, setMargin] = useState('Small')
  const [fitMode, setFitMode] = useState('fit')  // 'fit' | 'fill' | 'stretch'
  const [status, setStatus] = useState('idle')   // 'idle' | 'processing' | 'done' | 'error'
  const [pdfUrl, setPdfUrl] = useState(null)
  const [progress, setProgress] = useState(0)

  const addImages = (files) => {
    const arr = Array.isArray(files) ? files : [files]
    const newImgs = arr
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name, id: crypto.randomUUID() }))
    setImages(prev => [...prev, ...newImgs])
    setStatus('idle')
    setPdfUrl(null)
  }

  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id))

  const move = (id, dir) => {
    setImages(prev => {
      const idx = prev.findIndex(i => i.id === id)
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const buildPDF = useCallback(async () => {
    if (!images.length) return
    setStatus('processing')
    setProgress(0)

    try {
      const pdf = await PDFDocument.create()
      let [w, h] = PAGE_SIZES[pageSize]
      if (orientation === 'Landscape') [w, h] = [h, w]
      const mg = MARGINS[margin]

      for (let i = 0; i < images.length; i++) {
        setProgress(Math.round((i / images.length) * 90))
        const { file } = images[i]
        const bytes = await file.arrayBuffer()
        let img
        if (file.type === 'image/jpeg') img = await pdf.embedJpg(bytes)
        else if (file.type === 'image/png') img = await pdf.embedPng(bytes)
        else {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const bmp = await createImageBitmap(file)
          canvas.width = bmp.width; canvas.height = bmp.height
          ctx.drawImage(bmp, 0, 0)
          const pngBytes = await new Promise(res => canvas.toBlob(b => b.arrayBuffer().then(res), 'image/png'))
          img = await pdf.embedPng(pngBytes)
        }

        const page = pdf.addPage([w, h])
        const usableW = w - mg * 2
        const usableH = h - mg * 2
        let drawW, drawH, x, y

        if (fitMode === 'stretch') {
          drawW = usableW; drawH = usableH
        } else if (fitMode === 'fill') {
          const scale = Math.max(usableW / img.width, usableH / img.height)
          drawW = img.width * scale; drawH = img.height * scale
        } else {
          const scale = Math.min(usableW / img.width, usableH / img.height)
          drawW = img.width * scale; drawH = img.height * scale
        }
        x = mg + (usableW - drawW) / 2
        y = mg + (usableH - drawH) / 2

        page.drawImage(img, { x, y, width: drawW, height: drawH })
      }

      setProgress(95)
      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setPdfUrl(URL.createObjectURL(blob))
      setProgress(100)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }, [images, pageSize, orientation, margin, fitMode])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#9333ea)' }}>
              <FileImage size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold dark:text-white text-slate-900">Image to PDF</h1>
              <p className="text-sm dark:text-slate-400 text-slate-600 truncate">Browser-side · Your files never leave your device</p>
            </div>
            <span className="ml-auto badge badge-success">
              <Shield size={11} /> 100% Private
            </span>
          </div>
          <div className="h-px w-full dark:bg-white/5 bg-black/5 mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — upload + image list */}
          <div className="lg:col-span-2 space-y-5">
            <DropZone
              onFiles={addImages}
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
              multiple
              label="Drop images here or click to browse"
              sublabel="JPG · PNG · WebP · BMP · GIF supported"
              icon={FileImage}
            />

            {images.length > 0 && (
              <div className="rounded-2xl border dark:border-white/5 border-black/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 dark:bg-white/3 bg-gray-50 border-b dark:border-white/5 border-black/5">
                  <span className="text-sm font-semibold dark:text-white text-slate-800">
                    {images.length} image{images.length !== 1 ? 's' : ''} · drag to reorder
                  </span>
                  <button
                    onClick={() => { setImages([]); setPdfUrl(null); setStatus('idle') }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} /> Clear all
                  </button>
                </div>

                <div className="divide-y dark:divide-white/5 divide-black/5">
                  {images.map((img, idx) => (
                    <div key={img.id} className="flex items-center gap-3 px-5 py-3 dark:hover:bg-white/3 hover:bg-gray-50 transition-colors">
                      <span className="text-xs text-slate-500 w-6 text-center font-mono">{idx + 1}</span>
                      <img src={img.url} alt={img.name} className="w-12 h-12 rounded-lg object-cover border dark:border-white/10 border-black/10" />
                      <span className="flex-1 text-sm dark:text-slate-300 text-slate-600 truncate">{img.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => move(img.id, -1)} disabled={idx === 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center dark:text-slate-400 text-slate-500 hover:text-violet-500 disabled:opacity-30 transition-colors">
                          <ArrowUp size={14} />
                        </button>
                        <button onClick={() => move(img.id, 1)} disabled={idx === images.length - 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center dark:text-slate-400 text-slate-500 hover:text-violet-500 disabled:opacity-30 transition-colors">
                          <ArrowDown size={14} />
                        </button>
                        <button onClick={() => removeImage(img.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — settings + convert */}
          <div className="space-y-5">
            <div className="rounded-2xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white p-5">
              <div className="flex items-center gap-2 mb-5">
                <Settings2 size={16} className="text-violet-400" />
                <span className="text-sm font-bold dark:text-white text-slate-800">PDF Settings</span>
              </div>

              {[
                {
                  label: 'Page Size',
                  el: (
                    <select value={pageSize} onChange={e => setPageSize(e.target.value)}
                      className="forge-select dark:text-white text-slate-800">
                      {Object.keys(PAGE_SIZES).map(s => <option key={s}>{s}</option>)}
                    </select>
                  )
                },
                {
                  label: 'Orientation',
                  el: (
                    <div className="flex rounded-xl overflow-hidden border dark:border-slate-700 border-slate-200">
                      {ORIENTATIONS.map(o => (
                        <button key={o} onClick={() => setOrientation(o)}
                          className={`flex-1 py-1.5 text-xs font-semibold transition-all ${
                            orientation === o
                              ? 'bg-violet-600 text-white'
                              : 'dark:text-slate-400 text-slate-600 dark:hover:bg-white/5 hover:bg-slate-50'
                          }`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  )
                },
                {
                  label: 'Margin',
                  el: (
                    <select value={margin} onChange={e => setMargin(e.target.value)}
                      className="forge-select dark:text-white text-slate-800">
                      {Object.keys(MARGINS).map(m => <option key={m}>{m}</option>)}
                    </select>
                  )
                },
                {
                  label: 'Image Fit',
                  el: (
                    <select value={fitMode} onChange={e => setFitMode(e.target.value)}
                      className="forge-select dark:text-white text-slate-800">
                      <option value="fit">Fit (maintain ratio)</option>
                      <option value="fill">Fill (crop edges)</option>
                      <option value="stretch">Stretch to page</option>
                    </select>
                  )
                },
              ].map(({ label, el }) => (
                <div key={label} className="settings-row">
                  <span className="text-sm dark:text-slate-300 text-slate-700">{label}</span>
                  {el}
                </div>
              ))}
            </div>

            {/* Convert button */}
            <button
              onClick={buildPDF}
              disabled={!images.length || status === 'processing'}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {status === 'processing'
                  ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                  : <><FileImage size={16} /> Convert to PDF</>
                }
              </span>
            </button>

            {/* Progress */}
            {status === 'processing' && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Building PDF…</span><span>{progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            {/* Download */}
            {status === 'done' && pdfUrl && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">PDF ready!</span>
                </div>
                <a
                  href={pdfUrl}
                  download="clipvox-output.pdf"
                  className="btn-primary w-full justify-center"
                  style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}
                >
                  <span className="flex items-center gap-2"><Download size={16} /> Download PDF</span>
                </a>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                Something went wrong. Please try again with valid image files.
              </div>
            )}

            {/* Privacy note */}
            <div className="flex items-start gap-2 p-4 rounded-xl dark:bg-white/3 bg-gray-50 border dark:border-white/5 border-black/5">
              <Shield size={14} className="text-violet-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                All processing happens <strong className="text-violet-400">in your browser</strong>.
                Your images are never uploaded to any server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
