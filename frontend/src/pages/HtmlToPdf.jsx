import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import html2canvas from 'html2canvas'
import { Globe, Download, Loader2, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Convert base64 dataURL → Uint8Array without fetch()
const dataUrlToBytes = (dataUrl) => {
    const bin = atob(dataUrl.split(',')[1])
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return arr
}

export default function HtmlToPdf() {
    const { isDark } = useTheme()
    const [mode, setMode]       = useState('paste')
    const [html, setHtml]       = useState('')
    const [fileName, setFileName] = useState('')
    const [status, setStatus]   = useState('idle')
    const [resultUrl, setResult] = useState(null)
    const [stage, setStage]     = useState('')
    const inputRef = useRef(null)

    const loadFile = async (file) => {
        if (!file) return
        const text = await file.text()
        setHtml(text); setFileName(file.name)
    }

    const convert = async () => {
        if (!html.trim()) return
        setStatus('processing'); setResult(null); setStage('Parsing HTML…')

        let container = null
        try {
            // ── 1. Parse HTML safely ─────────────────────────────────
            const parser  = new DOMParser()
            const parsed  = parser.parseFromString(html, 'text/html')
            // Remove scripts to prevent execution
            parsed.querySelectorAll('script').forEach(s => s.remove())
            const inlineCSS   = Array.from(parsed.querySelectorAll('style')).map(s => s.textContent).join('\n')
            const bodyContent = parsed.body.innerHTML

            // ── 2. Render in an off-screen div (NOT iframe) ──────────
            // html2canvas cannot read content inside iframes — use a div instead
            setStage('Rendering content…')
            container = document.createElement('div')
            container.style.cssText = [
                'position:fixed',
                'left:-10000px',
                'top:0',
                'width:794px',
                'background:#ffffff',
                'color:#1e293b',
                'font-family:Arial,Helvetica,sans-serif',
                'font-size:14px',
                'line-height:1.6',
                'padding:48px',
                'box-sizing:border-box',
            ].join(';')

            if (inlineCSS) {
                const styleEl = document.createElement('style')
                styleEl.textContent = inlineCSS
                container.appendChild(styleEl)
            }
            const inner = document.createElement('div')
            inner.innerHTML = bodyContent
            container.appendChild(inner)
            document.body.appendChild(container)

            // Wait for fonts / images to settle
            await new Promise(r => setTimeout(r, 700))

            // ── 3. Capture with html2canvas ──────────────────────────
            setStage('Capturing page…')
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,
                windowWidth: 794,
                // onclone brings the off-screen element into view inside the clone
                onclone: (_cloneDoc, el) => {
                    el.style.left     = '0'
                    el.style.top      = '0'
                    el.style.position = 'absolute'
                },
            })
            document.body.removeChild(container)
            container = null

            // ── 4. Build PDF with pdf-lib ─────────────────────────────
            setStage('Building PDF…')
            const pdf      = await PDFDocument.create()
            const pageW    = 595.28   // A4 width  (pt)
            const maxPageH = 841.89   // A4 height (pt)
            const scalePt  = pageW / canvas.width   // canvas px → PDF pt
            const pageH    = canvas.height * scalePt

            // Avoid fetch() — convert dataURL directly to bytes
            const imgBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.93))
            const img      = await pdf.embedJpg(imgBytes)

            // Page-split: pdf-lib y=0 is BOTTOM, so shift each slice correctly
            let yOff = 0
            while (yOff < pageH - 0.5) {
                const sliceH = Math.min(maxPageH, pageH - yOff)
                const page   = pdf.addPage([pageW, sliceH])
                // y = sliceH - pageH + yOff  ← correct formula (NOT -yOff)
                page.drawImage(img, { x: 0, y: sliceH - pageH + yOff, width: pageW, height: pageH })
                yOff += maxPageH
            }

            const bytes = await pdf.save()
            setResult(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })))
            setStage(''); setStatus('done')
        } catch (err) {
            console.error('HTML→PDF error:', err)
            if (container && container.parentNode) container.parentNode.removeChild(container)
            setStage(''); setStatus('error')
        }
    }

    const card     = isDark ? 'bg-[#111130] border-white/8' : 'bg-white border-slate-200'
    const text     = isDark ? 'text-white' : 'text-slate-900'
    const sub      = isDark ? 'text-slate-400' : 'text-slate-500'
    const inputBg  = isDark
        ? 'bg-[#0a0a20] border-white/8 text-slate-200 placeholder-slate-600'
        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'

    return (
        <div className={`page-bg px-4 sm:px-6 ${isDark ? 'bg-[#07071a]' : 'bg-[#f5f5ff]'}`}>
            <div className="max-w-4xl mx-auto">
                <div className="page-header">
                    <div className="page-header-icon" style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                        <Globe size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className={`text-2xl font-black tracking-tight ${text}`}>HTML to PDF</h1>
                            <span className="pill pill-green">Browser Render · Accurate</span>
                        </div>
                        <p className={`text-sm mt-1 ${sub}`}>
                            Paste HTML or upload an .html file — rendered and converted to a clean PDF.
                        </p>
                    </div>
                </div>

                {/* Mode tabs */}
                <div className={`flex gap-1 p-1 rounded-xl mb-6 w-fit ${isDark ? 'bg-white/6' : 'bg-slate-100'}`}>
                    {[['paste', 'Paste HTML'], ['upload', 'Upload .html File']].map(([v, l]) => (
                        <button key={v} onClick={() => setMode(v)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                mode === v
                                    ? isDark ? 'bg-white/15 text-white' : 'bg-white text-slate-900 shadow-sm'
                                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                            }`}>{l}</button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {mode === 'paste' ? (
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${text}`}>Paste your HTML code</label>
                                <textarea
                                    value={html}
                                    onChange={e => { setHtml(e.target.value); setStatus('idle') }}
                                    placeholder={'<!DOCTYPE html>\n<html>\n<body>\n  <h1>Your content here</h1>\n  <p>This will be converted to PDF.</p>\n</body>\n</html>'}
                                    rows={18}
                                    className={`w-full rounded-2xl border px-5 py-4 text-sm font-mono outline-none transition-all resize-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 ${inputBg}`}
                                />
                                <p className={`text-xs mt-2 ${sub}`}>Inline CSS is supported. External resources may not load due to browser security.</p>
                            </div>
                        ) : (
                            <div>
                                <div
                                    className={`dz dz-default min-h-[200px] ${fileName ? 'dz-pdf-loaded' : ''}`}
                                    onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]) }}
                                    onDragOver={e => e.preventDefault()}
                                    onClick={() => inputRef.current?.click()}>
                                    <input ref={inputRef} type="file" accept=".html,text/html" className="hidden"
                                        onChange={e => loadFile(e.target.files[0])} />
                                    <Upload size={28} className="text-emerald-500 mb-3" />
                                    {fileName
                                        ? <><p className={`font-semibold ${text}`}>{fileName}</p><p className={`text-xs mt-1 ${sub}`}>Click to change</p></>
                                        : <><p className={`font-semibold ${text}`}>Drop an .html file here</p><p className={`text-xs mt-1 ${sub}`}>.html files only</p></>
                                    }
                                </div>
                                {html && (
                                    <div className={`mt-3 p-3 rounded-xl text-xs font-mono border overflow-auto max-h-48 ${inputBg}`}>
                                        {html.slice(0, 600)}{html.length > 600 ? '…' : ''}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className={`rounded-2xl border p-5 ${card}`}>
                            <h3 className={`text-sm font-bold mb-4 ${text}`}>How It Works</h3>
                            {[
                                { n: '1', t: 'Parse', d: 'HTML is parsed in the browser, scripts removed for safety' },
                                { n: '2', t: 'Render', d: 'html2canvas renders the HTML exactly as a browser would' },
                                { n: '3', t: 'PDF', d: 'Rendered image is embedded into properly-sized PDF pages' },
                            ].map(({ n, t: title, d }) => (
                                <div key={n} className="flex gap-3 mb-4 last:mb-0">
                                    <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-black text-white"
                                        style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>{n}</div>
                                    <div>
                                        <p className={`text-xs font-semibold ${text}`}>{title}</p>
                                        <p className={`text-[11px] mt-0.5 ${sub}`}>{d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={convert} disabled={!html.trim() || status === 'processing'}
                            className="btn btn-file w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                            {status === 'processing'
                                ? <><Loader2 size={16} className="animate-spin" /> {stage || 'Converting…'}</>
                                : <><Globe size={16} /> Convert to PDF</>
                            }
                        </button>

                        {status === 'done' && resultUrl && (
                            <div className="alert-success">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-emerald-700">PDF created!</p>
                                    <a href={resultUrl} download="clipvox-html.pdf"
                                        className="btn btn-file mt-2 text-xs py-2">
                                        <Download size={13} /> Download PDF
                                    </a>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="alert-error">
                                <AlertCircle size={15} className="text-red-500 shrink-0" />
                                <p className="text-sm text-red-600">Conversion failed. Check your HTML syntax and try again.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
