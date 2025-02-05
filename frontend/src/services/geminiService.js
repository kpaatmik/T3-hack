import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API key
const API_KEY = 'AIzaSyAdMZwutJYy7FcCyansYlvJlrW8pxVSV-8';

// Create a more robust error handling function
const handleGeminiError = (error) => {
  console.error('Gemini API Error Details:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    details: error.details || 'No additional details'
  });

  if (error.message.includes('API key')) {
    return 'There was an issue with the API key. Please check your configuration.';
  } else if (error.message.includes('network')) {
    return 'Network error occurred. Please check your internet connection.';
  } else {
    return 'An unexpected error occurred. Please try again later.';
  }
};

export async function getGeminiResponse(prompt) {
  try {
    console.log('Initializing Gemini with API key:', API_KEY);
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('Getting generative model...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    console.log('Received result from Gemini:', result);
    
    const response = await result.response;
    console.log('Processed response:', response);
    
    return response.text();
  } catch (error) {
    console.error('Detailed Gemini error:', error);
    const errorMessage = handleGeminiError(error);
    throw new Error(errorMessage);
  }
}

// Function to get travel-specific responses
export async function getTravelAssistance(query) {
  console.log('Preparing travel assistance query:', query);
  
  const enhancedPrompt = `As a travel and highway assistant, please help with the following query: ${query}
  Focus on providing relevant information about:
  - Traffic conditions and route suggestions
  - Rest stops and facilities
  - Weather conditions and travel advisories
  - Emergency services if needed
  Please provide concise and practical information.`;
  
  try {
    console.log('Sending enhanced prompt to Gemini:', enhancedPrompt);
    const response = await getGeminiResponse(enhancedPrompt);
    console.log('Received travel assistance response:', response);
    return response;
  } catch (error) {
    console.error('Error in travel assistance:', error);
    throw error;
  }
}
