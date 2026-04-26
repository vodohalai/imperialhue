import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  PlayCircle,
  Search,
  Send,
  Sparkles,
} from "lucide-react";

type WorkflowStatus = "ready" | "running" | "waiting" | "done";

type WorkflowStep = {
  id: string;
  title: string;
  desc: string;
  meta: string;
  status: WorkflowStatus;
  icon: typeof Search;
  accent: string;
  position: string;
};

const steps: WorkflowStep[] = [
  {
    id: "research",
    title: "SEO Research",
    desc: "Tìm chủ đề SEO mới về du lịch, ẩm thực, địa điểm và trải nghiệm tại Huế.",
    meta: "12 topics found",
    status: "running",
    icon: Search,
    accent: "from-[#ffedd5] to-[#fff7ed] text-[#f97316]",
    position: "left-[4%] top-[16%]",
  },
  {
    id: "queue",
    title: "Topic Queue",
    desc: "Xếp hạng, gom nhóm và giữ các chủ đề tốt nhất trước khi tạo bài viết.",
    meta: "8 topics ready",
    status: "ready",
    icon: PlayCircle,
    accent: "from-[#ecfeff] to-[#f0fdfa] text-[#0D9488]",
    position: "left-[28%] top-[10%]",
  },
  {
    id: "writer",
    title: "AI Writer",
    desc: "Viết tiêu đề, excerpt, nội dung HTML và slug chuẩn SEO cho blog.",
    meta: "3 drafts created",
    status: "running",
    icon: FileText,
    accent: "from-[#eff6ff] to-[#f8fbff] text-[#2563eb]",
    position: "left-[52%] top-[18%]",
  },
  {
    id: "image",
    title: "AI Image",
    desc: "Sinh ảnh bìa theo chủ đề và đồng bộ với từng bài viết AI.",
    meta: "3 covers ready",
    status: "ready",
    icon: ImageIcon,
    accent: "from-[#f5f3ff] to-[#faf5ff] text-[#7c3aed]",
    position: "left-[74%] top-[12%]",
  },
  {
    id: "review",
    title: "Review",
    desc: "Admin xem nhanh nội dung, kiểm tra tính phù hợp và quyết định duyệt.",
    meta: "2 waiting approval",
    status: "waiting",
    icon: CheckCircle2,
    accent: "from-[#fef3c7] to-[#fffbeb] text-[#d97706]",
    position: "left-[19%] top-[58%]",
  },
  {
    id: "schedule",
    title: "Schedule 06:00",
    desc: "Đưa bài đã duyệt vào hàng chờ đăng tự động lúc 06:00 sáng.",
    meta: "1 scheduled",
    status: "ready",
    icon: CalendarClock,
    accent: "from-[#ecfccb] to-[#f7fee7] text-[#65a30d]",
    position: "left-[48%] top-[64%]",
  },
  {
    id: "publish",
    title: "Publish Blog",
    desc: "Xuất bản bài viết lên website và kích hoạt vòng đời SEO tự nhiên.",
    meta: "Auto publish active",
    status: "done",
    icon: Send,
    accent: "from-[#dcfce7] to-[#f0fdf4] text-[#16a34a]",
    position: "left-[76%] top-[58%]",
  },
];

const statusMap: Record<
  WorkflowStatus,
  {
    label: string;
    badge: string;
    ring: string;
    dot: string;
  }
> = {
  ready: {
    label: "Ready",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    ring: "shadow-[0_0_0_8px_rgba(13,148,136,0.08)]",
    dot: "bg-teal-500",
  },
  running: {
    label: "Running",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    ring: "shadow-[0_0_0_8px_rgba(249,115,22,0.10)]",
    dot: "bg-orange-500",
  },
  waiting: {
    label: "Waiting",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    ring: "shadow-[0_0_0_8px_rgba(14,165,233,0.10)]",
    dot: "bg-sky-500",
  },
  done: {
    label: "Done",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "shadow-[0_0_0_8px_rgba(22,163,74,0.10)]",
    dot: "bg-emerald-500",
  },
};

const connectors = [
  { id: "c1", d: "M 125 140 C 170 120, 240 116, 300 120" },
  { id: "c2", d: "M 370 120 C 430 122, 505 140, 555 150" },
  { id: "c3", d: "M 635 145 C 700 122, 760 114, 820 122" },
  { id: "c4", d: "M 875 175 C 872 260, 820 315, 720 380" },
  { id: "c5", d: "M 240 392 C 300 405, 395 410, 500 404" },
  { id: "c6", d: "M 590 405 C 640 405, 700 404, 760 402" },
];

