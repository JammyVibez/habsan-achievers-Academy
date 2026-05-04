// Authentication utility functions
// This is a placeholder - will be replaced with actual Supabase auth when integration is added

import { isValidAdmissionNumber } from './student-utils'

export interface User {
  id: string
  email: string
  role: "admin" | "teacher" | "student" | "guest"
  first_name: string
  last_name: string
  avatar_url?: string
  admission_number?: string // For students
}

export async function getCurrentUser(): Promise<User | null> {
  // This will be replaced with actual auth check
  // For now, return null (not authenticated)
  return null
}

// Validate if input is admission number format
function isAdmissionNumberInput(input: string): boolean {
  return isValidAdmissionNumber(input)
}

export async function signIn(identifier: string, password: string): Promise<{ user: User | null; error: string | null }> {
  // TODO: Connect to Supabase for actual authentication
  // This will support both email and admission number login
  
  // Check if identifier is admission number or email
  const isAdmissionNumber = isAdmissionNumberInput(identifier)
  
  if (isAdmissionNumber) {
    // TODO: Query Supabase for student by admission_number
    // SELECT * FROM students WHERE admission_number = identifier AND password_hash = hash(password)
    // If found and password matches, return student user object
    // Include admission_number in response
  } else {
    // TODO: Query Supabase for user by email
    // SELECT * FROM users WHERE email = identifier AND password_hash = hash(password)
    // Return user object with appropriate role (admin, teacher, student)
  }
  
  // This will be replaced with actual authentication
  return { user: null, error: "Authentication not yet implemented" }
}

export async function signOut(): Promise<void> {
  // This will be replaced with actual sign out
  console.log("[v0] Signing out")
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin"
}

export function isTeacher(user: User | null): boolean {
  return user?.role === "teacher"
}

export function isStudent(user: User | null): boolean {
  return user?.role === "student"
}
