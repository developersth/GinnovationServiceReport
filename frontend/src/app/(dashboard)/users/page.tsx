'use client'

import ManagementPage from '@/components/ManagementPage'
import { addUser, deleteUser, getUsers, updateUser } from '@/libs/api/data'
import type { User } from '@/types'
import UserForm from '@/views/user/UserForm'
import UserTable from '@/views/user/UserTable'

export default function UsersPage() {
  return (
    <ManagementPage<User>
      label='ผู้ใช้งาน'
      description='จัดการบัญชีและบทบาทของผู้ใช้งานระบบรายงานบริการ'
      list={getUsers}
      create={addUser}
      update={updateUser}
      remove={deleteUser}
      name={user => user.name || user.username}
      searchBy={user => [user.username, user.name, user.email, user.role].join(' ')}
      table={(users, edit, remove) => <UserTable users={users} onEdit={edit} onDelete={remove} />}
      form={(user, save, close, busy) => <UserForm initialData={user} onSubmit={save} onCancel={close} busy={busy} />}
    />
  )
}
