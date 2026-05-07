import { useState, useRef } from 'react'
import api from '../utils/api'
import { FileText, Download, Upload, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function PdfToWord() {
  const { isDark } = useTheme()
  const [file, setFile]     = useState(null)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)

  const loadFile = (f) => {
    if (!f || f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) return
    setFile(f); setStatus('idle'); setResult(null)
  }

  const convert = async () => {
    if (!file) return
    setStatus('processing'); setProgress(20); setResult(null)

    const form = new FormData()
    form.append('pdf', file)

    try {
      const res = await api.post('/api/pdf-to-word', form, {
        responseType: 'blob',
        onUploadProgress: e => setProgress(20 + Math.round((e.loaded / e.total) * 30)),
      })
      setProgress(95)
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      setResult(URL.createObjectURL(blob))
      setProgress(100); setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const card = isDark ? 'bg-[#111130] border-white/8' : 'bg-white border-slate-200'
  const text  = isDark ? 'text-white' : 'text-slate-900'
  const sub   = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className={`page-bg px-4 sm:px-6 ${isDark ? 'bg-[#07071a]' : 'bg-[#f5f5ff]'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="page-header">
          <div className="page-header-icon" style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl font-black tracking-tight ${text}`}>PDF to Word</h1>
              <span className="pill pill-green">PDF → DOCX</span>
            </div>
            <p className={`text-sm mt-1 ${sub}`}>
              Convert your PDF to an editable Microsoft Word (.docx) file. Server-side conversion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div
              className={`dz min-h-[280px] ${file ? 'dz-pdf-loaded' : 'dz-default'}`}
              onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]) }}
              onDragOver={e => e.preventDefault()}
              onClick={() => inputRef.current?.click()}>
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                onChange={e => loadFile(e.target.files[0])} />
              <div className="text-5xl mb-4">📋</div>
              {file ? (
                <>
                  <p className={`font-bold text-emerald-600`}>{file.name}</p>
                  <p className={`text-sm mt-1 ${sub}`}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <p className={`font-semibold ${text}`}>Drop your PDF file here</p>
                  <p className={`text-sm mt-1 ${sub}`}>PDF files only · Any size</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h3 className={`text-sm font-bold mb-3 ${text}`}>About This Conversion</h3>
              <ul className="space-y-2.5">
                {[
                  'Server-side conversion — fast and accurate',
                  'Text-based PDFs convert best',
                  'Scanned/image PDFs may have limited text extraction',
                  'Output is editable .docx format',
                  'File deleted from server after 5 minutes',
                ].map(l => (
                  <li key={l} className={`flex items-start gap-2 text-xs ${sub}`}>
                    <Info size={11} className="text-emerald-500 shrink-0 mt-0.5" /> {l}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={convert} disabled={!file || status === 'processing'}
              className="btn btn-file w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {status === 'processing'
                ? <><Loader2 size={16} className="animate-spin" /> Converting…</>
                : <><FileText size={16} /> Convert PDF to Word</>
              }
            </button>

            {status === 'processing' && (
              <div>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-sub)' }}>
                  <span>Converting your document…</span><span>{progress}%</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#059669,#0d9488)' }} />
                </div>
              </div>
            )}

            {status === 'done' && result && (
              <div className="alert-success">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Word file ready!</p>
                  <a href={result} download="clipvox-converted.docx"
                    className="btn btn-file mt-2 text-xs py-2">
                    <Download size={13} /> Download Word File
                  </a>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="alert-error">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-600">Conversion failed</p>
                  <p className="text-xs text-red-500 mt-1">Conversion failed. Please try a different PDF file.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
