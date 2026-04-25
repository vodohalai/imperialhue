import { useState, useEffect, useRef } from 'react';
import { X, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BehavioralIntelligence = () => {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      // Phát hiện di chuyển chuột lên thanh địa chỉ (Exit Intent)
      // Xuất hiện ngay lập tức không cần AI phân tích điểm
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
    return `\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}`;
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
                  Limited Offer
                </div>
              </div>

              <h3 className="text-3xl font-black leading-tight">
                Wait! We have a <br />
                <span className="text-yellow-300">special offer</span> for you
              </h3>
            </div>

            {/* Body: White Background */}
            <div className="p-8">
              {/* Offer Box */}
              <div className="rounded-3xl bg-[#fff9f0] p-6 text-center border border-orange-100">
                <p className="text-sm font-medium text-slate-500">Today's special offer</p>
                <h4 className="mt-1 text-2xl font-black text-slate-900">15% off all rooms</h4>
                <p className="mt-1 text-sm text-slate-500">Valid when booking today</p>
              </div>

              {/* Timer */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <p className="text-sm font-bold text-slate-600">Offer expires in:</p>
                <div className="rounded-xl bg-[#1b1c1d] px-4 py-2 font-mono text-xl font-bold text-white shadow-inner">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => setShowExitPopup(false)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff6b00] py-4 text-lg font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#e66000] active:scale-[0.98]"
              >
                Claim offer now →
              </button>

              <button 
                onClick={() => setShowExitPopup(false)}
                className="mt-4 w-full text-center text-sm font-semibold text-slate-400 hover:text-slate-600"
              >
                No, I don't need this offer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};