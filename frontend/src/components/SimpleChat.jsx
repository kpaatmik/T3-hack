import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SimpleChat = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    try {
      // Initialize the model
      const genAI = new GoogleGenerativeAI('AIzaSyAdMZwutJYy7FcCyansYlvJlrW8pxVSV-8');
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Generate content
      const result = await model.generateContent(userInput);
      const response = await result.response;
      setAiResponse(response.text());
      setUserInput('');
    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Sorry, there was an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userInput" className="block text-sm font-medium text-gray-700">
            Ask me anything about your journey
          </label>
          <input
            type="text"
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Type your question here..."
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
          {isLoading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>

      {aiResponse && (
        <div className="mt-6">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleChat;
