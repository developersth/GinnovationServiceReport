// src/app/admin/services/page.tsx
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

// --- เพิ่ม Import สำหรับ AddIcon ---
import AddIcon from '@mui/icons-material/Add';
// ----------------------------------

import ServiceReportTable from '../../components/service/ServiceReportTable';
import ServiceReportForm from '../../components/service/ServiceReportForm';
import { getServiceReports, addServiceReport, updateServiceReport, deleteServiceReport } from '../../lib/service-report-data';
import { ServiceReport } from '../../types';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ServiceReportsPage() {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ServiceReport | undefined>(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getServiceReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch service reports:', error);
      setSnackbarMessage('Failed to load service reports.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenAddForm = () => {
    setEditingReport(undefined);
    setOpenFormModal(true);
  };

  const handleEditReport = (report: ServiceReport) => {
    setEditingReport(report);
    setOpenFormModal(true);
  };

  const handleFormSubmit = async (reportData: Omit<ServiceReport, 'id'> | ServiceReport) => {
    try {
      if ('id' in reportData) {
        await updateServiceReport(reportData as ServiceReport);
        setSnackbarMessage('Service Report updated successfully!');
      } else {
        await addServiceReport(reportData);
        setSnackbarMessage('Service Report added successfully!');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setOpenFormModal(false);
      fetchReports();
    } catch (error) {
      console.error('Error saving service report:', error);
      setSnackbarMessage('Failed to save service report.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service report?')) {
      try {
        await deleteServiceReport(id);
        setSnackbarMessage('Service Report deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchReports();
      } catch (error) {
        console.error('Error deleting service report:', error);
        setSnackbarMessage('Failed to delete service report.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setEditingReport(undefined);
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
          Service Report Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddForm}
          startIcon={<AddIcon />} 
        >
          Add Service Report
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ServiceReportTable
          reports={reports}
          onEdit={handleEditReport}
          onDelete={handleDeleteReport}
        />
      )}

      <Dialog open={openFormModal} onClose={handleCloseFormModal}>
        <DialogContent>
          <ServiceReportForm
            initialData={editingReport}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseFormModal}
          />
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}