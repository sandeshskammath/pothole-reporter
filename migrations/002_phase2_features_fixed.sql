-- Phase 2 Database Migration (Fixed)
-- Community Pothole Reporter - Civic Engagement Features

-- Drop existing table if it was partially created
DROP TABLE IF EXISTS representative_contacts;

-- Representatives contacted tracking (Fixed to use UUID)
CREATE TABLE IF NOT EXISTS representative_contacts (
  id SERIAL PRIMARY KEY,
  pothole_report_id UUID REFERENCES pothole_reports(id),
  representative_name VARCHAR(255) NOT NULL,
  representative_office VARCHAR(255),
  representative_level VARCHAR(50) CHECK (representative_level IN ('federal', 'state', 'local')),
  contact_type VARCHAR(50) CHECK (contact_type IN ('email', 'phone', 'mail', 'social')),
  contact_date TIMESTAMP DEFAULT NOW(),
  user_id INTEGER,
  message_template_used VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for the fixed table
CREATE INDEX IF NOT EXISTS idx_rep_contacts_report ON representative_contacts(pothole_report_id);
CREATE INDEX IF NOT EXISTS idx_rep_contacts_date ON representative_contacts(contact_date);
CREATE INDEX IF NOT EXISTS idx_rep_contacts_level ON representative_contacts(representative_level);

-- Add sample success story
INSERT INTO success_stories (title, description, location, participant_count, report_count, days_to_repair, duration_text, ward_district, city, is_featured) VALUES
('Lincoln Park Pothole Victory', 'Community rallied together to fix dangerous pothole that damaged 15+ cars. After 47 residents reported and contacted Alderman Smith, the repair was completed in just 3 days.', 'Lincoln Park, Chicago', 47, 23, 3, '3 days', 'Ward 43', 'Chicago', true),
('Wicker Park Road Safety Campaign', 'Residents organized through social media to document and report 12 potholes along Division Street. All were repaired within 2 weeks after coordinated outreach.', 'Wicker Park, Chicago', 32, 18, 14, '2 weeks', 'Ward 1', 'Chicago', true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE representative_contacts IS 'Tracks when users contact their representatives about pothole issues (Fixed UUID reference)';