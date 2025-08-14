-- Check the actual data types of existing tables
-- This will help us create the correct foreign key constraints

-- Check drivers table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'drivers'
ORDER BY ordinal_position;

-- Check organizations table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Check primary key types
SELECT 
    tc.table_name,
    kcu.column_name,
    c.data_type,
    c.is_nullable
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.columns c 
    ON kcu.table_name = c.table_name 
    AND kcu.column_name = c.column_name
WHERE tc.constraint_type = 'PRIMARY KEY' 
    AND tc.table_name IN ('drivers', 'organizations');
