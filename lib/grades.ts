import { calculateGrade } from '@/lib/grading';

/** Nigerian secondary scale (CA + exam total out of 100): A–F including E. */
export function scoreToGrade(score: number): string {
  return calculateGrade(score).grade;
}

export function scoreToComment(grade: string): string {
  return gradeToNigerianRemark(grade);
}

function gradeToNigerianRemark(grade: string): string {
  switch (grade) {
    case 'A':
      return 'Excellent';
    case 'B':
      return 'Very Good';
    case 'C':
      return 'Good';
    case 'D':
      return 'Pass';
    case 'E':
      return 'Fair';
    case 'F':
    default:
      return 'Fail';
  }
}

export function gradeToPoint(grade: string): number {
  const map: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
  return map[grade] ?? 0;
}

export function decimalToNumber(value: { toString(): string } | number): number {
  if (typeof value === 'number') return value;
  return Number(value.toString());
}
