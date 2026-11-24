import { ApiError, apiFetch } from './client'

interface JwtPayload {
  role?: string
  exp?: number
}

function decodeToken(token: string): JwtPayload {
  const payload = token.split('.')[1]
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0))

  return JSON.parse(new TextDecoder().decode(bytes))
}

export async function login(username: string, password: string): Promise<boolean> {
  let response: Response

  try {
    response = await apiFetch('/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password })
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    throw error
  }

  const { token, username: accountName, name } = await response.json()
  const { exp, role } = decodeToken(token)

  if (!exp || Date.now() >= exp * 1000) throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง')

  localStorage.setItem('token', token)
  localStorage.setItem('username', accountName)
  localStorage.setItem('name', name || accountName)
  localStorage.setItem('userRole', role || 'viewer')
  localStorage.setItem('isLoggedIn', 'true')

  return true
}

export function logout() {
  for (const key of ['token', 'username', 'name', 'userRole', 'isLoggedIn']) localStorage.removeItem(key)
}

export function checkAuth() {
  const token = localStorage.getItem('token')

  if (!token) return false

  try {
    const { exp } = decodeToken(token)

    if (exp && Date.now() < exp * 1000) return true
  } catch {
    // Clear unreadable sessions the same way as expired sessions.
  }

  logout()

  return false
}

export const getUsername = () => localStorage.getItem('username')
export const getName = () => localStorage.getItem('name')
export const getUserRole = () => localStorage.getItem('userRole')
