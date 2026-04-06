'use client'

import React, { useEffect, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Box, Typography, CircularProgress, Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'

import { generatePdfReport } from '@/libs/api/data'

export default function SelectedReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const reportIdsParam = searchParams.get('ids')
  const projectId = searchParams.get('projectId')

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let currentUrl: string | null = null

    const fetchPdfReport = async () => {
      if (!reportIdsParam || !projectId) {
        setError('ข้อมูลไม่ครบถ้วน (Missing Project ID or Report IDs)')
        setLoading(false)

        return // แก้ไข: เพิ่ม Newline ก่อน return
      }

      const ids = reportIdsParam.split(',')

      try {
        setLoading(true)
        setError(null)

        const blob = await generatePdfReport(projectId, ids)
        
        currentUrl = window.URL.createObjectURL(blob)
        setPdfUrl(currentUrl)
      } catch (err: any) {
        console.error('[SelectedReportsPage] Error:', err)
        setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน PDF')
      } finally {
        setLoading(false)
      }
    }

    fetchPdfReport()

    return () => {
      if (currentUrl) {
        window.URL.revokeObjectURL(currentUrl)
      }
    }
  }, [reportIdsParam, projectId])

  const handleDownload = () => {
    if (!pdfUrl) return

    const link = document.createElement('a')

    link.href = pdfUrl
    link.download = `ServiceReport_${projectId}_${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant='h6' sx={{ color: 'text.secondary' }}>กำลังจัดเตรียมไฟล์ PDF...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', mt: 5 }}>
        <Typography color='error' variant='h6' sx={{ mb: 2 }}>{error}</Typography>
        <Button variant='contained' startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          กลับไปหน้าก่อนหน้า
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 20px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          พรีวิวรายงาน Service Report
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant='outlined' 
            color='inherit' 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.back()}
          >
            ย้อนกลับ
          </Button>
          
          <Button 
            variant='contained' 
            color='primary' 
            startIcon={<DownloadIcon />} 
            onClick={handleDownload}
            disabled={!pdfUrl}
          >
            ดาวน์โหลด PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        backgroundColor: '#525659', 
        borderRadius: 1, 
        overflow: 'hidden', 
        border: '1px solid #ddd',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&view=FitH`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Service Report Preview"
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography sx={{ color: 'white' }}>ไม่สามารถโหลดตัวอย่างรายงานได้</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
