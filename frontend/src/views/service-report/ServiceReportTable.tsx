'use client'

import { useState } from 'react'

import Link from 'next/link'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import type { Project, ServiceReport } from '@/types'
import { combineImageUrl } from '@/utils'

import { reportStatus } from './reportStatus'
import { formatReportDate } from './reportDate'

interface ServiceReportTableProps {
  reports: ServiceReport[]
  projects: Project[]
  onEdit: (report: ServiceReport) => void
  onDelete: (report: ServiceReport) => void
  selectedReportIds: string[]
  onSelectReport: (reportId: string, isSelected: boolean) => void
  onSelectAllReports: (isSelected: boolean) => void
}

const wideCell = { display: { xs: 'none', lg: 'table-cell' } }
const tabletCell = { display: { xs: 'none', sm: 'table-cell' } }

const summaryText = {
  overflowWrap: 'anywhere',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
}

export default function ServiceReportTable({
  reports,
  projects,
  onEdit,
  onDelete,
  selectedReportIds,
  onSelectReport,
  onSelectAllReports
}: ServiceReportTableProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const visiblePage = Math.min(page, Math.max(0, Math.ceil(reports.length / rowsPerPage) - 1))
  const displayedReports = reports.slice(visiblePage * rowsPerPage, (visiblePage + 1) * rowsPerPage)
  const selected = new Set(selectedReportIds)
  const selectedCount = reports.filter(report => selected.has(report.id)).length
  const projectNames = new Map(projects.map(project => [project.id, project.name]))

  if (!reports.length) {
    return (
      <Paper variant='outlined' sx={{ textAlign: 'center', py: 6, px: 2 }}>
        <Typography variant='h6'>ไม่พบรายงานบริการ</Typography>
        <Typography color='text.secondary' sx={{ mt: 0.5 }}>
          ลองเปลี่ยนช่วงวันที่หรือเลือกโครงการอื่น
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper variant='outlined' sx={{ minWidth: 0 }}>
      <TableContainer>
        <Table size='small' aria-label='รายการรายงานบริการ'>
          <TableHead>
            <TableRow>
              <TableCell padding='checkbox'>
                <Checkbox
                  checked={selectedCount === reports.length}
                  indeterminate={selectedCount > 0 && selectedCount < reports.length}
                  onChange={event => onSelectAllReports(event.target.checked)}
                  inputProps={{ 'aria-label': 'เลือกรายงานทั้งหมดในผลการค้นหา' }}
                />
              </TableCell>
              <TableCell>รายงาน / โครงการ</TableCell>
              <TableCell sx={wideCell}>ผู้แจ้ง</TableCell>
              <TableCell sx={wideCell}>สาเหตุ</TableCell>
              <TableCell sx={wideCell}>การแก้ไข</TableCell>
              <TableCell sx={wideCell}>รูปแนบ</TableCell>
              <TableCell sx={tabletCell}>วันที่แจ้ง</TableCell>
              <TableCell sx={tabletCell}>สถานะ</TableCell>
              <TableCell align='right' sx={{ pr: { xs: 0.5, sm: 2 } }}>
                จัดการ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedReports.map(report => {
              const projectName = projectNames.get(report.projectId) || 'ไม่พบชื่อโครงการ'
              const shortId = report.id.slice(-8)
              const status = reportStatus(report.status)

              return (
                <TableRow key={report.id} selected={selected.has(report.id)} hover>
                  <TableCell padding='checkbox'>
                    <Checkbox
                      checked={selected.has(report.id)}
                      onChange={event => onSelectReport(report.id, event.target.checked)}
                      inputProps={{ 'aria-label': `เลือกรายงาน ${shortId}` }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: { sm: 140, lg: 180 }, py: 1.5, wordBreak: 'break-word' }}>
                    <Typography variant='body2' fontWeight={650} sx={summaryText}>
                      {report.complain || report.details || `รายงาน ${shortId}`}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={summaryText}>
                      {projectName} · {shortId}
                    </Typography>
                    <Stack spacing={0.5} alignItems='flex-start' sx={{ display: { xs: 'flex', sm: 'none' }, mt: 0.5 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {formatReportDate(report.reportDate)}
                      </Typography>
                      <Chip label={status.label} color={status.color} size='small' />
                    </Stack>
                  </TableCell>
                  <TableCell sx={wideCell}>
                    <Typography variant='body2' sx={summaryText}>
                      {report.reportedBy || '—'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {report.channel || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={wideCell}>
                    <Typography variant='body2' sx={summaryText}>
                      {report.causesOfFailure || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={wideCell}>
                    <Typography variant='body2' sx={summaryText}>
                      {report.actionTaken || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={wideCell}>
                    <Stack direction='row' flexWrap='wrap' gap={0.5} maxWidth={110}>
                      {report.imagePaths
                        ?.filter((path): path is string => typeof path === 'string' && Boolean(path))
                        .map((path, index) => {
                          const url = combineImageUrl(path)

                          return (
                            <Box
                              key={`${path}-${index}`}
                              component='button'
                              type='button'
                              aria-label={`เปิดรูปที่ ${index + 1} ของรายงาน ${shortId}`}
                              onClick={() => setImageUrl(url)}
                              sx={{
                                p: 0,
                                border: 0,
                                borderRadius: 1,
                                cursor: 'pointer',
                                overflow: 'hidden',
                                bgcolor: 'action.hover',
                                width: 34,
                                height: 34
                              }}
                            >
                              <img
                                src={url}
                                alt=''
                                loading='lazy'
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              />
                            </Box>
                          )
                        })}
                      {!report.imagePaths?.length && (
                        <Typography variant='body2' color='text.secondary'>
                          —
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ ...tabletCell, whiteSpace: 'nowrap' }}>
                    {formatReportDate(report.reportDate)}
                  </TableCell>
                  <TableCell sx={tabletCell}>
                    <Chip label={status.label} color={status.color} size='small' />
                  </TableCell>
                  <TableCell align='right' sx={{ pl: 0, pr: { xs: 0.5, sm: 2 } }}>
                    <Stack
                      direction='row'
                      alignItems='center'
                      justifyContent='flex-end'
                      sx={{
                        '& .MuiIconButton-root': {
                          p: { xs: 0.55, sm: 0.85 },
                          minWidth: { xs: 28, sm: 36 },
                          minHeight: { xs: 32, sm: 36 }
                        }
                      }}
                    >
                      <Tooltip title='เปิด PDF'>
                        <IconButton
                          component={Link}
                          href={`/reports/service-report/${encodeURIComponent(report.id)}`}
                          color='primary'
                          aria-label={`เปิด PDF รายงาน ${shortId}`}
                        >
                          <VisibilityIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='แก้ไขรายงาน'>
                        <IconButton onClick={() => onEdit(report)} aria-label={`แก้ไขรายงาน ${shortId}`}>
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='ลบรายงาน'>
                        <IconButton onClick={() => onDelete(report)} aria-label={`ลบรายงาน ${shortId}`} color='error'>
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component='div'
        rowsPerPageOptions={[10, 25, 50, 100]}
        count={reports.length}
        rowsPerPage={rowsPerPage}
        page={visiblePage}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={event => {
          setRowsPerPage(Number(event.target.value))
          setPage(0)
        }}
        labelRowsPerPage='แถวต่อหน้า'
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
        sx={{
          '& .MuiTablePagination-selectLabel': { display: { xs: 'none', sm: 'block' } },
          '& .MuiTablePagination-toolbar': { px: { xs: 0, sm: 2 } }
        }}
      />

      <Dialog open={Boolean(imageUrl)} onClose={() => setImageUrl('')} fullWidth maxWidth='md'>
        <DialogContent sx={{ display: 'grid', placeItems: 'center' }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt='รูปแนบรายงานบริการ'
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageUrl('')}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
