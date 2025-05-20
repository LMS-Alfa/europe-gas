-- Check if the 'paid' column exists in the enteredparts table and add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'enteredparts' AND column_name = 'paid'
    ) THEN
        ALTER TABLE enteredparts ADD COLUMN paid BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Check if the 'payment_date' column exists and add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'enteredparts' AND column_name = 'payment_date'
    ) THEN
        ALTER TABLE enteredparts ADD COLUMN payment_date TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- Add an index to improve query performance for quarterly filtering
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'enteredparts' AND indexname = 'idx_enteredparts_created_at'
    ) THEN
        CREATE INDEX idx_enteredparts_created_at ON enteredparts (created_at);
    END IF;
END $$;

-- Add an index on user_id for faster user-specific queries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'enteredparts' AND indexname = 'idx_enteredparts_user_id'
    ) THEN
        CREATE INDEX idx_enteredparts_user_id ON enteredparts (user_id);
    END IF;
END $$; 