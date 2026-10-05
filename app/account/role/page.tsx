import Link from 'next/link'
import { Badge, Card, Field, ProgressBar, StatTile, TabHeader } from '@/components/account/AccountUI'
import { AwardIcon, BookIcon, StarIcon, TrendingIcon } from '@/components/account/icons'

// Placeholder content until roles live in Supabase
const ladder = ['Associate', 'Developer', 'Senior', 'Lead']
const currentStep = 0

const responsibilities = [
  'Own your assigned tasks from start to finish',
  'Review task brief videos and ask questions early',
  'Keep task status updated in the portal',
  'Join playtests and give honest feedback',
  'Share progress in the team channel weekly',
]

const skills = [
  { name: 'Core role skills', value: 40 },
  { name: 'Engine knowledge (Unity / Unreal)', value: 25 },
  { name: 'Studio pipeline', value: 30 },
  { name: 'Collaboration & communication', value: 60 },
]

const crossTraining = ['Art', 'Audio', 'Design', 'Technology', 'Production', 'Business']

export default function RolePage() {
  return (
    <div className="space-y-4">
      <TabHeader
        title="Role & Growth"
        description="Your current role, what's expected, and where you can grow from here."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Current role" className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-lg bg-brand/15 text-brand flex items-center justify-center">
              <TrendingIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xl font-bold">Role title</p>
              <p className="text-text-secondary">Department · Hybrid role</p>
            </div>
            <div className="sm:ml-auto flex gap-2">
              <Badge tone="brand">{ladder[currentStep]}</Badge>
              <Badge tone="success">Active</Badge>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Reports to" value="Cody McCullough" />
            <Field label="In role since" value="Oct 2026" />
            <Field label="Current project" value="Duskline" />
            <Field label="Next review" value="Apr 2027" />
          </div>
        </Card>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-1">
          <StatTile label="Months on team" value="0" hint="6 months unlocks a dev artifact" icon={<StarIcon />} />
          <StatTile label="Trainings done" value="0 / 4" hint="Required pathways" icon={<BookIcon />} />
        </div>
      </div>

      <Card title="Career path">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {ladder.map((step, i) => (
            <div
              key={step}
              className={`rounded-lg border p-4 ${
                i === currentStep
                  ? 'border-brand bg-brand/10'
                  : i < currentStep
                  ? 'border-border-default bg-background'
                  : 'border-dashed border-border-default'
              }`}
            >
              <p className="text-xs text-text-secondary mb-1">Level {i + 1}</p>
              <p className="font-semibold">{step}</p>
              <p className="text-xs text-text-secondary mt-1">
                {i === currentStep ? 'You are here' : i === ladder.length - 1 ? 'Leads a department' : 'Next step'}
              </p>
            </div>
          ))}
        </div>
        <p className="text-text-secondary text-xs mt-4">
          As the studio grows and brings in more income, new lead positions open up. Growth is based on
          consistency, quality, and helping the team, not hours.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Responsibilities">
          <ul className="space-y-2.5">
            {responsibilities.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-brand">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Skill growth">
          <div className="space-y-4">
            {skills.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span>{s.name}</span>
                  <span className="text-text-secondary">{s.value}%</span>
                </div>
                <ProgressBar value={s.value} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cross-training">
          <p className="text-text-secondary mb-3">
            Roles here are hybrid. Pick areas you want to learn alongside your main role.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {crossTraining.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
          <Link href="/dashboard/training" className="text-brand text-sm hover:underline">
            Go to Training →
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Request a role change" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Interested in</label>
              <select disabled className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm disabled:opacity-60">
                <option>Switch roles</option>
                <option>Lead position</option>
                <option>Add cross-training</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Department</label>
              <select disabled className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm disabled:opacity-60">
                {crossTraining.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-text-secondary mb-1.5">Why are you interested?</label>
              <textarea
                disabled
                rows={3}
                placeholder="Tell Cody what you'd like to do and why..."
                className="w-full bg-background border border-border-default rounded px-3 py-2 text-sm disabled:opacity-60"
              />
            </div>
          </div>
          <button disabled className="mt-4 bg-brand text-black font-semibold rounded px-4 py-2 text-sm disabled:opacity-50">
            Send request (coming soon)
          </button>
        </Card>

        <Card title="Recognition">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-brand"><AwardIcon className="w-8 h-8" /></span>
            <div>
              <p className="font-semibold">Dev artifact</p>
              <p className="text-text-secondary text-xs">Your own artifact added into a shipped game</p>
            </div>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span>Progress</span>
            <span className="text-text-secondary">0 / 6 months</span>
          </div>
          <ProgressBar value={0} max={6} />
        </Card>
      </div>
    </div>
  )
}