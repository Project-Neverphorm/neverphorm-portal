// app/dashboard/training/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

type TeamMember = {
  id: string
  full_name: string
  title: string
}

type ProgressRow = {
  id: string
  user_id: string
  pathway_key: string
  completed: boolean
  completed_at: string | null
}

type Pathway = {
  key: string
  title: string
  org: string
  description: string
  url: string
}

// Required pathways — these get tracked with checkboxes and count toward
// the progress tracker in the sidebar. Add/remove entries here as the
// list of required pathways changes.
const PATHWAYS: Pathway[] = [
  {
    key: 'unity',
    title: 'Unity Pathways',
    org: 'Unity Learn',
    description:
      "Unity's official learning pathways. Required for anyone working inside the Unity engine, regardless of experience level.",
    url: 'https://learn.unity.com/pathways',
  },
  {
    key: 'unreal',
    title: "Unreal's Pathway",
    org: 'Epic Games / Unreal Learning',
    description:
      "Unreal Engine's official learning pathway. Required for anyone working inside Unreal, regardless of experience level.",
    url: 'https://dev.epicgames.com/community/learning',
  },
  {
    key: 'hubspot',
    title: 'HubSpot Academy',
    org: 'HubSpot',
    description:
      'Free certification pathway covering inbound marketing, SEO, content strategy, and social media. Required for business-side roles.',
    url: 'https://academy.hubspot.com/',
  },
  {
    key: 'alison',
    title: 'Business Management Diploma',
    org: 'Alison',
    description:
      'Free diploma pathway covering business management, entrepreneurship, and core accounting concepts. Required for business-side roles.',
    url: 'https://alison.com/course/diploma-in-business-management-and-entrepreneurship-revised-2017',
  },
]

// Supplementary / optional certifications — link-only, no completion tracking.
const CERT_LINKS: Pathway[] = [
  {
    key: 'coursera-marketing',
    title: "Coursera's Marketing Certification",
    org: 'Coursera / Google',
    description:
      'Optional deeper dive into digital marketing and e-commerce for anyone who wants to specialize further.',
    url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
  },
  {
    key: 'ui-ux',
    title: 'UI/UX Certification',
    org: 'Coursera / Google',
    description:
      'Optional certification for anyone touching product, UI, or UX design work.',
    url: 'https://www.coursera.org/professional-certificates/google-ux-design',
  },
]

