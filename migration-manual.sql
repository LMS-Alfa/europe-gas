-- First, create the exec_sql function
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Then check if bonus_payments table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bonus_payments') THEN
        -- Create bonus_payments table
        CREATE TABLE public.bonus_payments (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
            total_amount NUMERIC(10, 2) DEFAULT 0,
            payment_date TIMESTAMP WITH TIME ZONE,
            quarter INTEGER NOT NULL,
            year INTEGER NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS for bonus_payments
        ALTER TABLE public.bonus_payments ENABLE ROW LEVEL SECURITY;

        -- Create policies for bonus_payments table
        CREATE POLICY "Allow users to read their own bonus payments" ON public.bonus_payments
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Allow admins to read all bonus payments" ON public.bonus_payments
            FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

        CREATE POLICY "Allow admins to insert bonus payments" ON public.bonus_payments
            FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

        CREATE POLICY "Allow admins to update bonus payments" ON public.bonus_payments
            FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$; 