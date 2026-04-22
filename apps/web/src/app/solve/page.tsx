'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MOVE_EXPLANATIONS: Record<string, string> = {
  'U':  'Turn TOP face clockwise',
  "U'": 'Turn TOP face counter-clockwise',
  'U2': 'Turn TOP face 180°',
  'D':  'Turn BOTTOM face clockwise',
  "D'": 'Turn BOTTOM face counter-clockwise',
  'D2': 'Turn BOTTOM face 180°',
  'R':  'Turn RIGHT face clockwise',
  "R'": 'Turn RIGHT face counter-clockwise',
  'R2': 'Turn RIGHT face 180°',
  'L':  'Turn LEFT face clockwise',
  "L'": 'Turn LEFT face counter-clockwise',
  'L2': 'Turn LEFT face 180°',
  'F':  'Turn FRONT face clockwise',
  "F'": 'Turn FRONT face counter-clockwise',
  'F2': 'Turn FRONT face 180°',
  'B':  'Turn BACK face clockwise',
  "B'": 'Turn BACK face counter-clockwise',
  'B2': 'Turn BACK face 180°',
}

export default function SolvePage() {
  const router = useRouter()
  const [solution, setSolution]       = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted]     = useState(false)
  const [cubeState, setCubeState]     = useState('')
  const [totalMoves, setTotalMoves]   = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('rubix_solution')
    if (!stored) { router.push('/scan'); return }

    const result = JSON.parse(stored)
    const moves  = result.solution
      ? result.solution.trim().split(/\s+/).filter(Boolean)
      : []

    setSolution(moves)
    setTotalMoves(moves.length)
    setCubeState(result.cube_state || '')
  }, [router])

  const next = () => {
    if (currentStep < solution.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setCompleted(true)
    }
  }

  const prev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const currentMove = solution[currentStep]
  const progress    = solution.length > 0
    ? ((currentStep + 1) / solution.length) * 100
    : 0

  if (completed) {
    return (
      <main className="min-h-screen flex items-center justify-center"
            style={{ background: 'var(--bg)' }}>
        <div className="text-center animate-slide-up px-6">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-extrabold mb-4">
            Cube <span style={{ color: 'var(--accent2)' }}>Solved!</span>
          </h1>
          <p className="mono mb-2" style={{ color: 'var(--muted)' }}>
            Completed in {totalMoves} moves
          </p>
          <p className="mono text-xs mb-8" style={{ color: 'var(--muted)' }}>
            {cubeState}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/scan"
              className="px-6 py-3 rounded-lg font-bold text-white glow"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
              Scan Again
            </Link>
            <Link href="/history"
              className="px-6 py-3 rounded-lg font-bold"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>
              View History
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (solution.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center"
            style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Cube Already Solved!</h2>
          <Link href="/scan"
            className="mono text-sm"
            style={{ color: 'var(--accent2)' }}>
            Scan another cube →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between"
           style={{ borderColor: 'var(--border)' }}>
        <Link href="/scan" className="mono text-sm" style={{ color: 'var(--muted)' }}>
          ← RESCAN
        </Link>
        <h1 className="font-bold">Solution</h1>
        <div className="mono text-sm" style={{ color: 'var(--accent)' }}>
          {currentStep + 1}/{solution.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1" style={{ background: 'var(--border)' }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))'
          }}
        />
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Current move */}
        <div
          className="rounded-2xl p-8 text-center mb-6 glow"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="mono text-xs mb-4" style={{ color: 'var(--muted)' }}>
            MOVE {currentStep + 1} OF {solution.length}
          </div>

          <div
            className="text-8xl font-extrabold mono mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {currentMove}
          </div>

          <div className="text-lg" style={{ color: 'var(--muted)' }}>
            {MOVE_EXPLANATIONS[currentMove] || `Apply move ${currentMove}`}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className="flex-1 py-4 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-30"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            ← Previous
          </button>
          <button
            onClick={next}
            className="flex-1 py-4 rounded-xl font-bold text-white glow transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            {currentStep === solution.length - 1 ? '✅ Done!' : 'Next →'}
          </button>
        </div>

        {/* All moves overview */}
        <div className="rounded-xl p-4"
             style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="mono text-xs mb-3" style={{ color: 'var(--muted)' }}>
            ALL MOVES
          </div>
          <div className="flex flex-wrap gap-2">
            {solution.map((move, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className="mono text-sm px-3 py-1 rounded-lg transition-all hover:scale-110"
                style={{
                  background: i === currentStep
                    ? 'var(--accent)'
                    : i < currentStep
                    ? 'rgba(6,182,212,0.2)'
                    : 'var(--border)',
                  color: i === currentStep ? 'white' : 'var(--text)',
                  border: i === currentStep ? 'none' : '1px solid transparent'
                }}
              >
                {move}
              </button>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}