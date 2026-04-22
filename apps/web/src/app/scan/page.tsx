'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const FACES = ['TOP', 'LEFT', 'FRONT', 'RIGHT', 'BACK', 'BOTTOM'] as const
const FACE_HINTS = {
  TOP:    'White face pointing UP',
  LEFT:   'Blue face toward camera',
  FRONT:  'Green face toward camera',
  RIGHT:  'Red face toward camera',
  BACK:   'Orange face toward camera',
  BOTTOM: 'Yellow face pointing DOWN',
}

export default function ScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [streaming, setStreaming]     = useState(false)
  const [captures, setCaptures]       = useState<Record<string, File>>({})
  const [currentFace, setCurrentFace] = useState(0)
  const [previews, setPreviews]       = useState<Record<string, string>>({})
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStreaming(true)
      }
    } catch {
      setError('Camera access denied. Please allow camera permission.')
    }
  }

  const capture = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width  = 640
    canvas.height = 480
    ctx.drawImage(videoRef.current, 0, 0, 640, 480)

    const faceName = FACES[currentFace]
    const dataUrl  = canvas.toDataURL('image/jpeg', 0.9)

    // Convert to File
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `${faceName}.jpg`, { type: 'image/jpeg' })
      setCaptures(prev => ({ ...prev, [faceName.toLowerCase()]: file }))
      setPreviews(prev => ({ ...prev, [faceName]: dataUrl }))

      if (currentFace < FACES.length - 1) {
        setCurrentFace(prev => prev + 1)
      }
    }, 'image/jpeg', 0.9)
  }, [currentFace])

  const retake = (faceIndex: number) => {
    const faceName = FACES[faceIndex]
    setCaptures(prev => { const n = { ...prev }; delete n[faceName.toLowerCase()]; return n })
    setPreviews(prev => { const n = { ...prev }; delete n[faceName]; return n })
    setCurrentFace(faceIndex)
  }

  const submit = async () => {
    if (Object.keys(captures).length !== 6) {
      setError('Please capture all 6 faces first')
      return
    }
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      Object.entries(captures).forEach(([face, file]) => {
        formData.append(face, file)
      })

      const response = await fetch('http://localhost:8787/scan', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Scan failed')
      }

      // Store result and navigate to solution page
      localStorage.setItem('rubix_solution', JSON.stringify(result))
      router.push('/solve')

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between"
           style={{ borderColor: 'var(--border)' }}>
        <a href="/" className="mono text-sm" style={{ color: 'var(--muted)' }}>
          ← BACK
        </a>
        <h1 className="font-bold text-lg">Scan Your Cube</h1>
        <div className="mono text-sm" style={{ color: 'var(--accent)' }}>
          {Object.keys(captures).length}/6
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Face progress */}
        <div className="flex gap-2 mb-8">
          {FACES.map((face, i) => (
            <div key={face} className="flex-1">
              <div
                className="h-2 rounded-full mb-1 cursor-pointer transition-all"
                style={{
                  background: previews[face]
                    ? 'var(--accent2)'
                    : i === currentFace
                    ? 'var(--accent)'
                    : 'var(--border)'
                }}
                onClick={() => previews[face] && retake(i)}
              />
              <div className="text-center mono"
                   style={{ fontSize: '9px', color: 'var(--muted)' }}>
                {face}
              </div>
            </div>
          ))}
        </div>

        {/* Current face instruction */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold mb-1">
            Scan {FACES[currentFace]} face
          </div>
          <div className="mono text-sm" style={{ color: 'var(--accent2)' }}>
            {FACE_HINTS[FACES[currentFace]]}
          </div>
        </div>

        {/* Camera feed */}
        {!streaming ? (
          <div
            className="rounded-xl flex flex-col items-center justify-center cursor-pointer mb-6 transition-all hover:scale-105"
            style={{
              background: 'var(--surface)',
              border: '2px dashed var(--border)',
              height: '320px'
            }}
            onClick={startCamera}
          >
            <div className="text-5xl mb-4">📷</div>
            <div className="font-bold text-lg mb-2">Start Camera</div>
            <div className="mono text-xs" style={{ color: 'var(--muted)' }}>
              Click to enable camera access
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden mb-6">
            <video
              ref={videoRef}
              className="w-full rounded-xl"
              style={{ maxHeight: '320px', objectFit: 'cover' }}
              autoPlay
              playsInline
              muted
            />
            {/* Overlay grid guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="grid grid-cols-3 gap-1 opacity-40"
                   style={{ width: '180px', height: '180px' }}>
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="rounded-sm"
                       style={{ border: '2px solid white' }}/>
                ))}
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Capture button */}
        {streaming && Object.keys(captures).length < 6 && (
          <button
            onClick={capture}
            className="w-full py-4 rounded-xl font-bold text-white mb-4 glow transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            📸 Capture {FACES[currentFace]} Face
          </button>
        )}

        {/* Previews */}
        {Object.keys(previews).length > 0 && (
          <div className="mb-6">
            <div className="mono text-xs mb-3" style={{ color: 'var(--muted)' }}>
              CAPTURED FACES
            </div>
            <div className="grid grid-cols-3 gap-3">
              {FACES.map((face, i) => (
                previews[face] ? (
                  <div key={face} className="relative group">
                    <img
                      src={previews[face]}
                      alt={face}
                      className="w-full rounded-lg"
                      style={{ aspectRatio: '1', objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                         style={{ background: 'rgba(0,0,0,0.7)' }}>
                      <div className="mono text-xs mb-2">{face}</div>
                      <button
                        onClick={() => retake(i)}
                        className="mono text-xs px-3 py-1 rounded"
                        style={{ background: 'var(--accent)', color: 'white' }}
                      >
                        RETAKE
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 mono rounded px-1"
                         style={{ fontSize: '9px', background: 'rgba(0,0,0,0.8)', color: 'var(--accent2)' }}>
                      {face}
                    </div>
                  </div>
                ) : (
                  <div key={face}
                       className="rounded-lg flex items-center justify-center"
                       style={{
                         aspectRatio: '1',
                         background: 'var(--surface)',
                         border: i === currentFace ? '2px solid var(--accent)' : '2px dashed var(--border)'
                       }}>
                    <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
                      {face}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg p-4 mb-4 mono text-sm"
               style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        {Object.keys(captures).length === 6 && (
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white glow transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            {loading ? '🔄 Analyzing cube...' : '🧩 Get Solution →'}
          </button>
        )}

      </div>
    </main>
  )
}