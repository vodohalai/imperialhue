import { motion, type Variants } from "framer-motion";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
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
};

const steps: WorkflowStep[] = [
  {
    id: "research",
    title: "SEO Research",
    desc: "AI tìm chủ đề liên quan du lịch, ẩm thực và trải nghiệm ở Huế.",
    meta: "12 topics",
    status: "running",
    icon: Search,
  },
  {
    id: "queue",
    title: "Topic Queue",
    desc: "Chủ đề được gom lại, chấm điểm và xếp hàng chờ tạo bài viết.",
    meta: "8 ready",
    status: "ready",
    icon: PlayCircle,
  },
  {
    id: "writer",
    title: "AI Writer",
    desc: "AI tạo tiêu đề, mô tả ngắn, nội dung blog và slug chuẩn SEO.",
    meta: "3 drafts",
    status: "running",
    icon: FileText,
  },
  {
    id: "image",
    title: "AI Image",
    desc: "Ảnh bìa được tạo theo đúng chủ đề bài và đồng bộ với blog.",
    meta: "3 covers",
    status: "ready",
    icon: ImageIcon,
  },
  {
    id: "review",
    title: "Review Queue",
    desc: "Admin xem nhanh, duyệt nội dung và kiểm tra độ phù hợp thương hiệu.",
    meta: "2 waiting",
    status: "waiting",
    icon: CheckCircle2,
  },
  {
    id: "schedule",
    title: "Schedule 06:00",
    desc: "Bài đã duyệt sẽ được đưa vào lịch đăng tự động lúc 06:00 sáng.",
    meta: "1 scheduled",
    status: "ready",
    icon: CalendarClock,
  },
  {
    id: "publish",
    title: "Publish Blog",
    desc: "Bài được xuất bản lên website và sẵn sàng mang traffic SEO về cho blog.",
    meta: "Auto publish",
    status: "done",
    icon: Send,
  },
];

const statusStyles: Record<
  WorkflowStatus,
  {
    badge: string;
    dot: string;
    label: string;
    glow: string;
  }
> = {
  ready: {
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
    label: "Ready",
    glow: "shadow-[0_0_0_6px_rgba(13,148,136,0.08)]",
  },
  running: {
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    label: "Running",
    glow: "shadow-[0_0_0_6px_rgba(249,115,22,0.08)]",
  },
  waiting: {
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    label: "Waiting",
    glow: "shadow-[0_0_0_6px_rgba(14,165,233,0.08)]",
  },
  done: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Done",
    glow: "shadow-[0_0_0_6px_rgba(16,185,129,0.08)]",
  },
};

const connectorVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0.3 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: "easeInOut" as const },
  },
};

const AutomationWorkflow = () => {
  return (
    <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-4 shadow-sm sm:p-6 lg:rounded-[2.5rem]">
      <div className="flex flex-col gap-3 border-b border-[#f1ebe3] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f97316]">Workflow</p>
            <h2 className="text-lg font-black text-slate-900 sm:text-xl">AI Automation Pipeline</h2>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#f7fbfa] px-3 py-2 text-xs font-bold text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-[#f97316]" />
          Visual flow mode
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.slice(0, 4).map((step, index) => {
          const Icon = step.icon;
          const state = statusStyles[step.status];

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`relative overflow-hidden rounded-[1.75rem] border border-[#ece6dd] bg-[#fcfbf8] p-5 ${state.glow}`}
            >
              <div className="absolute right-4 top-4">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${state.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${state.dot} ${step.status === "running" ? "animate-pulse" : ""}`} />
                  {state.label}
                </span>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0D9488] shadow-sm">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-5 pr-16 text-base font-black text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>

              <div className="mt-4 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                {step.meta}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="relative my-5 hidden h-14 items-center justify-center xl:flex">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 56" fill="none" preserveAspectRatio="none">
          <motion.path
            d="M40 28 H960"
            stroke="#d7e6e3"
            strokeWidth="3"
            strokeLinecap="round"
            variants={connectorVariants}
            initial="hidden"
            animate="visible"
          />
        </svg>

        <motion.div
          animate={{ x: [0, 920, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute left-5 h-3 w-3 rounded-full bg-[#f97316] shadow-[0_0_16px_rgba(249,115,22,0.55)]"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.slice(4).map((step, index) => {
          const Icon = step.icon;
          const state = statusStyles[step.status];

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (index + 4) * 0.08 }}
              className={`relative overflow-hidden rounded-[1.75rem] border border-[#ece6dd] bg-white p-5 ${state.glow}`}
            >
              <div className="absolute right-4 top-4">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${state.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${state.dot} ${step.status === "running" ? "animate-pulse" : ""}`} />
                  {state.label}
                </span>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7fbfa] text-[#0D9488]">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-5 pr-16 text-base font-black text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>

              <div className="mt-4 inline-flex items-center rounded-full bg-[#fbfaf7] px-3 py-1.5 text-xs font-bold text-slate-700">
                {step.meta}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3 rounded-[1.75rem] bg-[#f7fbfa] p-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Topics ready</p>
          <p className="mt-2 text-2xl font-black text-slate-900">12</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">AI drafts</p>
          <p className="mt-2 text-2xl font-black text-slate-900">3</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Scheduled 06:00</p>
          <p className="mt-2 text-2xl font-black text-slate-900">1</p>
        </div>
      </div>
    </div>
  );
};

export default AutomationWorkflow;