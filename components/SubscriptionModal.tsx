import React, { useState } from 'react';
import { X, Check, Crown, Star, Shield, Zap, Infinity } from 'lucide-react';
import { translations } from '../constants/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  lang: 'ar' | 'en';
}

// User provided Stripe Payment Link
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_aFaeVcfs0a9qbE0bvn93y00"; 

export const SubscriptionModal: React.FC<Props> = ({ isOpen, onClose, onUpgrade, lang }) => {
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setLoading(true);
    // Redirect to Stripe Payment Link
    window.location.href = STRIPE_PAYMENT_LINK;
  };

  const features = [
    { icon: <Infinity size={18} className="text-purple-500" />, text: lang === 'ar' ? 'عدد لا نهائي من الحسابات والأهداف' : 'Unlimited Accounts & Goals' },
    { icon: <Shield size={18} className="text-emerald-500" />, text: lang === 'ar' ? 'إزالة الإعلانات تماماً' : 'Remove Ads Completely' },
    { icon: <Zap size={18} className="text-amber-500" />, text: lang === 'ar' ? 'أولوية في تحليل الذكاء الاصطناعي' : 'Priority AI Analysis' },
    { icon: <Star size={18} className="text-blue-500" />, text: lang === 'ar' ? 'النسخ الاحتياطي السحابي (قريباً)' : 'Cloud Backup (Coming Soon)' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-8 shadow-2xl relative overflow-hidden animate-scale-in border border-purple-100 dark:border-purple-900/30">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-100/50 to-transparent dark:from-purple-900/20 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <button onClick={onClose} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-10"><X size={20} /></button>

        <div className="text-center mb-8 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-float">
                <Crown size={40} className="text-white" fill="white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">My Pocket <span className="text-purple-600">Pro</span></h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{lang === 'ar' ? 'افتح كل المميزات وأزل القيود' : 'Unlock all features and remove limits'}</p>
        </div>

        <div className="space-y-4 mb-8">
            {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm">{feat.icon}</div>
                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{feat.text}</span>
                </div>
            ))}
        </div>

        <button 
            onClick={handleSubscribe} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
            {loading ? (
                <span>{lang === 'ar' ? 'جاري التحويل...' : 'Redirecting...'}</span>
            ) : (
                <>
                    <span>{lang === 'ar' ? 'اشترك الآن - 50 ج.م/سنة' : 'Subscribe Now - 50 EGP/yr'}</span>
                    <Star size={20} fill="currentColor" className="text-yellow-300" />
                </>
            )}
        </button>
        
        <p className="text-center text-[10px] text-gray-400 mt-4">
            {lang === 'ar' ? 'سيتم تحويلك إلى صفحة الدفع الآمنة.' : 'You will be redirected to a secure payment page.'}
        </p>

      </div>
    </div>
  );
};