'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export type SidebarItem = {
  label: string
  href: string
  icon?: React.ReactNode
}

type SectionSidebarProps = {
  title?: string
  items: SidebarItem[]
  /** Education page: true. Account page: false (always open). */
  collapsible?: boolean
}

// Pinned to the far left on every screen size.
// Phones/tablets: slim icon rail. Desktop: icons + labels.
export default function SectionSidebar({
  title,
  items,
  collapsible = true,
}: SectionSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isCollapsed = collapsible && collapsed

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside
      className={`shrink-0 h-full bg-elevated border-r border-border-default flex flex-col transition-[width] duration-200 w-16 ${
        isCollapsed ? 'md:w-16' : 'md:w-60'
      }`}
    >
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        {title && !isCollapsed && (
          <p className="hidden md:block text-xs uppercase tracking-wide text-text-secondary">
            {title}
          </p>
        )}
        {collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:block rounded p-1 text-text-secondary hover:text-foreground"
          >
            {collapsed ? '»' : '«'}
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {items.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors justify-center ${
                isCollapsed ? '' : 'md:justify-start'
              } ${
                active
                  ? 'bg-brand text-black font-semibold'
                  : 'text-text-secondary hover:text-foreground hover:bg-background'
              }`}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className={`hidden ${isCollapsed ? '' : 'md:inline'}`}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}