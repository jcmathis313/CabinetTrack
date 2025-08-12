-- Check and Fix Organization Types
-- Run this in your Supabase SQL Editor

-- First, let's check what the organizations table actually looks like
SELECT 'Organizations table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;

-- Check if organizations table has UUID or bigint id
SELECT 'Organizations table id type:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' AND column_name = 'id';

-- Let's recreate the tables with the correct ID type
-- First, drop the tables that depend on organizations
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS designers CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS pickups CASCADE;
DROP TABLE IF EXISTS organizational_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Now let's check if we need to recreate the organizations table
SELECT 'Checking organizations table...' as info;

-- If organizations table has bigint id, we need to fix it
-- Let's create the tables with the correct foreign key type
-- We'll use the same type as the organizations table

-- Create manufacturers table with correct foreign key type
CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  main_contact VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create designers table with correct foreign key type
CREATE TABLE designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table with correct foreign key type
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  vehicle VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table with correct foreign key type
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizational_settings table with correct foreign key type
CREATE TABLE organizational_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL DEFAULT '',
  company_address TEXT NOT NULL DEFAULT '',
  company_phone VARCHAR(50) NOT NULL DEFAULT '',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Create pickups table with correct foreign key type
CREATE TABLE pickups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  orders TEXT[], -- Array of order IDs
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with correct foreign key type
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_name VARCHAR(255) NOT NULL,
  job_number VARCHAR(100) NOT NULL,
  order_number VARCHAR(100) NOT NULL,
  purchase_order VARCHAR(100),
  designer_id UUID REFERENCES designers(id) ON DELETE SET NULL,
  cost DECIMAL(10,2) DEFAULT 0.00,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
  destination_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  pickup_id UUID REFERENCES pickups(id) ON DELETE SET NULL,
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

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_organizational_settings_organization_id ON organizational_settings(organization_id);

CREATE INDEX idx_pickups_organization_id ON pickups(organization_id);
CREATE INDEX idx_pickups_status ON pickups(status);
CREATE INDEX idx_pickups_priority ON pickups(priority);
CREATE INDEX idx_pickups_driver_id ON pickups(driver_id);
CREATE INDEX idx_pickups_scheduled_date ON pickups(scheduled_date);

CREATE INDEX idx_orders_organization_id ON orders(organization_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_priority ON orders(priority);
CREATE INDEX idx_orders_designer_id ON orders(designer_id);
CREATE INDEX idx_orders_manufacturer_id ON orders(manufacturer_id);
CREATE INDEX idx_orders_pickup_id ON orders(pickup_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizational_settings_updated_at BEFORE UPDATE ON organizational_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pickups_updated_at BEFORE UPDATE ON pickups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the tables were created correctly
SELECT 'New manufacturers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'manufacturers' ORDER BY column_name;

SELECT 'New designers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'designers' ORDER BY column_name;

SELECT 'New drivers columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'drivers' ORDER BY column_name;
