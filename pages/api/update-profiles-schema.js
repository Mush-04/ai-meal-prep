import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Kjør SQL for å legge til manglende kolonner i profiles-tabellen
    const { error } = await supabase.rpc('update_profiles_schema');

    if (error) {
      console.error('Feil ved oppdatering av profiles-skjema:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Profiles-skjema oppdatert' });
  } catch (error) {
    console.error('Feil ved oppdatering av profiles-skjema:', error);
    return res.status(500).json({ error: error.message });
  }
}
