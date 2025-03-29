-- Sjekk om kolonner eksisterer og legg til hvis de mangler
DO $$
BEGIN
    -- Sjekk og legg til activity_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'activity_level') THEN
        ALTER TABLE profiles ADD COLUMN activity_level VARCHAR(50);
    END IF;

    -- Sjekk og legg til dietary_restrictions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dietary_restrictions') THEN
        ALTER TABLE profiles ADD COLUMN dietary_restrictions TEXT[];
    END IF;

    -- Sjekk og legg til allergies
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'allergies') THEN
        ALTER TABLE profiles ADD COLUMN allergies TEXT[];
    END IF;

    -- Sjekk og legg til disliked_ingredients
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'disliked_ingredients') THEN
        ALTER TABLE profiles ADD COLUMN disliked_ingredients TEXT[];
    END IF;

    -- Sjekk og legg til health_goals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'health_goals') THEN
        ALTER TABLE profiles ADD COLUMN health_goals TEXT[];
    END IF;

    -- Sjekk og legg til weight
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'weight') THEN
        ALTER TABLE profiles ADD COLUMN weight NUMERIC;
    END IF;

    -- Sjekk og legg til height
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'height') THEN
        ALTER TABLE profiles ADD COLUMN height NUMERIC;
    END IF;

    -- Sjekk og legg til current_weight
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_weight') THEN
        ALTER TABLE profiles ADD COLUMN current_weight NUMERIC;
    END IF;

    -- Sjekk og legg til target_weight
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'target_weight') THEN
        ALTER TABLE profiles ADD COLUMN target_weight NUMERIC;
    END IF;

    -- Sjekk og legg til membership_tier
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'membership_tier') THEN
        ALTER TABLE profiles ADD COLUMN membership_tier VARCHAR(50);
    END IF;

    -- Sjekk og legg til updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
