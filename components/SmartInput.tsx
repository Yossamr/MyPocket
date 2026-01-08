import React, { useState } from 'react';
import { Sparkles, Loader2, SendHorizontal, Mic, MicOff } from 'lucide-react';
import { parseAIInput } from '../services/geminiService';
import { AICommandResult, SavingGoal } from '../types';
import { translations } from '../constants/translations';

interface Props {
  onCommand: (result: AICommandResult) => void;
  lang?: 'ar' | 'en';
  categories: string[];
  goals: SavingGoal[];
}

// Adsterra Link
const ADSTERRA_LINK = "https://www.effectivegatecpm.com/vsyhpgpm?key=244ec508a1e760e74126c1a2822dbebb";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const SmartInput: React.FC<Props> = ({ onCommand, lang = 'ar', categories, goals }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const t = translations[lang];

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("المتصفح لا يدعم التسجيل الصوتي");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
    };

    recognition.onerror = () => {
        setIsListening(false);
        // Don't alert immediately on error as it might be a no-speech error
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    // Pass goals to the service so AI knows about them
    const result = await parseAIInput(input, categories, goals);
    
    if (!result) {
        // Technical error (API Key missing or Network error)
        alert(lang === 'ar' 
            ? "عفواً، هناك مشكلة في الاتصال بالذكاء الاصطناعي. تأكد من إنشاء ملف .env.local ووضع API_KEY بداخله، ثم أعد تشغيل التطبيق." 
            : "Connection Error. Please ensure you have an .env.local file with your API_KEY and restart the app.");
    } else if (result.action !== 'UNKNOWN') {
        // Success - Trigger Ad
        const isPremium = localStorage.getItem('my_pocket_premium') === 'true';
        if (!isPremium) {
            window.open(ADSTERRA_LINK, '_blank');
        }

        onCommand(result);
        setInput('');
    } else {
        // AI replied but didn't understand
        alert(lang === 'ar' ? "لم أفهم الأمر. جرب: 'صرفت 50 مواصلات' أو 'ميزانية للطعام 3000'" : "Couldn't understand. Try: 'Spent 50' or 'Budget Food 3000'");
    }
    setLoading(false);
  };

  return (
    <div className={`relative transition-all duration-500 ease-out transform ${isFocused ? 'scale-[1.02]' : 'scale-100'} mb-8 z-20`}>
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 transition duration-1000 group-hover:opacity-40 ${isFocused ? 'opacity-40' : 'opacity-0'}`}></div>
      
      <div className="relative bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-xl shadow-purple-900/5 dark:shadow-none border border-gray-100 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="pl-3 pr-2 flex items-center justify-center text-purple-600 dark:text-purple-400">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className={input ? "animate-pulse" : ""} />}
            </div>
            
            <input
                type="text"
                value={isListening ? t.listening : input}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.inputPlaceholder}
                className={`flex-1 p-3 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none text-base font-medium ${isListening ? 'animate-pulse text-purple-600' : ''}`}
                disabled={loading || isListening}
            />
            
            <button 
                type="button"
                onClick={startListening}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400'}`}
            >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button 
                type="submit" 
                disabled={loading || !input}
                className={`p-3 rounded-xl transition-all duration-300 ${
                    input && !isListening
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 rotate-0' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 rotate-90 scale-90'
                }`}
            >
                <SendHorizontal size={20} className="rtl:rotate-180" />
            </button>
        </form>
      </div>
    </div>
  );
};