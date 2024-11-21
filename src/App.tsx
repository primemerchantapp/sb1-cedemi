import React, { useState } from 'react';
import { 
  List,
  Home,
  Users,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import TemplateGenerator from './components/TemplateGenerator';

function App() {
  const [transcript, setTranscript] = useState('');

  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text);
  };

  const handleLogout = () => {
    // Implement logout logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Daisy Medic</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
          
          {transcript && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Transcript
                </label>
                <textarea
                  value={transcript}
                  readOnly
                  className="w-full h-32 p-3 border rounded-lg bg-gray-50"
                />
              </div>
              
              <TemplateGenerator transcript={transcript} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <List className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Home className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Users className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <LayoutDashboard className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;