// src/app/admin/services/page.tsx
'use client'

import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import type { AlertProps } from '@mui/material/Alert'
import MuiAlert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import AddIcon from '@mui/icons-material/Add'
import DescriptionIcon from '@mui/icons-material/Description'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import 'dayjs/locale/th'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

import type { ServiceReport, Project } from '@/types'

// REMOVED: import { checkAuth } from '@/libs/api/auth'

import {
  getServiceReports,
  addServiceReport,
  updateServiceReport,
  deleteServiceReport,
  getProjects
} from '@/libs/api/data'

import ServiceReportTable from '@views/service-report/ServiceReportTable'
import ServiceReportForm from '@views/service-report/ServiceReportForm'

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

export default function ServiceReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<ServiceReport[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true) // Start with loading true
  const [openFormModal, setOpenFormModal] = useState(false)
  const [editingReport, setEditingReport] = useState<ServiceReport | undefined>(undefined)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success')

  // REMOVED: const [isAuthenticating, setIsAuthenticating] = useState(true)

  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(dayjs())
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(dayjs())
  const [activeFilterStartDate, setActiveFilterStartDate] = useState<Dayjs | null>(dayjs())
  const [activeFilterEndDate, setActiveFilterEndDate] = useState<Dayjs | null>(dayjs())
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])

  const fetchData = async () => {
    setLoading(true)

    try {
      const [reportsData, projectsData] = await Promise.all([getServiceReports(), getProjects()])

      setReports(reportsData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setSnackbarMessage('Failed to load data.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  // Effect to fetch data on component mount, without authentication check
  useEffect(() => {
    fetchData()
  }, []) // Empty dependency array means it runs once on mount

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const reportDate = dayjs(report.reportDate)
      const isAfterStartDate = activeFilterStartDate ? reportDate.isSameOrAfter(activeFilterStartDate, 'day') : true
      const isBeforeEndDate = activeFilterEndDate ? reportDate.isSameOrBefore(activeFilterEndDate, 'day') : true

      return isAfterStartDate && isBeforeEndDate
    })
  }, [reports, activeFilterStartDate, activeFilterEndDate])

  const handleOpenAddForm = () => {
    // REMOVED: Authentication check
    setEditingReport(undefined)
    setOpenFormModal(true)
  }

  const handleEditReport = (report: ServiceReport) => {
    // REMOVED: Authentication check
    setEditingReport(report)
    setOpenFormModal(true)
  }

  const handleFormSubmit = async (reportData: Omit<ServiceReport, 'id'> | ServiceReport) => {
    // REMOVED: Authentication check
    try {
      if ('id' in reportData) {
        const updatedReport: ServiceReport = {
          ...(reportData as ServiceReport),
          updatedAt: new Date().toISOString()
        }

        await updateServiceReport(updatedReport)
        setSnackbarMessage('บันทึกรายงานบริการเรียบร้อยแล้ว!')
      } else {
        const newReport: Omit<ServiceReport, 'id'> = {
          ...reportData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        await addServiceReport(newReport)
        setSnackbarMessage('เพิ่มรายงานบริการเรียบร้อยแล้ว!')
      }

      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      setOpenFormModal(false)
      fetchData()
    } catch (error) {
      console.error('Error saving service report:', error)
      setSnackbarMessage('ไม่สามารถบันทึกรายงานบริการได้')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleDeleteReport = async (id: string) => {
    // REMOVED: Authentication check
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายงานบริการนี้?')) {
      try {
        await deleteServiceReport(id)
        setSnackbarMessage('ลบรายงานบริการเรียบร้อยแล้ว!')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
        fetchData()
      } catch (error) {
        console.error('Error deleting service report:', error)
        setSnackbarMessage('ไม่สามารถลบรายงานบริการได้')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    }
  }

  const handleCloseFormModal = () => {
    setOpenFormModal(false)
    setEditingReport(undefined)
  }

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbarOpen(false)
  }

  const handleSearch = () => {
    setActiveFilterStartDate(selectedStartDate)
    setActiveFilterEndDate(selectedEndDate)
  }

  const handleClearFilter = () => {
    setSelectedStartDate(null)
    setSelectedEndDate(null)
    setActiveFilterStartDate(null)
    setActiveFilterEndDate(null)
    setSelectedReportIds([])
  }

  const handleReportSelection = (reportId: string, isSelected: boolean) => {
    setSelectedReportIds(prevSelected =>
      isSelected ? [...prevSelected, reportId] : prevSelected.filter(id => id !== reportId)
    )
  }

  const handleSelectAllReports = (selectAll: boolean) => {
    if (selectAll) {
      const allFilteredIds = filteredReports.map(r => r.id)

      setSelectedReportIds(allFilteredIds)
    } else {
      setSelectedReportIds([])
    }
  }

  const handleGenerateReport = () => {
    if (selectedReportIds.length > 0) {
      const idsParam = selectedReportIds.join(',')

      router.push(`/reports/selected-reports?ids=${idsParam}`)
    } else {
      setSnackbarMessage('กรุณาเลือกร่างรายงานอย่างน้อยหนึ่งรายการเพื่อสร้างรายงาน')
      setSnackbarSeverity('info')
      setSnackbarOpen(true)
    }
  }

  // Display loading message
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Box>
    )
  }

  // REMOVED: The entire authentication check block that rendered if (!checkAuth())

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='th'>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 4
          }}
        >
          <Typography variant='h4' component='h1'>
            การจัดการรายงานบริการ
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <Button fullWidth variant='contained' color='primary' onClick={handleOpenAddForm} startIcon={<AddIcon />}>
              เพิ่มบริการ
            </Button>
            <Button
              fullWidth
              variant='contained'
              color='secondary'
              onClick={handleGenerateReport}
              startIcon={<DescriptionIcon />}
              disabled={selectedReportIds.length === 0}
            >
              สร้างรายงาน
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            alignItems: 'center',
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Typography variant='subtitle1' sx={{ width: { xs: '100%', sm: 'auto' } }}>
            กรองตามวันที่:
          </Typography>
          <DatePicker
            label='วันที่เริ่มต้น'
            value={selectedStartDate}
            onChange={newValue => setSelectedStartDate(newValue)}
            format='DD/MM/YYYY'
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: { xs: '100%', sm: '180px' } }
              }
            }}
          />
          <DatePicker
            label='วันที่สิ้นสุด'
            value={selectedEndDate}
            onChange={newValue => setSelectedEndDate(newValue)}
            format='DD/MM/YYYY'
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: { xs: '100%', sm: '180px' } }
              }
            }}
          />
          <Button
            variant='contained'
            color='primary'
            onClick={handleSearch}
            sx={{ height: '40px', width: { xs: '100%', sm: 'auto' } }}
          >
            ค้นหา
          </Button>
          <Button
            variant='outlined'
            onClick={handleClearFilter}
            sx={{ height: '40px', width: { xs: '100%', sm: 'auto' } }}
          >
            ล้างตัวกรอง
          </Button>
        </Box>

        <ServiceReportTable
          reports={filteredReports}
          projects={projects}
          onEdit={handleEditReport}
          onDelete={handleDeleteReport}
          selectedReportIds={selectedReportIds}
          onSelectReport={handleReportSelection}
          onSelectAllReports={handleSelectAllReports}
        />

        <Dialog open={openFormModal} onClose={handleCloseFormModal} maxWidth='md' fullWidth>
          <DialogContent sx={{ px: { xs: 1, sm: 3 } }}>
            <ServiceReportForm
              initialData={editingReport}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseFormModal}
              projects={projects}
            />
          </DialogContent>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  )
}
