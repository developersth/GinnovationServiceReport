import type { ChipProps } from '@mui/material/Chip'

import type { ServiceReport } from '@/types'

export const reportStatuses: Record<ServiceReport['status'], { label: string; color: ChipProps['color'] }> = {
  Open: { label: 'เปิดงาน', color: 'warning' },
  'In Progress': { label: 'กำลังดำเนินการ', color: 'info' },
  Resolved: { label: 'แก้ไขแล้ว', color: 'success' },
  Complete: { label: 'เสร็จสมบูรณ์', color: 'success' },
  Closed: { label: 'ปิดงาน', color: 'default' }
}

export function reportStatus(status: string) {
  return Object.hasOwn(reportStatuses, status)
    ? reportStatuses[status as ServiceReport['status']]
    : { label: status || 'ไม่ระบุ', color: 'default' as const }
}
