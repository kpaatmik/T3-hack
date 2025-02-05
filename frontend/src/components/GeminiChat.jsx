import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const GeminiChat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const genAI = new GoogleGenerativeAI('AIzaSyAdMZwutJYy7FcCyansYlvJlrW8pxVSV-8');

  const generateResponse = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `As a highway travel assistant, please help with: ${input}. 
      Consider providing information about:
      - Traffic and route suggestions
      - Rest stops and facilities
      - Weather conditions
      - Safety tips
      Please be concise and practical.`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      setResponse(text);
      setInput(''); // Clear input after successful response
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, there was an error generating a response.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateResponse();
    }
  };

  return (
    <div className="w-full">
      {/* Chat Input */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about traffic, rest stops, or travel tips..."
          className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="2"
        />
        <button
          onClick={generateResponse}
          disabled={loading || !input.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full
            ${loading || !input.trim() 
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:text-blue-700'}`}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
        </button>
      </div>

      {/* Response Section */}
      {response && (
        <div className="mt-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="whitespace-pre-wrap text-gray-700">{response}</p>
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "Best break times?",
          "Car breakdown help",
          "Nearest rest stop?",
          "Night driving tips"
        ].map((question, index) => (
          <button
            key={index}
            onClick={() => setInput(question)}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GeminiChat;
