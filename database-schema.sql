-- CabinetTrack Multi-Tenant SaaS Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table (top-level tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  subscription_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(20) NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_history table
CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (organization members)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email),
  UNIQUE(organization_id, username)
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create independent tables with organization_id
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

CREATE TABLE designers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create organizational_settings table (one per organization)
CREATE TABLE organizational_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL DEFAULT '',
  company_address TEXT NOT NULL DEFAULT '',
  company_phone VARCHAR(50) NOT NULL DEFAULT '',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Create pickups table (depends on drivers)
CREATE TABLE pickups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  orders TEXT[], -- Array of order IDs
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table last (depends on manufacturers, designers, pickups)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_plan ON organizations(plan);

CREATE INDEX idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX idx_subscription_plans_price ON subscription_plans(price);

CREATE INDEX idx_billing_history_organization_id ON billing_history(organization_id);
CREATE INDEX idx_billing_history_billing_date ON billing_history(billing_date);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

CREATE INDEX idx_manufacturers_organization_id ON manufacturers(organization_id);
CREATE INDEX idx_manufacturers_name ON manufacturers(name);

CREATE INDEX idx_designers_organization_id ON designers(organization_id);
CREATE INDEX idx_designers_name ON designers(name);

CREATE INDEX idx_drivers_organization_id ON drivers(organization_id);
CREATE INDEX idx_drivers_name ON drivers(name);

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
CREATE INDEX idx_orders_pickup_id ON pickups(id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pickups_updated_at BEFORE UPDATE ON pickups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designers_updated_at BEFORE UPDATE ON designers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizational_settings_updated_at BEFORE UPDATE ON organizational_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizational_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations table
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own organization" ON organizations
  FOR UPDATE USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Allow organization creation during signup (temporary policy for development)
CREATE POLICY "Allow organization creation" ON organizations
  FOR INSERT WITH CHECK (true);

-- Alternative: More restrictive policy for production
-- CREATE POLICY "Allow organization creation with valid data" ON organizations
--   FOR INSERT WITH CHECK (
--     name IS NOT NULL AND 
--     slug IS NOT NULL AND 
--     slug ~ '^[a-z0-9-]+$'
--   );

-- Create RLS policies for subscription_plans table (public read access)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (true);

-- Create RLS policies for billing_history table
CREATE POLICY "Users can view their organization's billing history" ON billing_history
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Create RLS policies for users table
CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update users in their organization" ON users
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert users in their organization" ON users
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Allow user creation during signup (temporary policy for development)
CREATE POLICY "Allow user creation during signup" ON users
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for manufacturers table
CREATE POLICY "Users can view manufacturers in their organization" ON manufacturers
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert manufacturers in their organization" ON manufacturers
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update manufacturers in their organization" ON manufacturers
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete manufacturers in their organization" ON manufacturers
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Create RLS policies for designers table
CREATE POLICY "Users can view designers in their organization" ON designers
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert designers in their organization" ON designers
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update designers in their organization" ON designers
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete designers in their organization" ON designers
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Create RLS policies for drivers table
CREATE POLICY "Users can view drivers in their organization" ON drivers
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert drivers in their organization" ON drivers
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update drivers in their organization" ON drivers
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete drivers in their organization" ON drivers
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Create RLS policies for organizational_settings table
CREATE POLICY "Users can view their organization settings" ON organizational_settings
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization settings" ON organizational_settings
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Allow organizational settings creation during signup (temporary policy for development)
CREATE POLICY "Allow organizational settings creation" ON organizational_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert their organization settings" ON organizational_settings
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Create RLS policies for pickups table
CREATE POLICY "Users can view pickups in their organization" ON pickups
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert pickups in their organization" ON pickups
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update pickups in their organization" ON pickups
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete pickups in their organization" ON pickups
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Create RLS policies for orders table
CREATE POLICY "Users can view orders in their organization" ON orders
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert orders in their organization" ON orders
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update orders in their organization" ON orders
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete orders in their organization" ON orders
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, currency, interval, features, is_active) VALUES
('free', 0.00, 'USD', 'month', '{"maxUsers": 3, "maxOrders": 50, "maxPickups": 20, "maxManufacturers": 5, "maxDesigners": 5, "maxDrivers": 3, "advancedReporting": false, "apiAccess": false, "prioritySupport": false, "customBranding": false}', true),
('pro', 29.99, 'USD', 'month', '{"maxUsers": 25, "maxOrders": 1000, "maxPickups": 500, "maxManufacturers": 50, "maxDesigners": 50, "maxDrivers": 25, "advancedReporting": true, "apiAccess": true, "prioritySupport": false, "customBranding": false}', true),
('enterprise', 99.99, 'USD', 'month', '{"maxUsers": -1, "maxOrders": -1, "maxPickups": -1, "maxManufacturers": -1, "maxDesigners": -1, "maxDrivers": -1, "advancedReporting": true, "apiAccess": true, "prioritySupport": true, "customBranding": true}', true)
ON CONFLICT DO NOTHING;

-- Insert default organization
INSERT INTO organizations (name, slug, domain) 
VALUES ('CabinetTrack Demo', 'cabinettrack-demo', 'demo.cabinettrack.com')
ON CONFLICT DO NOTHING;

-- Insert default organizational settings for demo organization
INSERT INTO organizational_settings (organization_id, company_name, company_address, company_phone) 
SELECT id, 'CabinetTrack Demo', 'Your Company Address', 'Your Company Phone'
FROM organizations 
WHERE slug = 'cabinettrack-demo'
ON CONFLICT DO NOTHING;
