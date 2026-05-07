import { useState } from 'react'
import axios from 'axios'
import DropZone from '../components/DropZone'
import { Music2, Film, Download, Settings2, Loader2, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react'

const FADE_OPTIONS = ['None', '1s', '2s', '3s', '5s']
const AUDIO_MODES  = [
  { value: 'overlay',  label: 'Overlay',        desc: 'Mix music with original audio' },
  { value: 'replace',  label: 'Replace Audio',  desc: 'Remove original, use music only' },
  { value: 'mute_orig', label: 'Mute Original', desc: 'Keep video muted, add music' },
]
const LOOP_OPTIONS = [
  { value: 'loop',  label: 'Loop music to match video' },
  { value: 'trim',  label: 'Trim music at video end' },
  { value: 'pad',   label: 'Pad silence after music ends' },
]

export default function AddMusic() {
  const [video, setVideo]           = useState(null)
  const [audio, setAudio]           = useState(null)
  const [audioMode, setAudioMode]   = useState('overlay')
  const [videoVol, setVideoVol]     = useState(100)
  const [musicVol, setMusicVol]     = useState(80)
  const [fadeIn, setFadeIn]         = useState('None')
  const [fadeOut, setFadeOut]       = useState('2s')
  const [loopMode, setLoopMode]     = useState('loop')
  const [startOffset, setOffset]    = useState(0)
  const [status, setStatus]         = useState('idle')
  const [progress, setProgress]     = useState(0)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState('')

  const process = async () => {
    if (!video || !audio) return
    setStatus('processing'); setProgress(10); setError(''); setResult(null)

    const form = new FormData()
    form.append('video', video)
    form.append('audio', audio)
    form.append('mode', audioMode)
    form.append('video_volume', (videoVol / 100).toFixed(2))
    form.append('music_volume', (musicVol / 100).toFixed(2))
    form.append('fade_in',  fadeIn  === 'None' ? '0' : fadeIn.replace('s', ''))
    form.append('fade_out', fadeOut === 'None' ? '0' : fadeOut.replace('s', ''))
    form.append('loop_mode', loopMode)
    form.append('start_offset', startOffset.toString())

    try {
      const res = await axios.post('/api/addmusic', form, {
        responseType: 'blob',
        onUploadProgress: e => setProgress(10 + Math.round((e.loaded / e.total) * 40)),
      })
      setProgress(95)
      const blob = new Blob([res.data], { type: 'video/mp4' })
      setResult({ url: URL.createObjectURL(blob), size: (blob.size / 1024 / 1024).toFixed(2) })
      setProgress(100); setStatus('done')
    } catch {
      setError('Processing failed. Check your files and try again.')
      setStatus('error')
    }
  }

  const VolumeSlider = ({ label, value, setValue, color }) => (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm dark:text-slate-300 text-slate-700 flex items-center gap-1.5">
          <Volume2 size={13} /> {label}
        </span>
        <span className={`text-xs font-semibold font-mono ${color}`}>{value}%</span>
      </div>
      <input type="range" min="0" max="150" value={value} onChange={e => setValue(+e.target.value)} />
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>Muted</span><span>150%</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#e11d48,#db2777)' }}>
              <Music2 size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold dark:text-white text-slate-900">Add Music to Video</h1>
              <p className="text-sm dark:text-slate-400 text-slate-600 truncate">Upload video + audio · mix, loop, fade · perfect sync</p>
            </div>
          </div>
          <div className="h-px w-full dark:bg-white/5 bg-black/5 mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Upload area */}
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1 */}
            <div className="rounded-2xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white overflow-hidden">
              <div className="px-5 py-3 dark:bg-white/3 bg-gray-50 border-b dark:border-white/5 border-black/5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">1</div>
                <span className="text-sm font-semibold dark:text-white text-slate-800">Upload Video</span>
                {video && <span className="ml-auto badge badge-success text-[11px]">✓ Ready</span>}
              </div>
              <div className="p-4">
                <DropZone
                  onFiles={setVideo}
                  accept="video/mp4,video/webm,.mp4,.mov,.avi,.mkv"
                  label="Drop your video here"
                  sublabel="MP4 · MOV · AVI · MKV · WebM"
                  icon={Film}
                  minHeight="min-h-[140px]"
                />
                {video && (
                  <div className="flex items-center gap-3 mt-3 p-3 rounded-xl dark:bg-white/3 bg-gray-50">
                    <Film size={15} className="text-cyan-400 shrink-0" />
                    <span className="text-sm dark:text-slate-300 text-slate-600 truncate">{video.name}</span>
                    <span className="text-xs text-slate-400 ml-auto shrink-0">{(video.size/1024/1024).toFixed(1)} MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white overflow-hidden">
              <div className="px-5 py-3 dark:bg-white/3 bg-gray-50 border-b dark:border-white/5 border-black/5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-xs font-bold text-rose-400">2</div>
                <span className="text-sm font-semibold dark:text-white text-slate-800">Upload Music</span>
                {audio && <span className="ml-auto badge badge-success text-[11px]">✓ Ready</span>}
              </div>
              <div className="p-4">
                <DropZone
                  onFiles={setAudio}
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,.mp3,.wav,.ogg,.aac,.m4a"
                  label="Drop your music/audio here"
                  sublabel="MP3 · WAV · AAC · OGG · M4A"
                  icon={Music2}
                  minHeight="min-h-[140px]"
                />
                {audio && (
                  <div className="flex items-center gap-3 mt-3 p-3 rounded-xl dark:bg-white/3 bg-gray-50">
                    <Music2 size={15} className="text-rose-400 shrink-0" />
                    <span className="text-sm dark:text-slate-300 text-slate-600 truncate">{audio.name}</span>
                    <span className="text-xs text-slate-400 ml-auto shrink-0">{(audio.size/1024/1024).toFixed(1)} MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audio mode */}
            <div className="rounded-2xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white p-5">
              <p className="text-sm font-semibold dark:text-white text-slate-800 mb-3">Audio Mode</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AUDIO_MODES.map(m => (
                  <label key={m.value}
                    className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      audioMode === m.value
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'dark:border-white/5 border-black/5 dark:hover:border-white/15 hover:border-black/15'
                    }`}
                  >
                    <input type="radio" name="audioMode" value={m.value} checked={audioMode === m.value}
                      onChange={e => setAudioMode(e.target.value)} className="hidden" />
                    <span className="text-sm font-bold dark:text-white text-slate-800">{m.label}</span>
                    <span className="text-[11px] text-slate-400">{m.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Settings panel */}
          <div className="space-y-5">
            <div className="rounded-2xl border dark:border-white/5 border-black/5 dark:bg-white/3 bg-white p-5">
              <div className="flex items-center gap-2 mb-5">
                <Settings2 size={16} className="text-rose-400" />
                <span className="text-sm font-bold dark:text-white text-slate-800">Mix Settings</span>
              </div>

              {/* Volume sliders */}
              <div className="space-y-5 mb-5">
                {audioMode !== 'replace' && (
                  <VolumeSlider label="Original Audio" value={videoVol} setValue={setVideoVol} color="text-cyan-400" />
                )}
                <VolumeSlider label="Music Volume" value={musicVol} setValue={setMusicVol} color="text-rose-400" />
              </div>

              <div className="space-y-0">
                {/* Loop mode */}
                <div className="settings-row">
                  <span className="text-sm dark:text-slate-300 text-slate-700">Audio Loop</span>
                  <select value={loopMode} onChange={e => setLoopMode(e.target.value)}
                    className="forge-select dark:text-white text-slate-800 text-xs">
                    {LOOP_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>

                {/* Fade In */}
                <div className="settings-row">
                  <span className="text-sm dark:text-slate-300 text-slate-700">Fade In</span>
                  <div className="flex gap-1">
                    {FADE_OPTIONS.map(f => (
                      <button key={f} onClick={() => setFadeIn(f)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                          fadeIn === f ? 'bg-violet-600 text-white' : 'dark:text-slate-400 text-slate-500 dark:hover:bg-white/5 hover:bg-black/5'
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fade Out */}
                <div className="settings-row">
                  <span className="text-sm dark:text-slate-300 text-slate-700">Fade Out</span>
                  <div className="flex gap-1">
                    {FADE_OPTIONS.map(f => (
                      <button key={f} onClick={() => setFadeOut(f)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                          fadeOut === f ? 'bg-violet-600 text-white' : 'dark:text-slate-400 text-slate-500 dark:hover:bg-white/5 hover:bg-black/5'
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Music start offset */}
                <div className="settings-row">
                  <span className="text-sm dark:text-slate-300 text-slate-700">Music Start</span>
                  <div className="flex items-center gap-1.5">
                    <input type="number" min="0" max="300" value={startOffset}
                      onChange={e => setOffset(+e.target.value)}
                      className="forge-select w-16 text-center dark:text-white text-slate-800 dark:bg-slate-800 border dark:border-slate-700 border-slate-200" />
                    <span className="text-xs text-slate-400">sec</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={process} disabled={!video || !audio || status === 'processing'}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#e11d48,#db2777)' }}>
              <span className="flex items-center gap-2">
                {status === 'processing'
                  ? <><Loader2 size={16} className="animate-spin" /> Mixing Audio…</>
                  : <><Music2 size={16} /> Add Music to Video</>
                }
              </span>
            </button>

            {status === 'processing' && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Mixing audio tracks…</span><span>{progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            {status === 'done' && result && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Music added! {result.size} MB</span>
                </div>
                <a href={result.url} download="mediaforge-with-music.mp4"
                  className="btn-primary w-full justify-center"
                  style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                  <span className="flex items-center gap-2"><Download size={16} /> Download Video</span>
                </a>
              </div>
            )}

            {status === 'error' && (
              <div className="flex gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
