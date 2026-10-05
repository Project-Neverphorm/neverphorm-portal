'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SectionSidebar, { SidebarItem } from '@/components/SectionSidebar'

const accountTabs: SidebarItem[] = [
  { label: 'Profile', href: '/account/profile' },
  { label: 'Pay & Paystubs', href: '/account/pay' },
  { label: 'Role & Growth', href: '/account/role' },
  { label: 'Bonuses', href: '/account/bonuses' },
  { label: 'Agreements', href: '/account/agreements' },
  { label: 'Studio Policies', href: '/account/policies' },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-6 md:flex-row">
        <SectionSidebar title="Account" items={accountTabs} collapsible={false} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <Footer />
    </div>
  )
}