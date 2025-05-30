// src/components/report/PrintableServiceReport.tsx
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Checkbox, FormControlLabel, Grid } from '@mui/material';
import { ServiceReport, Project } from '../../types';
import { combineImageUrl, formatDate } from '../../lib/utils';

// Import the getName function
import { getName } from '../../lib/api/auth'; // Adjust path if needed

interface PrintableServiceReportProps {
  reports: ServiceReport[];
  project?: Project;
}

const PrintableServiceReport: React.FC<PrintableServiceReportProps> = ({ reports, project }) => {
  // State to hold the reporter's name
  const [reporterName, setReporterName] = useState<string | null>(null);

  useEffect(() => {
    // Get the name from localStorage when the component mounts
    setReporterName(getName());
  }, []); // Empty dependency array means this runs once on mount

  if (!reports || reports.length === 0) {
    return <Typography>No service report data available for printing.</Typography>;
  }

  const projectName = project?.name || "N/A";
  const customerName = project?.customerName || "N/A";
  const customerAddress = project?.customerAddress || "N/A";
  const contactPerson = project?.contactPerson || "N/A";
  const contactTel = project?.tel || "N/A";
  const serviceUnder = project?.serviceUnder || "N/A";

  const serviceStaff = [
    { name: "", date: "", start: "", end: "", workingHours: "", travellingHours: "", charging: "Non Charge" },
  ];

  return (
    <Box sx={{
      p: 4,
      maxWidth: '794px', // A4 width
      margin: '0 auto',
      bgcolor: 'background.paper',
      color: 'text.primary',
      fontFamily: 'Sarabun, sans-serif',
      fontSize: '10pt',
      lineHeight: 1.5,
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src='/images/g-logo.png' // Direct local image path
            alt="G Innovation Logo"
            style={{ width: 120, height: 60, objectFit: 'contain' }}
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '12pt' }}>
            G Innovation Co.,Ltd.
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '13pt' }}>
          Service Report
        </Typography>
      </Box>

      {/* Customer Info */}
      <TableContainer component={Box} sx={{ mb: 3, border: '1px solid #ccc' }}>
        <Table size="small" sx={{ '& td, & th': { border: '1px solid #ccc', p: 0.5 } }}>
          <TableBody>
            {[
              ['Project', projectName],
              ['Customer', customerName],
              ['Address', customerAddress],
              ['Contact Person', contactPerson],
              ['Contact Tel', contactTel],
              ['Service under', serviceUnder],
            ].map(([label, value]) => (
              <TableRow key={label}>
                <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>{label}</TableCell>
                <TableCell sx={{ width: '80%', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Main Report */}
      <TableContainer component={Box} sx={{ mb: 3, border: '1px solid #ccc' }}>
        <Table size="small" sx={{ '& td, & th': { border: '1px solid #ccc', p: 0.5, verticalAlign: 'top' } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f0f0' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '10%', whiteSpace: 'nowrap' }}>วันที่</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>รายละเอียดที่แจ้ง</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>สาเหตุของปัญหา</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>การแก้ไข/ดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((reportItem) => (
              <TableRow key={reportItem.id}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(reportItem.reportDate)}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{reportItem.complain}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{reportItem.causesOfFailure}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{reportItem.actionTaken}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status and Signature */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>Status of work</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel control={<Checkbox size="small" />} label="Completed" checked sx={{ '& .MuiFormControlLabel-label': { fontSize: '10pt' } }} />
            <FormControlLabel control={<Checkbox size="small" />} label="Follow-up" sx={{ '& .MuiFormControlLabel-label': { fontSize: '10pt' } }} />
          </Box>
        </Grid>
        <Grid item xs={8}>
          <TableContainer component={Box} sx={{ border: '1px solid #ccc' }}>
            <Table size="small" sx={{ '& td, & th': { border: '1px solid #ccc', p: 0.5 } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Report by</TableCell>
                  <TableCell sx={{ width: '70%', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {reporterName || 'N/A'} {/* Use the state variable here */}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell>{formatDate(new Date().toISOString().split('T')[0])}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Remark</TableCell>
                  <TableCell sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer sign</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Staff Time */}
      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>Service staff and working time</Typography>
      <TableContainer component={Box} sx={{ mb: 3, border: '1px solid #ccc' }}>
        <Table size="small" sx={{ '& td, & th': { border: '1px solid #ccc', p: 0.5, verticalAlign: 'top' } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f0f0' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Engineer name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Start</TableCell>
              <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>End</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Working hours</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Travelling hours</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Charging</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {serviceStaff.map((staff, index) => (
              <TableRow key={index}>
                <TableCell sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{staff.name}</TableCell>
                <TableCell>{staff.date}</TableCell>
                <TableCell>{staff.start}</TableCell>
                <TableCell>{staff.end}</TableCell>
                <TableCell>{staff.workingHours}</TableCell>
                <TableCell>{staff.travellingHours}</TableCell>
                <TableCell>{staff.charging}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold' }}>Approved by :</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 4, fontSize: '8pt', color: 'text.secondary' }}>
        <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
          G INNOVATION CO.,LTD. 238/5 Ratchadapisek Rd., kwang Huai khwang, Khet Huai khwang, Bangkok 10320
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
          Tel : 02-553-3138-40 Fax : 02-553-1027 www.ginnovation.co.th
        </Typography>
      </Box>
    </Box>
  );
};

export default PrintableServiceReport;