const AutomationWorkflow = () => {
  const [selectedId, setSelectedId] = useState("writer");

  const selectedStep = useMemo(
    () => steps.find((step) => step.id === selectedId) || steps[0],
    [selectedId],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="overflow-hidden rounded-[2.25rem] border border-[#ece6dd] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#f1ebe3] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">Workflow Canvas</p>
              <h2 className="text-lg font-black text-slate-900">Automation Flow</h2>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-[#f7fbfa] px-3 py-2 text-xs font-bold text-slate-600 sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-[#f97316]" />
            Make-style view
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="relative min-h-[620px] rounded-[2rem] border border-[#efe8dd] bg-[#fcfaf6]">
            <div className="absolute inset-0 opacity-40">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#e9dfd0_1px,transparent_0)] bg-[size:24px_24px]" />
            </div>

            <svg
              className="absolute inset-0 hidden h-full w-full lg:block"
              viewBox="0 0 980 620"
              fill="none"
              preserveAspectRatio="none"
            >
              {connectors.map((connector) => (
                <motion.path
                  key={connector.id}
                  d={connector.d}
                  stroke="#d8cfc1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0.15, opacity: 0.35 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              ))}
            </svg>

            <div className="absolute inset-0 hidden lg:block">
              <motion.div
                animate={{
                  x: [110, 305, 570, 830, 735, 515, 770],
                  y: [140, 120, 150, 122, 402, 404, 402],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-3.5 w-3.5 rounded-full bg-[#f97316] shadow-[0_0_18px_rgba(249,115,22,0.55)]"
              />
            </div>

            <div className="relative grid gap-4 p-4 sm:p-6 lg:hidden">
              {steps.map((step) => {
                const Icon = step.icon;
                const state = statusMap[step.status];
                const isSelected = selectedId === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setSelectedId(step.id)}
                    className={`flex items-center gap-4 rounded-[1.75rem] border p-4 text-left transition ${
                      isSelected
                        ? "border-[#0D9488] bg-white shadow-lg shadow-teal-100/40"
                        : "border-[#ece6dd] bg-white hover:border-[#d9d1c5]"
                    }`}
                  >
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${step.accent}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900">{step.title}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${state.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} />
                          {state.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{step.meta}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative hidden h-[620px] lg:block">
              {steps.map((step) => {
                const Icon = step.icon;
                const state = statusMap[step.status];
                const isSelected = selectedId === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setSelectedId(step.id)}
                    className={`absolute ${step.position} group`}
                  >
                    <motion.div
                      whileHover={{ y: -3, scale: 1.02 }}
                      animate={isSelected ? { scale: 1.04 } : { scale: 1 }}
                      className={`relative flex h-[118px] w-[118px] items-center justify-center rounded-[2rem] border bg-white transition ${
                        isSelected
                          ? `border-[#0D9488] ${state.ring}`
                          : "border-[#e7ddd0] shadow-sm"
                      }`}
                    >
                      <div className={`absolute inset-3 rounded-[1.5rem] bg-gradient-to-br ${step.accent} opacity-90`} />
                      <div className="relative z-10 flex flex-col items-center">
                        <Icon className="h-7 w-7" />
                        <span className="mt-2 max-w-[84px] text-center text-[11px] font-black leading-4 text-slate-900">
                          {step.title}
                        </span>
                      </div>

                      <div className="absolute -right-2 top-1/2 z-20 -translate-y-1/2">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border border-white ${state.dot}`}>
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        </div>
                      </div>

                      <div className="absolute -bottom-12 left-1/2 min-w-max -translate-x-1/2 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                        {step.meta}
                      </div>
                    </motion.div>
                  </button>
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
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusMap[selectedStep.status].badge}`}>
            <span className={`h-2 w-2 rounded-full ${statusMap[selectedStep.status].dot} ${selectedStep.status === "running" ? "animate-pulse" : ""}`} />
            {statusMap[selectedStep.status].label}
          </div>
        </div>

        <div className={`mt-5 rounded-[1.75rem] bg-gradient-to-br p-5 ${selectedStep.accent}`}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-current shadow-sm">
            <selectedStep.icon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm font-bold">{selectedStep.meta}</p>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600">{selectedStep.desc}</p>

        <div className="mt-6 space-y-3">
          {[
            "Module này là một phần của pipeline AI blog bán tự động.",
            "Khi nối backend thật, khu này sẽ hiển thị dữ liệu theo thời gian thực.",
            "Bạn sẽ có thể bấm hành động trực tiếp như chạy research, tạo draft, duyệt hoặc lên lịch.",
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm leading-6 text-slate-600">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-full bg-[#0D9488] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-100"
          >
            Mở module này
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-full border border-[#e5ddd2] bg-white px-5 py-3 text-sm font-bold text-slate-700"
          >
            Xem hàng chờ liên quan
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] bg-[#f7fbfa] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Queue</p>
            <p className="mt-2 text-2xl font-black text-slate-900">08</p>
          </div>
          <div className="rounded-[1.5rem] bg-[#fff8f2] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Success</p>
            <p className="mt-2 text-2xl font-black text-slate-900">93%</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AutomationWorkflow;