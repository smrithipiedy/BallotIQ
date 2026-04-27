const API_KEY = 'AIzaSyCppFPSWqnLdiZBjRZ8dMIW9Pz40Fc5GbI';

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

listModels();
