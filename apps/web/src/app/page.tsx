import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-grid flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: 'var(--bg)' }}>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
           style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }}/>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
           style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)' }}/>

      {/* Content */}
      <div className="relative z-10 text-center px-6 animate-slide-up">

        {/* Cube icon */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-1 w-16 h-16">
            {['color-3','color-0','color-2',
              'color-4','color-1','color-3',
              'color-5','color-2','color-0'].map((c, i) => (
              <div key={i} className={`${c} rounded-sm`}/>
            ))}
          </div>
        </div>

        <p className="mono text-sm mb-4"
           style={{ color: 'var(--accent2)', letterSpacing: '0.3em' }}>
          AI — POWERED
        </p>

        <h1 className="text-6xl font-extrabold mb-4 leading-none"
            style={{ fontFamily: 'Syne' }}>
          RUBIX
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}> SOLVER</span>
        </h1>

        <p className="text-lg mb-12 max-w-md mx-auto"
           style={{ color: 'var(--muted)' }}>
          Scan all 6 faces of your cube with your camera.
          Get the exact moves to solve it in seconds.
        </p>

        {/* Stats */}
        <div className="flex gap-12 justify-center mb-12">
          {[
            { value: '≤28', label: 'Max moves' },
            { value: '6',   label: 'Face scans' },
            { value: '<3s', label: 'Solve time' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold mono"
                   style={{ color: 'var(--accent)' }}>{stat.value}</div>
              <div className="text-xs mt-1"
                   style={{ color: 'var(--muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/scan"
            className="px-8 py-4 rounded-lg font-bold text-white glow transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            Start Scanning →
          </Link>
          <Link href="/history"
            className="px-8 py-4 rounded-lg font-bold transition-all hover:scale-105"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              background: 'var(--surface)'
            }}>
            View History
          </Link>
        </div>

      </div>

      {/* Bottom instruction */}
      <div className="absolute bottom-8 mono text-xs"
           style={{ color: 'var(--muted)' }}>
        HOLD WHITE FACE UP · GREEN FACE TOWARD CAMERA
      </div>

    </main>
  )
}