import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div className="mono" style={{
          color: 'var(--accent2)',
          fontSize: '12px',
          letterSpacing: '0.3em',
          marginBottom: '8px'
        }}>
          AI — POWERED
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>
          RUBIX{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SOLVER
          </span>
        </h1>
      </div>
      <SignUp />
    </main>
  )
}