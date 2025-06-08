// src/components/report/ServiceReportDetail.tsx
import React from 'react'

import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, ImageList, ImageListItem } from '@mui/material'
import MuiGrid from '@mui/material/Grid'

import type { ServiceReport, Project } from '../../types'
import { combineImageUrl, formatDate } from '../../utils'

interface ServiceReportDetailProps {
  report: ServiceReport
  project?: Project
}

const ServiceReportDetail: React.FC<ServiceReportDetailProps> = ({ report, project }) => {
  if (!report) {
    return <Typography>No service report data available.</Typography>
  }

  const currentProject = project

  return (
    <Paper sx={{ p: 4, my: 4, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {currentProject?.imageUrl && (
            <img
              src={combineImageUrl(currentProject.imageUrl)}
              alt={currentProject.name}
              className='report-logo' // Add this class
              style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
          <Box>
            <Typography variant='h5' component='h2' gutterBottom>
              {currentProject ? `Project: ${currentProject.name}` : 'Project Not Found'}
            </Typography>
            <Typography variant='subtitle1' color='text.secondary'>
              Service Report
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant='body1'>**Report Date:** {formatDate(report.reportDate)}</Typography>
          <Typography variant='body1'>**Reporter:** {report.reportedBy}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

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

      <Box>
        <Typography variant='h6' gutterBottom>
          Attached Images
        </Typography>
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
