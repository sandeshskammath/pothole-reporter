-- Phase 2 Database Migration
-- Community Pothole Reporter - Civic Engagement Features

-- Representatives contacted tracking
CREATE TABLE IF NOT EXISTS representative_contacts (
  id SERIAL PRIMARY KEY,
  pothole_report_id INTEGER REFERENCES pothole_reports(id),
  representative_name VARCHAR(255) NOT NULL,
  representative_office VARCHAR(255),
  representative_level VARCHAR(50) CHECK (representative_level IN ('federal', 'state', 'local')),
  contact_type VARCHAR(50) CHECK (contact_type IN ('email', 'phone', 'mail', 'social')),
  contact_date TIMESTAMP DEFAULT NOW(),
  user_id INTEGER,
  message_template_used VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Budget tracking data
CREATE TABLE IF NOT EXISTS budget_data (
  id SERIAL PRIMARY KEY,
  city VARCHAR(50) NOT NULL,
  ward_district VARCHAR(50) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  allocated_amount DECIMAL(12, 2) DEFAULT 0,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
  category VARCHAR(100) NOT NULL, -- 'pothole_repair', 'road_maintenance', etc.
  data_source VARCHAR(255),
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance metrics tracking
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  city VARCHAR(50) NOT NULL,
  ward_district VARCHAR(50) NOT NULL,
  metric_type VARCHAR(100) NOT NULL, -- 'avg_repair_time', 'completion_rate', etc.
  metric_value DECIMAL(10, 2) NOT NULL,
  target_value DECIMAL(10, 2),
  metric_date DATE NOT NULL,
  comparison_period VARCHAR(50) DEFAULT 'month', -- 'month', 'quarter', 'year'
  trend VARCHAR(20) DEFAULT 'stable' CHECK (trend IN ('improving', 'declining', 'stable')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community organizations directory
CREATE TABLE IF NOT EXISTS community_organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'nonprofit' CHECK (type IN ('government', 'nonprofit', 'civic_tech', 'advocacy')),
  city VARCHAR(50) NOT NULL,
  address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  focus_areas TEXT[] DEFAULT '{}', -- ['infrastructure', 'civic_engagement', etc.]
  meeting_schedule TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  social_media JSONB DEFAULT '{}', -- {'twitter': '@handle', 'facebook': 'page'}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Community campaigns for collective action
CREATE TABLE IF NOT EXISTS community_campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_area VARCHAR(255) NOT NULL,
  pothole_report_ids INTEGER[] DEFAULT '{}',
  participant_count INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'successful', 'archived')),
  goals JSONB DEFAULT '{}', -- {'reports': 50, 'meeting': true, 'media': true, 'fixed': true}
  target_representatives JSONB DEFAULT '{}',
  milestones JSONB DEFAULT '[]',
  actions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Weather correlation data
CREATE TABLE IF NOT EXISTS weather_events (
  id SERIAL PRIMARY KEY,
  city VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  temp_high DECIMAL(5, 2),
  temp_low DECIMAL(5, 2),
  precipitation DECIMAL(5, 2) DEFAULT 0,
  freeze_thaw_cycle BOOLEAN DEFAULT false,
  freeze_thaw_count INTEGER DEFAULT 0,
  pothole_reports_next_14_days INTEGER DEFAULT 0,
  correlation_calculated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI-generated pothole predictions
CREATE TABLE IF NOT EXISTS pothole_predictions (
  id SERIAL PRIMARY KEY,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  probability_score INTEGER NOT NULL CHECK (probability_score >= 0 AND probability_score <= 100),
  predicted_timeframe VARCHAR(100) NOT NULL,
  risk_factors JSONB NOT NULL DEFAULT '{}',
  preventive_actions TEXT[] DEFAULT '{}',
  model_version VARCHAR(50) DEFAULT 'v1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- When prediction becomes stale
);

-- Success stories for community engagement
CREATE TABLE IF NOT EXISTS success_stories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  before_photo_url VARCHAR(500),
  after_photo_url VARCHAR(500),
  participant_count INTEGER DEFAULT 1,
  report_count INTEGER DEFAULT 1,
  days_to_repair INTEGER,
  duration_text VARCHAR(100), -- "2 weeks", "1 month", etc.
  campaign_id INTEGER REFERENCES community_campaigns(id),
  ward_district VARCHAR(50),
  city VARCHAR(50),
  repair_date DATE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User alert preferences
CREATE TABLE IF NOT EXISTS user_alert_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  weather_alerts BOOLEAN DEFAULT true,
  repair_updates BOOLEAN DEFAULT true,
  community_alerts BOOLEAN DEFAULT true,
  email_alerts BOOLEAN DEFAULT true,
  sms_alerts BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  alert_radius_miles INTEGER DEFAULT 5,
  locations JSONB DEFAULT '[]', -- Array of {lat, lng, address}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_rep_contacts_report ON representative_contacts(pothole_report_id);
CREATE INDEX IF NOT EXISTS idx_rep_contacts_date ON representative_contacts(contact_date);
CREATE INDEX IF NOT EXISTS idx_rep_contacts_level ON representative_contacts(representative_level);

CREATE INDEX IF NOT EXISTS idx_budget_ward_year ON budget_data(city, ward_district, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_budget_category ON budget_data(category);
CREATE INDEX IF NOT EXISTS idx_budget_updated ON budget_data(last_updated);

CREATE INDEX IF NOT EXISTS idx_performance_ward_date ON performance_metrics(city, ward_district, metric_date);
CREATE INDEX IF NOT EXISTS idx_performance_type ON performance_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_orgs_city ON community_organizations(city);
CREATE INDEX IF NOT EXISTS idx_orgs_location ON community_organizations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_orgs_type ON community_organizations(type);
CREATE INDEX IF NOT EXISTS idx_orgs_focus ON community_organizations USING GIN(focus_areas);
CREATE INDEX IF NOT EXISTS idx_orgs_active ON community_organizations(is_active);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON community_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON community_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_area ON community_campaigns(target_area);

CREATE INDEX IF NOT EXISTS idx_weather_city_date ON weather_events(city, event_date);
CREATE INDEX IF NOT EXISTS idx_weather_freeze_thaw ON weather_events(freeze_thaw_cycle);

CREATE INDEX IF NOT EXISTS idx_predictions_location ON pothole_predictions(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_predictions_score ON pothole_predictions(probability_score);
CREATE INDEX IF NOT EXISTS idx_predictions_active ON pothole_predictions(is_active);
CREATE INDEX IF NOT EXISTS idx_predictions_expires ON pothole_predictions(expires_at);

CREATE INDEX IF NOT EXISTS idx_success_city ON success_stories(city);
CREATE INDEX IF NOT EXISTS idx_success_featured ON success_stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_success_repair_date ON success_stories(repair_date);

CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON user_alert_preferences(user_id);

-- Add some sample data for Chicago organizations
INSERT INTO community_organizations (name, type, city, address, contact_phone, focus_areas, meeting_schedule, latitude, longitude, description) VALUES
('Englewood Community Service Center', 'government', 'Chicago', '1140 W. 79th Street, Chicago, IL 60621', '311', ARRAY['social_services', 'emergency_assistance'], 'Monday-Friday, 9 AM - 5 PM', 41.7505, -87.6563, 'DFSS center providing resources and warming/cooling center'),
('Dr. Martin Luther King Jr. Community Service Center', 'government', 'Chicago', '4314 South Cottage Grove, Chicago, IL 60653', '312-747-2300', ARRAY['social_services', 'job_training'], 'Monday-Friday, 9 AM - 5 PM', 41.8157, -87.6067, 'Full-service DFSS community center'),
('Chi Hack Night', 'civic_tech', 'Chicago', '222 W Merchandise Mart Plaza, Chicago, IL 60654', NULL, ARRAY['civic_tech', 'open_data', 'community_engagement'], 'Tuesdays, 6 PM', 41.8885, -87.6354, 'Weekly civic tech meetup'),
('Smart Chicago Collaborative', 'civic_tech', 'Chicago', 'Chicago, IL', NULL, ARRAY['digital_equity', 'civic_tech', 'data_access'], 'Various events', 41.8781, -87.6298, 'Improving lives through technology')
ON CONFLICT DO NOTHING;

-- Add sample performance targets for Chicago
INSERT INTO performance_metrics (city, ward_district, metric_type, metric_value, target_value, metric_date, comparison_period) VALUES
('Chicago', 'All Wards', 'avg_repair_time_days', 8.5, 7.0, CURRENT_DATE - INTERVAL '1 month', 'month'),
('Chicago', 'All Wards', 'completion_rate_percent', 92.3, 95.0, CURRENT_DATE - INTERVAL '1 month', 'month'),
('Chicago', 'All Wards', 'cost_per_repair_dollars', 165.00, 150.00, CURRENT_DATE - INTERVAL '1 month', 'month')
ON CONFLICT DO NOTHING;

-- Add sample budget data for Chicago
INSERT INTO budget_data (city, ward_district, fiscal_year, allocated_amount, spent_amount, category, data_source) VALUES
('Chicago', 'All Wards', 2025, 15000000.00, 8500000.00, 'pothole_repair', 'Chicago Data Portal'),
('Chicago', 'All Wards', 2025, 45000000.00, 22000000.00, 'road_maintenance', 'Chicago Data Portal'),
('Chicago', 'Ward 1', 2025, 300000.00, 165000.00, 'pothole_repair', 'Chicago Data Portal')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE representative_contacts IS 'Tracks when users contact their representatives about pothole issues';
COMMENT ON TABLE budget_data IS 'City budget allocations and spending for road maintenance';
COMMENT ON TABLE performance_metrics IS 'Government performance tracking for accountability';
COMMENT ON TABLE community_organizations IS 'Directory of local organizations that can help with civic engagement';
COMMENT ON TABLE community_campaigns IS 'User-created campaigns for collective action';
COMMENT ON TABLE weather_events IS 'Weather data for correlation with pothole formation';
COMMENT ON TABLE pothole_predictions IS 'AI-generated predictions of future pothole locations';
COMMENT ON TABLE success_stories IS 'Success stories to inspire community engagement';
COMMENT ON TABLE user_alert_preferences IS 'User preferences for various types of alerts and notifications';