import { useState, useRef } from 'react'
import axios from 'axios'
import { FileText, Download, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function WordToPdf() {
    const { isDark } = useTheme()
    const [file, setFile]       = useState(null)
    const [status, setStatus]   = useState('idle')
    const [result, setResult]   = useState(null)
    const [progress, setProgress] = useState(0)
    const inputRef = useRef(null)

    const loadFile = (f) => {
        if (!f) return
        const ok = f.name.endsWith('.docx') || f.name.endsWith('.doc') || f.type.includes('word')
        if (!ok) { alert('Please upload a .doc or .docx Word file'); return }
        setFile(f); setStatus('idle'); setResult(null)
    }

    const convert = async () => {
        if (!file) return
        setStatus('processing'); setProgress(15); setResult(null)

        const form = new FormData()
        form.append('word', file)

        try {
            const res = await axios.post('/api/word-to-pdf', form, {
                responseType: 'blob',
                onUploadProgress: e => setProgress(15 + Math.round((e.loaded / e.total) * 40)),
            })
            setProgress(95)
            const blob = new Blob([res.data], { type: 'application/pdf' })
            setResult(URL.createObjectURL(blob))
            setProgress(100); setStatus('done')
        } catch (err) {
            console.error('Word→PDF:', err)
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
                    <div className="page-header-icon" style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className={`text-2xl font-black tracking-tight ${text}`}>Word to PDF</h1>
                            <span className="pill pill-blue">DOC / DOCX → PDF</span>
                        </div>
                        <p className={`text-sm mt-1 ${sub}`}>
                            Upload a Word document and get a perfect PDF — fast, accurate server-side conversion.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div
                            className={`dz min-h-[280px] ${file ? 'dz-video-loaded' : 'dz-default'}`}
                            onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]) }}
                            onDragOver={e => e.preventDefault()}
                            onClick={() => inputRef.current?.click()}>
                            <input ref={inputRef} type="file" accept=".docx,.doc" className="hidden"
                                onChange={e => loadFile(e.target.files[0])} />
                            <div className="text-5xl mb-4">📝</div>
                            {file ? (
                                <>
                                    <p className="font-bold text-blue-600">{file.name}</p>
                                    <p className={`text-sm mt-1 ${sub}`}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                                </>
                            ) : (
                                <>
                                    <p className={`font-semibold ${text}`}>Drop your Word document here</p>
                                    <p className={`text-sm mt-1 ${sub}`}>.doc and .docx files supported</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`rounded-2xl border p-5 ${card}`}>
                            <h3 className={`text-sm font-bold mb-3 ${text}`}>About This Conversion</h3>
                            <ul className="space-y-2.5">
                                {[
                                    'Supports both .doc and .docx formats',
                                    'Server-side conversion — fast and accurate',
                                    'Preserves fonts, tables, and images',
                                    'Output is a standard .pdf file',
                                    'File deleted from server after 5 minutes',
                                ].map(l => (
                                    <li key={l} className={`flex items-start gap-2 text-xs ${sub}`}>
                                        <Info size={11} className="text-blue-500 shrink-0 mt-0.5" /> {l}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button onClick={convert} disabled={!file || status === 'processing'}
                            className="btn btn-video w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                            {status === 'processing'
                                ? <><Loader2 size={16} className="animate-spin" /> Converting…</>
                                : <><FileText size={16} /> Convert Word to PDF</>
                            }
                        </button>

                        {status === 'processing' && (
                            <div>
                                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-sub)' }}>
                                    <span>Converting your document…</span><span>{progress}%</span>
                                </div>
                                <div className="prog-track">
                                    <div className="prog-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#2563eb,#0891b2)' }} />
                                </div>
                            </div>
                        )}

                        {status === 'done' && result && (
                            <div className="alert-success">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700">PDF ready!</p>
                                    <a href={result} download="mediaforge-converted.pdf"
                                        className="btn btn-video mt-2 text-xs py-2">
                                        <Download size={13} /> Download PDF
                                    </a>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="alert-error">
                                <AlertCircle size={15} className="text-red-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-red-600">Conversion failed</p>
                                    <p className="text-xs text-red-500 mt-1">Make sure the file is a valid Word document (.doc or .docx).</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
