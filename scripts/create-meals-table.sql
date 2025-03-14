-- Oppretter meals-tabellen for å lagre genererte måltider
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions TEXT,
  nutrition_info JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legger til RLS (Row Level Security) for å sikre at brukere bare kan se sine egne måltider
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Policy for å la brukere se sine egne måltider
CREATE POLICY "Users can view their own meals" 
  ON public.meals 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for å la brukere opprette måltider
CREATE POLICY "Users can insert their own meals" 
  ON public.meals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for å la brukere oppdatere sine egne måltider
CREATE POLICY "Users can update their own meals" 
  ON public.meals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for å la brukere slette sine egne måltider
CREATE POLICY "Users can delete their own meals" 
  ON public.meals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policy for å la service roles se alle måltider (for admin-funksjonalitet)
CREATE POLICY "Service role can view all meals" 
  ON public.meals 
  FOR SELECT 
  TO service_role
  USING (true);

-- Indeks for raskere spørringer
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON public.meals (user_id);
CREATE INDEX IF NOT EXISTS meals_created_at_idx ON public.meals (created_at);
