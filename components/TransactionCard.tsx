import React from 'react';
import { Transaction, TransactionType, PaymentAccount } from '../types';
import { ArrowUp, ArrowDown, CreditCard, PiggyBank, ArrowRightLeft, Calendar, AlertCircle, Clock, Banknote, Wallet, History, Trash2 } from 'lucide-react';
import { translations } from '../constants/translations';

interface Props {
  transaction: Transaction;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  lang: 'ar' | 'en';
  index?: number;
  accountName?: string;
}

export const TransactionCard: React.FC<Props> = ({ transaction, onClick, onDelete, lang, index = 0, accountName }) => {
  const t = translations[lang];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop click from opening details
    // Use a slight timeout to ensure UI is responsive before alert
    setTimeout(() => {
        if (onDelete && window.confirm(t.confirmDelete)) {
            onDelete(transaction.id);
        }
    }, 10);
  };

  const getIcon = () => {
    switch (transaction.type) {
      case TransactionType.INCOME: return <ArrowUp className="text-emerald-600 dark:text-emerald-400" size={20} />;
      case TransactionType.EXPENSE: return <ArrowDown className="text-rose-600 dark:text-rose-400" size={20} />;
      case TransactionType.SAVING: return <PiggyBank className="text-blue-600 dark:text-blue-400" size={20} />;
      case TransactionType.CREDIT_SPEND: return <CreditCard className="text-purple-600 dark:text-purple-400" size={20} />;
      case TransactionType.DEBT_OWED_TO_ME: return <ArrowRightLeft className="text-teal-600 dark:text-teal-400" size={20} />;
      case TransactionType.DEBT_OWED_BY_ME: return <Clock className="text-amber-600 dark:text-amber-400" size={20} />;
      default: return <ArrowDown className="text-gray-500" size={20} />;
    }
  };

  const getStyle = () => {
    switch (transaction.type) {
      case TransactionType.INCOME: return 'bg-emerald-100/50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case TransactionType.EXPENSE: return 'bg-rose-100/50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400';
      case TransactionType.SAVING: return 'bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case TransactionType.CREDIT_SPEND: return 'bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case TransactionType.DEBT_OWED_TO_ME: return 'bg-teal-100/50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400';
      case TransactionType.DEBT_OWED_BY_ME: return 'bg-amber-100/50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
    }
  };

  const isDue = transaction.reminderDate && new Date(transaction.reminderDate) <= new Date();
  const dateObj = new Date(transaction.date);
  const dateStr = dateObj.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
  
  return (
    <div 
        onClick={onClick}
        style={{ animationDelay: `${index * 50}ms` }}
        className={`glass-card group relative flex flex-col p-3 sm:p-4 rounded-3xl mb-3 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] border-opacity-50 animate-fade-in-up cursor-pointer ${
        isDue && transaction.type === TransactionType.DEBT_OWED_BY_ME 
        ? 'ring-2 ring-red-400/50 dark:ring-red-500/30' 
        : ''
    }`}>
      
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 overflow-hidden">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-2xl ${getStyle()} shadow-sm`}>
                {getIcon()}
            </div>
            
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base leading-tight truncate">
                        {transaction.category}
                    </h3>
                    {accountName && (
                        <span className="hidden sm:inline-block text-[10px] bg-gray-50 text-gray-500 dark:bg-slate-700/50 dark:text-slate-400 px-2 py-0.5 rounded-full border border-gray-100 dark:border-slate-700/50 whitespace-nowrap">
                            {accountName}
                        </span>
                    )}
                </div>
                
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 truncate w-full max-w-[150px] sm:max-w-[250px] opacity-80">
                    {transaction.description || (lang === 'ar' ? 'بدون وصف' : 'No description')}
                </p>
                
                <div className="flex items-center gap-2 mt-0.5">
                     <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                        {dateStr}
                    </p>
                    {transaction.reminderDate && (
                        <div className={`flex items-center gap-1 text-[10px] px-2 py-0 rounded-full ${isDue ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                            <Calendar size={8} />
                            <span>{new Date(transaction.reminderDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex flex-col items-end gap-1 sm:gap-2 pl-2">
            <span className={`font-extrabold text-base sm:text-lg tracking-tight whitespace-nowrap ${
            transaction.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 
            transaction.type === TransactionType.EXPENSE ? 'text-rose-600 dark:text-rose-400' :
            transaction.type === TransactionType.SAVING ? 'text-blue-600 dark:text-blue-400' :
            'text-gray-800 dark:text-gray-200'
            }`}>
            {transaction.type === TransactionType.EXPENSE || transaction.type === TransactionType.CREDIT_SPEND ? '-' : '+'}
            {transaction.amount.toLocaleString()}
            </span>

             {onDelete && (
                <button 
                    onClick={handleDelete}
                    className="p-2 sm:p-2.5 -m-2 sm:-m-1 text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200 active:scale-90"
                    aria-label="Delete transaction"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};