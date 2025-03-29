import { generateMeal } from '../../lib/openai';

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

    // Hent brukerpreferanser fra forespørselen
    const {
      dietaryPreferences,
      allergies,
      dislikedIngredients,
      mealType,
      healthGoals,
      calorieTarget,
    } = req.body;

    console.log('Genererer måltid med følgende preferanser:', {
      mealType,
      dietaryPreferences,
      allergies,
      dislikedIngredients,
      healthGoals,
      calorieTarget,
    });

    // Generer måltid med OpenAI
    const result = await generateMeal({
      dietaryPreferences,
      allergies,
      dislikedIngredients,
      mealType,
      healthGoals,
      calorieTarget,
    });

    // Returner resultatet
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      console.error('Feil ved generering av måltid:', result.error);
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Uventet feil i generate-meal API:', error);
    return res.status(500).json({ 
      error: 'Serverfeil ved generering av måltid', 
      details: error.message 
    });
  }
}
