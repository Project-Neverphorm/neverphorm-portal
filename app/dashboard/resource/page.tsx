// app/dashboard/resources/page.tsx

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

/* ---------- static content ---------- */

const devStack: Record<string, string[]> = {
  'Game Development': ['Unity', 'Unreal Engine', 'C++', 'C#', 'Maya', 'Blender', 'Autodesk Sketchbook', 'Substance Painter', 'Figma', 'GitHub', 'DaVinci'],
  'Web & Systems': ['React', 'React Native', 'TailwindCSS', 'Vercel', 'Vite', 'VIM', 'Rebase', 'JavaScript', 'Supabase', 'Node.js', 'GitHub'],
  'Planning & Workflow': ['IET', 'Notion', 'Google Drive', 'Discord', 'DocuSign', 'Microsoft 365'],
}

const PIPELINE = [
  { name: 'Concept', desc: 'Sketches, references, silhouettes', parent: 'art' },
  { name: 'Modeling', desc: 'Blockout, sculpting, base mesh', parent: 'art' },
  { name: 'Retopology', desc: 'Clean, game-ready topology', parent: 'art' },
  { name: 'UV Unwrapping', desc: 'Seams, islands, texel density', parent: 'art' },
  { name: 'Texturing', desc: 'Baking, Substance, materials', parent: 'art' },
  { name: 'Rigging', desc: 'Armature, weights, controls', parent: 'animation' },
  { name: 'Animation', desc: 'Cycles, poses, root motion', parent: 'animation' },
  { name: 'Export to Engine', desc: 'FBX settings, scale, import', parent: 'programming' },
]

const QUICK_LINKS = [
  { name: 'Blender Manual', url: 'https://docs.blender.org/manual/en/latest/' },
  { name: 'Unity Manual', url: 'https://docs.unity3d.com/Manual/index.html' },
  { name: 'Unreal Docs', url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine' },
  { name: 'Substance 3D Painter Docs', url: 'https://helpx.adobe.com/substance-3d-painter/home.html' },
  { name: 'Mixamo', url: 'https://www.mixamo.com' },
  { name: 'Poly Haven', url: 'https://polyhaven.com' },
  { name: 'Kenney Assets', url: 'https://kenney.nl/assets' },
  { name: 'Sketchfab', url: 'https://sketchfab.com' },
]

const NEW_WINDOW_DAYS = 7
const RECENT_COUNT = 6

/* ---------- types ---------- */

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
  notes: string | null
  pinned: boolean
  created_at: string
  resource_categories: { category_id: string }[]
}

type FormState = {
  title: string
  url: string
  creator: string
  notes: string
  category_ids: string[]
}

type SortMode = 'newest' | 'oldest' | 'az'

const emptyForm: FormState = { title: '', url: '', creator: '', notes: '', category_ids: [] }

/* ---------- styling helpers ---------- */

const panelClass = 'rounded-xl border border-border-default bg-elevated/20 p-5'

const panelSticky = 'min-[1800px]:sticky min-[1800px]:top-8 self-start'

const inputClass =
  'w-full rounded-lg border border-border-default bg-elevated px-3 py-2.5 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500'

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

const PlusIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const PlayIcon = ({ className = 'h-8 w-8' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z" />
  </svg>
)

const CloseIcon = ({ small }: { small?: boolean }) => (
  <svg className={small ? 'h-3.5 w-3.5' : 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

const PinIcon = ({ filled }: { filled?: boolean }) => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6Z" />
  </svg>
)

const LinkIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" />
  </svg>
)

const ExternalIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
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

function detectType(url: string | null): string {
  if (!url) return 'guide'
  try {
    const u = new URL(url)
    const isYouTube = u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')
    if (isYouTube) {
      if (u.hostname.includes('youtu.be') || u.searchParams.get('v')) return 'video'
      if (u.searchParams.get('list')) return 'playlist'
      return 'video'
    }
    if (u.pathname.toLowerCase().endsWith('.pdf')) return 'doc'
    return 'article'
  } catch {
    return 'article'
  }
}

const isNew = (createdAt: string) =>
  Date.now() - new Date(createdAt).getTime() < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

/* ---------- page ---------- */

export default function ResourcePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [resources, setResources] = useState<Resource[]>([])

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('newest')

  const [editingId, setEditingId] = useState<string | null>(null) // 'new' or a resource id
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryParent, setNewCategoryParent] = useState('')

  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [catRes, resRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order').order('name'),
      supabase
        .from('resources')
        .select('*, resource_categories(category_id)')
        .order('created_at', { ascending: false }),
    ])

    const firstError = catRes.error ?? resRes.error
    if (firstError) {
      setError(firstError.message)
      return
    }

    setCategories(catRes.data as Category[])
    setResources(resRes.data as Resource[])
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
      await loadData()
      setLoading(false)
    }

    init()
  }, [router, loadData])

  useEffect(() => {
    if (editingId === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEditor()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editingId])

  /* ---------- derived ---------- */

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const topLevel = categories.filter((c) => !c.parent_id)
  const activeParent = activeCategory
    ? categoryById.get(activeCategory)?.parent_id ?? activeCategory
    : null

  const countFor = (categoryId: string) => {
    const ids = new Set([categoryId, ...categories.filter((c) => c.parent_id === categoryId).map((c) => c.id)])
    return resources.filter((r) => r.resource_categories.some((rc) => ids.has(rc.category_id))).length
  }

  const findCategoryByName = (name: string) =>
    categories.find((c) => c.name.toLowerCase() === name.toLowerCase())

  const typesInUse = useMemo(() => Array.from(new Set(resources.map((r) => r.type))).sort(), [resources])
  const pinned = resources.filter((r) => r.pinned)
  const recent = resources.slice(0, RECENT_COUNT)
  const newCount = resources.filter((r) => isNew(r.created_at)).length
  const totalTools = new Set(Object.values(devStack).flat()).size

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const allowed = activeCategory
      ? new Set([activeCategory, ...categories.filter((c) => c.parent_id === activeCategory).map((c) => c.id)])
      : null

    const list = resources.filter((r) => {
      if (typeFilter && r.type !== typeFilter) return false
      if (allowed && !r.resource_categories.some((rc) => allowed.has(rc.category_id))) return false
      if (q) {
        const haystack = [r.title, r.creator, r.notes].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    return [...list].sort((a, b) => {
      if (sortMode === 'az') return a.title.localeCompare(b.title)
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortMode === 'oldest' ? diff : -diff
    })
  }, [resources, categories, search, activeCategory, typeFilter, sortMode])

  const activeCategoryName = activeCategory ? categoryById.get(activeCategory)?.name : 'All Resources'
  const hasFilters = !!(activeCategory || search || typeFilter)

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

  const clearFilters = () => {
    setActiveCategory(null)
    setSearch('')
    setTypeFilter('')
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

    const url = nullIfEmpty(form.url)
    const payload = {
      title: form.title.trim(),
      url,
      creator: nullIfEmpty(form.creator),
      notes: nullIfEmpty(form.notes),
      type: detectType(url),
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
    await loadData()
  }

  const deleteResource = async (id: string) => {
    if (!confirm('Delete this resource?')) return
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    await loadData()
  }

  const togglePin = async (r: Resource) => {
    const { error } = await supabase.from('resources').update({ pinned: !r.pinned }).eq('id', r.id)
    if (error) {
      setError(error.message)
      return
    }
    await loadData()
  }

  const copyLink = async (r: Resource) => {
    if (!r.url) return
    try {
      await navigator.clipboard.writeText(r.url)
      setCopiedId(r.id)
      setTimeout(() => setCopiedId((curr) => (curr === r.id ? null : curr)), 1500)
    } catch {
      setError('Could not copy link.')
    }
  }

  const insertCategory = async (name: string, parentId: string | null) => {
    const { error } = await supabase.from('categories').insert({
      name: name.trim(),
      slug: slugify(name),
      parent_id: parentId,
    })
    if (error) {
      setError(error.message)
      return false
    }
    await loadData()
    return true
  }

  const addCategory = async () => {
    if (!newCategoryName.trim()) return
    const ok = await insertCategory(newCategoryName, newCategoryParent || null)
    if (ok) {
      setNewCategoryName('')
      setNewCategoryParent('')
      setShowNewCategory(false)
    }
  }

  const createStageCategory = async (stage: (typeof PIPELINE)[number]) => {
    const parent = categories.find((c) => c.slug === stage.parent && !c.parent_id)
    await insertCategory(stage.name, parent?.id ?? null)
  }

  const deleteCategory = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? Resources stay, they just lose this tag.`)) return
    const { error } = await supabase.from('categories').delete().eq('id', c.id)
    if (error) {
      setError(error.message)
      return
    }
    if (activeCategory === c.id) setActiveCategory(null)
    await loadData()
  }

  /* ---------- render pieces ---------- */

  const renderCard = (r: Resource) => {
    const thumb = youtubeThumb(r.url)

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
            {r.creator && <span className="text-xs uppercase tracking-widest text-neutral-600">{r.creator}</span>}
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-neutral-200 backdrop-blur">
            {r.type}
          </span>
          {isNew(r.created_at) && (
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white">
              New
            </span>
          )}
        </div>

        {r.pinned && (
          <span className="absolute right-3 top-3 rounded-md bg-amber-500 p-1 text-black">
            <PinIcon filled />
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

          <p className="mt-1 text-xs text-text-secondary">
            {[r.creator, timeAgo(r.created_at)].filter(Boolean).join(' · ')}
          </p>

          {r.resource_categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.resource_categories.map((rc) => {
                const cat = categoryById.get(rc.category_id)
                return cat ? (
                  <button
                    key={rc.category_id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="rounded-md bg-neutral-800/80 px-2 py-0.5 text-[11px] text-neutral-300 hover:bg-neutral-700"
                  >
                    {cat.name}
                  </button>
                ) : null
              })}
            </div>
          )}

          {r.notes && (
            <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-text-secondary">{r.notes}</p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            {r.url ? (
              <button
                onClick={() => copyLink(r)}
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-foreground"
              >
                <LinkIcon />
                {copiedId === r.id ? 'Copied!' : 'Copy link'}
              </button>
            ) : (
              <span />
            )}

            {isAdmin && (
              <div className="flex items-center gap-3 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => togglePin(r)}
                  title={r.pinned ? 'Unpin' : 'Pin to Start Here'}
                  className={r.pinned ? 'text-amber-400 hover:text-amber-300' : 'text-text-secondary hover:text-foreground'}
                >
                  <PinIcon filled={r.pinned} />
                </button>
                <button onClick={() => startEdit(r)} className="text-text-secondary hover:text-foreground">
                  Edit
                </button>
                <button onClick={() => deleteResource(r.id)} className="text-red-500 hover:text-red-300">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    )
  }

  const renderMini = (r: Resource) => {
    const thumb = youtubeThumb(r.url)
    const inner = (
      <>
        <div className="flex aspect-video w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-900">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-neutral-700">
              <PlayIcon className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm group-hover/mini:underline">{r.title}</p>
          <p className="text-xs text-text-secondary">
            {[r.creator, timeAgo(r.created_at)].filter(Boolean).join(' · ')}
          </p>
        </div>
      </>
    )

    const cls = 'group/mini flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-elevated/50'

    return r.url ? (
      <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    ) : (
      <div key={r.id} className={cls}>
        {inner}
      </div>
    )
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

      <main className="w-full px-6 py-10 lg:px-10">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-border-default pb-8">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">Studio Resources</p>
            <h1 className="text-3xl font-bold tracking-tight">Learning Library</h1>
            <p className="mt-2 max-w-xl text-sm text-text-secondary">
              Tutorials, guides, and references for everything we build.
              {newCount > 0 && <span className="ml-1 text-blue-400">{newCount} new this week.</span>}
            </p>
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
        </header>

        {error && editingId === null && (
          <div className="mb-8 flex items-center justify-between rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              <CloseIcon />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px] min-[1800px]:grid-cols-[220px_minmax(0,1fr)_270px_290px_300px]">
          {/* 1. Browse */}
          <nav className="self-start lg:sticky lg:top-8">
            <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Browse</p>

            <div className="space-y-0.5">
              <button onClick={() => setActiveCategory(null)} className={navItemClass(activeCategory === null)}>
                <span>All Resources</span>
                <span className={countBadge(activeCategory === null)}>{resources.length}</span>
              </button>

              {topLevel.map((c) => (
                <div key={c.id}>
                  <div className="group/cat relative">
                    <button onClick={() => setActiveCategory(c.id)} className={navItemClass(activeCategory === c.id)}>
                      <span className="truncate">{c.name}</span>
                      <span className={countBadge(activeCategory === c.id)}>{countFor(c.id)}</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => deleteCategory(c)}
                        title="Delete category"
                        className="absolute -left-5 top-1/2 -translate-y-1/2 text-neutral-600 opacity-0 hover:text-red-400 group-hover/cat:opacity-100"
                      >
                        <CloseIcon small />
                      </button>
                    )}
                  </div>

                  {activeParent === c.id && categories.some((s) => s.parent_id === c.id) && (
                    <div className="my-1 ml-4 space-y-0.5 border-l border-neutral-800 pl-2">
                      {categories
                        .filter((sub) => sub.parent_id === c.id)
                        .map((sub) => (
                          <div key={sub.id} className="group/cat relative">
                            <button
                              onClick={() => setActiveCategory(sub.id)}
                              className={navItemClass(activeCategory === sub.id)}
                            >
                              <span className="truncate">{sub.name}</span>
                              <span className={countBadge(activeCategory === sub.id)}>{countFor(sub.id)}</span>
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => deleteCategory(sub)}
                                title="Delete category"
                                className="absolute -left-5 top-1/2 -translate-y-1/2 text-neutral-600 opacity-0 hover:text-red-400 group-hover/cat:opacity-100"
                              >
                                <CloseIcon small />
                              </button>
                            )}
                          </div>
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

          {/* 2. Library */}
          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {activeCategoryName}
                <span className="ml-2 text-sm font-normal text-text-secondary">{filtered.length}</span>
              </h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-text-secondary hover:text-foreground">
                  Clear filters
                </button>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <SearchIcon />
                </span>
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search titles, creators, notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className={`${inputClass} sm:w-40`}
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="az">A to Z</option>
              </select>
            </div>

            {typesInUse.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                <button onClick={() => setTypeFilter('')} className={pillClass(typeFilter === '')}>
                  All types
                </button>
                {typesInUse.map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)} className={pillClass(typeFilter === t)}>
                    {t}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 px-6 py-20 text-center">
                <div className="mb-4 text-neutral-700">
                  <PlayIcon />
                </div>
                <p className="font-medium">
                  {resources.length === 0 ? 'The library is empty' : 'Nothing matches that'}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {resources.length === 0
                    ? 'Add your first tutorial, playlist, or guide to get started.'
                    : 'Try a different search or category.'}
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
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {filtered.map(renderCard)}
              </div>
            )}
          </section>

          {/* 3 to 5: side panels. Stack in one column on xl, spread into their own columns at 1800px+ */}
          <div className="space-y-6 lg:col-span-2 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 xl:col-span-1 xl:block xl:space-y-6 min-[1800px]:contents">
            {/* 3. Character Pipeline */}
            <section className={`${panelClass} ${panelSticky}`}>
              <h2 className="font-semibold">Character Pipeline</h2>
              <p className="mt-1 text-xs text-text-secondary">Concept to engine, in order. Click a step to filter.</p>

              <ol className="mt-4 space-y-0.5">
                {PIPELINE.map((stage, i) => {
                  const cat = findCategoryByName(stage.name)
                  const count = cat ? countFor(cat.id) : 0
                  const active = !!cat && activeCategory === cat.id

                  return (
                    <li key={stage.name}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => (cat ? setActiveCategory(cat.id) : setSearch(stage.name))}
                        onKeyDown={(e) => e.key === 'Enter' && (cat ? setActiveCategory(cat.id) : setSearch(stage.name))}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors ${
                          active ? 'bg-elevated' : 'hover:bg-elevated/50'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
                            count > 0 ? 'bg-foreground text-background' : 'border border-neutral-700 text-neutral-500'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm">{stage.name}</span>
                            <span className="text-xs tabular-nums text-neutral-500">{count}</span>
                          </div>
                          <p className="text-xs text-text-secondary">{stage.desc}</p>
                          {isAdmin && !cat && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                createStageCategory(stage)
                              }}
                              className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500 hover:text-foreground"
                            >
                              <PlusIcon className="h-3 w-3" />
                              Create category
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>

            {/* 4. Start Here + Recently Added */}
            <section className={`${panelClass} ${panelSticky}`}>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">
                  <PinIcon filled />
                </span>
                <h2 className="font-semibold">Start Here</h2>
              </div>
              <p className="mt-1 text-xs text-text-secondary">The essentials, pinned for the team.</p>

              <div className="mt-3 space-y-1">
                {pinned.length === 0 ? (
                  <p className="py-2 text-sm text-neutral-500">
                    {isAdmin ? 'Pin resources from their cards to show them here.' : 'Nothing pinned yet.'}
                  </p>
                ) : (
                  pinned.map(renderMini)
                )}
              </div>

              <div className="mt-5 border-t border-neutral-800 pt-5">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-semibold">Recently Added</h2>
                  {newCount > 0 && <span className="text-xs text-blue-400">{newCount} this week</span>}
                </div>
                <div className="mt-3 space-y-1">
                  {recent.length === 0 ? (
                    <p className="py-2 text-sm text-neutral-500">Nothing yet.</p>
                  ) : (
                    recent.map(renderMini)
                  )}
                </div>
              </div>
            </section>

            {/* 5. Studio Stack + Quick Links */}
            <div className={`space-y-6 ${panelSticky}`}>
              <section className={panelClass}>
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="font-semibold">Studio Stack</h2>
                  <span className="text-xs text-text-secondary">{totalTools} tools</span>
                </div>

                <p className="mb-6 border-l-2 border-neutral-700 pl-3 text-xs leading-relaxed text-text-secondary">
                  The development stack depends on the project. Unity and Unreal are both used, since the choice of
                  engine comes down to what each game needs, they&apos;re tools, not a fixed pipeline. Everything else in
                  the stack is flexible for future team members to bring their own preferred tools; engine choice per
                  game is the one thing that doesn&apos;t flex.
                </p>

                <div className="space-y-5">
                  {Object.entries(devStack).map(([category, tools]) => (
                    <div key={category}>
                      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {tools.map((tool) => (
                          <button
                            key={`${category}-${tool}`}
                            onClick={() => setSearch(tool)}
                            title={`Search the library for ${tool}`}
                            className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-300 hover:border-neutral-600 hover:text-foreground"
                          >
                            {tool}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={panelClass}>
                <h2 className="font-semibold">Quick Links</h2>
                <p className="mt-1 text-xs text-text-secondary">Docs and asset sites we use constantly.</p>
                <div className="mt-3 space-y-0.5">
                  {QUICK_LINKS.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-elevated/50 hover:text-foreground"
                    >
                      <span>{link.name}</span>
                      <ExternalIcon />
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Editor modal */}
      {isAdmin && editingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-20 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && closeEditor()}
        >
          <div className="w-full max-w-lg rounded-xl border border-border-default bg-background p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{editingId === 'new' ? 'Add Resource' : 'Edit Resource'}</h2>
              <button onClick={closeEditor} className="text-text-secondary hover:text-foreground">
                <CloseIcon />
              </button>
            </div>

            {error && (
              <div className="mb-3 rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <input
                autoFocus
                className={inputClass}
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Link"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Creator"
                value={form.creator}
                onChange={(e) => setForm({ ...form, creator: e.target.value })}
              />
              <textarea
                className={`${inputClass} min-h-24`}
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />

              <div className="pt-1">
                <p className="mb-2 text-xs text-text-secondary">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.length === 0 && (
                    <p className="text-sm text-neutral-500">None yet. Add some from the sidebar.</p>
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

            <div className="mt-5 flex justify-end gap-2">
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
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}