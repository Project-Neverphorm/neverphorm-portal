'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export type SidebarItem = {
  label: string
  href: string
}

type SectionSidebarProps = {
  title?: string
  items: SidebarItem[]
  /** Education page: true. Account page: false (always open). */
  collapsible?: boolean
}

export default function SectionSidebar({
  title,
  items,
  collapsible = true,
}: SectionSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const activeHref = items.find((item) => isActive(item.href))?.href ?? ''
  const isCollapsed = collapsible && collapsed

  return (
    <>
      {/* Mobile: dropdown so content keeps full width */}
      <div className="md:hidden">
        {title && (
          <p className="mb-2 text-xs uppercase tracking-wide text-text-secondary">
            {title}
          </p>
        )}
        <select
          value={activeHref}
          onChange={(e) => router.push(e.target.value)}
          className="w-full bg-elevated border border-border-default rounded px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {items.map((item) => (
            <option key={item.href} value={item.href}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: vertical sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-[width] duration-200 ${
          isCollapsed ? 'w-14' : 'w-56'
        }`}
      >
        <div className="sticky top-6 bg-elevated border border-border-default rounded-lg p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            {title && !isCollapsed && (
              <p className="text-xs uppercase tracking-wide text-text-secondary">
                {title}
              </p>
            )}
            {collapsible && (
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="rounded p-1 text-text-secondary hover:text-foreground"
              >
                {collapsed ? '»' : '«'}
              </button>
            )}
          </div>

          {!isCollapsed && (
            <nav className="flex flex-col gap-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded px-3 py-2 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-brand text-black font-semibold'
                      : 'text-text-secondary hover:text-foreground hover:bg-background'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </aside>
    </>
  )
}