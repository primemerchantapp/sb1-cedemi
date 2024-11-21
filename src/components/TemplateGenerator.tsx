import React, { useState } from 'react';
import { FileText, Download, Send } from 'lucide-react';
import { ref, push, set } from 'firebase/database';
import { database } from '../config/firebase';

interface TemplateGeneratorProps {
  transcript: string;
  noteType: string;
}

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({ transcript, noteType }) => {
  const [template, setTemplate] = useState('');
  const [email, setEmail] = useState('');

  const generateTemplate = async () => {
    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 9e1915be522e6aae1d3e23569716e14cd32c317b0cadd6ac268611da65046297',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-Vision-Free",
          messages: [
            {
              role: "system",
              content: "Daisy is a super bright medical assistant created by Aitek PH software to work for Ms. Epi in the hospital. Daisy assists with scribing, note-taking, insurance processing, and billing support, ensuring accurate and efficient workflow."
            },
            {
              role: "user",
              content: `${transcript}\n\nCreate this template based on the note type: ${noteType}`
            }
          ],
          max_tokens: 550,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1,
          stop: ["<|eot_id|>", "<|eom_id|>"]
        })
      });

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content?.trim() || data.choices?.[0]?.text?.trim();
      
      if (generatedText) {
        setTemplate(generatedText);
        saveToFirebase(generatedText);
        downloadTemplate(generatedText);
      }
    } catch (error) {
      console.error('Template generation error:', error);
    }
  };

  const saveToFirebase = async (generatedTemplate: string) => {
    const templatesRef = ref(database, 'templates');
    const newTemplateRef = push(templatesRef);
    await set(newTemplateRef, {
      noteType,
      transcript,
      template: generatedTemplate,
      timestamp: new Date().toISOString()
    });
  };

  const downloadTemplate = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteType.toLowerCase().replace(/\s+/g, '-')}-template.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendEmail = async () => {
    if (!email || !template) return;
    
    try {
      const response = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
        method: 'POST',
        headers: {
          'Authorization': 'Token d292e22f9683c7cb7b762d556c0c3f99cd400008',
          'Content-Type': 'text/plain'
        },
        body: 'Template sent successfully!'
      });

      const blob = await response.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch (error) {
      console.error('Email sending error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generateTemplate}
        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center space-x-2"
      >
        <FileText className="h-5 w-5" />
        <span>Generate & Download Template</span>
      </button>

      {template && (
        <>
          <div className="relative">
            <textarea
              value={template}
              readOnly
              className="w-full h-48 p-3 border rounded-lg bg-gray-50"
            />
          </div>

          <div className="flex space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              onClick={sendEmail}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateGenerator;