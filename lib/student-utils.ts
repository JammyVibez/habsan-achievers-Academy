// Admission Number Format: HAA/YYYY/### (e.g., HAA/2024/001)
export function generateAdmissionNumber(year: number, sequenceNumber: number): string {
  const paddedSequence = String(sequenceNumber).padStart(3, '0');
  return `HAA/${year}/${paddedSequence}`;
}

// Generate default password (8 chars: 4 letters + 4 numbers)
export function generateDefaultPassword(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numbers = '0123456789'.split('');
  let password = '';
  
  // Random 4 letters
  for (let i = 0; i < 4; i++) {
    password += letters[Math.floor(Math.random() * letters.length)].toLowerCase();
  }
  
  // Random 4 numbers
  for (let i = 0; i < 4; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  return password;
}

// Generate student email from name and admission number
export function generateStudentEmail(firstName: string, lastName: string, admissionNumber: string): string {
  const cleanAdmission = admissionNumber.replace(/\//g, '');
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@habsan.edu.ng`;
}

// Validate admission number format
export function isValidAdmissionNumber(admissionNumber: string): boolean {
  const pattern = /^HAA\/\d{4}\/\d{3}$/;
  return pattern.test(admissionNumber);
}

// Extract year from admission number
export function getYearFromAdmissionNumber(admissionNumber: string): number {
  const parts = admissionNumber.split('/');
  return parseInt(parts[1], 10);
}

// Extract sequence from admission number
export function getSequenceFromAdmissionNumber(admissionNumber: string): number {
  const parts = admissionNumber.split('/');
  return parseInt(parts[2], 10);
}

export interface StudentCreationData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  classAssigned: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  medicalInfo?: string;
  /** Defaults to Male if omitted */
  gender?: 'Male' | 'Female';
  parentGuardianName?: string;
}

export interface StudentAccount {
  admissionNumber: string;
  email: string;
  defaultPassword: string;
  firstName: string;
  lastName: string;
  classAssigned: string;
  createdAt: Date;
  requiresPasswordChange: boolean;
}
