'use client'

import { Suspense, useCallback } from 'react'

import { useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { getCombinedReportPdf, getCombinedReportSelection } from '@/libs/api/reportPdf'
import ReportPdfPreview from '@views/service-report/ReportPdfPreview'

function SelectedReportsPreview() {
  const params = useSearchParams()
  const projectId = params.get('projectId') ?? ''
  const reportIds = params.get('ids') ?? ''
  const selectionId = params.get('selection') ?? ''
  const format = params.get('format') === 'details' ? 'details' : 'summary'
  const selectionCount = Number(params.get('count')) || reportIds.split(',').filter(Boolean).length

  const loadPdf = useCallback(
    async (signal: AbortSignal) => {
      const ids = selectionId
        ? getCombinedReportSelection(selectionId)
        : reportIds
            .split(',')
            .map(id => id.trim())
            .filter(Boolean)

      if (!projectId || !ids.length) {
        throw new Error('กรุณากลับไปเลือกโครงการและรายงานที่ต้องการรวม')
      }

      return getCombinedReportPdf(projectId, ids, format, signal)
    },
    [format, projectId, reportIds, selectionId]
  )

  const formatLabel = format === 'details' ? 'สรุปพร้อมรายละเอียดงาน' : 'สรุป'

  return (
    <ReportPdfPreview
      title='รายงานบริการรวม'
      description={selectionCount ? `${formatLabel} · ${selectionCount.toLocaleString('th-TH')} รายงาน` : undefined}
      loadPdf={loadPdf}
    />
  )
}

export default function SelectedReportsPage() {
  return (
    <Suspense
      fallback={
        <Box role='status' sx={{ p: 6, display: 'grid', placeItems: 'center' }}>
          <CircularProgress aria-label='กำลังโหลดหน้าพรีวิว' />
        </Box>
      }
    >
      <SelectedReportsPreview />
    </Suspense>
  )
}
