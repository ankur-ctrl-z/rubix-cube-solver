const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

export async function scanCube(images: Record<string, File>) {
  const formData = new FormData()
  Object.entries(images).forEach(([face, file]) => {
    formData.append(face, file)
  })

  const response = await fetch(`${API_URL}/scan`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Scan failed')
  }

  return response.json()
}

export async function solveCube(state: string) {
  const response = await fetch(`${API_URL}/solve`, {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Solve failed')
  }

  return response.json()
}

export async function getHistory() {
  const response = await fetch(`${API_URL}/history`)
  if (!response.ok) throw new Error('Failed to fetch history')
  return response.json()
}