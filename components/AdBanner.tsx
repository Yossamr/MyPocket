import React, { useEffect, useState } from 'react';
import { Crown, ExternalLink, Zap, X, Gift, Star, Play, Volume2, Maximize2, MoreVertical, Loader2, Video, VolumeX } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdOptions, RewardAdOptions, AdLoadInfo, RewardAdPluginEvents } from '@capacitor-community/admob';

interface Props {
  isPremium: boolean;
  lang: 'ar' | 'en';
  variant?: 'inline' | 'sticky' | 'box' | 'video-fake'; 
  onClose?: () => void;
}

// Your Adsterra Direct Link (Fallback & Web)
const ADSTERRA_LINK = "https://www.effectivegatecpm.com/vsyhpgpm?key=244ec508a1e760e74126c1a2822dbebb";

// AdMob IDs (Use Test IDs for development, replace with Real IDs for production)
// Test ID for Rewarded Video: ca-app-pub-3940256099942544/5224354917
const ADMOB_BANNER_ID = "ca-app-pub-3940256099942544/6300978111"; 
const ADMOB_REWARD_ID = "ca-app-pub-3940256099942544/5224354917"; 

export const AdBanner: React.FC<Props> = ({ isPremium, lang, variant = 'inline', onClose }) => {
  const [isOnline, setIsOnline] = useState(true); 
  const [adError, setAdError] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoAdLoaded, setVideoAdLoaded] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());

    if (typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- AdMob Initialization ---
  useEffect(() => {
      if (isPremium || !isOnline) return;

      const initAdMob = async () => {
          try {
             await AdMob.initialize();
             
             // 1. Load Banner if variant is inline
             if (isNative && variant === 'inline') {
                const options: BannerAdOptions = {
                    adId: ADMOB_BANNER_ID,
                    adSize: BannerAdSize.BANNER,
                    position: BannerAdPosition.BOTTOM_CENTER, 
                    margin: 60,
                    isTesting: true // TODO: Set to false in production
                };
                await AdMob.showBanner(options);
                setAdError(false);
             }

             // 2. Pre-load Rewarded Video if variant is video-fake
             if (isNative && variant === 'video-fake') {
                 prepareRewardAd();
             }

          } catch (e) {
              console.error("AdMob Init Failed:", e);
              setAdError(true);
          }
      };
      
      initAdMob();

      // Listeners for Rewarded Video
      if (isNative && variant === 'video-fake') {
        const onLoaded = AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
            console.log("AdMob Video Loaded");
            setVideoAdLoaded(true);
        });

        const onDismissed = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            console.log("AdMob Video Dismissed");
            setVideoAdLoaded(false);
            setIsPlaying(false);
            // Prepare the next one immediately
            prepareRewardAd(); 
        });

        const onFailed = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
            console.error("AdMob Video Failed", error);
            setVideoAdLoaded(false);
            setIsPlaying(false);
        });

        return () => { 
            onLoaded.remove();
            onDismissed.remove();
            onFailed.remove();
        };
      }
      
      if (isNative && variant === 'inline') {
          return () => {
              AdMob.hideBanner().catch(console.error);
          };
      }
  }, [isNative, isPremium, isOnline, variant]);

  const prepareRewardAd = async () => {
      try {
          const options: RewardAdOptions = {
              adId: ADMOB_REWARD_ID,
              isTesting: true // TODO: Set to false in production
          };
          await AdMob.prepareRewardVideoAd(options);
      } catch (e) {
          console.error("Failed to prepare reward ad", e);
      }
  };

  if (isPremium || !isVisible) return null;

  const handleAdClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // === Video Logic ===
      if (variant === 'video-fake') {
          setIsPlaying(true); // Show buffering spinner

          // Strategy: Try Real Video First, Fallback to Direct Link
          if (isNative && videoAdLoaded) {
               try {
                   await AdMob.showRewardVideoAd();
                   // isPlaying will be set to false in 'Dismissed' listener
               } catch (err) {
                   console.error("Failed to show AdMob video, falling back...", err);
                   fallbackToDirectLink();
               }
          } else {
              // Not native or AdMob not ready -> Use Direct Link Fallback
              fallbackToDirectLink();
          }
          return;
      }

      // === Standard Banner Logic ===
      window.open(ADSTERRA_LINK, '_blank');
      if (variant === 'sticky') {
         // Optional: setIsVisible(false); 
      }
  };

  const fallbackToDirectLink = () => {
      // Simulate "Buffering" for 1.5 seconds to make it look like a video player trying to load
      // This increases the user's intent to watch, making the click on the link more natural.
      setTimeout(() => {
          window.open(ADSTERRA_LINK, '_blank');
          setIsPlaying(false);
      }, 1500); 
  };

  // --- Offline Premium Upsell ---
  if (!isOnline) {
      if (variant === 'sticky') return null; 
      return (
        <div className="w-full my-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-3 shadow-lg flex items-center justify-between border border-slate-700">
            <div className="flex items-center gap-2">
                <Crown size={20} className="text-yellow-400" />
                <div>
                    <h4 className="text-white font-bold text-xs">
                        {lang === 'ar' ? 'بدون إعلانات' : 'No Ads'}
                    </h4>
                </div>
            </div>
            <button className="px-3 py-1 bg-white text-slate-900 text-[10px] font-bold rounded-lg">
                {lang === 'ar' ? 'ترقية' : 'Upgrade'}
            </button>
        </div>
      );
  }

  if (isNative && !adError && variant === 'inline') {
      return <div className="h-[60px] w-full bg-transparent" />; 
  }

  // === 1. Sticky Variant (Floating Reward) ===
  if (variant === 'sticky') {
      return (
        <div className="fixed bottom-[140px] lg:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30 animate-slide-up pointer-events-none">
            <div 
                onClick={handleAdClick}
                className="pointer-events-auto relative bg-white/90 dark:bg-slate-800/95 backdrop-blur-md border border-purple-100 dark:border-slate-600 p-3 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
            >
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]"></div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                        <Gift size={20} className="text-white animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white font-bold text-sm leading-tight flex items-center gap-1">
                             {lang === 'ar' ? 'ليك هدية مستلمتهاش 🎁' : 'Unclaimed Reward!'}
                        </span>
                        <span className="text-gray-500 dark:text-slate-300 text-[10px]">
                            {lang === 'ar' ? 'اضغط وشوف المكافأة بتاعتك' : 'Tap to reveal your reward'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                        {lang === 'ar' ? 'افتح' : 'Open'}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsVisible(false); }} 
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-slate-700 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // === 4. Fake Video Player Variant (User Experience Optimized) ===
  if (variant === 'video-fake') {
      return (
        <div 
            onClick={handleAdClick}
            className="w-full mb-6 relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 bg-black animate-scale-in"
        >
            {/* Overlay Header */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="text-white/90 text-[10px] bg-black/40 px-2 py-0.5 rounded backdrop-blur-md font-bold">Ad</span>
                </div>
                <VolumeX size={16} className="text-white/80" />
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img 
                    src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80" 
                    alt="Video Thumbnail" 
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isPlaying ? 'opacity-40 blur-sm scale-105' : 'opacity-90'}`}
                />
                
                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10 group-hover:bg-black/20 transition-colors">
                    <div className={`w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl group-hover:scale-110 transition-transform duration-300 ${isPlaying ? 'scale-90 opacity-80' : ''}`}>
                         {isPlaying ? (
                             <Loader2 size={32} className="text-white animate-spin" />
                         ) : (
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg relative">
                                <Play size={24} fill="black" className="text-black relative z-10" />
                                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                             </div>
                         )}
                    </div>
                </div>

                {/* Bottom Progress UI */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-20 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-1 pointer-events-none">
                    <div className="flex justify-between items-end mb-1">
                        <div className="flex flex-col">
                             <span className="text-white font-bold text-sm leading-tight drop-shadow-md">
                                {lang === 'ar' ? 'حركة بسيطة بالموبايل بتزود دخلك 💵' : 'Simple phone trick boosts income 💵'}
                            </span>
                            <span className="text-gray-300 text-[10px]">
                                {isPlaying ? (lang === 'ar' ? 'جاري التحميل...' : 'Buffering...') : (lang === 'ar' ? 'اضغط للمشاهدة قبل الحذف ⚠️' : 'Watch before it\'s deleted ⚠️')}
                            </span>
                        </div>
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                            {lang === 'ar' ? 'مباشر' : 'LIVE'}
                        </span>
                    </div>
                    {/* Fake Progress Bar */}
                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className={`h-full bg-red-600 rounded-full relative transition-all duration-1000 ease-linear ${isPlaying ? 'w-3/4' : 'w-1/3'}`}></div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // === 3. Inline Variant (List Item) ===
  return (
      <div 
        onClick={handleAdClick}
        className="w-full my-3 group relative overflow-hidden rounded-2xl shadow-sm cursor-pointer border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-200 transition-colors"
      >
         <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-xl text-green-600 dark:text-green-400">
                    <Zap size={18} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        {lang === 'ar' ? 'فرصة مميزة' : 'Sponsored'}
                    </span>
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                        {lang === 'ar' ? 'إزاي تعمل فلوس وأنت نايم؟ السر هنا 👇' : 'How to earn while sleeping? Click here'}
                    </span>
                </div>
            </div>
            <ExternalLink size={16} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
         </div>
      </div>
  );
};