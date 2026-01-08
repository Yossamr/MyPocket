import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, PieChart as PieChartIcon, Users, Bot, Wallet, CreditCard, Plus, Trash2, Bell, Moon, Sun, 
  ChevronLeft, ChevronRight, Settings, Target, CheckCircle2, WifiOff, PartyPopper, Lock, Gift, X, CalendarClock, Banknote, Calendar, MessageSquare, Sparkles, Loader2, ArrowRightLeft, PenSquare
} from 'lucide-react';
import { Transaction, TransactionType, AIParsedResult, PaymentAccount, Budget, SavingGoal, AICommandResult } from './types';
import { TransactionCard } from './components/TransactionCard';
import { StatsChart } from './components/StatsChart';
import { SmartInput } from './components/SmartInput';
import { AddTransactionModal } from './components/AddTransactionModal';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { SettingsModal } from './components/SettingsModal';
import { AppLock } from './components/AppLock';
import { Confetti } from './components/Confetti';
import { AdBanner } from './components/AdBanner'; 
import { SubscriptionModal } from './components/SubscriptionModal';
import { BudgetModal } from './components/BudgetModal';
import { getFinancialAdvice } from './services/geminiService';
import { translations } from './constants/translations';

// Adsterra Direct Link
const ADSTERRA_LINK = "https://www.effectivegatecpm.com/vsyhpgpm?key=244ec508a1e760e74126c1a2822dbebb";

enum Tab {
  HOME = 'HOME',
  STATS = 'STATS',
  INSTALLMENTS = 'INSTALLMENTS',
  DEBTS = 'DEBTS',
  AI_CHAT = 'AI_CHAT'
}

interface AppFeatures {
  budgets: boolean;
  goals: boolean;
  debtsIn: boolean;
  debtsOut: boolean;
}

interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  
  // Security
  useEffect(() => {
    const preventContext = (e: MouseEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
        }
    };
    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);
    return () => {
        document.removeEventListener('contextmenu', preventContext);
        document.removeEventListener('keydown', preventKeys);
    };
  }, []);
  
  // --- Persistent Settings ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('my_pocket_theme');
    return saved ? saved === 'dark' : false;
  });

  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem('my_pocket_lang');
    return (saved === 'en') ? 'en' : 'ar';
  });

  const [pin, setPin] = useState<string | null>(() => {
      return localStorage.getItem('my_pocket_pin');
  });

  const [isPremium, setIsPremium] = useState(() => {
      return localStorage.getItem('my_pocket_premium') === 'true';
  });

  const [features, setFeatures] = useState<AppFeatures>(() => {
    const saved = localStorage.getItem('my_pocket_features');
    if (saved) return JSON.parse(saved);
    return { budgets: true, goals: true, debtsIn: true, debtsOut: true };
  });

  const [isLocked, setIsLocked] = useState(!!localStorage.getItem('my_pocket_pin'));
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data State
  const [accounts, setAccounts] = useState<PaymentAccount[]>(() => {
      const saved = localStorage.getItem('my_pocket_accounts');
      if (saved) return JSON.parse(saved);
      return [{ id: 'cash', name: 'Cash', type: 'CASH', isDefault: true }];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('my_pocket_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
      const saved = localStorage.getItem('my_pocket_budgets');
      return saved ? JSON.parse(saved) : [];
  });

  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(() => {
      const saved = localStorage.getItem('my_pocket_goals');
      return saved ? JSON.parse(saved) : [];
  });

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
      const saved = localStorage.getItem('my_pocket_categories');
      return saved ? JSON.parse(saved) : [];
  });
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false); 
  const [modalType, setModalType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Modals
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const [notification, setNotification] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  // --- Effects ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('my_pocket_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('my_pocket_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('my_pocket_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('my_pocket_premium', String(isPremium));
  }, [isPremium]);

  useEffect(() => {
    localStorage.setItem('my_pocket_transactions', JSON.stringify(transactions));
    checkReminders();
  }, [transactions]);

  useEffect(() => { localStorage.setItem('my_pocket_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('my_pocket_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('my_pocket_goals', JSON.stringify(savingGoals)); }, [savingGoals]);
  useEffect(() => { localStorage.setItem('my_pocket_categories', JSON.stringify(customCategories)); }, [customCategories]);
  useEffect(() => { localStorage.setItem('my_pocket_features', JSON.stringify(features)); }, [features]);
  
  useEffect(() => {
      if (pin) localStorage.setItem('my_pocket_pin', pin);
      else localStorage.removeItem('my_pocket_pin');
  }, [pin]);

  useEffect(() => {
      if (notification) {
          const timer = setTimeout(() => setNotification(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [notification]);

  useEffect(() => {
      if (!isPremium && !sessionStorage.getItem('welcome_ad_shown')) {
          const timer = setTimeout(() => {
              setShowWelcomeAd(true);
              sessionStorage.setItem('welcome_ad_shown', 'true');
          }, 3000);
          return () => clearTimeout(timer);
      }
  }, [isPremium]);

  // --- Helpers ---
  const handleUpgrade = () => {
      setIsPremium(true);
      setShowConfetti(true);
      setNotification(lang === 'ar' ? '🎉 تم تفعيل الاشتراك بنجاح!' : '🎉 Premium activated!');
      setTimeout(() => setShowConfetti(false), 5000);
  };

  const addAccount = (name: string) => {
      if (!isPremium && accounts.length >= 2) { 
          setIsSettingsOpen(false);
          setIsSubscriptionOpen(true);
          return;
      }
      const newAcc: PaymentAccount = { id: Date.now().toString(), name, type: 'BANK' };
      setAccounts(prev => [...prev, newAcc]);
  };

  const deleteAccount = (id: string) => {
      setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addCategory = (cat: string) => {
      if (!customCategories.includes(cat)) {
          setCustomCategories(prev => [...prev, cat]);
      }
  };

  const removeCategory = (cat: string) => {
      setCustomCategories(prev => prev.filter(c => c !== cat));
  };

  const handleExportData = () => {
    if (!isPremium) {
        setIsSettingsOpen(false);
        setIsSubscriptionOpen(true);
        return;
    }
    const data = { transactions, accounts, budgets, savingGoals, customCategories, features, version: 3, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_pocket_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(t.backupSuccess);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.transactions) setTransactions(data.transactions);
              if (data.accounts) setAccounts(data.accounts);
              if (data.budgets) setBudgets(data.budgets);
              if (data.savingGoals) setSavingGoals(data.savingGoals);
              if (data.customCategories) setCustomCategories(data.customCategories);
              if (data.features) setFeatures(data.features);
              alert(t.restoreSuccess);
              setIsSettingsOpen(false);
          } catch (error) {
              alert(t.restoreError);
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const handleSetBudget = (category: string, limit: number) => {
    setBudgets(prev => {
      const existing = prev.filter(b => b.category !== category);
      return [...existing, { category, limit }];
    });
    setNotification(lang === 'ar' ? `تم تحديد ميزانية ${category}` : `Budget set for ${category}`);
  };

  const nextMonth = () => setCurrentDate(prev => { const n = new Date(prev); n.setMonth(prev.getMonth() + 1); return n; });
  const prevMonth = () => setCurrentDate(prev => { const n = new Date(prev); n.setMonth(prev.getMonth() - 1); return n; });
  const isCurrentMonth = () => { const now = new Date(); return currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear(); }
  const formatMonth = (date: Date) => date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentDate]);

  const getAccountBalance = (accountId: string) => {
      return transactions.reduce((sum, t) => {
          if ((t.accountId || 'cash') !== accountId) return sum;
          if (t.type === TransactionType.INCOME || t.type === TransactionType.DEBT_OWED_BY_ME) return sum + t.amount;
          if (t.type === TransactionType.EXPENSE || t.type === TransactionType.DEBT_OWED_TO_ME || t.type === TransactionType.SAVING || t.type === TransactionType.CREDIT_SPEND) return sum - t.amount;
          return sum;
      }, 0);
  };

  const overdueCount = transactions.filter(t => 
    t.type === TransactionType.DEBT_OWED_BY_ME && t.reminderDate && t.reminderDate <= new Date().toISOString().split('T')[0] && !t.isPaid
  ).length;

  const uniqueCategories = useMemo(() => {
    const caps = new Set<string>();
    transactions.forEach(t => t.category && caps.add(t.category));
    return Array.from(new Set([...Array.from(caps), ...t.defaultCategories, ...customCategories]));
  }, [transactions, customCategories, t.defaultCategories]);

  const updatedGoals = useMemo(() => {
      return savingGoals.map(goal => {
          const current = transactions
            .filter(t => t.type === TransactionType.SAVING && t.goalId === goal.id)
            .reduce((sum, t) => sum + t.amount, 0);
          return { ...goal, currentAmount: current };
      });
  }, [savingGoals, transactions]);

  // Calculate Budget Progress
  const budgetProgress = useMemo(() => {
      return budgets.map(b => {
          const spent = filteredTransactions
              .filter(t => (t.type === TransactionType.EXPENSE || t.type === TransactionType.CREDIT_SPEND) && t.category === b.category)
              .reduce((sum, t) => sum + t.amount, 0);
          return { ...b, spent, percentage: Math.min((spent / b.limit) * 100, 100) };
      }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, filteredTransactions]);

  const cashBalance = getAccountBalance('cash');
  const otherAccountsBalance = accounts.filter(a => !a.isDefault).reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);
  const totalBalance = cashBalance + otherAccountsBalance;

  const checkReminders = () => {
    if (!("Notification" in window)) return;
    const today = new Date().toISOString().split('T')[0];
    const dueDebts = transactions.filter(t => t.type === TransactionType.DEBT_OWED_BY_ME && t.reminderDate && t.reminderDate <= today && !t.isPaid);
    if (dueDebts.length > 0 && Notification.permission === "granted") {
        new Notification(lang === 'ar' ? 'تذكير بالمدفوعات' : 'Payment Reminder', {
          body: lang === 'ar' ? `لديك ${dueDebts.length} مدفوعات مستحقة.` : `You have ${dueDebts.length} payments due.`,
          tag: 'payment-reminder' 
        });
    }
  };

  const addTransaction = (data: AIParsedResult & { reminderDate?: string, accountId?: string, goalId?: string }) => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      accountId: data.accountId || 'cash',
      ...data
    };
    
    if (data.type === TransactionType.SAVING && data.goalId) {
       checkGoalCompletion(data.goalId, data.amount);
    }
    
    setTransactions(prev => [newTx, ...prev]);
    if (!isCurrentMonth()) setCurrentDate(new Date());
  };
  
  const checkGoalCompletion = (goalId: string, addedAmount: number) => {
     const goal = updatedGoals.find(g => g.id === goalId);
     if (goal) {
         const newTotal = goal.currentAmount + addedAmount;
         if (goal.currentAmount < goal.targetAmount && newTotal >= goal.targetAmount) {
             setShowConfetti(true);
             setNotification(lang === 'ar' ? `🎉 مبروك! حققت هدفك: ${goal.name}` : `🎉 Congrats! Goal reached: ${goal.name}`);
             setTimeout(() => setShowConfetti(false), 6000);
         }
     }
  }

  const handleAICommand = (result: AICommandResult) => {
      // Add user input and AI response to chat history
      const userMsg: ChatMessage = { id: Date.now().toString(), text: result.data.description || 'Command', isUser: true, timestamp: new Date() };
      const aiMsg: ChatMessage = { id: (Date.now()+1).toString(), text: result.message, isUser: false, timestamp: new Date() };
      setChatMessages(prev => [...prev, userMsg, aiMsg]);

      if (result.action === 'TRANSACTION') {
          if (result.data.type === TransactionType.SAVING && result.data.goalId) {
               checkGoalCompletion(result.data.goalId, result.data.amount);
          }
          addTransaction({ ...result.data, accountId: 'cash' });
      } else if (result.action === 'BUDGET' && features.budgets) {
          handleSetBudget(result.data.category, result.data.amount);
      } else if (result.action === 'GOAL' && features.goals) {
          // Simplified goal adding from AI
      }
      setNotification(result.message);
  };

  const handleAnalyzeFinances = async () => {
      if (transactions.length === 0) {
          setNotification(lang === 'ar' ? 'أضف معاملات أولاً للتحليل' : 'Add transactions first');
          return;
      }
      
      setIsAnalyzing(true);
      const userMsg: ChatMessage = { id: Date.now().toString(), text: lang === 'ar' ? 'حلل مصاريفي' : 'Analyze my finances', isUser: true, timestamp: new Date() };
      setChatMessages(prev => [...prev, userMsg]);

      const advice = await getFinancialAdvice(transactions, budgets, savingGoals);
      
      const aiMsg: ChatMessage = { id: (Date.now()+1).toString(), text: advice, isUser: false, timestamp: new Date() };
      setChatMessages(prev => [...prev, aiMsg]);
      setIsAnalyzing(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setSelectedTransaction(null);
  }

  const openAddModal = (type: TransactionType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const toggleTheme = () => setDarkMode(!darkMode);
  const toggleFeature = (key: keyof AppFeatures) => setFeatures((prev: AppFeatures) => ({ ...prev, [key]: !prev[key] }));
  const handleInstallClick = () => { if (deferredPrompt) deferredPrompt.prompt(); };

  // --- Render Functions ---

  const renderTransactionList = (list: Transaction[]) => {
      let lastMonth = "";
      return list.map((t, index) => {
          const tDate = new Date(t.date);
          const monthKey = tDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
          const showHeader = monthKey !== lastMonth;
          lastMonth = monthKey;
          const accName = accounts.find(a => a.id === (t.accountId || 'cash'))?.name;
          
          return (
              <React.Fragment key={t.id}>
                  {showHeader && (
                      <div className="flex items-center gap-3 mb-4 mt-8 opacity-0 animate-fade-in-up" style={{animationDelay: `${index * 20}ms`}}>
                          <div className="bg-purple-100 dark:bg-slate-700 p-1.5 rounded-lg text-purple-600 dark:text-purple-400"><Calendar size={14} /></div>
                          <span className="text-sm font-bold text-gray-500 dark:text-slate-400">{monthKey}</span>
                          <div className="h-[1px] flex-1 bg-gray-200 dark:bg-slate-700/50"></div>
                      </div>
                  )}
                  <TransactionCard transaction={t} onClick={() => setSelectedTransaction(t)} onDelete={deleteTransaction} lang={lang} index={index} accountName={accName} />
                  {!isPremium && (index + 1) % 5 === 0 && <AdBanner isPremium={isPremium} lang={lang} variant="inline" />}
              </React.Fragment>
          );
      });
  };

  const renderQuickActions = (mobile: boolean) => (
    <div className={`grid grid-cols-3 ${mobile ? 'gap-3 mb-8' : 'lg:grid-cols-2 gap-4'}`}>
        {[
          { label: t.expense, type: TransactionType.EXPENSE, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200' },
          { label: t.income, type: TransactionType.INCOME, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200' },
          ...(features.debtsOut ? [{ label: t.installments, type: TransactionType.DEBT_OWED_BY_ME, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200' }] : []),
        ].map((action) => (
          <button key={action.type} onClick={() => openAddModal(action.type)} className={`flex flex-col items-center gap-3 group bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700/50 hover:border-purple-200 transition-all ${mobile ? 'active:scale-95' : ''}`}>
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${action.color} shadow-sm transition-all duration-300 group-hover:scale-110`}><Plus size={24} strokeWidth={2.5} /></div>
            <span className="text-xs font-bold text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{action.label}</span>
          </button>
        ))}
    </div>
  );

  const renderBudgetProgress = () => {
    if (!features.budgets) return null;
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Target size={18} className="text-purple-600" />
                    {t.budgets}
                </h3>
                <button 
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                >
                    + {t.setBudget}
                </button>
            </div>
            
            {budgetProgress.length === 0 ? (
                 <div onClick={() => setIsBudgetModalOpen(true)} className="bg-white dark:bg-slate-800 border border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-purple-300 transition-colors">
                     <Target size={24} className="opacity-50" />
                     <p className="text-xs font-medium">{lang === 'ar' ? 'حدد ميزانية لمراقبة مصاريفك' : 'Set a budget to track spending'}</p>
                 </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar snap-x">
                    {budgetProgress.map(b => {
                        const isOver = b.spent > b.limit;
                        const isWarning = b.percentage > 75;
                        const color = isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';
                        const txtColor = isOver ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600';
                        
                        return (
                            <div key={b.category} className="snap-start min-w-[160px] bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-200 truncate max-w-[80px]">{b.category}</span>
                                    <button onClick={() => {
                                        setBudgets(prev => prev.filter(item => item.category !== b.category));
                                    }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 -mt-1 -mr-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                </div>
                                <div className="flex items-end gap-1 mb-2 relative z-10">
                                    <span className={`text-lg font-black ${txtColor}`}>{Math.round(b.percentage)}%</span>
                                    <span className="text-[10px] text-gray-400 mb-1">
                                        {b.spent.toLocaleString()} / {b.limit.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden relative z-10">
                                    <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(b.percentage, 100)}%` }}></div>
                                </div>
                                {/* Background glow for over budget */}
                                {isOver && <div className="absolute inset-0 bg-red-50/50 dark:bg-red-900/10 pointer-events-none"></div>}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
  };

  const renderHome = () => (
    <div className="animate-fade-in-up">
      <header className="mb-6 flex flex-col gap-4 pt-2">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">{t.appTitle}</h1>
                <p className="text-sm font-medium text-gray-400 dark:text-slate-400 mt-1">{t.appSubtitle}</p>
            </div>
            <div className="flex items-center gap-3">
                 <button onClick={() => setIsSettingsOpen(true)} className="glass-card p-3 rounded-2xl text-gray-600 dark:text-amber-400 shadow-sm transition-transform active:scale-90 hover:bg-white/80 dark:hover:bg-slate-700"><Settings size={20} /></button>
                 <button onClick={toggleTheme} className="glass-card p-3 rounded-2xl text-gray-600 dark:text-amber-400 shadow-sm transition-transform hover:rotate-12 active:scale-90 hover:bg-white/80 dark:hover:bg-slate-700">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>
        </div>

        <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 mt-2 lg:max-w-md">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-gray-600 dark:text-slate-300">{isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button>
            <div className="flex items-center gap-2">
                <Calendar size={18} className="text-purple-500" />
                <span className="font-bold text-gray-800 dark:text-white text-lg">{formatMonth(currentDate)}</span>
            </div>
            <button onClick={nextMonth} className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-gray-600 dark:text-slate-300 ${isCurrentMonth() ? 'opacity-30 cursor-not-allowed' : ''}`} disabled={isCurrentMonth()}>{isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-8">
            <div className="relative overflow-hidden rounded-2xl shadow-md mb-6 bg-slate-900 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                <div className="relative z-10 p-4">
                    <div className="flex flex-col items-center mb-4">
                        <span className="text-blue-200/60 text-[10px] font-bold uppercase tracking-wider mb-1">{t.balance}</span>
                        <h2 className="text-3xl font-bold tracking-tight dir-ltr">{totalBalance.toLocaleString()} <span className="text-xs opacity-60 font-normal">EGP</span></h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1.5 text-emerald-300 mb-1"><Banknote size={12} /><span className="text-[10px] font-medium">{t.netCash}</span></div>
                            <p className="text-sm font-bold">{cashBalance.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                             <div className="flex items-center gap-1.5 text-purple-300 mb-1"><Wallet size={12} /><span className="text-[10px] font-medium">{t.visaBalance}</span></div>
                             <p className="text-sm font-bold">{otherAccountsBalance.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {renderBudgetProgress()}
            
            <AdBanner isPremium={isPremium} lang={lang} variant="video-fake" />

            <div className="lg:hidden">
                {renderQuickActions(true)}
            </div>

            <SmartInput onCommand={handleAICommand} lang={lang} categories={uniqueCategories} goals={updatedGoals} />

            <div className="space-y-1 pb-8 min-h-[300px]">
                {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-slate-700/50 rounded-[32px] animate-scale-in">
                    <Wallet size={32} className="text-gray-300 dark:text-slate-600 mb-4" />
                    <p className="text-gray-400 dark:text-slate-500 font-medium text-lg">{t.noTransactions}</p>
                    {isCurrentMonth() && <button onClick={() => openAddModal(TransactionType.EXPENSE)} className="mt-4 text-purple-600 dark:text-purple-400 font-bold text-sm hover:underline">{t.addFirst}</button>}
                </div>
                ) : (
                renderTransactionList(filteredTransactions)
                )}
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6 hidden lg:block">
            {renderQuickActions(false)}
            <div>
                 <StatsChart transactions={filteredTransactions} darkMode={darkMode} lang={lang} />
            </div>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
      <div className="animate-fade-in-up space-y-6">
          <h2 className="text-2xl font-bold mb-4">{t.analysis}</h2>
          <StatsChart transactions={filteredTransactions} darkMode={darkMode} lang={lang} />
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm">
             <h3 className="font-bold mb-3">{t.recentTransactions}</h3>
             {renderTransactionList(filteredTransactions.slice(0, 5))}
          </div>
      </div>
  );

  const renderInstallments = () => {
      const installments = transactions.filter(t => t.type === TransactionType.DEBT_OWED_BY_ME).sort((a,b) => new Date(a.reminderDate || '').getTime() - new Date(b.reminderDate || '').getTime());
      return (
          <div className="animate-fade-in-up space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold">{t.installments}</h2>
              </div>
              
              <button
                onClick={() => openAddModal(TransactionType.DEBT_OWED_BY_ME)}
                className="w-full py-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-100 dark:border-amber-800/30 flex flex-col items-center justify-center gap-3 group active:scale-98 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 bg-white dark:bg-amber-900/40 rounded-full flex items-center justify-center shadow-sm text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                   <Plus size={32} strokeWidth={3} />
                </div>
                <span className="font-bold text-amber-800 dark:text-amber-300 text-lg">{lang === 'ar' ? 'إضافة قسط جديد' : 'Add New Installment'}</span>
              </button>

              <AdBanner isPremium={isPremium} lang={lang} variant="video-fake" />
              {installments.length === 0 ? <p className="text-gray-400 text-center py-10">{t.noTransactions}</p> : renderTransactionList(installments)}
          </div>
      );
  };

  const renderDebts = () => {
      const debts = transactions.filter(t => t.type === TransactionType.DEBT_OWED_TO_ME);
      return (
          <div className="animate-fade-in-up space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold">{t.debts}</h2>
              </div>

              <button
                onClick={() => openAddModal(TransactionType.DEBT_OWED_TO_ME)}
                className="w-full py-6 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/10 border border-teal-100 dark:border-teal-800/30 flex flex-col items-center justify-center gap-3 group active:scale-98 transition-all shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 bg-white dark:bg-teal-900/40 rounded-full flex items-center justify-center shadow-sm text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                   <Plus size={32} strokeWidth={3} />
                </div>
                <span className="font-bold text-teal-800 dark:text-teal-300 text-lg">{lang === 'ar' ? 'إضافة دين جديد' : 'Add New Debt'}</span>
              </button>

              {debts.length === 0 ? <p className="text-gray-400 text-center py-10">{t.noTransactions}</p> : renderTransactionList(debts)}
          </div>
      );
  };

  const renderAI = () => (
      <div className="animate-fade-in-up space-y-4 flex flex-col h-[calc(100vh-180px)]">
          <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold">{t.advisor}</h2>
               {chatMessages.length > 0 && (
                   <button 
                        onClick={handleAnalyzeFinances}
                        disabled={isAnalyzing}
                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                   >
                        {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {lang === 'ar' ? 'تحليل جديد' : 'Analyze Again'}
                   </button>
               )}
          </div>

          <div className="flex-1 overflow-y-auto bg-white/50 dark:bg-slate-800/50 rounded-3xl p-4 space-y-3 relative">
              {chatMessages.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                          <Bot size={40} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-lg">{t.advisorSubtitle}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-xs leading-relaxed">
                          {lang === 'ar' ? 'سأقوم بتحليل مصاريفك وتقديم نصائح مالية ذكية لتوفير المال.' : 'I will analyze your expenses and give smart tips to save money.'}
                      </p>
                      <button 
                        onClick={handleAnalyzeFinances}
                        disabled={isAnalyzing}
                        className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                         {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                         {lang === 'ar' ? 'ابدأ التحليل الآن' : 'Analyze My Finances'}
                      </button>
                  </div>
              )}
              {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-scale-in`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.isUser 
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-500/10' 
                          : 'bg-white dark:bg-slate-700 dark:text-white rounded-bl-none shadow-sm border border-gray-100 dark:border-slate-600'
                      }`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {isAnalyzing && (
                  <div className="flex justify-start animate-pulse">
                      <div className="bg-gray-200 dark:bg-slate-700 p-3 rounded-2xl rounded-bl-none">
                          <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
          <SmartInput onCommand={handleAICommand} lang={lang} categories={uniqueCategories} goals={updatedGoals} />
      </div>
  );

  return (
    <>
    <AppLock isLocked={isLocked} onUnlock={() => setIsLocked(false)} lang={lang} storedPin={pin} />
    {showConfetti && <Confetti />}
    <SubscriptionModal 
        isOpen={isSubscriptionOpen} 
        onClose={() => setIsSubscriptionOpen(false)} 
        onUpgrade={handleUpgrade}
        lang={lang}
    />
    
    <BudgetModal
      isOpen={isBudgetModalOpen}
      onClose={() => setIsBudgetModalOpen(false)}
      onSave={handleSetBudget}
      categories={uniqueCategories}
      lang={lang}
    />

    {showWelcomeAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowWelcomeAd(false)}></div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] w-full max-w-sm relative animate-scale-in text-center shadow-2xl">
                 <button onClick={() => setShowWelcomeAd(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={20}/></button>
                 <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
                     <Gift size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{lang === 'ar' ? 'مرحباً بك مجدداً!' : 'Welcome Back!'}</h3>
                 <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
                     {lang === 'ar' ? 'تطبيق جيبي مجاني بفضل دعمكم. هل يمكنك مشاهدة عرض سريع لدعم المطور؟' : 'Support us by watching a short ad.'}
                 </p>
                 <button onClick={() => { window.open(ADSTERRA_LINK, '_blank'); setShowWelcomeAd(false); }} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold mb-3">{lang === 'ar' ? 'دعم ومشاهدة' : 'Support & Watch'}</button>
                 <button onClick={() => setShowWelcomeAd(false)} className="text-gray-400 text-xs">{lang === 'ar' ? 'لا شكراً' : 'No thanks'}</button>
             </div>
        </div>
    )}

    {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
            <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold">
                <CheckCircle2 size={20} />
                {notification}
            </div>
        </div>
    )}

    <div className={`h-[100dvh] w-full flex ${darkMode ? 'bg-dark-bg' : 'mesh-bg light-mesh'} relative shadow-2xl overflow-hidden transition-colors duration-500`}>
      <div className="hidden lg:flex flex-col w-64 p-6 border-r border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-10 px-2 flex items-center gap-2"><div className="bg-purple-600 text-white p-2 rounded-xl"><Wallet size={24} /></div>My Pocket</h1>
        <nav className="flex-1 space-y-2">
            {[
              { id: Tab.HOME, icon: Home, label: t.tabs.home },
              { id: Tab.STATS, icon: PieChartIcon, label: t.tabs.stats },
              ...(features.debtsOut ? [{ id: Tab.INSTALLMENTS, icon: CalendarClock, label: t.tabs.installments }] : []),
              ...(features.debtsIn ? [{ id: Tab.DEBTS, icon: Users, label: t.tabs.debts }] : []),
              { id: Tab.AI_CHAT, icon: Bot, label: t.tabs.ai },
            ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                    <item.icon size={22} />{item.label}
                </button>
            ))}
        </nav>
        <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all mt-auto"><Settings size={22} />{t.settings}</button>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-6 lg:p-10 pt-safe-top w-full max-w-7xl mx-auto pb-44 lg:pb-10">
            {activeTab === Tab.HOME && renderHome()}
            {activeTab === Tab.STATS && renderStats()}
            {activeTab === Tab.INSTALLMENTS && renderInstallments()}
            {activeTab === Tab.DEBTS && renderDebts()}
            {activeTab === Tab.AI_CHAT && renderAI()}
          </div>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addTransaction}
        initialType={modalType}
        lang={lang}
        existingCategories={uniqueCategories}
        recentTransactions={transactions}
        accounts={accounts}
        savingGoals={savingGoals}
        enabledFeatures={features}
      />

      <TransactionDetailsModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} onDelete={deleteTransaction} lang={lang} />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accounts={accounts}
        onAddAccount={addAccount}
        onDeleteAccount={deleteAccount}
        onExportData={handleExportData}
        onImportData={handleImportData}
        lang={lang}
        onSetLang={setLang}
        customCategories={customCategories}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
        hasPin={!!pin}
        onSetPin={setPin}
        onRemovePin={() => setPin(null)}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        features={features}
        onToggleFeature={toggleFeature}
        installPrompt={deferredPrompt}
        onInstall={handleInstallClick}
        isPremium={isPremium}
        onOpenSubscription={() => { setIsSettingsOpen(false); setIsSubscriptionOpen(true); }}
      />
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-5 pb-safe-bottom pointer-events-none flex justify-center w-full">
        <div className="w-full max-w-lg pointer-events-auto">
             <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] p-2 shadow-2xl shadow-slate-400/20 dark:shadow-black/60 border border-white/40 dark:border-slate-700/50 flex justify-between items-center gap-1">
                {[
                  { id: Tab.HOME, icon: Home, label: t.tabs.home },
                  { id: Tab.STATS, icon: PieChartIcon, label: t.tabs.stats },
                  ...(features.debtsOut ? [{ id: Tab.INSTALLMENTS, icon: CalendarClock, label: t.tabs.installments }] : []),
                  ...(features.debtsIn ? [{ id: Tab.DEBTS, icon: Users, label: t.tabs.debts }] : []),
                  { id: Tab.AI_CHAT, icon: Bot, label: t.tabs.ai },
                ].map((item) => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`relative flex flex-col items-center justify-center w-full py-3 rounded-3xl transition-all duration-300 ${activeTab === item.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}>
                        {activeTab === item.id && <span className="absolute inset-0 bg-purple-50 dark:bg-purple-900/20 rounded-3xl -z-10 scale-90 animate-scale-in"></span>}
                        <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} className={`mb-1 transition-transform duration-300 ${activeTab === item.id ? '-translate-y-0.5' : ''}`} />
                        <span className={`text-[10px] font-bold transition-all duration-300 whitespace-nowrap ${activeTab === item.id ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 -translate-y-2 h-0 overflow-hidden'}`}>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;