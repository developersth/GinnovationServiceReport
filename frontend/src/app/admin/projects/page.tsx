// src/app/admin/projects/page.tsx
'use client'; // Client Component เพราะจัดการ state ของข้อมูลและ UI interactivity

import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog'; // สำหรับ Modal
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MuiAlert, { AlertProps } from '@mui/material/Alert'; // สำหรับแสดงข้อความแจ้งเตือน
import Snackbar from '@mui/material/Snackbar'; // สำหรับแสดงข้อความแจ้งเตือน

import ProjectTable from '../../components/project/ProjectTable';
import ProjectForm from '../../components/project/ProjectForm';
import { getProjects, addProject, updateProject, deleteProject } from '../../lib/data'; // Import data functions
import { Project } from '../../types';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Function to fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setSnackbarMessage('Failed to load projects.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAddForm = () => {
    setEditingProject(undefined); // Clear any editing state
    setOpenFormModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setOpenFormModal(true);
  };

  const handleFormSubmit = async (projectData: Omit<Project, 'id'> | Project) => {
    try {
      if ('id' in projectData) {
        // Update existing project
        await updateProject(projectData as Project);
        setSnackbarMessage('Project updated successfully!');
        setSnackbarSeverity('success');
      } else {
        // Add new project
        await addProject(projectData);
        setSnackbarMessage('Project added successfully!');
        setSnackbarSeverity('success');
      }
      setSnackbarOpen(true);
      setOpenFormModal(false); // Close the modal
      fetchProjects(); // Re-fetch data
    } catch (error) {
      console.error("Error saving project:", error);
      setSnackbarMessage('Failed to save project.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteProject = async (id: string) => {
    // Implement a confirmation dialog here if desired
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        setSnackbarMessage('Project deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchProjects(); // Re-fetch data
      } catch (error) {
        console.error("Error deleting project:", error);
        setSnackbarMessage('Failed to delete project.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setEditingProject(undefined); // Reset editing state
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
          การจัดการโปรเจกต์
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpenAddForm}>
          เพิ่มโปรเจกต์ใหม่
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProjectTable
          projects={projects}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />
      )}

      {/* Form Modal for Add/Edit */}
      <Dialog open={openFormModal} onClose={handleCloseFormModal}>
        <DialogContent>
          <ProjectForm
            initialData={editingProject}
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