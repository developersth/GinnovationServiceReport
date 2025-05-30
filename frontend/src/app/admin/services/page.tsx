// src/app/admin/services/page.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Snackbar from "@mui/material/Snackbar";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description"; // Import Description icon for report button
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import "dayjs/locale/th"; // Import Thai locale for Day.js
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

import ServiceReportTable from "../../components/service/ServiceReportTable";
import ServiceReportForm from "../../components/service/ServiceReportForm";
import {
  getServiceReports,
  addServiceReport,
  updateServiceReport,
  deleteServiceReport,
  getProjects,
} from "../../lib/api/data";
import { ServiceReport, Project } from "../../types";
// --- Import your custom authentication functions ---
import {
  checkAuth,
  getName,
  logout as authLogout,
  getUsername,
  getUserRole,
} from "../../lib/api/auth";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

// Define the CurrentUser interface
interface CurrentUser {
  username: string; // Optional: The username
  name: string; // The user's display name
}

export default function ServiceReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ServiceReport | undefined>(
    undefined
  );
  const [allProjects, setAllProjects] = useState<Project[]>([]); // Store all projects for the combobox
  const [selectedProjectId, setSelectedProjectId] = useState<string>(""); // State for selected project in combobox
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("success");
  const [isAuthenticating, setIsAuthenticating] = useState(true); // New state for initial auth check
  // State for DatePicker values (what user selects in UI)
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(
    dayjs()
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(dayjs());

  // State for actual filter dates (what the table filters by)
  const [activeFilterStartDate, setActiveFilterStartDate] =
    useState<Dayjs | null>(dayjs());
  const [activeFilterEndDate, setActiveFilterEndDate] = useState<Dayjs | null>(
    dayjs()
  );
  // State for active filter project ID (what the table filters by)
  const [activeFilterProjectId, setActiveFilterProjectId] =
    useState<string>("");

  // New state for selected report IDs
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  // --- Get current user from localStorage using your auth.ts functions ---

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsData, projectsData] = await Promise.all([
        getServiceReports(),
        getProjects(),
      ]);
      setReports(reportsData);
      setProjects(projectsData);
      setAllProjects(projectsData); // Populate allProjects for the combobox
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setSnackbarMessage("Failed to load data.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter reports based on active filter dates and project ID (triggered by Search button)
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const reportDate = dayjs(report.reportDate);
      const isAfterStartDate = activeFilterStartDate
        ? reportDate.isSameOrAfter(activeFilterStartDate, "day")
        : true;
      const isBeforeEndDate = activeFilterEndDate
        ? reportDate.isSameOrBefore(activeFilterEndDate, "day")
        : true;
      const isMatchingProject = activeFilterProjectId
        ? report.projectId === activeFilterProjectId
        : true;
      return isAfterStartDate && isBeforeEndDate && isMatchingProject;
    });
  }, [reports, activeFilterStartDate, activeFilterEndDate, activeFilterProjectId]);

  const handleOpenAddForm = () => {
    setEditingReport(undefined);
    setOpenFormModal(true);
  };

  const handleEditReport = (report: ServiceReport) => {
    setEditingReport(report);
    setOpenFormModal(true);
  };

  const handleFormSubmit = async (
    reportData: Omit<ServiceReport, "id"> | ServiceReport
  ) => {
    try {
      if ("id" in reportData) {
        await updateServiceReport(reportData as ServiceReport);
        setSnackbarMessage("Service Report updated successfully!");
      } else {
        await addServiceReport(reportData);
        setSnackbarMessage("Service Report added successfully!");
      }
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenFormModal(false);
      fetchData(); // Re-fetch data after submission
    } catch (error) {
      console.error("Error saving service report:", error);
      setSnackbarMessage("Failed to save service report.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this service report?")
    ) {
      try {
        await deleteServiceReport(id);
        setSnackbarMessage("Service Report deleted successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchData(); // Re-fetch data after deletion
      } catch (error) {
        console.error("Error deleting service report:", error);
        setSnackbarMessage("Failed to delete service report.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
    setEditingReport(undefined);
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handler for the Search button
  const handleSearch = () => {
    setActiveFilterStartDate(selectedStartDate);
    setActiveFilterEndDate(selectedEndDate);
    setActiveFilterProjectId(selectedProjectId); // Apply project filter
  };

  // Handler for the Clear Filter button
  const handleClearFilter = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectedProjectId(""); // Clear selected project
    setActiveFilterStartDate(null);
    setActiveFilterEndDate(null);
    setActiveFilterProjectId(""); // Clear active project filter
    setSelectedReportIds([]); // Clear selections when filter is cleared
  };

  // Handler for selecting/deselecting reports
  const handleReportSelection = (reportId: string, isSelected: boolean) => {
    setSelectedReportIds((prevSelected) =>
      isSelected
        ? [...prevSelected, reportId]
        : prevSelected.filter((id) => id !== reportId)
    );
  };
  // Handler for selecting/deselecting all reports
  const handleSelectAllReports = (selectAll: boolean) => {
    if (selectAll) {
      // Select all visible/filtered report IDs
      const allFilteredIds = filteredReports.map((r) => r.id);
      setSelectedReportIds(allFilteredIds);
    } else {
      setSelectedReportIds([]);
    }
  };
  // Handler for generating a combined report
  const handleGenerateReport = () => {
    if (selectedReportIds.length > 0) {
      // Navigate to a new page, passing selected IDs as a query parameter
      // Encode the IDs to be safe in URL
      const idsParam = selectedReportIds.join(",");
      router.push(`/admin/reports/selected-reports?ids=${idsParam}`);
    } else {
      setSnackbarMessage("Please select at least one report to generate.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            Service Report Management
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
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
              color="secondary" // Use a different color for distinction
              onClick={handleGenerateReport}
              startIcon={<DescriptionIcon />}
              disabled={selectedReportIds.length === 0} // Disable if no reports are selected
            >
              สร้างรายงาน
            </Button>
          </Box>
        </Box>

        {/* Date Filter Section */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
          <Typography variant="subtitle1">Filter by Date:</Typography>
          <DatePicker
            label="Start Date"
            value={selectedStartDate}
            onChange={(newValue) => setSelectedStartDate(newValue)}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: "small", sx: { width: "180px" } } }}
          />
          <DatePicker
            label="End Date"
            value={selectedEndDate}
            onChange={(newValue) => setSelectedEndDate(newValue)}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: "small", sx: { width: "180px" } } }}
          />
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="project-select-label">เลือกโปรเจกต์</InputLabel>
            <Select
              labelId="project-select-label"
              id="project-select"
              value={selectedProjectId}
              label="เลือกโปรเจกต์"
              onChange={(e) => setSelectedProjectId(e.target.value as string)} // Ensure type is string
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>{" "}
              {/* Added "All" option */}
              {allProjects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ height: "40px" }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearFilter}
            sx={{ height: "40px" }}
          >
            Clear Filter
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ServiceReportTable
            reports={filteredReports}
            projects={projects}
            onEdit={handleEditReport}
            onDelete={handleDeleteReport}
            selectedReportIds={selectedReportIds} // Pass selected IDs to table
            onSelectReport={handleReportSelection} // Pass selection handler to table
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}