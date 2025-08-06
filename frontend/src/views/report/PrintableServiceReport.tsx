'use client'

import React, { useState, useEffect, forwardRef } from 'react'

import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import type { ServiceReport, Project, User } from '../../types'
import { formatDate } from '../../utils'
import { getName } from '../../libs/api/auth'

interface ServiceStaffRow extends User {
  date?: string
  start?: string
  end?: string
  workingHours?: string
  travellingHours?: string
  charging?: string
}

interface PrintableServiceReportProps {
  reports: ServiceReport[]
  project?: Project
  serviceStaff?: ServiceStaffRow[]
}

const printTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#000000'
    },
    divider: '#000000'
  },
  typography: {
    fontFamily: 'Sarabun, sans-serif'
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#000000',
          border: '1px solid #000000',
          padding: '6px',
          fontSize: '0.75rem',
          lineHeight: 1.4,
          wordBreak: 'break-word',
          '@media print': {
            padding: '4px',
            fontSize: '0.7rem',
            lineHeight: 1.3,
            '-webkit-print-color-adjust': 'exact'
          }
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: 'inherit'
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#000000',
          '&.Mui-checked': {
            color: '#000000'
          },
          '@media print': {
            '-webkit-print-color-adjust': 'exact'
          }
        }
      }
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#000000'
        }
      }
    }
  }
})

