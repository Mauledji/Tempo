import * as chrono from 'chrono-node'

export const TODAY = new Date()

export const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
export const MONTHS_SHORT_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysUntil(dateStr: string, from: Date = TODAY): number {
  const diff = new Date(dateStr).getTime() - from.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function parseSmartDate(text: string, ref: Date = new Date()): string | null {
  const result = chrono.es.parseDate(text, ref, { forwardDate: true })
  return result ? toDateKey(result) : null
}

export function getEventTimeRange(start: string, end: string): { startH: number; endH: number } {
  const [, startTime] = start.split('T')
  const [, endTime] = end.split('T')
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return { startH: sh + sm / 60, endH: eh + em / 60 }
}
