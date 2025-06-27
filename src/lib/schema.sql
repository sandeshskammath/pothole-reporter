-- Community Pothole Reporter Database Schema
-- This file contains the database schema for the pothole reporting system

-- Create the main pothole_reports table
CREATE TABLE IF NOT EXISTS pothole_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  photo_url TEXT NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'fixed')),
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on location for geospatial queries
CREATE INDEX IF NOT EXISTS idx_pothole_reports_location ON pothole_reports (latitude, longitude);

-- Create an index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_pothole_reports_created_at ON pothole_reports (created_at DESC);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_pothole_reports_status ON pothole_reports (status);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_pothole_reports_updated_at ON pothole_reports;
CREATE TRIGGER update_pothole_reports_updated_at
    BEFORE UPDATE ON pothole_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to group nearby reports (within 20 meters)
-- This will help prevent duplicate reports for the same pothole
CREATE OR REPLACE FUNCTION find_nearby_reports(
    input_lat DECIMAL(10, 8),
    input_lng DECIMAL(11, 8),
    radius_meters INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id,
        pr.latitude,
        pr.longitude,
        (6371000 * acos(
            cos(radians(input_lat)) * 
            cos(radians(pr.latitude)) * 
            cos(radians(pr.longitude) - radians(input_lng)) + 
            sin(radians(input_lat)) * 
            sin(radians(pr.latitude))
        )) as distance_meters
    FROM pothole_reports pr
    WHERE (6371000 * acos(
        cos(radians(input_lat)) * 
        cos(radians(pr.latitude)) * 
        cos(radians(pr.longitude) - radians(input_lng)) + 
        sin(radians(input_lat)) * 
        sin(radians(pr.latitude))
    )) <= radius_meters
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (commented out for production)
/*
INSERT INTO pothole_reports (latitude, longitude, photo_url, notes, status) VALUES
  (41.8781, -87.6298, 'https://example.com/photo1.jpg', 'Large pothole on Michigan Avenue', 'new'),
  (41.8782, -87.6299, 'https://example.com/photo2.jpg', 'Deep hole affecting bike lane', 'confirmed'),
  (41.8880, -87.6300, 'https://example.com/photo3.jpg', 'Pothole near school crossing', 'new');
*/