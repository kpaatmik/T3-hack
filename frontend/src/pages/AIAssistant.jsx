import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaVolumeUp, FaRobot } from 'react-icons/fa';

export default function AIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognition = useRef(null);
  const synthesis = useRef(window.speechSynthesis);

  useEffect(() => {
    // Initialize Web Speech API
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
    } else {
      console.error('Speech recognition not supported');
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (synthesis.current) {
        synthesis.current.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition.current.stop();
    } else {
      setTranscript('');
      recognition.current.start();
    }
    setIsListening(!isListening);
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    try {
      // Mock API call - replace with actual AI service call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = "I understand you're looking for assistance. Here's a real-time traffic update: The highway is currently experiencing moderate traffic flow with an average speed of 60 km/h. I recommend taking the next rest stop in about 30 minutes for optimal journey planning.";
      setResponse(mockResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setResponse('Sorry, I encountered an error. Please try again.');
    }
    setIsLoading(false);
  };

  const speakResponse = () => {
    if (isSpeaking) {
      synthesis.current.cancel();
      setIsSpeaking(false);
      return;
    }

    if (response) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.onend = () => setIsSpeaking(false);
      synthesis.current.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center">
              <FaRobot className="h-6 w-6 text-white" />
              <h1 className="ml-3 text-xl font-semibold text-white">AI Travel Assistant</h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Voice Input Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Voice Input</h2>
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    isListening
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                  } hover:opacity-90 transition-colors`}
                >
                  {isListening ? (
                    <>
                      <FaStop /> Stop
                    </>
                  ) : (
                    <>
                      <FaMicrophone /> Start
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {transcript || 'Speak something...'}
              </div>
            </div>

            {/* Response Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">AI Response</h2>
                {response && (
                  <button
                    onClick={speakResponse}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isSpeaking ? 'bg-red-600' : 'bg-blue-600'
                    } text-white hover:opacity-90 transition-colors`}
                  >
                    <FaVolumeUp />
                    {isSpeaking ? 'Stop' : 'Read It'}
                  </button>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  response || 'AI response will appear here...'
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!transcript || isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get AI Response
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Voice Commands</h3>
            <p className="text-gray-600">
              Try saying:
              <ul className="list-disc list-inside mt-2">
                <li>"What's the traffic like ahead?"</li>
                <li>"Find the nearest rest stop"</li>
                <li>"Show me restaurants nearby"</li>
              </ul>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
            <p className="text-gray-600">
              Get instant updates about:
              <ul className="list-disc list-inside mt-2">
                <li>Traffic conditions</li>
                <li>Weather alerts</li>
                <li>Rest stop availability</li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
