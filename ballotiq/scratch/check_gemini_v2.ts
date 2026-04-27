import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  const API_KEY = 'AIzaSyCppFPSWqnLdiZBjRZ8dMIW9Pz40Fc5GbI';
  // Use v1 instead of v1beta to see if that helps
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  try {
    // There is no direct listModels in the standard SDK sometimes, but let's try
    // Actually, I'll just try a few more common names
    const models = [
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-pro',
      'gemini-flash'
    ];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent('Hi');
        console.log(`✅ ${m}: OK`);
      } catch (err: any) {
        console.log(`❌ ${m}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
