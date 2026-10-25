import Link from 'next/link'
import { Acknowledge, Badge, Card, Table } from '@/components/account/AccountUI'
import { changelog, handbook, HANDBOOK_UPDATED, HANDBOOK_VERSION } from './handbook'
import { oaChangelog, operatingAgreement, OA_UPDATED, OA_VERSION } from './operating-agreement'
import type { ComponentProps } from 'react'

type Part = (typeof handbook)[number]
type DocKey = 'handbook' | 'oa'

type DocConfig = {
  label: string
  title: string
  intro: string
  parts: Part[]
  version: string
  updated: string
  unit: string // "Article" or "Section"
  unitPlural: string
  changelog: ComponentProps<typeof Table>['rows']
  ackIntro: string
  ackLabel: string
  footnote: string
}

const DOCS: Record<DocKey, DocConfig> = {
  handbook: {
    label: 'Handbook',
    title: 'Studio Handbook',
    intro:
      "Every policy, expectation, and standard at the studio, all in one place. It's a long read on purpose. Read it fully once, then come back whenever you have a question.",
    parts: handbook,
    version: HANDBOOK_VERSION,
    updated: HANDBOOK_UPDATED,
    unit: 'Article',
    unitPlural: 'articles',
    changelog,
    ackIntro:
      'When the handbook is updated, everyone re-acknowledges the new version so we all stay on the same page.',
    ackLabel: `I've read and understand the Studio Handbook v${HANDBOOK_VERSION}`,
    footnote:
      'This handbook is a guide to how the studio works and is not a contract. Your signed agreement controls if anything here conflicts with it. Policies will be reviewed by a lawyer before the studio hires salaried employees.',
  },
  oa: {
    label: 'Operating Agreement',
    title: 'Studio Operating Agreement',
    intro:
      'How the studio is run: ownership, roles, contribution requirements, and how revenue share works. If this agreement and the handbook ever disagree, this agreement wins.',
    parts: operatingAgreement,
    version: OA_VERSION,
    updated: OA_UPDATED,
    unit: 'Section',
    unitPlural: 'sections',
    changelog: oaChangelog,
    ackIntro:
      'When the operating agreement changes, everyone re-acknowledges the new version, especially changes to contribution requirements or revenue share.',
    ackLabel: `I've read and understand the Studio Operating Agreement v${OA_VERSION}`,
    footnote:
      'This page is a reference copy of the operating agreement. If it ever differs from the signed version, the signed version controls.',
  },
}

// Number every article across the whole document (1, 2, 3...)
function numberParts(parts: Part[]) {
  return parts.map((part, p) => ({
    ...part,
    articles: part.articles.map((article, a) => ({
      ...article,
      number: parts.slice(0, p).reduce((n, prev) => n + prev.articles.length, 0) + a + 1,
    })),
  }))
}

type NumberedParts = ReturnType<typeof numberParts>

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>
}) {
  const { doc } = await searchParams
  const activeKey: DocKey = doc === 'oa' ? 'oa' : 'handbook'
  const active = DOCS[activeKey]

  const numbered = numberParts(active.parts)
  const total = numbered.reduce((n, part) => n + part.articles.length, 0)

  return (
    <div className="flex gap-8">
      {/* Document content: fills all available width */}
      <article className="flex-1 min-w-0">
        {/* Cover */}
        <header className="mb-10 pb-8 border-b border-border-default">
          <p className="text-xs uppercase tracking-wide text-brand mb-2">Project Neverphorm LLC</p>
          <h1 className="text-3xl font-bold mb-3">{active.title}</h1>
          <p className="text-text-secondary text-sm mb-5 max-w-4xl">{active.intro}</p>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">Version {active.version}</Badge>
              <Badge>Updated {active.updated}</Badge>
              <Badge>
                {total} {active.unitPlural}
              </Badge>
              <Badge tone="warning">Not acknowledged</Badge>
            </div>
            <DocToggle active={activeKey} />
          </div>
        </header>

        {/* Mobile / tablet table of contents */}
        <details className="xl:hidden mb-10 bg-elevated border border-border-default rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-semibold">Table of contents</summary>
          <TableOfContents parts={numbered} />
        </details>

        {numbered.map((part) => (
          <section key={part.title} className="mb-14">
            <h2 className="text-xs uppercase tracking-wide text-brand mb-6 pb-2 border-b border-border-default">
              {part.title}
            </h2>

            <div className="space-y-6">
              {part.articles.map((article) => (
                <div
                  key={article.id}
                  id={article.id}
                  className="scroll-mt-6 bg-elevated border border-border-default rounded-lg p-6"
                >
                  <p className="text-xs text-text-secondary mb-1">
                    {active.unit} {article.number}
                  </p>
                  <h3 className="text-xl font-bold mb-4">{article.title}</h3>

                  <div className="space-y-5">
                    {article.sections.map((section, i) => (
                      <div key={i}>
                        {section.heading && (
                          <h4 className="text-sm font-semibold mb-2">{section.heading}</h4>
                        )}
                        {section.body?.map((paragraph, j) => (
                          <p key={j} className="text-sm leading-relaxed text-text-secondary mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                        {section.bullets && (
                          <ul className={`grid gap-x-8 gap-y-2 lg:grid-cols-2 ${section.body ? 'mt-3' : ''}`}>
                            {section.bullets.map((bullet, j) => (
                              <li key={j} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
                                <span className="text-brand shrink-0">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Sign-off */}
        <div className="grid gap-4 lg:grid-cols-2 pt-8 border-t border-border-default">
          <Card title="Acknowledgement">
            <p className="text-text-secondary mb-4">{active.ackIntro}</p>
            <Acknowledge label={active.ackLabel} />
          </Card>

          <Card title="Changelog">
            <Table headers={['Version', 'Date', 'What changed']} rows={active.changelog} />
          </Card>

          <p className="lg:col-span-2 text-xs text-text-secondary">{active.footnote}</p>
        </div>
      </article>

      {/* Desktop table of contents, pinned to the right edge while you scroll */}
      <aside className="hidden xl:block w-72 shrink-0">
        <div className="sticky top-0 max-h-[calc(100vh-10rem)] overflow-y-auto [color-scheme:dark] bg-elevated border border-border-default rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">Contents</p>
          <TableOfContents parts={numbered} />
        </div>
      </aside>
    </div>
  )
}

function DocToggle({ active }: { active: DocKey }) {
  const keys: DocKey[] = ['handbook', 'oa']

  return (
    <div
      role="tablist"
      aria-label="Choose document"
      className="inline-flex shrink-0 rounded-full border border-border-default bg-elevated p-1"
    >
      {keys.map((key) => {
        const isActive = key === active
        return (
          <Link
            key={key}
            href={`?doc=${key}`}
            replace
            role="tab"
            aria-selected={isActive}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              isActive ? 'bg-brand text-black' : 'text-text-secondary hover:text-foreground'
            }`}
          >
            {DOCS[key].label}
          </Link>
        )
      })}
    </div>
  )
}

function TableOfContents({ parts }: { parts: NumberedParts }) {
  return (
    <nav className="mt-3 space-y-4">
      {parts.map((part) => (
        <div key={part.title}>
          <p className="text-xs font-semibold text-brand mb-1.5">
            {part.title.replace(/^Part [IVX]+: /, '')}
          </p>
          <ul className="space-y-1">
            {part.articles.map((article) => (
              <li key={article.id}>
                <a
                  href={`#${article.id}`}
                  className="flex gap-2 text-xs text-text-secondary hover:text-foreground transition-colors"
                >
                  <span className="w-5 shrink-0 text-right">{article.number}.</span>
                  <span>{article.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}