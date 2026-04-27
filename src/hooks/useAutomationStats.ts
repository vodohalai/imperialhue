import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AutomationStats {
  totalTopics: number;
  usedTopics: number;
  pendingTopics: number;
  totalJobs: number;
  draftsCreated: number;
  scheduledJobs: number;
  waitingReview: number;
  publishedJobs: number;
  failedJobs: number;
}

export function useAutomationStats(refreshTrigger: number = 0) {
  const [stats, setStats] = useState<AutomationStats>({
    totalTopics: 0,
    usedTopics: 0,
    pendingTopics: 0,
    totalJobs: 0,
    draftsCreated: 0,
    scheduledJobs: 0,
    waitingReview: 0,
    publishedJobs: 0,
    failedJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: topics } = await supabase
          .from("seo_topics")
          .select("status");

        const totalTopics = topics?.length || 0;
        const pendingTopics = topics?.filter((t) => t.status === "pending").length || 0;
        const usedTopics = topics?.filter((t) => t.status === "used").length || 0;

        const { data: jobs } = await supabase
          .from("ai_content_jobs")
          .select("status");

        const totalJobs = jobs?.length || 0;
        const draftsCreated = jobs?.filter((j) => j.status === "draft_ai").length || 0;
        const scheduledJobs = jobs?.filter((j) => j.status === "scheduled").length || 0;
        const waitingReview = draftsCreated;
        const publishedJobs = jobs?.filter((j) => j.status === "published").length || 0;
        const failedJobs = jobs?.filter((j) => j.status === "failed").length || 0;

        if (!cancelled) {
          setStats({
            totalTopics,
            usedTopics,
            pendingTopics,
            totalJobs,
            draftsCreated,
            scheduledJobs,
            waitingReview,
            publishedJobs,
            failedJobs,
          });
        }
      } catch (error) {
        console.error("Error fetching automation stats:", error);
        if (!cancelled) {
          setStats(prev => prev); // giữ nguyên
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]); // re-fetch khi refreshTrigger thay đổi

  return { stats, loading };
}