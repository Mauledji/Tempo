import { useEffect, useState } from 'react'

const seen = new Set<string>()

export function useFakeLoading(key: string, ms = 350): boolean {
  const [loading, setLoading] = useState(() => !seen.has(key))

  useEffect(() => {
    if (seen.has(key)) return
    const id = setTimeout(() => {
      seen.add(key)
      setLoading(false)
    }, ms)
    return () => clearTimeout(id)
  }, [key, ms])

  return loading
}
