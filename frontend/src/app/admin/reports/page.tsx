// src/app/admin/services/page.tsx
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description'; // Import Description icon for report button
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import 'dayjs/locale/th'; // Import Thai locale for Day.js
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import ServiceReportTable from '../../components/service/ServiceReportTable';
import ServiceReportForm from '../../components/service/ServiceReportForm';
import { getServiceReports, addServiceReport, updateServiceReport, deleteServiceReport, getProjects } from '../../lib/data';
import { ServiceReport, Project } from '../../types';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ServiceReportsPage() {
  const router = useRouter(); // Initialize useRouter
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ServiceReport | undefined>(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  // State for DatePicker values (what user selects in UI)
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(dayjs());
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(dayjs());

  // State for actual filter dates (what the table filters by)
  const [activeFilterStartDate, setActiveFilterStartDate] = useState<Dayjs | null>(dayjs());
  const [activeFilterEndDate, setActiveFilterEndDate] = useState<Dayjs | null>(dayjs());

  // New state for selected report IDs for multi-selection
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsData, projectsData] = await Promise.all([
        getServiceReports(),
        getProjects()
      ]);
      setReports(reportsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setSnackbarMessage('Failed to load data.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter reports based on active filter dates (triggered by Search button)
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const reportDate = dayjs(report.reportDate);
      const isAfterStartDate = activeFilterStartDate ? reportDate.isSameOrAfter(activeFilterStartDate, 'day') : true;
      const isBeforeEndDate = activeFilterEndDate ? reportDate.isSameOrBefore(activeFilterEndDate, 'day') : true;
      return isAfterStartDate && isBeforeEndDate;
    });
  }, [reports, activeFilterStartDate, activeFilterEndDate]);

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
      fetchData(); // Re-fetch data after submission
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
        fetchData(); // Re-fetch data after deletion
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

  // Handler for the Search button
  const handleSearch = () => {
    setActiveFilterStartDate(selectedStartDate);
    setActiveFilterEndDate(selectedEndDate);
  };

  // Handler for the Clear Filter button
  const handleClearFilter = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setActiveFilterStartDate(null);
    setActiveFilterEndDate(null);
    setSelectedReportIds([]); // Clear selected IDs when filters are cleared
  };

  // Handler for selecting/deselecting individual reports
  const handleReportSelection = (reportId: string, isSelected: boolean) => {
    setSelectedReportIds((prevSelected) =>
      isSelected
        ? [...prevSelected, reportId]
        : prevSelected.filter((id) => id !== reportId)
    );
  };
const handleSelectAllReports = (selectAll: boolean) => {
  if (selectAll) {
    // Select all visible/filtered report IDs
    const allFilteredIds = filteredReports.map((r) => r.id);
    setSelectedReportIds(allFilteredIds);
  } else {
    setSelectedReportIds([]);
  }
};
  // Handler for generating a combined report from selected items
  const handleGenerateReport = () => {
    if (selectedReportIds.length > 0) {
      // Navigate to a new page, passing selected IDs as a comma-separated query parameter
      const idsParam = selectedReportIds.join(',');
      router.push(`/admin/reports/selected-reports?ids=${idsParam}`);
    } else {
      setSnackbarMessage('Please select at least one report to generate.');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Service Report Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}> {/* Group buttons */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAddForm}
              startIcon={<AddIcon />}
            >
              Add Service Report
            </Button>
            <Button
              variant="contained"
              color="secondary" // Use a distinct color for the report button
              onClick={handleGenerateReport}
              startIcon={<DescriptionIcon />} // Icon for report/document
              disabled={selectedReportIds.length === 0} // Disable if no reports are selected
            >
              สร้างรายงาน
            </Button>
          </Box>
        </Box>

        {/* Date Filter Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Typography variant="subtitle1">Filter by Date:</Typography>
          <DatePicker
            label="Start Date"
            value={selectedStartDate}
            onChange={(newValue) => setSelectedStartDate(newValue)}
            format="DD/MM/YYYY" // Set display format
            slotProps={{ textField: { size: 'small', sx: { width: '180px' } } }}
          />
          <DatePicker
            label="End Date"
            value={selectedEndDate}
            onChange={(newValue) => setSelectedEndDate(newValue)}
            format="DD/MM/YYYY" // Set display format
            slotProps={{ textField: { size: 'small', sx: { width: '180px' } } }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ height: '40px' }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearFilter}
            sx={{ height: '40px' }}
          >
            Clear Filter
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ServiceReportTable
            reports={filteredReports}
            projects={projects}
            onEdit={handleEditReport}
            onDelete={handleDeleteReport}
            selectedReportIds={selectedReportIds} // Pass selected IDs to the table
            onSelectReport={handleReportSelection} // Pass the selection handler to the table
            onSelectAllReports={handleSelectAllReports}
          />
        )}

        <Dialog open={openFormModal} onClose={handleCloseFormModal}>
          <DialogContent>
            <ServiceReportForm
              initialData={editingReport}
              projects={projects}
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
    </LocalizationProvider>
  );
}
