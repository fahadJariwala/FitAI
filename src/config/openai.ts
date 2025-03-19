import OpenAI from 'openai';
import { API_KEYS } from './apiKeys';
import { GoogleGenerativeAI } from "@google/generative-ai";


let openaiInstance: OpenAI | null = null;

export const initializeOpenAI = () => {
  if (!API_KEYS || API_KEYS.length === 0) {
    throw new Error('No API keys available');
  }

  openaiInstance = new OpenAI({
    apiKey: API_KEYS[2],
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/fahadJariwala/FitAI',
      'X-Title': 'FitAI',
    },
    dangerouslyAllowBrowser: true
  });

  return openaiInstance;
};

// export const getOpenAIInstance = () => {
//   if (!openaiInstance) {
//     return initializeOpenAI();
//   }
//   return openaiInstance;
// };

export const getOpenAIInstance = () => {
  return new OpenAI({
    apiKey: API_KEYS[1], // ✅ Replace with your actual API key
    dangerouslyAllowBrowser: true, // ✅ Required for React Native
  });
};
export const getGeminiInstance = () => {
  return new GoogleGenerativeAI(API_KEYS[0]);
};

export const handleApiError = async (error: any) => {
  console.log('API Error:', error);
  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    openaiInstance = initializeOpenAI();
    return openaiInstance;
  }
  throw error;
};
