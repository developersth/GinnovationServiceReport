'use client'

import React, { useState, useEffect, forwardRef } from 'react'

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

// You might need to adjust these types based on your actual data structure
import type { ServiceReport, Project, User } from '../../types'

// Define a type for service staff row if it includes additional fields

import { formatDate } from '../../utils'
import { getName } from '../../libs/api/auth'

// Define a type for service staff row with additional fields
interface ServiceStaffRow extends User {
  date?: string
  start?: string
  end?: string
  workingHours?: string
  travellingHours?: string
  charging?: string
}

// Define the component props
interface PrintableServiceReportProps {
  reports: ServiceReport[]
  project?: Project
  serviceStaff?: ServiceStaffRow[] // Updated type for service staff
}

// Custom theme for printing
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

// Use forwardRef to allow the parent component to reference this component's DOM node
const PrintableServiceReport = forwardRef<HTMLDivElement, PrintableServiceReportProps>(
  ({ reports, project, serviceStaff = [] }, ref) => {
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
          <Box className="report-header" sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: '2px solid #000',
            '@media print': {
              pageBreakAfter: 'avoid',
              marginBottom: '1.5cm',
              paddingBottom: '0.5cm'
            }
          }}>
            {/* ... (Your header content is unchanged) ... */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img
                src='/images/logos/logo-g.png'
                alt='G Innovation Logo'
                style={{
                  width: 120,
                  height: 60,
                  objectFit: 'contain'
                }}
              />
              <Typography variant='h6' sx={{ fontWeight: 'bold', fontSize: '12pt', '@media print': { fontSize: '11pt' } }}>
                G Innovation Co.,Ltd.
              </Typography>
            </Box>
            <Typography variant='h5' sx={{ fontWeight: 'bold', fontSize: '14pt', '@media print': { fontSize: '13pt' } }}>
              Service Report
            </Typography>
          </Box>

          {/* Customer Information Table */}
          <Box className="report-info page-break-inside-avoid" sx={{ mb: 3 }}>
            {/* ... (Your customer info table is unchanged) ... */}
            <TableContainer sx={{ border: '1px solid black' }}>
              <Table size='small' sx={{ tableLayout: 'fixed', '& td, & th': { border: '1px solid black', verticalAlign: 'top' } }}>
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

          {/* Main Report Table (Paginated) */}
          <Box sx={{ mb: 3 }}>
            <table
              className="main-report-table"
              style={{
                tableLayout: 'fixed',
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid black'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '9pt', width: '15%', border: '1px solid black' }}>วันที่</th>
                  <th style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '9pt', width: '28%', border: '1px solid black' }}>รายละเอียดที่แจ้ง</th>
                  <th style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '9pt', width: '28%', border: '1px solid black' }}>สาเหตุของปัญหา</th>
                  <th style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '9pt', width: '28%', border: '1px solid black' }}>การแก้ไข/ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((reportItem, index) => (
                  <tr key={reportItem.id || index}>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', border: '1px solid black', padding: '6px' }}>
                      {formatDate(reportItem.reportDate)}
                    </td>
                    <td style={{ textAlign: 'left', border: '1px solid black', padding: '6px' }}>
                      {reportItem.complain || ''}
                    </td>
                    <td style={{ textAlign: 'left', border: '1px solid black', padding: '6px' }}>
                      {reportItem.causesOfFailure || ''}
                    </td>
                    <td style={{ textAlign: 'left', border: '1px solid black', padding: '6px' }}>
                      {reportItem.actionTaken || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {/* Status, Signature and Service Staff Section - This section should be together */}
          <Box className="page-break-inside-avoid">
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Typography variant='body1' sx={{ fontWeight: 'bold', mb: 1 }}>
                  Status of work
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={<Checkbox size='small' checked />}
                    label='Completed'
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '9pt' } }}
                  />
                  <FormControlLabel
                    control={<Checkbox size='small' />}
                    label='Follow-up'
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '9pt' } }}
                  />
                </Box>
              </Grid>
              <Grid item xs={8}>
                <TableContainer sx={{ border: '1px solid black' }}>
                  <Table size='small' sx={{ '& td, & th': { border: '1px solid black', verticalAlign: 'top' } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Report by</TableCell>
                        <TableCell sx={{ width: '70%' }}>{reporterName || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell>{formatDate(new Date().toISOString().split('T')[0])}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Remark</TableCell>
                        <TableCell sx={{ height: '40px' }}></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Customer sign</TableCell>
                        <TableCell sx={{ height: '60px' }}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>

            {/* Service Staff Table */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='body1' sx={{ fontWeight: 'bold', mb: 1 }}>
                Service staff and working time
              </Typography>
              <TableContainer sx={{ border: '1px solid black' }}>
                <Table className="service-staff-table" size='small' sx={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}>
                  <TableHead sx={{ bgcolor: '#f0f0f0' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>Engineer name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Start</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '10%' }}>End</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Working hours</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Travelling hours</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '20%' }}>Charging</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {serviceStaff.length > 0 ? (
                      serviceStaff.map((staff, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ height: '40px' }}>{staff.name}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{staff.date}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{staff.start}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{staff.end}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{staff.workingHours}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{staff.travellingHours}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{staff.charging}</TableCell>
                        </TableRow>
                      ))
                    ) : (

                      <TableRow>
                        <TableCell sx={{ height: '40px' }} colSpan={7}>
                          No service staff data available.
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={6} align='right' sx={{ fontWeight: 'bold', paddingRight: 2 }}>
                        Approved by :
                      </TableCell>
                      <TableCell sx={{ height: '60px' }}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* Footer */}
          <Box className="report-footer" sx={{
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
          }}>
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

PrintableServiceReport.displayName = 'PrintableServiceReport';

export default PrintableServiceReport

/* Move the following CSS to a separate file, e.g., PrintableServiceReport.css, and import it in this file:

@media print {
  .main-report-table thead {
    display: table-header-group !important;
  }
  .main-report-table tfoot {
    display: table-footer-group !important;
  }
}
*/
