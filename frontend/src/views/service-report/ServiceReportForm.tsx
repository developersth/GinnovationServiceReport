// src/components/service/ServiceReportForm.tsx
'use client'

import * as React from 'react'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Avatar from '@mui/material/Avatar'
import ListItemText from '@mui/material/ListItemText'

// import { getProjects } from '../../lib/api/data'; // No longer needed directly here
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import Input from '@mui/material/Input'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

import InputAdornment from '@mui/material/InputAdornment'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'

import { combineImageUrl } from '../../utils'
import type { ServiceReport, Project } from '../../types'
import { getUsername } from '@/libs/api/auth'

// Assuming you have a User type or interface in your project, e.g., in types.ts
// If not, you might define a simple one like this:

interface ServiceReportFormProps {
  initialData?: ServiceReport
  onSubmit: (report: Omit<ServiceReport, 'id'> | ServiceReport) => void
  onCancel: () => void
  projects: Project[]
}

const channels = ['โทรศัพท์', 'อีเมล', 'Line', 'อื่นๆ']
const statuses = ['Open', 'In Progress', 'Resolved', 'Complete', 'Closed']

/**
 * Determines the Material-UI Chip color based on the service report status.
 * This function is duplicated from ServiceReportTable.tsx for consistency.
 * @param status The status of the service report.
 * @returns A Material-UI color variant string.
 */
const getStatusColor = (
  status: ServiceReport['status']
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'Open':
      return 'error' // Red for open issues
    case 'In Progress':
      return 'info' // Blue for in progress
    case 'Resolved':
      return 'success' // Green for resolved
    case 'Complete':
      return 'primary' // Primary color for completed tasks
    case 'Closed':
      return 'default' // Grey for closed tasks
    default:
      return 'default' // Fallback to default
  }
}

