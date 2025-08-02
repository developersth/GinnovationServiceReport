// src/components/project/ProjectTable.tsx
'use client' // Client Component เพราะใช้ state, event handlers

import * as React from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card' // Added Card
import Chip from '@mui/material/Chip' // Added Chip
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box' // Added Box for flex layout

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar' // Assuming you want to use CustomAvatar for project images

// Styles Imports
import tableStyles from '@core/styles/table.module.css' // Re-using table styles

import type { Project } from '../../types'
import { combineImageUrl } from '../../utils' // <--- เพิ่มการ import นี้

interface ProjectTableProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export default function ProjectTable({ projects, onEdit, onDelete }: ProjectTableProps) {
  return (
    <Card>
      {/* Use a div with overflow-x-auto for responsive table */}
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              {/* No line breaks or extra spaces between these <th> tags to prevent hydration errors */}
              <th>รหัส</th>
              <th>ชื่อโปรเจกต์</th>
              <th>รูปภาพ</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td className='!plb-1'>
                  {' '}
                  {/* Consistent padding class */}
                  <Typography variant='body2'>{project.id}</Typography>
                </td>
                <td className='!plb-1'>
                  <Typography>{project.name}</Typography>
                </td>
                <td className='!plb-1'>
                  {/* Using CustomAvatar instead of plain Avatar for consistency */}
                  <CustomAvatar
                    alt={project.name}
                    src={combineImageUrl(project.imageUrl)}
                    size={34}
                    variant='rounded'
                  />
                </td>
                <td className='!pb-1'>
                  {' '}
                  {/* Consistent padding class */}
                  {/* Use Box for flex container for actions, similar to UserTable */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {' '}
                    {/* Using sx prop for gap */}
                    <Chip
                      icon={<EditIcon />}
                      label='แก้ไข' // Changed label to Thai
                      color='info'
                      onClick={() => onEdit(project)}
                    />
                    <Chip
                      label='ลบ' // Changed label to Thai
                      color='error'
                      onDelete={() => onDelete(project.id)}
                      deleteIcon={<DeleteIcon />} // Using MUI DeleteIcon directly
                    />
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
