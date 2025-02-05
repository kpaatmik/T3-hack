import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const RestStopChat = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restPlaces, setRestPlaces] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Fetch rest places on component mount
  useEffect(() => {
    fetchRestPlaces();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchNearbyPlaces(position.coords.latitude, position.coords.longitude),
        (error) => console.error('Error getting location:', error)
      );
    }
  }, []);

  const fetchRestPlaces = async () => {
    try {
      const response = await fetch('/api/rest_places/places/');
      const data = await response.json();
      setRestPlaces(data);
    } catch (error) {
      console.error('Error fetching rest places:', error);
    }
  };

  const fetchNearbyPlaces = async (latitude, longitude) => {
    try {
      const response = await fetch(`/api/rest_places/places/nearby/?latitude=${latitude}&longitude=${longitude}`);
      const data = await response.json();
      setNearbyPlaces(data);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  const generateResponse = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      // Initialize Gemini
      const genAI = new GoogleGenerativeAI('AIzaSyAdMZwutJYy7FcCyansYlvJlrW8pxVSV-8');
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Prepare context about available rest stops
      let context = "Based on our database:\n";
      
      if (nearbyPlaces.length > 0) {
        context += "\nNearby rest stops:\n";
        nearbyPlaces.slice(0, 3).forEach(place => {
          context += `- ${place.name} (${place.place_type}): ${place.address}\n`;
          if (place.amenities) {
            context += `  Amenities: ${place.amenities.map(a => a.name).join(', ')}\n`;
          }
        });
      }

      if (restPlaces.length > 0) {
        context += "\nOther available rest stops:\n";
        restPlaces.slice(0, 5).forEach(place => {
          context += `- ${place.name} (${place.place_type}): ${place.city}, ${place.state}\n`;
        });
      }

      // Prepare the prompt
      const prompt = `${context}\n\nUser question: ${userInput}\n\nPlease provide relevant information about rest stops based on our database. Include specific recommendations if available.`;

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiResponse(response.text());
      setUserInput('');
    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Sorry, there was an error generating a response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateResponse();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Rest Stop Assistant</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userInput" className="block text-sm font-medium text-gray-700">
            Ask about rest stops, amenities, or facilities
          </label>
          <input
            type="text"
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="E.g., What rest stops are nearby? Which ones have restaurants?"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className={`w-full rounded-md px-4 py-2 text-white ${
            isLoading || !userInput.trim()
              ? 'bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Finding Rest Stops...' : 'Get Information'}
        </button>
      </form>

      {aiResponse && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Available Options:</h3>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        </div>
      )}

      {/* Quick Questions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Quick Questions:</h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            "What rest stops are nearby?",
            "Which rest stops have restaurants?",
            "Find rest stops with parking facilities",
            "What amenities are available at the closest rest stop?"
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => setUserInput(question)}
              className="text-left p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestStopChat;
