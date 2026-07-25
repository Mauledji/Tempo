import { useEffect, useState } from 'react'

export type Viewport = 'mobile' | 'tablet' | 'desktop'

export const VIEWPORT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const

function detect(width: number): Viewport {
  if (width < VIEWPORT_BREAKPOINTS.mobile) return 'mobile'
  if (width < VIEWPORT_BREAKPOINTS.tablet) return 'tablet'
  return 'desktop'
}

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() =>
    typeof window === 'undefined' ? 'desktop' : detect(window.innerWidth),
  )

  useEffect(() => {
    const onResize = () => setVp(detect(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return vp
}

export function useIsMobile(): boolean {
  return useViewport() === 'mobile'
}
