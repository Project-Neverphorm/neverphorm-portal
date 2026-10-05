// Project Neverphorm Studio Handbook
// Edit the text here. The policies page renders whatever is in this file.
// Bump HANDBOOK_VERSION and add a changelog entry whenever you change a policy.

export const HANDBOOK_VERSION = '1.0'
export const HANDBOOK_UPDATED = 'October 2026'

export type Section = {
  heading?: string
  body?: string[]
  bullets?: string[]
}

export type Article = {
  id: string
  title: string
  sections: Section[]
}

export type Part = {
  title: string
  articles: Article[]
}

export const handbook: Part[] = [
  {
    title: 'Part I: Welcome & Foundations',
    articles: [
      {
        id: 'welcome',
        title: 'Welcome to Project Neverphorm',
        sections: [
          {
            body: [
              'Project Neverphorm LLC is an independent game studio built to make games for the long haul. We are a small team on purpose, and we plan to stay that way. Every person here matters, and every person here is expected to help keep this a place people actually want to work.',
              'This handbook explains how the studio works: what we expect from each other, what you can expect from the studio, and what happens when something goes wrong. It is long because we would rather over-explain than leave anyone guessing.',
            ],
          },
          {
            heading: 'How to use this handbook',
            bullets: [
              'Read it fully once when you join, then come back to it whenever you have a question.',
              'If something is unclear or missing, ask. That is how this handbook gets better.',
              'If this handbook and your signed agreement ever disagree, your signed agreement wins.',
            ],
          },
        ],
      },
      {
        id: 'mission',
        title: 'Mission, Vision & Values',
        sections: [
          {
            heading: 'Mission',
            body: [
              'Make meaningful, well-crafted games that respect the player, and build a catalog that grows stronger with every release.',
            ],
          },
          {
            heading: 'Vision',
            body: [
              'A permanently small, sustainable studio that makes games for life, where the people building the games are treated as well as the players buying them.',
            ],
          },
          {
            heading: 'Values',
            bullets: [
              'People before deadlines. No crunch, ever.',
              'Figure it out together. Nobody is expected to know everything, and nobody gets left behind.',
              'Honest work, honest talk. Say what you mean, own your mistakes, and give credit freely.',
              'Craft over speed. We would rather ship late than ship something we are not proud of.',
              'Long-term thinking. Every decision should help the studio still be here in 10 years.',
            ],
          },
        ],
      },
      {
        id: 'scope',
        title: 'Who This Handbook Applies To',
        sections: [
          {
            body: [
              'This handbook applies to everyone who works with Project Neverphorm in any capacity: founders, employees, collaborators on revenue share, contractors, interns, and volunteers. Some sections, like pay and benefits, only apply to certain roles. Those sections say so.',
              'It applies whenever you are doing studio work or representing the studio, including in the portal, Discord, video calls, playtests, events, conventions, and online spaces where you are identified as part of the team.',
            ],
          },
        ],
      },
      {
        id: 'relationship',
        title: 'Working Relationship & Status',
        sections: [
          {
            body: [
              'Your exact relationship with the studio (collaborator, contractor, or employee) is defined in your signed agreement. Right now, most team members are collaborators on revenue share. When the studio transitions to salaried roles, affected team members will receive new written terms.',
              'Nothing in this handbook is a contract or a promise of continued work for any length of time. Either you or the studio can end the working relationship according to the terms of your signed agreement.',
            ],
          },
          {
            heading: 'Main jobs come first',
            body: [
              'Many of us have full-time jobs outside the studio. That is expected and respected. Your main job, your health, and your family come before studio work, and you will never be penalized for that.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part II: Equal Opportunity & Respect',
    articles: [
      {
        id: 'equal-opportunity',
        title: 'Equal Opportunity',
        sections: [
          {
            body: [
              'Project Neverphorm makes decisions about who joins the team, roles, pay, promotions, credits, and everything else based on skill, effort, and fit for the work. Nothing else.',
              'We do not discriminate based on race, color, religion, sex, pregnancy, sexual orientation, gender identity or expression, national origin, ancestry, age, disability, genetic information, military or veteran status, or any other status protected by federal, state, or local law.',
            ],
          },
          {
            heading: 'Accommodations',
            body: [
              'If you need an accommodation because of a disability, religious practice, or anything else, talk to Cody (Owner) or Matt (Business Operations). We will work with you to find something that works, and the conversation stays private.',
            ],
          },
        ],
      },
      {
        id: 'harassment',
        title: 'Zero Tolerance for Harassment',
        sections: [
          {
            body: [
              'Project Neverphorm has zero tolerance for harassment of any kind. This applies to how team members treat each other, playtesters, contractors, community members, players, and anyone else we deal with as a studio.',
            ],
          },
          {
            heading: 'What harassment includes',
            bullets: [
              'Offensive jokes, slurs, name-calling, or insults about any protected characteristic',
              'Unwanted sexual comments, advances, messages, images, or requests for sexual favors',
              'Unwanted physical contact of any kind at in-person events',
              'Threats, intimidation, or deliberately humiliating someone',
              'Repeatedly contacting someone after they have asked you to stop',
              'Sharing offensive images, memes, or content in studio spaces',
              'Bullying, ganging up on someone, or deliberately excluding someone from team activities',
            ],
          },
          {
            heading: 'Where it applies',
            body: [
              'Harassment is not allowed anywhere studio work happens: Discord, the portal, direct messages, video calls, email, social media, events, and in person. "It was just a joke" or "it was in a private message" is never an excuse.',
            ],
          },
          {
            heading: 'Consequences',
            body: [
              'Harassment can result in immediate removal from the team, depending on how serious it is. Even a first offense can mean removal.',
            ],
          },
        ],
      },
      {
        id: 'reporting',
        title: 'Reporting Concerns & No Retaliation',
        sections: [
          {
            heading: 'How to report',
            bullets: [
              'Talk to Cody directly, in person, by call, or by private message.',
              'If the concern involves Cody, talk to Business Operations instead.',
              'You can report something that happened to you or something you saw happen to someone else.',
              'You do not need proof to report. Just tell us what happened.',
            ],
          },
          {
            heading: 'What happens next',
            body: [
              'Every report is taken seriously and looked into quickly and fairly. We will only share details with people who need to know to fix the problem. You will be told when the matter has been addressed.',
            ],
          },
          {
            heading: 'No retaliation',
            body: [
              'Nobody will be punished, removed, sidelined, or treated differently for reporting a concern in good faith or for helping with an investigation. Retaliating against someone who reported is treated as seriously as the original harassment.',
            ],
          },
        ],
      },
      {
        id: 'conduct',
        title: 'Code of Conduct',
        sections: [
          {
            body: ['Everyone at the studio is expected to:'],
            bullets: [
              'Treat teammates, players, and partners with respect, even during disagreements',
              'Critique the work, never the person',
              'Be honest about progress, mistakes, and blockers',
              'Follow through on commitments, or say early if you cannot',
              'Respect other people\'s time, boundaries, and schedules',
              'Represent the studio professionally in public',
              'Keep studio information confidential',
            ],
          },
          {
            heading: 'Not allowed',
            bullets: [
              'Harassment, discrimination, or threats of any kind',
              'Lying about work, hours, or contributions',
              'Taking credit for someone else\'s work',
              'Stealing, damaging, or misusing studio property, accounts, or funds',
              'Sharing confidential studio information without approval',
              'Working on studio tasks while impaired',
            ],
          },
        ],
      },
      {
        id: 'dress-code',
        title: 'Dress Code & Appearance',
        sections: [
          {
            body: [
              'We are a remote-first creative studio, so there is no formal dress code for day-to-day work. Wear whatever helps you do your best work. That said, a few situations call for some basic standards. Zero tolerance for wearing a blue vest (inside joke). ',
            ],
          },
          {
            heading: 'Video calls and recordings',
            bullets: [
              'Dress the way you would for a casual job: clean, appropriate clothing.',
              'No clothing with offensive, hateful, sexual, or violent graphics or text.',
              'Be aware of your background. Nothing inappropriate or confidential should be visible on camera.',
              'Cameras are encouraged for team meetings but not required.',
            ],
          },
          {
            heading: 'Public events, conventions, and press',
            bullets: [
              'Business casual or studio merch is preferred when representing Project Neverphorm.',
              'Studio shirts or branded merch may be provided for events.',
              'Follow any specific dress requirements set by the event organizer.',
            ],
          },
          {
            heading: 'Personal expression',
            body: [
              'Hairstyles, tattoos, piercings, religious attire, and cultural dress are always welcome. This dress code will never be applied in a way that discriminates against anyone.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part III: How We Work',
    articles: [
      {
        id: 'hours',
        title: 'Working Hours & No Crunch',
        sections: [
          {
            heading: 'Shift cap',
            body: [
              'No studio work session should run longer than 7.5 hours in a single day. This cap is a founding rule. It exists before the studio has income on purpose, so it never becomes something we promise later and forget.',
            ],
          },
          {
            heading: 'No crunch',
            bullets: [
              'Crunch is never expected, requested, or rewarded.',
              'If a deadline cannot be met at a healthy pace, the deadline moves. People do not.',
              'Nobody will be judged by how many hours they put in. Results and consistency matter.',
              'If you notice yourself or a teammate burning out, say something.',
            ],
          },
          {
            heading: 'Flexible schedule',
            body: [
              'Work when it fits your life. There are no required online hours, except for scheduled meetings and playtests, which will be planned ahead of time with everyone\'s availability in mind.',
            ],
          },
        ],
      },
      {
        id: 'availability',
        title: 'Availability, Time Off & Holidays',
        sections: [
          {
            heading: 'Letting the team know',
            bullets: [
              'If you will be unavailable for more than a few days, give the team a heads up in the team channel.',
              'If you have active tasks, let Cody know so they can be reassigned or paused.',
              'You do not need to explain why. "I\'m away until Friday" is enough.',
            ],
          },
          {
            heading: 'Personal and family time',
            body: [
              'Illness, family emergencies, mental health days, school, and life events always come first. Take the time you need, no questions asked.',
            ],
          },
          {
            heading: 'Studio holidays',
            body: [
              'The studio does not schedule meetings or deadlines on major holidays, including New Year\'s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, and the week between Christmas and New Year\'s. Religious and cultural holidays not listed here are respected too. Just let the team know.',
            ],
          },
          {
            heading: 'Paid time off (salaried roles)',
            body: [
              'Once the studio transitions to salaried roles, paid time off, sick leave, and holiday pay will be defined in writing and added to this handbook before the switch happens.',
            ],
          },
        ],
      },
      {
        id: 'communication',
        title: 'Communication',
        sections: [
          {
            heading: 'Where things go',
            bullets: [
              'Portal: tasks, task status, studio info, and anything that needs to be tracked',
              'Discord: day-to-day conversation, quick questions, and team updates',
              'Task brief videos: walkthroughs for specific tasks, linked on the task itself',
              'Video calls: meetings, reviews, and bigger discussions',
              'Email: external contacts, partners, and anything official',
            ],
          },
          {
            heading: 'Expectations',
            bullets: [
              'Keep your task status updated in the portal.',
              'Watch the task brief video before starting a task.',
              'Flag blockers early. Being stuck is normal; staying stuck in silence is not.',
              'Reply to direct questions when you can. There is no required response time, but a quick "I\'ll look tonight" helps.',
              'Disagree openly and respectfully. Once a decision is made, commit to it.',
            ],
          },
        ],
      },
      {
        id: 'meetings',
        title: 'Meetings & Playtests',
        sections: [
          {
            bullets: [
              'Meetings are scheduled ahead of time and kept as short as possible.',
              'Every meeting should have a purpose. If it can be a message, it should be a message.',
              'If you cannot make it, let the team know. Important decisions will be shared afterward.',
              'Playtests are part of the job for everyone. Honest, specific feedback is the most helpful thing you can give.',
            ],
          },
        ],
      },
      {
        id: 'remote',
        title: 'Remote Work',
        sections: [
          {
            body: [
              'Project Neverphorm is a remote-first studio. You can work from wherever you are, as long as you can stay reachable, keep studio information secure, and meet the expectations in this handbook.',
            ],
          },
          {
            bullets: [
              'Do not work on confidential studio material in public places where screens can be seen.',
              'Use a secure, password-protected internet connection. Avoid public Wi-Fi for studio accounts.',
              'Lock your computer when you step away if others share the space.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part IV: Studio Property, Security & Confidentiality',
    articles: [
      {
        id: 'confidentiality',
        title: 'Confidentiality',
        sections: [
          {
            body: [
              'You will see things before the public does: unannounced games, story details, mechanics, art, sales numbers, business plans, and team information. All of it is confidential unless the studio has publicly announced it.',
            ],
          },
          {
            heading: 'Rules',
            bullets: [
              'Do not share unannounced projects, builds, art, or details with anyone outside the team.',
              'Do not post screenshots, clips, or footage of unreleased work unless approved.',
              'Task brief videos are unlisted. Never share their links outside the team.',
              'Sales figures, revenue, and pay information stay private.',
              'Confidentiality continues after you leave the studio.',
            ],
          },
          {
            body: [
              'Your signed NDA has the full legal details. When in doubt, ask before sharing.',
            ],
          },
        ],
      },
      {
        id: 'ip',
        title: 'Intellectual Property',
        sections: [
          {
            body: [
              'Project Neverphorm owns 100% of its intellectual property. This is non-negotiable. Everything created for the studio, including code, art, audio, designs, writing, characters, worlds, and ideas developed for studio projects, belongs to the studio.',
            ],
          },
          {
            heading: 'What stays yours',
            bullets: [
              'Personal projects you make on your own time, with your own tools, that are not based on studio IP',
              'Skills and general knowledge you gain while working here',
              'Your portfolio rights: you can show your released studio work in your portfolio, with credit to the studio',
            ],
          },
          {
            heading: 'Pitching ideas',
            body: [
              'Ideas are always welcome. If your idea is used in a studio game, you will be credited for it. Pitched ideas that become part of a studio project become studio IP.',
            ],
          },
        ],
      },
      {
        id: 'security',
        title: 'Accounts, Tools & Security',
        sections: [
          {
            bullets: [
              'Use studio accounts only for studio work.',
              'Never share your login with anyone, including teammates. Ask for your own access instead.',
              'Turn on two-factor authentication (preferably an authenticator app) on every account that supports it.',
              'Never share verification codes. Nobody legitimate, including the studio, will ever ask you for one.',
              'Report anything suspicious right away: unexpected login codes, phishing emails, or strange account activity.',
              'Do not install pirated software or untrusted plugins on machines used for studio work.',
              'Keep your operating system and tools updated.',
            ],
          },
          {
            heading: 'Losing access',
            body: [
              'If a device is lost or stolen, or you think an account was compromised, tell Cody immediately so access can be locked down.',
            ],
          },
        ],
      },
      {
        id: 'equipment',
        title: 'Equipment & Software',
        sections: [
          {
            body: [
              'For now, team members use their own computers and equipment. Software licenses and paid tools needed for studio work will be provided or reimbursed when approved.',
            ],
          },
          {
            bullets: [
              'Studio-provided equipment or licenses remain studio property and must be returned when you leave.',
              'Only use legally licensed software and assets in studio projects.',
              'Every third-party asset used in a game must have its license recorded so we can credit and stay compliant.',
            ],
          },
        ],
      },
      {
        id: 'ai-tools',
        title: 'AI Tools',
        sections: [
          {
            body: [
              'AI tools can be useful for things like research, brainstorming, and code help. Because of licensing, quality, and player trust, the studio has a few rules.',
            ],
          },
          {
            bullets: [
              'Never paste confidential studio material into an AI tool that may train on or store it, unless that tool has been approved.',
              'Any AI-generated content that would ship in a game (art, audio, writing, voices) must be approved by Cody first and disclosed where storefronts require it.',
              'You are responsible for reviewing and understanding anything an AI tool helps you create.',
            ],
          },
        ],
      },
      {
        id: 'privacy',
        title: 'Privacy & Personal Data',
        sections: [
          {
            body: [
              'The studio only collects personal information it actually needs, like your name, contact info, and payment and tax details. It is stored securely, only shared with people who need it (like an accountant or payroll service), and never sold.',
              'Treat other people\'s information with the same care. Player data, playtester info, and teammates\' personal details are never shared outside of their intended use.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part V: Public Presence',
    articles: [
      {
        id: 'social-media',
        title: 'Social Media & Public Statements',
        sections: [
          {
            bullets: [
              'You are welcome to say you work with Project Neverphorm and to share announced studio news.',
              'Only Cody or designated team members speak officially for the studio.',
              'Do not share unannounced information, internal discussions, or private screenshots.',
              'If you post opinions, make it clear they are your own and not the studio\'s.',
              'Do not argue with players or critics on behalf of the studio. Flag it to the team instead.',
              'Harassment rules apply online too, including on your personal accounts when you are identified as part of the team.',
            ],
          },
        ],
      },
      {
        id: 'press',
        title: 'Press, Partners & Publishers',
        sections: [
          {
            bullets: [
              'Send all press, influencer, publisher, and partnership inquiries to Cody or Business Operations.',
              'Do not agree to interviews, deals, or partnerships on behalf of the studio.',
              'Do not make promises about release dates, features, or pricing.',
            ],
          },
        ],
      },
      {
        id: 'content-creation',
        title: 'Streaming & Content Creation',
        sections: [
          {
            body: [
              'Many of us stream, record, or make videos. That is great, and it can help the studio.',
            ],
          },
          {
            bullets: [
              'You can stream or post released studio games freely.',
              'Unreleased builds, dev footage, and behind-the-scenes content need approval first.',
              'Official dev logs and behind-the-scenes series are coordinated by the studio.',
              'Do not stream or record anything that shows confidential info (portal, Discord, task videos).',
            ],
          },
        ],
      },
      {
        id: 'community',
        title: 'Community & Player Interaction',
        sections: [
          {
            bullets: [
              'Be kind and patient with players, even frustrated ones.',
              'Never share player personal information.',
              'Pass bug reports and feedback to the team instead of promising fixes.',
              'Day One Crew testers and early access players are covered by the same respect and confidentiality rules.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part VI: Integrity',
    articles: [
      {
        id: 'conflicts',
        title: 'Conflicts of Interest & Outside Work',
        sections: [
          {
            body: [
              'Outside jobs, school, freelance work, and personal projects are all fine. A conflict of interest only happens when outside work could hurt the studio or use studio resources.',
            ],
          },
          {
            heading: 'Talk to Cody first if you plan to',
            bullets: [
              'Work for or with another game studio on a competing project',
              'Make a game or product very similar to an unannounced studio project',
              'Use studio tools, assets, accounts, or contacts for outside work',
              'Do business with the studio through a company you own or are part of',
            ],
          },
          {
            body: [
              'Most of the time, the answer will be yes. We just want to know ahead of time.',
            ],
          },
        ],
      },
      {
        id: 'gifts',
        title: 'Gifts & Business Ethics',
        sections: [
          {
            bullets: [
              'Small gifts like free game keys, merch, or a meal at an event are fine.',
              'Do not accept money, expensive gifts, or anything given to influence a studio decision.',
              'Never offer bribes, kickbacks, or anything of value to get special treatment.',
              'Do not manipulate reviews, ratings, or storefront rankings, including fake reviews.',
              'Follow storefront and platform rules at all times.',
            ],
          },
        ],
      },
      {
        id: 'substances',
        title: 'Drugs, Alcohol & Impairment',
        sections: [
          {
            bullets: [
              'Do not do studio work while impaired by alcohol, drugs, or anything else that affects your judgment.',
              'Illegal drugs are never allowed at studio events or while representing the studio.',
              'At events where alcohol is served, drink responsibly and remember you are representing the studio.',
              'If you are struggling with substance use, you can talk to Cody privately. Asking for help will never be held against you.',
            ],
          },
        ],
      },
      {
        id: 'violence',
        title: 'Workplace Violence & Threats',
        sections: [
          {
            body: [
              'Threats, violence, or intimidation of any kind, including jokes about violence toward teammates, are never acceptable. This applies online and in person. Weapons are not allowed at studio events. Any threat will result in removal from the team, and serious threats will be reported to the authorities.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part VII: Pay, Bonuses & Growth',
    articles: [
      {
        id: 'compensation',
        title: 'Compensation',
        sections: [
          {
            heading: 'Revenue share (current)',
            body: [
              'Collaborators currently earn a share of net revenue for each title they work on. Net revenue means what the studio actually receives after platform fees and refunds. Exact percentages are set in your signed revenue share agreement and are discussed openly with the whole team.',
            ],
          },
          {
            heading: 'Payout schedule',
            bullets: [
              'Payouts happen monthly, after platform funds actually arrive.',
              'Every payout comes with a statement showing sales, fees, refunds, and your share.',
              'Statements and paystubs are available in your Account under Pay & Paystubs.',
            ],
          },
          {
            heading: 'Transition to salary',
            body: [
              'The studio will move from revenue share to annual salaries once it can reliably pay everyone, even in a slow year. That means hitting both a 12-month net revenue target and a savings reserve covering a full year of costs. Starting salaries are planned to sit a bit above typical entry-level game industry pay. You keep your revenue share on titles released before the switch.',
            ],
          },
          {
            heading: 'Taxes',
            body: [
              'Collaborators on revenue share are responsible for their own taxes and will receive a 1099 form each year. Once on salary, taxes are withheld through payroll and you will receive a W-2.',
            ],
          },
        ],
      },
      {
        id: 'bonuses',
        title: 'Launch Bonuses (PLB & OLP)',
        sections: [
          {
            body: [
              'Launch bonuses are paid on top of regular pay and are based on each game\'s net revenue in its first 30 days, compared to the projection set before launch.',
            ],
          },
          {
            bullets: [
              'Below projection: no bonus for that launch. The studio cannot afford a fair bonus for everyone.',
              'PLB (Projected Launch Bonus): the launch meets its projection, and everyone on the title receives the base bonus.',
              'OLP (Outperformed-Launch-Projection): the launch beats its projection, and everyone on the title receives the upgraded bonus.',
              'Bonuses are paid around 60 days after release, once platform funds arrive.',
              'Bonuses are taxed as regular income.',
            ],
          },
        ],
      },
      {
        id: 'benefits',
        title: 'Benefits',
        sections: [
          {
            body: [
              'Benefits begin once the studio transitions to salaried roles. The studio plans to offer vision coverage at minimum. Additional benefits will be added as the studio grows and will be written into this handbook before they start.',
            ],
          },
        ],
      },
      {
        id: 'expenses',
        title: 'Expenses & Reimbursement',
        sections: [
          {
            bullets: [
              'Get approval from Cody or Business Operations before spending money on behalf of the studio.',
              'Keep receipts for everything and submit them within 30 days.',
              'Approved expenses are reimbursed in the next payout cycle.',
              'Personal expenses are never charged to studio accounts.',
            ],
          },
        ],
      },
      {
        id: 'growth',
        title: 'Growth, Promotions & Role Changes',
        sections: [
          {
            body: [
              'As the studio grows and brings in more income, new opportunities open up, including switching roles, cross-training into new areas, and moving into lead positions.',
            ],
          },
          {
            bullets: [
              'Growth is based on consistency, quality, and helping the team, not hours worked.',
              'You can request a role change or express interest in a lead role at any time.',
              'Required engine training pathways must be completed for engine-based roles.',
              'Optional certifications are encouraged for your own growth but are not paid for by the studio.',
            ],
          },
        ],
      },
      {
        id: 'recognition',
        title: 'Credits & Recognition',
        sections: [
          {
            bullets: [
              'Everyone who contributes to a game is credited in that game.',
              'Team members who stay with the studio for 6 months get their own dev artifact added into a shipped game.',
              'Every game uses the studio\'s Milestones achievement system, and team members are recognized in its design where appropriate.',
              'Wins get shared with the whole team, publicly when possible.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part VIII: Performance & Accountability',
    articles: [
      {
        id: 'performance',
        title: 'Performance & Feedback',
        sections: [
          {
            bullets: [
              'Feedback is given regularly and honestly, in both directions. You are encouraged to give feedback to Cody too.',
              'Performance check-ins happen about every 6 months, focused on growth, not punishment.',
              'If something is not working, you will hear about it early and privately, with a clear path to fix it.',
            ],
          },
        ],
      },
      {
        id: 'corrective',
        title: 'Corrective Action',
        sections: [
          {
            body: [
              'Most issues are solved with a simple conversation. When they are not, the studio follows these steps:',
            ],
          },
          {
            bullets: [
              'Step 1: A private conversation about the issue and how to fix it.',
              'Step 2: A written note in the portal with clear expectations and a timeline.',
              'Step 3: A final written warning.',
              'Step 4: Removal from the team.',
            ],
          },
          {
            body: [
              'Serious violations, including harassment, threats, theft, or leaking confidential information, may skip straight to removal.',
            ],
          },
        ],
      },
      {
        id: 'disputes',
        title: 'Resolving Disagreements',
        sections: [
          {
            bullets: [
              'Try talking it out directly and respectfully first.',
              'If that does not work, bring it to Cody (or Business Operations if it involves Cody).',
              'Creative disagreements are healthy. Final creative calls are made by the Creative Director, and the reasoning will be explained.',
              'Never take a disagreement public.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part IX: Wellbeing & Safety',
    articles: [
      {
        id: 'wellbeing',
        title: 'Health & Wellbeing',
        sections: [
          {
            bullets: [
              'Take regular breaks, especially during long sessions.',
              'Set up a comfortable workspace: good chair, screen at eye level, and decent lighting.',
              'Rest your eyes using the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
              'If studio work is stressing you out, say so. Workload can always be adjusted.',
              'Mental health days are real days off. Take them when you need them.',
            ],
          },
        ],
      },
      {
        id: 'events',
        title: 'In-Person Events & Travel',
        sections: [
          {
            bullets: [
              'Every policy in this handbook applies at in-person events, conventions, and studio meetups.',
              'Approved travel costs for studio events will be covered or reimbursed.',
              'Look out for each other at events. If anyone feels unsafe or uncomfortable, they can leave, and they should tell Cody.',
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Part X: Leaving & Changes',
    articles: [
      {
        id: 'leaving',
        title: 'Leaving the Studio',
        sections: [
          {
            bullets: [
              'If you decide to leave, please give as much notice as you can, ideally two weeks.',
              'Hand off or document any active tasks so nothing gets lost.',
              'Return any studio equipment and give back access to all studio accounts.',
              'You keep your revenue share on titles you worked on that released before you left, according to your agreement.',
              'Your credits in games you worked on stay.',
              'Confidentiality and IP terms continue after you leave.',
              'Leaving on good terms means the door stays open to come back.',
            ],
          },
        ],
      },
      {
        id: 'changes',
        title: 'Changes to This Handbook',
        sections: [
          {
            body: [
              'This handbook will grow and change along with the studio. When a policy changes, the version number goes up, the change is listed in the changelog, and everyone is asked to read and acknowledge the new version.',
              'Important changes, especially to pay, bonuses, or benefits, will be discussed with the team before they take effect.',
            ],
          },
        ],
      },
      {
        id: 'acknowledgement',
        title: 'Acknowledgement',
        sections: [
          {
            body: [
              'By checking the box at the bottom of this page, you confirm that you have read this handbook, understand it, and agree to follow it. If you have questions about anything, ask before acknowledging.',
            ],
          },
        ],
      },
    ],
  },
]

export const changelog: [string, string, string][] = [
  ['v1.0', 'Oct 2026', 'First full studio handbook published'],
]