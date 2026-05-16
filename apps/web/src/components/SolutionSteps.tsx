'use client'

import { useState } from 'react'

interface SolutionStepsProps {
  solution: string
  onComplete: () => void
}

const MOVE_DESCRIPTIONS: Record<string, string> = {
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

const MOVE_COLORS: Record<string, string> = {
  'U': '#eab308', "U'": '#eab308', 'U2': '#eab308',
  'D': '#ffffff', "D'": '#ffffff', 'D2': '#ffffff',
  'R': '#ef4444', "R'": '#ef4444', 'R2': '#ef4444',
  'L': '#3b82f6', "L'": '#3b82f6', 'L2': '#3b82f6',
  'F': '#22c55e', "F'": '#22c55e', 'F2': '#22c55e',
  'B': '#f97316', "B'": '#f97316', 'B2': '#f97316',
}

export default function SolutionSteps({ solution, onComplete }: SolutionStepsProps) {
  const moves = solution
    ? solution.trim().split(/\s+/).filter(Boolean)
    : []

  const [currentStep, setCurrentStep] = useState(0)

  if (moves.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>
          Cube is already solved!
        </div>
        <button onClick={onComplete} style={{
          padding: '12px 24px', borderRadius: '10px',
          fontWeight: 'bold', color: 'white', border: 'none',
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          cursor: 'pointer'
        }}>
          Scan Another
        </button>
      </div>
    )
  }

  const currentMove = moves[currentStep]
  const progress    = ((currentStep + 1) / moves.length) * 100
  const isLast      = currentStep === moves.length - 1

  return (
    <div>
      {/* Progress bar */}
      <div style={{
        height: '6px', background: 'var(--border)',
        borderRadius: '99px', marginBottom: '20px', overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', borderRadius: '99px',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
          transition: 'width 0.3s'
        }} />
      </div>

      {/* Step counter */}
      <div style={{
        textAlign: 'center', fontFamily: 'monospace',
        fontSize: '12px', color: 'var(--muted)', marginBottom: '16px'
      }}>
        MOVE {currentStep + 1} OF {moves.length}
      </div>

      {/* Current move */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px', padding: '24px',
        textAlign: 'center', marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '72px', fontWeight: 800,
          fontFamily: 'monospace', marginBottom: '12px',
          color: MOVE_COLORS[currentMove] || 'var(--accent)'
        }}>
          {currentMove}
        </div>
        <div style={{ fontSize: '15px', color: 'var(--muted)' }}>
          {MOVE_DESCRIPTIONS[currentMove] || `Apply move ${currentMove}`}
        </div>
      </div>

      {/* Prev / Next buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          style={{
            flex: 1, padding: '14px', borderRadius: '10px',
            fontWeight: 'bold', cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: currentStep === 0 ? 'var(--muted)' : 'var(--text)',
            opacity: currentStep === 0 ? 0.4 : 1
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => {
            if (isLast) onComplete()
            else setCurrentStep(prev => prev + 1)
          }}
          style={{
            flex: 1, padding: '14px', borderRadius: '10px',
            fontWeight: 'bold', color: 'white', border: 'none',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            cursor: 'pointer'
          }}
        >
          {isLast ? '✅ Done!' : 'Next →'}
        </button>
      </div>

      {/* All moves overview */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px', padding: '14px'
      }}>
        <div style={{
          fontSize: '11px', fontFamily: 'monospace',
          color: 'var(--muted)', marginBottom: '10px'
        }}>
          ALL MOVES — click any to jump
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {moves.map((move, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                fontFamily: 'monospace', fontSize: '12px',
                padding: '4px 10px', borderRadius: '6px',
                border: 'none', cursor: 'pointer',
                background: i === currentStep
                  ? MOVE_COLORS[move] || 'var(--accent)'
                  : i < currentStep
                  ? 'rgba(6,182,212,0.15)'
                  : 'var(--border)',
                color: i === currentStep ? 'white' : 'var(--text)',
                fontWeight: i === currentStep ? 'bold' : 'normal'
              }}
            >
              {move}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}