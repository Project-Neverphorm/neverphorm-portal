const BASE_XP = 300 // XP needed for Level 1
const STEP = 150    // each level after needs this much more

export function getLevelInfo(totalXP: number) {
  let level = 0
  let needed = BASE_XP
  let remaining = totalXP

  while (remaining >= needed) {
    remaining -= needed
    level++
    needed = BASE_XP + STEP * level
  }

  return {
    level,                 // current level
    progress: remaining,   // XP into this level
    needed,                // XP required for next level
    percent: (remaining / needed) * 100,
  }
}