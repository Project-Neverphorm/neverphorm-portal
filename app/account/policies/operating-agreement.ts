import { handbook } from './handbook'

type Part = (typeof handbook)[number]

export const OA_VERSION = '1.1'
export const OA_UPDATED = 'October 2026'

export const oaChangelog = [
  ['1.1', 'Oct 23, 2026', 'Team Pool (70%) is no longer fixed; added Team Pool adjustments, team size and dilution, and notice of changes (6.5 to 6.7).'],
  ['1.0', 'Oct 19, 2026', 'Revision pass: 2 week silence threshold, open roles, revenue share tied to meeting requirements.'],
]

export const operatingAgreement: Part[] = [
  {
    title: 'Part I: The Studio & the Team',
    articles: [
      {
        id: 'oa-the-studio',
        title: 'The Studio',
        sections: [
          {
            heading: 'About this agreement',
            body: [
              'This agreement explains how Project Neverphorm works as a company: who owns what, how people are paid, what is expected of every team member, and what happens when someone leaves. Everyone on the team signs it, including the Studio Head. Each person also signs a Collaborator Contract for their specific role.',
              "This is not the LLC's member operating agreement, and it gives no one ownership in the LLC. It was written without a lawyer and is not legal advice. If it is ever updated, everyone re-signs the new version.",
            ],
          },
          {
            heading: 'The agreement',
            body: [
              'This agreement is between Project Neverphorm LLC, an Illinois limited liability company ("the Studio"), and the team member signing below. It starts on the date they sign.',
            ],
          },
          {
            heading: 'Terms',
            bullets: [
              '1.1 Project Neverphorm LLC was formed in Illinois on November 25, 2025. Cody McCullough is its sole member, owner, and Studio Head.',
              '1.2 The Studio is built for the long run. Many games are already planned and mapped out with full design documents, so the Studio is never betting everything on a single title.',
              '1.3 The Studio self-publishes its games. It does not sign publisher deals that give up control, time, or ownership.',
              '1.4 Signing this agreement gives no one ownership, equity, or membership in the LLC. Team members do not receive equity.',
            ],
          },
        ],
      },
      {
        id: 'oa-roles-leadership',
        title: 'Roles and Leadership',
        sections: [
          {
            bullets: [
              '2.1 Studio Head and Creative Director: sets the creative direction for every game, approves work before it ships, and makes final calls on Studio business.',
              '2.2 Business Operations Lead: runs the business side, prepares monthly revenue statements and payouts, and keeps Studio records.',
              '2.3 Marketing & Community Lead: runs Studio social media, the Discord community, and launch campaigns.',
              "2.4 Development roles (level design, UI/UX, programming, art, animation, writing): build the games under the Creative Director's direction.",
              '2.5 Everyone has a voice. The Creative Director leads the creative direction, but every team member is encouraged to share ideas, give input, and collaborate on each game as it develops. Roles are also hybrid, so anyone may help outside their lane when the team needs it.',
              "2.6 Each role's specific duties are written in that person's Collaborator Contract.",
              "2.7 The Studio has no HR department. People decisions are made together by the Studio Head, the Business Operations Lead, and the Marketing & Community Lead, with the Studio Head's call final.",
            ],
          },
        ],
      },
      {
        id: 'oa-how-we-make-games',
        title: 'How the Studio Makes Games',
        sections: [
          {
            bullets: [
              '3.1 The Studio works through a planned lineup of titles, each with its own design document. The lineup lives on the Pipeline page of the Studio portal and is confidential.',
              "3.2 The Studio favors smaller, focused games with tight development cycles so releases come steadily. Each game's timeline is set with the team during its planning.",
              '3.3 Every Studio game releases on all major platforms: PC, PlayStation, Xbox, and Nintendo Switch.',
              "3.4 Every game includes the Studio's in-game achievement system, called Milestones, tied to platform achievements and trophies. The Studio writes its own achievement guides for its games.",
              '3.5 If the team hits a creative block or gets stuck going back and forth on an idea, it gets about 30 minutes of discussion. Then the team decides whether it goes in the game and moves on.',
              '3.6 The Studio runs on honest feedback. Team members are expected to give real feedback, not just approval, and to take part in regular 1-on-1 conversations.',
            ],
          },
        ],
      },
      {
        id: 'oa-working-relationship',
        title: 'Working Relationship',
        sections: [
          {
            bullets: [
              '4.1 Team members are independent contractors, paid on a 1099 basis. Nothing is withheld for taxes.',
              '4.2 Studio work is part-time, paid or unpaid, until the Studio builds enough runway to offer full-time positions. Team members are free to keep a full-time job elsewhere.',
              "4.3 Team members cannot sign contracts, spend money, or make promises on the Studio's behalf without the Studio Head's written approval.",
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part II: Expectations',
    articles: [
      {
        id: 'oa-hours-communication',
        title: 'Hours, Communication, and Time Off',
        sections: [
          {
            bullets: [
              '5.1 Every team member, including the Studio Head, commits to at least 8 hours per week of Studio work.',
              '5.2 Brainstorming sessions, team meetings, and assigned training count toward these hours.',
              '5.3 Every team member checks in with the team at least once a week in the Studio Discord, even if only to say nothing got done that week. Communication is the minimum expectation for everyone.',
              '5.4 Tasks are assigned in the Studio portal first. Tasks are how the team tracks progress: checking them off shows everyone, at a glance, where the Studio stands.',
              '5.5 Anyone who expects to miss hours tells the Creative Director ahead of time. Life happens, and reasonable breaks are worked out.',
              '5.6 Going 2 weeks with zero communication, zero effort, and zero collaboration, without telling the team, counts as voluntarily leaving the Studio. Removal is automatic. For this to work, we have to work as a team.',
              '5.7 No crunch. Once the Studio is full-time, a 7.5-hour daily shift cap applies.',
              '5.8 Holidays: the Studio is closed on major holidays. No work is expected and no meetings are held.',
              '5.9 Year-end closure: the Studio closes for the last 2 weeks of every year. No work, no meetings, and the weekly hour minimum does not apply. This time is for rest and family.',
              "5.10 Holidays and the year-end closure apply from day one, whether a team member is on revenue share or salary, and never reduce anyone's pay.",
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part III: Pay, Growth & Training',
    articles: [
      {
        id: 'oa-revenue-share',
        title: 'Pay: Revenue Share',
        sections: [
          {
            bullets: [
              '6.1 Until the Studio can pay salaries, the team is paid through revenue share. There is no guaranteed or minimum pay. No revenue in a month means no payout that month.',
              '6.2 Net Revenue means money the Studio actually receives from game sales and paid content, after platform fees, refunds, chargebacks, and any taxes the platforms withhold.',
              "6.3 Each month, Net Revenue is split two ways. The 30% Studio Share is kept for operating costs, a savings reserve, and the Studio Head's pay. The 70% Team Pool is split equally among Active Team Members that month, adjusted as described in the next point.",
              "6.4 An Active Team Member has signed this agreement and a Collaborator Contract and has not left or been removed. A team member who does not meet the requirements of this agreement or their Collaborator Contract in a given month receives a reduced share of that month's Team Pool.",
              '6.5 Team Pool adjustments: The 70% Team Pool is not a fixed or guaranteed percentage. As the Studio adds team members or reaches revenue milestones, the Studio may adjust the Team Pool percentage, including reducing it to fund paid part-time or contract positions. Every team member acknowledges that the Team Pool, and their individual share of it, may change over time.',
              '6.6 Team size and dilution: Because the Team Pool is divided equally, each new Active Team Member reduces every individual share. As the team grows, the Studio will formally review its compensation structure when individual shares are no longer meaningful relative to the work each person contributes, based on both team size and Studio revenue. As a result of that review, new team members may be brought on as paid part-time or contract positions rather than joining the Team Pool, and the Team Pool percentage may be revised accordingly.',
              '6.7 Notice of changes: Any change to the Team Pool percentage is discussed with the team in advance, put in writing, and applies only to months after it takes effect. A change never reduces revenue share already earned for a prior month.',
              '6.8 The Studio Head is not part of the Team Pool. The Team Pool is always paid out first, before the Studio Head takes any pay.',
              "6.9 The Business Operations Lead prepares a monthly statement showing Net Revenue, the Studio Share, the Team Pool, and each person's amount. The Studio Head reviews and approves it, shares it with the team, and sends payouts within 15 days of receiving that month's platform payouts.",
              '6.10 Each team member gives the Studio a completed W-9 before their first payout. The Studio issues a 1099 each year, and each person handles their own taxes. The Studio recommends setting aside 30% of every payout for taxes.',
            ],
          },
        ],
      },
      {
        id: 'oa-moving-to-salary',
        title: 'Moving to Salary',
        sections: [
          {
            bullets: [
              "7.1 The Studio plans to replace revenue share with salaried positions once revenue supports it, expected around the Studio's first $1 million in revenue.",
              '7.2 At the switch, any revenue share earned but not yet paid is paid in full.',
              '7.3 Salaries are intended to be competitive with industry-standard pay, and slightly above it, since the Studio is a small team. Benefits, such as health insurance, will be discussed as a team in a meeting when the Studio goes full-time.',
              '7.4 Anyone who accepts a salaried position signs new employment terms, which replace Section 6.',
            ],
          },
        ],
      },
      {
        id: 'oa-bonuses-growth',
        title: 'Bonuses, Growth, and Recognition',
        sections: [
          {
            bullets: [
              "8.1 Once on salary, the team can earn launch bonuses, judged against a projection for each game's first 30 days. A PLB (Projected Launch Bonus) is paid when a launch meets its projection. A larger OLPB (Outperformed Launch Projection Bonus) is paid when a launch beats it. No bonus is paid when a launch misses its projection.",
              '8.2 As the Studio grows, team members may move into lead positions or switch roles. Any change is put in writing.',
              '8.3 Dev artifacts: every team member who contributes real work to a game (a level, art, code, UI, writing, or design that ships) earns their own dev artifact in that game, a personal collectible that marks their footprint on the title. It is based on contribution, not on how long someone has been with the Studio.',
            ],
          },
        ],
      },
      {
        id: 'oa-training',
        title: 'Training',
        sections: [
          {
            bullets: [
              '9.1 Team members in engine-based roles complete the official Unity and/or Unreal Engine learning pathways that apply to their work. Business roles are exempt.',
              '9.2 The Studio provides its own pipeline training through videos and written guides on the Studio portal.',
              '9.3 Outside certifications are optional, are not paid for by the Studio, and are for personal and professional growth.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part IV: Ownership & Protection',
    articles: [
      {
        id: 'oa-ownership-ip',
        title: 'Ownership of Work (IP)',
        sections: [
          {
            bullets: [
              '10.1 Everything a team member makes for the Studio belongs to Project Neverphorm LLC: code, art, models, animations, audio, levels, designs, writing, names, ideas, and documents.',
              '10.2 To the extent the law allows, this is "work made for hire." Anything that does not qualify is assigned to the Studio, and the team member will sign any paperwork needed to confirm it.',
              '10.3 The Studio keeps 100% ownership of all its games and IP, including after a team member leaves. This is not negotiable.',
              "10.4 Ideas a team member pitches that the Studio uses become Studio IP. Ideas never pitched stay the team member's.",
              "10.5 Work made before joining stays the team member's. If they add it to a Studio project, the Studio gets a permanent, free license to use it in that project.",
              '10.6 Third-party assets, fonts, and code libraries are only used when licensed for commercial use, with their source recorded.',
              '10.7 Team members may show their own work in a personal portfolio once the game it belongs to is publicly released.',
            ],
          },
        ],
      },
      {
        id: 'oa-confidentiality',
        title: 'Confidentiality',
        sections: [
          {
            bullets: [
              '11.1 Team members keep private anything the Studio has not made public: unannounced games, the Pipeline, builds, and Studio finances.',
              '11.2 This continues after a team member leaves.',
              '11.3 It does not cover anything already public or approved for sharing.',
            ],
          },
        ],
      },
      {
        id: 'oa-equipment-accounts',
        title: 'Equipment, Accounts, and Credits',
        sections: [
          {
            bullets: [
              '12.1 Team members use their own computer, software, and equipment unless the Studio provides something.',
              '12.2 The Studio pays for assets, tools, or services only when the Studio Head approves the purchase ahead of time.',
              '12.3 Studio accounts (social media, storefronts, code repositories, Discord, and the portal) belong to the Studio. Team members use their personal email for Studio work. Logins are handed back when a team member leaves.',
              '12.4 Every team member is credited by name and role in every game they worked on, including after they leave.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part V: Leaving & Governance',
    articles: [
      {
        id: 'oa-leaving-removal',
        title: 'Leaving or Removal',
        sections: [
          {
            bullets: [
              '13.1 Anyone may leave at any time by telling the Studio Head, the Business Operations Lead, or the Marketing & Community Lead. The Studio asks for 14 days notice when possible, as is industry standard.',
              '13.2 Going 2 weeks with no communication, effort, or collaboration counts as automatic, voluntary removal (Section 5). The Studio may also remove a team member for breaking confidentiality, misusing Studio property or accounts, or serious misconduct.',
              '13.3 After leaving, a team member is paid their share for any month they were an Active Team Member. They receive no revenue share for any month after they leave, including from games they worked on.',
              '13.4 On leaving, team members return or delete Studio files and confidential material. Sections 10, 11, and 12.4 continue to apply.',
            ],
          },
        ],
      },
      {
        id: 'oa-decisions-changes',
        title: 'Decisions and Changes',
        sections: [
          {
            bullets: [
              '14.1 The Creative Director makes final calls on creative direction. As owner, the Studio Head makes final calls on Studio business.',
              "14.2 Terms such as pay are set with the team's input and put in writing. Any change is discussed with the team first and only takes effect when written down and signed.",
            ],
          },
        ],
      },
      {
        id: 'oa-general',
        title: 'General',
        sections: [
          {
            bullets: [
              '15.1 This agreement is governed by the laws of the State of Illinois.',
              "15.2 This agreement and the signer's Collaborator Contract are the full agreement. If they conflict, this agreement controls unless the contract says otherwise.",
              '15.3 If any part is found unenforceable, the rest still applies.',
              '15.4 Electronic signatures count the same as handwritten ones.',
            ],
          },
        ],
      },
    ],
  },
]