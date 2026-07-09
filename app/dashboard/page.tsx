// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [tasks, setTasks] = useState([
    { id: 1,name: 'Confirm D-U-N-S number received', xp:30, done: false },
    { id: 2, name: 'Complete Google Play developer account', xp:25, done: false },
    { id: 3, name: 'Complete Apple developer account', xp:25, done: false },
    { id: 4, name: 'Final build test on Android', xp:30, done: false },
    { id: 5, name: 'Submit to Google Play', xp:30, done: false },
    { id: 6, name: 'Submit to App Store', xp:30, done: false },
  ])
  const basePersonalXP = 0
  const baseStudioXP = 0
  const toggleTask = (id: number) => {
    setTasks((prev) => 
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }
  // deleteTask — uses .filter() to return a new array with everything except the task matching that id. React re-renders with that task simply gone.
  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }
  // Sum of XP from all currently checked tasks
  const earnedXP = tasks.filter((t) => t.done).reduce((sum, t) => sum + t.xp, 0)
  // Personal and studio totals both grow off the same eanred XP for no,
  // since it's just myself, this isexactly where "team compounding" plugs in later
  const personalXP = basePersonalXP + earnedXP
  const studioXP = baseStudioXP + earnedXP

  // Switched from name to id as the unique key — using text names as identifiers gets risky (what if two tasks have similar names later, or you rename one?). A numeric id is a stable, safe reference that never changes even if the task text does.

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

      <div className="flex">

        {/* LEFT SIDEBAR: Team Members */}
        <aside className="w-72 shrink-0 border-r border-border-default px-6 py-10 min-h-screen">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-wide text-text-secondary">Team</h2>
            <span className="text-xs text-brand">View All →</span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-brand text-black font-bold flex items-center justify-center shrink-0">
                  CM
                </div>
                <div>
                  <p className="font-semibold text-sm">Cody</p>
                  <p className="text-xs text-text-secondary">Studio Head / Creative Director</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-xs text-text-secondary">Online</p>
              </div>
              <p className="text-xs text-text-secondary mb-1">Lvl 0 · {personalXP} / 500 XP</p>
              <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-brand" style={{ width: `${Math.min((personalXP / 500) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          <button className="mt-8 w-full text-sm text-text-secondary hover:text-foreground border border-neutral-700 rounded px-4 py-2">
            + Invite Member
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-10 py-10">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl font-bold">Welcome back, Cody</h1>
            <p className="text-text-secondary text-sm mt-1">Here&apos;s where things stand.</p>
          </div>

          {/* Studio Progress - full width */}
          <div className="border-b border-border-default pb-10 mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm uppercase tracking-wide text-text-secondary">Studio Progress</h2>
              <span className="text-xs text-brand">About Studio Levels →</span>
            </div>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-6xl font-bold text-brand">Lvl 0</span>
              <span className="text-text-secondary text-sm pb-2">Starting Fresh — Keep going, team!</span>
            </div>
            <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
              <div className="h-full bg-brand" style={{ width: `${Math.min((studioXP / 2500) * 100, 100)}%` }} />
            </div>
            <p className="text-sm text-text-secondary mt-2">{studioXP} / 2500 XP</p>
          </div>

          {/* Three-column stats - spread across full main width */}
          <div className="grid grid-cols-3 gap-10 border-b border-border-default pb-10 mb-10">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">Next Goal</p>
              <p className="font-semibold">Complete Current Task Boxes</p>
              <p className="text-sm text-text-secondary mt-1">+2,500 XP Team Goal</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">Level Up Reward</p>
              <p className="font-semibold">Studio Level 1</p>
              <p className="text-sm text-brand mt-1">✓ Custom Studio Mug</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">Next Unlock</p>
              <p className="font-semibold">Reward Slot</p>
              <p className="text-sm text-text-secondary mt-1">Unlock after Level 1</p>
            </div>
          </div>

          {/* Tasks + Team Task Boxes + Responsibilities */}
            <div className="grid grid-cols-4 gap-12">

            {/* My Current Tasks - takes half width */}
            <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm uppercase tracking-wide text-text-secondary">My Current Tasks</h2>
                <span className="text-xs text-text-secondary">🎯 Target: Ongoing</span>
                </div>
                <p className="text-2xl font-bold mb-1">Current Tasks</p>
                <p className="text-brand text-sm mb-3">Assigned to Cody</p>

                <div className="w-full h-2 bg-elevated rounded-full overflow-hidden mb-2">
                <div className="h-full bg-brand" style={{ width: `${Math.min((personalXP / 500) * 100, 100)}%` }} />
                </div>
                <p className="text-sm text-text-secondary mb-6">{personalXP} / 500 XP · {tasks.filter(t => t.done).length} / {tasks.length} tasks complete</p>

                <div className="divide-y divide-neutral-800 max-h-80 overflow-y-auto pr-2">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                        <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            task.done
                            ? 'bg-brand border-brand'
                            : 'border-neutral-600 hover:border-neutral-400'
                        }`}
                        >
                        {task.done && (
                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        </button>
                        <p className={`text-sm ${task.done ? 'text-text-muted line-through' : ''}`}>
                        {task.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold ${task.done ? 'text-neutral-600' : 'text-brand'}`}>
                        +{task.xp} XP
                        </span>
                        <button
                        onClick={() => deleteTask(task.id)}
                        className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                        ✕
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Responsibilities */}
            <div>
                <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-3">Responsibilities</h2>
                <div className="space-y-2">
                {[
                    'Creative direction across all titles',
                    'Gameplay programming & technical architecture',
                    'Business development & legal (DUNS, developer accounts, LLC)',
                    '3D modeling, texturing and asset creation',
                    'Studio operatoins & infrastructure',
                    'Finance & accounting',
                    'Hiring, recruiting, team building',
                    'Marketing & community strategy',
                    'Voice acting & audio direction',
                    'Website & intenral tools development',
                ].map((item) => (
                    <p key={item} className="text-sm text-neutral-300 flex items-start gap-2">
                    <span className="text-brand mt-1">•</span>
                    {item}
                    </p>
                ))}
                </div>
            </div>

            {/* Team Task Boxes */}
            <div>
                <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-3">Team Task Boxes</h2>
                <div className="border-l-2 border-brand pl-4">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">Cody</p>
                    <span className="text-sm text-text-secondary">{personalXP}/500</span>
                </div>
                <p className="text-brand text-sm">Current Tasks</p>
                <p className="text-xs text-text-secondary mb-2">🎯 Target: Ongoing</p>
                <div className="w-full h-2 bg-elevated rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-brand" style={{ width: `${Math.min((personalXP / 500) * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-text-secondary">{tasks.filter(t => t.done).length} / {tasks.length} tasks complete</p>
                </div>
            </div>

            </div>

        </main>
      </div>
    </div>
  )
}