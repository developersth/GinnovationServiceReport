// src/app/admin/users/page.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import UserTable from '../../components/user/UserTable'
import UserForm from '../../components/user/UserForm';
import { getUsers, addUser, updateUser, deleteUser } from '../../lib/api/data'; // Import user data functions
import { User } from '../../types';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Function to fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setSnackbarMessage('Failed to load users.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddForm = () => {
    setEditingUser(undefined); // Clear any editing state
    setOpenFormModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setOpenFormModal(true);
  };

  const handleFormSubmit = async (userData: Omit<User, 'id'> | User) => {
    try {
      if ('id' in userData) {
        // Update existing user
        await updateUser(userData as User);
        setSnackbarMessage('User updated successfully!');
        setSnackbarSeverity('success');
      } else {
        // Add new user
        await addUser(userData);
        setSnackbarMessage('User added successfully!');
        setSnackbarSeverity('success');
      }
      setSnackbarOpen(true);
      setOpenFormModal(false); // Close the modal
      fetchUsers(); // Re-fetch data
    } catch (error) {
      console.error("Error saving user:", error);
      setSnackbarMessage('Failed to save user.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setSnackbarMessage('User deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchUsers(); // Re-fetch data
      } catch (error) {
        console.error("Error deleting user:", error);
        setSnackbarMessage('Failed to delete user.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setEditingUser(undefined); // Reset editing state
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          การจัดการผู้ใช้งาน
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpenAddForm}>
          เพิ่มผู้ใช้งานใหม่
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      {/* Form Modal for Add/Edit */}
      <Dialog open={openFormModal} onClose={handleCloseFormModal}>
        <DialogContent>
          <UserForm
            initialData={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseFormModal}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}