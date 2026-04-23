'use client'

import Link from 'next/link'
import { UserButton, Show } from '@clerk/nextjs'

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top right auth */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          zIndex: 20
        }}
      >
        <Show when="signed-in">
          <UserButton/>
        </Show>

        <Show when="signed-out">
          <Link
            href="/sign-in"
            style={{
              color: 'var(--muted)',
              fontSize: '13px',
              border: '1px solid var(--border)',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontFamily: 'monospace'
            }}
          >
            Sign In
          </Link>
        </Show>
      </div>

      {/* Glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '384px',
          height: '384px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '25%',
          width: '384px',
          height: '384px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Main content */}
      <div
        className="animate-slide-up"
        style={{
          textAlign: 'center',
          padding: '0 24px',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Mini cube icon */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              width: '64px',
              height: '64px'
            }}
          >
            {[
              '#ef4444',
              '#ffffff',
              '#22c55e',
              '#3b82f6',
              '#f97316',
              '#ef4444',
              '#eab308',
              '#22c55e',
              '#ffffff'
            ].map((color, i) => (
              <div
                key={i}
                style={{
                  background: color,
                  borderRadius: '3px'
                }}
              />
            ))}
          </div>
        </div>

<Link
  href="https://ankurwork.vercel.app/"
  target="_blank"
  rel="noopener noreferrer"
  className="mono"
  style={{
    color: 'var(--accent2)',
    fontSize: '12px',
    letterSpacing: '0.3em',
    marginBottom: '16px',
    display: 'inline-block',
    textDecoration: 'none',
    cursor: 'pointer'
  }}
>
  BUILD BY ANKUR SHARMA
</Link>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: 800,
            lineHeight: 1,
            marginBottom: '24px'
          }}
        >
          RUBIX
          <span
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {' '}
            SOLVER
          </span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--muted)',
            maxWidth: '400px',
            margin: '0 auto 48px',
            lineHeight: 1.6
          }}
        >
          Scan all 6 faces of your cube with your camera.
          Get the exact moves to solve it in seconds.
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
            justifyContent: 'center',
            marginBottom: '48px'
          }}
        >
          {[
            { value: '≤28', label: 'Max moves' },
            { value: '6', label: 'Face scans' },
            { value: '<3s', label: 'Solve time' }
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                className="mono"
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'var(--accent)'
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  marginTop: '4px'
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Show when="signed-in">
            <>
              <Link
                href="/scan"
                style={{
                  padding: '16px 32px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  color: 'white',
                  background:
                    'linear-gradient(135deg, var(--accent), var(--accent2))',
                  textDecoration: 'none',
                  boxShadow: '0 0 30px rgba(124,58,237,0.3)'
                }}
              >
                Start Scanning →
              </Link>

              <Link
                href="/history"
                style={{
                  padding: '16px 32px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  color: 'var(--muted)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  textDecoration: 'none'
                }}
              >
                View History
              </Link>
            </>
          </Show>

          <Show when="signed-out">
            <>
              <Link
                href="/sign-up"
                style={{
                  padding: '16px 32px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  color: 'white',
                  background:
                    'linear-gradient(135deg, var(--accent), var(--accent2))',
                  textDecoration: 'none',
                  boxShadow: '0 0 30px rgba(124,58,237,0.3)'
                }}
              >
                Get Started →
              </Link>

              <Link
                href="/sign-in"
                style={{
                  padding: '16px 32px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  color: 'var(--muted)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  textDecoration: 'none'
                }}
              >
                Sign In
              </Link>
            </>
          </Show>
        </div>
      </div>

      {/* Bottom hint */}
      <div
        className="mono"
        style={{
          position: 'absolute',
          bottom: '32px',
          color: 'var(--muted)',
          fontSize: '11px',
          letterSpacing: '0.2em'
        }}
      >
        HOLD WHITE FACE UP · GREEN FACE TOWARD CAMERA
      </div>
    </main>
  )
}