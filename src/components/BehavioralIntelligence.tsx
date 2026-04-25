import { useState, useEffect } from 'react';
import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import { X, Zap, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BehavioralIntelligence = () => {
  const { intentScore, recommendation, logEvent } = useBehaviorTracker();
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      // Phát hiện di chuyển chuột lên thanh địa chỉ (Exit Intent)
      if (e.clientY <= 5 && !hasShown && intentScore > 30) {
        setShowExitPopup(true);
        setHasShown(true);
        logEvent('exit_intent_detected', { score: intentScore });
      }
    };

    document.addEventListener('mouseout', handleMouseOut);
    return () => document.removeEventListener('mouseout', handleMouseOut);
  }, [intentScore, hasShown]);

  return (
    <>
      {/* Dev Intent Score Badge (Dành cho demo) */}
      <div className="fixed left-4 bottom-20 z-[60] flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
        <Zap className="h-3 w-3 text-yellow-400" />
        INTENT: {intentScore}%
      </div>

      <AnimatePresence>
        {showExitPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowExitPopup(false)}
                className="absolute right-6 top-6 rounded-full bg-slate-100 p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316]">
                <Zap className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-2xl font-black text-slate-900">Khoan đã! Đừng bỏ lỡ...</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {recommendation || "The Imperial Hue đang có ưu đãi đặc biệt dành riêng cho phiên truy cập này. Đừng để kỳ nghỉ mơ ước vụt mất!"}
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-orange-50 p-4">
                <Timer className="h-5 w-5 text-[#f97316]" />
                <p className="text-xs font-bold text-[#f97316]">ƯU ĐÃI KẾT THÚC SAU: 10:00</p>
              </div>

              <button 
                onClick={() => setShowExitPopup(false)}
                className="mt-6 w-full rounded-full bg-[#0D9488] px-6 py-4 text-center text-sm font-bold text-white shadow-lg shadow-teal-200"
              >
                NHẬN ƯU ĐÃI 15% NGAY
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};