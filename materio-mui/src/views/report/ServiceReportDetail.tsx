// src/components/report/ServiceReportDetail.tsx
import React from 'react'

import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, ImageList, ImageListItem } from '@mui/material'
import MuiGrid from '@mui/material/Grid' // Alias Grid as MuiGrid to avoid potential conflicts

import type { ServiceReport, Project } from '../../types' // Assuming types are here
import { combineImageUrl, formatDate } from '../../utils' // Re-use utilities

interface ServiceReportDetailProps {
  report: ServiceReport
  project?: Project // Project data is passed directly from the parent fetching component
}

const ServiceReportDetail: React.FC<ServiceReportDetailProps> = ({ report, project }) => {
  if (!report) {
    return <Typography>No service report data available.</Typography>
  }

  // The 'project' prop should contain the full Project object if available.
  // We rely on the parent component (e.g., service-report-id-page.tsx) to fetch and pass it.
  const currentProject = project

  return (
    <Paper sx={{ p: 4, my: 4 }}>
      {/* Header Section: Project Info, Report Date, Reporter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Use currentProject?.imageUrl instead of currentProject?.logo */}
          {currentProject?.imageUrl && (
            <img
              src={combineImageUrl(currentProject.imageUrl)}
              alt={currentProject.name}
              style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
          <Box>
            <Typography variant='h5' component='h2' gutterBottom>
              {/* Display Project Name. Removed 'code' as it's not in Project model. */}
              {currentProject ? `Project: ${currentProject.name}` : 'Project Not Found'}
            </Typography>
            <Typography variant='subtitle1' color='text.secondary'>
              Service Report
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant='body1'>**Report Date:** {formatDate(report.reportDate)}</Typography>
          <Typography variant='body1'>
            **Reporter:** {report.reportedBy} {/* Using 'reportedBy' as per updated type */}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Detail Section: Complain, CausesOfFailure, Action Taken, Channel */}
      <MuiGrid container spacing={3}>
        <MuiGrid item xs={12}>
          <Typography variant='h6' gutterBottom>
            Problem Details
          </Typography>
          <List dense>
            <ListItem disablePadding>
              <ListItemText
                primary={<Typography variant='body1'>**Complain:**</Typography>}
                secondary={<Typography variant='body1'>{report.complain}</Typography>}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary={<Typography variant='body1'>**Causes of Failure:**</Typography>}
                secondary={<Typography variant='body1'>{report.causesOfFailure}</Typography>}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary={<Typography variant='body1'>**Action Taken:**</Typography>}
                secondary={<Typography variant='body1'>{report.actionTaken}</Typography>}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary={<Typography variant='body1'>**Channel:**</Typography>}
                secondary={<Typography variant='body1'>{report.channel}</Typography>}
              />
            </ListItem>
          </List>
        </MuiGrid>
      </MuiGrid>

      <Divider sx={{ my: 3 }} />

      {/* Images Section */}
      <Box>
        <Typography variant='h6' gutterBottom>
          Attached Images
        </Typography>
        {/* Use report.imagePaths instead of report.imageUrls */}
        {report.imagePaths && report.imagePaths.length > 0 ? (
          <ImageList sx={{ width: '100%', height: 'auto', mt: 2 }} cols={3} rowHeight={164}>
            {report.imagePaths.map(
              (item, index) =>
                typeof item === 'string' && (
                  <ImageListItem key={index}>
                    <img
                      srcSet={`${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format 1x,
                             ${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                      src={`${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format`}
                      alt={`Service Report Image ${index + 1}`}
                      loading='lazy'
                      style={{ borderRadius: '8px' }}
                    />
                  </ImageListItem>
                )
            )}
          </ImageList>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            No images attached.
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default ServiceReportDetail
