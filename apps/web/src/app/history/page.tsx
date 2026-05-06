'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

interface Scan {
  id: string 
  cubeState: string
  solution: string
  moveCount: number
  createdAt: string
}

export default function HistoryPage() {
  const { userId }        = useAuth()
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!userId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, {
      headers: { 'x-user-id': userId }
    })
      .then(r => r.json())
      .then(data => {
        setScans(data.scans || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load history')
        setLoading(false)
      })
  }, [userId])

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
        <Link href="/" style={{
          color: 'var(--muted)',
          fontSize: '13px',
          fontFamily: 'monospace',
          textDecoration: 'none'
        }}>
          ← HOME
        </Link>
        <h1 style={{ fontWeight: 'bold', fontSize: '18px' }}>Scan History</h1>
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontFamily: 'monospace' }}>
          {scans.length} scans
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '13px' }}>
              Loading...
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '13px'
          }}>
            ⚠ {error}
          </div>
        )}

        {!loading && scans.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧩</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              No scans yet
            </h2>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              color: 'var(--muted)',
              marginBottom: '24px'
            }}>
              Scan your first cube to see history here
            </p>
            <Link href="/scan" style={{
              padding: '12px 24px',
              borderRadius: '10px',
              fontWeight: 'bold',
              color: 'white',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              textDecoration: 'none'
            }}>
              Start Scanning
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {scans.map((scan, i) => (
            <div key={scan.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    Solve #{scans.length - i}
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: 'var(--muted)'
                  }}>
                    {new Date(scan.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  padding: '4px 12px',
                  borderRadius: '99px',
                  background: 'rgba(124,58,237,0.2)',
                  color: 'var(--accent)'
                }}>
                  {scan.moveCount} moves
                </div>
              </div>

              <div style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '10px',
                borderRadius: '6px',
                background: 'var(--bg)',
                color: 'var(--muted)',
                marginBottom: '8px',
                wordBreak: 'break-all'
              }}>
                {scan.solution || 'Already solved ✓'}
              </div>

              <div style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                padding: '8px',
                borderRadius: '6px',
                background: 'var(--bg)',
                color: 'var(--muted)',
                wordBreak: 'break-all'
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