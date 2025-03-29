import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase-klienten med service role key for å få tilgang til å kjøre SQL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode ikke tillatt' });
  }

  try {
    // Kjør SQL direkte for å legge til manglende kolonner
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error('Feil ved tilkobling til profiles-tabellen:', error);
      return res.status(500).json({ error: error.message });
    }
    
    // Legg til hver kolonne individuelt for å unngå feil hvis noen allerede eksisterer
    const columns = [
      { name: 'activity_level', type: 'text' },
      { name: 'dietary_restrictions', type: 'text[]' },
      { name: 'allergies', type: 'text[]' },
      { name: 'disliked_ingredients', type: 'text[]' },
      { name: 'health_goals', type: 'text[]' },
      { name: 'weight', type: 'numeric' },
      { name: 'height', type: 'numeric' },
      { name: 'current_weight', type: 'numeric' },
      { name: 'target_weight', type: 'numeric' },
      { name: 'membership_tier', type: 'text' },
      { name: 'updated_at', type: 'timestamptz' }
    ];
    
    const results = [];
    
    for (const column of columns) {
      try {
        // Sjekk om kolonnen allerede eksisterer
        const { data: columnData, error: columnError } = await supabase
          .rpc('column_exists', { 
            table_name: 'profiles', 
            column_name: column.name 
          });
        
        if (columnError) {
          // Hvis RPC ikke finnes, bruk alternativ metode
          console.log(`Kunne ikke sjekke om kolonnen ${column.name} eksisterer:`, columnError);
          
          // Prøv å legge til kolonnen uansett, og fang feil hvis den allerede eksisterer
          const { error: addError } = await supabase
            .rpc('add_column', { 
              table_name: 'profiles', 
              column_name: column.name, 
              column_type: column.type 
            });
            
          if (addError) {
            console.log(`Feil ved forsøk på å legge til kolonnen ${column.name}:`, addError);
            results.push({ column: column.name, status: 'error', message: addError.message });
          } else {
            results.push({ column: column.name, status: 'added' });
          }
        } else if (!columnData) {
          // Kolonnen eksisterer ikke, legg den til
          const { error: addError } = await supabase
            .rpc('add_column', { 
              table_name: 'profiles', 
              column_name: column.name, 
              column_type: column.type 
            });
            
          if (addError) {
            console.log(`Feil ved forsøk på å legge til kolonnen ${column.name}:`, addError);
            results.push({ column: column.name, status: 'error', message: addError.message });
          } else {
            results.push({ column: column.name, status: 'added' });
          }
        } else {
          // Kolonnen eksisterer allerede
          results.push({ column: column.name, status: 'exists' });
        }
      } catch (e) {
        console.error(`Feil ved håndtering av kolonnen ${column.name}:`, e);
        results.push({ column: column.name, status: 'error', message: e.message });
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Profiles-tabellen er oppdatert', 
      results 
    });
  } catch (error) {
    console.error('Feil ved oppdatering av profiles-tabellen:', error);
    return res.status(500).json({ error: error.message });
  }
}
