import { generateMealImage } from '../../lib/openai';

export default async function handler(req, res) {
  // Sjekk om metoden er POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode ikke tillatt' });
  }

  try {
    // Sjekk om OpenAI API-nøkkelen er satt
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY er ikke satt i miljøvariablene');
      return res.status(500).json({ 
        error: 'OpenAI API-nøkkel mangler. Vennligst legg til OPENAI_API_KEY i .env.local filen.' 
      });
    }

    // Hent måltidsinformasjon fra forespørselen
    const { mealTitle, mealDescription } = req.body;

    if (!mealTitle) {
      return res.status(400).json({ error: 'Måltidstittel er påkrevd' });
    }

    console.log('Genererer bilde for måltid:', mealTitle);

    // Generer måltidsbilde med OpenAI
    const result = await generateMealImage(mealTitle, mealDescription);

    // Returner resultatet
    if (result.success) {
      return res.status(200).json({ imageUrl: result.imageUrl });
    } else {
      console.error('Feil ved generering av måltidsbilde:', result.error);
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Uventet feil i generate-meal-image API:', error);
    return res.status(500).json({ 
      error: 'Serverfeil ved generering av måltidsbilde', 
      details: error.message 
    });
  }
}
