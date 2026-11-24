'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import AddIcon from '@mui/icons-material/Add'
import DescriptionIcon from '@mui/icons-material/Description'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

import PageHeader from '@/components/PageHeader'
import { getUsername } from '@/libs/api/auth'
import {
  addServiceReport,
  deleteServiceReport,
  getProjects,
  getServiceReports,
  updateServiceReport
} from '@/libs/api/data'
import type { CombinedReportFormat } from '@/libs/api/reportPdf'
import { storeCombinedReportSelection } from '@/libs/api/reportPdf'
import type { Project, ServiceReport } from '@/types'
import { CustomSnackbarAlert } from '@/views/common/CustomAlert'
import ServiceReportForm from '@views/service-report/ServiceReportForm'
import ServiceReportTable from '@views/service-report/ServiceReportTable'
import { bangkokMidnight, formatReportDate } from '@views/service-report/reportDate'

interface Filters {
  from: string
  to: string
  projectId: string
}

const emptyFilters: Filters = { from: '', to: '', projectId: '' }

export default function ServiceReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<ServiceReport[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState<{ message: string; severity: 'success' | 'error' }>()
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [from, setFrom] = useState<Dayjs | null>(null)
  const [to, setTo] = useState<Dayjs | null>(null)
  const [projectId, setProjectId] = useState('')
  const [filterError, setFilterError] = useState('')
  const [storageKey, setStorageKey] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionError, setSelectionError] = useState('')
  const [format, setFormat] = useState<CombinedReportFormat>('summary')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceReport>()
  const [deleting, setDeleting] = useState<ServiceReport>()
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const key = `service-reports:${getUsername() ?? 'guest'}`

    try {
      const saved = sessionStorage.getItem(key)

      if (saved) {
        const snapshot = JSON.parse(saved) as { filters: Filters; selectedIds: string[]; format: CombinedReportFormat }

        setFilters(snapshot.filters)
        setFrom(snapshot.filters.from ? dayjs(snapshot.filters.from) : null)
        setTo(snapshot.filters.to ? dayjs(snapshot.filters.to) : null)
        setProjectId(snapshot.filters.projectId)
        setSelectedIds(snapshot.selectedIds)
        setFormat(snapshot.format)
      }
    } catch {
      // The page can still load when session storage is disabled.
    }

    setStorageKey(key)
  }, [])

  useEffect(() => {
    if (!storageKey) return

    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ filters, selectedIds, format }))
    } catch {
      // The current selection remains usable without persistence.
    }
  }, [storageKey, filters, selectedIds, format])

  useEffect(() => {
    if (!storageKey) return

    let active = true

    setLoading(true)
    setLoadError('')

    Promise.all([
      getServiceReports({
        projectId: filters.projectId || undefined,
        from: filters.from ? bangkokMidnight(dayjs(filters.from)) : undefined,
        to: filters.to ? bangkokMidnight(dayjs(filters.to).add(1, 'day')) : undefined
      }),
      getProjects()
    ])
      .then(([reportData, projectData]) => {
        if (!active) return

        const reportIds = new Set(reportData.map(report => report.id))

        setReports(reportData)
        setProjects(projectData)
        setSelectedIds(ids => ids.filter(id => reportIds.has(id)))
      })
      .catch((error: unknown) => {
        if (!active) return

        setLoadError(error instanceof Error ? error.message : 'โหลดรายการรายงานไม่ได้ กรุณาลองใหม่')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters, reload, storageKey])

  const selected = reports.filter(report => selectedIds.includes(report.id))
  const selectedProjectId = selected[0]?.projectId
  const selectedProject = projects.find(project => project.id === selectedProjectId)

  const applyFilters = () => {
    if ((from && !from.isValid()) || (to && !to.isValid()) || (from && to && from.isAfter(to, 'day'))) {
      setFilterError('กรุณาระบุวันที่ให้ถูกต้อง โดยวันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มต้น')

      return
    }

    const nextFilters = { from: from?.format('YYYY-MM-DD') ?? '', to: to?.format('YYYY-MM-DD') ?? '', projectId }

    setFilterError('')
    setSelectionError('')
    setFilters(nextFilters)
  }

  const clearFilters = () => {
    setFrom(null)
    setTo(null)
    setProjectId('')
    setFilters(emptyFilters)
    setFilterError('')
    setSelectionError('')
    setSelectedIds([])
  }

  const selectReport = (id: string, checked: boolean) => {
    const report = reports.find(item => item.id === id)

    if (checked && selectedProjectId && report?.projectId !== selectedProjectId) {
      setSelectionError('รายงานรวมต้องอยู่ในโครงการเดียวกัน ล้างรายการที่เลือกก่อนเลือกโครงการอื่น')

      return
    }

    setSelectionError('')
    setSelectedIds(ids => (checked ? Array.from(new Set([...ids, id])) : ids.filter(item => item !== id)))
  }

  const selectAll = (checked: boolean) => {
    if (checked && new Set(reports.map(report => report.projectId)).size !== 1) {
      setSelectionError('เลือกตัวกรองให้เหลือหนึ่งโครงการก่อนเลือกรายงานทั้งหมด')

      return
    }

    setSelectionError('')
    setSelectedIds(checked ? reports.map(report => report.id) : [])
  }

  const previewSelected = () => {
    if (!selectedProjectId || !selected.length) return

    if (selected.some(report => report.projectId !== selectedProjectId)) {
      setReviewOpen(false)
      setSelectionError('รายงานรวมต้องอยู่ในโครงการเดียวกัน กรุณาตรวจรายการที่เลือก')

      return
    }

    const reportIds = selected.map(report => report.id)
    const selectionId = storeCombinedReportSelection(reportIds)

    const params = new URLSearchParams({
      projectId: selectedProjectId,
      count: String(reportIds.length),
      format
    })

    if (selectionId) params.set('selection', selectionId)
    else params.set('ids', reportIds.join(','))

    setReviewOpen(false)
    router.push(`/reports/selected-reports?${params}`)
  }

  const openForm = (report?: ServiceReport) => {
    setEditing(report)
    setFormOpen(true)
  }

  const saveReport = async (report: Omit<ServiceReport, 'id'> | ServiceReport) => {
    if ('id' in report) {
      await updateServiceReport(report)
      setNotice({ severity: 'success', message: 'บันทึกการแก้ไขรายงานแล้ว' })
    } else {
      await addServiceReport(report)
      setNotice({ severity: 'success', message: 'เพิ่มรายงานบริการแล้ว' })
    }

    setFormOpen(false)
    setReload(value => value + 1)
  }

  const removeReport = async () => {
    if (!deleting || deletePending) return

    setDeletePending(true)
    setDeleteError('')

    try {
      await deleteServiceReport(deleting.id)
      setDeleting(undefined)
      setNotice({ severity: 'success', message: 'ลบรายงานบริการแล้ว' })
      setReload(value => value + 1)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'ลบรายงานไม่ได้ กรุณาลองใหม่')
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='th'>
      <Stack spacing={3} sx={{ maxWidth: 1500, mx: 'auto', width: '100%' }}>
        <PageHeader
          title='รายงานบริการ'
          description='ค้นหาบันทึกการปฏิบัติงานและสร้างเอกสาร PDF'
          action={
            <Button variant='contained' startIcon={<AddIcon />} onClick={() => openForm()}>
              เพิ่มรายงาน
            </Button>
          }
        />

        <Paper variant='outlined' component='section' aria-label='ตัวกรองรายงาน' sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={1.5}>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr 1fr',
                  sm: 'repeat(2, minmax(0, 1fr)) minmax(0, 1.4fr)',
                  lg: 'repeat(2, minmax(0, 1fr)) minmax(0, 1.4fr) auto'
                }
              }}
            >
              <DatePicker
                label='วันที่เริ่มต้น'
                value={from}
                onChange={setFrom}
                format='DD/MM/YYYY'
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label='วันที่สิ้นสุด'
                value={to}
                onChange={setTo}
                format='DD/MM/YYYY'
                slotProps={{ textField: { size: 'small' } }}
              />
              <FormControl size='small' sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                <InputLabel id='report-project-label'>โครงการ</InputLabel>
                <Select
                  labelId='report-project-label'
                  label='โครงการ'
                  value={projectId}
                  onChange={event => setProjectId(event.target.value)}
                >
                  <MenuItem value=''>ทุกโครงการ</MenuItem>
                  {projectId && !projects.some(project => project.id === projectId) && (
                    <MenuItem value={projectId} disabled>
                      ไม่พบโครงการที่เลือก
                    </MenuItem>
                  )}
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction='row' spacing={1} sx={{ gridColumn: { xs: '1 / -1', lg: 'auto' } }}>
                <Button variant='contained' onClick={applyFilters}>
                  ค้นหา
                </Button>
                <Button onClick={clearFilters}>ล้างตัวกรอง</Button>
              </Stack>
            </Box>
            {filterError && <Alert severity='warning'>{filterError}</Alert>}
          </Stack>
        </Paper>

        {loadError ? (
          <Alert
            severity='error'
            action={
              <Button color='inherit' onClick={() => setReload(value => value + 1)}>
                ลองใหม่
              </Button>
            }
          >
            {loadError}
          </Alert>
        ) : loading ? (
          <Skeleton variant='rounded' height={240} role='status' aria-label='กำลังโหลดรายงาน' />
        ) : (
          <Stack component='section' aria-label='รายการรายงาน' spacing={1.5}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent='space-between'
              alignItems={{ sm: 'center' }}
            >
              <Box>
                <Typography variant='h6' component='h2'>
                  รายการรายงาน
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {reports.length.toLocaleString('th-TH')} รายงาน
                  {selected.length > 0 && ` · เลือก ${selected.length.toLocaleString('th-TH')} รายการ`}
                </Typography>
              </Box>
              <Stack direction='row' spacing={1}>
                {selected.length > 0 && <Button onClick={() => selectAll(false)}>ล้างที่เลือก</Button>}
                <Button
                  variant='outlined'
                  startIcon={<DescriptionIcon />}
                  onClick={() => setReviewOpen(true)}
                  disabled={!selected.length}
                >
                  สร้างรายงานรวม
                </Button>
              </Stack>
            </Stack>
            {selectionError && (
              <Alert severity='warning' onClose={() => setSelectionError('')}>
                {selectionError}
              </Alert>
            )}
            <ServiceReportTable
              reports={reports}
              projects={projects}
              onEdit={openForm}
              onDelete={report => {
                setDeleteError('')
                setDeleting(report)
              }}
              selectedReportIds={selectedIds}
              onSelectReport={selectReport}
              onSelectAllReports={selectAll}
            />
          </Stack>
        )}

        <Dialog
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          maxWidth='sm'
          fullWidth
          aria-labelledby='combined-report-title'
        >
          <DialogTitle id='combined-report-title'>ตรวจรายการก่อนสร้างรายงานรวม</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography>
                {selectedProject?.name ?? 'ไม่พบชื่อโครงการ'} · {selected.length.toLocaleString('th-TH')} รายงาน
              </Typography>
              <FormControl fullWidth size='small'>
                <InputLabel id='report-format-label'>รูปแบบเอกสาร</InputLabel>
                <Select
                  labelId='report-format-label'
                  label='รูปแบบเอกสาร'
                  value={format}
                  onChange={event => setFormat(event.target.value as CombinedReportFormat)}
                >
                  <MenuItem value='summary'>สรุป</MenuItem>
                  <MenuItem value='details'>สรุปพร้อมรายละเอียดงาน</MenuItem>
                </Select>
              </FormControl>
              <List dense disablePadding sx={{ maxHeight: 250, overflow: 'auto' }}>
                {selected.map(report => (
                  <ListItem divider key={report.id} disableGutters>
                    <ListItemText
                      primary={report.complain || `รายงาน ${report.id.slice(-8)}`}
                      secondary={`${formatReportDate(report.reportDate)} · รหัส ${report.id.slice(-8)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewOpen(false)}>กลับไปเลือก</Button>
            <Button variant='contained' onClick={previewSelected} disabled={!selected.length}>
              สร้างและพรีวิว PDF
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={formOpen}
          maxWidth='md'
          fullWidth
          aria-labelledby='service-report-form-title'
          sx={{ '& .MuiDialog-paper': { m: { xs: 1.5, sm: 4 } } }}
        >
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            <ServiceReportForm
              key={editing?.id ?? 'new'}
              initialData={editing}
              onSubmit={saveReport}
              onCancel={() => setFormOpen(false)}
              projects={projects}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(deleting)}
          onClose={() => !deletePending && setDeleting(undefined)}
          fullWidth
          maxWidth='xs'
        >
          <DialogTitle>ลบรายงานบริการนี้</DialogTitle>
          <DialogContent>
            <Typography>{deleting?.complain || deleting?.id}</Typography>
            {deleteError && (
              <Alert severity='error' sx={{ mt: 2 }}>
                {deleteError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleting(undefined)} disabled={deletePending}>
              ยกเลิก
            </Button>
            <Button variant='contained' color='error' onClick={removeReport} disabled={deletePending}>
              ลบรายงาน
            </Button>
          </DialogActions>
        </Dialog>

        <CustomSnackbarAlert
          open={Boolean(notice)}
          message={notice?.message ?? ''}
          severity={notice?.severity ?? 'success'}
          onClose={() => setNotice(undefined)}
        />
      </Stack>
    </LocalizationProvider>
  )
}
