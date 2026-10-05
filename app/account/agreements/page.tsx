import { Badge, Card, InfoRow, StatTile, Table, TabHeader } from '@/components/account/AccountUI'
import { CheckIcon, ChatIcon, ClockIcon, FileIcon, LockIcon } from '@/components/account/icons'

// TODO: load signed documents from Supabase storage
const documents = [
  {
    name: 'Collaboration Agreement',
    desc: 'Your role, responsibilities, and how you work with the studio.',
    version: '1.0',
    status: 'Awaiting signature',
  },
  {
    name: 'Revenue Share Addendum',
    desc: 'Your share per title, payout schedule, and salary transition terms.',
    version: '1.0',
    status: 'Awaiting signature',
  },
  {
    name: 'Non-Disclosure Agreement',
    desc: 'Keeps unreleased games, plans, and studio info confidential.',
    version: '1.0',
    status: 'Awaiting signature',
  },
  {
    name: 'IP & Work-for-Hire Terms',
    desc: 'All work made for the studio belongs to Project Neverphorm.',
    version: '1.0',
    status: 'Awaiting signature',
  },
]

const keyTerms = [
  'Project Neverphorm keeps 100% ownership of all its IP.',
  'Collaborators do not receive equity.',
  'Revenue share is paid per title you worked on.',
  'Studio work and unreleased details stay confidential.',
  'Either side can end the agreement with written notice.',
  'You keep your share on titles released before you leave.',
]

export default function AgreementsPage() {
  return (
    <div className="space-y-4">
      <TabHeader
        title="Agreements"
        description="Your signed collaboration agreement and related terms."
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Signed" value="0 / 4" hint="Documents" icon={<CheckIcon />} />
        <StatTile label="Pending" value="4" hint="Need your signature" icon={<ClockIcon />} />
        <StatTile label="Current version" value="v1.0" hint="Studio agreements" icon={<FileIcon />} />
        <StatTile label="Last updated" value="Oct 2026" hint="By Cody" icon={<LockIcon />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Documents" className="lg:col-span-2">
          <ul className="divide-y divide-border-default">
            {documents.map((d) => (
              <li key={d.name} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-brand/15 text-brand flex items-center justify-center">
                  <FileIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-text-secondary text-xs">{d.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone="warning">{d.status}</Badge>
                  <span className="text-xs text-text-secondary">v{d.version}</span>
                  <button disabled className="border border-border-default rounded px-3 py-1 text-xs disabled:opacity-50" title="Coming soon">
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Key terms at a glance">
          <ul className="space-y-2.5">
            {keyTerms.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-brand mt-0.5"><CheckIcon className="w-4 h-4" /></span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Version history" className="lg:col-span-2">
          <Table
            headers={['Version', 'Date', 'Changes', 'Status']}
            rows={[
              ['v1.0', 'Oct 2026', 'First collaboration agreement set', <Badge key="v1" tone="brand">Current</Badge>],
            ]}
          />
        </Card>

        <Card title="Signing details">
          <InfoRow label="Signed via" value="E-signature" />
          <InfoRow label="Signed on" value="—" />
          <InfoRow label="Copy on file" value="Portal + email" />
          <div className="mt-4 flex items-start gap-3 rounded-lg bg-background border border-border-default p-3">
            <span className="text-brand"><ChatIcon className="w-5 h-5" /></span>
            <p className="text-xs text-text-secondary">
              Questions about any agreement? Reach out to Cody or Matt before signing. Nothing is final until
              everyone understands it.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}