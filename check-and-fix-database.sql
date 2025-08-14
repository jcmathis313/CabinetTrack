-- Check and Fix Database Migration Script
-- This script safely handles the migration from manufacturers to sources

-- Step 1: Check what tables currently exist
SELECT 'Checking existing tables:' as info;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('manufacturers', 'sources', 'orders');

-- Step 2: Check if manufacturers table exists and has data
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'manufacturers' AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'manufacturers table exists - proceeding with rename';
        
        -- Check if sources table already exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'sources' AND table_schema = 'public'
        ) THEN
            RAISE NOTICE 'sources table already exists - dropping it first';
            DROP TABLE sources CASCADE;
        END IF;
        
        -- Rename manufacturers to sources
        ALTER TABLE manufacturers RENAME TO sources;
        RAISE NOTICE 'Successfully renamed manufacturers to sources';
        
    ELSE
        RAISE NOTICE 'manufacturers table does not exist';
        
        -- Check if sources table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'sources' AND table_schema = 'public'
        ) THEN
            RAISE NOTICE 'sources table already exists - no action needed';
        ELSE
            RAISE NOTICE 'Creating new sources table';
            CREATE TABLE sources (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                address TEXT NOT NULL,
                phone_number VARCHAR(50) NOT NULL,
                main_contact VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX idx_sources_organization_id ON sources(organization_id);
            CREATE INDEX idx_sources_name ON sources(name);
            
            RAISE NOTICE 'Successfully created sources table';
        END IF;
    END IF;
END $$;

-- Step 3: Check orders table structure
SELECT 'Checking orders table columns:' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('manufacturer_id', 'source_id')
ORDER BY column_name;

-- Step 4: Handle orders table column migration
DO $$
BEGIN
    -- Check if manufacturer_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'manufacturer_id'
    ) THEN
        RAISE NOTICE 'manufacturer_id column exists - renaming to source_id';
        
        -- Drop existing foreign key constraint if it exists
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_manufacturer_id_fkey;
        
        -- Rename the column
        ALTER TABLE orders RENAME COLUMN manufacturer_id TO source_id;
        
        -- Add new foreign key constraint
        ALTER TABLE orders ADD CONSTRAINT orders_source_id_fkey 
            FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL;
            
        RAISE NOTICE 'Successfully renamed manufacturer_id to source_id';
        
    ELSE
        RAISE NOTICE 'manufacturer_id column does not exist';
        
        -- Check if source_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'source_id'
        ) THEN
            RAISE NOTICE 'source_id column already exists';
        ELSE
            RAISE NOTICE 'Adding source_id column to orders table';
            ALTER TABLE orders ADD COLUMN source_id UUID REFERENCES sources(id) ON DELETE SET NULL;
            RAISE NOTICE 'Successfully added source_id column';
        END IF;
    END IF;
END $$;

-- Step 5: Update indexes
DROP INDEX IF EXISTS idx_orders_manufacturer_id;
CREATE INDEX IF NOT EXISTS idx_orders_source_id ON orders(source_id);

-- Step 6: Verify the final state
SELECT 'Final verification:' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('sources', 'orders')
AND column_name LIKE '%source%' OR column_name LIKE '%manufacturer%'
ORDER BY table_name, column_name;

-- Step 7: Show sample data
SELECT 'Sample data from sources table:' as info;
SELECT COUNT(*) as source_count FROM sources;

SELECT 'Sample data from orders table:' as info;
SELECT COUNT(*) as orders_with_sources FROM orders WHERE source_id IS NOT NULL;
