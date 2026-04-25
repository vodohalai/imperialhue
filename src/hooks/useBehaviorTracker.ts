import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID = uuidv4();

export const useBehaviorTracker = () => {
  const location = useLocation();
  const [intentScore, setIntentScore] = useState(0);
  const [recommendation, setRecommendation] = useState("");
  const behaviorsRef = useRef<any[]>([]);

  const logEvent = async (type: string, data: any = {}) => {
    const event = {
      session_id: SESSION_ID,
      page_path: location.pathname,
      event_type: type,
      event_data: data,
    };
    behaviorsRef.current.push(event);
    
    await supabase.from('user_behaviors').insert(event);

    // Mỗi 3 sự kiện quan trọng, gọi AI phân tích lại intent
    if (behaviorsRef.current.length % 3 === 0) {
      analyzeIntent();
    }
  };

  const analyzeIntent = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-intent', {
        body: { behaviors: behaviorsRef.current, current_page: location.pathname }
      });
      if (data) {
        setIntentScore(data.intent_score);
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    }
  };

  useEffect(() => {
    logEvent('page_view', { timestamp: Date.now() });

    const handleScroll = () => {
      const depth = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
      if (depth % 25 === 0) { // Log mỗi 25% cuộn
        logEvent('scroll_depth', { depth });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return { intentScore, recommendation, logEvent };
};