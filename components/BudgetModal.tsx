import React, { useState, useEffect } from 'react';
import { X, Check, Target, PieChart, AlertCircle } from 'lucide-react';
import { translations } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: string, limit: number) => void;
  categories: string[];
  lang: 'ar' | 'en';
}

export const BudgetModal: React.FC<Props> = ({ isOpen, onClose, onSave, categories, lang }) => {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      setCategory(categories[0] || '');
      setLimit('');
      setIsClosing(false);
    }
  }, [isOpen, categories]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && limit) {
      onSave(category, parseFloat(limit));
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
      
      <div className={`bg-white dark:bg-slate-800 w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 pb-safe-bottom sm:pb-8 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isClosing ? 'translate-y-full' : 'translate-y-0 animate-slide-up'} border border-gray-100 dark:border-slate-700/50`}>
        
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-6 opacity-60"></div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                <PieChart size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t.setBudget}</h3>
          </div>
          <button onClick={handleClose} className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t.category}</label>
            <div className="relative">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-transparent focus:ring-2 focus:ring-blue-500/30 outline-none text-sm font-bold text-gray-700 dark:text-white appearance-none transition-all"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <div className={`absolute ${lang === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-gray-400`}>
                    <Target size={18} />
                </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t.budgetLimit}</label>
            <div className="relative">
                <input 
                    type="number" 
                    required
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className={`w-full p-4 ${lang === 'ar' ? 'pl-16' : 'pr-16'} bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-transparent focus:ring-2 focus:ring-blue-500/30 outline-none text-2xl font-bold text-gray-800 dark:text-white`}
                    placeholder="0"
                    autoFocus
                />
                <span className={`absolute ${lang === 'ar' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg`}>EGP</span>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 items-start">
             <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
             <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                {lang === 'ar' 
                 ? 'سيظهر شريط تقدم في الصفحة الرئيسية لتنبيهك عند الاقتراب من الحد الأقصى.' 
                 : 'A progress bar will appear on the home screen to warn you when you approach the limit.'}
             </p>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-3xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-2 shadow-xl shadow-blue-500/20">
            <span>{t.save}</span>
            <Check size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};