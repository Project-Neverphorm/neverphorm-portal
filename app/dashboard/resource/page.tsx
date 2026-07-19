// app/dashboard/resources/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

const devStack: Record<string, string[]> = {
  'Game Development': ['Unity', 'Unreal Engine', 'C++', 'C#', 'Maya', 'Blender', 'Autodesk Sketchbook', 'Substance Painter', 'Figma', 'GitHub', 'DaVinci'],
  'Web & Systems': ['React', 'React Native', 'TailwindCSS', 'Vercel', 'Vite', 'VIM', 'Rebase', 'JavaScript', 'Expo', 'Supabase', 'Node.js', 'GitHub'],
  'Planning & Workflow': ['IET', 'Trello', 'Notion', 'Google Drive', 'Discord', 'DocuSign', 'Microsoft 365'],
}

export default function ResourcePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

      <main className="max-w-4xl mx-auto px-10 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-1">Studio Infrastructure</h1>
          <p className="text-text-secondary text-sm">
            Tools, software, and systems currently used across game development, web development, planning, and studio workflow.
          </p>
        </div>

        <div className="border border-border-default rounded-lg p-6 mb-10">
          <p className="text-sm text-text-secondary leading-relaxed">
            The development stack depends on the project. Unity and Unreal are both used, since the choice of engine
            comes down to what each game needs — they&apos;re tools, not a fixed pipeline. Everything else in the
            stack is flexible for future team members to bring their own preferred tools; engine choice per game is
            the one thing that doesn&apos;t flex.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(devStack).map(([category, tools]) => (
            <div key={category}>
              <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-3">{category}</h2>
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
      </main>
    </div>
  )
}