'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

// MUI Components
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'

// REMOVED: MuiAlert and Snackbar imports as they are now handled by CustomSnackbarAlert
// import MuiAlert from '@mui/material/Alert'
// import type { AlertProps } from '@mui/material/Alert'
// import Snackbar from '@mui/material/Snackbar'

import AddIcon from '@mui/icons-material/Add'

// Types & APIs
import type { User } from '../../../types/index'
import { getUsers, addUser, updateUser, deleteUser } from '../../../libs/api/data'

// Components
import UserTable from '@/views/user/UserTable'
import UserForm from '@/views/user/UserForm'

// NEW: Import the CustomSnackbarAlert component
import { CustomSnackbarAlert } from '@/views/common/CustomAlert' // <-- ADJUST THIS PATH if your CustomAlert.tsx is elsewhere

// REMOVED: This Alert helper function is no longer needed here
// function Alert(props: AlertProps) {
//   return <MuiAlert elevation={6} variant='filled' {...props} />
// }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openFormModal, setOpenFormModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // ADJUSTED: Added 'info' and 'warning' to severity types for full compatibility
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success')
  const [isMounted, setIsMounted] = useState(false) // Keeping this state for now, though often not strictly needed with Dialog

  useEffect(() => {
    setIsMounted(true)
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)

    try {
      const data = await getUsers()

      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setSnackbarMessage('ไม่สามารถโหลดผู้ใช้งานได้')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddForm = () => {
    setEditingUser(undefined)
    setOpenFormModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setOpenFormModal(true)
  }

  const handleFormSubmit = async (userData: Omit<User, 'id'> | User) => {
    try {
      if ('id' in userData) {
        await updateUser(userData as User)
        setSnackbarMessage('แก้ไขผู้ใช้งานเรียบร้อยแล้ว!')
      } else {
        await addUser(userData)
        setSnackbarMessage('เพิ่มผู้ใช้งานเรียบร้อยแล้ว!')
      }

      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      setOpenFormModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      setSnackbarMessage('ไม่สามารถบันทึกผู้ใช้งานได้')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?')) {
      try {
        await deleteUser(id)
        setSnackbarMessage('ลบผู้ใช้งานเรียบร้อยแล้ว!')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        setSnackbarMessage('ไม่สามารถลบผู้ใช้งานได้')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    }
  }

  const handleCloseFormModal = () => {
    setOpenFormModal(false)
    setEditingUser(undefined)
  }

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false)

    // ADDED: Clear message and reset severity when closing
    setSnackbarMessage('')
    setSnackbarSeverity('info') // Reset to a neutral or default severity
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' component='h1'>
          การจัดการผู้ใช้งาน
        </Typography>
        <Button variant='contained' color='primary' onClick={handleOpenAddForm} startIcon={<AddIcon />}>
          เพิ่มผู้ใช้งานใหม่
        </Button>
      </Box>

      {/* Loading Spinner */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
      )}

      {/* Dialog: Add/Edit User */}
      {isMounted && ( // isMounted check can be debated, but kept as per original code
        <Dialog open={openFormModal} onClose={handleCloseFormModal} keepMounted>
          <DialogContent>
            <UserForm initialData={editingUser} onSubmit={handleFormSubmit} onCancel={handleCloseFormModal} />
          </DialogContent>
        </Dialog>
      )}

      {/* Snackbar - Now using CustomSnackbarAlert */}
      <CustomSnackbarAlert
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}

        // You can add other SnackbarProps here if you want to override defaults
        // e.g., autoHideDuration={4000} or anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Box>
  )
}
