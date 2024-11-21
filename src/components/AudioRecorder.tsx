import React, { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Mic, StopCircle, Upload } from 'lucide-react';
import { ref, push, set } from 'firebase/database';
import { database } from '../config/firebase';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  noteType: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionComplete, noteType }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ 
    audio: true,
    onStop: (blobUrl, blob) => handleRecordingComplete(blob)
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    startRecording();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopRecording();
  };

  const handleRecordingComplete = async (blob: Blob) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = async () => {
      try {
        const response = await fetch('https://api.deepgram.com/v1/listen', {
          method: 'POST',
          headers: {
            'Authorization': 'Token d292e22f9683c7cb7b762d556c0c3f99cd400008',
            'Content-Type': 'audio/wav'
          },
          body: reader.result
        });

        const data = await response.json();
        const transcript = data.results?.channels[0]?.alternatives[0]?.transcript;
        
        if (transcript) {
          onTranscriptionComplete(transcript);
          saveToFirebase(transcript);
        }
      } catch (error) {
        console.error('Transcription error:', error);
      }
    };
  };

  const saveToFirebase = async (transcript: string) => {
    const templatesRef = ref(database, 'templates');
    const newTemplateRef = push(templatesRef);
    await set(newTemplateRef, {
      noteType,
      transcript,
      timestamp: new Date().toISOString()
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleStartRecording}
          disabled={isRecording}
          className={`p-4 rounded-full ${
            isRecording ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors ${isRecording && 'recording-active'}`}
        >
          <Mic className="h-6 w-6" />
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!isRecording}
          className={`p-4 rounded-full ${
            !isRecording ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
        >
          <StopCircle className="h-6 w-6" />
        </button>
      </div>

      {isRecording && (
        <div className="text-center text-sm font-medium text-gray-600">
          {formatTime(recordingTime)}
        </div>
      )}

      {mediaBlobUrl && (
        <div className="flex justify-center">
          <audio src={mediaBlobUrl} controls className="w-full max-w-md" />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;