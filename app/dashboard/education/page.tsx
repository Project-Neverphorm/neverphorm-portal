// app/dashboard/education/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

type Detail = {
  overview: string
  responsibilities?: string[]
  whyChosen?: string
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
      {
        id: '3d-artist',
        name: '3D Artist',
        detail: {
          overview:
            'Builds the 3D models used in-game — characters, props, environments, and vehicles — from concept art or reference into game-ready assets.',
          responsibilities: [
            'Model characters, props, and environment pieces to spec',
            'Keep polycounts within budget for the target platform',
            'UV unwrap models cleanly for texturing',
            'Collaborate with texture/animation artists to hand off rigged-ready meshes',
            'Maintain a consistent art style across all modeled assets',
          ],
          docs: [{ label: 'Blender Manual', url: 'https://docs.blender.org/manual/en/latest/' }],
          tips: ['Keep a personal library of reusable base meshes to speed up blocking'],
        },
      },
      { id: 'animator', name: 'Animator', detail: null },
      { id: 'concept-artist', name: 'Concept Artist', detail: null },
      { id: 'environment-artist', name: 'Environment Artist', detail: null },
      { id: 'character-artist', name: 'Character Artist', detail: null },
      { id: 'creature-artist', name: 'Creature Artist', detail: null },
      { id: 'technical-artist', name: 'Technical Artist', detail: null},
      { id: 'vfx-artist', name: 'VFX Artist', detail: null },
      { id: 'lighting-artist', name: 'Lighting Artist', detail: null },
      { id: 'ui/ux-artist', name: 'UI/UX Artist', detail: null },
      { id: 'cinematic-artist', name: 'Cinematic Artist', detail: null },
      { id: 'art-director', name: 'Art Director', detail: null },
      { id: 'lead-artist', name: 'Lead Artist', detail: null},
    ],
  },
  {
    id: 'audio',
    name: 'Audio',
    items: [
      { id: 'sound-designer', name: 'Sound Designer', detail: null },
      { id: 'composer', name: 'Composer', detail: null },
      { id: 'audio-programmer', name: 'Audio Programmer', detail: null},
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
      { id: 'publisher-realtions', name: 'Publisher (Relations)', detail: null},
      { id: 'pr-manager', name: 'PR Manager', detail: null },
      { id: 'localization-manager', name: 'Localization Manager', detail: null },
      { id: 'legal/business-affairs', name: 'Legal/Business Affairs', detail: null },
      { id: 'finance-accounting', name: 'Finance/Accounting', detail: null },
      { id: 'hr/people-ops', name: 'HR/People Ops', detail: null },
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
      { id: 'graphics/rendoring programmer', name: 'Graphics/Rendoring Programmer', detail: null },
      { id: 'ai-programmer', name: 'AI Programmer', detail: null},
      { id: 'physics-programmer', name: 'Physics Programmer', detail: null },
    ],
  },
  {
    id: 'qa/testing',
    name: 'QA / Testing',
    items: [
      { id: 'qa-tester', name: 'QA Tester', detail: null },
      { id: 'qa-lead', name: 'QA Lead', detail: null },
      { id: 'automation-engineer', name: 'Automation Engineer', detail: null },
      { id: 'compliance/cert-tester', name: 'Compliance/Cert Tester (platform cert)', detail: null },
      { id: 'localization-qa', name: 'Localization QA', detail: null },
    ],
  },
  {
    id: 'production',
    name: 'Production',
    items: [
      { id: 'producer', name: 'Producer', detail: null },
      { id: 'associate-producer', name: 'Associate Producer', detail: null },
      { id: 'executive-producer', name: 'Executive Producer', detail: null },
      { id: 'projec-manager', name: 'Project Manager', detail: null },
      { id: 'scrum-master', name: 'Scrum Master', detail: null },
    ],
  },
  {
    id: 'data/analytics',
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
        { id: 'fab', name: 'FAB', detail: null }, // Epic's asset marketplace
      ],
    },
    {
      id: 'unity-technologies',
      name: 'Unity Technologies',
      items: [
        { id: 'unity-engine', name: 'Unity', detail: null },
      ],
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
      items: [
        { id: 'blender-tool', name: 'Blender', detail: null },
      ],
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      items: [
        { id: 'vscode-editor', name: 'VS Code', detail: null },
        { id: 'github-tool', name: 'GitHub', detail: null }, // MS-owned since 2018
        { id: 'microsoft-365', name: 'Microsoft 365', detail: null },
      ],
    },
    {
      id: 'git-scm',
      name: 'Git',
      items: [
        { id: 'git', name: 'Git', detail: null },
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
      items: [
        { id: 'vercel-platform', name: 'Vercel', detail: null },
        { id: 'vite', name: 'Vite', detail: null }, // stretch — see note below
      ],
    },
    {
      id: 'openjs-foundation',
      name: 'OpenJS Foundation',
      items: [
        { id: 'nodejs', name: 'Node.js', detail: null },
      ],
    },
    {
      id: 'expo',
      name: 'Expo',
      items: [
        { id: 'expo-tool', name: 'Expo', detail: null },
      ],
    },
    {
      id: 'supabase',
      name: 'Supabase',
      items: [
        { id: 'supabase-tool', name: 'Supabase', detail: null },
      ],
    },
    {
      id: 'atlassian',
      name: 'Atlassian',
      items: [
        { id: 'trello', name: 'Trello', detail: null },
      ],
    },
    {
      id: 'notion-labs',
      name: 'Notion Labs',
      items: [
        { id: 'notion-tool', name: 'Notion', detail: null },
      ],
    },
    {
      id: 'google',
      name: 'Google',
      items: [
        { id: 'google-drive', name: 'Google Drive', detail: null },
      ],
    },
    {
      id: 'discord-inc',
      name: 'Discord',
      items: [
        { id: 'discord-tool', name: 'Discord', detail: null },
      ],
    },
    {
      id: 'docusign',
      name: 'DocuSign',
      items: [
        { id: 'docusign-tool', name: 'DocuSign', detail: null },
      ],
    },
    {
      id: 'neverphorm-internal',
      name: 'Internal',
      items: [
        { id: 'iet', name: 'IET', detail: null }, // your own tool — not a vendor product
      ],
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
          { id: 'git', name: 'Git', detail: null }, // pull out of "Git" pseudo-vendor
        ],
      },
      {
        id: 'workflow-actions',
        name: 'Workflow & Git Practices',
        items: [
          { id: 'rebase', name: 'Rebase', detail: null }, // this is a technique, not a tool
        ],
      },
      {
        id: 'neverphorm-internal',
        name: 'Internal',
        items: [
          { id: 'iet', name: 'IET', detail: null },
        ],
      },
  ]

