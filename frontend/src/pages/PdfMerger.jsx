import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Link2, Upload, Trash2, ArrowUp, ArrowDown, Download, Shield, Loader2, CheckCircle2, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function PdfMerger() {
  const { isDark } = useTheme()
  const [pdfs, setPdfs]       = useState([])
  const [status, setStatus]   = useState('idle')
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const inputRef = useState(null)[0]

  const addFiles = (files) => {
    const arr = Array.isArray(files) ? files : Array.from(files)
    const valid = arr.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    setPdfs(prev => [
      ...prev,
      ...valid.map(f => ({ file: f, name: f.name, size: f.size, id: crypto.randomUUID() }))
    ])
    setStatus('idle'); setResultUrl(null)
  }

  const onDrop = (e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }

  const remove = (id) => setPdfs(prev => prev.filter(p => p.id !== id))

  const move = (id, dir) => {
    setPdfs(prev => {
      const idx = prev.findIndex(p => p.id === id)
      const arr = [...prev]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return prev
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return arr
    })
  }

  const merge = async () => {
    if (pdfs.length < 2) return
    setStatus('processing'); setProgress(0); setResultUrl(null)

    try {
      const merged = await PDFDocument.create()
      let total = 0

      for (let i = 0; i < pdfs.length; i++) {
        setProgress(Math.round((i / pdfs.length) * 90))
        const bytes = await pdfs[i].file.arrayBuffer()
        const doc   = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(doc, doc.getPageIndices())
        pages.forEach(p => merged.addPage(p))
        total += doc.getPageCount()
      }

      setProgress(95)
      const bytes = await merged.save()
      const blob  = new Blob([bytes], { type: 'application/pdf' })
      setResultUrl(URL.createObjectURL(blob))
      setPageCount(total)
      setProgress(100); setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const textColor  = isDark ? 'text-white' : 'text-slate-900'
  const cardBg     = isDark ? 'bg-white/[0.03] border-white/7' : 'bg-white border-black/8'
  const dividerBg  = isDark ? 'border-white/6' : 'border-black/6'

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 sm:px-6 dot-grid ${isDark ? 'bg-[#030310]' : 'bg-[#f4f4fc]'}`}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#22c55e,#059669)' }}>
            <Link2 size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl font-black tracking-tight ${textColor}`}>PDF Merger</h1>
              <span className="pill pill-green"><Shield size={10} /> Browser-only</span>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Merge unlimited PDFs into one. Reorder documents. Runs entirely in your browser — zero uploads.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — upload + list */}
          <div className="lg:col-span-2 space-y-5">

            {/* Drop zone */}
            <div className="drop-zone min-h-[180px] p-8" onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='.pdf,application/pdf'; i.multiple=true; i.onchange=e=>addFiles(e.target.files); i.click() }}>
              <div className="flex flex-col items-center gap-4 pointer-events-none">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(5,150,105,0.2))' }}>
                  <Upload size={26} className="text-green-400" />
                </div>
                <div className="text-center">
                  <p className={`font-semibold ${textColor}`}>Drop PDF files here or click to browse</p>
                  <p className="text-sm text-slate-400 mt-1">Multiple PDFs supported · Any size</p>
                </div>
              </div>
            </div>

            {/* File list */}
            {pdfs.length > 0 && (
              <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className={`flex items-center justify-between px-5 py-3 border-b ${dividerBg} ${isDark ? 'bg-white/2' : 'bg-gray-50'}`}>
                  <span className={`text-sm font-semibold ${textColor}`}>
                    {pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''} — drag to reorder
                  </span>
                  <button onClick={() => { setPdfs([]); setResultUrl(null); setStatus('idle') }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                    <Trash2 size={11} /> Clear all
                  </button>
                </div>

                <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                  {pdfs.map((pdf, idx) => (
                    <div key={pdf.id} className={`flex items-center gap-3 px-5 py-3 transition-colors ${isDark ? 'hover:bg-white/2' : 'hover:bg-gray-50'}`}>
                      <div className="w-8 h-10 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black"
                        style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(5,150,105,0.2))', color: '#22c55e' }}>
                        PDF
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${textColor}`}>{pdf.name}</p>
                        <p className="text-xs text-slate-400">{(pdf.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => move(pdf.id, -1)} disabled={idx === 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-green-400 disabled:opacity-30 transition-colors">
                          <ArrowUp size={13} />
                        </button>
                        <button onClick={() => move(pdf.id, 1)} disabled={idx === pdfs.length - 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-green-400 disabled:opacity-30 transition-colors">
                          <ArrowDown size={13} />
                        </button>
                        <button onClick={() => remove(pdf.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more */}
                <div className={`px-5 py-3 border-t ${dividerBg}`}>
                  <button
                    onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='.pdf'; i.multiple=true; i.onchange=e=>addFiles(e.target.files); i.click() }}
                    className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                    <Upload size={11} /> Add more PDFs
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right — actions */}
          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-bold mb-4 ${textColor}`}>Merge Info</h3>
              <div className="space-y-3">
                {[
                  { l: 'Documents', v: pdfs.length || '—' },
                  { l: 'Status', v: status === 'done' ? `${pageCount} pages merged` : status === 'processing' ? 'Merging…' : 'Ready' },
                ].map(({ l, v }) => (
                  <div key={l} className={`flex justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                    <span className="text-xs text-slate-400">{l}</span>
                    <span className={`text-xs font-semibold ${textColor}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={merge} disabled={pdfs.length < 2 || status === 'processing'}
              className="btn-forge w-full justify-center py-3.5 rounded-2xl text-base disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}>
              {status === 'processing'
                ? <><Loader2 size={16} className="animate-spin" /> Merging…</>
                : <><Link2 size={16} /> Merge {pdfs.length} PDFs</>
              }
            </button>

            {pdfs.length < 2 && pdfs.length > 0 && (
              <p className="text-xs text-slate-400 text-center">Add at least 2 PDFs to merge.</p>
            )}

            {status === 'processing' && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Combining pages…</span><span>{progress}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#16a34a,#059669)' }} /></div>
              </div>
            )}

            {status === 'done' && resultUrl && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">{pageCount} pages merged!</span>
                </div>
                <a href={resultUrl} download="clipvox-merged.pdf"
                  className="btn w-full justify-center py-2.5 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                  <Download size={15} /> Download Merged PDF
                </a>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-400">
                Merge failed. One of your PDFs may be password-protected or corrupted.
              </div>
            )}

            <div className={`p-4 rounded-xl border text-xs text-slate-400 ${cardBg}`}>
              <Shield size={11} className="inline mr-1.5 text-violet-400" />
              PDFs never leave your device. Everything runs in your browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
