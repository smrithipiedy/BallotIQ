import { GoogleGenerativeAI } from '@google/generative-ai';

async function checkModels() {
  const API_KEY = 'AIzaSyCppFPSWqnLdiZBjRZ8dMIW9Pz40Fc5GbI';
  const genAI = new GoogleGenerativeAI(API_KEY);
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-pro'
  ];

  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Hi');
      console.log(`✅ ${m}: OK`);
    } catch (err: any) {
      console.log(`❌ ${m}: ${err.message}`);
    }
  }
}

checkModels();
