-- Complete Supabase Migration Script for Pothole Reporter
-- Run this in your Supabase SQL Editor

-- Enable PostGIS extension for geographic functions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create pothole_reports table
CREATE TABLE IF NOT EXISTS pothole_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(9, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,
  photo_url TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(15) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'fixed')),
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_pothole_reports_location ON pothole_reports USING GIST (point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_pothole_reports_created_at ON pothole_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pothole_reports_status ON pothole_reports (status);

-- Enable real-time for efficient updates
ALTER PUBLICATION supabase_realtime ADD TABLE pothole_reports;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pothole_reports_updated_at
    BEFORE UPDATE ON pothole_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to find nearby reports (used by your app)
CREATE OR REPLACE FUNCTION find_nearby_reports(
    lat DECIMAL,
    lng DECIMAL,
    radius_meters INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    latitude DECIMAL,
    longitude DECIMAL,
    photo_url TEXT,
    notes TEXT,
    status VARCHAR,
    confirmations INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id,
        pr.latitude,
        pr.longitude,
        pr.photo_url,
        pr.notes,
        pr.status,
        pr.confirmations,
        pr.created_at,
        pr.updated_at
    FROM pothole_reports pr
    WHERE ST_DWithin(
        ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'),
        ST_GeogFromText('POINT(' || pr.longitude || ' ' || pr.latitude || ')'),
        radius_meters
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to increment confirmations (used by your app)
CREATE OR REPLACE FUNCTION increment_confirmations(report_id UUID)
RETURNS TABLE (
    id UUID,
    latitude DECIMAL,
    longitude DECIMAL,
    photo_url TEXT,
    notes TEXT,
    status VARCHAR,
    confirmations INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    UPDATE pothole_reports 
    SET confirmations = confirmations + 1,
        updated_at = NOW()
    WHERE pothole_reports.id = report_id;
    
    RETURN QUERY
    SELECT 
        pr.id,
        pr.latitude,
        pr.longitude,
        pr.photo_url,
        pr.notes,
        pr.status,
        pr.confirmations,
        pr.created_at,
        pr.updated_at
    FROM pothole_reports pr
    WHERE pr.id = report_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get report statistics (used by your app)
CREATE OR REPLACE FUNCTION get_report_stats()
RETURNS TABLE (
    total_reports BIGINT,
    reported_reports BIGINT,
    in_progress_reports BIGINT,
    fixed_reports BIGINT,
    active_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'reported') as reported_reports,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_reports,
        COUNT(*) FILTER (WHERE status = 'fixed') as fixed_reports,
        GREATEST(1, DATE_PART('day', NOW() - MIN(created_at))::BIGINT) as active_days
    FROM pothole_reports;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO pothole_reports (latitude, longitude, photo_url, notes, status, confirmations) VALUES 
  (37.774900, -122.419400, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkRlbW8gUG90aG9sZTwvdGV4dD48L3N2Zz4=', 'Demo pothole near downtown', 'reported', 2),
  (37.784900, -122.409400, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==', 'Road damage on main street', 'in_progress', 5),
  (37.764900, -122.429400, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==', 'Fixed pothole - great job!', 'fixed', 3)
ON CONFLICT (id) DO NOTHING;

-- Verify setup
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as sample_reports_count FROM pothole_reports;