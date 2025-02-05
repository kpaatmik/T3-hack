import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaMicrophone, FaStop, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const AudioChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restPlaces, setRestPlaces] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const synthesis = window.speechSynthesis;

  // Initialize audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000, // OpenAI recommended sample rate
          sampleSize: 16,    // 16-bit audio
        } 
      });
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',  // Using webm for better compatibility
      });
      
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        // Convert to wav format for OpenAI
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudioData(audioBlob);
      };

      mediaRecorder.current.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice input');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudioData = async (audioBlob) => {
    setIsLoading(true);
    try {
      // Create FormData with the audio blob
      const formData = new FormData();
      formData.append('voice_message', audioBlob, 'audio.wav');

      // Send to webhook
      const response = await fetch('https://aatmikkp.app.n8n.cloud/webhook-test/voice_message', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();
      // Check for the transcribed text in the response
      if (data.text) {
        await generateResponse(data.text);
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setAiResponse('Sorry, there was an error processing your voice input. Please try again.');
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

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Sample questions that can be processed directly
  const handleSampleQuestion = async (question) => {
    setIsLoading(true);
    await generateResponse(question);
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Voice-Enabled Rest Stop Assistant</h2>
      
      {/* Recording Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            {isRecording ? 'Recording... Click stop when finished' : 'Click the microphone to start recording'}
          </span>
          <div className="flex gap-4">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full ${
                isRecording 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-blue-600 text-white'
              } hover:opacity-90 transition-colors`}
            >
              {isRecording ? <FaStop /> : <FaMicrophone />}
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
        
        {/* Status Display */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Processing your request...</p>
            </div>
          ) : isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <div className="w-8 h-8 bg-red-600 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-600">Recording in progress...</p>
            </div>
          ) : (
            <p className="text-gray-600 text-center">Ready to record your question</p>
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
              onClick={() => handleSampleQuestion(question)}
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

export default AudioChat;
