import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaVolumeUp, FaRobot, FaEnvelope, FaComment } from 'react-icons/fa';
import { getTravelAssistance } from '../services/geminiService';

export default function AIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState('voice'); // 'voice', 'messages', 'emails'
  const [messages] = useState([
    { id: 1, text: "Your rest stop reservation has been confirmed for 3:00 PM.", time: "2:30 PM" },
    { id: 2, text: "Traffic alert: Slow traffic ahead due to construction work.", time: "2:45 PM" },
    { id: 3, text: "Weather update: Clear skies for your journey ahead.", time: "3:00 PM" },
  ]);
  const [emails] = useState([
    { id: 1, subject: "Rest Stop Booking Confirmation", content: "Your booking at Highway Rest Stop #123 has been confirmed for today at 3:00 PM. Your confirmation number is RS123456.", time: "2:30 PM" },
    { id: 2, subject: "Travel Advisory", content: "Due to scheduled maintenance, the highway section between kilometer markers 45-50 will have reduced lanes tomorrow from 10 AM to 2 PM.", time: "2:45 PM" },
  ]);

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
      console.log('Sending transcript to Gemini:', transcript);
      const aiResponse = await getTravelAssistance(transcript);
      console.log('Received response from Gemini:', aiResponse);
      setResponse(aiResponse);
    } catch (error) {
      console.error('Error in AI Assistant:', error);
      setResponse(error.message || 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if (isSpeaking) {
      synthesis.current.cancel();
      setIsSpeaking(false);
      return;
    }

    if (text) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      synthesis.current.speak(utterance);
    }
  };

  const readAllMessages = () => {
    const allMessages = messages.map(msg => `Message from ${msg.time}: ${msg.text}`).join('. ');
    speakText(allMessages);
  };

  const readAllEmails = () => {
    const allEmails = emails.map(email => 
      `Email from ${email.time}. Subject: ${email.subject}. Content: ${email.content}`
    ).join('. ');
    speakText(allEmails);
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

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('voice')}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'voice'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Voice Assistant
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => setActiveTab('emails')}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'emails'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Emails
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {activeTab === 'voice' && (
              <>
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
                        onClick={() => speakText(response)}
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
              </>
            )}

            {activeTab === 'messages' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                  <button
                    onClick={readAllMessages}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <FaVolumeUp />
                    Read All Messages
                  </button>
                </div>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-900">{message.text}</p>
                          <p className="text-sm text-gray-500 mt-1">{message.time}</p>
                        </div>
                        <button
                          onClick={() => speakText(message.text)}
                          className="ml-4 text-blue-600 hover:text-blue-700"
                        >
                          <FaVolumeUp />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'emails' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
                  <button
                    onClick={readAllEmails}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <FaVolumeUp />
                    Read All Emails
                  </button>
                </div>
                <div className="space-y-4">
                  {emails.map((email) => (
                    <div key={email.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{email.subject}</h3>
                          <p className="text-gray-700 mt-2">{email.content}</p>
                          <p className="text-sm text-gray-500 mt-1">{email.time}</p>
                        </div>
                        <button
                          onClick={() => speakText(`Subject: ${email.subject}. ${email.content}`)}
                          className="ml-4 text-blue-600 hover:text-blue-700"
                        >
                          <FaVolumeUp />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Voice Commands</h3>
            <p className="text-gray-600">
              Try saying:
              <ul className="list-disc list-inside mt-2">
                <li>"Read my latest messages"</li>
                <li>"Check my emails"</li>
                <li>"Read the traffic updates"</li>
              </ul>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Available Actions</h3>
            <p className="text-gray-600">
              Features available:
              <ul className="list-disc list-inside mt-2">
                <li>Read messages aloud</li>
                <li>Read emails aloud</li>
                <li>Voice command support</li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
