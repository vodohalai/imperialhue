import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

const SESSION_ID = uuidv4();

export const useBehaviorTracker = () => {
  const location = useLocation();
  const [intentScore, setIntentScore] = useState(0);
  const [recommendation, setRecommendation] = useState("");
  const behaviorsRef = useRef<any[]>([]);
  const queueRef = useRef<any[]>([]);
  const flushingRef = useRef(false);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyzeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnalyzeAtRef = useRef(0);
  const lastScrollAtRef = useRef(0);
  const seenScrollBucketsRef = useRef<Set<number>>(new Set());

  const flushQueue = async () => {
    if (flushingRef.current) return;
    if (queueRef.current.length === 0) return;

    flushingRef.current = true;
    const batch = queueRef.current.splice(0, queueRef.current.length);
    try {
      const { error } = await supabase.from("user_behaviors").insert(batch);
      if (error) {
        console.error("Behavior flush failed", error);
      }
    } catch (err) {
      console.error("Behavior flush failed", err);
    } finally {
      flushingRef.current = false;
    }
  };

  const scheduleFlush = () => {
    if (flushTimeoutRef.current) return;
    flushTimeoutRef.current = setTimeout(async () => {
      flushTimeoutRef.current = null;
      await flushQueue();
    }, 5000);
  };

  const scheduleAnalyzeIntent = () => {
    const now = Date.now();
    if (now - lastAnalyzeAtRef.current < 30_000) return;
    if (analyzeTimeoutRef.current) return;
    analyzeTimeoutRef.current = setTimeout(async () => {
      analyzeTimeoutRef.current = null;
      await analyzeIntent();
    }, 5000);
  };

  const logEvent = async (type: string, data: any = {}) => {
    const event = {
      session_id: SESSION_ID,
      page_path: location.pathname,
      event_type: type,
      event_data: data,
    };
    behaviorsRef.current.push(event);
    queueRef.current.push(event);

    if (queueRef.current.length >= 10) {
      await flushQueue();
    } else {
      scheduleFlush();
    }

    if (behaviorsRef.current.length >= 8) {
      scheduleAnalyzeIntent();
    }
  };

  const analyzeIntent = async () => {
    try {
      lastAnalyzeAtRef.current = Date.now();
      const { data } = await supabase.functions.invoke("analyze-intent", {
        body: { behaviors: behaviorsRef.current, current_page: location.pathname },
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
    seenScrollBucketsRef.current = new Set();
    logEvent("page_view", { timestamp: Date.now() });

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollAtRef.current < 250) return;
      lastScrollAtRef.current = now;

      const total = document.documentElement.scrollHeight || 1;
      const depth = Math.round(((window.scrollY + window.innerHeight) / total) * 100);
      const bucket = Math.min(100, Math.max(0, Math.round(depth / 25) * 25));

      if (bucket >= 25 && bucket % 25 === 0 && !seenScrollBucketsRef.current.has(bucket)) {
        seenScrollBucketsRef.current.add(bucket);
        logEvent("scroll_depth", { depth: bucket });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current);
        analyzeTimeoutRef.current = null;
      }
      void flushQueue();
    };
  }, [location.pathname]);

  return { intentScore, recommendation, logEvent };
};
