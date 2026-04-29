'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

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
  const router        = useRouter()
  const { userId }    = useAuth()
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)

  const [streaming, setStreaming]     = useState(false)
  const [captures, setCaptures]       = useState<Record<string, File>>({})
  const [currentFace, setCurrentFace] = useState(0)
  const [previews, setPreviews]       = useState<Record<string, string>>({})
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Camera access denied. Please allow camera permission and try again.')
    }
  }

  const capture = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')!
    canvas.width  = 640
    canvas.height = 480
    ctx.drawImage(videoRef.current, 0, 0, 640, 480)

    const faceName = FACES[currentFace]
    const dataUrl  = canvas.toDataURL('image/jpeg', 0.9)

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan`, {
        method: 'POST',
        headers: { 'x-user-id': userId || '' },
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Scan failed')

      localStorage.setItem('rubix_solution', JSON.stringify(result))
      router.push('/solve')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <a href="/" style={{ color: 'var(--muted)', fontSize: '13px', fontFamily: 'monospace', textDecoration: 'none' }}>
          ← BACK
        </a>
        <h1 style={{ fontWeight: 'bold', fontSize: '18px' }}>Scan Your Cube</h1>
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontFamily: 'monospace' }}>
          {Object.keys(captures).length}/6
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Progress bars */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {FACES.map((face, i) => (
            <div key={face} style={{ flex: 1 }}>
              <div
                onClick={() => previews[face] && retake(i)}
                style={{
                  height: '6px',
                  borderRadius: '99px',
                  marginBottom: '4px',
                  cursor: previews[face] ? 'pointer' : 'default',
                  background: previews[face]
                    ? 'var(--accent2)'
                    : i === currentFace
                    ? 'var(--accent)'
                    : 'var(--border)',
                  transition: 'background 0.3s'
                }}
              />
              <div style={{
                textAlign: 'center',
                fontSize: '9px',
                color: 'var(--muted)',
                fontFamily: 'monospace'
              }}>
                {face}
              </div>
            </div>
          ))}
        </div>

        {/* Instruction */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '6px' }}>
            Scan {FACES[currentFace]} face
          </div>
          <div style={{ color: 'var(--accent2)', fontSize: '13px', fontFamily: 'monospace' }}>
            {FACE_HINTS[FACES[currentFace]]}
          </div>
        </div>

        {/* Camera placeholder */}
        {!streaming && (
          <button
            onClick={startCamera}
            style={{
              width: '100%',
              height: '320px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface)',
              border: '2px dashed var(--border)',
              cursor: 'pointer',
              marginBottom: '24px'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '6px' }}>
              Start Camera
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '12px', fontFamily: 'monospace' }}>
              Click to enable camera access
            </div>
          </button>
        )}

        {/* Video feed */}
        <div style={{ display: streaming ? 'block' : 'none', position: 'relative', marginBottom: '16px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              videoRef.current?.play()
              setStreaming(true)
            }}
            style={{
              width: '100%',
              height: '320px',
              objectFit: 'cover',
              borderRadius: '12px',
              display: 'block',
              background: '#000'
            }}
          />
          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              width: '180px',
              height: '180px',
              opacity: 0.5
            }}>
              {Array(9).fill(0).map((_, i) => (
                <div key={i} style={{ border: '2px solid white', borderRadius: '4px' }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Capture button */}
        {streaming && Object.keys(captures).length < 6 && (
          <button
            onClick={capture}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              cursor: 'pointer',
              fontSize: '16px',
              border: 'none'
            }}
          >
            📸 Capture {FACES[currentFace]} Face
          </button>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Previews */}
        {Object.keys(previews).length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px',
              color: 'var(--muted)',
              marginBottom: '12px',
              fontFamily: 'monospace'
            }}>
              CAPTURED FACES — click to retake
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {FACES.map((face, i) => (
                previews[face] ? (
                  <div key={face}
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => retake(i)}
                  >
                    <img
                      src={previews[face]}
                      alt={face}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        display: 'block'
                      }}
                    />
                    <div style={{
                      position: 'absolute', bottom: '4px', left: '4px',
                      background: 'rgba(0,0,0,0.8)',
                      color: 'var(--accent2)',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {face} ✓
                    </div>
                  </div>
                ) : (
                  <div key={face} style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface)',
                    border: i === currentFace
                      ? '2px solid var(--accent)'
                      : '2px dashed var(--border)'
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
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
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
            fontFamily: 'monospace'
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        {Object.keys(captures).length === 6 && (
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 'bold',
              color: 'white',
              background: loading
                ? 'var(--border)'
                : 'linear-gradient(135deg, var(--accent), var(--accent2))',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              border: 'none'
            }}
          >
            {loading ? '🔄 Analyzing cube...' : '🧩 Get Solution →'}
          </button>
        )}

      </div>
    </main>
  )
}