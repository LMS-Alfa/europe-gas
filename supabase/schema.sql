-- Create schema for Europe Gas Analytics

-- Profiles table to store user details
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  phone TEXT,
  password TEXT,
  enteredParts INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Allow users to read their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow admins to read all profiles" ON public.profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admins to update all profiles" ON public.profiles
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Parts table
CREATE TABLE public.parts (
  id SERIAL PRIMARY KEY,
  part_id TEXT NOT NULL UNIQUE,
  part_name TEXT,
  description TEXT,
  category TEXT,
  price NUMERIC(10, 2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for parts
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

-- Create policies for parts table
CREATE POLICY "Allow read access to all authenticated users" ON public.parts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to insert parts" ON public.parts
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to update parts" ON public.parts
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- User Parts table (tracks parts entered by users)
CREATE TABLE public.user_parts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  part_id TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  bonus_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_parts
ALTER TABLE public.user_parts ENABLE ROW LEVEL SECURITY;

-- Create policies for user_parts table
CREATE POLICY "Allow users to read their own entries" ON public.user_parts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to read all entries" ON public.user_parts
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow users to insert their own entries" ON public.user_parts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bonus payments table (tracks quarterly payouts)
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

-- Create function to automatically validate parts and calculate bonus
CREATE OR REPLACE FUNCTION validate_part() RETURNS TRIGGER AS $$
BEGIN
  -- Check if the part exists in the parts table
  IF EXISTS (SELECT 1 FROM public.parts WHERE part_id = NEW.part_id) THEN
    -- Check if this user has already entered this part (prevent duplicates)
    IF NOT EXISTS (SELECT 1 FROM public.user_parts 
                  WHERE user_id = NEW.user_id AND part_id = NEW.part_id AND id != NEW.id) THEN
      -- Part is valid and not a duplicate, set bonus
      NEW.is_valid := TRUE;
      NEW.bonus_amount := 1.00; -- $1 per valid part
    ELSE
      -- Part is a duplicate for this user
      NEW.is_valid := FALSE;
      NEW.bonus_amount := 0;
    END IF;
  ELSE
    -- Part doesn't exist in the database
    NEW.is_valid := FALSE;
    NEW.bonus_amount := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically validate parts on insert or update
CREATE TRIGGER validate_part_trigger
BEFORE INSERT OR UPDATE ON public.user_parts
FOR EACH ROW EXECUTE FUNCTION validate_part();

-- Create function to create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, firstName, lastName, email, password, role)
  VALUES (
    NEW.id, 
    NEW.phone, 
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''), 
    COALESCE(NEW.raw_user_meta_data->>'lastName', ''), 
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'password', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 