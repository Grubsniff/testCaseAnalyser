import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function listAvailableModels() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY is not set in the environment variables.');
    return;
  }

  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const models = response.data.data;

    console.log('Available models:');
    models.forEach((model: any) => {
      console.log(`- ${model.id}`);
    });
  } catch (error: any) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

listAvailableModels();
