import { apiFetch } from './client'
import { getUsername } from './auth'

export type CombinedReportFormat = 'summary' | 'details'

export interface ReportPdf {
  blob: Blob
  filename: string
}

function combinedSelectionKey(selectionId: string): string {
  return `service-reports:export:${getUsername() ?? 'guest'}:${selectionId}`
}

export function storeCombinedReportSelection(reportIds: string[]): string | undefined {
  const selectionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  try {
    sessionStorage.setItem(combinedSelectionKey(selectionId), JSON.stringify(reportIds))

    return selectionId
  } catch {
    return undefined
  }
}

export function getCombinedReportSelection(selectionId: string): string[] {
  try {
    const selection = sessionStorage.getItem(combinedSelectionKey(selectionId))

    return selection ? JSON.parse(selection) : []
  } catch {
    return []
  }
}

async function fetchReportPdf(path: string, fallbackName: string, options: RequestInit): Promise<ReportPdf> {
  const response = await apiFetch(path, { ...options, cache: 'no-store' })

  if (!response.headers.get('Content-Type')?.toLowerCase().startsWith('application/pdf')) {
    throw new Error('เซิร์ฟเวอร์ส่งข้อมูลกลับมาในรูปแบบที่ไม่ใช่ PDF')
  }

  const disposition = response.headers.get('Content-Disposition') ?? ''
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plainName = disposition.match(/filename\s*=\s*"([^"]+)"/i)?.[1]
  let filename = plainName ?? fallbackName

  if (encodedName) {
    try {
      filename = decodeURIComponent(encodedName)
    } catch {
      // Keep the filename without percent encoding when it is available.
    }
  }

  return { blob: await response.blob(), filename }
}

export function getServiceReportPdf(reportId: string, signal: AbortSignal): Promise<ReportPdf> {
  return fetchReportPdf(
    `/api/Report/service-report/${encodeURIComponent(reportId)}/pdf`,
    `ServiceReport_${reportId}.pdf`,
    { signal }
  )
}

export function getCombinedReportPdf(
  projectId: string,
  serviceReportIds: string[],
  format: CombinedReportFormat,
  signal: AbortSignal
): Promise<ReportPdf> {
  const action = format === 'details' ? 'GenerateServiceReportJobDetails' : 'GenerateServiceReport'
  const filenamePrefix = format === 'details' ? 'ServiceReportDetails' : 'ServiceReportSummary'

  return fetchReportPdf(`/api/Report/${action}/pdf`, `${filenamePrefix}_${projectId}.pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, serviceReportIds }),
    signal
  })
}
