// src/components/report/PrintableServiceReport.tsx
'use client'

import React, { useState, useEffect } from 'react'

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  Grid
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import type { ServiceReport, Project } from '../../types'
import { formatDate } from '../../utils'

import { getName } from '../../libs/api/auth'

interface PrintableServiceReportProps {
  reports: ServiceReport[]
  project?: Project
}

const printTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#000000',
      secondary: '#333333'
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
          padding: '4px', // ลด padding ใน Cell เล็กน้อย (จาก p:0.5 => ~4px)
          fontSize: '0.7rem', // ลดขนาดฟอนต์ใน Cell เล็กน้อย
          lineHeight: 1.3 // ปรับ lineHeight
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
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          // background-color ใน TableRow จะมี priority สูงกว่า
        }
      }
    }
  }
})

const PrintableServiceReport: React.FC<PrintableServiceReportProps> = ({ reports, project }) => {
  const [reporterName, setReporterName] = useState<string | null>(null)

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

  const serviceStaff = [
    { name: '', date: '', start: '', end: '', workingHours: '', travellingHours: '', charging: 'Non Charge' }
  ]

  return (
    <ThemeProvider theme={printTheme}>
      <Box
        sx={{
          p: 4,
          maxWidth: '794px', // A4 width
          margin: '0 auto',
          bgcolor: 'background.paper',
          color: 'text.primary',
          fontFamily: 'Sarabun, sans-serif',
          fontSize: '10pt',
          lineHeight: 1.5,
          '@media print': {
            '@page': {
              size: 'A4',
              margin: '1.2cm' // ลด margin ของหน้ากระดาษลงอีกเล็กน้อย (1.5cm -> 1.2cm)
            },
            '& .main-report-table thead': {
              display: 'table-header-group'
            },
            '& .staff-time-table thead': {
              display: 'table-header-group'
            },
            '& .MuiTableHead-root': {
              marginBottom: '0.1cm' // ลด margin-bottom ของหัวตาราง
            },
            fontSize: '9pt', // ลดขนาดฟอนต์โดยรวมอีกเล็กน้อย
            lineHeight: 1.2, // ลด Line height โดยรวม
            padding: '1cm !important' // ปรับ padding ของ Box หลักสำหรับ print
          }
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img
              src='/images/logos/logo-g.png'
              alt='G Innovation Logo'
              style={{ width: 120, height: 60, objectFit: 'contain' }}
            />
            <Typography variant='h6' sx={{ fontWeight: 'bold', fontSize: '12pt' }}>
              G Innovation Co.,Ltd.
            </Typography>
          </Box>
          <Typography variant='h5' sx={{ fontWeight: 'bold', fontSize: '13pt' }}>
            Service Report
          </Typography>
        </Box>

        {/* Customer Info */}
        <TableContainer component={Box} sx={{ mb: 3, border: '1px solid black' }}>
          {/* ปรับ padding ใน TableContainer เพื่อให้ขอบไม่ชิดเกินไป */}
          <Table size='small' sx={{ '& td, & th': { border: '1px solid black', p: 0.5 } }}>
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
                  <TableCell sx={{ width: '80%', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Main Report */}
        <TableContainer component={Box} sx={{ mb: 3, border: '1px solid black' }}>
          <Table
            className='main-report-table'
            size='small'
            sx={{
              tableLayout: 'fixed', // บังคับ table layout เป็น fixed ที่นี่เลย
              width: '100%', // กำหนดความกว้าง 100%
              '& td, & th': {
                border: '1px solid black',
                p: 0.5, // ลด padding
                verticalAlign: 'top',
                wordBreak: 'break-word', // ให้ข้อความตัดคำ
                whiteSpace: 'normal' // Allow text to wrap
              },
              '@media print': {
                '& th:nth-of-type(1)': { width: '10%' }, // วันที่
                '& th:nth-of-type(2)': { width: '30%' }, // รายละเอียดที่แจ้ง
                '& th:nth-of-type(3)': { width: '30%' }, // สาเหตุของปัญหา
                '& th:nth-of-type(4)': { width: '30%' } // การแก้ไข/ดำเนินการ
              }
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>วันที่</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>รายละเอียดที่แจ้ง</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>สาเหตุของปัญหา</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>การแก้ไข/ดำเนินการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map(reportItem => (
                <TableRow key={reportItem.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(reportItem.reportDate)}</TableCell>
                  <TableCell>{reportItem.complain}</TableCell>
                  <TableCell>{reportItem.causesOfFailure}</TableCell>
                  <TableCell>{reportItem.actionTaken}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Status and Signature */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Typography variant='body1' sx={{ fontWeight: 'bold', mb: 1 }}>
              Status of work
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={<Checkbox size='small' />}
                label='Completed'
                checked
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '10pt' } }}
              />
              <FormControlLabel
                control={<Checkbox size='small' />}
                label='Follow-up'
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '10pt' } }}
              />
            </Box>
          </Grid>
          <Grid item xs={8}>
            <TableContainer component={Box} sx={{ border: '1px solid black' }}>
              <Table size='small' sx={{ '& td, & th': { border: '1px solid black', p: 0.5 } }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Report by</TableCell>
                    <TableCell sx={{ width: '70%', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {reporterName || 'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell>{formatDate(new Date().toISOString().split('T')[0])}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Remark</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer sign</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Staff Time */}
        <Typography variant='body1' sx={{ fontWeight: 'bold', mb: 1 }}>
          Service staff and working time
        </Typography>
        <TableContainer component={Box} sx={{ mb: 3, border: '1px solid black' }}>
          <Table
            className='staff-time-table'
            size='small'
            sx={{
              tableLayout: 'fixed', // บังคับ table layout เป็น fixed ที่นี่เลย
              width: '100%', // กำหนดความกว้าง 100%
              '& td, & th': {
                border: '1px solid black',
                p: 0.5, // ลด padding
                verticalAlign: 'top',
                wordBreak: 'break-word',
                whiteSpace: 'normal'
              },
              '@media print': {
                '& th:nth-of-type(1)': { width: '20%' }, // Engineer name
                '& th:nth-of-type(2)': { width: '10%' }, // Date
                '& th:nth-of-type(3)': { width: '10%' }, // Start
                '& th:nth-of-type(4)': { width: '10%' }, // End
                '& th:nth-of-type(5)': { width: '15%' }, // Working hours
                '& th:nth-of-type(6)': { width: '15%' }, // Travelling hours
                '& th:nth-of-type(7)': { width: '20%' } // Charging
              }
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Engineer name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Start</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>End</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Working hours</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Travelling hours</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Charging</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serviceStaff.map((staff, index) => (
                <TableRow key={index}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.date}</TableCell>
                  <TableCell>{staff.start}</TableCell>
                  <TableCell>{staff.end}</TableCell>
                  <TableCell>{staff.workingHours}</TableCell>
                  <TableCell>{staff.travellingHours}</TableCell>
                  <TableCell>{staff.charging}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={6} align='right' sx={{ fontWeight: 'bold' }}>
                  Approved by :
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, fontSize: '8pt', color: 'text.secondary' }}>
          <Typography variant='body2' sx={{ fontSize: 'inherit' }}>
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

export default PrintableServiceReport
