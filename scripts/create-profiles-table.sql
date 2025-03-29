-- Oppretter profiles-tabellen for å lagre brukerinformasjon
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  birth_date DATE,
  
  -- Kostpreferanser
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  disliked_ingredients TEXT[] DEFAULT '{}',
  
  -- Helsemål
  health_goals TEXT[] DEFAULT '{}',
  activity_level TEXT,
  weight NUMERIC,
  height NUMERIC,
  current_weight NUMERIC,
  target_weight NUMERIC,
  
  -- Medlemskapsnivå
  membership_tier TEXT DEFAULT 'premium',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legger til RLS (Row Level Security) for å sikre at brukere bare kan se sin egen profil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for å la brukere se sin egen profil
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy for å la brukere oppdatere sin egen profil
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy for å la service roles se alle profiler (for admin-funksjonalitet)
CREATE POLICY "Service role can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO service_role
  USING (true);

-- Indeks for raskere spørringer
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
