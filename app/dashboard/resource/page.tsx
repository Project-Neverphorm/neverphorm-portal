// app/dashboard/resources/page.tsx

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

const devStack: Record<string, string[]> = {
  'Game Development': ['Unity', 'Unreal Engine', 'C++', 'C#', 'Maya', 'Blender', 'Autodesk Sketchbook', 'Substance Painter', 'Figma', 'GitHub', 'DaVinci'],
  'Web & Systems': ['React', 'React Native', 'TailwindCSS', 'Vercel', 'Vite', 'VIM', 'Rebase', 'JavaScript', 'Supabase', 'Node.js', 'GitHub'],
  'Planning & Workflow': ['IET', 'Notion', 'Google Drive', 'Discord', 'DocuSign', 'Microsoft 365'],
}

const RESOURCE_TYPES = ['video', 'playlist', 'article', 'doc', 'guide', 'file', 'checklist'] as const
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
const ENGINES = ['unity', 'unreal', 'any'] as const

type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
}

type Resource = {
  id: string
  title: string
  url: string | null
  creator: string | null
  type: string
  skill_level: string | null
  engine: string | null
  tool: string | null
  duration_minutes: number | null
  notes: string | null
  created_at: string
  resource_categories: { category_id: string }[]
}

type FormState = {
  title: string
  url: string
  creator: string
  type: string
  skill_level: string
  engine: string
  tool: string
  duration_minutes: string
  notes: string
  category_ids: string[]
}

const emptyForm: FormState = {
  title: '',
  url: '',
  creator: '',
  type: 'video',
  skill_level: '',
  engine: '',
  tool: '',
  duration_minutes: '',
  notes: '',
  category_ids: [],
}

const inputClass =
  'w-full rounded-md border border-border-default bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neutral-500'

const chipClass = (active: boolean) =>
  `rounded-full border px-3 py-1 text-sm transition-colors ${
    active
      ? 'border-foreground bg-foreground text-background'
      : 'border-neutral-700 bg-elevated text-neutral-200 hover:border-neutral-500'
  }`

const nullIfEmpty = (s: string) => (s.trim() === '' ? null : s.trim())

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function youtubeThumb(url: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    let id: string | null = null
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1)
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v')
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
  } catch {
    return null
  }
}

