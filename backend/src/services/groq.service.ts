import { groqClient, GROQ_MODEL } from '../config/groq.js';
import { IRecipe } from '../types/recipe.types.js';

/**
 * Estimate nutrition for a recipe using AI
 */
export const estimateNutrition = async (
  ingredients: Array<{ name: string; amount: number; unit: string }>,
  servings: number
): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}> => {
  const prompt = `
Estimate the nutritional information for a recipe with these ingredients (per ${servings} servings):

${ingredients.map(i => `- ${i.amount} ${i.unit} ${i.name}`).join('\n')}

Return ONLY a JSON object with these exact fields (numbers only, no units):
{
  "caloriesPerServing": <number>,
  "proteinPerServing": <number in grams>,
  "carbsPerServing": <number in grams>,
  "fatPerServing": <number in grams>,
  "fiberPerServing": <number in grams>
}
`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition expert. Provide accurate nutritional estimates based on standard food composition databases. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return {
      calories: Math.round(response.caloriesPerServing || 0),
      protein: Math.round(response.proteinPerServing || 0),
      carbs: Math.round(response.carbsPerServing || 0),
      fat: Math.round(response.fatPerServing || 0),
      fiber: Math.round(response.fiberPerServing || 0),
    };
  } catch (error) {
    console.error('Nutrition estimation error:', error);
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
};

/**
 * Generate recipe suggestions based on available ingredients
 */
export const suggestRecipes = async (
  ingredients: string[],
  preferences: {
    dietary?: string;
    maxTime?: number;
    cuisine?: string;
  }
): Promise<Array<{
  title: string;
  description: string;
  ingredients: string[];
  difficulty: string;
  estimatedTime: number;
}>> => {
  const prompt = `
Suggest 3 creative recipes using these available ingredients:
${ingredients.join(', ')}

Preferences:
- Dietary: ${preferences.dietary || 'None'}
- Max cooking time: ${preferences.maxTime || 60} minutes
- Cuisine preference: ${preferences.cuisine || 'Any'}

Return a JSON array with exactly 3 recipes, each having:
{
  "title": "Recipe name",
  "description": "Brief description",
  "ingredients": ["list", "of", "ingredients"],
  "difficulty": "easy|medium|hard",
  "estimatedTime": <number in minutes>
}
`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a creative chef assistant. Suggest delicious and practical recipes. Return only valid JSON array.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{"recipes":[]}');
    return response.recipes || [];
  } catch (error) {
    console.error('Recipe suggestion error:', error);
    return [];
  }
};

/**
 * Generate cooking tips for a recipe
 */
export const generateCookingTips = async (recipe: Partial<IRecipe>): Promise<string[]> => {
  const prompt = `
Generate 3-5 helpful cooking tips for this recipe:

Title: ${recipe.title}
Ingredients: ${recipe.ingredients?.map(i => i.name).join(', ')}
Steps: ${recipe.steps?.join(' | ')}

Return a JSON object with a "tips" array of strings.
`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional chef providing practical cooking advice. Be specific and helpful.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{"tips":[]}');
    return response.tips || [];
  } catch (error) {
    console.error('Cooking tips error:', error);
    return [];
  }
};

/**
 * Analyze recipe for dietary compliance
 */
export const analyzeDietaryCompliance = async (
  recipe: Partial<IRecipe>,
  dietaryRequirements: string[]
): Promise<{
  compliant: boolean;
  warnings: string[];
  suggestions: string[];
}> => {
  const prompt = `
Analyze if this recipe complies with the dietary requirements:

Recipe: ${recipe.title}
Ingredients: ${recipe.ingredients?.map(i => `${i.amount} ${i.unit} ${i.name}`).join(', ')}

Dietary Requirements: ${dietaryRequirements.join(', ')}

Return a JSON object:
{
  "compliant": true/false,
  "warnings": ["list of potential issues"],
  "suggestions": ["modifications to make it compliant"]
}
`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition expert specializing in dietary restrictions. Be thorough but practical.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      compliant: response.compliant ?? true,
      warnings: response.warnings || [],
      suggestions: response.suggestions || [],
    };
  } catch (error) {
    console.error('Dietary analysis error:', error);
    return { compliant: true, warnings: [], suggestions: [] };
  }
};

/**
 * Translate recipe title and steps to Bulgarian
 */
export const translateRecipe = async (
  title: string,
  steps: string[],
  ingredients: string[]
): Promise<{
  title: string;
  steps: string[];
  ingredients: string[];
}> => {
  const prompt = `
Translate the following recipe content from English to Bulgarian. Keep cooking terms accurate and natural-sounding.

Title: ${title}

Steps:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Ingredients:
${ingredients.join('\n')}

Return a JSON object with:
{
  "title": "translated title",
  "steps": ["translated step 1", "translated step 2", ...],
  "ingredients": ["translated ingredient 1", "translated ingredient 2", ...]
}
`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in culinary content. Translate accurately from English to Bulgarian, using proper Bulgarian cooking terminology. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    return {
      title: response.title || title,
      steps: response.steps || steps,
      ingredients: response.ingredients || ingredients,
    };
  } catch (error) {
    console.error('Translation error:', error);
    return { title, steps, ingredients };
  }
};

export default {
  estimateNutrition,
  suggestRecipes,
  generateCookingTips,
  analyzeDietaryCompliance,
  translateRecipe,
};