export default function TrainingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [myProfile, setMyProfile] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [progressLoading, setProgressLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const loadTeam = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, title')
    setTeamMembers(data ?? [])
  }

  const loadProgress = async () => {
    const { data, error } = await supabase.from('training_progress').select('*')
    if (error) {
      console.error('Failed to load training progress:', error)
    } else if (data) {
      setProgress(data)
    }
    setProgressLoading(false)
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, title')
        .eq('id', user.id)
        .single()
      setMyProfile(profile)

      setLoading(false)
    }
    checkUser()
    loadTeam()
    loadProgress()
  }, [router])

  const isComplete = (userId: string, pathwayKey: string) =>
    progress.some((p) => p.user_id === userId && p.pathway_key === pathwayKey && p.completed)

  const completedCountForMember = (userId: string) =>
    PATHWAYS.filter((p) => isComplete(userId, p.key)).length

  const togglePathway = async (pathwayKey: string) => {
    if (!user) return
    setSavingKey(pathwayKey)

    const existing = progress.find((p) => p.user_id === user.id && p.pathway_key === pathwayKey)
    const nowComplete = !(existing?.completed ?? false)

    const { error } = await supabase.from('training_progress').upsert(
      {
        user_id: user.id,
        pathway_key: pathwayKey,
        completed: nowComplete,
        completed_at: nowComplete ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,pathway_key' }
    )

    if (error) {
      console.error('Failed to update training progress:', error)
      alert(`Failed to save: ${error.message}`)
      setSavingKey(null)
      return
    }

    await loadProgress()
    setSavingKey(null)
  }

  if (loading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  const myCompletedCount = completedCountForMember(user?.id ?? '')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="flex">
        <main className="flex-1 px-10 py-10">
          <div className="mb-10">
            <h1 className="text-2xl font-bold">Training</h1>
            <p className="text-text-secondary text-sm mt-1">
              Everyone on the team, including leadership, is expected to complete the
              pathways that apply to their role. This page is the single source of truth
              for what&apos;s required and how far along everyone is.
            </p>
          </div>

          <section id="pathways" className="mb-14">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm uppercase tracking-wide text-text-secondary">Pathways</h2>
              <span className="text-xs text-text-secondary">
                {myCompletedCount} / {PATHWAYS.length} complete
              </span>
            </div>
            <p className="text-2xl font-bold mb-6">Required Learning Pathways</p>

            <div className="grid grid-cols-2 gap-6">
              {PATHWAYS.map((pathway) => {
                const complete = isComplete(user?.id ?? '', pathway.key)
                const saving = savingKey === pathway.key

                return (
                  <div
                    key={pathway.key}
                    className={`border rounded-lg p-6 transition-colors ${
                      complete ? 'border-brand' : 'border-border-default'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                          {pathway.org}
                        </p>
                        <h3 className="text-lg font-semibold">{pathway.title}</h3>
                      </div>
                      <button
                        onClick={() => togglePathway(pathway.key)}
                        disabled={saving}
                        aria-label={
                          complete ? `Mark "${pathway.title}" incomplete` : `Mark "${pathway.title}" complete`
                        }
                        className={`w-6 h-6 rounded border shrink-0 flex items-center justify-center text-xs transition-colors ${
                          complete
                            ? 'bg-brand border-brand text-black'
                            : 'border-neutral-600 hover:border-brand'
                        } ${saving ? 'opacity-50' : ''}`}
                      >
                        {complete ? '✓' : ''}
                      </button>
                    </div>

                    <p className="text-sm text-neutral-300 mb-4">{pathway.description}</p>

                    
                      <a href={pathway.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand hover:underline"
                    >
                      Open pathway →
                    </a>
                  </div>
                )
              })}
            </div>
          </section>

          <section id="certification-links">
            <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-1">
              Certification Links
            </h2>
            <p className="text-2xl font-bold mb-2">Optional / Supplementary</p>
            <p className="text-sm text-text-secondary mb-6">
              Not required, but useful for going deeper in a specific area.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {CERT_LINKS.map((cert) => (
                <div key={cert.key} className="border border-border-default rounded-lg p-6">
                  <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                    {cert.org}
                  </p>
                  <h3 className="text-lg font-semibold mb-2">{cert.title}</h3>
                  <p className="text-sm text-neutral-300 mb-4">{cert.description}</p>
                  
                    <a href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand hover:underline"
                  >
                    Open course →
                  </a>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="w-80 shrink-0 border-l border-border-default px-6 py-10 min-h-screen">
          <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-4">
            Team Progress
          </h2>

          <div className="space-y-6 mb-10">
            {teamMembers.map((member) => {
              const count = completedCountForMember(member.id)
              const initials = member.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div key={member.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-brand text-black font-bold flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{member.full_name}</p>
                      <p className="text-xs text-text-secondary">{member.title}</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mb-1">
                    {count} / {PATHWAYS.length} pathways complete
                  </p>
                  <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand"
                      style={{ width: `${(count / PATHWAYS.length) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {teamMembers.length === 0 && (
              <p className="text-xs text-text-secondary">No team members yet.</p>
            )}
          </div>

          <div className="border-t border-border-default pt-6">
            <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-3">
              Why this matters
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              These pathways exist so nobody on the team is left figuring out an engine or
              a business fundamental on their own. Complete the ones that apply to your
              role — this page is the record of where everyone stands, checked off for
              good.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}