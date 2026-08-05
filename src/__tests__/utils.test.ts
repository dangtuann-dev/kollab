import { describe, it, expect } from 'vitest'

export function calculateVelocity(sprintsData: Array<{ committed: number; completed: number }>) {
  if (!sprintsData.length) return 0
  const totalCompleted = sprintsData.reduce((sum, s) => sum + s.completed, 0)
  return Math.round((totalCompleted / sprintsData.length) * 10) / 10
}

export function calculateIdealBurndown(totalPoints: number, totalDays: number) {
  if (totalDays <= 1) return [totalPoints, 0]
  const step = totalPoints / (totalDays - 1)
  return Array.from({ length: totalDays }, (_, i) => Math.max(0, Math.round((totalPoints - i * step) * 10) / 10))
}

describe('Agile PM Analytics Utilities', () => {
  it('should calculate average velocity correctly', () => {
    const sprints = [
      { committed: 20, completed: 15 },
      { committed: 25, completed: 20 },
      { committed: 18, completed: 18 },
    ]
    expect(calculateVelocity(sprints)).toBe(17.7)
  })

  it('should return 0 velocity when no sprints exist', () => {
    expect(calculateVelocity([])).toBe(0)
  })

  it('should generate linear ideal burndown steps from total points to zero', () => {
    const points = 30
    const days = 4
    const idealPath = calculateIdealBurndown(points, days)
    expect(idealPath).toEqual([30, 20, 10, 0])
  })
})
