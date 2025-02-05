import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaMicrophone, FaStop, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const VoiceEnabledChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restPlaces, setRestPlaces] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const recognition = useRef(null);
  const synthesis = window.speechSynthesis;

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (synthesis) {
        synthesis.cancel();
      }
    };
  }, []);

  // Fetch rest places data
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

  const toggleListening = () => {
    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
      // Process the transcript when stopping
      if (transcript) {
        processVoiceInput(transcript);
      }
    } else {
      setTranscript('');
      recognition.current.start();
      setIsListening(true);
    }
  };

  const processVoiceInput = async (text) => {
    setIsLoading(true);
    try {
      // Send audio to webhook for processing
      const webhookResponse = await fetch('https://aatmikkp.app.n8n.cloud/webhook-test/voice_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!webhookResponse.ok) {
        throw new Error('Webhook processing failed');
      }

      // Process with Gemini
      await generateResponse(text);
    } catch (error) {
      console.error('Error processing voice input:', error);
      setAiResponse('Sorry, there was an error processing your voice input.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = async (input) => {
    try {
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

      const prompt = `${context}\n\nUser question: ${input}\n\nPlease provide a concise and natural response about rest stops based on our database. Include specific recommendations if available.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      setAiResponse(responseText);
      
      // Automatically read the response
      speakResponse(responseText);
    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Sorry, there was an error generating a response.');
    }
  };

  const speakResponse = (text) => {
    if (synthesis.speaking) {
      synthesis.cancel();
    }

    if (text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthesis.speak(utterance);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      synthesis.cancel();
      setIsSpeaking(false);
    } else if (aiResponse) {
      speakResponse(aiResponse);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Voice-Enabled Rest Stop Assistant</h2>
      
      {/* Voice Input Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            {isListening ? 'Listening...' : 'Press the microphone to speak'}
          </span>
          <div className="flex gap-4">
            <button
              onClick={toggleListening}
              className={`p-3 rounded-full ${
                isListening 
                  ? 'bg-red-600 text-white' 
                  : 'bg-blue-600 text-white'
              } hover:opacity-90 transition-colors`}
            >
              <FaMicrophone className={isListening ? 'animate-pulse' : ''} />
            </button>
            {aiResponse && (
              <button
                onClick={toggleSpeaking}
                className={`p-3 rounded-full ${
                  isSpeaking 
                    ? 'bg-red-600 text-white' 
                    : 'bg-blue-600 text-white'
                } hover:opacity-90 transition-colors`}
              >
                {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
            )}
          </div>
        </div>
        
        {/* Transcript Display */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <p className="text-gray-700">{transcript || 'Your voice input will appear here...'}</p>
          )}
        </div>
      </div>

      {/* AI Response Section */}
      {aiResponse && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Response:</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        </div>
      )}

      {/* Sample Questions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Try asking:</h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            "What rest stops are nearby?",
            "Which places have restaurants?",
            "Find rest stops with parking",
            "Where can I take a break?"
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => {
                setTranscript(question);
                processVoiceInput(question);
              }}
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

export default VoiceEnabledChat;
