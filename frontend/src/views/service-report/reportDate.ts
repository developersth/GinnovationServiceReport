import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export function reportDatePickerValue(value?: string): Dayjs {
  const date = value ? dayjs.utc(value) : dayjs.utc()

  return dayjs(date.utcOffset(7).format('YYYY-MM-DD'))
}

export function bangkokMidnight(date: Dayjs): string {
  return new Date(`${date.format('YYYY-MM-DD')}T00:00:00+07:00`).toISOString()
}

export function formatReportDate(value?: string): string {
  if (!value) return '—'

  const date = dayjs.utc(value)

  return date.isValid() ? date.utcOffset(7).format('DD/MM/YYYY') : '—'
}
