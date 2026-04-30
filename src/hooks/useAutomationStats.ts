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

export interface LastActivityTimes {
  schedulerLastRun: string | null;
  researchLastRun: string | null;
  writeLastRun: string | null;
  imageLastRun: string | null;
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
  const [lastActivity, setLastActivity] = useState<LastActivityTimes>({
    schedulerLastRun: null,
    researchLastRun: null,
    writeLastRun: null,
    imageLastRun: null,
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

        // Fetch last activity times from workflow_logs
        const { data: logs } = await supabase
          .from("workflow_logs")
          .select("action, created_at, status")
          .eq("status", "success")
          .order("created_at", { ascending: false })
          .limit(20);

        const lastActivity: LastActivityTimes = {
          schedulerLastRun: null,
          researchLastRun: null,
          writeLastRun: null,
          imageLastRun: null,
        };

        if (logs) {
          for (const log of logs) {
            if (log.action === "scheduler" && !lastActivity.schedulerLastRun) {
              lastActivity.schedulerLastRun = log.created_at;
            } else if (log.action === "research" && !lastActivity.researchLastRun) {
              lastActivity.researchLastRun = log.created_at;
            } else if (log.action === "write" && !lastActivity.writeLastRun) {
              lastActivity.writeLastRun = log.created_at;
            } else if (log.action === "generate-image" && !lastActivity.imageLastRun) {
              lastActivity.imageLastRun = log.created_at;
            }
          }
        }

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
          setLastActivity(lastActivity);
        }
      } catch (error) {
        console.error("Error fetching automation stats:", error);
        if (!cancelled) {
          setStats(prev => prev);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  return { stats, lastActivity, loading };
}
