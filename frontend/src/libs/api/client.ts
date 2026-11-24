import { API_BASE_URL } from '@/utils'

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const statusMessages: Record<number, string> = {
  400: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจข้อมูลแล้วลองใหม่',
  401: 'กรุณาเข้าสู่ระบบอีกครั้ง',
  403: 'บัญชีนี้ไม่มีสิทธิ์ดำเนินการ',
  404: 'ไม่พบข้อมูลที่ร้องขอ',
  409: 'ข้อมูลรายการนี้ขัดแย้งกับข้อมูลที่บันทึกไว้'
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const headers = new Headers(options?.headers)
  const token = typeof window === 'undefined' ? null : localStorage.getItem('token')

  if (token && !headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + token)

  let response: Response

  try {
    response = await fetch(API_BASE_URL.replace(/\/$/, '') + path, { ...options, headers, cache: 'no-store' })
  } catch (error) {
    if (options?.signal?.aborted) throw error
    throw new ApiError(0, 'เชื่อมต่อระบบไม่ได้ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่')
  }

  if (response.ok) return response

  let message = statusMessages[response.status] ?? 'ระบบดำเนินการไม่สำเร็จ กรุณาลองใหม่'
  const contentType = response.headers.get('content-type') ?? ''

  if (response.status < 500 && contentType.includes('json')) {
    const problem = await response.json().catch(() => null)
    const fieldErrors = Object.values(problem?.errors ?? {}).flat().filter(value => typeof value === 'string')

    message = [problem?.detail || problem?.message, ...fieldErrors].filter(Boolean).join(' • ') || message
  } else if (response.status < 500 && contentType.startsWith('text/plain')) {
    message = (await response.text()).trim() || message
  }

  throw new ApiError(response.status, message)
}
