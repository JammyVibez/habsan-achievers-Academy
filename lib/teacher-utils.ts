// Generate default password for teachers (8 chars: 4 letters + 4 numbers)
export function generateTeacherPassword(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numbers = '0123456789'.split('');
  let password = '';
  
  for (let i = 0; i < 4; i++) {
    password += letters[Math.floor(Math.random() * letters.length)].toLowerCase();
  }
  
  for (let i = 0; i < 4; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  return password;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Validate phone number (basic validation)
export function isValidPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  return /^\d{10,15}$/.test(cleanPhone);
}

/** One row: this teacher takes this subject in this class. */
export type SubjectClassAssignment = {
  subject: string;
  classLevel: string;
};

export interface TeacherCreationData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  /** Homeroom / form class (optional). */
  classAssigned: string;
  /** @deprecated use subjectClassAssignments; kept for backwards compatibility */
  subjectsAssigned?: string[];
  subjectClassAssignments?: SubjectClassAssignment[];
  qualifications?: string;
  employmentDate?: string;
}

export interface TeacherAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  defaultPassword: string;
  classAssigned: string;
  subjectsAssigned: string[];
  createdAt: Date;
  requiresPasswordChange: boolean;
}

// Subject list for Nigerian schools
export const AVAILABLE_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Science',
  'Biology',
  'Chemistry',
  'Physics',
  'History',
  'Geography',
  'Civic Education',
  'Computer Science',
  'Literature in English',
  'French Language',
  'Yoruba Language',
  'Igbo Language',
  'Hausa Language',
  'Physical Education',
  'Music',
  'Visual Arts',
  'Agricultural Science',
  'Economics',
  'Accounting',
  'Commerce',
  'Home Economics',
  'Technical Drawing',
  'Religion Studies',
];

// Class levels
export const CLASS_LEVELS = [
  'JSS 1A', 'JSS 1B', 'JSS 1C',
  'JSS 2A', 'JSS 2B', 'JSS 2C',
  'JSS 3A', 'JSS 3B', 'JSS 3C',
  'SS 1A', 'SS 1B', 'SS 1C',
  'SS 2A', 'SS 2B', 'SS 2C',
  'SS 3A', 'SS 3B', 'SS 3C',
];
