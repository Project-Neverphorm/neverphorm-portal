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

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('full_name, title, role')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
    }

    loadProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isManager = profile?.role === 'manager'

  return (
    <>
      <nav className="relative bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
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
              <div className="absolute top-full left-0 bg-neutral-800 rounded shadow-lg py-2 w-40 z-50">
                <Link href="/dashboard/education" className="block px-4 py-2 hover:bg-neutral-700">
                  Education
                </Link>
                <Link href="/dashboard/resources" className="block px-4 py-2 hover:bg-neutral-700">
                  Resource
                </Link>
                <Link href="/dashboard/training" className="block px-4 py-2 hover:bg-neutral-700">
                  Training
                </Link>
              </div>
            )}
          </div>

          {isManager && <Link href="/dashboard/log-tasks" className="hover:text-neutral-300">Log Tasks</Link>}
          {isManager && <Link href="/dashboard/archived-tasks" className="hover:text-neutral-300">Archived Tasks</Link>}

          <button onClick={() => setOpenModal('purpose')} className="hover:text-neutral-300">
            Purpose
          </button>

          <button onClick={() => setOpenModal('calendar')} className="hover:text-neutral-300">
            Calendar
          </button>

          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('links')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="hover:text-neutral-300">Links</button>
            {openDropdown === 'links' && (
              <div className="absolute top-full left-0 bg-neutral-800 rounded shadow-lg py-2 w-48 z-50">
                <a href="https://projectneverphorm.com" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-neutral-700">
                  Studio Website
                </a>
                <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-neutral-700">
                  Notion Workspace
                </a>
                <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-neutral-700">
                  Google Drive
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
              <div className="absolute top-full right-0 bg-neutral-800 rounded shadow-lg py-2 w-40 z-50">
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
            <p className="text-xs text-neutral-400">{profile?.title}</p>
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
          <div className="absolute top-16 left-0 w-full bg-neutral-900 flex flex-col gap-3 p-4 md:hidden z-50">
            <p className="text-neutral-400 text-xs uppercase">Studio Center</p>
            <Link href="/dashboard/education" className="pl-2">Education</Link>
            <Link href="/dashboard/resources" className="pl-2">Resource</Link>
            <Link href="/dashboard/training" className="pl-2">Training</Link>

            {isManager && <Link href="/dashboard/log-tasks">Log Tasks</Link>}
            {isManager && <Link href="/dashboard/archived-tasks">Archived Tasks</Link>}

            <button onClick={() => { setOpenModal('purpose'); setMobileMenuOpen(false) }} className="text-left">
              Purpose
            </button>
            <button onClick={() => { setOpenModal('calendar'); setMobileMenuOpen(false) }} className="text-left">
              Calendar
            </button>

            <p className="text-neutral-400 text-xs uppercase pt-2">Links</p>
            <a href="https://projectneverphorm.com" target="_blank" rel="noopener noreferrer" className="pl-2">Studio Website</a>
            <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="pl-2">Notion Workspace</a>
            <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="pl-2">Google Drive</a>

            <p className="text-neutral-400 text-xs uppercase pt-2">Account</p>
            <Link href="/dashboard/account" className="pl-2">Account</Link>
            <Link href="/dashboard/preferences" className="pl-2">Preferences</Link>

            <p className="text-sm font-semibold pt-2 border-t border-neutral-700">
              {profile?.full_name}
            </p>
            <p className="text-xs text-neutral-400">{profile?.title}</p>
            <button onClick={handleLogout} className="text-xs text-red-500 text-left">
              Log Out
            </button>
          </div>
        )}
      </nav>

      {openModal === 'purpose' && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setOpenModal(null)}
        >
          <div
            className="bg-neutral-900 text-white p-8 rounded-lg max-w-md mx-4 max-h-[80vh] overflow-y-auto"
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

      {openModal === 'calendar' && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setOpenModal(null)}
        >
          <div
            className="bg-neutral-900 text-white p-8 rounded-lg max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Company Calendar</h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Holiday and paid time off schedule coming soon.
            </p>
          </div>
        </div>
      )}
    </>
  )
}