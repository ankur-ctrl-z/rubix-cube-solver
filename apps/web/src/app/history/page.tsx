'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Scan {
  id: string
  cubeState: string
  solution: string
  moveCount: number
  createdAt: string
}

export default function HistoryPage() {
  const [scans, setScans]     = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch('http://localhost:8787/history')
      .then(r => r.json())
      .then(data => {
        setScans(data.scans || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load history')
        setLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between"
           style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="mono text-sm" style={{ color: 'var(--muted)' }}>
          ← HOME
        </Link>
        <h1 className="font-bold">Scan History</h1>
        <div className="mono text-sm" style={{ color: 'var(--accent)' }}>
          {scans.length} scans
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {loading && (
          <div className="text-center py-20">
            <div className="mono text-sm" style={{ color: 'var(--muted)' }}>
              Loading...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg p-4 mono text-sm"
               style={{
                 background: 'rgba(239,68,68,0.1)',
                 border: '1px solid rgba(239,68,68,0.3)',
                 color: '#ef4444'
               }}>
            ⚠ {error}
          </div>
        )}

        {!loading && scans.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧩</div>
            <h2 className="text-xl font-bold mb-2">No scans yet</h2>
            <p className="mono text-sm mb-6" style={{ color: 'var(--muted)' }}>
              Scan your first cube to see history here
            </p>
            <Link href="/scan"
              className="px-6 py-3 rounded-lg font-bold text-white glow"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
              Start Scanning
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {scans.map((scan, i) => (
            <div
              key={scan.id}
              className="rounded-xl p-5 transition-all hover:scale-101"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                animationDelay: `${i * 0.05}s`
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold mb-1">
                    Solve #{scans.length - i}
                  </div>
                  <div className="mono text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(scan.createdAt).toLocaleString()}
                  </div>
                </div>
                <div
                  className="mono text-sm px-3 py-1 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent)' }}
                >
                  {scan.moveCount} moves
                </div>
              </div>

              <div className="mono text-xs mb-3 p-2 rounded"
                   style={{
                     background: 'var(--bg)',
                     color: 'var(--muted)',
                     wordBreak: 'break-all'
                   }}>
                {scan.solution || 'Already solved'}
              </div>

              <div className="mono text-xs p-2 rounded"
                   style={{
                     background: 'var(--bg)',
                     color: 'var(--muted)',
                     wordBreak: 'break-all',
                     fontSize: '10px'
                   }}>
                State: {scan.cubeState}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}