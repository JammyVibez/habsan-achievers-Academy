-- HABSAN ACHIEVERS ACADEMY Database Schema
-- Version 1: Initial table creation

-- Users table (for all user types: admin, teacher, student, guest)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student', 'guest') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Students table (extended profile for students)
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  class_level ENUM('Pre-Nursery', 'Nursery 1', 'Nursery 2', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3') NOT NULL,
  section VARCHAR(10),
  date_of_birth DATE NOT NULL,
  gender ENUM('Male', 'Female') NOT NULL,
  address TEXT,
  parent_guardian_name VARCHAR(200) NOT NULL,
  parent_guardian_phone VARCHAR(20) NOT NULL,
  parent_guardian_email VARCHAR(255),
  emergency_contact VARCHAR(20),
  blood_group VARCHAR(5),
  medical_conditions TEXT,
  admission_date DATE NOT NULL,
  status ENUM('active', 'suspended', 'graduated', 'withdrawn') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admission_number (admission_number),
  INDEX idx_class_level (class_level),
  INDEX idx_status (status)
);

-- Teachers table (extended profile for teachers)
CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  staff_id VARCHAR(50) UNIQUE NOT NULL,
  qualification VARCHAR(255),
  specialization VARCHAR(255),
  date_of_joining DATE NOT NULL,
  employment_type ENUM('full-time', 'part-time', 'contract') DEFAULT 'full-time',
  salary DECIMAL(10, 2),
  address TEXT,
  emergency_contact VARCHAR(20),
  status ENUM('active', 'on-leave', 'terminated') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_staff_id (staff_id),
  INDEX idx_status (status)
);

-- PIN Codes table (for admission and result checking)
CREATE TABLE IF NOT EXISTS pin_codes (
  id VARCHAR(36) PRIMARY KEY,
  pin_code VARCHAR(20) UNIQUE NOT NULL,
  pin_type ENUM('admission', 'result') NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by VARCHAR(36),
  used_at TIMESTAMP NULL,
  generated_by VARCHAR(36) NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_pin_code (pin_code),
  INDEX idx_pin_type (pin_type),
  INDEX idx_is_used (is_used),
  FOREIGN KEY (generated_by) REFERENCES users(id),
  FOREIGN KEY (used_by) REFERENCES users(id)
);

-- PIN Generation Log (to track daily quota)
CREATE TABLE IF NOT EXISTS pin_generation_log (
  id VARCHAR(36) PRIMARY KEY,
  admin_id VARCHAR(36) NOT NULL,
  pin_type ENUM('admission', 'result') NOT NULL,
  count INT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  INDEX idx_admin_date (admin_id, generated_at),
  INDEX idx_pin_type (pin_type)
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  class_levels JSON NOT NULL, -- Array of applicable class levels
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_is_active (is_active)
);

-- Academic Sessions table
CREATE TABLE IF NOT EXISTS academic_sessions (
  id VARCHAR(36) PRIMARY KEY,
  session_name VARCHAR(50) NOT NULL, -- e.g., "2024/2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_current (is_current)
);

-- Terms table
CREATE TABLE IF NOT EXISTS terms (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  term_name ENUM('First Term', 'Second Term', 'Third Term') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES academic_sessions(id) ON DELETE CASCADE,
  INDEX idx_is_current (is_current)
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  subject_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(36) NOT NULL,
  term_id VARCHAR(36) NOT NULL,
  ca1 DECIMAL(5, 2) DEFAULT 0,
  ca2 DECIMAL(5, 2) DEFAULT 0,
  exam DECIMAL(5, 2) DEFAULT 0,
  total DECIMAL(5, 2) GENERATED ALWAYS AS (ca1 + ca2 + exam) STORED,
  grade VARCHAR(2),
  remark TEXT,
  teacher_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (session_id) REFERENCES academic_sessions(id),
  FOREIGN KEY (term_id) REFERENCES terms(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  UNIQUE KEY unique_result (student_id, subject_id, session_id, term_id),
  INDEX idx_student_term (student_id, term_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  remarks TEXT,
  marked_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE KEY unique_attendance (student_id, date),
  INDEX idx_student_date (student_id, date)
);

-- Noticeboard table
CREATE TABLE IF NOT EXISTS notices (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience ENUM('all', 'students', 'teachers', 'parents', 'specific-class') NOT NULL,
  target_class VARCHAR(50), -- If target_audience is 'specific-class'
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_target_audience (target_audience),
  INDEX idx_is_published (is_published),
  INDEX idx_published_at (published_at)
);

-- Marketplace Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('uniform', 'books', 'stationery', 'sports', 'other') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_is_available (is_available)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_reference VARCHAR(255),
  delivery_address TEXT,
  delivery_phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_order_number (order_number),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_order_id (order_id)
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender_receiver (sender_id, receiver_id),
  INDEX idx_created_at (created_at)
);

-- CMS Content table (for editable landing page content)
CREATE TABLE IF NOT EXISTS cms_content (
  id VARCHAR(36) PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'hero_carousel', 'principal_message', 'about_us'
  content JSON NOT NULL, -- Flexible JSON structure for different content types
  is_active BOOLEAN DEFAULT TRUE,
  updated_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_section_key (section_key)
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
);
