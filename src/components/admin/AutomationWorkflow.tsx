import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Search,
  Send,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import type { Article, WorkflowControl, WorkflowMode, SeoTopic, AiContentJob } from "@/integrations/supabase/types";
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
  const { stats } = useAutomationStats(refreshTrigger);

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
      setControl(data as WorkflowControl);
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("workflow_controls")
        .insert([{ workflow_key: WORKFLOW_KEY, mode: "running" }])
        .select()
        .single();

      if (insertError) {
        showError(insertError.message);
      } else {
        setControl(inserted as WorkflowControl);
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

  useEffect(() => {
    fetchControl().catch(() => undefined);
  }, []);

  useEffect(() => {
    fetchQueues().catch(() => undefined);
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
      showSuccess(`Đã tạo ${data.topics?.length || 0} chủ đề mới`);
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
      showSuccess("Đã tạo bài viết và ảnh bìa");
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
              Chỉ giữ trạng thái chính, 3 thao tác quan trọng và hàng chờ nội dung để bạn xử lý nhanh hơn.
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
                className="rounded-xl border border-[#d9e7e5] bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-[#fff8f2] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Chờ duyệt</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stats.waitingReview}</p>
          </div>

          <div className="rounded-[1.75rem] bg-[#f5f7ff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Đã lên lịch</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{stats.scheduledJobs}</p>
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
            Tạo nhanh các chủ đề SEO mới để đưa vào hàng chờ viết bài.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">{stats.pendingTopics} chủ đề đang chờ</p>
          <button
            type="button"
            onClick={handleResearch}
            disabled={isPaused || runningAction !== null}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f97316] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ea6a0f] disabled:opacity-60"
          >
            {runningAction === "research" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : <Search className="h-4 w-4" />}
            Tạo chủ đề mới
          </button>
        </div>

        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0fdfa] text-[#0D9488]">
            <Wand2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900">Tạo bài + ảnh</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Viết một bài AI hoàn chỉnh và tạo luôn ảnh bìa để chuyển sang bước duyệt.
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
          <h3 className="text-base font-black text-slate-900">Chủ đề mới</h3>
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
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-black text-slate-900">Bài chờ duyệt</h3>
            {reviewItem?.article && (
              <button
                type="button"
                onClick={handleDeleteReviewItem}
                disabled={deleting}
                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
              >
                {deleting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-400/70 border-t-transparent" /> : <Trash2 className="h-3.5 w-3.5" />}
                Xóa
              </button>
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
    </div>
  );
};

export default AutomationWorkflow;