import { handbook } from './handbook'

type Part = (typeof handbook)[number]

export const OA_VERSION = '1.1'
export const OA_UPDATED = 'October 2026'

export const oaChangelog = [
  ['1.1', 'Oct 23, 2026', 'Team Pool (70%) is no longer fixed; reviewed based on team size and Studio revenue.'],
  ['1.0', 'Oct 19, 2026', 'Revision pass: 2 week silence threshold, open roles, rev share tied to requirements.'],
]

export const operatingAgreement: Part[] = [
  {
    title: 'Part I: Formation & Purpose',
    articles: [
      {
        id: 'oa-formation',
        title: 'Formation',
        sections: [{ body: ['TODO: paste OA content here.'] }],
      },
    ],
  },
]