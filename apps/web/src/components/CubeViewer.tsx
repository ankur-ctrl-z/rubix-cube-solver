 'use client'

interface CubeViewerProps {
  faces: Record<string, number[]>
}

const COLOR_MAP: Record<number, string> = {
  0: '#ffffff', // white
  1: '#f97316', // orange
  2: '#22c55e', // green
  3: '#ef4444', // red
  4: '#3b82f6', // blue
  5: '#eab308', // yellow
}

const COLOR_NAMES: Record<number, string> = {
  0: 'W', 1: 'O', 2: 'G', 3: 'R', 4: 'B', 5: 'Y'
}

function FaceGrid({ colors, label }: { colors: number[], label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2px',
        width: '72px',
        height: '72px',
        margin: '0 auto 4px'
      }}>
        {colors.map((color, i) => (
          <div key={i} style={{
            background: COLOR_MAP[color],
            borderRadius: '2px',
            border: '1px solid rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            fontWeight: 'bold',
            color: color === 0 ? '#333' : 'white'
          }}>
            {COLOR_NAMES[color]}
          </div>
        ))}
      </div>
      <div style={{
        fontSize: '10px',
        fontFamily: 'monospace',
        color: 'var(--muted)'
      }}>
        {label}
      </div>
    </div>
  )
}

export default function CubeViewer({ faces }: CubeViewerProps) {
  if (!faces || Object.keys(faces).length === 0) return null

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <div style={{
        fontSize: '11px',
        fontFamily: 'monospace',
        color: 'var(--muted)',
        marginBottom: '12px'
      }}>
        DETECTED CUBE STATE
      </div>

      {/* Unfolded cube layout */}
      {/*       [TOP]          */}
      {/* [LEFT][FRONT][RIGHT][BACK] */}
      {/*      [BOTTOM]       */}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>

        {/* TOP */}
        <div style={{ marginLeft: '80px' }}>
          <FaceGrid colors={faces.TOP || Array(9).fill(0)} label="TOP" />
        </div>

        {/* Middle row */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <FaceGrid colors={faces.LEFT   || Array(9).fill(4)} label="LEFT" />
          <FaceGrid colors={faces.FRONT  || Array(9).fill(2)} label="FRONT" />
          <FaceGrid colors={faces.RIGHT  || Array(9).fill(3)} label="RIGHT" />
          <FaceGrid colors={faces.BACK   || Array(9).fill(1)} label="BACK" />
        </div>

        {/* BOTTOM */}
        <div style={{ marginLeft: '80px' }}>
          <FaceGrid colors={faces.BOTTOM || Array(9).fill(5)} label="BOTTOM" />
        </div>

      </div>

      {/* Color legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px',
        marginTop: '12px', justifyContent: 'center'
      }}>
        {Object.entries(COLOR_MAP).map(([num, color]) => (
          <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '12px', height: '12px',
              background: color, borderRadius: '2px',
              border: '1px solid rgba(0,0,0,0.2)'
            }} />
            <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace' }}>
              {COLOR_NAMES[Number(num)]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}