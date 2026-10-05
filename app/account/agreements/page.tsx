import { Card, EmptyState, TabHeader } from '@/components/account/AccountUI'

// TODO: load signed documents from Supabase storage
const agreements: {
  name: string
  version: string
  signedOn: string
  url: string
}[] = []

export default function AgreementsPage() {
  return (
    <>
      <TabHeader
        title="Agreements"
        description="Your signed collaboration agreement and related terms."
      />

      <Card title="Signed documents">
        {agreements.length === 0 ? (
          <EmptyState message="No signed agreements yet. Your collaboration agreement will appear here once signed." />
        ) : (
          <ul className="divide-y divide-border-default">
            {agreements.map((a) => (
              <li key={a.name} className="flex justify-between py-2">
                <a href={a.url} className="underline hover:text-brand">
                  {a.name}
                </a>
                <span className="text-text-secondary">
                  v{a.version} · signed {a.signedOn}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Key terms at a glance">
        <ul className="list-disc space-y-1 pl-5">
          <li>Project Neverphorm keeps 100% ownership of all its IP.</li>
          <li>Collaborators do not receive equity.</li>
          <li>Studio work and unreleased details stay confidential (NDA).</li>
        </ul>
      </Card>
    </>
  )
}