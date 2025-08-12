-- Migration script to rename manufacturers to sources
-- This script updates the database schema to use "sources" instead of "manufacturers"

-- Step 1: Rename the manufacturers table to sources
ALTER TABLE manufacturers RENAME TO sources;

-- Step 2: Update the orders table to use source_id instead of manufacturer_id
ALTER TABLE orders RENAME COLUMN manufacturer_id TO source_id;

-- Step 3: Update the foreign key constraint on orders table
-- First, drop the existing foreign key constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_manufacturer_id_fkey;

-- Add the new foreign key constraint
ALTER TABLE orders ADD CONSTRAINT orders_source_id_fkey 
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL;

-- Step 4: Update any indexes that reference the old column name
-- Drop the old index if it exists
DROP INDEX IF EXISTS idx_orders_manufacturer_id;

-- Create the new index
CREATE INDEX idx_orders_source_id ON orders(source_id);

-- Step 5: Update the updated_at trigger function to handle the new table name
-- The trigger function should already work, but let's make sure it's applied
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Verify the changes
SELECT 
    'Table renamed successfully' as status,
    COUNT(*) as source_count
FROM sources;

SELECT 
    'Orders table updated' as status,
    COUNT(*) as orders_with_sources
FROM orders 
WHERE source_id IS NOT NULL;

-- Step 7: Show the new table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'sources'
ORDER BY ordinal_position;

-- Step 8: Show the orders table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE '%source%'
ORDER BY ordinal_position;
