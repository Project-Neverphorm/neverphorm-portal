// app/dashboard/education/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

type DetailSection = {
  id: string
  label: string
  content: string[]
}

type Detail = {
  overview: string
  whyChosen?: string
  responsibilities?: string[]
  sections?: DetailSection[]
  docs?: { label: string; url: string }[]
  tips?: string[]
  videos?: { label: string; url: string }[]
}

type Item = {
  id: string
  name: string
  detail: Detail | null
}

type Category = {
  id: string
  name: string
  items: Item[]
}

const departments: Category[] = [
  {
    id: 'art',
    name: 'Art',
    items: [
      { id: '3d-artist', name: '3D Artist', detail: null },
      { id: 'animator', name: 'Animator', detail: null },
      { id: 'concept-artist', name: 'Concept Artist', detail: null },
      { id: 'environment-artist', name: 'Environment Artist', detail: null },
      { id: 'character-artist', name: 'Character Artist', detail: null },
      { id: 'creature-artist', name: 'Creature Artist', detail: null },
      { id: 'technical-artist', name: 'Technical Artist', detail: null },
      { id: 'vfx-artist', name: 'VFX Artist', detail: null },
      { id: 'lighting-artist', name: 'Lighting Artist', detail: null },
      { id: 'ui/ux-artist', name: 'UI/UX Artist', detail: null },
      { id: 'cinematic-artist', name: 'Cinematic Artist', detail: null },
      { id: 'art-director', name: 'Art Director', detail: null },
      { id: 'lead-artist', name: 'Lead Artist', detail: null },
    ],
  },
  {
    id: 'audio',
    name: 'Audio',
    items: [
      { id: 'sound-designer', name: 'Sound Designer', detail: null },
      { id: 'composer', name: 'Composer', detail: null },
      { id: 'audio-programmer', name: 'Audio Programmer', detail: null },
      { id: 'voice-director', name: 'Voice Director', detail: null },
      { id: 'dialogue-editor', name: 'Dialogue Editor', detail: null },
      { id: 'audio-lead', name: 'Audio Lead', detail: null },
    ],
  },
  {
    id: 'business-ops',
    name: 'Business Ops',
    items: [
      { id: 'producer', name: 'Producer', detail: null },
      { id: 'community-manager', name: 'Community Manager', detail: null },
      { id: 'marketing', name: 'Marketing', detail: null },
      { id: 'seo-specialist', name: 'SEO Specialist', detail: null },
      { id: 'publisher-relations', name: 'Publisher (Relations)', detail: null },
      { id: 'pr-manager', name: 'PR Manager', detail: null },
      { id: 'localization-manager', name: 'Localization Manager', detail: null },
      { id: 'legal-business-affairs', name: 'Legal/Business Affairs', detail: null },
      { id: 'finance-accounting', name: 'Finance/Accounting', detail: null },
      { id: 'hr-people-ops', name: 'HR/People Ops', detail: null },
      { id: 'recruiter', name: 'Recruiter', detail: null },
    ],
  },
  {
    id: 'creative',
    name: 'Creative',
    items: [
      { id: 'creative-director', name: 'Creative Director', detail: null },
      { id: 'game-director', name: 'Game Director', detail: null },
      { id: 'narrative-designer', name: 'Narrative Designer', detail: null },
      { id: 'writer', name: 'Writer', detail: null },
      { id: 'game-designer', name: 'Game Designer', detail: null },
      { id: 'level-designer', name: 'Level Designer', detail: null },
      { id: 'systems-designer', name: 'Systems Designer', detail: null },
      { id: 'ux-designer', name: 'UX Designer', detail: null },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    items: [
      { id: 'gameplay-programmer', name: 'Gameplay Programmer', detail: null },
      { id: 'tools-programmer', name: 'Tools Programmer', detail: null },
      { id: 'systems-programmer', name: 'Systems Programmer', detail: null },
      { id: 'networking-programmer', name: 'Networking Programmer', detail: null },
      { id: 'security-engineer', name: 'Security Engineer', detail: null },
      { id: 'it-support', name: 'IT Support', detail: null },
      { id: 'web-development', name: 'Web Development', detail: null },
      { id: 'frontend', name: 'Frontend Development', detail: null },
      { id: 'backend', name: 'Backend Development', detail: null },
      { id: 'full-stack-developer', name: 'Full Stack Developer', detail: null },
      { id: 'dotnet-developer', name: '.NET Developer', detail: null },
      { id: 'cloud-computing', name: 'Cloud Developer', detail: null },
      { id: 'devops-engineer', name: 'DevOps Engineer', detail: null },
      { id: 'engine-programmer', name: 'Engine Programmer', detail: null },
      { id: 'graphics-rendering-programmer', name: 'Graphics/Rendering Programmer', detail: null },
      { id: 'ai-programmer', name: 'AI Programmer', detail: null },
      { id: 'physics-programmer', name: 'Physics Programmer', detail: null },
    ],
  },
  {
    id: 'qa-testing',
    name: 'QA / Testing',
    items: [
      { id: 'qa-tester', name: 'QA Tester', detail: null },
      { id: 'qa-lead', name: 'QA Lead', detail: null },
      { id: 'automation-engineer', name: 'Automation Engineer', detail: null },
      { id: 'compliance-cert-tester', name: 'Compliance/Cert Tester (platform cert)', detail: null },
      { id: 'localization-qa', name: 'Localization QA', detail: null },
    ],
  },
  {
    id: 'production',
    name: 'Production',
    items: [
      { id: 'associate-producer', name: 'Associate Producer', detail: null },
      { id: 'executive-producer', name: 'Executive Producer', detail: null },
      { id: 'project-manager', name: 'Project Manager', detail: null },
      { id: 'scrum-master', name: 'Scrum Master', detail: null },
    ],
  },
  {
    id: 'data-analytics',
    name: 'Data / Analytics',
    items: [
      { id: 'data-analyst', name: 'Data Analyst', detail: null },
      { id: 'data-engineer', name: 'Data Engineer', detail: null },
      { id: 'game-economy-designer', name: 'Game Economy Designer', detail: null },
    ],
  },
]

const tools: Category[] = [
  {
    id: 'epic-games',
    name: 'Epic Games',
    items: [
      { id: 'unreal-engine', name: 'Unreal Engine', detail: null },
      { id: 'fab', name: 'FAB', detail: null },
    ],
  },
  {
    id: 'unity-technologies',
    name: 'Unity Technologies',
    items: [{ id: 'unity-engine', name: 'Unity', detail: null }],
  },
  {
    id: 'adobe',
    name: 'Adobe',
    items: [
      { id: 'substance-painter', name: 'Substance Painter', detail: null },
      { id: 'photoshop', name: 'Photoshop', detail: null },
    ],
  },
  {
    id: 'autodesk',
    name: 'Autodesk',
    items: [
      { id: 'maya', name: 'Maya', detail: null },
      { id: 'sketchbook', name: 'Autodesk Sketchbook', detail: null },
    ],
  },
  {
    id: 'blender-foundation',
    name: 'Blender Foundation',
    items: [{ id: 'blender-tool', name: 'Blender', detail: null }],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    items: [
      { id: 'vscode-editor', name: 'VS Code', detail: null },
      { id: 'github-tool', name: 'GitHub', detail: null },
      { id: 'microsoft-365', name: 'Microsoft 365', detail: null },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    items: [
      { id: 'react', name: 'React', detail: null },
      { id: 'react-native', name: 'React Native', detail: null },
    ],
  },
  {
    id: 'tailwind-labs',
    name: 'Tailwind Labs',
    items: [
      { id: 'tailwindcss', name: 'TailwindCSS', detail: null },
    ],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    items: [{ id: 'vercel-platform', name: 'Vercel', detail: null }],
  },
  {
    id: 'openjs-foundation',
    name: 'OpenJS Foundation',
    items: [{ id: 'nodejs', name: 'Node.js', detail: null }],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    items: [{ id: 'supabase-tool', name: 'Supabase', detail: null }],
  },
  {
    id: 'notion-labs',
    name: 'Notion Labs',
    items: [{ id: 'notion-tool', name: 'Notion', detail: null }],
  },
  {
    id: 'google',
    name: 'Google',
    items: [{ id: 'google-drive', name: 'Google Drive', detail: null }],
  },
  {
    id: 'discord-inc',
    name: 'Discord',
    items: [{ id: 'discord-tool', name: 'Discord', detail: null }],
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    items: [{ id: 'docusign-tool', name: 'DocuSign', detail: null }],
  },
  {
    id: 'languages',
    name: 'Languages & Concepts',
    items: [
      { id: 'cpp', name: 'C++', detail: null },
      { id: 'csharp', name: 'C#', detail: null },
      { id: 'javascript', name: 'JavaScript', detail: null },
    ],
  },
  {
    id: 'independent-oss',
    name: 'Independent / Open Source',
    items: [
      { id: 'vim', name: 'VIM', detail: null },
      { id: 'vite', name: 'Vite', detail: null },
      { id: 'git', name: 'Git', detail: null },
    ],
  },
  {
    id: 'workflow-actions',
    name: 'Workflow & Git Practices',
    items: [{ id: 'rebase', name: 'Rebase', detail: null }],
  },
  {
    id: 'neverphorm-internal',
    name: 'Internal',
    items: [{ id: 'iet', name: 'IET', detail: null }],
  },
]

// ============================================================
// Supabase content wiring
// ============================================================

type EducationContentRow = {
  id: string
  category_id: string
  section_type: 'departments' | 'tools'
  name: string
  overview: string | null
  why_chosen: string | null
  responsibilities: string[] | null
  sections: DetailSection[] | null
  docs: { label: string; url: string }[] | null
  tips: string[] | null
  videos: { label: string; url: string }[] | null
}

function rowToDetail(row: EducationContentRow): Detail {
  return {
    overview: row.overview ?? '',
    whyChosen: row.why_chosen ?? undefined,
    responsibilities: row.responsibilities ?? undefined,
    sections: row.sections ?? undefined,
    docs: row.docs ?? undefined,
    tips: row.tips ?? undefined,
    videos: row.videos ?? undefined,
  }
}

function mergeDetails(tree: Category[], detailMap: Map<string, Detail>): Category[] {
  return tree.map((category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      detail: detailMap.get(item.id) ?? item.detail,
    })),
  }))
}

