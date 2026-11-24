import type { Project, ServiceReport, User } from '@/types'

import { ApiError, apiFetch } from './client'

async function read<T>(path: string, options?: RequestInit): Promise<T> {
  return (await apiFetch(path, options)).json()
}

async function find<T>(path: string): Promise<T | undefined> {
  try {
    return await read<T>(path)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

const projectPath = '/api/Project'
const userPath = '/api/User'
const reportPath = '/api/ServiceReport'

function item(path: string, id: string) {
  return path + '/' + encodeURIComponent(id)
}

function projectForm(project: Omit<Project, 'id'>, updating = false) {
  const form = new FormData()

  const fields = {
    name: project.name,
    customerName: project.customerName,
    customerAddress: project.customerAddress,
    contactPerson: project.contactPerson,
    tel: project.tel,
    serviceUnder: project.serviceUnder
  }

  for (const [name, value] of Object.entries(fields)) form.set(name, value ?? '')

  if (project.imageFile) {
    form.set('image', project.imageFile)
  } else if (project.imageUrl) {
    form.set('imageUrl', project.imageUrl)
  } else if (updating && project.imageUrl === '') {
    form.set('removeImage', 'true')
  }

  return form
}

export function getProjects() {
  return read<Project[]>(projectPath)
}

export function getProjectById(id: string) {
  return find<Project>(item(projectPath, id))
}

export function addProject(project: Omit<Project, 'id'>) {
  return read<Project>(projectPath, { method: 'POST', body: projectForm(project) })
}

export async function updateProject(project: Project) {
  const path = item(projectPath, project.id)
  const response = await apiFetch(path, { method: 'PUT', body: projectForm(project, true) })

  return response.status === 204 ? read<Project>(path) : (response.json() as Promise<Project>)
}

export async function deleteProject(id: string) {
  await apiFetch(item(projectPath, id), { method: 'DELETE' })
}

function userBody(user: Omit<User, 'id'>, method: 'POST' | 'PUT'): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  }
}

export function getUsers() {
  return read<User[]>(userPath)
}

export function getUserById(id: string) {
  return find<User>(item(userPath, id))
}

export function addUser(user: Omit<User, 'id'>) {
  return read<User>(userPath, userBody(user, 'POST'))
}

export async function updateUser(user: User) {
  const path = item(userPath, user.id)
  const response = await apiFetch(path, userBody(user, 'PUT'))

  return response.status === 204 ? read<User>(path) : (response.json() as Promise<User>)
}

export async function deleteUser(id: string) {
  await apiFetch(item(userPath, id), { method: 'DELETE' })
}

export interface ReportFilters {
  projectId?: string
  from?: string
  to?: string
}

export function getServiceReports(filters?: ReportFilters) {
  const params = new URLSearchParams()

  if (filters?.projectId) params.set('projectId', filters.projectId)
  if (filters?.from) params.set('from', filters.from)
  if (filters?.to) params.set('to', filters.to)

  return read<ServiceReport[]>(params.size ? reportPath + '?' + params : reportPath)
}

function serviceReportForm(report: Omit<ServiceReport, 'id'>, updating = false) {
  const form = new FormData()

  const fields = {
    projectId: report.projectId,
    reportedBy: report.reportedBy,
    complain: report.complain,
    details: report.details,
    causesOfFailure: report.causesOfFailure,
    actionTaken: report.actionTaken,
    channel: report.channel,
    reportDate: report.reportDate,
    status: report.status,
    createdBy: report.createdBy,
    updatedBy: report.updatedBy,
    staffWorkingTime: JSON.stringify(report.staffWorkingTime ?? [])
  }

  for (const [name, value] of Object.entries(fields)) {
    if (value != null) form.append('reportDto.' + name, value)
  }

  if (updating) form.set('reportDto.replaceExistingImages', 'true')
  const images = report.imagePaths ?? []
  const existing = images.filter((image): image is string => typeof image === 'string')

  if (updating) {
    existing.forEach((image, index) => form.append('reportDto.existingImagePathsToKeep[' + index + ']', image))
  }

  images.forEach(image => {
    if (typeof image !== 'string') form.append('images', image)
  })

  return form
}

export function addServiceReport(report: Omit<ServiceReport, 'id'>) {
  return read<ServiceReport>(reportPath, { method: 'POST', body: serviceReportForm(report) })
}

export async function updateServiceReport(report: ServiceReport) {
  const path = item(reportPath, report.id)
  const response = await apiFetch(path, { method: 'PUT', body: serviceReportForm(report, true) })

  return response.status === 204 ? read<ServiceReport>(path) : (response.json() as Promise<ServiceReport>)
}

export function getServiceReportById(id: string) {
  return find<ServiceReport>(item(reportPath, id))
}

export async function deleteServiceReport(id: string) {
  await apiFetch(item(reportPath, id), { method: 'DELETE' })
}
