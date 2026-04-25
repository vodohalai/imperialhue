import { useState, useEffect, useRef } from 'react';
import { X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';

export const BehavioralIntelligence = () => {
  const { t } = useLanguage();
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      // Phát hiện di chuyển chuột lên thanh địa chỉ (Exit Intent)
      if (e.clientY <= 5 && !hasShown) {
        setShowExitPopup(true);
        setHasShown(true);
        startTimer();
      }
    };

    document.addEventListener('mouseout', handleMouseOut);
    return () => document.removeEventListener('mouseout', handleMouseOut);
  }, [hasShown]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {showExitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[420px] overflow-hidden rounded-[2rem] bg-white shadow-2xl"
          >
            {/* Header: Teal Background */}
            <div className="bg-[#00b5ad] p-8 text-center text-white">
              <button 
                onClick={() => setShowExitPopup(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4 flex justify-center">
                <div className="flex h-12 items-center gap-2 rounded-full bg-black/10 px-4 py-2 text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-4 w-4" />
                  {t("pop.limited")}
                </div>
              </div>

              <h3 className="text-3xl font-black leading-tight">
                {t("pop.waitTitle")} <br />
                <span className="text-yellow-300">{t("pop.specialOffer")}</span> {t("pop.forYou")}
              </h3>
            </div>

            {/* Body: White Background */}
            <div className="p-8">
              {/* Offer Box */}
              <div className="rounded-3xl bg-[#fff9f0] p-6 text-center border border-orange-100">
                <p className="text-sm font-medium text-slate-500">{t("pop.todayOffer")}</p>
                <h4 className="mt-1 text-2xl font-black text-slate-900">{t("pop.discount")}</h4>
                <p className="mt-1 text-sm text-slate-500">{t("pop.valid")}</p>
              </div>

              {/* Timer */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <p className="text-sm font-bold text-slate-600">{t("pop.expires")}</p>
                <div className="rounded-xl bg-[#1b1c1d] px-4 py-2 font-mono text-xl font-bold text-white shadow-inner">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => setShowExitPopup(false)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff6b00] py-4 text-lg font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#e66000] active:scale-[0.98]"
              >
                {t("pop.claim")} →
              </button>

              <button 
                onClick={() => setShowExitPopup(false)}
                className="mt-4 w-full text-center text-sm font-semibold text-slate-400 hover:text-slate-600"
              >
                {t("pop.noThanks")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};