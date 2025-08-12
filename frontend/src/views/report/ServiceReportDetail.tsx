// src/components/report/ServiceReportDetail.tsx
import React, { useRef } from 'react'

import { Box, Typography, Paper, Divider, Grid, Button } from '@mui/material'
import { useReactToPrint } from 'react-to-print'

import type { ServiceReport, Project } from '../../types'
import { combineImageUrl, formatDate } from '../../utils'

interface ServiceReportDetailProps {
  report: ServiceReport
  project?: Project
}

const ServiceReportDetail: React.FC<ServiceReportDetailProps> = ({ report, project }) => {
  // แก้ไข: ย้ายการเรียกใช้ Hooks มาไว้ด้านบนสุดของ Component
  const componentRef = useRef(null)

  // แก้ไข: เปลี่ยน 'content' เป็น 'contentRef'
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Service Report - ${report?.reportedBy} (${report ? formatDate(report.reportDate) : ''})`,
    pageStyle: `@page { size: A4; margin: 1cm; }`
  })

  // แสดงข้อความเมื่อไม่มีข้อมูล
  if (!report) {
    return <Typography>No service report data available.</Typography>
  }

  const currentProject = project

  return (
    <>
      <Paper sx={{ p: 4, my: 4, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }} className='no-print'>
          <Button variant='contained' onClick={handlePrint}>
            Print Report
          </Button>
        </Box>

        {/* ครอบเนื้อหาที่ต้องการให้พิมพ์ด้วย div ที่มี ref */}
        <div ref={componentRef} style={{ padding: '24px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {currentProject?.imageUrl && (
                <img
                  src={combineImageUrl(currentProject.imageUrl)}
                  alt={currentProject.name}
                  style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
              <Box>
                <Typography variant='h5' component='h2' gutterBottom>
                  {currentProject ? `Project: ${currentProject.name}` : 'Project Not Found'}
                </Typography>
                <Typography variant='subtitle1' color='text.secondary'>
                  Service Report
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='body1'>
                <strong>Report Date:</strong> {formatDate(report.reportDate)}
              </Typography>
              <Typography variant='body1'>
                <strong>Reporter:</strong> {report.reportedBy}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant='h6' gutterBottom>
            Problem Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle2' color='text.secondary'>
                Complain
              </Typography>
              <Typography variant='body1'>{report.complain}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle2' color='text.secondary'>
                Causes of Failure
              </Typography>
              <Typography variant='body1'>{report.causesOfFailure}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle2' color='text.secondary'>
                Action Taken
              </Typography>
              <Typography variant='body1'>{report.actionTaken}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle2' color='text.secondary'>
                Channel
              </Typography>
              <Typography variant='body1'>{report.channel}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant='h6' gutterBottom>
              Attached Images
            </Typography>
            {report.imagePaths && report.imagePaths.length > 0 ? (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {report.imagePaths.map(
                  (item, index) =>
                    typeof item === 'string' && (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <img
                          src={combineImageUrl(item)}
                          alt={`Service Report Image ${index + 1}`}
                          loading='lazy'
                          style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            aspectRatio: '16/9',

                            // แก้ไข: ป้องกันรูปภาพถูกตัด
                            pageBreakInside: 'avoid'
                          }}
                        />
                      </Grid>
                    )
                )}
              </Grid>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No images attached.
              </Typography>
            )}
          </Box>
        </div>
      </Paper>
    </>
  )
}

export default ServiceReportDetail
