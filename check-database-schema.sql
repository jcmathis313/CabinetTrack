-- Check database schema to understand the actual data types
-- This will help us fix the foreign key constraint issues

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

-- Check orders table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check if organizations table exists and its primary key type
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
    AND tc.table_name = 'organizations';

-- Check if drivers table exists and its primary key type
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
    AND tc.table_name = 'drivers';
