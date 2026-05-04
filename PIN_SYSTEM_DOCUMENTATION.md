# PIN System Documentation

## Overview
The PIN-based system ensures secure access to school services. Students/parents must purchase PINs before accessing admission applications or result checking.

## System Architecture

### 1. PIN Generation (Admin)
**Location:** `/admin/pins`

Admin can:
- Generate new admission and result checking PINs
- View all generated PINs with status (active, used, expired)
- Track PIN usage statistics
- Set PIN expiration dates (Admission: 365 days, Results: 180 days)

**PIN Format:**
- **Admission PIN:** `ADM{TIMESTAMP}{RANDOM}` formatted as `XXXX-XXXX-XXXX`
- **Result PIN:** `RES{TIMESTAMP}{RANDOM}` formatted as `XXXX-XXXX-XXXX`

### 2. PIN Shop (Students/Parents)
**Location:** `/pin-shop`

Features:
- **Admission PIN** - ₦5,000
  - Valid for 365 days
  - Required to apply for admission
  - One-time use per student
  
- **Result PIN** - ₦2,500
  - Valid for 180 days
  - Allows multiple result checks
  - Download results as PDF

**Payment Integration:**
- Paystack payment processing
- Secure payment link generation
- Real-time payment verification

### 3. Admission Application
**Location:** `/admissions/apply`

Flow:
1. **Step 1:** Enter Admission PIN → Validated against purchased PINs
2. **Step 2:** Student Information
3. **Step 3:** Parent/Guardian Information
4. **Step 4:** Document Upload (6 required documents)
5. **Step 5:** Medical Information
6. **Submit** → Creates student account with auto-generated credentials

**PIN Validation:**
- Checks if PIN exists in `student_pin_purchases` table
- Verifies PIN is active (status = 'active')
- Checks expiration date (expiry_date > NOW())
- Ensures PIN hasn't been used (status != 'used')

### 4. Result Checking
**Location:** `/results`

Flow:
1. Enter Admission Number + Result PIN
2. PIN validated against purchase records
3. Results displayed with:
   - Subject scores and grades
   - GPA and overall grade
   - Attendance summary
   - Conduct grade
4. Download PDF report card

**PDF Report Card Includes:**
- School name and header
- Student information
- Complete results table
- GPA and grades summary
- Attendance record
- Teacher/Principal signature areas

## Database Schema (Supabase)

### student_pin_purchases
```sql
CREATE TABLE student_pin_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email VARCHAR(255) NOT NULL,
  pin VARCHAR(20) NOT NULL UNIQUE,
  pin_type VARCHAR(20) NOT NULL, -- 'admission' or 'result'
  purchase_date TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'used', 'expired'
  payment_status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  payment_method VARCHAR(20), -- 'paystack', 'bank_transfer'
  amount INTEGER NOT NULL, -- in NGN
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pin ON student_pin_purchases(pin);
CREATE INDEX idx_email_type ON student_pin_purchases(student_email, pin_type);
CREATE INDEX idx_expiry ON student_pin_purchases(expiry_date);
```

### admin_pin_generation_log
```sql
CREATE TABLE admin_pin_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  pin_type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  pins_generated TEXT[], -- Array of PINs
  generated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### POST /api/pins/validate
Validates if a PIN is active and owned by student.

**Request:**
```json
{
  "pin": "ADM1-2345-6789",
  "pinType": "admission",
  "studentEmail": "student@example.com"
}
```

**Response:**
```json
{
  "valid": true,
  "pinType": "admission",
  "message": "PIN validated successfully"
}
```

### POST /api/pins/purchase
Initiates PIN purchase and returns payment link.

**Request:**
```json
{
  "studentEmail": "student@example.com",
  "pinType": "admission",
  "paymentMethod": "paystack"
}
```

**Response:**
```json
{
  "success": true,
  "paymentLink": "https://checkout.paystack.com/...",
  "amount": 5000,
  "pinType": "admission"
}
```

### POST /api/results/check
Validates PIN and retrieves student results.

**Request:**
```json
{
  "pin": "RES1-2345-6789",
  "admissionNumber": "HAA/2024/001"
}
```

**Response:**
```json
{
  "results": {
    "studentName": "John Doe",
    "admissionNumber": "HAA/2024/001",
    "className": "SS 3A",
    "results": [...],
    "gpa": 3.8,
    "overallGrade": "A"
  }
}
```

### POST /api/results/download-pdf
Generates and returns PDF report card.

**Request:**
```json
{
  "pin": "RES1-2345-6789",
  "admissionNumber": "HAA/2024/001"
}
```

**Response:** PDF file download

## PIN Pricing (Configurable)

```typescript
PIN_PRICING = {
  admission: {
    price: 5000, // NGN
    validity: 365, // days
    description: "Admission Application PIN Code"
  },
  result: {
    price: 2500, // NGN
    validity: 180, // days
    description: "Result Checking PIN Code"
  }
}
```

## Security Features

1. **PIN Format Validation:** Strict format checking (XXXX-XXXX-XXXX)
2. **PIN Type Verification:** Ensures correct PIN type for intended use
3. **Expiration Checking:** Automatic invalidation after expiry
4. **One-Time Use (Admission):** Admission PINs marked as 'used' after application
5. **Payment Verification:** Paystack integration for secure payments
6. **Database Indexing:** Fast lookups on PIN, email, and expiry date
7. **Audit Logging:** All PIN generation and usage logged
8. **Email Verification:** PIN sent to registered email after purchase

## User Flows

### Student Applying for Admission
1. Visit `/admissions/apply`
2. Enter Admission PIN (from PIN Shop)
3. PIN validated via `/api/pins/validate`
4. Proceed through 5-step application
5. Submit → Account created with admission number

### Student Checking Results
1. Visit `/results`
2. Enter Admission Number + Result PIN
3. PIN validated via `/api/results/check`
4. Results displayed
5. Optional: Download PDF via `/api/results/download-pdf`

### Admin Generating PINs
1. Visit `/admin/pins`
2. Select PIN type (Admission/Result)
3. Enter quantity to generate
4. System generates unique PINs
5. PINs stored in database
6. Admin can distribute via email or manual registration

## TODO Items for Complete Integration

- [ ] Connect all endpoints to Supabase database
- [ ] Implement Paystack payment verification
- [ ] Send PIN codes via email after purchase
- [ ] Create admin PIN distribution system
- [ ] Implement PIN usage statistics dashboard
- [ ] Add PIN resend functionality
- [ ] Create payment receipt PDF generation
- [ ] Implement admin PIN quota enforcement
- [ ] Add SMS notifications for PIN purchase
- [ ] Create PIN redemption code system

## Testing PIN Codes

**Demo Admission PIN:** ADM1-2345-6789
**Demo Result PIN:** RES1-2345-6789
**Demo Admission Number:** HAA/2024/001

These are for testing purposes only and should be replaced with actual database integration.
