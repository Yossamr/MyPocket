import React, { useState, useEffect } from 'react';
import { Lock, Delete, ShieldCheck, Fingerprint } from 'lucide-react';
import { translations } from '../constants/translations';

interface Props {
  isLocked: boolean;
  onUnlock: () => void;
  lang: 'ar' | 'en';
  storedPin: string | null;
}

export const AppLock: React.FC<Props> = ({ isLocked, onUnlock, lang, storedPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    if (storedPin && pin.length === storedPin.length) {
      if (pin === storedPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
            setPin('');
            setError(false);
        }, 500);
      }
    }
  }, [pin, storedPin, onUnlock]);

  if (!isLocked) return null;

  const handleNumClick = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col items-center justify-center p-4 transition-all duration-300">
      <div className="mb-8 flex flex-col items-center animate-fade-in-up">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${error ? 'bg-red-500/20 text-red-500' : 'bg-purple-500/20 text-purple-400'}`}>
             {error ? <Lock size={32} /> : <ShieldCheck size={32} />}
        </div>
        <h2 className="text-2xl font-bold mb-2">{t.enterPin}</h2>
        <p className="text-slate-400 text-sm h-6">{error ? t.wrongPin : ''}</p>
      </div>

      <div className="flex gap-4 mb-12">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < pin.length 
                ? (error ? 'bg-red-500 scale-110' : 'bg-purple-500 scale-110') 
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            className="w-20 h-20 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors text-2xl font-bold flex items-center justify-center shadow-lg shadow-black/20"
          >
            {num}
          </button>
        ))}
        <div className="w-20 h-20 flex items-center justify-center opacity-0 pointer-events-none"></div>
        <button
          onClick={() => handleNumClick(0)}
          className="w-20 h-20 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors text-2xl font-bold flex items-center justify-center shadow-lg shadow-black/20"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-20 h-20 rounded-full bg-transparent hover:bg-white/5 active:bg-white/10 transition-colors flex items-center justify-center text-slate-400"
        >
          <Delete size={28} />
        </button>
      </div>
      
      <div className="mt-8 text-slate-500 text-xs flex items-center gap-2">
         <Fingerprint size={14} />
         {translations[lang].appTitle} Security
      </div>
    </div>
  );
};