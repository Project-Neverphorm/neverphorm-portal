// Personal levels
const BASE_XP = 300
const STEP = 150

// Studio levels
const STUDIO_BASE_XP = 1000
const STUDIO_STEP = 500

function calcLevel(totalXP: number, base: number, step: number) {
  let level = 0
  let needed = base
  let remaining = totalXP

  while (remaining >= needed) {
    remaining -= needed
    level++
    needed = base + step * level
  }

  return {
    level,
    progress: remaining,
    needed,
    percent: (remaining / needed) * 100,
  }
}

export function getLevelInfo(totalXP: number) {
  return calcLevel(totalXP, BASE_XP, STEP)
}

export function getStudioLevelInfo(totalXP: number) {
  return calcLevel(totalXP, STUDIO_BASE_XP, STUDIO_STEP)
}