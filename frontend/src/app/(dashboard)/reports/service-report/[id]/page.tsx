'use client'

import { useCallback } from 'react'

import { getServiceReportPdf } from '@/libs/api/reportPdf'
import ReportPdfPreview from '@views/service-report/ReportPdfPreview'

export default function ServiceReportPage({ params }: { params: { id: string } }) {
  const { id } = params
  const loadPdf = useCallback((signal: AbortSignal) => getServiceReportPdf(id, signal), [id])

  return <ReportPdfPreview title='รายงานบริการ' loadPdf={loadPdf} />
}
