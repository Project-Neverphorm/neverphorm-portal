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
  notes: '',
  category_ids: [],
}

/* ---------- styling helpers ---------- */

const inputClass =
  'w-full rounded-lg border border-border-default bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neutral-500'

const pillClass = (active: boolean) =>
  `rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
    active
      ? 'border-foreground bg-foreground text-background'
      : 'border-neutral-800 text-text-secondary hover:border-neutral-600 hover:text-foreground'
  }`

const navItemClass = (active: boolean) =>
  `flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
    active
      ? 'bg-elevated text-foreground'
      : 'text-text-secondary hover:bg-elevated/50 hover:text-foreground'
  }`

const countBadge = (active: boolean) =>
  `rounded-md px-1.5 text-xs tabular-nums ${active ? 'bg-neutral-700 text-foreground' : 'text-neutral-500'}`

/* ---------- icons ---------- */

const SearchIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const PlusIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const CheckIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="m5 12 5 5L20 7" />
  </svg>
)

const PlayIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

/* ---------- utils ---------- */

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

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  )
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

  const [showNewCategory, setShowNewCategory] = useState(false)
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

  // Close modal on Escape
  useEffect(() => {
    if (editingId === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEditor()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editingId])

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const topLevel = categories.filter((c) => !c.parent_id)
  const activeParent = activeCategory
    ? categoryById.get(activeCategory)?.parent_id ?? activeCategory
    : null

  const countFor = (categoryId: string) => {
    const ids = new Set([categoryId, ...categories.filter((c) => c.parent_id === categoryId).map((c) => c.id)])
    return resources.filter((r) => r.resource_categories.some((rc) => ids.has(rc.category_id))).length
  }

  const completedCount = resources.filter((r) => completed.has(r.id)).length
  const progressPct = resources.length ? Math.round((completedCount / resources.length) * 100) : 0
  const totalTools = new Set(Object.values(devStack).flat()).size

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

  const activeCategoryName = activeCategory ? categoryById.get(activeCategory)?.name : 'All Resources'

  /* ---------- actions ---------- */

  const startNew = () => {
    setForm({ ...emptyForm, category_ids: activeCategory ? [activeCategory] : [] })
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
      notes: r.notes ?? '',
      category_ids: r.resource_categories.map((rc) => rc.category_id),
    })
    setEditingId(r.id)
    setError(null)
  }

  function closeEditor() {
    setEditingId(null)
    setForm(emptyForm)
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
    closeEditor()
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
    setShowNewCategory(false)
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

      <main className="mx-auto w-full max-w-[1500px] px-6 py-10 lg:px-10">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-border-default pb-8">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">Studio Resources</p>
            <h1 className="text-3xl font-bold tracking-tight">Learning Library</h1>
            <p className="mt-2 max-w-xl text-sm text-text-secondary">
              Tutorials, guides, and references for everything we build. Mark things complete as you go.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-56">
              <div className="mb-2 flex items-baseline justify-between text-xs">
                <span className="text-text-secondary">Your progress</span>
                <span className="tabular-nums">
                  {completedCount}/{resources.length}
                  <span className="ml-1.5 text-text-secondary">{progressPct}%</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={startNew}
                className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
              >
                <PlusIcon />
                Add Resource
              </button>
            )}
          </div>
        </header>

        {error && editingId === null && (
          <div className="mb-8 flex items-center justify-between rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              <CloseIcon />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_300px]">
          {/* LEFT: category nav */}
          <nav className="self-start lg:sticky lg:top-8">
            <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Browse</p>

            <div className="space-y-0.5">
              <button onClick={() => setActiveCategory(null)} className={navItemClass(activeCategory === null)}>
                <span>All Resources</span>
                <span className={countBadge(activeCategory === null)}>{resources.length}</span>
              </button>

              {topLevel.map((c) => (
                <div key={c.id}>
                  <button onClick={() => setActiveCategory(c.id)} className={navItemClass(activeCategory === c.id)}>
                    <span className="truncate">{c.name}</span>
                    <span className={countBadge(activeCategory === c.id)}>{countFor(c.id)}</span>
                  </button>

                  {activeParent === c.id && categories.some((s) => s.parent_id === c.id) && (
                    <div className="my-1 ml-4 space-y-0.5 border-l border-neutral-800 pl-2">
                      {categories
                        .filter((sub) => sub.parent_id === c.id)
                        .map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setActiveCategory(sub.id)}
                            className={navItemClass(activeCategory === sub.id)}
                          >
                            <span className="truncate">{sub.name}</span>
                            <span className={countBadge(activeCategory === sub.id)}>{countFor(sub.id)}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="mt-4 border-t border-neutral-800 pt-4">
                {showNewCategory ? (
                  <div className="space-y-2 px-1">
                    <input
                      autoFocus
                      className={inputClass}
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <select
                      className={inputClass}
                      value={newCategoryParent}
                      onChange={(e) => setNewCategoryParent(e.target.value)}
                    >
                      <option value="">Top level</option>
                      {topLevel.map((c) => (
                        <option key={c.id} value={c.id}>Under {c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={addCategory}
                        className="flex-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowNewCategory(false)}
                        className="flex-1 rounded-lg border border-border-default px-3 py-1.5 text-xs hover:border-neutral-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewCategory(true)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:text-foreground"
                  >
                    <PlusIcon />
                    New category
                  </button>
                )}
              </div>
            )}
          </nav>

          {/* CENTER: library */}
          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {activeCategoryName}
                <span className="ml-2 text-sm font-normal text-text-secondary">{filtered.length}</span>
              </h2>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <SearchIcon />
                </span>
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search titles, creators, tools, notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className={`${inputClass} sm:w-44`}
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="">All levels</option>
                {SKILL_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
              <button onClick={() => setTypeFilter('')} className={pillClass(typeFilter === '')}>
                All types
              </button>
              {RESOURCE_TYPES.map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)} className={pillClass(typeFilter === t)}>
                  {t}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 px-6 py-20 text-center">
                <div className="mb-4 text-neutral-700">
                  <PlayIcon />
                </div>
                <p className="font-medium">
                  {resources.length === 0 ? 'The library is empty' : 'Nothing matches those filters'}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {resources.length === 0
                    ? 'Add your first tutorial, playlist, or guide to get started.'
                    : 'Try a different search, type, or category.'}
                </p>
                {isAdmin && resources.length === 0 && (
                  <button
                    onClick={startNew}
                    className="mt-6 flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                  >
                    <PlusIcon />
                    Add Resource
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((r) => {
                  const thumb = youtubeThumb(r.url)
                  const done = completed.has(r.id)

                  const media = (
                    <div className="relative aspect-video overflow-hidden bg-neutral-900">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
                          <span className="text-neutral-600 transition-colors group-hover:text-neutral-400">
                            <PlayIcon />
                          </span>
                          {r.creator && (
                            <span className="text-xs uppercase tracking-widest text-neutral-600">{r.creator}</span>
                          )}
                        </div>
                      )}

                      <span className="absolute left-3 top-3 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-neutral-200 backdrop-blur">
                        {r.type}
                      </span>

                      {done && (
                        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-green-600 px-2 py-0.5 text-[11px] font-medium text-white">
                          <CheckIcon />
                          Done
                        </span>
                      )}
                    </div>
                  )

                  return (
                    <article
                      key={r.id}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border-default bg-elevated/20 transition-colors hover:border-neutral-600"
                    >
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          {media}
                        </a>
                      ) : (
                        media
                      )}

                      <div className="flex flex-1 flex-col p-4">
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="line-clamp-2 font-semibold leading-snug hover:underline"
                          >
                            {r.title}
                          </a>
                        ) : (
                          <p className="line-clamp-2 font-semibold leading-snug">{r.title}</p>
                        )}
                        {r.creator && <p className="mt-1 text-xs text-text-secondary">{r.creator}</p>}

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[r.skill_level, r.engine, r.tool].filter(Boolean).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md border border-neutral-800 px-2 py-0.5 text-[11px] capitalize text-neutral-400"
                            >
                              {tag}
                            </span>
                          ))}
                          {r.resource_categories.map((rc) => {
                            const cat = categoryById.get(rc.category_id)
                            return cat ? (
                              <span
                                key={rc.category_id}
                                className="rounded-md bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-300"
                              >
                                {cat.name}
                              </span>
                            ) : null
                          })}
                        </div>

                        {r.notes && (
                          <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-text-secondary">
                            {r.notes}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                          <button
                            onClick={() => toggleComplete(r.id)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                              done
                                ? 'border-green-800 bg-green-950/40 text-green-400'
                                : 'border-neutral-800 text-text-secondary hover:border-neutral-600 hover:text-foreground'
                            }`}
                          >
                            {done && <CheckIcon />}
                            {done ? 'Completed' : 'Mark complete'}
                          </button>

                          {isAdmin && (
                            <div className="flex gap-3 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => startEdit(r)}
                                className="text-text-secondary hover:text-foreground"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteResource(r.id)}
                                className="text-red-500 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* RIGHT: studio stack */}
          <aside className="self-start rounded-xl border border-border-default bg-elevated/20 p-5 lg:col-span-2 xl:col-span-1 xl:sticky xl:top-8">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-semibold">Studio Stack</h2>
              <span className="text-xs text-text-secondary">{totalTools} tools</span>
            </div>

            <p className="mb-6 border-l-2 border-neutral-700 pl-3 text-xs leading-relaxed text-text-secondary">
              The development stack depends on the project. Unity and Unreal are both used, since the choice of engine
              comes down to what each game needs, they&apos;re tools, not a fixed pipeline. Everything else in the
              stack is flexible for future team members to bring their own preferred tools; engine choice per game is
              the one thing that doesn&apos;t flex.
            </p>

            <div className="space-y-5">
              {Object.entries(devStack).map(([category, tools]) => (
                <div key={category}>
                  <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">{category}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-300"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      {/* Editor modal */}
      {isAdmin && editingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && closeEditor()}
        >
          <div className="w-full max-w-2xl rounded-xl border border-border-default bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
              <h2 className="text-lg font-semibold">{editingId === 'new' ? 'New Resource' : 'Edit Resource'}</h2>
              <button onClick={closeEditor} className="text-text-secondary hover:text-foreground">
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {error && (
                <div className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Title" wide>
                  <input
                    autoFocus
                    className={inputClass}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </Field>
                <Field label="URL" wide>
                  <input
                    className={inputClass}
                    placeholder="https://"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                  />
                </Field>
                <Field label="Creator">
                  <input
                    className={inputClass}
                    value={form.creator}
                    onChange={(e) => setForm({ ...form, creator: e.target.value })}
                  />
                </Field>
                <Field label="Tool">
                  <input
                    className={inputClass}
                    placeholder="Blender, Maya, Substance..."
                    value={form.tool}
                    onChange={(e) => setForm({ ...form, tool: e.target.value })}
                  />
                </Field>
                <Field label="Type">
                  <select
                    className={inputClass}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Skill level">
                  <select
                    className={inputClass}
                    value={form.skill_level}
                    onChange={(e) => setForm({ ...form, skill_level: e.target.value })}
                  >
                    <option value="">None</option>
                    {SKILL_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Engine" wide>
                  <select
                    className={inputClass}
                    value={form.engine}
                    onChange={(e) => setForm({ ...form, engine: e.target.value })}
                  >
                    <option value="">None</option>
                    {ENGINES.map((en) => (
                      <option key={en} value={en}>{en}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Notes" wide>
                  <textarea
                    className={`${inputClass} min-h-28`}
                    placeholder="Takeaways, timestamps, gotchas"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </Field>
              </div>

              <div>
                <span className="mb-2 block text-xs font-medium text-text-secondary">Categories</span>
                <div className="flex flex-wrap gap-2">
                  {categories.length === 0 && (
                    <p className="text-sm text-text-secondary">
                      No categories yet. Add some from the left sidebar.
                    </p>
                  )}
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleFormCategory(c.id)}
                      className={pillClass(form.category_ids.includes(c.id))}
                    >
                      {c.parent_id ? `${categoryById.get(c.parent_id)?.name} / ${c.name}` : c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border-default px-6 py-4">
              <button
                onClick={closeEditor}
                className="rounded-lg border border-border-default px-4 py-2 text-sm hover:border-neutral-500"
              >
                Cancel
              </button>
              <button
                onClick={saveResource}
                disabled={saving}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId === 'new' ? 'Add Resource' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}