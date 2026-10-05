import { Acknowledge, Badge, Card, Table, TabHeader } from '@/components/account/AccountUI'
import {
  AwardIcon,
  BookIcon,
  ChatIcon,
  ClockIcon,
  HeartIcon,
  LockIcon,
  ShieldIcon,
  StarIcon,
  ToolIcon,
} from '@/components/account/icons'

const POLICY_VERSION = '1.0'

const policies = [
  {
    title: 'Working Hours',
    icon: <ClockIcon />,
    points: ['Shifts are capped at 7.5 hours', 'Work when it fits your schedule', 'Breaks are encouraged, not earned'],
  },
  {
    title: 'No Crunch',
    icon: <HeartIcon />,
    points: ['Crunch is never expected or rewarded', 'Deadlines move before people burn out', 'A founding rule, not a perk'],
  },
  {
    title: 'Time Off & Availability',
    icon: <StarIcon />,
    points: ['Let the team know when you’re away', 'Life and your main job come first', 'No questions asked for personal time'],
  },
  {
    title: 'Communication',
    icon: <ChatIcon />,
    points: ['Keep task status updated in the portal', 'Flag blockers early', 'Watch task brief videos before starting'],
  },
  {
    title: 'Credit & Recognition',
    icon: <AwardIcon />,
    points: ['Everyone who contributes is credited', '6 months on the team earns a dev artifact', 'Wins get shared with the whole team'],
  },
  {
    title: 'Confidentiality',
    icon: <LockIcon />,
    points: ['Unreleased games stay private', 'Share only what’s been announced', 'Task videos are unlisted, not public'],
  },
  {
    title: 'IP Ownership',
    icon: <ShieldIcon />,
    points: ['The studio owns 100% of its IP', 'Ideas are welcome and credited', 'Personal projects stay yours'],
  },
  {
    title: 'Tools & Accounts',
    icon: <ToolIcon />,
    points: ['Use studio accounts for studio work', 'Never share logins outside the team', 'Turn on 2FA wherever possible'],
  },
  {
    title: 'Training & Learning',
    icon: <BookIcon />,
    points: ['Complete required engine pathways', 'Optional certs are for your own growth', 'Ask questions, we figure it out together'],
  },
]

const changelog = [
  ['v1.0', 'Oct 2026', 'First set of studio policies published'],
]

export default function PoliciesPage() {
  return (
    <div className="space-y-4">
      <TabHeader
        title="Studio Policies"
        description="What everyone at Project Neverphorm should know, read, and keep up with."
        action={
          <div className="flex gap-2">
            <Badge tone="brand">Version {POLICY_VERSION}</Badge>
            <Badge tone="warning">Not acknowledged</Badge>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {policies.map((p) => (
          <Card key={p.title}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-9 h-9 rounded-lg bg-brand/15 text-brand flex items-center justify-center">
                {p.icon}
              </span>
              <p className="font-semibold text-base">{p.title}</p>
            </div>
            <ul className="space-y-1.5 text-text-secondary">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-2">
                  <span className="text-brand">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Acknowledgement">
          <p className="text-text-secondary mb-4">
            When policies are updated, everyone re-acknowledges the new version so we all stay on the same page.
          </p>
          <Acknowledge label={`I've read and understand Studio Policies v${POLICY_VERSION}`} />
        </Card>

        <Card title="Policy changelog" className="lg:col-span-2">
          <Table headers={['Version', 'Date', 'What changed']} rows={changelog} />
        </Card>
      </div>
    </div>
  )
}