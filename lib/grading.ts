// Grading system utilities

export interface GradeScale {
  min: number
  max: number
  grade: string
  remark: string
}

export const NIGERIAN_GRADING_SCALE: GradeScale[] = [
  { min: 80, max: 100, grade: "A", remark: "Excellent" },
  { min: 70, max: 79, grade: "B", remark: "Very Good" },
  { min: 60, max: 69, grade: "C", remark: "Good" },
  { min: 50, max: 59, grade: "D", remark: "Pass" },
  { min: 40, max: 49, grade: "E", remark: "Fair" },
  { min: 0, max: 39, grade: "F", remark: "Fail" },
]

export function calculateGrade(score: number): { grade: string; remark: string } {
  const gradeInfo = NIGERIAN_GRADING_SCALE.find((scale) => score >= scale.min && score <= scale.max)
  return gradeInfo || { grade: "F", remark: "Fail" }
}

export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0
  const sum = scores.reduce((acc, score) => acc + score, 0)
  return sum / scores.length
}

export function determinePosition(studentScore: number, allScores: number[]): number {
  const sortedScores = [...allScores].sort((a, b) => b - a)
  return sortedScores.indexOf(studentScore) + 1
}

export function getPositionSuffix(position: number): string {
  if (position === 1) return "st"
  if (position === 2) return "nd"
  if (position === 3) return "rd"
  return "th"
}
