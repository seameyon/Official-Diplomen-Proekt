import translate from 'google-translate-api-x';

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

/**
 * Translate text from English to Bulgarian using Google Translate (FREE)
 */
export const translateToBulgarian = async (text: string): Promise<string> => {
  if (!text || text.trim().length === 0) return text;
  
  // Check cache first
  const cached = translationCache.get(text);
  if (cached) return cached;
  
  try {
    const result = await translate(text, { from: 'en', to: 'bg' });
    const translated = result.text;
    
    // Cache the result
    translationCache.set(text, translated);
    
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original on error
  }
};

/**
 * Translate recipe content to Bulgarian
 */
export const translateRecipeToBulgarian = async (
  title: string,
  steps: string[],
  ingredients: string[]
): Promise<{
  title: string;
  steps: string[];
  ingredients: string[];
}> => {
  try {
    // Translate title
    const translatedTitle = await translateToBulgarian(title);
    
    // Translate steps (batch for efficiency)
    const translatedSteps = await Promise.all(
      steps.map(step => translateToBulgarian(step))
    );
    
    // Translate ingredients
    const translatedIngredients = await Promise.all(
      ingredients.map(ing => translateToBulgarian(ing))
    );
    
    return {
      title: translatedTitle,
      steps: translatedSteps,
      ingredients: translatedIngredients,
    };
  } catch (error) {
    console.error('Recipe translation error:', error);
    return { title, steps, ingredients };
  }
};

export default {
  translateToBulgarian,
  translateRecipeToBulgarian,
};
