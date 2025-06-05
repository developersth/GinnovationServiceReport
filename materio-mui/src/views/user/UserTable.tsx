// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import EditIcon from '@mui/icons-material/Edit'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'

import type { User } from '../../types'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>ชื่อผู้ใช้งาน</th>
              <th>ชื่อ-สกุล</th>
              <th>อีเมล</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((row, index) => {
              // Calculate a unique avatar number (1-8) based on the user's index
              // This ensures that avatars cycle through the available images
              const avatarNumber = (index % 8) + 1
              const avatarSrc = `/images/avatars/${avatarNumber}.png`

              return (
                <tr key={index}>
                  <td className='!plb-1'>
                    <div className='flex items-center gap-3'>
                      <CustomAvatar src={avatarSrc} size={34} /> {/* Dynamically set the avatar source */}
                      <div className='flex flex-col'>
                        <Typography variant='body2'>{row.username}</Typography>
                      </div>
                    </div>
                  </td>
                  <td className='!plb-1'>
                    <Typography>{row.name}</Typography>
                  </td>
                  <td className='!plb-1'>
                    <Typography>{row.email}</Typography>
                  </td>
                  <td className='!plb-1'>
                    <div className='flex gap-2'>
                      <Typography color='text.primary'>{row.role}</Typography>
                    </div>
                  </td>
                  <td className='!pb-1'>
                    <div className='flex gap-2'>
                      <Chip icon={<EditIcon />} label='Edit' color='info' onClick={() => onEdit(row)} />
                      <Chip
                        label='Delete'
                        color='error'
                        onDelete={() => onDelete(row.id)}
                        deleteIcon={<i className='ri-delete-bin-7-line' />}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
