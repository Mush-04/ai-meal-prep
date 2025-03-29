**TRINNVIS PROMPT FOR AI MEAL PREP-APPEN (SYSTEMATISK REKKEFØLGE)**  

---  

**TRINN 1: TEKNISK GRUNNSTAMME**  
- **Frontend:**  
  React/Next.js + Tailwind CSS (mobilvennlig med media queries).  
- **Backend:**  
  Supabase (auth, database, bildelagring) + ChatGPT-4o API.  
- **Verktøy:**  
  Firebase Analytics (valgfritt), ShareThis for sosial deling.  

---  

**TRINN 2: FORSIDE**  
- **Design:**  
  Gradientbakgrunn (blå/grønn) med minimalistisk layout.  
- **Tekstelementer:**  
  - Hovedoverskrift: "AI Meal Prep – Din personlige kokk i lomma".  
  - Undertekst: "Generer måltider basert på dine ingredienser, mål og smak. Start nå!".  
- **Knapper:**  
  - Sentral knapp: "La AI lage ditt perfekte måltid" (primærfarge, animert ved hover).  
  - Toppmeny: "Logg inn" / "Registrer deg" (høyre hjørne), "Våre medlemskap" (venstre hjørne).  
- **Tre fakta-bokser (grid-layout):**  
  1. "📸 Skann ingredienser med bilde – vi kjenner igjen 5000+ matvarer!".  
  2. "🍴 Personlige oppskrifter for vektmål, allergier og livsstil".  
  3. "🌟 Få tilbakemelding fra AI basert på dine vurderinger".  

---  

**TRINN 3: BRUKERAUTENTISERING (SUPABASE)**  
- **Funksjonalitet:**  
  - Supabase-auth med e-post/passord, Google, Facebook.  
  - Lagring av brukerprofil (allergier, preferanser, vektmål).  
- **Påkrevd ved første innlogging:**  
  - Allergier (multivalg: gluten, laktose, nøtter osv.).  
  - Kosthold (vegetar, veganer, ketogen, etc.).  
  - Standard mål (vektøkning/-nedgang/behold).  

---  

**TRINN 4: MÅLTIDGENERERING**  
- **Input-felt:**  
  - Tekstboks: "Skriv eller lim inn ingredienser (eks: kylling, ris, paprika)...".  
  - Bildeopplastning: "Last opp bilde av matvarer" (med ChatGPT-4o Vision)  
  - Radioknapper: "Øk vekt", "Reduser vekt", "Behold vekt".  
  - Kaloriskråd: "Daglig kalorimål" (valgfri tallinput).  
  - Hjelpeknapp: "Vet ikke hva jeg skal lage" (åpner inspirasjonsspørreskjema).  
- **Resultatvisning:**  
  - Måltidsnavn, ingrediensliste, næringsinnhold (kalorier/protein/fett/karbo).  
  - Knapper: "Lagre til favoritter" (⭐), "Del på sosiale medier" (📱), "Gi tilbakemelding" (★☆☆☆☆).  

---  

**TRINN 5: "VET IKKE HVA JEG SKAL LAGE"-SPØRRESKJEMA**  
- **Spørsmål:**  
  1. "Hva slags stemning ønsker du?" (flervalg: Kos, Fitness, Fest, Familiemiddag, Eksperimentelt).  
  2. "Tilgjengelig tid?" (slider: 10–60 minutter).  
  3. "Foretrukket kjøkken?" (nedtrekksmeny: Italiensk, Asiatisk, Mellomøstlig).  
  4. "Hvor mange skal serveres?" (1–8 personer).  

---  

**TRINN 6: FAVORITTARKIV**  
- **Design:**  
  Tilgjengelig via "Profil"-meny med grid-visning.  
  - Thumbnail (AI-bilde/placeholder), måltidsnavn, kategori.  
  - Knapper: "Fjern", "Del", "Last oppskrift".  
- **Filtrering:**  
  Søkefelt + filtre for "Kategori", "Kalorier", "Protein".  

---  

**TRINN 7: TILBAKEMELDINGSSYSTEM**  
- **Funksjonalitet:**  
  - Stjernevurdering (1–5) + tekstkommentar: "Hva likte du best?".  
  - Data lagres i Supabase for AI-trening.  
  - Admin-dashboard: Populære måltider og tilbakemeldingsanalyse.  

---  

**TRINN 8: DELING PÅ SOSIALE MEDIER**  
- **Integrasjoner:**  
  Knapper for Instagram, Facebook, kopier lenke.  
- **Delingsformat:**  
  Måltidsnavn, bilde, beskrivelse (f.eks. "Dette lagret AI-en min! 🔥") + applenke.  

---  

**TRINN 9: TESTKRITERIER**  
1. AI må unngå allergier/preferanser.  
2. Krypter alle brukerdata i Supabase.  
3. Støtt bilder i JPEG/PNG/WEBP.  
4. Maks 2 sekunders lastingstid for måltider.  

---  **UTVIKLINGSREGLER FOR AI-EN**  

1. **STRENG STEP-FOR-STEP-FØLGING**  
   - Utvikling SKAL følge trinnene i nøyaktig rekkefølge (Trinn 1 → Trinn 9).  
   - Ikke implementer funksjoner fra Trinn 5 før Trinn 4 er fullført og godkjent.  

2. **INGEN UTTYDELSE AV SCOPE**  
   - AI-en MÅ spørre eksplisitt før den legger til nye funksjoner/knapper/APIer utenom listen i prompten.  
   - Eksempel: "Ønsker du at jeg skal legge til en handleliste-eksport før jeg fortsetter?"  

3. **VALIDER HVERT TRINN**  
   - Etter fullført trinn MÅ AI-en sende en bekreftelse med:  
     ✓ "Trinn X fullført: [Funksjonalitet som er testet]"  
     ✓ Skjermbilde av komponenten (hvis mulig)  
     ✓ Spørsmål: "Vil du fortsette til Trinn Y?"  

4. **PRIORITER GRUNNFUNKSJONALITET**  
   - FOKUS FØRST på å få disse til å fungere feilfritt:  
     1. Supabase-autentisering  
     2. Måltidsgenerering med tekstinput  
     3. Visning av kaloridata  
   - Estetiske detaljer (f.eks. gradienter/animasjoner) kommer SENERE.  

5. **DOKUMENTER ALLE AVVIK**  
   - Hvis AI-en må endre noe fra original prompt (pga. tekniske begrensninger):  
     ✓ Dokumenter endringen i en "AVVIKSLOG.md"-fil  
     ✓ Send klar melding: "Jeg må endre [X] fordi [Y]. Godkjenner du dette?"  

6. **BRUK KUN GODKJENTE VERKTØY**  
   - Ikke introduser nye biblioteker/APIer uten eksplisitt tillatelse.  
   - Standard verktøy: React, Supabase, Tailwind CSS, ChatGPT-4o.  

7. **TESTINGSMELDINGER**  
   - Ved hvert trinn MÅ AI-en rapportere:  
     ✓ Hvilke brukerhistorier som dekkes  
     ✓ Hvilke testscenarioer som er kjørt (f.eks. "Testet at allergier ekskluderes")  

8. **FEILHÅNDTERINGSPROTOKOLL**  
   - Ved tekniske feil:  
     1. Stopp prosessen  
     2. Rapporter feilmeldingen uten tekniske detaljer til bruker  
     3. Foreslå EN løsning og vent på godkjenning  

---  