export default function EducationPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [section, setSection] = useState<'departments' | 'tools'>('departments')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)

  const tree = section === 'departments' ? departments : tools
  const category = tree.find((c) => c.id === categoryId) ?? null
  const item = category?.items.find((i) => i.id === itemId) ?? null

  const switchSection = (next: 'departments' | 'tools') => {
    setSection(next)
    setCategoryId(null)
    setItemId(null)
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [router])

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
        <div className="w-56 shrink-0 border-r border-border-default pr-6">
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
                  categoryId === c.id ? 'bg-elevated text-brand font-semibold' : 'text-neutral-300 hover:bg-elevated'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="w-64 shrink-0 border-r border-border-default px-6">
          {!category && (
            <p className="text-sm text-text-secondary">
              Select a {section === 'departments' ? 'department' : 'vendor'} to see what&apos;s inside.
            </p>
          )}
          {category && (
            <>
              <h2 className="text-xs uppercase tracking-wide text-text-secondary mb-3">{category.name}</h2>
              <div className="flex flex-col gap-1">
                {category.items.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setItemId(i.id)}
                    className={`text-left text-sm px-3 py-2 rounded transition-colors ${
                      itemId === i.id ? 'bg-elevated text-brand font-semibold' : 'text-neutral-300 hover:bg-elevated'
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

        <div className="flex-1 pl-8">
          {!item && (
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
          {item && item.detail && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
              <p className="text-sm text-neutral-300 leading-relaxed mb-6">{item.detail.overview}</p>

              {item.detail.whyChosen && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-wide text-text-secondary mb-2">Why we chose it</h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">{item.detail.whyChosen}</p>
                </div>
              )}

              {item.detail.responsibilities && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-wide text-text-secondary mb-2">Responsibilities</h3>
                  <ul className="space-y-1">
                    {item.detail.responsibilities.map((r) => (
                      <li key={r} className="text-sm text-neutral-300 flex items-start gap-2">
                        <span className="text-brand mt-1">•</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.detail.docs && item.detail.docs.length > 0 && (
                <div className="mb-6">
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

              {item.detail.tips && item.detail.tips.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-wide text-text-secondary mb-2">Tips & shortcuts</h3>
                  <ul className="space-y-1">
                    {item.detail.tips.map((t) => (
                      <li key={t} className="text-sm text-neutral-300 flex items-start gap-2">
                        <span className="text-brand mt-1">•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.detail.videos && item.detail.videos.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  )
}