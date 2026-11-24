'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import AddIcon from '@mui/icons-material/Add'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Dayjs } from 'dayjs'

import { getUsername } from '@/libs/api/auth'
import type { Project, ServiceReport, StaffWorkingTime } from '@/types'
import { combineImageUrl } from '@/utils'

import { bangkokMidnight, formatReportDate, reportDatePickerValue } from './reportDate'
import { reportStatus, reportStatuses } from './reportStatus'

interface ServiceReportFormProps {
  initialData?: ServiceReport
  onSubmit: (report: Omit<ServiceReport, 'id'> | ServiceReport) => Promise<void>
  onCancel: () => void
  projects: Project[]
}

interface ImagePreview {
  id: string
  url: string
  name: string
  file?: File
  path?: string
}

const channels = ['โทรศัพท์', 'อีเมล', 'Line', 'อื่นๆ']

const fieldGrid = {
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
  gap: 2
}

export default function ServiceReportForm({ initialData, onSubmit, onCancel, projects }: ServiceReportFormProps) {
  const [projectId, setProjectId] = useState(initialData?.projectId ?? '')
  const [reportedBy, setReportedBy] = useState(initialData?.reportedBy ?? '')
  const [complain, setComplain] = useState(initialData?.complain ?? '')
  const [details, setDetails] = useState(initialData?.details ?? '')
  const [causesOfFailure, setCausesOfFailure] = useState(initialData?.causesOfFailure ?? '')
  const [actionTaken, setActionTaken] = useState(initialData?.actionTaken ?? '')
  const [channel, setChannel] = useState(initialData?.channel || channels[0])
  const [status, setStatus] = useState<ServiceReport['status']>(initialData?.status || 'Open')
  const [reportDate, setReportDate] = useState<Dayjs | null>(() => reportDatePickerValue(initialData?.reportDate))
  const [staffTimes, setStaffTimes] = useState<StaffWorkingTime[]>(initialData?.staffWorkingTime ?? [])

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>(() =>
    (initialData?.imagePaths ?? [])
      .filter((path): path is string => typeof path === 'string' && Boolean(path))
      .map((path, index) => ({
        id: `${index}-${path}`,
        path,
        url: combineImageUrl(path),
        name: path.split('/').pop() || 'รูปแนบ'
      }))
  )

  const [fullImage, setFullImage] = useState<ImagePreview>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const objectUrls = useRef(new Set<string>())
  const sequence = useRef(0)

  useEffect(() => {
    const urls = objectUrls.current

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  const addStaff = () => {
    const staff: StaffWorkingTime = {
      id: `staff-${Date.now()}-${sequence.current++}`,
      engineerName: '',
      workingDate: bangkokMidnight(reportDatePickerValue()),
      startTime: '08:30',
      endTime: '17:30',
      workingHours: 8,
      travellingHours: 0,
      description: '',
      isCharging: false
    }

    setStaffTimes(previous => [...previous, staff])
  }

  const updateStaff = (index: number, fields: Partial<StaffWorkingTime>) => {
    setStaffTimes(previous =>
      previous.map((staff, staffIndex) => (staffIndex === index ? { ...staff, ...fields } : staff))
    )
  }

  const addImages = (event: ChangeEvent<HTMLInputElement>) => {
    const images = Array.from(event.target.files ?? []).map(file => {
      const url = URL.createObjectURL(file)

      objectUrls.current.add(url)

      return { id: `image-${sequence.current++}`, url, name: file.name, file }
    })

    setImagePreviews(previous => [...previous, ...images])
    event.target.value = ''
  }

  const removeImage = (image: ImagePreview) => {
    setImagePreviews(previous => previous.filter(item => item.id !== image.id))
    if (objectUrls.current.delete(image.url)) URL.revokeObjectURL(image.url)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) return

    if (!projects.some(project => project.id === projectId)) {
      setError('กรุณาเลือกโครงการที่ใช้งานอยู่')

      return
    }

    if (!reportDate?.isValid() || !reportedBy.trim() || !complain.trim()) {
      setError('กรุณาระบุวันที่แจ้ง ผู้แจ้ง และปัญหาที่แจ้งให้ครบ')

      return
    }

    if (
      staffTimes.some(
        staff =>
          !staff.engineerName?.trim() || !staff.workingDate || !reportDatePickerValue(staff.workingDate).isValid()
      )
    ) {
      setError('กรุณาระบุชื่อเจ้าหน้าที่และวันที่ปฏิบัติงานให้ครบในแต่ละรายการ')

      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const now = new Date().toISOString()
      const username = getUsername() ?? ''
      const priorDate = initialData?.reportDate

      const payload: Omit<ServiceReport, 'id'> = {
        projectId,
        reportedBy: reportedBy.trim(),
        complain: complain.trim(),
        details: details.trim(),
        causesOfFailure,
        actionTaken,
        channel,
        status,
        reportDate:
          priorDate && reportDatePickerValue(priorDate).isSame(reportDate, 'day')
            ? priorDate
            : bangkokMidnight(reportDate),
        imagePaths: imagePreviews.flatMap<string | File>(image =>
          image.file ? [image.file] : image.path ? [image.path] : []
        ),
        createdBy: initialData?.createdBy ?? username,
        createdAt: initialData?.createdAt ?? now,
        updatedBy: username,
        updatedAt: now,
        staffWorkingTime: staffTimes
      }

      await onSubmit(initialData ? { ...initialData, ...payload } : payload)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'บันทึกรายงานไม่ได้ กรุณาลองใหม่')
    } finally {
      setIsSubmitting(false)
    }
  }

  const channelOptions = channels.includes(channel) ? channels : [...channels, channel]

  const statusOptions = Object.hasOwn(reportStatuses, status)
    ? Object.keys(reportStatuses)
    : [...Object.keys(reportStatuses), status]

  const projectExists = projects.some(project => project.id === projectId)

  return (
    <>
      <Stack component='form' onSubmit={submit} spacing={2.5}>
        <Typography variant='h5' component='h2' id='service-report-form-title'>
          {initialData ? 'แก้ไขรายงานบริการ' : 'เพิ่มรายงานบริการ'}
        </Typography>

        {!projects.length && <Alert severity='warning'>กรุณาเพิ่มโครงการในหน้าโครงการก่อนสร้างรายงาน</Alert>}

        <Box sx={fieldGrid}>
          <TextField
            select
            required
            label='โครงการ'
            value={projectId}
            onChange={event => setProjectId(event.target.value)}
          >
            {projectId && !projectExists && (
              <MenuItem value={projectId} disabled>
                ไม่พบโครงการเดิม
              </MenuItem>
            )}
            {projects.map(project => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker label='วันที่แจ้ง' value={reportDate} format='DD/MM/YYYY' onChange={setReportDate} />
          <TextField
            label='ผู้แจ้ง'
            value={reportedBy}
            onChange={event => setReportedBy(event.target.value)}
            required
          />
          <TextField
            select
            label='ช่องทางการแจ้ง'
            value={channel}
            onChange={event => setChannel(event.target.value)}
            required
          >
            {channelOptions.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label='ปัญหาที่แจ้ง'
          value={complain}
          onChange={event => setComplain(event.target.value)}
          multiline
          minRows={2}
          required
        />
        <TextField
          label='รายละเอียดการปฏิบัติงาน'
          value={details}
          onChange={event => setDetails(event.target.value)}
          multiline
          minRows={2}
        />
        <Box sx={fieldGrid}>
          <TextField
            label='สาเหตุของปัญหา'
            value={causesOfFailure}
            onChange={event => setCausesOfFailure(event.target.value)}
            multiline
            minRows={2}
          />
          <TextField
            label='การแก้ไขและดำเนินการ'
            value={actionTaken}
            onChange={event => setActionTaken(event.target.value)}
            multiline
            minRows={2}
          />
        </Box>

        <Stack spacing={1}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' gap={1}>
            <Typography variant='h6' component='h3'>
              รูปแนบ
            </Typography>
            <Button
              component='label'
              role={undefined}
              tabIndex={-1}
              variant='outlined'
              startIcon={<AttachFileIcon />}
              sx={{ '&:focus-within': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}
            >
              เลือกรูป
              <Box
                component='input'
                type='file'
                accept='image/*'
                multiple
                onChange={addImages}
                sx={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap'
                }}
              />
            </Button>
          </Stack>
          {imagePreviews.length > 0 && (
            <Stack direction='row' flexWrap='wrap' gap={1}>
              {imagePreviews.map(image => (
                <Paper
                  key={image.id}
                  variant='outlined'
                  sx={{ position: 'relative', overflow: 'hidden', width: 96, height: 84 }}
                >
                  <Box
                    component='button'
                    type='button'
                    aria-label={`ดูรูป ${image.name}`}
                    onClick={() => setFullImage(image)}
                    sx={{ p: 0, border: 0, width: '100%', height: '100%', cursor: 'pointer', bgcolor: 'action.hover' }}
                  >
                    <img src={image.url} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <IconButton
                    size='small'
                    aria-label={`นำรูป ${image.name} ออก`}
                    onClick={() => removeImage(image)}
                    sx={{
                      position: 'absolute',
                      right: 2,
                      top: 2,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <DeleteIcon fontSize='small' color='error' />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems={{ sm: 'center' }}
            gap={1}
          >
            <Typography variant='h6' component='h3'>
              เจ้าหน้าที่และเวลาปฏิบัติงาน
            </Typography>
            <Button variant='outlined' startIcon={<AddIcon />} onClick={addStaff}>
              เพิ่มเจ้าหน้าที่
            </Button>
          </Stack>

          {staffTimes.map((staff, index) => (
            <Paper key={staff.id || index} variant='outlined' sx={{ p: 2 }}>
              <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1.5 }}>
                <Typography variant='subtitle2'>เจ้าหน้าที่ {index + 1}</Typography>
                <IconButton
                  color='error'
                  aria-label={`ลบเจ้าหน้าที่รายการ ${index + 1}`}
                  onClick={() => setStaffTimes(previous => previous.filter((_, staffIndex) => staffIndex !== index))}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
              <Box sx={fieldGrid}>
                <TextField
                  label='ชื่อเจ้าหน้าที่'
                  value={staff.engineerName ?? ''}
                  onChange={event => updateStaff(index, { engineerName: event.target.value })}
                  size='small'
                  required
                />
                <DatePicker
                  label='วันที่ปฏิบัติงาน'
                  value={staff.workingDate ? reportDatePickerValue(staff.workingDate) : null}
                  format='DD/MM/YYYY'
                  onChange={value =>
                    updateStaff(index, { workingDate: value?.isValid() ? bangkokMidnight(value) : '' })
                  }
                  slotProps={{ textField: { size: 'small' } }}
                />
                <TextField
                  label='เวลาเริ่ม'
                  type='time'
                  size='small'
                  InputLabelProps={{ shrink: true }}
                  value={staff.startTime ?? ''}
                  onChange={event => updateStaff(index, { startTime: event.target.value })}
                />
                <TextField
                  label='เวลาสิ้นสุด'
                  type='time'
                  size='small'
                  InputLabelProps={{ shrink: true }}
                  value={staff.endTime ?? ''}
                  onChange={event => updateStaff(index, { endTime: event.target.value })}
                />
                <TextField
                  label='ชั่วโมงปฏิบัติงาน'
                  type='number'
                  size='small'
                  inputProps={{ min: 0, step: 'any' }}
                  value={staff.workingHours ?? 0}
                  onChange={event => updateStaff(index, { workingHours: Number(event.target.value) })}
                />
                <TextField
                  label='ชั่วโมงเดินทาง'
                  type='number'
                  size='small'
                  inputProps={{ min: 0, step: 'any' }}
                  value={staff.travellingHours ?? 0}
                  onChange={event => updateStaff(index, { travellingHours: Number(event.target.value) })}
                />
                <TextField
                  label='บันทึกเพิ่มเติม'
                  size='small'
                  value={staff.description ?? ''}
                  onChange={event => updateStaff(index, { description: event.target.value })}
                  multiline
                />
                <FormControlLabel
                  label='คิดค่าบริการ'
                  control={
                    <Checkbox
                      checked={Boolean(staff.isCharging)}
                      onChange={event => updateStaff(index, { isCharging: event.target.checked })}
                    />
                  }
                />
              </Box>
            </Paper>
          ))}
        </Stack>

        <TextField
          select
          label='สถานะ'
          value={status}
          onChange={event => setStatus(event.target.value as ServiceReport['status'])}
          required
        >
          {statusOptions.map(option => {
            const indicator = reportStatus(option)

            return (
              <MenuItem key={option} value={option}>
                <Chip label={indicator.label} color={indicator.color} size='small' />
              </MenuItem>
            )
          })}
        </TextField>

        {initialData && (
          <Box>
            <Typography variant='body2' color='text.secondary'>
              สร้างโดย {initialData.createdBy || 'ไม่ระบุ'} · {formatReportDate(initialData.createdAt)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              แก้ไขล่าสุดโดย {initialData.updatedBy || 'ไม่ระบุ'} · {formatReportDate(initialData.updatedAt)}
            </Typography>
          </Box>
        )}
        {error && <Alert severity='error'>{error}</Alert>}

        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <Button onClick={onCancel} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting || !projects.length}>
            {isSubmitting ? 'กำลังบันทึก' : 'บันทึกรายงาน'}
          </Button>
        </Stack>
      </Stack>

      <Dialog open={Boolean(fullImage)} onClose={() => setFullImage(undefined)} fullWidth maxWidth='md'>
        <DialogContent sx={{ display: 'grid', placeItems: 'center' }}>
          {fullImage && (
            <img
              src={fullImage.url}
              alt={fullImage.name}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFullImage(undefined)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
