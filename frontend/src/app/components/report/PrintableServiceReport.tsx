// src/components/report/PrintableServiceReport.tsx
import React from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText, ImageList, ImageListItem } from '@mui/material';
import Grid from '@mui/material/Grid'; 
import { ServiceReport, Project } from '../../types';
import { combineImageUrl, formatDate } from '../../lib/utils';

interface PrintableServiceReportProps {
  report: ServiceReport;
  project?: Project;
}

const PrintableServiceReport: React.FC<PrintableServiceReportProps> = ({ report, project }) => {
  if (!report) {
    return <Typography>No service report data available for printing.</Typography>;
  }

  const currentProject = project;

  return (
    // This Box serves as the container for the printable content
    // It's designed to be clean and minimal for PDF output
    <Box sx={{ p: 4, bgcolor: 'background.paper', color: 'text.primary' }}>
      {/* Header Section: Project Info, Report Date, Reporter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {currentProject?.imageUrl && (
            <img
              src={combineImageUrl(currentProject.imageUrl)}
              alt={currentProject.name}
              style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              {currentProject ? `Project: ${currentProject.name}` : 'Project Not Found'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Service Report Details
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body1">
            **Report Date:** {formatDate(report.reportDate)}
          </Typography>
          <Typography variant="body1">
            **Reporter:** {report.reportedBy}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Detail Section: Complain, CausesOfFailure, ActionTaken, Channel */}
      <Grid container spacing={2}> {/* Reduced spacing for print */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Problem Details
          </Typography>
          <List dense sx={{ '& .MuiListItemText-primary': { fontWeight: 'bold' } }}>
            <ListItem disablePadding>
              <ListItemText
                primary="Complain:"
                secondary={report.complain}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary="Causes of Failure:"
                secondary={report.causesOfFailure}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary="Action Taken:"
                secondary={report.actionTaken}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary="Channel:"
                secondary={report.channel}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary="Status:"
                secondary={report.status}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Images Section */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Attached Images
        </Typography>
        {report.imagePaths && report.imagePaths.length > 0 ? (
          <ImageList sx={{ width: '100%', height: 'auto', mt: 2 }} cols={3} rowHeight={164}>
            {report.imagePaths.map((item, index) => (
              typeof item === 'string' && (
                <ImageListItem key={index}>
                  <img
                    srcSet={`${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format 1x,
                             ${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    src={`${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format`}
                    alt={`Service Report Image ${index + 1}`}
                    loading="lazy"
                    style={{ borderRadius: '4px' }}
                  />
                </ImageListItem>
              )
            ))}
          </ImageList>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No images attached.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PrintableServiceReport;