export default function ResourcePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null) // 'new' or a resource id
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryParent, setNewCategoryParent] = useState('')

  const loadData = useCallback(async (userId: string) => {
    const [catRes, resRes, progRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order').order('name'),
      supabase
        .from('resources')
        .select('*, resource_categories(category_id)')
        .order('created_at', { ascending: false }),
      supabase.from('resource_progress').select('resource_id').eq('user_id', userId),
    ])

    const firstError = catRes.error ?? resRes.error ?? progRes.error
    if (firstError) {
      setError(firstError.message)
      return
    }

    setCategories(catRes.data as Category[])
    setResources(resRes.data as Resource[])
    setCompleted(new Set((progRes.data ?? []).map((p) => p.resource_id as string)))
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      const { data: admin } = await supabase.rpc('is_studio_admin')
      setIsAdmin(admin === true)
      await loadData(user.id)
      setLoading(false)
    }

    init()
  }, [router, loadData])

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const topLevel = categories.filter((c) => !c.parent_id)
  const activeParent = activeCategory
    ? categoryById.get(activeCategory)?.parent_id ?? activeCategory
    : null
  const subCategories = activeParent ? categories.filter((c) => c.parent_id === activeParent) : []

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const allowed = activeCategory
      ? new Set([activeCategory, ...categories.filter((c) => c.parent_id === activeCategory).map((c) => c.id)])
      : null

    return resources.filter((r) => {
      if (typeFilter && r.type !== typeFilter) return false
      if (levelFilter && r.skill_level !== levelFilter) return false
      if (allowed && !r.resource_categories.some((rc) => allowed.has(rc.category_id))) return false
      if (q) {
        const haystack = [r.title, r.creator, r.tool, r.notes].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [resources, categories, search, activeCategory, typeFilter, levelFilter])

  const startNew = () => {
    setForm(emptyForm)
    setEditingId('new')
    setError(null)
  }

  const startEdit = (r: Resource) => {
    setForm({
      title: r.title,
      url: r.url ?? '',
      creator: r.creator ?? '',
      type: r.type,
      skill_level: r.skill_level ?? '',
      engine: r.engine ?? '',
      tool: r.tool ?? '',
      duration_minutes: r.duration_minutes?.toString() ?? '',
      notes: r.notes ?? '',
      category_ids: r.resource_categories.map((rc) => rc.category_id),
    })
    setEditingId(r.id)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFormCategory = (id: string) => {
    setForm((f) => ({
      ...f,
      category_ids: f.category_ids.includes(id)
        ? f.category_ids.filter((c) => c !== id)
        : [...f.category_ids, id],
    }))
  }

  const saveResource = async () => {
    if (!user || !editingId) return
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      url: nullIfEmpty(form.url),
      creator: nullIfEmpty(form.creator),
      type: form.type,
      skill_level: nullIfEmpty(form.skill_level),
      engine: nullIfEmpty(form.engine),
      tool: nullIfEmpty(form.tool),
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      notes: nullIfEmpty(form.notes),
    }

    let resourceId = editingId

    if (editingId === 'new') {
      const { data, error } = await supabase
        .from('resources')
        .insert({ ...payload, added_by: user.id })
        .select('id')
        .single()
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
      resourceId = data.id
    } else {
      const { error: updateError } = await supabase.from('resources').update(payload).eq('id', editingId)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
      const { error: clearError } = await supabase
        .from('resource_categories')
        .delete()
        .eq('resource_id', editingId)
      if (clearError) {
        setError(clearError.message)
        setSaving(false)
        return
      }
    }

    if (form.category_ids.length > 0) {
      const { error: linkError } = await supabase
        .from('resource_categories')
        .insert(form.category_ids.map((category_id) => ({ resource_id: resourceId, category_id })))
      if (linkError) {
        setError(linkError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setEditingId(null)
    setForm(emptyForm)
    await loadData(user.id)
  }

  const deleteResource = async (id: string) => {
    if (!user || !confirm('Delete this resource?')) return
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    await loadData(user.id)
  }

  const toggleComplete = async (id: string) => {
    if (!user) return
    const isDone = completed.has(id)

    setCompleted((prev) => {
      const next = new Set(prev)
      if (isDone) next.delete(id)
      else next.add(id)
      return next
    })

    const { error } = isDone
      ? await supabase.from('resource_progress').delete().eq('user_id', user.id).eq('resource_id', id)
      : await supabase.from('resource_progress').insert({ user_id: user.id, resource_id: id })

    if (error) {
      setError(error.message)
      await loadData(user.id)
    }
  }

  const addCategory = async () => {
    if (!user || !newCategoryName.trim()) return
    const { error } = await supabase.from('categories').insert({
      name: newCategoryName.trim(),
      slug: slugify(newCategoryName),
      parent_id: newCategoryParent || null,
    })
    if (error) {
      setError(error.message)
      return
    }
    setNewCategoryName('')
    setNewCategoryParent('')
    await loadData(user.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-5xl mx-auto px-10 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Studio Resources</h1>
            <p className="text-text-secondary text-sm">
              Tutorials, guides, and references for everything we build, plus the tools we use to build it.
            </p>
          </div>
          {isAdmin && editingId === null && (
            <button
              onClick={startNew}
              className="shrink-0 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Add Resource
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Admin editor */}
        {isAdmin && editingId !== null && (
          <div className="mb-10 rounded-lg border border-border-default p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {editingId === 'new' ? 'New Resource' : 'Edit Resource'}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                className={`${inputClass} md:col-span-2`}
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className={`${inputClass} md:col-span-2`}
                placeholder="URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Creator"
                value={form.creator}
                onChange={(e) => setForm({ ...form, creator: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Tool (Blender, Maya, Substance...)"
                value={form.tool}
                onChange={(e) => setForm({ ...form, tool: e.target.value })}
              />
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                className={inputClass}
                value={form.skill_level}
                onChange={(e) => setForm({ ...form, skill_level: e.target.value })}
              >
                <option value="">Skill level (optional)</option>
                {SKILL_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <select
                className={inputClass}
                value={form.engine}
                onChange={(e) => setForm({ ...form, engine: e.target.value })}
              >
                <option value="">Engine (optional)</option>
                {ENGINES.map((en) => (
                  <option key={en} value={en}>{en}</option>
                ))}
              </select>
              <input
                className={inputClass}
                type="number"
                min={0}
                placeholder="Duration (minutes)"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
              />
              <textarea
                className={`${inputClass} md:col-span-2 min-h-28`}
                placeholder="Notes, takeaways, timestamps"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm uppercase tracking-wide text-text-secondary">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleFormCategory(c.id)}
                    className={chipClass(form.category_ids.includes(c.id))}
                  >
                    {c.parent_id ? `${categoryById.get(c.parent_id)?.name} / ${c.name}` : c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <input
                className={`${inputClass} max-w-56`}
                placeholder="New category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <select
                className={`${inputClass} max-w-56`}
                value={newCategoryParent}
                onChange={(e) => setNewCategoryParent(e.target.value)}
              >
                <option value="">Top level</option>
                {topLevel.map((c) => (
                  <option key={c.id} value={c.id}>Under {c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCategory}
                className="rounded-md border border-border-default px-3 py-2 text-sm hover:border-neutral-500"
              >
                Add Category
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={saveResource}
                disabled={saving}
                className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                }}
                className="rounded-md border border-border-default px-4 py-2 text-sm hover:border-neutral-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            className={inputClass}
            placeholder="Search titles, creators, tools, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={inputClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select className={inputClass} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="">All levels</option>
            {SKILL_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory(null)} className={chipClass(activeCategory === null)}>
            All
          </button>
          {topLevel.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} className={chipClass(activeCategory === c.id)}>
              {c.name}
            </button>
          ))}
        </div>

        {subCategories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 pl-4 border-l border-border-default">
            {subCategories.map((c) => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} className={chipClass(activeCategory === c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Library */}
        <div className="mb-16 mt-6 space-y-4">
          {filtered.length === 0 && (
            <p className="text-sm text-text-secondary">
              {resources.length === 0 ? 'No resources yet.' : 'Nothing matches those filters.'}
            </p>
          )}

          {filtered.map((r) => {
            const thumb = youtubeThumb(r.url)
            const done = completed.has(r.id)

            return (
              <div
                key={r.id}
                className={`flex gap-4 rounded-lg border border-border-default p-4 ${done ? 'opacity-60' : ''}`}
              >
                {thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="hidden h-24 w-40 shrink-0 rounded-md object-cover sm:block" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                        >
                          {r.title}
                        </a>
                      ) : (
                        <p className="font-semibold">{r.title}</p>
                      )}
                      <p className="text-sm text-text-secondary">
                        {[r.creator, r.duration_minutes ? `${r.duration_minutes} min` : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleComplete(r.id)}
                      className={`shrink-0 rounded-md border px-3 py-1 text-xs ${
                        done
                          ? 'border-green-700 bg-green-950/40 text-green-300'
                          : 'border-border-default text-text-secondary hover:border-neutral-500'
                      }`}
                    >
                      {done ? 'Completed' : 'Mark complete'}
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[r.type, r.skill_level, r.engine, r.tool].filter(Boolean).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-neutral-700 bg-elevated px-2 py-0.5 text-xs text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {r.resource_categories.map((rc) => {
                      const cat = categoryById.get(rc.category_id)
                      return cat ? (
                        <span
                          key={rc.category_id}
                          className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300"
                        >
                          {cat.name}
                        </span>
                      ) : null
                    })}
                  </div>

                  {r.notes && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-text-secondary">{r.notes}</p>
                  )}

                  {isAdmin && (
                    <div className="mt-3 flex gap-3 text-xs">
                      <button onClick={() => startEdit(r)} className="text-text-secondary hover:text-foreground">
                        Edit
                      </button>
                      <button onClick={() => deleteResource(r.id)} className="text-red-400 hover:text-red-300">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Studio stack */}
        <div className="border-t border-border-default pt-10">
          <h2 className="text-lg font-semibold mb-4">Studio Stack</h2>

          <div className="border border-border-default rounded-lg p-6 mb-8">
            <p className="text-sm text-text-secondary leading-relaxed">
              The development stack depends on the project. Unity and Unreal are both used, since the choice of engine
              comes down to what each game needs, they&apos;re tools, not a fixed pipeline. Everything else in the
              stack is flexible for future team members to bring their own preferred tools; engine choice per game is
              the one thing that doesn&apos;t flex.
            </p>
          </div>

          <div className="space-y-8">
            {Object.entries(devStack).map(([category, tools]) => (
              <div key={category}>
                <h3 className="text-sm uppercase tracking-wide text-text-secondary mb-3">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-neutral-700 bg-elevated px-3 py-1 text-sm text-neutral-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}