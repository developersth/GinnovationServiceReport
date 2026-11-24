'use client'

import ManagementPage from '@/components/ManagementPage'
import { addProject, deleteProject, getProjects, updateProject } from '@/libs/api/data'
import type { Project } from '@/types'
import ProjectForm from '@/views/project/ProjectForm'
import ProjectTable from '@/views/project/ProjectTable'

export default function ProjectsPage() {
  return (
    <ManagementPage<Project>
      label='โครงการ'
      description='จัดการข้อมูลโครงการ ลูกค้า และผู้ติดต่อที่ใช้ในรายงานบริการ'
      list={getProjects}
      create={addProject}
      update={updateProject}
      remove={deleteProject}
      name={project => project.name}
      searchBy={project => [project.name, project.customerName, project.id].join(' ')}
      table={(projects, edit, remove) => <ProjectTable projects={projects} onEdit={edit} onDelete={remove} />}
      form={(project, save, close, busy) => <ProjectForm initialData={project} onSubmit={save} onCancel={close} busy={busy} />}
    />
  )
}
