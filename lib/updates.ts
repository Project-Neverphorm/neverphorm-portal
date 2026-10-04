export type UpdateEntry = {
    date: string
    title: string
    changes: string[]
  }
  
  // Newest at the top
  export const UPDATES: UpdateEntry[] = [
    {
      date: '2026-10-04',
      title: 'Education page + task descriptions',
      changes: [
        'Updated the Education page, so that is now fully done and can be explored',
        'Description to the tasks. Now you can click a task name to expand and read its description',
      ],
    },
  ]