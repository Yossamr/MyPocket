import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Check, Wallet, Bell, Sparkles, CreditCard, ChevronDown, Target } from 'lucide-react';
import { TransactionType, AIParsedResult, Transaction, PaymentAccount, SavingGoal } from '../types';
import { translations } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AIParsedResult & { reminderDate?: string, accountId: string, goalId?: string }) => void;
  initialType: TransactionType;
  lang: 'ar' | 'en';
  existingCategories?: string[];
  recentTransactions?: Transaction[];
  accounts: PaymentAccount[];
  savingGoals?: SavingGoal[];
  enabledFeatures: { goals: boolean; debtsIn: boolean; debtsOut: boolean };
}

// Adsterra Link
const ADSTERRA_LINK = "https://www.effectivegatecpm.com/vsyhpgpm?key=244ec508a1e760e74126c1a2822dbebb";

export const AddTransactionModal: React.FC<Props> = ({ 
    isOpen, onClose, onSubmit, initialType, lang, existingCategories = [], recentTransactions = [], accounts, savingGoals = [], enabledFeatures
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [type, setType] = useState(initialType);
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'cash');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount('');
      setCategory('');
      setDescription('');
      setReminderDate('');
      setAccountId(accounts[0]?.id || 'cash');
      setSelectedGoalId('');
      setSuggestedCategory(null);
      setShouldRender(true);
      setIsClosing(false);
    } else {
        setIsClosing(true);
        const timer = setTimeout(() => setShouldRender(false), 300);
        return () => clearTimeout(timer);
    }
  }, [initialType, isOpen, accounts]);

  const allCategories = Array.from(new Set([...t.defaultCategories, ...existingCategories]));
  const filteredCategories = allCategories.filter(c => c.toLowerCase().includes(category.toLowerCase()));

  useEffect(() => {
    if (!description.trim()) {
        setSuggestedCategory(null);
        return;
    }
    const match = recentTransactions.find(t => 
        t.description && t.description.toLowerCase().includes(description.toLowerCase().trim())
    );
    if (match) {
        setSuggestedCategory(match.category);
    } else {
        setSuggestedCategory(null);
    }
  }, [description, recentTransactions]);

  const handleClose = () => {
      setIsClosing(true);
      setTimeout(onClose, 300);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- Ad Trigger: Post-Success Moment ---
    const isPremium = localStorage.getItem('my_pocket_premium') === 'true';
    if (!isPremium) {
        // Delay opening the ad slightly to allow the "Save" animation to start
        setTimeout(() => {
             window.open(ADSTERRA_LINK, '_blank');
        }, 500);
    }

    onSubmit({
      amount: parseFloat(amount),
      category,
      description,
      type,
      reminderDate: reminderDate || undefined,
      accountId,
      goalId: type === TransactionType.SAVING ? selectedGoalId : undefined
    });
    handleClose();
  };

  const getTitle = () => {
    switch(type) {
        case TransactionType.INCOME: return t.types.INCOME;
        case TransactionType.EXPENSE: return t.types.EXPENSE;
        case TransactionType.SAVING: return t.types.SAVING;
        case TransactionType.CREDIT_SPEND: return t.types.CREDIT;
        case TransactionType.DEBT_OWED_TO_ME: return t.types.DEBT_IN;
        case TransactionType.DEBT_OWED_BY_ME: return t.types.DEBT_OUT;
        default: return t.appTitle;
    }
  }

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
      
      <div className={`bg-white dark:bg-slate-800 w-full max-w-md sm:max-w-xl rounded-t-[40px] sm:rounded-[40px] p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-8 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isClosing ? 'translate-y-full' : 'translate-y-0 animate-slide-up'} border border-gray-100 dark:border-slate-700/50 max-h-[90dvh] overflow-y-auto relative`}>
        
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-6 opacity-60"></div>

        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/0 z-10">
          <div className="flex items-center gap-3">
            <div className={`p-3.5 rounded-2xl shadow-sm ${
                type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' :
                type === TransactionType.EXPENSE ? 'bg-rose-100 text-rose-600' :
                'bg-blue-100 text-blue-600'
            } dark:bg-opacity-20`}>
                <Wallet size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{getTitle()}</h3>
          </div>
          <button onClick={handleClose} className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-full text-gray-500 dark:text-gray-400 hover:rotate-90 transition-transform hover:bg-gray-100"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t.amount}</label>
            <div className="relative transform transition-transform duration-200 focus-within:scale-[1.02]">
                <input 
                type="number" 
                required
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={`w-full p-5 ${lang === 'ar' ? 'pl-16' : 'pr-16'} bg-gray-50 dark:bg-slate-900/50 rounded-3xl border-2 border-transparent focus:border-purple-500/50 dark:focus:border-purple-400/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-4xl font-bold text-gray-800 dark:text-white shadow-inner`}
                placeholder="0"
                autoFocus
                />
                <span className={`absolute ${lang === 'ar' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl`}>EGP</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700/50 flex">
             {accounts.map(acc => (
                 <button
                    key={acc.id}
                    type="button"
                    onClick={() => setAccountId(acc.id)}
                    className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                        accountId === acc.id 
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm scale-100' 
                        : 'text-gray-400 dark:text-slate-500 scale-95'
                    }`}
                 >
                    {acc.name}
                 </button>
             ))}
          </div>

           {type === TransactionType.SAVING && enabledFeatures.goals && savingGoals.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-3xl border border-blue-100 dark:border-blue-800">
                  <label className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Target size={14} />
                      {t.addToGoal}
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      <button
                           type="button"
                           onClick={() => setSelectedGoalId('')}
                           className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border transition-all ${!selectedGoalId ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-800 text-gray-500 border-gray-200 dark:border-slate-600'}`}
                      >
                          {t.types.SAVING} ({t.save})
                      </button>
                      {savingGoals.map(goal => (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() => setSelectedGoalId(goal.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border transition-all ${selectedGoalId === goal.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-800 text-gray-500 border-gray-200 dark:border-slate-600'}`}
                          >
                              {goal.name}
                          </button>
                      ))}
                  </div>
              </div>
          )}


          <div className="grid grid-cols-2 gap-4 relative">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t.category}</label>
                <div className="relative">
                    <select 
                        value={type} 
                        onChange={e => setType(e.target.value as TransactionType)}
                        className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-transparent focus:ring-2 focus:ring-purple-500/30 outline-none text-sm font-bold text-gray-700 dark:text-gray-200 appearance-none transition-all hover:bg-gray-100 dark:hover:bg-slate-900"
                    >
                        <option value={TransactionType.INCOME}>{t.types.INCOME}</option>
                        <option value={TransactionType.EXPENSE}>{t.types.EXPENSE}</option>
                        {enabledFeatures.goals && <option value={TransactionType.SAVING}>{t.types.SAVING}</option>}
                        {enabledFeatures.debtsIn && <option value={TransactionType.DEBT_OWED_TO_ME}>{t.types.DEBT_IN}</option>}
                        {enabledFeatures.debtsOut && <option value={TransactionType.DEBT_OWED_BY_ME}>{t.types.DEBT_OUT}</option>}
                    </select>
                </div>
            </div>
            <div className="relative">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t.category}</label>
                <input 
                ref={categoryInputRef}
                type="text" 
                required
                value={category}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-transparent focus:ring-2 focus:ring-purple-500/30 outline-none text-sm font-bold text-gray-700 dark:text-white transition-all hover:bg-gray-100 dark:hover:bg-slate-900"
                placeholder={lang === 'ar' ? 'مثال: أكل' : 'e.g. Food'}
                autoComplete="off"
                />
                {showSuggestions && filteredCategories.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 max-h-40 overflow-y-auto z-20">
                        {filteredCategories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className="w-full text-right rtl:text-right ltr:text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-50 dark:border-slate-700/50 last:border-none"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t.description}</label>
            <div className="relative">
                <input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-transparent focus:ring-2 focus:ring-purple-500/30 outline-none text-sm font-medium text-gray-700 dark:text-white transition-all hover:bg-gray-100 dark:hover:bg-slate-900"
                placeholder="..."
                />
                
                {suggestedCategory && suggestedCategory !== category && (
                    <button
                        type="button"
                        onClick={() => { setCategory(suggestedCategory); setSuggestedCategory(null); }}
                        className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-xl text-xs font-bold animate-fade-in-up hover:bg-purple-200 transition-colors"
                    >
                        <Sparkles size={12} />
                        <span>{suggestedCategory}</span>
                    </button>
                )}
            </div>
          </div>

          {type === TransactionType.DEBT_OWED_BY_ME && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-3xl border border-amber-100 dark:border-amber-800 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                   <label className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                      <Calendar size={18} />
                      {t.dueDate}
                  </label>
                  <Bell size={16} className="text-amber-600/50 dark:text-amber-400/50" />
                </div>
                <input 
                    type="date" 
                    value={reminderDate}
                    onChange={e => setReminderDate(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-800 dark:text-white rounded-xl border border-amber-200 dark:border-amber-700 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>
          )}

          <button type="submit" className="w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black py-4 rounded-3xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 shadow-xl shadow-gray-300/50 dark:shadow-purple-900/10 mt-4">
            <span>{t.save}</span>
            <Check size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};