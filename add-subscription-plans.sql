-- Add Subscription Plans Table and Data
-- Run this in your Supabase SQL Editor

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  interval VARCHAR(20) NOT NULL DEFAULT 'month',
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price ON subscription_plans(price);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS temporarily for subscription_plans
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price, currency, interval, features, is_active) VALUES
('free', 0.00, 'USD', 'month', '{"maxUsers": 3, "maxOrders": 50, "maxPickups": 20, "maxManufacturers": 5, "maxDesigners": 5, "maxDrivers": 3, "advancedReporting": false, "apiAccess": false, "prioritySupport": false, "customBranding": false}', true),
('pro', 29.99, 'USD', 'month', '{"maxUsers": 25, "maxOrders": 1000, "maxPickups": 500, "maxManufacturers": 50, "maxDesigners": 50, "maxDrivers": 25, "advancedReporting": true, "apiAccess": true, "prioritySupport": false, "customBranding": false}', true),
('enterprise', 99.99, 'USD', 'month', '{"maxUsers": -1, "maxOrders": -1, "maxPickups": -1, "maxManufacturers": -1, "maxDesigners": -1, "maxDrivers": -1, "advancedReporting": true, "apiAccess": true, "prioritySupport": true, "customBranding": true}', true)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  interval = EXCLUDED.interval,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the plans were inserted
SELECT 'Subscription plans created:' as info;
SELECT name, price, currency, interval, is_active FROM subscription_plans ORDER BY price;
