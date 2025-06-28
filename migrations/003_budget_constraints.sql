-- Add unique constraint for budget data
-- This allows proper ON CONFLICT handling for upserts

ALTER TABLE budget_data 
ADD CONSTRAINT unique_budget_entry 
UNIQUE (city, ward_district, fiscal_year, category);