export type UpdateEntry = {
    date: string
    title: string
    changes: string[]
  }
  
  // Newest at the top
  export const UPDATES: UpdateEntry[] = [
    {
      date: '2026-10-04',
      title: 'Task descriptions',
      changes: [
        'Tasks can now have a longer description',
        'Click a task name to expand and read its description',
      ],
    },
  ]
  