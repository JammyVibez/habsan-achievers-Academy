-- Seed initial data for HABSAN ACHIEVERS ACADEMY
-- Version 1: Create default admin and sample data

-- Insert default admin user (password: Admin@123 - should be changed immediately)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
VALUES (
  UUID(),
  'admin@habsan.edu.ng',
  '$2a$10$rKZLvXZvXZvXZvXZvXZvXeO8YqKqKqKqKqKqKqKqKqKqKqKqKqKq', -- This is a placeholder hash
  'admin',
  'System',
  'Administrator',
  '+234-XXX-XXX-XXXX',
  TRUE
);

-- Insert current academic session
INSERT INTO academic_sessions (id, session_name, start_date, end_date, is_current)
VALUES (
  UUID(),
  '2024/2025',
  '2024-09-01',
  '2025-07-31',
  TRUE
);

-- Insert terms for current session
SET @session_id = (SELECT id FROM academic_sessions WHERE session_name = '2024/2025' LIMIT 1);

INSERT INTO terms (id, session_id, term_name, start_date, end_date, is_current)
VALUES 
  (UUID(), @session_id, 'First Term', '2024-09-01', '2024-12-20', TRUE),
  (UUID(), @session_id, 'Second Term', '2025-01-06', '2025-04-10', FALSE),
  (UUID(), @session_id, 'Third Term', '2025-04-21', '2025-07-31', FALSE);

-- Insert common subjects
INSERT INTO subjects (id, name, code, description, class_levels, is_active)
VALUES
  (UUID(), 'Mathematics', 'MATH', 'Mathematics', '["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]', TRUE),
  (UUID(), 'English Language', 'ENG', 'English Language', '["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]', TRUE),
  (UUID(), 'Basic Science', 'BSC', 'Basic Science and Technology', '["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3"]', TRUE),
  (UUID(), 'Social Studies', 'SST', 'Social Studies', '["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3"]', TRUE),
  (UUID(), 'Physics', 'PHY', 'Physics', '["SS 1", "SS 2", "SS 3"]', TRUE),
  (UUID(), 'Chemistry', 'CHE', 'Chemistry', '["SS 1", "SS 2", "SS 3"]', TRUE),
  (UUID(), 'Biology', 'BIO', 'Biology', '["SS 1", "SS 2", "SS 3"]', TRUE),
  (UUID(), 'Economics', 'ECO', 'Economics', '["SS 1", "SS 2", "SS 3"]', TRUE),
  (UUID(), 'Government', 'GOV', 'Government', '["SS 1", "SS 2", "SS 3"]', TRUE),
  (UUID(), 'Literature in English', 'LIT', 'Literature in English', '["SS 1", "SS 2", "SS 3"]', TRUE);

-- Insert default CMS content for landing page
INSERT INTO cms_content (id, section_key, content, is_active)
VALUES
  (UUID(), 'hero_carousel', JSON_OBJECT(
    'slides', JSON_ARRAY(
      JSON_OBJECT('title', 'Welcome to HABSAN ACHIEVERS ACADEMY', 'subtitle', 'Nurturing Excellence, Building Future Leaders', 'image', '/placeholder.svg?height=600&width=1200'),
      JSON_OBJECT('title', 'Quality Education for All', 'subtitle', 'From Pre-Nursery to Secondary School', 'image', '/placeholder.svg?height=600&width=1200'),
      JSON_OBJECT('title', 'Join Our Community', 'subtitle', 'Admissions Now Open for 2024/2025 Session', 'image', '/placeholder.svg?height=600&width=1200')
    )
  ), TRUE),
  (UUID(), 'principal_message', JSON_OBJECT(
    'title', 'Message from the Principal',
    'name', 'Dr. Ibrahim Hassan',
    'message', 'Welcome to HABSAN ACHIEVERS ACADEMY, where we are committed to providing quality education that nurtures the whole child. Our dedicated staff and modern facilities create an environment where students can thrive academically, socially, and morally.',
    'image', '/placeholder.svg?height=400&width=400'
  ), TRUE),
  (UUID(), 'about_us', JSON_OBJECT(
    'title', 'About HABSAN ACHIEVERS ACADEMY',
    'content', 'HABSAN ACHIEVERS ACADEMY (H.A.A) is a leading educational institution committed to academic excellence and character development. We offer comprehensive education from Pre-Nursery through Secondary School (SS3), following the Nigerian curriculum with modern teaching methodologies.',
    'mission', 'To provide quality education that develops the intellectual, physical, social, and moral capacities of our students.',
    'vision', 'To be the leading educational institution in Nigeria, producing well-rounded individuals who contribute positively to society.'
  ), TRUE),
  (UUID(), 'contact_info', JSON_OBJECT(
    'address', 'Plot 123, Education Avenue, Abuja, Nigeria',
    'phone', '+234-XXX-XXX-XXXX',
    'email', 'info@habsan.edu.ng',
    'office_hours', 'Monday - Friday: 8:00 AM - 4:00 PM'
  ), TRUE);
