'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, TextField } from '@mui/material'
import AddOutlined from '@mui/icons-material/AddOutlined'

import PageHeader from '@/components/PageHeader'

type Entry = { id: string }
type ManagementPageProps<T extends Entry> = {
  label: string
  description: string
  list: () => Promise<T[]>
  create: (record: Omit<T, 'id'>) => Promise<T>
  update: (record: T) => Promise<T>
  remove: (id: string) => Promise<void>
  name: (record: T) => string
  searchBy: (record: T) => string
  table: (records: T[], edit: (record: T) => void, remove: (id: string) => void) => ReactNode
  form: (record: T | undefined, save: (record: Omit<T, 'id'> | T) => void, close: () => void, busy: boolean) => ReactNode
}

const messageOf = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback

export default function ManagementPage<T extends Entry>(props: ManagementPageProps<T>) {
  const { label, description, list, create, update, remove, name, searchBy, table, form } = props
  const [records, setRecords] = useState<T[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<{ record?: T } | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoadError('')

    try {
      setRecords(await list())
    } catch (error) {
      setLoadError(messageOf(error, 'โหลดข้อมูลไม่ได้'))
    }
  }, [list])

  useEffect(() => { void load() }, [load])

  function openEditor(record?: T) {
    setActionError('')
    setEditor({ record })
  }

  async function save(record: Omit<T, 'id'> | T) {
    if (busy) return
    setBusy(true)
    setActionError('')

    try {
      const editing = 'id' in record
      const saved = editing ? await update(record) : await create(record)

      setRecords(previous => editing ? (previous ?? []).map(item => item.id === saved.id ? saved : item) : [saved, ...(previous ?? [])])
      setSuccess('บันทึก' + label + 'แล้ว')
      setEditor(null)
    } catch (error) {
      setActionError(messageOf(error, 'บันทึกข้อมูลไม่ได้'))
    } finally {
      setBusy(false)
    }
  }

  async function deleteEntry() {
    if (!deleting || busy) return
    setBusy(true)
    setActionError('')

    try {
      await remove(deleting.id)
      setRecords(previous => (previous ?? []).filter(item => item.id !== deleting.id))
      setDeleting(null)
      setSuccess('ลบ' + label + 'แล้ว')
    } catch (error) {
      setActionError(messageOf(error, 'ลบข้อมูลไม่ได้'))
    } finally {
      setBusy(false)
    }
  }

  const normalizedQuery = query.trim().toLocaleLowerCase('th-TH')
  const filtered = records?.filter(record => searchBy(record).toLocaleLowerCase('th-TH').includes(normalizedQuery))

  return (
    <Box>
      <PageHeader
        title={label}
        description={description}
        action={<Button onClick={() => openEditor()} disabled={records === null || !!loadError} startIcon={<AddOutlined />} variant='contained'>เพิ่ม{label}</Button>}
      />
      {success && <Alert severity='success' sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {loadError ? (
        <Alert severity='error' action={<Button color='inherit' onClick={load}>ลองใหม่</Button>}>{loadError}</Alert>
      ) : records === null ? (
        <Skeleton variant='rounded' height={225} />
      ) : (
        <>
          <TextField
            size='small'
            label={'ค้นหา' + label}
            value={query}
            onChange={event => setQuery(event.target.value)}
            sx={{ mb: 2, width: { xs: '100%', sm: 300 }, bgcolor: 'background.paper' }}
          />
          {filtered?.length
            ? table(filtered, openEditor, id => {
                setActionError('')
                setDeleting(records.find(record => record.id === id) ?? null)
              })
            : <Alert severity='info'>{normalizedQuery ? 'ไม่พบรายการที่ตรงกับการค้นหา' : 'ยังไม่มีข้อมูล' + label}</Alert>}
        </>
      )}

      <Dialog fullWidth maxWidth='sm' open={!!editor} onClose={() => { if (!busy) setEditor(null) }}>
        {editor && (
          <DialogContent>
            {actionError && <Alert severity='error' sx={{ mb: 2 }}>{actionError}</Alert>}
            {form(editor.record, save, () => setEditor(null), busy)}
          </DialogContent>
        )}
      </Dialog>

      <Dialog fullWidth maxWidth='xs' open={!!deleting} onClose={() => { if (!busy) setDeleting(null) }}>
        <DialogTitle>ลบ{label}</DialogTitle>
        <DialogContent>
          {deleting ? 'ยืนยันการลบ ' + name(deleting) + '?' : ''}
          {actionError && <Alert severity='error' sx={{ mt: 2 }}>{actionError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)} disabled={busy}>ยกเลิก</Button>
          <Button onClick={deleteEntry} disabled={busy} variant='contained' color='error'>ลบรายการ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
