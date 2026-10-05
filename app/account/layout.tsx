'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SectionSidebar, { SidebarItem } from '@/components/SectionSidebar'
import {
  UserIcon,
  WalletIcon,
  TrendingIcon,
  AwardIcon,
  FileIcon,
  ShieldIcon,
} from '@/components/account/icons'

const accountTabs: SidebarItem[] = [
  { label: 'Profile', href: '/account/profile', icon: <UserIcon /> },
  { label: 'Pay & Paystubs', href: '/account/pay', icon: <WalletIcon /> },
  { label: 'Role & Growth', href: '/account/role', icon: <TrendingIcon /> },
  { label: 'Bonuses', href: '/account/bonuses', icon: <AwardIcon /> },
  { label: 'Agreements', href: '/account/agreements', icon: <FileIcon /> },
  { label: 'Studio Policies', href: '/account/policies', icon: <ShieldIcon /> },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  // Auth guard for every account tab
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setChecking(false)
    }
    checkUser()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    // Full-height shell: navbar on top, sidebar pinned left, content scrolls on the right
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        <SectionSidebar title="Account" items={accountTabs} collapsible={false} />

        <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">
          <main className="flex-1 w-full px-4 py-6 md:px-8 md:py-8">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  )
}