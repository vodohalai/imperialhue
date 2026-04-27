import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  PauseCircle,
  PlayCircle,
  RefreshCw,
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

type WorkflowStatus = "ready" | "running" | "waiting" | "done";

type WorkflowStep = {
  id: string;
  title: string;
  desc: string;
  meta: string;
  status: WorkflowStatus;
  icon: typeof Search;
  accent: string;
  softBg: string;
  autoRunnable: boolean;
};

type WorkflowWindow = Window & {
  __workflowInterval?: ReturnType<typeof setInterval>;
};

type ReviewItem = {
  job: AiContentJob;
  article: Article | null;
};

const statusMap: Record<
  WorkflowStatus,
  {
    label: string;
    badge: string;
    dot: string;
    border: string;
  }
> = {
  ready: {
    label: "Ready",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
    border: "border-teal-200",
  },
  running: {
    label: "Running",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    border: "border-orange-200",
  },
  waiting: {
    label: "Waiting",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    border: "border-sky-200",
  },
  done: {
    label: "Done",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
};

const WORKFLOW_KEY = "blog_automation";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AutomationWorkflow = () => {
  const [selectedId, setSelectedId] = useState("writer");
  const [control, setControl] = useState<WorkflowControl | null>(null);
  const [loadingControl, setLoadingControl] = useState(true);
  const [savingControl, setSavingControl] = useState(false);
  const [runningStep, setRunningStep] = useState<string | null>(null);
  const [runningFullWorkflow, setRunningFullWorkflow] = useState(false);
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [researchErrors, setResearchErrors] = useState<string[]>([]);
  const [researchTopics, setResearchTopics] = useState<SeoTopic[]>([]);
  const [loadingResearchTopics, setLoadingResearchTopics] = useState(false);
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const [loadingReviewItem, setLoadingReviewItem] = useState(false);
  const { stats } = useAutomationStats(refreshTrigger);

  const steps: WorkflowStep[] = [
    {
      id: "research",
      title: "SEO Research",
      desc: "Tìm chủ đề SEO mới về du lịch, ẩm thực, địa điểm và trải nghiệm tại Huế.",
      meta: `${stats.totalTopics} topics found (${stats.pendingTopics} pending)`,
      status: stats.pendingTopics > 0 ? "running" : "ready",
      icon: Search,
      accent: "text-[#f97316]",
      softBg: "bg-[#fff7ed]",
      autoRunnable: true,
    },
    {
      id: "queue",
      title: "Topic Queue",
      desc: "Xếp hạng, gom nhóm và giữ các chủ đề tốt nhất trước khi tạo bài viết.",
      meta: `${stats.usedTopics} topics ready`,
      status: stats.usedTopics > 0 ? "ready" : "waiting",
      icon: PlayCircle,
      accent: "text-[#0D9488]",
      softBg: "bg-[#f0fdfa]",
      autoRunnable: false,
    },
    {
      id: "writer",
      title: "AI Writer",
      desc: "Viết tiêu đề, excerpt, nội dung HTML và slug chuẩn SEO cho blog.",
      meta: `${stats.draftsCreated} drafts created`,
      status: stats.draftsCreated > 0 ? "running" : "ready",
      icon: FileText,
      accent: "text-[#2563eb]",
      softBg: "bg-[#eff6ff]",
      autoRunnable: true,
    },
    {
      id: "image",
      title: "AI Image",
      desc: "Sinh ảnh bìa theo chủ đề và đồng bộ với từng bài viết AI.",
      meta: `${stats.draftsCreated} covers ready`,
      status: stats.draftsCreated > 0 ? "running" : "ready",
      icon: ImageIcon,
      accent: "text-[#7c3aed]",
      softBg: "bg-[#f5f3ff]",
      autoRunnable: true,
    },
    {
      id: "review",
      title: "Review",
      desc: "Admin xem nhanh nội dung, kiểm tra tính phù hợp và quyết định duyệt.",
      meta: `${stats.waitingReview} waiting approval`,
      status: stats.waitingReview > 0 ? "waiting" : "ready",
      icon: CheckCircle2,
      accent: "text-[#d97706]",
      softBg: "bg-[#fffbeb]",
      autoRunnable: false,
    },
    {
      id: "schedule",
      title: "Schedule 06:00",
      desc: "Đưa bài đã duyệt vào hàng chờ đăng tự động lúc 06:00 sáng.",
      meta: `${stats.scheduledJobs} scheduled`,
      status: stats.scheduledJobs > 0 ? "running" : "ready",
      icon: CalendarClock,
      accent: "text-[#65a30d]",
      softBg: "bg-[#f7fee7]",
      autoRunnable: false,
    },
    {
      id: "publish",
      title: "Publish Blog",
      desc: "Xuất bản bài viết lên website và kích hoạt vòng đời SEO tự nhiên.",
      meta: `${stats.publishedJobs} published (${stats.failedJobs} failed)`,
      status: stats.publishedJobs > 0 ? "done" : "ready",
      icon: Send,
      accent: "text-[#16a34a]",
      softBg: "bg-[#f0fdf4]",
      autoRunnable: false,
    },
  ];

  const selectedStep = useMemo(
    () => steps.find((step) => step.id === selectedId) || steps[0],
    [selectedId, steps],
  );

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

  const fetchResearchTopics = async () => {
    setLoadingResearchTopics(true);

    const { data, error } = await supabase
      .from("seo_topics")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      setLoadingResearchTopics(false);
      showError(error.message);
      return [];
    }

    const topics = (data || []) as SeoTopic[];
    setResearchTopics(topics);
    setLoadingResearchTopics(false);
    return topics;
  };

  const fetchReviewItem = async () => {
    setLoadingReviewItem(true);

    const { data: job, error: jobError } = await supabase
      .from("ai_content_jobs")
      .select("*")
      .eq("status", "draft_ai")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (jobError) {
      setLoadingReviewItem(false);
      showError(jobError.message);
      return;
    }

    if (!job) {
      setReviewItem(null);
      setLoadingReviewItem(false);
      return;
    }

    let article: Article | null = null;

    if (job.article_id) {
      const { data: articleData, error: articleError } = await supabase
        .from("articles")
        .select("*")
        .eq("id", job.article_id)
        .maybeSingle();

      if (articleError) {
        setLoadingReviewItem(false);
        showError(articleError.message);
        return;
      }

      article = articleData as Article | null;
    }

    setReviewItem({
      job: job as AiContentJob,
      article,
    });
    setLoadingReviewItem(false);
  };

  useEffect(() => {
    if (selectedId === "research") {
      fetchResearchTopics().catch(() => undefined);
    }

    if (selectedId === "review") {
      fetchReviewItem().catch(() => undefined);
    }
  }, [selectedId, refreshTrigger]);

  const initTable = async () => {
    setLoadingControl(true);
    try {
      const { error } = await supabase.functions.invoke("init-workflow-table");
      if (error) {
        showError("Không thể khởi tạo bảng workflow. Lỗi: " + error.message);
      } else {
        showSuccess("Đã khởi tạo bảng workflow thành công. Đang tải lại...");
        await fetchControl();
      }
    } finally {
      setLoadingControl(false);
    }
  };

  const initData = async () => {
    const { error } = await supabase.functions.invoke("init-automation-tables");
    if (error) {
      showError("Không thể khởi tạo dữ liệu automation. Lỗi: " + error.message);
      return;
    }

    showSuccess("Đã khởi tạo dữ liệu automation thành công.");
    setRefreshTrigger((prev) => prev + 1);
  };

  const runScheduler = async () => {
    const { error } = await supabase.functions.invoke("workflow-scheduler");
    if (error) {
      showError("Lỗi khi chạy scheduler: " + error.message);
      return;
    }

    showSuccess("Workflow scheduler đã chạy thành công!");
    setLastRun(new Date().toLocaleString("vi-VN"));
    setRefreshTrigger((prev) => prev + 1);
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

  const toggleAutoMode = () => {
    const workflowWindow = window as WorkflowWindow;

    setAutoMode((prev) => {
      const next = !prev;
      if (next) {
        showSuccess("Auto-pilot mode activated. Workflow sẽ tự động chạy mỗi giờ.");
        const intervalId = setInterval(() => {
          runScheduler();
        }, 3600000);
        workflowWindow.__workflowInterval = intervalId;
      } else {
        showSuccess("Auto-pilot mode deactivated.");
        if (workflowWindow.__workflowInterval) {
          clearInterval(workflowWindow.__workflowInterval);
          workflowWindow.__workflowInterval = undefined;
        }
      }
      return next;
    });
  };

  useEffect(() => {
    fetchControl().catch(() => undefined);

    return () => {
      const workflowWindow = window as WorkflowWindow;
      if (workflowWindow.__workflowInterval) {
        clearInterval(workflowWindow.__workflowInterval);
      }
    };
  }, []);

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
    showSuccess(nextMode === "paused" ? "Đã tạm dừng workflow" : "Đã tiếp tục workflow");
    setSavingControl(false);
  };

  const runStep = async (stepId: string) => {
    const actionMap: Record<string, "research" | "write" | "generate-image"> = {
      research: "research",
      writer: "write",
      image: "generate-image",
    };

    const action = actionMap[stepId];
    if (!action) return;

    setRunningStep(stepId);

    if (stepId === "research") {
      setResearchErrors([]);
    }

    try {
      const data = await invokeAutomation(action);

      if (action === "research") {
        const errors = (data.errors || []) as string[];
        setResearchErrors(errors);
        setSelectedId("research");
        await fetchResearchTopics();

        if (errors.length > 0) {
          showError(`Đã tạo topic nhưng có ${errors.length} lỗi.`);
        } else {
          showSuccess(`Đã tạo ${data.topics?.length || 0} chủ đề SEO mới`);
        }
      } else {
        showSuccess(`Bước ${stepId} đã chạy thành công!`);
      }

      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      showError(err.message || "Lỗi khi chạy automation");
    } finally {
      setRunningStep(null);
    }
  };

  const runFullWorkflow = async () => {
    setRunningFullWorkflow(true);
    setResearchErrors([]);

    try {
      setSelectedId("research");
      const researchData = await invokeAutomation("research");
      const researchList = await fetchResearchTopics();
      setRefreshTrigger((prev) => prev + 1);

      if ((researchData.errors || []).length > 0) {
        setResearchErrors(researchData.errors || []);
      }

      await wait(500);

      if (!researchList.length && !(researchData.topics || []).length) {
        throw new Error("Không có topic nào sẵn sàng sau bước SEO Research.");
      }

      setSelectedId("writer");
      await invokeAutomation("write");
      setRefreshTrigger((prev) => prev + 1);

      await wait(500);

      const { data: draftJobs, error: draftError } = await supabase
        .from("ai_content_jobs")
        .select("id")
        .eq("status", "draft_ai")
        .limit(1);

      if (draftError) {
        throw new Error(draftError.message);
      }

      if (!draftJobs || draftJobs.length === 0) {
        throw new Error("Không có draft AI nào sau bước AI Writer.");
      }

      setSelectedId("image");
      await invokeAutomation("generate-image");
      setRefreshTrigger((prev) => prev + 1);

      await wait(500);

      const { data: imageJobs, error: imageError } = await supabase
        .from("ai_content_jobs")
        .select("id,image_url")
        .eq("status", "draft_ai")
        .not("image_url", "is", null)
        .limit(1);

      if (imageError) {
        throw new Error(imageError.message);
      }

      if (!imageJobs || imageJobs.length === 0) {
        throw new Error("Chưa tạo được ảnh bìa sau bước AI Image.");
      }

      setSelectedId("review");
      await fetchReviewItem();
      showSuccess("Đã chạy full workflow đến bước chờ duyệt.");
    } catch (err: any) {
      showError(err.message || "Không thể chạy full workflow");
    } finally {
      setRunningFullWorkflow(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);

    try {
      const { data: job, error: jobError } = await supabase
        .from("ai_content_jobs")
        .select("*")
        .eq("status", "draft_ai")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (jobError) {
        throw new Error(jobError.message);
      }

      if (!job) {
        throw new Error("Không có bài nào đang chờ duyệt.");
      }

      const scheduledFor = new Date();
      scheduledFor.setHours(6, 0, 0, 0);

      const { error: updateJobError } = await supabase
        .from("ai_content_jobs")
        .update({
          status: "scheduled",
          scheduled_for: scheduledFor.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      if (updateJobError) {
        throw new Error(updateJobError.message);
      }

      if (job.article_id) {
        const { error: updateArticleError } = await supabase
          .from("articles")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.article_id);

        if (updateArticleError) {
          throw new Error(updateArticleError.message);
        }
      }

      setRefreshTrigger((prev) => prev + 1);
      setSelectedId("schedule");
      showSuccess("Đã duyệt bài và chuyển sang bước lên lịch.");
    } catch (err: any) {
      showError(err.message || "Không thể duyệt bài");
    } finally {
      setApproving(false);
    }
  };

  const handleDeleteReviewItem = async () => {
    if (!reviewItem?.job) {
      showError("Không có bài nào để xóa.");
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

      setReviewItem(null);
      setRefreshTrigger((prev) => prev + 1);
      showSuccess("Đã xoá bài chờ duyệt.");
    } catch (err: any) {
      showError(err.message || "Không thể xoá bài");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="overflow-hidden rounded-[2.25rem] border border-[#ece6dd] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#f1ebe3] px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Workflow Canvas</p>
              <h2 className="text-lg font-black text-slate-900">Automation Flow</h2>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
                isPaused ? "border-orange-200 bg-orange-50 text-orange-700" : "border-teal-200 bg-teal-50 text-teal-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isPaused ? "bg-orange-500" : "bg-teal-500"}`} />
              {loadingControl ? "Đang tải..." : isPaused ? "Đã tạm dừng" : "Đang hoạt động"}
            </div>

            <button
              type="button"
              onClick={runFullWorkflow}
              disabled={runningFullWorkflow || isPaused}
              className="inline-flex items-center gap-2 rounded-full bg-[#0D9488] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-[#0b7a6f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {runningFullWorkflow ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Run Full Workflow
            </button>

            <button
              type="button"
              onClick={toggleAutoMode}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-lg transition ${
                autoMode
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200 hover:from-purple-600 hover:to-pink-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {autoMode ? "Auto-pilot: ON" : "Auto-pilot: OFF"}
            </button>

            <button
              type="button"
              onClick={runScheduler}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-600"
            >
              <RefreshCw className="h-4 w-4" />
              Run Scheduler
            </button>

            <button
              type="button"
              onClick={handleToggleWorkflow}
              disabled={loadingControl || savingControl || !control}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isPaused ? "bg-[#0D9488] shadow-teal-100 hover:bg-[#0b7a6f]" : "bg-[#f97316] shadow-orange-200 hover:bg-[#ea6a0f]"
              }`}
            >
              {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              {savingControl ? "Đang cập nhật..." : isPaused ? "Tiếp tục" : "Tạm dừng"}
            </button>

            <button
              type="button"
              onClick={initData}
              className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700 transition hover:bg-purple-100"
            >
              Khởi tạo dữ liệu automation
            </button>
          </div>
        </div>

        {!control && !loadingControl && (
          <div className="mx-6 mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Chưa thể kết nối đến bảng workflow.</p>
            <p className="mt-1">Hãy nhấn nút bên dưới để tự động tạo bảng cần thiết trong database.</p>
            <button
              onClick={initTable}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
            >
              Khởi tạo bảng workflow
            </button>
          </div>
        )}

        <div className="border-t border-[#f6f1e8] bg-[#fcfaf6] p-4 sm:p-6">
          {autoMode && (
            <div className="mb-4 rounded-[1.5rem] border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-bold text-purple-700">Auto-pilot mode active</span>
                <span className="ml-auto text-xs text-purple-500">
                  {lastRun ? `Last run: ${lastRun}` : "Ready to run"}
                </span>
              </div>
              <p className="mt-1 text-xs text-purple-600">
                Workflow sẽ tự động chạy các bước có thể tự động mỗi giờ. Bạn vẫn có thể can thiệp thủ công.
              </p>
            </div>
          )}

          <div className="mb-4 rounded-[1.5rem] border border-[#efe8dd] bg-white px-4 py-3 text-sm text-slate-600">
            {isPaused
              ? "Workflow đã được tạm dừng. Admin có thể tiếp tục lại bất cứ lúc nào."
              : "Workflow đang ở chế độ hoạt động. Các bước tự động sẽ chạy định kỳ, bước duyệt vẫn cần admin xác nhận."}
          </div>

          <div className="rounded-[2rem] border border-[#efe8dd] bg-[#fdfbf7] p-4 sm:p-6">
            <div className="space-y-0">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const baseState = statusMap[step.status];
                const state =
                  isPaused && step.status === "running"
                    ? {
                        label: "Paused",
                        badge: "bg-orange-50 text-orange-700 border-orange-200",
                        dot: "bg-orange-500",
                        border: "border-orange-200",
                      }
                    : baseState;
                const isSelected = selectedId === step.id;
                const isLast = index === steps.length - 1;
                const isRunnable = ["research", "writer", "image"].includes(step.id);
                const isRunning = runningStep === step.id;

                return (
                  <div key={step.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedId(step.id)}
                      className={`relative z-10 flex w-full items-center gap-4 rounded-[2rem] border bg-white p-4 text-left transition sm:p-5 ${
                        isSelected
                          ? "border-[#0D9488] shadow-[0_12px_30px_rgba(13,148,136,0.12)]"
                          : "border-[#eadfce] hover:border-[#d9cdbd] hover:shadow-sm"
                      }`}
                    >
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] ${step.softBg} ${step.accent}`}>
                        <Icon className="h-8 w-8" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <h3 className="text-xl font-black text-slate-900">{step.title}</h3>
                          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${state.badge}`}>
                            <span className={`h-2 w-2 rounded-full ${state.dot} ${!isPaused && step.status === "running" ? "animate-pulse" : ""}`} />
                            {state.label}
                          </span>
                          {step.autoRunnable && autoMode && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-600">
                              <Sparkles className="h-3 w-3" />
                              AUTO
                            </span>
                          )}
                          {isRunnable && !isPaused && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                runStep(step.id);
                              }}
                              disabled={isRunning || runningFullWorkflow}
                              className="ml-auto flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-50"
                            >
                              {isRunning ? (
                                <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                              Run
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-500">{step.meta}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
                      </div>
                    </button>

                    {!isLast && (
                      <div className="relative flex h-8 justify-center">
                        <div className="absolute top-0 h-full w-px bg-[#d8cfc1]" />
                        <div className="absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#eadfce] bg-white text-slate-400">
                          <ChevronRight className="h-4 w-4 rotate-90" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <aside className="rounded-[2.25rem] border border-[#ece6dd] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Module Detail</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">{selectedStep.title}</h3>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
              isPaused && selectedStep.status === "running"
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : statusMap[selectedStep.status].badge
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isPaused && selectedStep.status === "running" ? "bg-orange-500" : statusMap[selectedStep.status].dot
              } ${!isPaused && selectedStep.status === "running" ? "animate-pulse" : ""}`}
            />
            {isPaused && selectedStep.status === "running" ? "Paused" : statusMap[selectedStep.status].label}
          </div>
        </div>

        <div
          className={`mt-5 rounded-[1.75rem] border ${
            isPaused && selectedStep.status === "running"
              ? "border-orange-200 bg-orange-50"
              : statusMap[selectedStep.status].border
          } ${isPaused && selectedStep.status === "running" ? "" : selectedStep.softBg} p-5`}
        >
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white ${selectedStep.accent} shadow-sm`}>
            <selectedStep.icon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-900">
            {selectedStep.id === "research" && researchTopics.length > 0
              ? `${researchTopics.length} topic pending trong hệ thống`
              : selectedStep.id === "review" && reviewItem?.article
                ? reviewItem.article.title
                : selectedStep.meta}
          </p>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600">{selectedStep.desc}</p>

        {selectedStep.id === "research" && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Danh sách topic pending</h4>

            {loadingResearchTopics ? (
              <div className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm text-slate-500">
                Đang tải topic từ Supabase...
              </div>
            ) : researchTopics.length === 0 ? (
              <div className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm text-slate-500">
                Chưa có topic pending nào để hiển thị.
              </div>
            ) : (
              researchTopics.map((topic) => (
                <div key={topic.id} className="rounded-2xl border border-[#f3dcc8] bg-[#fff8f2] p-4">
                  <p className="text-sm font-semibold text-slate-900">{topic.topic}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-white px-2.5 py-1 font-medium">🔑 {topic.keyword}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 font-medium">📁 {topic.category}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 font-medium">🎯 {topic.search_intent}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 font-medium">⭐ {topic.priority_score}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedStep.id === "review" && (
          <div className="mt-6 space-y-4">
            {loadingReviewItem ? (
              <div className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm text-slate-500">
                Đang tải bài chờ duyệt...
              </div>
            ) : !reviewItem?.article ? (
              <div className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm text-slate-500">
                Chưa có bài nào đang chờ duyệt.
              </div>
            ) : (
              <>
                {reviewItem.article.image_url && (
                  <img
                    src={reviewItem.article.image_url}
                    alt={reviewItem.article.title}
                    className="h-44 w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                )}

                <div className="rounded-2xl border border-[#ece6dd] bg-[#fffdf9] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f97316]">
                    {reviewItem.article.category}
                  </p>
                  <h4 className="mt-2 text-lg font-black text-slate-900">{reviewItem.article.title}</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{reviewItem.article.excerpt}</p>
                </div>

                <div className="rounded-2xl border border-[#ece6dd] bg-white p-4">
                  <p className="mb-3 text-sm font-bold text-slate-900">Xem nhanh nội dung</p>
                  <div
                    className="max-h-72 overflow-auto prose prose-sm max-w-none prose-p:text-slate-600 prose-headings:text-slate-900"
                    dangerouslySetInnerHTML={{ __html: reviewItem.article.content }}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0D9488] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-[#0b7a6f] disabled:opacity-60"
                  >
                    {approving ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {approving ? "Đang duyệt..." : "Duyệt"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteReviewItem}
                    disabled={deleting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    {deleting ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-400/70 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {deleting ? "Đang xoá..." : "Xoá bài"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {selectedStep.id === "research" && researchErrors.length > 0 && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <h4 className="text-sm font-bold text-red-800">Lỗi khi tạo topic</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-700">
              {researchErrors.map((errorItem) => (
                <li key={errorItem}>{errorItem}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] bg-[#f7fbfa] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Queue</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{stats.totalJobs}</p>
          </div>
          <div className="rounded-[1.5rem] bg-[#fff8f2] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Success</p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {stats.totalJobs > 0 ? Math.round(((stats.publishedJobs + stats.scheduledJobs) / stats.totalJobs) * 100) : 0}%
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AutomationWorkflow;