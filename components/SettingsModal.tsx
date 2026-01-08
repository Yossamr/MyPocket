import React, { useState, useRef } from 'react';
import { X, Wallet, CreditCard, Plus, Trash2, Shield, Lock, Download, Upload, Database, Tag, MessageCircle, Info, Globe, Moon, Sun, Layout, Check, Power, DownloadCloud, Crown, Gift } from 'lucide-react';
import { PaymentAccount } from '../types';
import { translations } from '../constants/translations';
import { AdBanner } from './AdBanner'; // Import AdBanner

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: PaymentAccount[];
  onAddAccount: (name: string) => void;
  onDeleteAccount: (id: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lang: 'ar' | 'en';
  onSetLang: (lang: 'ar' | 'en') => void;
  customCategories: string[];
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (cat: string) => void;
  hasPin: boolean;
  onSetPin: (pin: string) => void;
  onRemovePin: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  features: { budgets: boolean; goals: boolean; debtsIn: boolean; debtsOut: boolean };
  onToggleFeature: (key: 'budgets' | 'goals' | 'debtsIn' | 'debtsOut') => void;
  installPrompt?: any;
  onInstall?: () => void;
  isPremium?: boolean;
  onOpenSubscription?: () => void;
}

export const SettingsModal: React.FC<Props> = ({ 
    isOpen, onClose, accounts, onAddAccount, onDeleteAccount, onExportData, onImportData, 
    lang, onSetLang, customCategories, onAddCategory, onRemoveCategory, 
    hasPin, onSetPin, onRemovePin, darkMode, onToggleTheme, features, onToggleFeature,
    installPrompt, onInstall, isPremium, onOpenSubscription
}) => {
  const [activeSection, setActiveSection] = useState<'GENERAL' | 'FEATURES' | 'ACCOUNTS' | 'CATEGORIES' | 'SECURITY' | 'DATA'>('GENERAL');
  const [newAccountName, setNewAccountName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  if (!isOpen) return null;

  const isLimitReached = !isPremium && accounts.length >= 2;

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountName.trim()) {
        onAddAccount(newAccountName.trim());
        setNewAccountName('');
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
        onAddCategory(newCategory.trim());
        setNewCategory('');
    }
  };

  const handlePinSubmit = () => {
    if (newPin.length !== 4) return alert(lang === 'ar' ? "الرمز يجب أن يكون 4 أرقام" : "PIN must be 4 digits");
    if (newPin !== confirmPin) return alert(lang === 'ar' ? "الرموز غير متطابقة" : "PINs do not match");
    onSetPin(newPin);
    setIsSettingPin(false);
    setNewPin('');
    setConfirmPin('');
  };

  // Safe Deletion Handlers with Confirmation
  const confirmDeleteAccount = (id: string) => {
      if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الحساب؟ ستفقد المعاملات المرتبطة به.' : 'Are you sure you want to delete this account?')) {
          onDeleteAccount(id);
      }
  };

  const confirmRemoveCategory = (cat: string) => {
      if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا التصنيف؟' : 'Are you sure you want to delete this category?')) {
          onRemoveCategory(cat);
      }
  };

  const confirmRemovePin = () => {
       if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من إزالة قفل التطبيق؟' : 'Are you sure you want to remove the App Lock?')) {
          onRemovePin();
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-slate-800 w-full max-w-md sm:max-w-2xl rounded-t-[40px] sm:rounded-[40px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-8 shadow-2xl animate-slide-up border border-gray-100 dark:border-slate-700/50 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Wallet className="text-purple-600" />
            {t.settings}
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-slate-700/50 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-slate-700 rounded-2xl mb-6 overflow-x-auto no-scrollbar">
            {[
                { id: 'GENERAL', icon: Globe },
                { id: 'FEATURES', icon: Layout },
                { id: 'ACCOUNTS', icon: CreditCard },
                { id: 'CATEGORIES', icon: Tag },
                { id: 'SECURITY', icon: Lock },
                { id: 'DATA', icon: Database },
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id as any)}
                    className={`flex-1 min-w-[50px] py-3 rounded-xl flex justify-center items-center transition-all ${
                        activeSection === tab.id 
                        ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' 
                        : 'text-gray-400 dark:text-slate-400'
                    }`}
                >
                    <tab.icon size={20} />
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            
            {/* General (Language & Theme) */}
            {activeSection === 'GENERAL' && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Subscription Banner */}
                    <div className={`p-4 rounded-2xl flex items-center justify-between ${isPremium ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900'}`}>
                        <div className="flex items-center gap-3">
                            <Crown size={24} fill={isPremium ? "white" : "currentColor"} className={isPremium ? "" : "text-amber-700"} />
                            <div>
                                <h4 className="font-bold text-lg">{isPremium ? t.premiumActive : t.premium}</h4>
                                {!isPremium && <p className="text-xs opacity-80">{t.upgradeToPro}</p>}
                            </div>
                        </div>
                        {!isPremium && (
                            <button onClick={onOpenSubscription} className="px-4 py-2 bg-white/90 rounded-xl font-bold text-xs shadow-sm text-amber-900">
                                {t.manageSubscription}
                            </button>
                        )}
                    </div>

                    {/* Language */}
                    <div className="space-y-3">
                         <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Globe size={18} /> {t.language}
                         </h4>
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => onSetLang('ar')}
                                className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                                    lang === 'ar' 
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                                    : 'border-transparent bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                {t.arabic}
                            </button>
                            <button 
                                onClick={() => onSetLang('en')}
                                className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                                    lang === 'en' 
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                                    : 'border-transparent bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400'
                                }`}
                            >
                                {t.english}
                            </button>
                         </div>
                    </div>

                    {/* Theme */}
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                         <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            {darkMode ? <Moon size={18} /> : <Sun size={18} />} {t.appearance}
                         </h4>
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => !darkMode && onToggleTheme()}
                                className={`p-4 rounded-2xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                                    darkMode 
                                    ? 'border-slate-500 bg-slate-800 text-white' 
                                    : 'border-transparent bg-gray-50 text-gray-400'
                                }`}
                            >
                                <Moon size={18} /> {t.darkMode}
                            </button>
                            <button 
                                onClick={() => darkMode && onToggleTheme()}
                                className={`p-4 rounded-2xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                                    !darkMode 
                                    ? 'border-amber-400 bg-amber-50 text-amber-600' 
                                    : 'border-transparent bg-slate-700/50 text-gray-500'
                                }`}
                            >
                                <Sun size={18} /> {t.lightMode}
                            </button>
                         </div>
                    </div>

                    {/* Install PWA Button */}
                    {installPrompt && (
                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <button 
                                onClick={onInstall}
                                className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                            >
                                <DownloadCloud size={20} />
                                {t.installApp}
                            </button>
                        </div>
                    )}

                    {/* Support Dev via Ad */}
                    {!isPremium && (
                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                             <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <Gift size={18} /> {lang === 'ar' ? 'دعم المطور' : 'Support Developer'}
                             </h4>
                             <p className="text-xs text-gray-500 dark:text-slate-400">
                                {lang === 'ar' ? 'شاهد فيديو قصير لدعم استمرار التطبيق مجاناً' : 'Watch a short video to keep the app free.'}
                             </p>
                             <AdBanner isPremium={isPremium} lang={lang} variant="video-fake" />
                        </div>
                    )}
                </div>
            )}

            {/* Features (Toggle modules) */}
            {activeSection === 'FEATURES' && (
                <div className="space-y-4 animate-fade-in-up">
                    <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                        <Layout size={18} /> {t.features}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'budgets', label: t.featureBudgets, icon: <Layout size={18} className="text-pink-500" /> },
                            { id: 'goals', label: t.featureGoals, icon: <Layout size={18} className="text-blue-500" /> },
                            { id: 'debtsOut', label: t.featureDebtsOut, icon: <Layout size={18} className="text-amber-500" /> },
                            { id: 'debtsIn', label: t.featureDebtsIn, icon: <Layout size={18} className="text-emerald-500" /> },
                        ].map((feat) => (
                            <div key={feat.id} onClick={() => onToggleFeature(feat.id as any)} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700 cursor-pointer active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-3">
                                    {feat.icon}
                                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{feat.label}</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${features[feat.id as keyof typeof features] ? 'bg-purple-500 justify-end' : 'bg-gray-300 dark:bg-slate-600 justify-start'}`}>
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Accounts */}
            {activeSection === 'ACCOUNTS' && (
                <div className="space-y-4 animate-fade-in-up">
                    <h4 className="font-bold text-gray-800 dark:text-white">{t.accounts}</h4>
                    {accounts.map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-2xl border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${acc.isDefault ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {acc.isDefault ? <Wallet size={20} /> : <CreditCard size={20} />}
                                </div>
                                <p className="font-bold text-gray-800 dark:text-white">{acc.name}</p>
                            </div>
                            {!acc.isDefault && (
                                <button onClick={() => confirmDeleteAccount(acc.id)} className="text-red-400 hover:text-red-600 p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={20} /></button>
                            )}
                        </div>
                    ))}
                    {!isLimitReached ? (
                        <form onSubmit={handleAddAccount} className="flex gap-2">
                             <input 
                                type="text" 
                                value={newAccountName} 
                                onChange={e => setNewAccountName(e.target.value)}
                                placeholder={t.addAccount}
                                className="flex-1 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none font-bold dark:text-white"
                            />
                            <button type="submit" className="p-4 bg-purple-600 text-white rounded-2xl"><Plus size={20} /></button>
                        </form>
                    ) : (
                         <div onClick={onOpenSubscription} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl text-center text-amber-600 dark:text-amber-400 text-sm font-bold cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                            {t.accountLimitReached}
                        </div>
                    )}
                </div>
            )}

            {/* Categories */}
            {activeSection === 'CATEGORIES' && (
                <div className="space-y-4 animate-fade-in-up">
                     <h4 className="font-bold text-gray-800 dark:text-white">{t.customCategories}</h4>
                     <form onSubmit={handleAddCategory} className="flex gap-2">
                             <input 
                                type="text" 
                                value={newCategory} 
                                onChange={e => setNewCategory(e.target.value)}
                                placeholder={t.addCategory}
                                className="flex-1 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none font-bold dark:text-white"
                            />
                            <button type="submit" className="p-4 bg-purple-600 text-white rounded-2xl"><Plus size={20} /></button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                        {customCategories.map(cat => (
                            <div key={cat} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 pl-4 pr-2 py-2 rounded-xl font-bold text-sm border border-purple-100 dark:border-purple-800/30">
                                {cat}
                                <button onClick={() => confirmRemoveCategory(cat)} className="p-1.5 text-purple-400 hover:text-red-500 bg-white/50 dark:bg-black/10 rounded-full transition-colors"><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                    {customCategories.length === 0 && <p className="text-gray-400 text-sm text-center py-4">{t.noTransactions}</p>}
                </div>
            )}

            {/* Security */}
            {activeSection === 'SECURITY' && (
                <div className="space-y-6 animate-fade-in-up">
                    <h4 className="font-bold text-gray-800 dark:text-white">{t.appLock}</h4>
                    
                    {!hasPin ? (
                        !isSettingPin ? (
                             <button onClick={() => setIsSettingPin(true)} className="w-full p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-200 dark:bg-slate-600 rounded-xl"><Lock size={20} /></div>
                                    <span className="font-bold text-gray-700 dark:text-gray-200">{t.setPin}</span>
                                </div>
                                <Plus size={20} className="text-gray-400" />
                            </button>
                        ) : (
                            <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-3xl space-y-4">
                                <input 
                                    type="password" 
                                    maxLength={4}
                                    placeholder="XXXX"
                                    value={newPin}
                                    onChange={e => setNewPin(e.target.value)}
                                    className="w-full p-3 text-center text-2xl tracking-[1em] rounded-xl bg-white dark:bg-slate-800 outline-none"
                                />
                                <input 
                                    type="password" 
                                    maxLength={4}
                                    placeholder="Confirm"
                                    value={confirmPin}
                                    onChange={e => setConfirmPin(e.target.value)}
                                    className="w-full p-3 text-center text-2xl tracking-[1em] rounded-xl bg-white dark:bg-slate-800 outline-none"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setIsSettingPin(false)} className="flex-1 p-3 bg-gray-200 dark:bg-slate-700 rounded-xl font-bold">{t.cancel}</button>
                                    <button onClick={handlePinSubmit} className="flex-1 p-3 bg-purple-600 text-white rounded-xl font-bold">{t.save}</button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl flex items-center justify-between border border-emerald-100 dark:border-emerald-800">
                             <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Shield size={24} />
                                <span className="font-bold">{t.pinSetSuccess}</span>
                            </div>
                            <button onClick={confirmRemovePin} className="px-4 py-2 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-bold shadow-sm transition-colors">
                                {t.delete}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Data */}
            {activeSection === 'DATA' && (
                <div className="space-y-4 animate-fade-in-up">
                    <h4 className="font-bold text-gray-800 dark:text-white">{t.dataManagement}</h4>
                     
                     {!isPremium && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-center gap-3 text-amber-800 dark:text-amber-400 text-sm font-bold mb-2">
                            <Lock size={16} />
                            {t.backupLocked}
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={onExportData}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-bold text-sm border transition-all ${isPremium ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 border-transparent cursor-not-allowed opacity-60'}`}
                        >
                            <Download size={24} />
                            {t.backupData}
                        </button>

                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold text-sm border border-emerald-100 dark:border-emerald-800/30"
                        >
                            <Upload size={24} />
                            {t.restoreData}
                        </button>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onImportData} 
                        accept=".json" 
                        className="hidden" 
                    />
                </div>
            )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex-shrink-0">
            <p className="text-xs text-center text-gray-400 dark:text-slate-500 mb-3 font-medium">
                {isLimitReached ? t.contactSupport : t.developerInfo}
            </p>
            <a 
                href="https://wa.me/201018866315" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
                <MessageCircle size={20} />
                {t.contactBtn}
            </a>
        </div>

      </div>
    </div>
  );
};