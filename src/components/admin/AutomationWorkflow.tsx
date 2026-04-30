import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  PauseCircle,
  PlayCircle,
  Search,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  ExternalLink,
  XCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import type { Article, WorkflowControl, WorkflowMode, SeoTopic, AiContentJob, WorkflowLog } from "@/integrations/supabase/types";
import { useAutomationStats } from "@/hooks/useAutomationStats";

type ReviewItem = {
  job: AiContentJob;
  article: Article | null;
};

type WorkflowWindow = Window & {
  __workflowInterval?: ReturnType<typeof setInterval>;
};

const WORKFLOW_KEY = "blog_automation";
const AUTO_PILOT_STORAGE_KEY = "imperial-auto-pilot-enabled";

const getTodayScheduleIso = (timeValue: string) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  const scheduledAt = new Date();
  scheduledAt.setHours(hours || 0, minutes || 0, 0, 0);
  return scheduledAt.toISOString();
};

const AutomationWorkflow = () => {
  const [control, setControl] = useState<WorkflowControl | null>(null);
  const [loadingControl, setLoadingControl] = useState(true);
  const [savingControl, setSavingControl] = useState(false);
  const [savingScheduleTime, setSavingScheduleTime] = useState(false);
  const [runningAction, setRunningAction] = useState<"research" | "write" | "generate-image" | "full" | null>(null);
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoMode, setAutoMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(AUTO_PILOT_STORAGE_KEY) === "true";
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [scheduleTime, setScheduleTime] = useState("06:00");
  const [researchTopics, setResearchTopics] = useState<SeoTopic[]>([]);
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const [scheduledArticles, setScheduledArticles] = useState<Article[]>([]);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [runningScheduler, setRunningScheduler] = useState(false);
  const [topicsCollapsed, setTopicsCollapsed] = useState(false);
  const [logsCollapsed, setLogsCollapsed] = useState(true);
  const { stats, lastActivity } = useAutomationStats(refreshTrigger);

  const fetchControl = async () => {
    setLoadingControl(true);
    const { data, error } = await supabase
      .from("workflow_controls")
      .select("*")
      .eq("workflow_key", WORKFLOW_KEY)
      .maybeSingle();

    if (error) {
      showError(error.message);
      setLoadingControl(false);
      return;
    }

    if (data) {
      const workflowData = data as WorkflowControl;
      setControl(workflowData);
      setScheduleTime(workflowData.default_schedule_time || "06:00");
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("workflow_controls")
        .insert([{ workflow_key: WORKFLOW_KEY, mode: "running", default_schedule_time: "06:00" }])
        .select()
        .single();

      if (insertError) {
        showError(insertError.message);
      } else {
        const workflowData = inserted as WorkflowControl;
        setControl(workflowData);
        setScheduleTime(workflowData.default_schedule_time || "06:00");
      }
    }

    setLoadingControl(false);
  };

  const fetchQueues = async () => {
    setLoadingQueues(true);

    const [topicsRes, jobsRes, scheduledRes] = await Promise.all([
      supabase
        .from("seo_topics")
        .select("*")
        .eq("status", "pending")
        .order("researched_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("ai_content_jobs")
        .select("*")
        .eq("status", "draft_ai")
        .not("image_url", "is", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("articles")
        .select("*")
        .eq("status", "scheduled")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    if (topicsRes.error) {
      showError(topicsRes.error.message);
    } else {
      setResearchTopics((topicsRes.data || []) as SeoTopic[]);
    }

    if (jobsRes.error) {
      showError(jobsRes.error.message);
    } else if (jobsRes.data?.article_id) {
      const { data: articleData, error: articleError } = await supabase
        .from("articles")
        .select("*")
        .eq("id", jobsRes.data.article_id)
        .maybeSingle();

      if (articleError) {
        showError(articleError.message);
        setReviewItem(null);
      } else {
        setReviewItem({
          job: jobsRes.data as AiContentJob,
          article: (articleData as Article | null) || null,
        });
      }
    } else {
      setReviewItem(null);
    }

    if (scheduledRes.error) {
      showError(scheduledRes.error.message);
    } else {
      setScheduledArticles((scheduledRes.data || []) as Article[]);
    }

    setLoadingQueues(false);
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("workflow_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Failed to fetch workflow logs:", error.message);
    } else {
      setWorkflowLogs((data || []) as WorkflowLog[]);
    }
    setLoadingLogs(false);
  };

  const handleRunScheduler = async () => {
    if (runningScheduler) return;
    setRunningScheduler(true);
    try {
      const { data, error } = await supabase.functions.invoke("workflow-scheduler");
      if (error) {
        showError("Lỗi chạy scheduler: " + error.message);
      } else if (data?.mode === "pipeline") {
        const successCount = data?.pipeline_results?.length || 0;
        const errorCount = data?.pipeline_errors?.length || 0;
        if (errorCount === 0) {
          showSuccess(`Pipeline hoàn tất: ${successCount} bước thành công`);
        } else {
          showError(`Pipeline: ${successCount} bước OK, ${errorCount} bước lỗi`);
        }
      } else {
        const published = data?.actions?.length || 0;
        if (published > 0) {
          showSuccess(`Đã xuất bản ${published} bài theo lịch`);
        } else {
          showSuccess("Đã chạy scheduler — không có bài nào đến hạn");
        }
      }
      await fetchLogs();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      showError(err.message || "Không thể chạy scheduler");
    } finally {
      setRunningScheduler(false);
    }
  };

  useEffect(() => {
    fetchControl().catch(() => undefined);
  }, []);

  useEffect(() => {
    fetchQueues().catch(() => undefined);
  }, [refreshTrigger]);

  useEffect(() => {
    fetchLogs().catch(() => undefined);
  }, [refreshTrigger]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTO_PILOT_STORAGE_KEY, String(autoMode));
    }

    const workflowWindow = window as WorkflowWindow;

    if (workflowWindow.__workflowInterval) {
      clearInterval(workflowWindow.__workflowInterval);
      workflowWindow.__workflowInterval = undefined;
    }

    if (autoMode) {
      const intervalId = setInterval(() => {
        setRefreshTrigger((value) => value + 1);
      }, 3600000);
      workflowWindow.__workflowInterval = intervalId;
    }

    return () => {
      if (workflowWindow.__workflowInterval) {
        clearInterval(workflowWindow.__workflowInterval);
        workflowWindow.__workflowInterval = undefined;
      }
    };
  }, [autoMode]);

  const initTable = async () => {
    setLoadingControl(true);
    try {
      const { error } = await supabase.functions.invoke("init-workflow-table");
      if (error) {
        showError("Không thể khởi tạo bảng workflow. Lỗi: " + error.message);
      } else {
        showSuccess("Đã khởi tạo bảng workflow thành công");
        await fetchControl();
      }
    } finally {
      setLoadingControl(false);
    }
  };

  const saveScheduleTime = async (value: string) => {
    if (!control) return;

    setSavingScheduleTime(true);

    const { data, error } = await supabase
      .from("workflow_controls")
      .update({
        default_schedule_time: value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", control.id)
      .select()
      .single();

    if (error) {
      showError(error.message);
      setSavingScheduleTime(false);
      return;
    }

    setControl(data as WorkflowControl);
    showSuccess(`Đã lưu giờ mặc định ${value}`);
    setSavingScheduleTime(false);
  };

  const workflowMode: WorkflowMode = control?.mode || "running";
  const isPaused = workflowMode === "paused";

  const handleToggleWorkflow = async () => {
    if (!control || savingControl) return;

    const nextMode: WorkflowMode = isPaused ? "running" : "paused";
    setSavingControl(true);

    const { data, error } = await supabase
      .from("workflow_controls")
      .update({
        mode: nextMode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", control.id)
      .select()
      .single();

    if (error) {
      showError(error.message);
      setSavingControl(false);
      return;
    }

    setControl(data as WorkflowControl);
    showSuccess(nextMode === "paused" ? "Đã tạm dừng automation" : "Đã bật lại automation");
    setSavingControl(false);
  };

  const invokeAutomation = async (action: "research" | "write" | "generate-image") => {
    const { data, error } = await supabase.functions.invoke("automation-run", {
      body: { action },
    });

    if (error) {
      throw new Error(error.message || "Lỗi khi chạy automation");
    }

    if (!data?.success) {
      throw new Error(data?.message || "Không thể chạy bước này.");
    }

    return data;
  };

  const handleResearch = async () => {
    setRunningAction("research");
    try {
      const data = await invokeAutomation("research");
      showSuccess(`Đã nghiên cứu và tạo ${data.topics?.length || 0} chủ đề mới`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      showError(err.message || "Không thể nghiên cứu chủ đề");
    } finally {
      setRunningAction(null);
    }
  };

  const handleCreateDraft = async () => {
    setRunningAction("full");
    try {
      await invokeAutomation("write");
      await invokeAutomation("generate-image");
      showSuccess("Đã tạo bài viết từ dữ liệu nghiên cứu và thêm ảnh bìa");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      showError(err.message || "Không thể tạo bài và ảnh");
    } finally {
      setRunningAction(null);
    }
  };

  const handleApprove = async () => {
    if (!reviewItem?.job) {
      showError("Chưa có bài nào để duyệt");
      return;
    }

    setApproving(true);

    try {
      const scheduledFor = getTodayScheduleIso(scheduleTime);

      const { error: updateJobError } = await supabase
        .from("ai_content_jobs")
        .update({
          status: "scheduled",
          scheduled_for: scheduledFor,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewItem.job.id);

      if (updateJobError) {
        throw new Error(updateJobError.message);
      }

      if (reviewItem.article?.id) {
        const { error: updateArticleError } = await supabase
          .from("articles")
          .update({
            status: "scheduled",
            scheduled_for: scheduledFor,
            updated_at: new Date().toISOString(),
          })
          .eq("id", reviewItem.article.id);

        if (updateArticleError) {
          throw new Error(updateArticleError.message);
        }
      }

      showSuccess(`Đã duyệt và lên lịch lúc ${scheduleTime}`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      showError(err.message || "Không thể duyệt bài");
    } finally {
      setApproving(false);
    }
  };

  const handleDeleteReviewItem = async () => {
    if (!reviewItem?.job) {
      showError("Không có bài nào để xóa");
      return;
    }

    setDeleting(true);

    try {
      if (reviewItem.article?.id) {
        const { error: articleDeleteError } = await supabase
          .from("articles")
          .delete()
          .eq("id", reviewItem.article.id);

        if (articleDeleteError) {
          throw new Error(articleDeleteError.message);
        }
      }

      const { error: jobDeleteError } = await supabase
        .from("ai_content_jobs")
        .delete()
        .eq("id", reviewItem.job.id);

      if (jobDeleteError) {
        throw new Error(jobDeleteError.message);
      }

      showSuccess("Đã xoá bài chờ duyệt");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      showError(err.message || "Không thể xoá bài");
    } finally {
      setDeleting(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (loadingControl) return "Đang tải";
    return isPaused ? "Đang tạm dừng" : "Đang hoạt động";
  }, [isPaused, loadingControl]);

  return (
    <div className="space-y-6">
      {!control && !loadingControl && (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">Chưa kết nối được workflow.</p>
          <p className="mt-1">Nhấn nút dưới đây để tạo bảng cần thiết trong database.</p>
          <button
            onClick={initTable}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-700"
          >
            Khởi tạo workflow
          </button>
        </div>
      )}

      <section className="rounded-[2.25rem] border border-[#ece6dd] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f97316]">Automation</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Bảng điều khiển gọn</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Chủ đề sẽ được nghiên cứu thời gian thực từ web trước, sau đó mới dùng để viết bài.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
              isPaused ? "bg-orange-50 text-orange-700" : "bg-teal-50 text-teal-700"
            }`}>
              <span className={`h-2.5 w-2.5 rounded-full ${isPaused ? "bg-orange-500" : "bg-teal-500"}`} />
              {statusLabel}
            </div>

            <button
              type="button"
              onClick={() => setAutoMode((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                autoMode
                  ? "bg-[#0D9488] text-white shadow-lg shadow-teal-100"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {autoMode ? "Auto-pilot bật" : "Auto-pilot tắt"}
            </button>

            <button
              type="button"
              onClick={handleToggleWorkflow}
              disabled={loadingControl || savingControl || !control}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white transition disabled:opacity-60 ${
                isPaused ? "bg-[#0D9488] hover:bg-[#0b7a6f]" : "bg-[#f97316] hover:bg-[#ea6a0f]"
              }`}
            >
              {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              {savingControl ? "Đang cập nhật..." : isPaused ? "Tiếp tục" : "Tạm dừng"}
            </button>

            <button
              type="button"
              onClick={handleRunScheduler}
              disabled={runningScheduler || isPaused}
              className="inline-flex items-center gap-2 rounded-full bg-[#6366f1] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#4f46e5] disabled:opacity-60"
            >
              {runningScheduler ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {runningScheduler ? "Đang chạy..." : "Chạy scheduler ngay"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] bg-[#f7fbfa] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Giờ đăng</p>
            <div className="mt-3 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[#0D9488]" />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                onBlur={() => saveScheduleTime(scheduleTime)}
                className="rounded-xl border border-[#d9e7e5] bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {savingScheduleTime ? "Đang lưu..." : "Giờ mặc định này được lưu trong hệ thống"}
            </p>
            {lastActivity.schedulerLastRun && (
              <p className="mt-3 text-xs text-slate-400">
                Lần chạy cuối: {new Date(lastActivity.schedulerLastRun).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
              </p>
            )}
          </div>

          <div className="rounded-[1.75rem] bg-[#fff8f2] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Chờ duyệt</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stats.waitingReview}</p>
            {lastActivity.writeLastRun && (
              <p className="mt-3 text-xs text-slate-400">
                Viết bài cuối: {new Date(lastActivity.writeLastRun).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
              </p>
            )}
          </div>

          <div className="rounded-[1.75rem] bg-[#f5f7ff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Đã lên lịch</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stats.scheduledJobs}</p>
            {lastActivity.researchLastRun && (
              <p className="mt-3 text-xs text-slate-400">
                Research cuối: {new Date(lastActivity.researchLastRun).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#f97316]">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900">Nghiên cứu chủ đề</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            AI tìm thông tin mới nhất từ web qua Tavily, tổng hợp insight và lưu nguồn tham khảo.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">{stats.pendingTopics} chủ đề đang chờ</p>
          <button
            type="button"
            onClick={handleResearch}
            disabled={isPaused || runningAction !== null}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f97316] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ea6a0f] disabled:opacity-60"
          >
            {runningAction === "research" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : <Search className="h-4 w-4" />}
            Nghiên cứu thời gian thực
          </button>
        </div>

        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0fdfa] text-[#0D9488]">
            <Wand2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900">Tạo bài + ảnh</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            AI lấy chính dữ liệu nghiên cứu đã lưu để viết bài cập nhật hơn rồi tạo ảnh bìa.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">{stats.draftsCreated} bài AI hiện có</p>
          <button
            type="button"
            onClick={handleCreateDraft}
            disabled={isPaused || runningAction !== null}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0D9488] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b7a6f] disabled:opacity-60"
          >
            {runningAction === "full" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : <Bot className="h-4 w-4" />}
            Tạo bài hoàn chỉnh
          </button>
        </div>

        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f7ff] text-[#2563eb]">
            <Send className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900">Duyệt & lên lịch</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Duyệt bài đang chờ và gắn giờ đăng mặc định chỉ với một lần bấm.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">Đăng mặc định lúc {scheduleTime}</p>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!reviewItem?.article || approving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2563eb] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {approving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : <CheckCircle2 className="h-4 w-4" />}
            Duyệt bài chờ
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setTopicsCollapsed(!topicsCollapsed)}
            className="flex w-full items-center justify-between"
          >
            <h3 className="text-base font-black text-slate-900">Chủ đề mới</h3>
            {topicsCollapsed ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronUp className="h-5 w-5 text-slate-400" />}
          </button>
          {!topicsCollapsed && (
            <div className="mt-4 space-y-3">
              {loadingQueues ? (
                <p className="text-sm text-slate-500">Đang tải...</p>
              ) : researchTopics.length === 0 ? (
                <p className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm text-slate-500">Chưa có chủ đề mới.</p>
              ) : (
                researchTopics.map((topic) => (
                  <div key={topic.id} className="rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-sm font-semibold text-slate-900">{topic.topic}</p>
                    <p className="mt-1 text-xs text-slate-500">{topic.keyword}</p>
                    {topic.research_notes && (
                      <p className="mt-3 line-clamp-4 text-xs leading-5 text-slate-600">{topic.research_notes}</p>
                    )}
                    {Array.isArray(topic.source_urls) && topic.source_urls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {topic.source_urls.slice(0, 2).map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D9488]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Nguồn tham khảo
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-black text-slate-900">Bài chờ duyệt</h3>
            {reviewItem?.article && (
              <div className="flex gap-2">
                <a
                  href={`/admin/preview/${reviewItem.article.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Xem trước
                </a>
                <button
                  type="button"
                  onClick={handleDeleteReviewItem}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
                >
                  {deleting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-400/70 border-t-transparent" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Xóa
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            {loadingQueues ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : !reviewItem?.article ? (
              <p className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm text-slate-500">Chưa có bài nào sẵn sàng để duyệt.</p>
            ) : (
              <div className="overflow-hidden rounded-[1.5rem] border border-[#ece6dd]">
                {reviewItem.article.image_url && (
                  <img
                    src={reviewItem.article.image_url}
                    alt={reviewItem.article.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f97316]">{reviewItem.article.category}</p>
                  <h4 className="mt-2 text-base font-black text-slate-900">{reviewItem.article.title}</h4>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{reviewItem.article.excerpt}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
          <h3 className="text-base font-black text-slate-900">Đã lên lịch</h3>
          <div className="mt-4 space-y-3">
            {loadingQueues ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : scheduledArticles.length === 0 ? (
              <p className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm text-slate-500">Chưa có bài nào đã lên lịch.</p>
            ) : (
              scheduledArticles.map((article) => (
                <div key={article.id} className="rounded-2xl bg-[#fbfaf7] p-4">
                  <p className="text-sm font-semibold text-slate-900">{article.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {article.scheduled_for ? new Date(article.scheduled_for).toLocaleString("vi-VN") : "Đã lên lịch"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── LỊCH SỬ HOẠT ĐỘNG ──────────────────────────────── */}
      <section className="rounded-[2.25rem] border border-[#ece6dd] bg-white p-5 shadow-sm sm:p-6">
        <button
          type="button"
          onClick={() => setLogsCollapsed(!logsCollapsed)}
          className="flex w-full items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f5f3ff] text-[#6366f1]">
            <History className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-slate-900">Lịch sử hoạt động</h2>
            <p className="text-xs text-slate-500">Các lần chạy gần đây của scheduler, research, write, generate-image</p>
          </div>
          {logsCollapsed ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronUp className="h-5 w-5 text-slate-400" />}
        </button>

        {!logsCollapsed && (
          <div className="mt-5">
            {loadingLogs ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : workflowLogs.length === 0 ? (
              <div className="rounded-2xl bg-[#fbfaf7] px-5 py-8 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-400">Chưa có lịch sử hoạt động</p>
                <p className="mt-1 text-xs text-slate-400">Nhấn nút "Chạy scheduler ngay" hoặc các nút automation để bắt đầu</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workflowLogs.map((log) => {
                  const isSuccess = log.status === "success";
                  const isFailed = log.status === "failed";
                  const isSkipped = log.status === "skipped";

                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-4 rounded-2xl p-4 transition ${
                        isFailed ? "bg-red-50" : isSkipped ? "bg-amber-50" : "bg-[#fbfaf7]"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isSuccess && <CheckCircle2 className="h-5 w-5 text-teal-500" />}
                        {isFailed && <XCircle className="h-5 w-5 text-red-500" />}
                        {isSkipped && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase tracking-[0.12em] ${
                            log.action === "scheduler" ? "text-[#6366f1]" :
                            log.action === "research" ? "text-[#f97316]" :
                            log.action === "write" ? "text-[#0D9488]" :
                            "text-[#2563eb]"
                          }`}>
                            {log.action}
                          </span>
                          {log.duration_ms != null && (
                            <span className="text-xs text-slate-400">· {(log.duration_ms / 1000).toFixed(1)}s</span>
                          )}
                        </div>
                        <p className={`mt-0.5 text-sm ${isFailed ? "text-red-700 font-semibold" : "text-slate-700"}`}>
                          {log.message || "(không có mô tả)"}
                        </p>
                        {log.details && typeof log.details === "object" && "published" in log.details && (
                          <div className="mt-2 space-y-1">
                            {Array.isArray(log.details.published) && (log.details.published as string[]).map((item: string, i: number) => (
                              <p key={i} className="text-xs text-slate-500 pl-1 border-l-2 border-slate-200">
                                {item}
                              </p>
                            ))}
                          </div>
                        )}
                        {log.details && typeof log.details === "object" && "topics" in log.details && (
                          <div className="mt-2 space-y-1">
                            {Array.isArray(log.details.topics) && (log.details.topics as Array<{topic: string}>).map((t, i: number) => (
                              <p key={i} className="text-xs text-slate-500 pl-1 border-l-2 border-orange-200">
                                → {t.topic}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">
                        {new Date(log.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AutomationWorkflow;