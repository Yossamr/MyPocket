import React, { useState, useEffect } from 'react';
import { X, Calendar, Wallet, CreditCard, ArrowUp, ArrowDown, PiggyBank, ArrowRightLeft, Clock, Trash2, Tag, FileText, Banknote } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { translations } from '../constants/translations';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  lang: 'ar' | 'en';
}

export const TransactionDetailsModal: React.FC<Props> = ({ transaction, onClose, onDelete, lang }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    if (transaction) {
      setIsVisible(true);
      setIsClosing(false);
    } else {
      setIsVisible(false);
    }
  }, [transaction]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        onClose();
        setIsVisible(false);
    }, 300);
  };

  const handleDelete = () => {
    if (transaction && window.confirm(t.confirmDelete)) {
        onDelete(transaction.id);
        handleClose();
    }
  };

  if (!transaction && !isVisible) return null;

  const getIcon = () => {
    switch (transaction?.type) {
      case TransactionType.INCOME: return <ArrowUp size={32} className="text-emerald-600 dark:text-emerald-400" />;
      case TransactionType.EXPENSE: return <ArrowDown size={32} className="text-rose-600 dark:text-rose-400" />;
      case TransactionType.SAVING: return <PiggyBank size={32} className="text-blue-600 dark:text-blue-400" />;
      case TransactionType.CREDIT_SPEND: return <CreditCard size={32} className="text-purple-600 dark:text-purple-400" />;
      case TransactionType.DEBT_OWED_TO_ME: return <ArrowRightLeft size={32} className="text-teal-600 dark:text-teal-400" />;
      case TransactionType.DEBT_OWED_BY_ME: return <Clock size={32} className="text-amber-600 dark:text-amber-400" />;
      default: return <Wallet size={32} className="text-gray-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (transaction?.type) {
        case TransactionType.INCOME: return t.types.INCOME;
        case TransactionType.EXPENSE: return t.types.EXPENSE;
        case TransactionType.SAVING: return t.types.SAVING;
        case TransactionType.CREDIT_SPEND: return t.types.CREDIT;
        case TransactionType.DEBT_OWED_TO_ME: return t.types.DEBT_IN;
        case TransactionType.DEBT_OWED_BY_ME: return t.types.DEBT_OUT;
        default: return 'Transaction';
    }
  };

  const getBgColor = () => {
     switch (transaction?.type) {
      case TransactionType.INCOME: return 'bg-emerald-50 dark:bg-emerald-900/20';
      case TransactionType.EXPENSE: return 'bg-rose-50 dark:bg-rose-900/20';
      case TransactionType.SAVING: return 'bg-blue-50 dark:bg-blue-900/20';
      case TransactionType.CREDIT_SPEND: return 'bg-purple-50 dark:bg-purple-900/20';
      case TransactionType.DEBT_OWED_TO_ME: return 'bg-teal-50 dark:bg-teal-900/20';
      case TransactionType.DEBT_OWED_BY_ME: return 'bg-amber-50 dark:bg-amber-900/20';
      default: return 'bg-gray-50 dark:bg-slate-800';
    }
  }

  return (
    <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${!transaction || isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
      
      <div className={`bg-white dark:bg-slate-800 w-full max-w-md sm:max-w-xl rounded-t-[32px] sm:rounded-[32px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-8 shadow-2xl transform transition-transform duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'} border border-gray-100 dark:border-slate-700`}>
        
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6 sm:hidden"></div>

        <div className="flex justify-between items-start mb-6">
            <button onClick={handleDelete} className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-100 transition-colors">
                <Trash2 size={20} />
            </button>
            <button onClick={handleClose} className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
            </button>
        </div>

        {transaction && (
            <div className="text-center">
                <div className={`w-20 h-20 mx-auto rounded-3xl ${getBgColor()} flex items-center justify-center mb-4 shadow-inner`}>
                    {getIcon()}
                </div>
                
                <h2 className="text-lg font-medium text-gray-500 dark:text-slate-400 mb-1">{getTypeLabel()}</h2>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8" dir="ltr">
                    {transaction.amount.toLocaleString()} <span className="text-xl text-gray-400 font-bold">EGP</span>
                </h1>

                <div className="bg-gray-50 dark:bg-slate-700/30 rounded-3xl p-6 space-y-5 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
                        <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm font-bold">
                            <Calendar size={18} />
                            {t.date}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white">
                            {new Date(transaction.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
                        <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm font-bold">
                            <Tag size={18} />
                            {t.category}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white px-3 py-1 bg-white dark:bg-slate-600 rounded-lg shadow-sm">
                            {transaction.category}
                        </span>
                    </div>

                     <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
                        <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm font-bold">
                            <Wallet size={18} />
                            {t.paymentMethod}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            {transaction.type === TransactionType.CREDIT_SPEND ? (
                                <>
                                    <CreditCard size={16} className="text-purple-500" />
                                    {t.visa}
                                </>
                            ) : (
                                <>
                                    <Banknote size={16} className="text-emerald-500" />
                                    {t.cash}
                                </>
                            )}
                        </span>
                    </div>

                    {transaction.description && (
                        <div className="pt-2">
                             <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm font-bold mb-2">
                                <FileText size={18} />
                                {t.notes}
                            </span>
                            <p className="text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-600 p-4 rounded-2xl text-sm leading-relaxed border border-gray-100 dark:border-slate-500/50">
                                {transaction.description}
                            </p>
                        </div>
                    )}
                    
                    {transaction.reminderDate && (
                        <div className="pt-2">
                             <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-bold mb-2">
                                <Clock size={18} />
                                {t.dueDate}
                            </span>
                            <p className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl text-sm font-bold text-center border border-amber-100 dark:border-amber-800">
                                {new Date(transaction.reminderDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        )}
      </div>
    </div>
  );
};