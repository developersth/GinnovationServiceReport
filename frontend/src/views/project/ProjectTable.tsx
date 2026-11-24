import { Avatar, Button, Card, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import BusinessOutlined from '@mui/icons-material/BusinessOutlined'

import type { Project } from '@/types'
import { combineImageUrl } from '@/utils'

type ProjectTableProps = {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export default function ProjectTable({ projects, onEdit, onDelete }: ProjectTableProps) {
  return (
    <TableContainer component={Card} variant='outlined'>
      <Table size='small' sx={{ minWidth: 490 }} aria-label='รายการโครงการ'>
        <TableHead>
          <TableRow>
            <TableCell>โครงการ</TableCell>
            <TableCell>ลูกค้า</TableCell>
            <TableCell>ผู้ติดต่อ</TableCell>
            <TableCell align='right'>การดำเนินการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map(project => (
            <TableRow key={project.id} hover>
              <TableCell component='th' scope='row'>
                <Stack direction='row' alignItems='center' spacing={1.25}>
                  <Avatar variant='rounded' src={combineImageUrl(project.imageUrl)} sx={{ bgcolor: 'action.selected', color: 'success.main' }}>
                    <BusinessOutlined fontSize='small' />
                  </Avatar>
                  <div>
                    <Typography fontWeight={700}>{project.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{project.id}</Typography>
                  </div>
                </Stack>
              </TableCell>
              <TableCell>{project.customerName || '—'}</TableCell>
              <TableCell>{project.contactPerson || '—'}</TableCell>
              <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                <Button onClick={() => onEdit(project)}>แก้ไข</Button>
                <Button color='error' onClick={() => onDelete(project.id)}>ลบ</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