const PrintableServiceReport = forwardRef<HTMLDivElement, PrintableServiceReportProps>(
  ({ reports, project, serviceStaff = [] }, ref) => {
    const [reporterName, setReporterName] = useState<string | null>(null)

    console.log(serviceStaff)
    console.log(reporterName)
    useEffect(() => {
      setReporterName(getName())
    }, [])

    if (!reports || reports.length === 0) {
      return (
        <Box sx={{ p: 4, maxWidth: '794px', margin: '0 auto', fontFamily: 'Sarabun, sans-serif' }}>
          <Typography>No service report data available for printing.</Typography>
        </Box>
      )
    }

    const projectName = project?.name || 'N/A'
    const customerName = project?.customerName || 'N/A'
    const customerAddress = project?.customerAddress || 'N/A'
    const contactPerson = project?.contactPerson || 'N/A'
    const contactTel = project?.tel || 'N/A'
    const serviceUnder = project?.serviceUnder || 'N/A'

    return (
      <ThemeProvider theme={printTheme}>
        <Box
          ref={ref}
          sx={{
            maxWidth: '794px',
            margin: '0 auto',
            bgcolor: 'background.paper',
            color: 'text.primary',
            fontFamily: 'Sarabun, sans-serif',
            fontSize: '10pt',
            lineHeight: 1.5,
            p: { xs: 4, print: 0 },
            '@media print': {
              fontSize: '8pt',
              lineHeight: 1.2,
              maxWidth: 'none',
              margin: 0,
              padding: 0,
              boxShadow: 'none',
              '-webkit-print-color-adjust': 'exact',
              'color-adjust': 'exact'
            }
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: '2px solid #000',
              '@media print': {
                pageBreakAfter: 'avoid'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src='/images/logos/logo-g.png' alt='G Innovation Logo' style={{ width: 120, height: 60 }} />
              <Typography variant='h6' sx={{ fontWeight: 'bold', fontSize: '12pt' }}>
                G Innovation Co.,Ltd.
              </Typography>
            </Box>
            <Typography variant='h5' sx={{ fontWeight: 'bold', fontSize: '14pt' }}>
              Service Report
            </Typography>
          </Box>

          {/* Information Table */}
          <Box sx={{ mb: 3, '@media print': { pageBreakAfter: 'avoid' } }}>
            <TableContainer sx={{ border: '1px solid black' }}>
              <Table size='small' sx={{ tableLayout: 'fixed' }}>
                <TableBody>
                  {[
                    ['Project', projectName],
                    ['Customer', customerName],
                    ['Address', customerAddress],
                    ['Contact Person', contactPerson],
                    ['Contact Tel', contactTel],
                    ['Service under', serviceUnder]
                  ].map(([label, value]) => (
                    <TableRow key={label}>
                      <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>{label}</TableCell>
                      <TableCell sx={{ width: '80%', whiteSpace: 'pre-wrap' }}>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Main Report Table */}
          <Box sx={{ mb: 3 }}>
            <TableContainer sx={{ border: '1px solid black' }}>
              <Table size='small' className='main-report-table' sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead
                  sx={{
                    '@media print': {
                      display: 'table-header-group'
                    }
                  }}
                >
                  <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableCell align='center' sx={{ fontWeight: 'bold', width: '15%' }}>
                      วันที่
                    </TableCell>
                    <TableCell align='center' sx={{ fontWeight: 'bold', width: '28%' }}>
                      รายละเอียดที่แจ้ง
                    </TableCell>
                    <TableCell align='center' sx={{ fontWeight: 'bold', width: '28%' }}>
                      สาเหตุของปัญหา
                    </TableCell>
                    <TableCell align='center' sx={{ fontWeight: 'bold', width: '28%' }}>
                      การแก้ไข/ดำเนินการ
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '@media print': {
                      display: 'table-row-group'
                    }
                  }}
                >
                  {reports.map((reportItem, index) => (
                    <TableRow
                      key={reportItem.id || index}
                      sx={{
                        '@media print': {
                          pageBreakInside: 'avoid',
                          breakInside: 'avoid'
                        }
                      }}
                    >
                      <TableCell align='center'>{formatDate(reportItem.reportDate)}</TableCell>
                      <TableCell>{reportItem.complain || ''}</TableCell>
                      <TableCell>{reportItem.causesOfFailure || ''}</TableCell>
                      <TableCell>{reportItem.actionTaken || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Signature and Staff Section */}
          <Box sx={{ pageBreakInside: 'avoid', mt: 4 }}>
            {/* ส่วนของลายเซ็นและชื่อ */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ textAlign: 'center', width: '30%' }}>
                <Box sx={{ borderBottom: '1px solid black', height: 40, mb: 1 }} />
                <Typography sx={{ fontSize: '0.8rem' }}>ผู้รับบริการ</Typography>
                <Typography sx={{ fontSize: '0.8rem' }}>(ผู้รับทราบผลการปฏิบัติงาน)</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', width: '30%' }}>
                <Box sx={{ borderBottom: '1px solid black', height: 40, mb: 1 }} />
                <Typography sx={{ fontSize: '0.8rem' }}>ผู้ปฏิบัติงาน</Typography>
                <Typography sx={{ fontSize: '0.8rem' }}>(เจ้าหน้าที่บริการ)</Typography>
              </Box>
            </Box>

            {/* ตารางข้อมูลเจ้าหน้าที่ */}
            <Typography variant='body1' sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.9rem' }}>
              เจ้าหน้าที่ผู้ปฏิบัติงาน
            </Typography>
            <TableContainer sx={{ border: '1px solid black' }}>
              <Table size='small' sx={{ tableLayout: 'fixed' }}>
                <TableHead
                  sx={{
                    '@media print': {
                      display: 'table-header-group'
                    }
                  }}
                >
                  <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableCell align='center' sx={{ width: '25%', fontWeight: 'bold' }}>
                      ชื่อ-สกุล
                    </TableCell>
                    <TableCell align='center' sx={{ width: '25%', fontWeight: 'bold' }}>
                      วันที่
                    </TableCell>
                    <TableCell align='center' sx={{ width: '15%', fontWeight: 'bold' }}>
                      เวลาเข้า
                    </TableCell>
                    <TableCell align='center' sx={{ width: '15%', fontWeight: 'bold' }}>
                      เวลาออก
                    </TableCell>
                    <TableCell align='center' sx={{ width: '20%', fontWeight: 'bold' }}>
                      หมายเหตุ
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '@media print': {
                      display: 'table-row-group'
                    }
                  }}
                >
                  {serviceStaff.length > 0 ? (
                    serviceStaff.map((staff, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '@media print': {
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid'
                          }
                        }}
                      >
                        <TableCell>
                          {staff.name} {staff.username}
                        </TableCell>
                        <TableCell>{staff.date || 'N/A'}</TableCell>
                        <TableCell>{staff.start || 'N/A'}</TableCell>
                        <TableCell>{staff.end || 'N/A'}</TableCell>
                        <TableCell>{staff.charging || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        ไม่มีข้อมูลเจ้าหน้าที่
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              borderTop: '2px solid #000',
              pt: 2,
              textAlign: 'center',
              fontSize: '8pt',
              color: 'text.secondary',
              '@media print': {
                pageBreakInside: 'avoid',
                marginTop: '1cm',
                paddingTop: '0.5cm',
                fontSize: '7pt'
              }
            }}
          >
            <Typography variant='body2' sx={{ fontSize: 'inherit', mb: 0.5 }}>
              G INNOVATION CO.,LTD. 238/5 Ratchadapisek Rd., kwang Huai khwang, Khet Huai khwang, Bangkok 10320
            </Typography>
            <Typography variant='body2' sx={{ fontSize: 'inherit' }}>
              Tel : 02-553-3138-40 Fax : 02-553-1027 www.ginnovation.co.th
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    )
  }
)

PrintableServiceReport.displayName = 'PrintableServiceReport'

export default PrintableServiceReport
