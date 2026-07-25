import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

type Side = 'top' | 'bottom' | 'left' | 'right' | 'auto'

interface TooltipProps {
  content: React.ReactNode
  side?: Side
  delay?: number
  children: React.ReactElement
}

interface Pos {
  top: number
  left: number
  side: Exclude<Side, 'auto'>
}

const GAP = 6

function pickSide(
  rect: DOMRect,
  tip: DOMRect,
  requested: Side,
): Exclude<Side, 'auto'> {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const room = {
    top: rect.top,
    bottom: vh - rect.bottom,
    left: rect.left,
    right: vw - rect.right,
  }
  if (requested !== 'auto') {
    const need =
      requested === 'top' || requested === 'bottom' ? tip.height : tip.width
    if (room[requested] >= need + GAP) return requested
  }
  const order: Array<Exclude<Side, 'auto'>> = ['top', 'bottom', 'right', 'left']
  return order.sort((a, b) => room[b] - room[a])[0]
}

function computePosition(
  triggerRect: DOMRect,
  tipRect: DOMRect,
  side: Exclude<Side, 'auto'>,
): Pos {
  let top = 0
  let left = 0
  switch (side) {
    case 'top':
      top = triggerRect.top - tipRect.height - GAP
      left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2
      break
    case 'bottom':
      top = triggerRect.bottom + GAP
      left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2
      break
    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2
      left = triggerRect.left - tipRect.width - GAP
      break
    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2
      left = triggerRect.right + GAP
      break
  }
  const vw = window.innerWidth
  const vh = window.innerHeight
  left = Math.max(6, Math.min(left, vw - tipRect.width - 6))
  top = Math.max(6, Math.min(top, vh - tipRect.height - 6))
  return { top, left, side }
}

interface TriggerProps {
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
  onFocus?: (e: React.FocusEvent) => void
  onBlur?: (e: React.FocusEvent) => void
  ref?: React.Ref<HTMLElement>
}

export function Tooltip({ content, side = 'auto', delay = 300, children }: TooltipProps) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const tipRef = useRef<HTMLDivElement | null>(null)
  const timer = useRef<number | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)

  const show = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), delay)
  }
  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setOpen(false)
    setPos(null)
  }

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !tipRef.current) return
    const tRect = triggerRef.current.getBoundingClientRect()
    const ipRect = tipRef.current.getBoundingClientRect()
    const s = pickSide(tRect, ipRect, side)
    setPos(computePosition(tRect, ipRect, s))
  }, [open, side, content])

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  if (!isValidElement(children)) return children as unknown as React.ReactElement

  const childProps = children.props as TriggerProps
  const childRef = (children as unknown as { ref?: React.Ref<HTMLElement> }).ref

  const attach = (el: HTMLElement | null) => {
    triggerRef.current = el
    if (typeof childRef === 'function') childRef(el)
    else if (childRef && typeof childRef === 'object')
      (childRef as React.MutableRefObject<HTMLElement | null>).current = el
  }

  const cloned = cloneElement(children, {
    ref: attach,
    onMouseEnter: (e: React.MouseEvent) => {
      show()
      childProps.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide()
      childProps.onMouseLeave?.(e)
    },
    onFocus: (e: React.FocusEvent) => {
      show()
      childProps.onFocus?.(e)
    },
    onBlur: (e: React.FocusEvent) => {
      hide()
      childProps.onBlur?.(e)
    },
  } as TriggerProps)

  return (
    <>
      {cloned}
      {open &&
        content != null &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              zIndex: 1200,
              background: 'var(--text-1)',
              color: 'var(--surface)',
              fontSize: 12,
              fontWeight: 500,
              padding: '5px 10px',
              borderRadius: 6,
              pointerEvents: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              maxWidth: 280,
              whiteSpace: 'pre-line',
              opacity: pos ? 1 : 0,
              transition: 'opacity 0.12s',
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  )
}
