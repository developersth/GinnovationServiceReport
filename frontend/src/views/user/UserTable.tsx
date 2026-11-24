import { Avatar, Button, Card, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'

import type { User } from '@/types'

type UserTableProps = {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <TableContainer component={Card} variant='outlined'>
      <Table size='small' sx={{ minWidth: 550 }} aria-label='รายการผู้ใช้งาน'>
        <TableHead>
          <TableRow>
            <TableCell>ผู้ใช้งาน</TableCell>
            <TableCell>อีเมล</TableCell>
            <TableCell>บทบาท</TableCell>
            <TableCell align='right'>การดำเนินการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id} hover>
              <TableCell component='th' scope='row'>
                <Stack direction='row' alignItems='center' spacing={1.25}>
                  <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main' }}>
                    {user.username?.charAt(0).toUpperCase() || 'G'}
                  </Avatar>
                  <div>
                    <Typography fontWeight={700}>{user.name}</Typography>
                    <Typography variant='body2' color='text.secondary'>{user.username}</Typography>
                  </div>
                </Stack>
              </TableCell>
              <TableCell>{user.email || '—'}</TableCell>
              <TableCell><Chip size='small' variant='outlined' label={user.role || 'viewer'} /></TableCell>
              <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                <Button onClick={() => onEdit(user)}>แก้ไข</Button>
                <Button color='error' onClick={() => onDelete(user.id)}>ลบ</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
