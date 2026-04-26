export function scoreToGrade(score: number): string {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export function scoreToComment(grade: string): string {
  switch (grade) {
    case 'A':
      return 'Excellent';
    case 'B':
      return 'Very Good';
    case 'C':
      return 'Good';
    case 'D':
      return 'Fair';
    default:
      return 'Needs improvement';
  }
}

export function gradeToPoint(grade: string): number {
  const map: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, F: 1 };
  return map[grade] ?? 0;
}

export function decimalToNumber(value: { toString(): string } | number): number {
  if (typeof value === 'number') return value;
  return Number(value.toString());
}
