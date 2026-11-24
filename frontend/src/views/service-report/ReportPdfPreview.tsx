'use client'

import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import DownloadIcon from '@mui/icons-material/Download'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PrintIcon from '@mui/icons-material/Print'

import PageHeader from '@/components/PageHeader'
import { ApiError } from '@/libs/api/client'
import type { ReportPdf } from '@/libs/api/reportPdf'

interface ReportPdfPreviewProps {
  title: string
  description?: string
  loadPdf: (signal: AbortSignal) => Promise<ReportPdf>
}

export default function ReportPdfPreview({ title, description, loadPdf }: ReportPdfPreviewProps) {
  const [document, setDocument] = useState<{ url: string; filename: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [previewUnavailable, setPreviewUnavailable] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    let url: string | undefined

    setDocument(null)
    setError('')
    setLoading(true)
    setPreviewReady(false)
    setPreviewUnavailable(navigator.pdfViewerEnabled === false)

    loadPdf(controller.signal)
      .then(pdf => {
        if (controller.signal.aborted) return

        url = URL.createObjectURL(pdf.blob)
        setDocument({ url, filename: pdf.filename })
      })
      .catch((failure: unknown) => {
        if (controller.signal.aborted) return

        if (failure instanceof Error && !(failure instanceof ApiError && failure.status >= 500)) {
          setError(failure.message)
        } else {
          setError('สร้างรายงาน PDF ไม่สำเร็จ กรุณาลองใหม่')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
      if (url) URL.revokeObjectURL(url)
    }
  }, [loadPdf, retryCount])

  const printPdf = () => {
    const pdfWindow = frame.current?.contentWindow

    if (pdfWindow) {
      try {
        pdfWindow.focus()
        pdfWindow.print()

        return
      } catch {
        // Browser-native viewers may reject cross-frame printing.
      }
    }

    if (document) window.open(document.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', width: '100%' }}>
      <Button component={Link} href='/reports' size='small' sx={{ mb: 1, px: 0.5 }}>
        กลับหน้ารายงาน
      </Button>
      <PageHeader
        title={title}
        description={description}
        action={
          document && (
            <Stack direction='row' flexWrap='wrap' alignItems='flex-start' useFlexGap gap={1}>
              <Button
                component='a'
                href={document.url}
                target='_blank'
                rel='noopener noreferrer'
                startIcon={<OpenInNewIcon />}
              >
                เปิดในแท็บใหม่
              </Button>
              <Button
                variant='outlined'
                startIcon={<PrintIcon />}
                onClick={printPdf}
                disabled={!previewReady && !previewUnavailable}
              >
                พิมพ์
              </Button>
              <Button
                component='a'
                href={document.url}
                download={document.filename}
                variant='contained'
                startIcon={<DownloadIcon />}
              >
                ดาวน์โหลด PDF
              </Button>
            </Stack>
          )
        }
      />

      {loading && (
        <Paper variant='outlined' sx={{ minHeight: 260, display: 'grid', placeItems: 'center' }}>
          <Stack role='status' alignItems='center' spacing={2}>
            <CircularProgress size={28} />
            <Typography color='text.secondary'>กำลังสร้างไฟล์ PDF</Typography>
          </Stack>
        </Paper>
      )}

      {error && (
        <Alert
          severity='error'
          action={
            <Button color='inherit' onClick={() => setRetryCount(count => count + 1)}>
              ลองใหม่
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {document &&
        (previewUnavailable ? (
          <Alert severity='info'>
            เบราว์เซอร์นี้อาจแสดง PDF ในหน้าไม่ได้ ใช้ปุ่มเปิดในแท็บใหม่หรือดาวน์โหลด PDF ได้
          </Alert>
        ) : (
          <Paper
            variant='outlined'
            sx={{ overflow: 'hidden', bgcolor: 'action.hover', minHeight: 440, height: '72dvh' }}
          >
            <iframe
              ref={frame}
              src={document.url}
              title={title}
              onLoad={() => setPreviewReady(true)}
              onError={() => setPreviewUnavailable(true)}
              style={{ width: '100%', height: '100%', display: 'block', border: 0 }}
            />
          </Paper>
        ))}
    </Box>
  )
}
