// app/dashboard/updates/page.tsx

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type Update = {
  id: string
  title: string
  published_on: string
  items: string[]
  created_at: string
}

type FormState = {
  title: string
  published_on: string
  items: string
}

const todayISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const emptyForm = (): FormState => ({ title: '', published_on: todayISO(), items: '' })

// Parse YYYY-MM-DD as a local date so it doesn't shift a day from timezones
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const inputClass =
  'w-full rounded-lg border border-border-default bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500'

export default function UpdatesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [updates, setUpdates] = useState<Update[]>([])
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null) // 'new' or an update id
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  const loadUpdates = useCallback(async () => {
    const { data, error } = await supabase
      .from('portal_updates')
      .select('*')
      .order('published_on', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      return
    }
    setUpdates(data as Update[])
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: admin } = await supabase.rpc('is_studio_admin')
      setIsAdmin(admin === true)
      await loadUpdates()
      setLoading(false)
    }
    init()
  }, [router, loadUpdates])

  const startNew = () => {
    setForm(emptyForm())
    setEditingId('new')
    setError(null)
  }

  const startEdit = (u: Update) => {
    setForm({ title: u.title, published_on: u.published_on, items: u.items.join('\n') })
    setEditingId(u.id)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  const saveUpdate = async () => {
    if (!editingId) return
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }

    const payload = {
      title: form.title.trim(),
      published_on: form.published_on || todayISO(),
      items: form.items
        .split('\n')
        .map((line) => line.trim().replace(/^[-•*]\s*/, ''))
        .filter(Boolean),
    }

    setSaving(true)
    setError(null)

    const { error } =
      editingId === 'new'
        ? await supabase.from('portal_updates').insert(payload)
        : await supabase.from('portal_updates').update(payload).eq('id', editingId)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    cancelEdit()
    await loadUpdates()
  }

  const deleteUpdate = async (id: string) => {
    if (!confirm('Delete this update?')) return
    const { error } = await supabase.from('portal_updates').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    await loadUpdates()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  const editor = (
    <div className="rounded-lg border border-neutral-600 bg-elevated p-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            autoFocus
            className={inputClass}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="date"
            className={`${inputClass} sm:w-48`}
            value={form.published_on}
            onChange={(e) => setForm({ ...form, published_on: e.target.value })}
          />
        </div>
        <textarea
          className={`${inputClass} min-h-32`}
          placeholder="One bullet per line"
          value={form.items}
          onChange={(e) => setForm({ ...form, items: e.target.value })}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={cancelEdit}
          className="rounded-lg border border-border-default px-4 py-2 text-sm hover:border-neutral-500"
        >
          Cancel
        </button>
        <button
          onClick={saveUpdate}
          disabled={saving}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : editingId === 'new' ? 'Post Update' : 'Save'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-14">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Updates</h1>
            <p className="text-text-secondary">What&apos;s new and changed in the portal.</p>
          </div>
          {isAdmin && editingId === null && (
            <button
              onClick={startNew}
              className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              New Update
            </button>
          )}
        </div>

        {error && editingId === null && (
          <p className="mb-6 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        <div className="space-y-5">
          {editingId === 'new' && editor}

          {updates.length === 0 && editingId !== 'new' && (
            <p className="text-sm text-text-secondary">No updates yet.</p>
          )}

          {updates.map((u) =>
            editingId === u.id ? (
              <div key={u.id}>{editor}</div>
            ) : (
              <article key={u.id} className="group rounded-lg bg-elevated p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">{formatDate(u.published_on)}</p>
                    <h2 className="mt-1 text-xl font-semibold">{u.title}</h2>
                  </div>
                  {isAdmin && editingId === null && (
                    <div className="flex gap-3 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => startEdit(u)} className="text-text-secondary hover:text-foreground">
                        Edit
                      </button>
                      <button onClick={() => deleteUpdate(u.id)} className="text-red-500 hover:text-red-300">
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {u.items.length > 0 && (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-text-secondary marker:text-neutral-500">
                    {u.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}