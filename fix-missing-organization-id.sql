-- Fix Missing organization_id Columns
-- Run this in your Supabase SQL Editor

-- Add organization_id column to manufacturers table
ALTER TABLE manufacturers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id column to designers table  
ALTER TABLE designers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id column to drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id column to pickups table
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id column to organizational_settings table
ALTER TABLE organizational_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Make organization_id NOT NULL for manufacturers (if it doesn't have data yet)
-- ALTER TABLE manufacturers ALTER COLUMN organization_id SET NOT NULL;

-- Make organization_id NOT NULL for designers (if it doesn't have data yet)
-- ALTER TABLE designers ALTER COLUMN organization_id SET NOT NULL;

-- Make organization_id NOT NULL for drivers (if it doesn't have data yet)
-- ALTER TABLE drivers ALTER COLUMN organization_id SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manufacturers_organization_id ON manufacturers(organization_id);
CREATE INDEX IF NOT EXISTS idx_designers_organization_id ON designers(organization_id);
CREATE INDEX IF NOT EXISTS idx_drivers_organization_id ON drivers(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_organization_id ON orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_pickups_organization_id ON pickups(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizational_settings_organization_id ON organizational_settings(organization_id);

-- Verify the columns were added
SELECT 'Manufacturers table columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'manufacturers' ORDER BY column_name;

SELECT 'Designers table columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'designers' ORDER BY column_name;

SELECT 'Drivers table columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'drivers' ORDER BY column_name;
