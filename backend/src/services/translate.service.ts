import translate from 'google-translate-api-x';


const translationCache = new Map<string, string>();


export const translateToBulgarian = async (text: string): Promise<string> => {
  if (!text || text.trim().length === 0) return text;
  
  
  const cached = translationCache.get(text);
  if (cached) return cached;
  
  try {
    const result = await translate(text, { from: 'en', to: 'bg' });
    const translated = result.text;
    
  
    translationCache.set(text, translated);
    
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};


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
  
    const translatedTitle = await translateToBulgarian(title);
    
    
    const translatedSteps = await Promise.all(
      steps.map(step => translateToBulgarian(step))
    );
    
    
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
