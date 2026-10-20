// components/cms/TeamManager.tsx

'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Member = {
  id: string
  name: string
  role: string | null
  bio: string | null
  favorite_games: string | null
  photo_url: string | null
  sort_order: number
  published: boolean
}

type Form = {
  name: string
  role: string
  bio: string
  favorite_games: string
  photo_url: string
  published: boolean
}

const emptyForm: Form = { name: '', role: '', bio: '', favorite_games: '', photo_url: '', published: true }

const inputClass =
  'w-full rounded-lg border border-border-default bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500'

const nullIfEmpty = (s: string) => (s.trim() === '' ? null : s.trim())

export default function TeamManager() {
  const [members, setMembers] = useState<Member[]>([])
  const [editingId, setEditingId] = useState<string | null>(null) // 'new' or a member id
  const [form, setForm] = useState<Form>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('team_members').select('*').order('sort_order')
    if (error) {
      setError(error.message)
      return
    }
    setMembers(data as Member[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const startNew = () => {
    setForm(emptyForm)
    setEditingId('new')
    setError(null)
  }

  const startEdit = (m: Member) => {
    setForm({
      name: m.name,
      role: m.role ?? '',
      bio: m.bio ?? '',
      favorite_games: m.favorite_games ?? '',
      photo_url: m.photo_url ?? '',
      published: m.published,
    })
    setEditingId(m.id)
    setError(null)
  }

  const cancel = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('team-photos').upload(path, file, { cacheControl: '3600' })
    if (error) {
      setError(error.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('team-photos').getPublicUrl(path)
    setForm((f) => ({ ...f, photo_url: data.publicUrl }))
    setUploading(false)
  }

  const save = async () => {
    if (!editingId) return
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      role: nullIfEmpty(form.role),
      bio: nullIfEmpty(form.bio),
      favorite_games: nullIfEmpty(form.favorite_games),
      photo_url: nullIfEmpty(form.photo_url),
      published: form.published,
    }

    const { error } =
      editingId === 'new'
        ? await supabase.from('team_members').insert({ ...payload, sort_order: members.length })
        : await supabase.from('team_members').update(payload).eq('id', editingId)

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    cancel()
    await load()
  }

  const remove = async (m: Member) => {
    if (!confirm(`Remove ${m.name} from the team page?`)) return
    const { error } = await supabase.from('team_members').delete().eq('id', m.id)
    if (error) {
      setError(error.message)
      return
    }
    await load()
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= members.length) return
    const a = members[index]
    const b = members[target]
    const results = await Promise.all([
      supabase.from('team_members').update({ sort_order: target }).eq('id', a.id),
      supabase.from('team_members').update({ sort_order: index }).eq('id', b.id),
    ])
    const failed = results.find((r) => r.error)
    if (failed?.error) setError(failed.error.message)
    await load()
  }

  const editor = (
    <div className="rounded-lg border border-neutral-600 bg-elevated p-5">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-2xl text-neutral-400">
            {form.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              form.name.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <label className="cursor-pointer text-xs text-text-secondary hover:text-foreground">
            {uploading ? 'Uploading...' : form.photo_url ? 'Change photo' : 'Upload photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
            />
          </label>
          {form.photo_url && (
            <button
              onClick={() => setForm({ ...form, photo_url: '' })}
              className="text-xs text-neutral-500 hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              autoFocus
              className={inputClass}
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
          <textarea
            className={`${inputClass} min-h-28`}
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Favorite games"
            value={form.favorite_games}
            onChange={(e) => setForm({ ...form, favorite_games: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Show on site
          </label>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={cancel} className="rounded-lg border border-border-default px-4 py-2 text-sm hover:border-neutral-500">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving || uploading}
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
        <h2 className="text-2xl font-semibold">Team · projectneverphorm.com/about</h2>
        {editingId === null && (
          <button
            onClick={startNew}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            + Add member
          </button>
        )}
      </div>

      {error && editingId === null && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="space-y-3">
        {editingId === 'new' && editor}

        {members.length === 0 && editingId !== 'new' && (
          <div className="rounded-lg border border-border-default p-5 text-text-secondary">No team members yet.</div>
        )}

        {members.map((m, i) =>
          editingId === m.id ? (
            <div key={m.id}>{editor}</div>
          ) : (
            <div key={m.id} className="flex items-center gap-4 rounded-lg border border-border-default p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-neutral-400">
                {m.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  m.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {m.name}
                  {!m.published && (
                    <span className="ml-2 rounded bg-neutral-800 px-1.5 py-0.5 text-[11px] text-neutral-400">Hidden</span>
                  )}
                </p>
                <p className="text-sm text-text-secondary">{m.role}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-text-secondary hover:text-foreground disabled:opacity-30">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === members.length - 1} className="text-text-secondary hover:text-foreground disabled:opacity-30">↓</button>
                <button onClick={() => startEdit(m)} className="text-text-secondary hover:text-foreground">Edit</button>
                <button onClick={() => remove(m)} className="text-red-500 hover:text-red-300">Delete</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}