function DetailPanel({ item }: { item: Item }) {
  const sections = item.detail?.sections
  const [activeSection, setActiveSection] = useState<string | undefined>(sections?.[0]?.id)

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
      {item.detail?.overview && (
        <p className="text-sm text-neutral-300 leading-relaxed mb-6">{item.detail.overview}</p>
      )}

      {item.detail?.whyChosen && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-text-secondary mb-2">Why we chose it</h3>
          <p className="text-sm text-neutral-300 leading-relaxed">{item.detail.whyChosen}</p>
        </div>
      )}

      {item.detail?.responsibilities && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-text-secondary mb-2">Responsibilities</h3>
          <ul className="space-y-1">
            {item.detail.responsibilities.map((r) => (
              <li key={r} className="text-sm text-neutral-300 flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sections && sections.length > 0 && (
        <>
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border-default py-3 mb-6 flex gap-2 flex-wrap">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                  activeSection === s.id
                    ? 'bg-brand text-black font-medium'
                    : 'bg-elevated text-neutral-300 hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-20">
                <h3 className="text-lg font-semibold mb-3">{s.label}</h3>
                {s.content.map((line, i) => (
                  <p key={i} className="text-sm text-neutral-300 mb-2 leading-relaxed">
                    {line}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </>
      )}

      {item.detail?.docs && item.detail.docs.length > 0 && (
        <div className="mb-6 mt-6">
          <h3 className="text-xs uppercase tracking-wide text-text-secondary mb-2">Official docs</h3>
          <div className="flex flex-col gap-1">
            {item.detail.docs.map((d) => (
              
                <a key={d.url}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand hover:underline"
              >
                {d.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {item.detail?.tips && item.detail.tips.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-text-secondary mb-2">Tips & shortcuts</h3>
          <ul className="space-y-1">
            {item.detail.tips.map((t) => (
              <li key={t} className="text-sm text-neutral-300 flex items-start gap-2">
                <span className="text-brand mt-1">•</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.detail?.videos && item.detail.videos.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wide text-text-secondary mb-2">Video guides</h3>
          <div className="flex flex-col gap-1">
            {item.detail.videos.map((v) => (
              
                <a key={v.url}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand hover:underline"
              >
                {v.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function EducationPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(true)
  const router = useRouter()

  const [section, setSection] = useState<'departments' | 'tools'>('departments')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)

  const [vendorsCollapsed, setVendorsCollapsed] = useState(false)
  const [itemsCollapsed, setItemsCollapsed] = useState(false)

  // Content fetched from Supabase, keyed by item id
  const [detailMap, setDetailMap] = useState<Map<string, Detail>>(new Map())

  const mergedDepartments = mergeDetails(departments, detailMap)
  const mergedTools = mergeDetails(tools, detailMap)

  const tree = section === 'departments' ? mergedDepartments : mergedTools
  const category = tree.find((c) => c.id === categoryId) ?? null
  const item = category?.items.find((i) => i.id === itemId) ?? null

  const switchSection = (next: 'departments' | 'tools') => {
    setSection(next)
    setCategoryId(null)
    setItemId(null)
  }

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router])

  useEffect(() => {
    const loadContent = async () => {
      const { data, error } = await supabase.from('education_content').select('*')

      if (error) {
        console.error('Failed to load education content:', error)
        setContentLoading(false)
        return
      }

      const map = new Map<string, Detail>()
      ;(data as EducationContentRow[]).forEach((row) => {
        map.set(row.id, rowToDetail(row))
      })
      setDetailMap(map)
      setContentLoading(false)
    }
    loadContent()
  }, [])

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

      <div className="flex gap-2 px-10 pt-8">
        {(['departments', 'tools'] as const).map((s) => (
          <button
            key={s}
            onClick={() => switchSection(s)}
            className={`text-sm px-4 py-2 rounded border transition-colors ${
              section === s
                ? 'bg-brand text-black border-brand font-semibold'
                : 'border-neutral-700 text-text-secondary hover:text-foreground'
            }`}
          >
            {s === 'departments' ? 'Departments' : 'Tools'}
          </button>
        ))}
      </div>

      <div className="flex px-10 py-8 gap-0 min-h-[70vh]">
        {/* Category column (Departments / Vendors & Engines) */}
        <div
          className={`shrink-0 border-r border-border-default transition-all ${
            vendorsCollapsed ? 'w-10 pr-2' : 'w-56 pr-6'
          }`}
        >
          <button
            onClick={() => setVendorsCollapsed(!vendorsCollapsed)}
            className="mb-3 text-xs text-text-secondary hover:text-foreground"
          >
            {vendorsCollapsed ? '»' : '« Collapse'}
          </button>
          {!vendorsCollapsed && (
            <>
              <h2 className="text-xs uppercase tracking-wide text-text-secondary mb-3">
                {section === 'departments' ? 'Departments' : 'Vendors & Engines'}
              </h2>
              <div className="flex flex-col gap-1">
                {tree.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id)
                      setItemId(null)
                    }}
                    className={`text-left text-sm px-3 py-2 rounded transition-colors ${
                      categoryId === c.id
                        ? 'bg-elevated text-brand font-semibold'
                        : 'text-neutral-300 hover:bg-elevated'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Items column */}
        <div
          className={`shrink-0 border-r border-border-default transition-all ${
            itemsCollapsed ? 'w-10 px-2' : 'w-64 px-6'
          }`}
        >
          <button
            onClick={() => setItemsCollapsed(!itemsCollapsed)}
            className="mb-3 text-xs text-text-secondary hover:text-foreground"
          >
            {itemsCollapsed ? '»' : '« Collapse'}
          </button>
          {!itemsCollapsed && !category && (
            <p className="text-sm text-text-secondary">
              Select a {section === 'departments' ? 'department ' : 'vendor '} to see what&apos;s inside.
            </p>
          )}
          {!itemsCollapsed && category && (
            <>
              <h2 className="text-xs uppercase tracking-wide text-text-secondary mb-3">{category.name}</h2>
              <div className="flex flex-col gap-1">
                {category.items.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setItemId(i.id)}
                    className={`text-left text-sm px-3 py-2 rounded transition-colors ${
                      itemId === i.id
                        ? 'bg-elevated text-brand font-semibold'
                        : 'text-neutral-300 hover:bg-elevated'
                    }`}
                  >
                    {i.name}
                    {!i.detail && <span className="text-text-muted text-xs ml-2">·</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 pl-8 overflow-y-auto">
          {contentLoading && item === null && category && (
            <p className="text-sm text-text-secondary">Loading content…</p>
          )}
          {!item && !contentLoading && (
            <p className="text-sm text-text-secondary">
              {category ? 'Select an item to see the full breakdown.' : 'Nothing selected yet.'}
            </p>
          )}
          {item && !item.detail && (
            <div>
              <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
              <p className="text-sm text-text-secondary">Content coming soon.</p>
            </div>
          )}
          {item && item.detail && <DetailPanel item={item} />}
        </div>
      </div>
    </div>
  )
}