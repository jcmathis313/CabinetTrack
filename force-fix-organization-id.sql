-- Force Fix Missing organization_id Columns
-- Run this in your Supabase SQL Editor

-- First, let's check what columns currently exist
SELECT 'Current manufacturers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'manufacturers' ORDER BY column_name;

SELECT 'Current designers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'designers' ORDER BY column_name;

SELECT 'Current drivers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'drivers' ORDER BY column_name;

-- Drop and recreate manufacturers table with correct structure
DROP TABLE IF EXISTS manufacturers CASCADE;
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  main_contact VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate designers table with correct structure
DROP TABLE IF EXISTS designers CASCADE;
CREATE TABLE designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate drivers table with correct structure
DROP TABLE IF EXISTS drivers CASCADE;
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  vehicle VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_manufacturers_organization_id ON manufacturers(organization_id);
CREATE INDEX idx_manufacturers_name ON manufacturers(name);

CREATE INDEX idx_designers_organization_id ON designers(organization_id);
CREATE INDEX idx_designers_name ON designers(name);

CREATE INDEX idx_drivers_organization_id ON drivers(organization_id);
CREATE INDEX idx_drivers_name ON drivers(name);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designers_updated_at BEFORE UPDATE ON designers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the tables were created correctly
SELECT 'New manufacturers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'manufacturers' ORDER BY column_name;

SELECT 'New designers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'designers' ORDER BY column_name;

SELECT 'New drivers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'drivers' ORDER BY column_name;
