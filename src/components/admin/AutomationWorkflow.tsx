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
  Search,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import type { WorkflowControl, WorkflowMode } from "@/integrations/supabase/types";

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
};

const steps: WorkflowStep[] = [
  {
    id: "research",
    title: "SEO Research",
    desc: "Tìm chủ đề SEO mới về du lịch, ẩm thực, địa điểm và trải nghiệm tại Huế.",
    meta: "12 topics found",
    status: "running",
    icon: Search,
    accent: "text-[#f97316]",
    softBg: "bg-[#fff7ed]",
  },
  {
    id: "queue",
    title: "Topic Queue",
    desc: "Xếp hạng, gom nhóm và giữ các chủ đề tốt nhất trước khi tạo bài viết.",
    meta: "8 topics ready",
    status: "ready",
    icon: PlayCircle,
    accent: "text-[#0D9488]",
    softBg: "bg-[#f0fdfa]",
  },
  {
    id: "writer",
    title: "AI Writer",
    desc: "Viết tiêu đề, excerpt, nội dung HTML và slug chuẩn SEO cho blog.",
    meta: "3 drafts created",
    status: "running",
    icon: FileText,
    accent: "text-[#2563eb]",
    softBg: "bg-[#eff6ff]",
  },
  {
    id: "image",
    title: "AI Image",
    desc: "Sinh ảnh bìa theo chủ đề và đồng bộ với từng bài viết AI.",
    meta: "3 covers ready",
    status: "ready",
    icon: ImageIcon,
    accent: "text-[#7c3aed]",
    softBg: "bg-[#f5f3ff]",
  },
  {
    id: "review",
    title: "Review",
    desc: "Admin xem nhanh nội dung, kiểm tra tính phù hợp và quyết định duyệt.",
    meta: "2 waiting approval",
    status: "waiting",
    icon: CheckCircle2,
    accent: "text-[#d97706]",
    softBg: "bg-[#fffbeb]",
  },
  {
    id: "schedule",
    title: "Schedule 06:00",
    desc: "Đưa bài đã duyệt vào hàng chờ đăng tự động lúc 06:00 sáng.",
    meta: "1 scheduled",
    status: "ready",
    icon: CalendarClock,
    accent: "text-[#65a30d]",
    softBg: "bg-[#f7fee7]",
  },
  {
    id: "publish",
    title: "Publish Blog",
    desc: "Xuất bản bài viết lên website và kích hoạt vòng đời SEO tự nhiên.",
    meta: "Auto publish active",
    status: "done",
    icon: Send,
    accent: "text-[#16a34a]",
    softBg: "bg-[#f0fdf4]",
  },
];

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

const AutomationWorkflow = () => {
  const [selectedId, setSelectedId] = useState("writer");
  const [control, setControl] = useState<WorkflowControl | null>(null);
  const [loadingControl, setLoadingControl] = useState(true);
  const [savingControl, setSavingControl] = useState(false);

  const selectedStep = useMemo(
    () => steps.find((step) => step.id === selectedId) || steps[0],
    [selectedId],
  );

  useEffect(() => {
    const fetchControl = async () => {
      setLoadingControl(true);

      const { data, error } = await supabase
        .from("workflow_controls")
        .select("*")
        .eq("workflow_key", WORKFLOW_KEY)
        .maybeSingle();

      if (error) {
        showError("Chưa có bảng workflow_controls trong Supabase");
        setLoadingControl(false);
        return;
      }

      if (data) {
        setControl(data as WorkflowControl);
        setLoadingControl(false);
        return;
      }

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

      setLoadingControl(false);
    };

    fetchControl();
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

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
                isPaused ? "border-orange-200 bg-orange-50 text-orange-700" : "border-teal-200 bg-teal-50 text-teal-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isPaused ? "bg-orange-500" : "bg-teal-500"}`} />
              {loadingControl ? "Đang tải trạng thái..." : isPaused ? "Workflow đang tạm dừng" : "Workflow đang hoạt động"}
            </div>

            <button
              type="button"
              onClick={handleToggleWorkflow}
              disabled={loadingControl || savingControl || !control}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isPaused ? "bg-[#0D9488] shadow-teal-100 hover:bg-[#0b7a6f]" : "bg-[#f97316] shadow-orange-200 hover:bg-[#ea6a0f]"
              }`}
            >
              {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              {savingControl ? "Đang cập nhật..." : isPaused ? "Tiếp tục workflow" : "Tạm dừng workflow"}
            </button>
          </div>
        </div>

        <div className="border-t border-[#f6f1e8] bg-[#fcfaf6] p-4 sm:p-6">
          <div className="mb-4 rounded-[1.5rem] border border-[#efe8dd] bg-white px-4 py-3 text-sm text-slate-600">
            {isPaused
              ? "Workflow đã được tạm dừng. Admin có thể tiếp tục lại bất cứ lúc nào."
              : "Workflow đang ở chế độ hoạt động. Bạn có thể tạm dừng nhanh nếu cần kiểm tra hoặc bảo trì."}
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
          <p className="mt-4 text-sm font-bold text-slate-900">{selectedStep.meta}</p>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600">{selectedStep.desc}</p>

        <div className="mt-6 space-y-3">
          {[
            isPaused
              ? "Workflow tổng đang tạm dừng nên các bước đang chạy cũng sẽ dừng theo."
              : "Workflow tổng đang hoạt động và sẵn sàng tiếp tục các bước tự động.",
            "Admin có thể dùng nút điều khiển phía trên để dừng hoặc tiếp tục toàn bộ luồng.",
            "Khi nối backend sâu hơn, trạng thái này sẽ điều khiển luôn các job tự động thực tế.",
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm leading-6 text-slate-600">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] bg-[#f7fbfa] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Mode</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{isPaused ? "Pause" : "Run"}</p>
          </div>
          <div className="rounded-[1.5rem] bg-[#fff8f2] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Updated</p>
            <p className="mt-2 text-sm font-black text-slate-900">
              {control?.updated_at ? new Date(control.updated_at).toLocaleString("vi-VN") : "--"}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AutomationWorkflow;