export default function ServiceReportForm({ initialData, onSubmit, onCancel, projects }: ServiceReportFormProps) {
  const [projectId, setProjectId] = React.useState(initialData?.projectId || '')
  const [reportedBy, setReportedBy] = React.useState(initialData?.reportedBy || '')
  const [complain, setComplain] = React.useState(initialData?.complain || '')
  const [causesOfFailure, setCausesOfFailure] = React.useState(initialData?.causesOfFailure || '')
  const [actionTaken, setActionTaken] = React.useState(initialData?.actionTaken || '')
  const [channel, setChannel] = React.useState(initialData?.channel || channels[0])

  interface ImagePreviewItem {
    id: string
    url: string
    name: string
    file?: File
    isNew: boolean
  }

  const [imagePreviews, setImagePreviews] = React.useState<ImagePreviewItem[]>(
    initialData?.imagePaths.map(path => ({
      id: path as string,
      url: combineImageUrl(path as string),
      name: (path as string).split('/').pop() || '',
      isNew: false
    })) || []
  )

  const [reportDate, setReportDate] = React.useState<Dayjs | null>(
    initialData ? dayjs(initialData.reportDate) : dayjs()
  )

  const [status, setStatus] = React.useState<ServiceReport['status']>(initialData?.status || 'Open')

  const [openFullImageModal, setOpenFullImageModal] = React.useState(false)
  const [fullImageUrl, setFullImageUrl] = React.useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const newFilesToUpload = imagePreviews.filter(item => item.isNew).map(item => item.file!)
    const existingImagePaths = imagePreviews.filter(item => !item.isNew).map(item => item.id)
    const username = getUsername() ?? ''

    const reportData: Omit<ServiceReport, 'id'> | ServiceReport = {
      projectId,
      reportedBy,
      complain,
      causesOfFailure,
      actionTaken,
      channel,
      imagePaths: [...existingImagePaths, ...newFilesToUpload],
      reportDate: reportDate ? reportDate.toISOString() : '',
      status,

      // Assign currentUser.name to createdBy for new reports,
      // otherwise retain existing createdBy.
      createdBy: username,
      createdAt: initialData?.createdAt || new Date().toISOString(),

      // Always update updatedBy to currentUser.name
      updatedBy: username,
      updatedAt: new Date().toISOString()
    }

    onSubmit(initialData ? { ...initialData, ...reportData } : reportData)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files) {
      const newPreviews: ImagePreviewItem[] = []

      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file)

        newPreviews.push({
          id: file.name + Date.now(),
          url: url,
          name: file.name,
          file: file,
          isNew: true
        })
      })
      setImagePreviews(prev => [...prev, ...newPreviews])
      event.target.value = ''
    }
  }

  const handleDeleteImage = (idToDelete: string) => {
    setImagePreviews(prev => {
      const itemToDelete = prev.find(item => item.id === idToDelete)

      if (itemToDelete && itemToDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToDelete.url)
      }

      return prev.filter(img => img.id !== idToDelete)
    })
  }

  const handleOpenFullImageModal = (url: string) => {
    setFullImageUrl(url)
    setOpenFullImageModal(true)
  }

  const handleCloseFullImageModal = () => {
    setOpenFullImageModal(false)
    setFullImageUrl(null)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component='form' onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { m: 1, width: '100%' }, p: 2 }}>
        <Typography variant='h5' component='h2' gutterBottom>
          {initialData ? 'แก้ไข Service Report' : 'เพิ่ม Service Report'}
        </Typography>
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel id='project-id-label'>โปรเจกต์</InputLabel>
          <Select
            labelId='project-id-label'
            id='project-id'
            value={projectId}
            label='โปรเจกต์'
            onChange={e => setProjectId(e.target.value)}
            required
            renderValue={selectedProjectId => {
              const selectedProject = projects.find(p => p.id === selectedProjectId)

              return selectedProject ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={combineImageUrl(selectedProject.imageUrl)}
                    alt={selectedProject.name}
                    sx={{ width: 24, height: 24 }}
                  />
                  <ListItemText primary={selectedProject.name} />
                </Box>
              ) : (
                ''
              )
            }}
          >
            {projects.map(project => (
              <MenuItem key={project.id} value={project.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={combineImageUrl(project.imageUrl)} alt={project.name} sx={{ width: 24, height: 24 }} />
                  <ListItemText primary={project.name} />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          id='reporter'
          label='ผู้แจ้ง'
          value={reportedBy}
          onChange={e => setReportedBy(e.target.value)}
          required
        />
        <TextField
          id='complain'
          label='Complain'
          value={complain}
          onChange={e => setComplain(e.target.value)}
          required
          multiline
          rows={4}
        />
        <TextField
          id='causesOfFailure'
          label='สาเหตุของปัญหา'
          value={causesOfFailure}
          onChange={e => setCausesOfFailure(e.target.value)}
          multiline
          rows={4}
        />
        <TextField
          id='actionTaken'
          label='การแก้ไข/ดำเนินการ'
          value={actionTaken}
          onChange={e => setActionTaken(e.target.value)}
          multiline
          rows={4}
        />
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel id='channel-label'>ช่องทางการแจ้ง</InputLabel>
          <Select
            labelId='channel-label'
            id='channel'
            value={channel}
            label='ช่องทางการแจ้ง'
            onChange={e => setChannel(e.target.value)}
            required
          >
            {channels.map(ch => (
              <MenuItem key={ch} value={ch}>
                {ch}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ m: 1 }}>
          <Input
            id='image-upload-button'
            type='file'
            inputProps={{ multiple: true, accept: 'image/*' }}
            onChange={handleImageUpload}
            sx={{ display: 'none' }}
          />
          <TextField
            label='รูปภาพ (หลายภาพ)'
            variant='outlined'
            fullWidth
            value={imagePreviews.map(p => p.name).join(', ') || ''}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position='end'>
                  <label htmlFor='image-upload-button'>
                    <Button
                      variant='contained'
                      color='secondary'
                      component='span'
                      startIcon={<AttachFileIcon />}
                      sx={{ ml: 1 }}
                    >
                      เลือกไฟล์
                    </Button>
                  </label>
                </InputAdornment>
              )
            }}
          />
          {imagePreviews.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2, border: '1px solid #ccc', p: 1, borderRadius: '4px' }}>
              {imagePreviews.map(preview => (
                <Box
                  key={preview.id}
                  sx={{
                    position: 'relative',
                    mr: 1,
                    mb: 1,
                    border: '1px solid #eee',
                    p: 0.5,
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleOpenFullImageModal(preview.url)}
                >
                  <img
                    src={preview.url}
                    alt='Preview'
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <IconButton
                    aria-label='delete image'
                    size='small'
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteImage(preview.id)
                    }}
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize='small' color='error' />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <DatePicker
            label='วันที่แจ้ง'
            value={reportDate}
            format='DD/MM/YYYY' // Set display format
            onChange={newValue => setReportDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true
              }
            }}
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel id='status-label'>สถานะ</InputLabel>
          <Select
            labelId='status-label'
            id='status'
            value={status}
            label='สถานะ'
            onChange={e => setStatus(e.target.value as ServiceReport['status'])}
            required
            renderValue={(
              selectedStatus // Render the selected status as a Chip
            ) => (
              <Chip
                label={selectedStatus}
                color={getStatusColor(selectedStatus as ServiceReport['status'])}
                size='small'
              />
            )}
          >
            {statuses.map(st => (
              <MenuItem key={st} value={st}>
                <Chip label={st} color={getStatusColor(st as ServiceReport['status'])} size='small' />{' '}
                {/* Render each MenuItem as a Chip */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Display createdBy and createdAt if initialData exists (for existing reports) */}
        {initialData && (
          <Box sx={{ m: 1, mt: 3, p: 2, border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
            <Typography variant='body2' color='text.secondary'>
              **สร้างโดย:** {initialData.createdBy || 'ไม่ระบุ'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              **สร้างเมื่อ:**{' '}
              {initialData.createdAt ? dayjs(initialData.createdAt).format('DD/MM/YYYY HH:mm') : 'ไม่ระบุ'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              **อัปเดตโดย:** {initialData.updatedBy || 'ไม่ระบุ'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              **อัปเดตเมื่อ:**{' '}
              {initialData.updatedAt ? dayjs(initialData.updatedAt).format('DD/MM/YYYY HH:mm') : 'ไม่ระบุ'}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button variant='outlined' onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type='submit' variant='contained' color='primary'>
            {initialData ? 'บันทึกการแก้ไข' : 'เพิ่ม Service Report'}
          </Button>
        </Box>
      </Box>

      <Dialog open={openFullImageModal} onClose={handleCloseFullImageModal} maxWidth='md' fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          {fullImageUrl && (
            <img
              src={fullImageUrl}
              alt='Full Preview'
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFullImageModal} color='primary'>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}
