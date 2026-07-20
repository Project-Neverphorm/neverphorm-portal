// components/Navbar.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Profile = {
  full_name: string
  title: string
  role: string
}
type CalendarEvent = {
  id: string
  event_date: string
  title: string
  type: string
  member_id?: string | null
  member_name?: string | null
}

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<string | null>(null)
  const router = useRouter()
  const [CalendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [selectedDates, setSelectedDates] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [teamMembers, setTeamMembers] = useState<{ id: string; full_name: string }[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
  
      const { data: profiles } = await supabase.from('profiles').select('id, full_name')
      setTeamMembers(profiles ?? [])
  
      if (user) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('full_name, title, role')
          .eq('id', user.id)
          .single()
        setProfile(myProfile)
      }
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const loadCalendarEvents = async () => {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true })
      
    if (data) setCalendarEvents(data)
  }

  const addEvent = async (date: string, title: string, type: string, memberId?: string | null) => {
    await supabase.from('calendar_events').insert({
      event_date: date,
      title,
      type,
      member_id: memberId ?? null,
    })
    loadCalendarEvents()
  }

  const isManager = profile?.role === 'manager'

  return (
    <>
      <nav className="relative bg-surface text-foreground px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">
          Project Neverphorm
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('studio')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="hover:text-neutral-300">Studio Center</button>
            {openDropdown === 'studio' && (
              <div className="absolute top-full left-0 bg-elevated rounded shadow-lg py-2 w-40 z-50">
                <Link href="/dashboard/education" className="block px-4 py-2 hover:bg-neutral-700">
                  Education
                </Link>
                <Link href="/dashboard/resource" className="block px-4 py-2 hover:bg-neutral-700">
                  Resource
                </Link>
                <Link href="/dashboard/training" className="block px-4 py-2 hover:bg-neutral-700">
                  Training
                </Link>
                <Link href="/dashboard/pipeline" className="block px-4 py-2 hover:bg-neutral-700">
                  Pipeline
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpenModal('purpose')} className="hover:text-neutral-300">
            Purpose
          </button>

          <button onClick={() => setOpenModal('calendar')} className="hover:text-neutral-300">
            Calendar
          </button>

          <Link href="/dashboard/cms" className="hover:text-neutral-300">
            CMS
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('links')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="hover:text-neutral-300">Links</button>
            {openDropdown === 'links' && (
              <div className="absolute top-full left-0 bg-elevated rounded shadow-lg py-2 w-48 z-50">
                <a href="https://projectneverphorm.com" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-neutral-700">
                  Studio Website
                </a>
                <a href="https://app.notion.com/p/Studio-Hub-3928c49cb9f880468c1ff6d340dcf9e3" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-neutral-700">
                  Notion Workspace
                </a>
                <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-neutral-700">
                  Google Drive
                </a>
                <a href="https://discord.gg/s7cKSNTzEh" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-neutral-700">
                  Discord
                </a>
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('account')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="hover:text-neutral-300">Account</button>
            {openDropdown === 'account' && (
              <div className="absolute top-full right-0 bg-elevated rounded shadow-lg py-2 w-40 z-50">
                <Link href="/dashboard/account" className="block px-4 py-2 hover:bg-neutral-700">
                  Account
                </Link>
                <Link href="/dashboard/preferences" className="block px-4 py-2 hover:bg-neutral-700">
                  Preferences
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold">{profile?.full_name || 'Loading...'}</p>
            <p className="text-xs text-text-secondary">{profile?.title}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Log Out
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-surface flex flex-col gap-3 p-4 md:hidden z-50">
            <p className="text-text-secondary text-xs uppercase">Studio Center</p>
            <Link href="/dashboard/education" className="pl-2">Education</Link>
            <Link href="/dashboard/resource" className="pl-2">Resource</Link>
            <Link href="/dashboard/training" className="pl-2">Training</Link>
            <Link href="/dashboard/pipeline" className="pl-2">Pipeline</Link>

            <button onClick={() => { setOpenModal('purpose'); setMobileMenuOpen(false) }} className="text-left">
              Purpose
            </button>
            <button onClick={() => { setOpenModal('calendar'); setMobileMenuOpen(false) }} className="text-left">
              Calendar
            </button>
            <Link href="/dashboard/cms" className="pl-2" onClick={() => setMobileMenuOpen(false)}>
              CMS
            </Link>

            <p className="text-text-secondary text-xs uppercase pt-2">Links</p>
            <a href="https://projectneverphorm.com" target="_blank" rel="noopener noreferrer" className="pl-2">Studio Website</a>
            <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="pl-2">Notion Workspace</a>
            <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="pl-2">Google Drive</a>

            <p className="text-text-secondary text-xs uppercase pt-2">Account</p>
            <Link href="/dashboard/account" className="pl-2">Account</Link>
            <Link href="/dashboard/preferences" className="pl-2">Preferences</Link>

            <p className="text-sm font-semibold pt-2 border-t border-neutral-700">
              {profile?.full_name}
            </p>
            <p className="text-xs text-text-secondary">{profile?.title}</p>
            <button onClick={handleLogout} className="text-xs text-red-500 text-left">
              Log Out
            </button>
          </div>
        )}
      </nav>

      {openModal === 'purpose' && (
        <div
          className="fixed inset-0 bg-background/70 flex items-center justify-center z-50"
          onClick={() => setOpenModal(null)}
        >
          <div
            className="bg-surface text-foreground p-8 rounded-lg max-w-md mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Dashboard Purpose</h2>
            <div className="text-neutral-300 text-sm leading-relaxed space-y-5">
              <p>This dashboard exists to bring clarity, not pressure.</p>
              <p>It helps everyone understand:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>What to work on</li>
                <li>Where they are in their progress</li>
                <li>Where the team is overall</li>
              </ul>
              <p>This is not a micromanagement tool. There are no penalties, no hidden tracking, and no expectations beyond doing your part.</p>
              <p>Instead, this system is built to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide direction</li>
                <li>Encourage consistency</li>
                <li>Recognize effort</li>
                <li>Show progress</li>
                <li>Keep everyone aligned</li>
              </ul>
              <p>Everyone works at a different pace, and that&apos;s okay. Tasks and XP are balanced so progress stays fair across all roles.</p>
              <p>The goal is simple: make work feel clear, rewarding, and collaborative.</p>
            </div>
          </div>
        </div>
      )}

{/* Calendar Modal */}

{openModal === 'calendar' && (
  <div
    className="fixed inset-0 bg-background/70 flex items-center justify-center z-50"
    onClick={() => { setOpenModal(null); setSelectedDates(null); }}
  >
    <div
      className="bg-surface text-foreground p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="text-text-secondary hover:text-foreground px-2"
        >
          ←
        </button>
        <h2 className="text-lg font-bold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="text-text-secondary hover:text-foreground px-2"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-muted mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {(() => {
          const year = currentMonth.getFullYear()
          const month = currentMonth.getMonth()
          const firstDay = new Date(year, month, 1).getDay()
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const cells = []

          for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} />)
          }

          for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = CalendarEvents.filter((e) => e.event_date === dateStr)

            cells.push(
              <button
                key={dateStr}
                onClick={() => setSelectedDates(dateStr)}
                className={`aspect-square rounded text-sm p-1 flex flex-col items-center justify-start hover:bg-elevated transition-colors ${
                  selectedDates === dateStr ? 'bg-elevated ring-1 ring-cyan-400' : ''
                }`}
              >
                <span>{day}</span>
                {dayEvents.length > 0 && (
                  <span className="w-1.5 h-1.5 bg-brand rounded-full mt-1" />
                )}
              </button>
            )
          }

          return cells
        })()}
      </div>

      {selectedDates && (
        <div className="mt-6 border-t border-border-default pt-4">
          <p className="text-sm font-semibold mb-2">{selectedDates}</p>

          <div className="space-y-2 mb-4">
            {CalendarEvents
              .filter((e) => e.event_date === selectedDates)
              .map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm bg-elevated rounded px-3 py-2">
                  <div className="flex flex-col">
                    <span>{e.title}</span>
                    {e.member_name && (
                      <span className="text-xs text-text-muted">{e.member_name}</span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await supabase.from('calendar_events').delete().eq('id', e.id)
                      loadCalendarEvents()
                    }}
                    className="text-text-muted hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            {CalendarEvents.filter((e) => e.event_date === selectedDates).length === 0 && (
              <p className="text-xs text-text-muted">No events for this day.</p>
            )}
          </div>

          {isManager && (
            <select
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return
                const memberId = e.target.value
                const memberName = teamMembers.find((m) => m.id === memberId)?.full_name ?? 'Team member'
                addEvent(selectedDates, `${memberName} - Out`, 'pto', memberId)
                e.target.value = ''
              }}
              className="w-full bg-elevated text-sm rounded px-3 py-2 mb-2"
            >
              <option value="">+ Mark someone out...</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
          )}

          <select
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return
              const [type, label] = e.target.value.split('|')
              addEvent(selectedDates, label, type, currentUserId)
              e.target.value = ''
            }}
            className="w-full bg-elevated text-sm rounded px-3 py-2"
          >
            <option value="">+ Add event...</option>
            <option value="pto|Out of Office">Mark myself out</option>
            {isManager && <option value="closure|Studio Closed">Studio Closed (company-wide)</option>}
            {isManager && <option value="holiday|Holiday">Holiday</option>}
          </select>
        </div>
      )}
    </div>
  </div>
)}
    </>
  )
}
