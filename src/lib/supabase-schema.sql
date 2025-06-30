-- Optimized Supabase schema for pothole reporter
-- Designed to minimize bandwidth usage

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create pothole_reports table with optimized structure
CREATE TABLE IF NOT EXISTS pothole_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(9, 6) NOT NULL, -- Reduced precision to save space
  longitude DECIMAL(9, 6) NOT NULL, -- Reduced precision to save space
  photo_url TEXT NOT NULL, -- External URLs only, no base64
  notes TEXT,
  status VARCHAR(15) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'fixed')),
  confirmations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimized indexes
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

-- Row Level Security policies (optional, for future user auth)
-- ALTER TABLE pothole_reports ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read access" ON pothole_reports FOR SELECT USING (true);
-- CREATE POLICY "Public insert access" ON pothole_reports FOR INSERT WITH CHECK (true);

-- Sample data with small efficient images
INSERT INTO pothole_reports (latitude, longitude, photo_url, notes, status, confirmations) VALUES 
  (37.774900, -122.419400, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkRlbW8gUG90aG9sZTwvdGV4dD48L3N2Zz4=', 'Demo pothole near downtown', 'reported', 2),
  (37.784900, -122.409400, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkluIFByb2dyZXNzPC90ZXh0Pjwvc3ZnPg==', 'Road damage on main street', 'in_progress', 5),
  (37.764900, -122.429400, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPkZpeGVkPC90ZXh0Pjwvc3ZnPg==', 'Fixed pothole - great job!', 'fixed', 3)
ON CONFLICT (id) DO NOTHING;