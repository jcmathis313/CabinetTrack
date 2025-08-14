-- Create returns table for managing order returns (FIXED VERSION)
-- This migration adds support for returns functionality with correct data types

-- Check if the table already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'returns'
    ) THEN
        -- Create the returns table with correct data types
        CREATE TABLE returns (
            id BIGSERIAL PRIMARY KEY,
            organization_id BIGINT NOT NULL,
            name TEXT NOT NULL,
            orders JSONB NOT NULL DEFAULT '[]', -- Array of order IDs
            driver_id BIGINT,
            status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'archived')),
            priority TEXT NOT NULL DEFAULT 'standard' CHECK (priority IN ('low', 'standard', 'high', 'urgent')),
            scheduled_date DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add foreign key constraints (only if the referenced tables exist)
        -- Check if organizations table exists and add foreign key
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
            ALTER TABLE returns 
            ADD CONSTRAINT returns_organization_id_fkey 
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if drivers table exists and add foreign key
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers') THEN
            ALTER TABLE returns 
            ADD CONSTRAINT returns_driver_id_fkey 
            FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
        END IF;
        
        -- Create indexes for better performance
        CREATE INDEX idx_returns_organization_id ON returns(organization_id);
        CREATE INDEX idx_returns_status ON returns(status);
        CREATE INDEX idx_returns_driver_id ON returns(driver_id);
        CREATE INDEX idx_returns_scheduled_date ON returns(scheduled_date);
        CREATE INDEX idx_returns_created_at ON returns(created_at);
        
        -- Create GIN index for JSONB orders array
        CREATE INDEX idx_returns_orders ON returns USING GIN (orders);
        
        -- Enable Row Level Security (RLS) if auth schema exists
        IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
            ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
            
            -- Create RLS policies (only if users table exists)
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
                CREATE POLICY "Users can view returns from their organization" ON returns
                    FOR SELECT USING (organization_id IN (
                        SELECT organization_id FROM users WHERE id = auth.uid()
                    ));
                    
                CREATE POLICY "Users can insert returns for their organization" ON returns
                    FOR INSERT WITH CHECK (organization_id IN (
                        SELECT organization_id FROM users WHERE id = auth.uid()
                    ));
                    
                CREATE POLICY "Users can update returns from their organization" ON returns
                    FOR UPDATE USING (organization_id IN (
                        SELECT organization_id FROM users WHERE id = auth.uid()
                    ));
                    
                CREATE POLICY "Users can delete returns from their organization" ON returns
                    FOR DELETE USING (organization_id IN (
                        SELECT organization_id FROM users WHERE id = auth.uid()
                    ));
            END IF;
        END IF;
        
        RAISE NOTICE 'Created returns table with indexes and RLS policies';
    ELSE
        RAISE NOTICE 'returns table already exists';
    END IF;
END $$;

-- Create trigger to update updated_at timestamp (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = 'update_returns_updated_at'
        ) THEN
            CREATE TRIGGER update_returns_updated_at
                BEFORE UPDATE ON returns
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
            
            RAISE NOTICE 'Created update_returns_updated_at trigger';
        ELSE
            RAISE NOTICE 'update_returns_updated_at trigger already exists';
        END IF;
    ELSE
        RAISE NOTICE 'update_updated_at_column function not found, skipping trigger creation';
    END IF;
END $$;

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'returns'
ORDER BY ordinal_position;
