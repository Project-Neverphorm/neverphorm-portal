import { Acknowledge, Badge, Card, Table } from '@/components/account/AccountUI'
import { changelog, handbook, HANDBOOK_UPDATED, HANDBOOK_VERSION } from './handbook'

// Number every article across the whole handbook (Article 1, 2, 3...)
const numbered = handbook.map((part, p) => ({
  ...part,
  articles: part.articles.map((article, a) => ({
    ...article,
    number:
      handbook.slice(0, p).reduce((n, prev) => n + prev.articles.length, 0) + a + 1,
  })),
}))

const totalArticles = numbered.reduce((n, part) => n + part.articles.length, 0)

export default function PoliciesPage() {
  return (
    <div className="flex gap-10">
      {/* Handbook content */}
      <article className="flex-1 min-w-0 max-w-3xl">
        {/* Cover */}
        <header className="mb-10 pb-8 border-b border-border-default">
          <p className="text-xs uppercase tracking-wide text-brand mb-2">Project Neverphorm LLC</p>
          <h1 className="text-3xl font-bold mb-3">Studio Handbook</h1>
          <p className="text-text-secondary text-sm mb-5">
            Every policy, expectation, and standard at the studio, all in one place. It&apos;s a long read
            on purpose. Read it fully once, then come back whenever you have a question.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">Version {HANDBOOK_VERSION}</Badge>
            <Badge>Updated {HANDBOOK_UPDATED}</Badge>
            <Badge>{totalArticles} articles</Badge>
            <Badge tone="warning">Not acknowledged</Badge>
          </div>
        </header>

        {/* Mobile / tablet table of contents */}
        <details className="xl:hidden mb-10 bg-elevated border border-border-default rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-semibold">Table of contents</summary>
          <TableOfContents />
        </details>

        {numbered.map((part) => (
          <section key={part.title} className="mb-14">
            <h2 className="text-xs uppercase tracking-wide text-brand mb-6 pb-2 border-b border-border-default">
              {part.title}
            </h2>

            {part.articles.map((article) => (
              <div key={article.id} id={article.id} className="mb-10 scroll-mt-6">
                <p className="text-xs text-text-secondary mb-1">Article {article.number}</p>
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
                        <ul className={`space-y-2 ${section.body ? 'mt-3' : ''}`}>
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
          </section>
        ))}

        {/* Sign-off */}
        <div className="space-y-4 pt-8 border-t border-border-default">
          <Card title="Acknowledgement">
            <p className="text-text-secondary mb-4">
              When the handbook is updated, everyone re-acknowledges the new version so we all stay on the
              same page.
            </p>
            <Acknowledge label={`I've read and understand the Studio Handbook v${HANDBOOK_VERSION}`} />
          </Card>

          <Card title="Changelog">
            <Table headers={['Version', 'Date', 'What changed']} rows={changelog} />
          </Card>

          <p className="text-xs text-text-secondary">
            This handbook is a guide to how the studio works and is not a contract. Your signed agreement
            controls if anything here conflicts with it. Policies will be reviewed by a lawyer before the
            studio hires salaried employees.
          </p>
        </div>
      </article>

      {/* Desktop table of contents, sticks while you scroll */}
      <aside className="hidden xl:block w-64 shrink-0">
        <div className="sticky top-0 max-h-[calc(100vh-10rem)] overflow-y-auto bg-elevated border border-border-default rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">Contents</p>
          <TableOfContents />
        </div>
      </aside>
    </div>
  )
}

function TableOfContents() {
  return (
    <nav className="mt-3 space-y-4">
      {numbered.map((part) => (
        <div key={part.title}>
          <p className="text-xs font-semibold text-brand mb-1.5">{part.title.replace(/^Part [IVX]+: /, '')}</p>
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