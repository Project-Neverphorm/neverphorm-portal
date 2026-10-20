// components/cms/JobsManager.tsx

'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Job = {
  id: string
  title: string
  commitment: string | null
  description: string | null
  sort_order: number
  published: boolean
}

type Form = {
  title: string
  commitment: string
  description: string
  published: boolean
}

const emptyForm: Form = { title: '', commitment: '', description: '', published: true }

const inputClass =
  'w-full rounded-lg border border-border-default bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500'

const nullIfEmpty = (s: string) => (s.trim() === '' ? null : s.trim())

export default function JobsManager() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('job_openings').select('*').order('sort_order')
    if (error) {
      setError(error.message)
      return
    }
    setJobs(data as Job[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const startNew = () => {
    setForm(emptyForm)
    setEditingId('new')
    setError(null)
  }

  const startEdit = (j: Job) => {
    setForm({
      title: j.title,
      commitment: j.commitment ?? '',
      description: j.description ?? '',
      published: j.published,
    })
    setEditingId(j.id)
    setError(null)
  }

  const cancel = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const save = async () => {
    if (!editingId) return
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      commitment: nullIfEmpty(form.commitment),
      description: nullIfEmpty(form.description),
      published: form.published,
    }

    const { error } =
      editingId === 'new'
        ? await supabase.from('job_openings').insert({ ...payload, sort_order: jobs.length })
        : await supabase.from('job_openings').update(payload).eq('id', editingId)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    cancel()
    await load()
  }

  const toggleOpen = async (j: Job) => {
    const { error } = await supabase.from('job_openings').update({ published: !j.published }).eq('id', j.id)
    if (error) setError(error.message)
    await load()
  }

  const remove = async (j: Job) => {
    if (!confirm(`Delete "${j.title}"?`)) return
    const { error } = await supabase.from('job_openings').delete().eq('id', j.id)
    if (error) {
      setError(error.message)
      return
    }
    await load()
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= jobs.length) return
    const a = jobs[index]
    const b = jobs[target]
    const results = await Promise.all([
      supabase.from('job_openings').update({ sort_order: target }).eq('id', a.id),
      supabase.from('job_openings').update({ sort_order: index }).eq('id', b.id),
    ])
    const failed = results.find((r) => r.error)
    if (failed?.error) setError(failed.error.message)
    await load()
  }

  const editor = (
    <div className="rounded-lg border border-neutral-600 bg-elevated p-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            autoFocus
            className={inputClass}
            placeholder="Role title (e.g. 3D modeling)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Commitment (e.g. Part-time, remote)"
            value={form.commitment}
            onChange={(e) => setForm({ ...form, commitment: e.target.value })}
          />
        </div>
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="What you're looking for (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Open (show on site)
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={cancel} className="rounded-lg border border-border-default px-4 py-2 text-sm hover:border-neutral-500">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Jobs · projectneverphorm.com/contact</h2>
        {editingId === null && (
          <button
            onClick={startNew}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            + Add role
          </button>
        )}
      </div>

      {error && editingId === null && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="space-y-3">
        {editingId === 'new' && editor}

        {jobs.length === 0 && editingId !== 'new' && (
          <div className="rounded-lg border border-border-default p-5 text-text-secondary">No roles yet.</div>
        )}

        {jobs.map((j, i) =>
          editingId === j.id ? (
            <div key={j.id}>{editor}</div>
          ) : (
            <div key={j.id} className="flex items-center gap-4 rounded-lg border border-border-default p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {j.title}
                  <span
                    className={`ml-2 rounded px-1.5 py-0.5 text-[11px] ${
                      j.published ? 'bg-green-950 text-green-400' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {j.published ? 'Open' : 'Closed'}
                  </span>
                </p>
                {j.commitment && <p className="text-sm text-text-secondary">{j.commitment}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-text-secondary hover:text-foreground disabled:opacity-30">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === jobs.length - 1} className="text-text-secondary hover:text-foreground disabled:opacity-30">↓</button>
                <button onClick={() => toggleOpen(j)} className="text-text-secondary hover:text-foreground">
                  {j.published ? 'Close' : 'Reopen'}
                </button>
                <button onClick={() => startEdit(j)} className="text-text-secondary hover:text-foreground">Edit</button>
                <button onClick={() => remove(j)} className="text-red-500 hover:text-red-300">Delete</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}