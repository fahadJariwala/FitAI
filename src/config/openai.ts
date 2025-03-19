import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";


let openaiInstance: OpenAI | null = null;
const AI_KEYS = [
  "AIzaSyBWmRxW-vmg6IoNPyEKwPPYUkRcAe6HvfQ",
  "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",
  "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",

]
export const initializeOpenAI = () => {
  if (!AI_KEYS || AI_KEYS.length === 0) {
    throw new Error('No API keys available');
  }

  openaiInstance = new OpenAI({
    apiKey: AI_KEYS[2],
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
    apiKey: AI_KEYS[1], // ✅ Replace with your actual API key
    dangerouslyAllowBrowser: true, // ✅ Required for React Native
  });
};
export const getGeminiInstance = () => {
  return new GoogleGenerativeAI(AI_KEYS[0]);
};

export const handleApiError = async (error: any) => {
  console.log('API Error:', error);
  if (error?.status === 429 || error?.message?.includes('rate limit')) {
    openaiInstance = initializeOpenAI();
    return openaiInstance;
  }
  throw error;
};
