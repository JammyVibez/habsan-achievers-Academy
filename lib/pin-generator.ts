// PIN Code generation utilities

export function generatePINCode(type: "admission" | "result"): string {
  // Generate a 12-character PIN code
  // Format: XXXX-XXXX-XXXX
  const prefix = type === "admission" ? "ADM" : "RES"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()

  const pin = `${prefix}${timestamp}${random}`.substring(0, 12)

  // Format with dashes
  return `${pin.substring(0, 4)}-${pin.substring(4, 8)}-${pin.substring(8, 12)}`
}

export function validatePINFormat(pin: string): boolean {
  // Check if PIN matches format: XXXX-XXXX-XXXX
  const pinRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  return pinRegex.test(pin)
}

export function getPINType(pin: string): "admission" | "result" | null {
  if (!validatePINFormat(pin)) return null
  if (pin.startsWith("ADM")) return "admission"
  if (pin.startsWith("RES")) return "result"
  return null
}

export function calculateExpiryDate(daysFromNow = 90): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

// Check if admin has reached daily quota
export async function checkDailyQuota(
  adminId: string,
  pinType: "admission" | "result",
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  // TODO: Replace with actual database query
  // This should query pin_generation_log table for today's count

  const DAILY_LIMIT = 30
  const todayCount = 0 // This will be fetched from database

  return {
    allowed: todayCount < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - todayCount),
    limit: DAILY_LIMIT,
  }
}
