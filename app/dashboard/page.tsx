// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { User } from '@supabase/supabase-js'

type Task = {
  id: string
  name: string
  xp: number
  assigned_to_id: string
  status: 'active' | 'completed' | 'deleted'
  archived_at: string | null
}

type XPEntry = {
  id: string
  task_name: string
  xp: number
  assigned_to_id: string
}

type TeamMember = {
  id: string
  full_name: string
  title: string
}

const XP_TIERS = [
  { value: 25, label: '25 XP — Light (quick, small)' },
  { value: 30, label: '30 XP — Light-Medium' },
  { value: 35, label: '35 XP — Medium' },
  { value: 40, label: '40 XP — Medium-Heavy' },
  { value: 45, label: '45 XP — Heavy (big, time-consuming)' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [myProfile, setMyProfile] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([])
  const [xpLog, setXpLog] = useState<XPEntry[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)

  const [showLogTask, setShowLogTask] = useState(false)
  const [showArchive, setShowArchive] = useState(false)

  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskMemberId, setNewTaskMemberId] = useState('')
  const [newTaskXP, setNewTaskXP] = useState(XP_TIERS[0].value)

  const loadTeam = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, title')
    setTeamMembers(data ?? [])
    if (data && data.length > 0) setNewTaskMemberId((prev) => prev || data[0].id)
  }

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to load tasks:', error)
    } else if (data) {
      setTasks(data.filter((t) => t.status === 'active'))
      setArchivedTasks(
        data
          .filter((t) => t.status !== 'active')
          .sort((a, b) => new Date(b.archived_at ?? 0).getTime() - new Date(a.archived_at ?? 0).getTime())
      )
    }

    const { data: xpData, error: xpError } = await supabase.from('xp_log').select('*')
    if (xpError) {
      console.error('Failed to load XP log:', xpError)
    } else if (xpData) {
      setXpLog(xpData)
    }

    setTasksLoading(false)
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
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
    loadTasks()
  }, [router])

  const xpForMember = (memberId: string) =>
    xpLog.filter((e) => e.assigned_to_id === memberId).reduce((sum, e) => sum + e.xp, 0)

  const completedCountForMember = (memberId: string) =>
    archivedTasks.filter((t) => t.assigned_to_id === memberId && t.status === 'completed').length

  const completeTask = async (id: string) => {
  const task = tasks.find((t) => t.id === id)
  if (!task) return

  const { error: updateError } = await supabase
    .from('tasks')
    .update({ status: 'completed', archived_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    alert(`Failed to complete task: ${updateError.message}`)
    return
  }

  const { error: xpError } = await supabase.from('xp_log').insert({
    task_name: task.name,
    xp: task.xp,
    assigned_to_id: task.assigned_to_id,
  })

  if (xpError) {
    alert(`Task completed, but XP failed to log: ${xpError.message}`)
  }

  loadTasks()
}

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'deleted', archived_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Failed to delete task:', error)
      return
    }
    loadTasks()
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskName.trim() || !newTaskMemberId) return

    const { error } = await supabase.from('tasks').insert({
      name: newTaskName.trim(),
      xp: newTaskXP,
      assigned_to_id: newTaskMemberId,
      created_by: user?.id,
    })

    if (error) {
      console.error('Failed to add task:', error)
      alert(`Failed to add task: ${error.message}`)
      return
    }

    setNewTaskName('')
    setNewTaskXP(XP_TIERS[0].value)
    setShowLogTask(false)
    loadTasks()
  }

  const emptyArchive = async () => {
    if (archivedTasks.length === 0) return
    const confirmed = window.confirm(
      `Permanently clear ${archivedTasks.length} archived task${archivedTasks.length === 1 ? '' : 's'}? Your XP total is safe and won't be affected — this only clears the task history list.`
    )
    if (!confirmed) return

    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('status', ['completed', 'deleted'])

    if (error) {
      console.error('Failed to empty archive:', error)
      return
    }
    loadTasks()
  }

  if (loading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  const myTasks = tasks.filter((t) => t.assigned_to_id === user?.id)
  const myXP = xpForMember(user?.id ?? '')
  const myCompletedCount = completedCountForMember(user?.id ?? '')
  const studioXP = xpLog.reduce((sum, entry) => sum + entry.xp, 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="flex">

        <aside className="w-72 shrink-0 border-r border-border-default px-6 py-10 min-h-screen">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-wide text-text-secondary">Team</h2>
            <span className="text-xs text-brand">View All →</span>
          </div>

          <div className="space-y-6">
            {teamMembers.map((member) => {
              const memberXP = xpForMember(member.id)
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
                  <p className="text-xs text-text-secondary mb-1">Lvl 0 · {memberXP} / 500 XP</p>
                  <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${Math.min((memberXP / 500) * 100, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <button className="mt-8 w-full text-sm text-text-secondary hover:text-foreground border border-neutral-700 rounded px-4 py-2">
            + Invite Member
          </button>
        </aside>

        <main className="flex-1 px-10 py-10">

          <div className="mb-10">
            <h1 className="text-2xl font-bold">Welcome back, {myProfile?.full_name ?? 'there'}</h1>
            <p className="text-text-secondary text-sm mt-1">Here&apos;s where things stand.</p>
          </div>

          <div className="border-b border-border-default pb-10 mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm uppercase tracking-wide text-text-secondary">Studio Progress</h2>
              <span className="text-xs text-brand">About Studio Levels →</span>
            </div>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-6xl font-bold text-brand">Lvl 0</span>
              <span className="text-green-300 text-sm pb-2">Starting Fresh. Keep going, team!</span>
            </div>
            <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
              <div className="h-full bg-brand" style={{ width: `${Math.min((studioXP / 2500) * 100, 100)}%` }} />
            </div>
            <p className="text-sm text-text-secondary mt-2">{studioXP} / 2500 XP</p>
          </div>

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

          <div className="grid grid-cols-4 gap-12">

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm uppercase tracking-wide text-text-secondary">My Current Tasks</h2>
                <span className="text-xs text-text-secondary">🎯 Target: Ongoing</span>
              </div>
              <p className="text-2xl font-bold mb-1">Current Tasks</p>
              <p className="text-brand text-sm mb-3">Assigned to {myProfile?.full_name}</p>

              <div className="w-full h-2 bg-elevated rounded-full overflow-hidden mb-2">
                <div className="h-full bg-brand" style={{ width: `${Math.min((myXP / 500) * 100, 100)}%` }} />
              </div>
              <p className="text-sm text-text-secondary mb-6">{myXP} / 500 XP · {myCompletedCount} tasks completed</p>

              <div className="divide-y divide-neutral-800 max-h-80 overflow-y-auto pr-2">
                {myTasks.length === 0 && (
                  <p className="text-sm text-text-secondary py-4">No active tasks. Log one from the admin panel.</p>
                )}
                {myTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => completeTask(task.id)}
                        aria-label={`Mark "${task.name}" complete`}
                        className="w-5 h-5 rounded border border-neutral-600 hover:border-brand flex items-center justify-center shrink-0 transition-colors"
                      />
                      <p className="text-sm">{task.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-brand">+{task.xp} XP</span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete "${task.name}"`}
                        className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-3">Responsibilities</h2>
              <div className="space-y-2">
                {[
                  'Creative direction across all titles',
                  'Gameplay programming & technical architecture',
                  'Business development & legal (DUNS, developer accounts, LLC)',
                  '3D modeling, texturing and asset creation',
                  'Studio operations & infrastructure',
                  'Finance & accounting',
                  'Hiring, recruiting, team building',
                  'Marketing & community strategy',
                  'Voice acting & audio direction',
                  'Website & internal tools development',
                ].map((item) => (
                  <p key={item} className="text-sm text-neutral-300 flex items-start gap-2">
                    <span className="text-brand mt-1">•</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-3">Admin</h2>
              <div className="flex flex-col gap-2 mb-8">
                <button
                  onClick={() => setShowLogTask(true)}
                  className="text-sm text-left border border-neutral-700 hover:border-brand rounded px-4 py-2 transition-colors"
                >
                  + Log Task
                </button>
                <button
                  onClick={() => setShowArchive(true)}
                  className="text-sm text-left border border-neutral-700 hover:border-brand rounded px-4 py-2 transition-colors flex items-center justify-between"
                >
                  <span>Archived Tasks</span>
                  <span className="text-text-secondary">{archivedTasks.length}</span>
                </button>
              </div>

              <h2 className="text-sm uppercase tracking-wide text-text-secondary mb-3">Team Task Boxes</h2>
              {teamMembers
                .filter((member) => member.id !== user?.id)
                .map((member) => {
                  const memberXP = xpForMember(member.id)
                  const memberCompleted = completedCountForMember(member.id)

                  return (
                    <div key={member.id} className="border-l-2 border-brand pl-4 mb-6">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{member.full_name}</p>
                        <span className="text-sm text-text-secondary">{memberXP}/500</span>
                      </div>
                      <p className="text-brand text-sm">Current Tasks</p>
                      <p className="text-xs text-text-secondary mb-2">🎯 Target: Ongoing</p>
                      <div className="w-full h-2 bg-elevated rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-brand" style={{ width: `${Math.min((memberXP / 500) * 100, 100)}%` }} />
                      </div>
                      <p className="text-xs text-text-secondary">{memberCompleted} tasks complete</p>
                    </div>
                  )
                })}
              {teamMembers.filter((m) => m.id !== user?.id).length === 0 && (
                <p className="text-xs text-text-secondary">No other team members yet.</p>
              )}
            </div>

          </div>

        </main>
      </div>

      {showLogTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm bg-elevated border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Log a new task</h3>
              <button onClick={() => setShowLogTask(false)} aria-label="Close" className="text-text-secondary hover:text-foreground">✕</button>
            </div>

            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Task name</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="e.g. Update store listing screenshots"
                  required
                  className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1.5">Assign to</label>
                <select
                  value={newTaskMemberId}
                  onChange={(e) => setNewTaskMemberId(e.target.value)}
                  className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>{member.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1.5">XP value</label>
                <select
                  value={newTaskXP}
                  onChange={(e) => setNewTaskXP(Number(e.target.value))}
                  className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  {XP_TIERS.map((tier) => (
                    <option key={tier.value} value={tier.value}>{tier.label}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-brand text-black font-semibold rounded py-2 text-sm mt-2">
                Add task
              </button>
            </form>
          </div>
        </div>
      )}

      {showArchive && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-md bg-elevated border border-border-default rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Archived tasks</h3>
              <button onClick={() => setShowArchive(false)} aria-label="Close" className="text-text-secondary hover:text-foreground">✕</button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800 mb-4">
              {archivedTasks.length === 0 && (
                <p className="text-sm text-text-secondary py-4">Nothing archived yet.</p>
              )}
              {archivedTasks.map((task) => {
                const member = teamMembers.find((m) => m.id === task.assigned_to_id)
                return (
                  <div key={task.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${task.status === 'completed' ? 'line-through text-text-muted' : ''}`}>
                        {task.name}
                      </p>
                      <span className="text-sm text-neutral-600">+{task.xp} XP</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {member?.full_name ?? 'Unknown'} · {task.archived_at ? new Date(task.archived_at).toLocaleDateString() : ''}
                      {task.status === 'deleted' && <span className="text-red-400 ml-1">— was deleted</span>}
                    </p>
                  </div>
                )
              })}
            </div>

            {archivedTasks.length > 0 && (
              <button
                onClick={emptyArchive}
                className="w-full border border-red-500/40 text-red-500 hover:bg-red-500/10 rounded py-2 text-sm transition-colors"
              >
                Empty archive
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}