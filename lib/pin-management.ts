// PIN Management - Purchase, Tracking, and Validation

export interface PINData {
  pin: string;
  type: "admission" | "result";
  status: "active" | "used" | "expired";
  createdAt: Date;
  expiryDate: Date;
  usedBy?: string; // Student email or identifier
  usedAt?: Date;
  purchasePrice: number; // in NGN
}

export interface StudentPINPurchase {
  id: string;
  studentEmail: string;
  pinType: "admission" | "result";
  pin: string;
  purchaseDate: Date;
  expiryDate: Date;
  status: "active" | "used" | "expired";
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: "card" | "bank_transfer" | "paystack";
  amount: number;
  usedAt?: Date;
}

// PIN Pricing Configuration
export const PIN_PRICING = {
  admission: {
    price: 5000, // NGN
    currency: "NGN",
    description: "Admission Application PIN Code",
    validity: 365, // days
  },
  result: {
    price: 2500, // NGN
    currency: "NGN",
    description: "Result Checking PIN Code",
    validity: 180, // days
  },
};

// Validate PIN against student's purchased PINs
export async function validateStudentPIN(
  pin: string,
  pinType: "admission" | "result",
  studentEmail: string
): Promise<{ valid: boolean; message: string; usedStatus?: boolean }> {
  // TODO: Query Supabase for student's PIN purchases
  // SELECT * FROM student_pin_purchases WHERE student_email = studentEmail AND pin = pin AND pin_type = pinType
  
  // Check if PIN exists
  // Check if PIN has correct type
  // Check if PIN is not expired
  // Check if PIN hasn't been used already
  
  return {
    valid: false,
    message: "PIN not found or invalid",
  };
}

// Check if student has active/unused PIN
export async function hasActivePIN(
  studentEmail: string,
  pinType: "admission" | "result"
): Promise<boolean> {
  // TODO: Query Supabase
  // SELECT * FROM student_pin_purchases 
  // WHERE student_email = studentEmail 
  // AND pin_type = pinType 
  // AND status = 'active' 
  // AND expiry_date > NOW()
  
  return false;
}

// Mark PIN as used
export async function markPINAsUsed(
  pin: string,
  studentEmail: string,
  pinType: "admission" | "result"
): Promise<boolean> {
  // TODO: Update Supabase
  // UPDATE student_pin_purchases 
  // SET status = 'used', used_at = NOW() 
  // WHERE pin = pin AND student_email = studentEmail AND pin_type = pinType
  
  return true;
}

// Get active PINs for a student
export async function getStudentActivePINs(
  studentEmail: string
): Promise<StudentPINPurchase[]> {
  // TODO: Query Supabase
  // SELECT * FROM student_pin_purchases 
  // WHERE student_email = studentEmail 
  // AND status = 'active' 
  // AND expiry_date > NOW()
  // ORDER BY created_at DESC
  
  return [];
}

// Calculate PIN expiry date
export function calculatePINExpiry(pinType: "admission" | "result"): Date {
  const date = new Date();
  const daysValid = PIN_PRICING[pinType].validity;
  date.setDate(date.getDate() + daysValid);
  return date;
}

// Format price for display
export function formatPINPrice(pinType: "admission" | "result"): string {
  const price = PIN_PRICING[pinType].price;
  return `₦${price.toLocaleString()}`;
}

// Get remaining validity days
export function getRemainingDays(expiryDate: Date): number {
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
