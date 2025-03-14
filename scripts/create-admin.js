// Script for å opprette en admin-bruker i Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Sjekk at miljøvariabler er tilgjengelige
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Manglende miljøvariabler. Sørg for at .env.local er konfigurert korrekt.');
  process.exit(1);
}

// Opprett Supabase-klient
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Admin-brukerdetaljer
const adminEmail = 'munashe.toga@gmail.com';
const adminPassword = 'Munashe-1404';

async function createAdminUser() {
  try {
    // 1. Opprett bruker i Auth
    console.log(`Oppretter bruker med e-post: ${adminEmail}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });

    if (authError) {
      throw authError;
    }

    console.log('Bruker opprettet i Auth:', authData.user.id);

    // 2. Oppdater brukerprofil med admin-rolle
    console.log('Setter brukerrolle til admin...');
    
    // Sjekk om profiles-tabellen finnes
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      // Tabellen finnes ikke, opprett den
      console.log('Oppretter profiles-tabell...');
      const { error: createTableError } = await supabase.rpc('create_profiles_table');
      if (createTableError) {
        throw createTableError;
      }
    } else if (tableError) {
      throw tableError;
    }

    // Oppdater eller opprett profil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: adminEmail,
        role: 'admin',
        subscription_tier: 'premium',
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      throw profileError;
    }

    console.log('Admin-bruker opprettet og konfigurert!');
    console.log('E-post:', adminEmail);
    console.log('Passord:', adminPassword);
    console.log('Bruker-ID:', authData.user.id);
    
  } catch (error) {
    console.error('Feil ved oppretting av admin-bruker:', error);
    
    // Hvis brukeren allerede finnes, prøv å oppdatere rollen
    if (error.message && error.message.includes('already exists')) {
      try {
        console.log('Bruker finnes allerede. Prøver å logge inn og oppdatere rollen...');
        
        // Logg inn for å få bruker-ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });
        
        if (signInError) throw signInError;
        
        // Oppdater rollen
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: signInData.user.id,
            email: adminEmail,
            role: 'admin',
            subscription_tier: 'premium',
            updated_at: new Date().toISOString(),
          });
          
        if (updateError) throw updateError;
        
        console.log('Eksisterende bruker oppdatert til admin!');
        console.log('Bruker-ID:', signInData.user.id);
      } catch (updateError) {
        console.error('Feil ved oppdatering av eksisterende bruker:', updateError);
      }
    }
  }
}

createAdminUser();
