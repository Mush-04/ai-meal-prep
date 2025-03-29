import OpenAI from 'openai';

// Opprett OpenAI-klienten med API-nøkkelen fra miljøvariablene
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sjekk om API-nøkkelen er satt
if (!process.env.OPENAI_API_KEY) {
  console.error('ADVARSEL: OPENAI_API_KEY er ikke satt i miljøvariablene');
}

/**
 * Generer måltidsforslag basert på brukerens preferanser
 * @param {Object} options - Brukerens preferanser
 * @param {string} options.dietaryPreferences - Diettpreferanser (f.eks. vegetar, vegan)
 * @param {string} options.allergies - Allergier (kommaseparert liste)
 * @param {string} options.dislikedIngredients - Ingredienser brukeren ikke liker (kommaseparert liste)
 * @param {string} options.mealType - Type måltid (frokost, lunsj, middag, snack)
 * @param {string} options.healthGoals - Helsemål (f.eks. vekttap, muskelbygging)
 * @param {number} options.calorieTarget - Målkalorier
 * @returns {Promise<Object>} - Generert måltid med oppskrift og næringsinformasjon
 */
export async function generateMeal(options) {
  try {
    const {
      dietaryPreferences = '',
      allergies = '',
      dislikedIngredients = '',
      mealType = 'middag',
      healthGoals = '',
      calorieTarget = 0,
    } = options;

    // Bygge en prompt for GPT-4o
    const prompt = `
      Generer en detaljert oppskrift for et ${mealType}måltid som passer for en person med følgende preferanser:
      ${dietaryPreferences ? `Diettpreferanser: ${dietaryPreferences}` : ''}
      ${allergies ? `Allergier (unngå disse ingrediensene): ${allergies}` : ''}
      ${dislikedIngredients ? `Ingredienser som ikke liker: ${dislikedIngredients}` : ''}
      ${healthGoals ? `Helsemål: ${healthGoals}` : ''}
      ${calorieTarget ? `Målkalorier: ca. ${calorieTarget} kalorier` : ''}
      
      Vennligst inkluder følgende i ditt svar i JSON-format:
      1. Tittel på måltid
      2. Bilde-URL (la denne være tom, vi vil fylle den inn senere)
      3. Ingredienser med mengder
      4. Detaljert tilberedningsinstruksjoner trinn for trinn
      5. Næringsinnhold (kalorier, protein, karbohydrater, fett)
      6. Tilberedningstid
      7. Vanskelighetsgrad (enkel, middels, vanskelig)
      8. Antall porsjoner
      
      Svar kun med JSON i dette formatet:
      {
        "title": "Måltidstittel",
        "imageUrl": "",
        "ingredients": [
          {"name": "Ingrediens 1", "amount": "Mengde", "unit": "Enhet"},
          {"name": "Ingrediens 2", "amount": "Mengde", "unit": "Enhet"}
        ],
        "instructions": ["Trinn 1", "Trinn 2", "Trinn 3"],
        "nutrition": {
          "calories": 0,
          "protein": 0,
          "carbs": 0,
          "fat": 0
        },
        "prepTime": 0,
        "difficulty": "enkel/middels/vanskelig",
        "servings": 0
      }
      
      Alle tekster skal være på norsk. Vær kreativ, men hold deg til realistiske og sunne måltider.
    `;

    // Kall OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du er en profesjonell kokk og ernæringsekspert som spesialiserer seg på å lage personlige måltidsplaner. Du svarer kun med JSON-data i det spesifiserte formatet."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse JSON-responsen
    const mealData = JSON.parse(completion.choices[0].message.content);
    
    return {
      success: true,
      data: mealData
    };
  } catch (error) {
    console.error('Feil ved generering av måltid:', error);
    return {
      success: false,
      error: error.message || 'Kunne ikke generere måltid'
    };
  }
}

/**
 * Generer en ukentlig måltidsplan basert på brukerens preferanser
 * @param {Object} options - Brukerens preferanser
 * @returns {Promise<Object>} - Generert måltidsplan for en uke
 */
export async function generateMealPlan(options) {
  try {
    const {
      dietaryPreferences = '',
      allergies = '',
      dislikedIngredients = '',
      healthGoals = '',
      dailyCalorieTarget = 0,
      daysToGenerate = 7,
      mealsPerDay = 3,
    } = options;

    // Bygge en prompt for GPT-4o
    const prompt = `
      Generer en måltidsplan for ${daysToGenerate} dager med ${mealsPerDay} måltider per dag som passer for en person med følgende preferanser:
      ${dietaryPreferences ? `Diettpreferanser: ${dietaryPreferences}` : ''}
      ${allergies ? `Allergier (unngå disse ingrediensene): ${allergies}` : ''}
      ${dislikedIngredients ? `Ingredienser som ikke liker: ${dislikedIngredients}` : ''}
      ${healthGoals ? `Helsemål: ${healthGoals}` : ''}
      ${dailyCalorieTarget ? `Daglig kaloriemål: ca. ${dailyCalorieTarget} kalorier` : ''}
      
      Vennligst inkluder følgende i ditt svar i JSON-format:
      1. En liste over dager
      2. For hver dag, en liste over måltider (frokost, lunsj, middag, etc.)
      3. For hvert måltid, en tittel og kort beskrivelse
      4. Estimert næringsinnhold for hver dag
      
      Svar kun med JSON i dette formatet:
      {
        "days": [
          {
            "dayName": "Mandag",
            "meals": [
              {
                "mealType": "Frokost",
                "title": "Måltidstittel",
                "description": "Kort beskrivelse",
                "nutrition": {
                  "calories": 0,
                  "protein": 0,
                  "carbs": 0,
                  "fat": 0
                }
              }
            ],
            "totalNutrition": {
              "calories": 0,
              "protein": 0,
              "carbs": 0,
              "fat": 0
            }
          }
        ]
      }
      
      Alle tekster skal være på norsk. Vær kreativ, men hold deg til realistiske og sunne måltider.
    `;

    // Kall OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du er en profesjonell kokk og ernæringsekspert som spesialiserer seg på å lage personlige måltidsplaner. Du svarer kun med JSON-data i det spesifiserte formatet."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse JSON-responsen
    const mealPlanData = JSON.parse(completion.choices[0].message.content);
    
    return {
      success: true,
      data: mealPlanData
    };
  } catch (error) {
    console.error('Feil ved generering av måltidsplan:', error);
    return {
      success: false,
      error: error.message || 'Kunne ikke generere måltidsplan'
    };
  }
}

/**
 * Generer et bilde av et måltid ved hjelp av DALL-E
 * @param {string} mealTitle - Tittelen på måltidet
 * @param {string} mealDescription - Kort beskrivelse av måltidet (valgfritt)
 * @returns {Promise<Object>} - URL til det genererte bildet
 */
export async function generateMealImage(mealTitle, mealDescription = '') {
  try {
    const description = mealDescription 
      ? `${mealTitle}: ${mealDescription}` 
      : mealTitle;
    
    const prompt = `Et appetittvekkende, profesjonelt matfoto av ${description}. Høykvalitets matfotografi med naturlig belysning, ovenfra-perspektiv, på en hvit tallerken med garnish.`;
    
    console.log('Genererer bilde for måltid:', mealTitle);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return {
      success: true,
      imageUrl: response.data[0].url
    };
  } catch (error) {
    console.error('Feil ved generering av måltidsbilde:', error);
    return {
      success: false,
      error: error.message || 'Kunne ikke generere måltidsbilde'
    };
  }
}

export default openai;
