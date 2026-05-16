 'use client'

import { useRef, useState, useCallback } from 'react'

const FACES = ['TOP', 'LEFT', 'FRONT', 'RIGHT', 'BACK', 'BOTTOM'] as const

const FACE_HINTS = {
  TOP:    'White center facing UP toward camera',
  LEFT:   'Blue center facing camera',
  FRONT:  'Green center facing camera',
  RIGHT:  'Red center facing camera',
  BACK:   'Orange center facing camera',
  BOTTOM: 'Yellow center facing DOWN',
}

interface CameraCaptureProps {
  onComplete: (captures: Record<string, File>) => void
}

export default function CameraCapture({ onComplete }: CameraCaptureProps) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [streaming, setStreaming]     = useState(false)
  const [captures, setCaptures]       = useState<Record<string, File>>({})
  const [previews, setPreviews]       = useState<Record<string, string>>({})
  const [currentFace, setCurrentFace] = useState(0)
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
      setError('Camera access denied. Please allow camera permission.')
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

      const newCaptures = { ...captures, [faceName.toLowerCase()]: file }
      const newPreviews = { ...previews, [faceName]: dataUrl }

      setCaptures(newCaptures)
      setPreviews(newPreviews)

      if (currentFace < FACES.length - 1) {
        setCurrentFace(prev => prev + 1)
      } else {
        // all 6 captured — notify parent
        onComplete(newCaptures)
      }
    }, 'image/jpeg', 0.9)
  }, [currentFace, captures, previews, onComplete])

  const retake = (faceIndex: number) => {
    const faceName = FACES[faceIndex]
    const newCaptures = { ...captures }
    const newPreviews = { ...previews }
    delete newCaptures[faceName.toLowerCase()]
    delete newPreviews[faceName]
    setCaptures(newCaptures)
    setPreviews(newPreviews)
    setCurrentFace(faceIndex)
  }

  return (
    <div>
      {/* Progress bars */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
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
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
          Scan {FACES[currentFace]} face
        </div>
        <div style={{ fontSize: '12px', color: 'var(--accent2)', fontFamily: 'monospace' }}>
          {FACE_HINTS[FACES[currentFace]]}
        </div>
      </div>

      {/* Camera placeholder */}
      {!streaming && (
        <button
          onClick={startCamera}
          style={{
            width: '100%',
            height: '300px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)',
            border: '2px dashed var(--border)',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
            Start Camera
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace' }}>
            Click to enable camera
          </div>
        </button>
      )}

      {/* Video feed */}
      <div style={{ display: streaming ? 'block' : 'none', position: 'relative', marginBottom: '12px' }}>
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
            height: '300px',
            objectFit: 'cover',
            borderRadius: '12px',
            display: 'block',
            background: '#000'
          }}
        />
        {/* 3x3 grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', pointerEvents: 'none'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px', width: '160px', height: '160px', opacity: 0.5
          }}>
            {Array(9).fill(0).map((_, i) => (
              <div key={i} style={{ border: '2px solid white', borderRadius: '3px' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Capture button */}
      {streaming && Object.keys(captures).length < 6 && (
        <button
          onClick={capture}
          style={{
            width: '100%', padding: '14px',
            borderRadius: '12px', fontWeight: 'bold',
            color: 'white', marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            cursor: 'pointer', fontSize: '15px', border: 'none'
          }}
        >
          📸 Capture {FACES[currentFace]} Face
        </button>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Previews */}
      {Object.keys(previews).length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px', color: 'var(--muted)',
            marginBottom: '10px', fontFamily: 'monospace'
          }}>
            CAPTURED — click to retake
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {FACES.map((face, i) => (
              previews[face] ? (
                <div key={face} style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => retake(i)}>
                  <img src={previews[face]} alt={face} style={{
                    width: '100%', aspectRatio: '1',
                    objectFit: 'cover', borderRadius: '8px', display: 'block'
                  }} />
                  <div style={{
                    position: 'absolute', bottom: '4px', left: '4px',
                    background: 'rgba(0,0,0,0.8)', color: 'var(--accent2)',
                    fontSize: '9px', padding: '2px 6px',
                    borderRadius: '4px', fontFamily: 'monospace'
                  }}>
                    {face} ✓
                  </div>
                </div>
              ) : (
                <div key={face} style={{
                  aspectRatio: '1', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          color: '#ef4444', padding: '12px',
          borderRadius: '8px', fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          ⚠ {error}
        </div>
      )}
    </div>
  )
}