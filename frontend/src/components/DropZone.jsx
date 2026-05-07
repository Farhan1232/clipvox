import { useRef, useState } from 'react'
import { Upload, FileCheck } from 'lucide-react'

export default function DropZone({
  onFiles,
  accept = '*',
  multiple = false,
  label = 'Drop files here or click to browse',
  sublabel = '',
  icon: Icon = Upload,
  className = '',
  minHeight = 'min-h-[220px]',
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [droppedNames, setDroppedNames] = useState([])

  const handleFiles = (files) => {
    if (!files || files.length === 0) return
    const arr = Array.from(files)
    setDroppedNames(arr.map(f => f.name))
    onFiles(multiple ? arr : arr[0])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)
  const onChange = (e) => handleFiles(e.target.files)

  return (
    <div
      className={`drop-zone ${minHeight} p-8 ${isDragging ? 'active' : ''} ${className}`}
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={onChange}
      />

      <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          droppedNames.length
            ? 'bg-emerald-500/20'
            : isDragging ? 'bg-violet-500/20' : 'bg-violet-500/10'
        }`}>
          {droppedNames.length
            ? <FileCheck size={28} className="text-emerald-400" />
            : <Icon size={28} className={isDragging ? 'text-violet-400' : 'text-violet-500/70'} />
          }
        </div>

        {droppedNames.length > 0 ? (
          <div>
            <p className="font-semibold dark:text-white text-slate-800 text-sm">
              {droppedNames.length === 1 ? droppedNames[0] : `${droppedNames.length} files selected`}
            </p>
            <p className="text-xs text-slate-400 mt-1">Click to change selection</p>
          </div>
        ) : (
          <div>
            <p className="font-semibold dark:text-slate-200 text-slate-700">{label}</p>
            {sublabel && <p className="text-sm text-slate-400 mt-1">{sublabel}</p>}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          {accept !== '*' && accept.split(',').map(ext => (
            <span key={ext} className="badge badge-violet text-[11px]">
              {ext.trim().replace('image/', '').replace('video/', '').replace('.', '').toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
