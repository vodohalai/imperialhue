import { useEffect, useState, useCallback } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  PauseCircle,
  PlayCircle,
  Sparkles,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import type { WorkflowControl, WorkflowLog } from "@/integrations/supabase/types";

const WORKFLOW_KEY = "blog_automation";
const AUTO_PILOT_STORAGE_KEY = "imperial-auto-pilot-enabled";

type WorkflowWindow = Window & {
  __workflowInterval?: ReturnType<typeof setInterval>;
};

const AutomationWorkflow = () => {
  const [control, setControl] = useState<WorkflowControl | null>(null);
  const [loadingControl, setLoadingControl] = useState(true);
  const [savingMode, setSavingMode] = useState(false);
  const [savingScheduleTime, setSavingScheduleTime] = useState(false);
  const [autoMode, setAutoMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(AUTO_PILOT_STORAGE_KEY) === "true";
  });
  const [scheduleTime, setScheduleTime] = useState("06:00");
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [runningScheduler, setRunningScheduler] = useState(false);
  const [logsCollapsed, setLogsCollapsed] = useState(false);
  const [columnCheckDone, setColumnCheckDone] = useState(false);

  // ── Đồng bộ auto_publish lên DB khi toggle ─────────────────
  const syncAutoPublishToDb = useCallback(async (enabled: boolean) => {
    if (!control) return;
    try {
      const { error } = await supabase
        .from("workflow_controls")
        .update({ auto_publish: enabled, updated_at: new Date().toISOString() })
        .eq("id", control.id);
      if (error) {
        showError("Không thể cập nhật auto-publish: " + error.message);
      }
    } catch (err: any) {
      showError(err.message);
    }
  }, [control]);

  const handleToggleAutoMode = (newValue: boolean) => {
    setAutoMode(newValue);
    localStorage.setItem(AUTO_PILOT_STORAGE_KEY, String(newValue));
    syncAutoPublishToDb(newValue);
  };

  useEffect(() => {
    if (control) {
      const dbAutoPublish = control.auto_publish === true;
      if (dbAutoPublish !== autoMode) {
        setAutoMode(dbAutoPublish);
        localStorage.setItem(AUTO_PILOT_STORAGE_KEY, String(dbAutoPublish));
      }
    }
  }, [control]);

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
      if (!columnCheckDone && typeof (data as any)?.auto_publish === 'undefined') {
        try {
          await supabase.functions.invoke('add-auto-publish-column');
          workflowData.auto_publish = false;
          const { data: refreshed } = await supabase
            .from("workflow_controls")
            .select("*")
            .eq("workflow_key", WORKFLOW_KEY)
            .maybeSingle();
          if (refreshed) {
            setControl(refreshed as WorkflowControl);
            setScheduleTime((refreshed as WorkflowControl).default_schedule_time || "06:00");
            setColumnCheckDone(true);
            setLoadingControl(false);
            return;
          }
        } catch (_) {}
        setColumnCheckDone(true);
      }
      setControl(workflowData);
      setScheduleTime(workflowData.default_schedule_time || "06:00");
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("workflow_controls")
        .insert([{ workflow_key: WORKFLOW_KEY, mode: "running", default_schedule_time: "06:00", auto_publish: false }])
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

  const fetchLogs = async () => {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("workflow_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

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
    fetchLogs().catch(() => undefined);
  }, []);

  // Auto-pilot interval
  useEffect(() => {
    const workflowWindow = window as WorkflowWindow;

    if (workflowWindow.__workflowInterval) {
      clearInterval(workflowWindow.__workflowInterval);
      workflowWindow.__workflowInterval = undefined;
    }

    if (autoMode) {
      const intervalId = setInterval(() => {
        fetchLogs().catch(() => undefined);
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

  const workflowMode = control?.mode || "running";
  const isPaused = workflowMode === "paused";

  const handleToggleWorkflow = async () => {
    if (!control || savingMode) return;

    const nextMode = isPaused ? "running" : "paused";
    setSavingMode(true);

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
      setSavingMode(false);
      return;
    }

    setControl(data as WorkflowControl);
    showSuccess(nextMode === "paused" ? "Đã tạm dừng automation" : "Đã bật lại automation");
    setSavingMode(false);
  };

  const statusLabel = loadingControl ? "Đang tải..." : isPaused ? "Đang tạm dừng" : "Đang hoạt động";

  return (
    <div className="space-y-6">
      {/* ─── HEADER CARD ─── */}
      <section className="rounded-[2.25rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f97316]">Automation</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Bảng điều khiển</h2>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${
              isPaused ? "bg-orange-50 text-orange-700" : "bg-teal-50 text-teal-700"
            }`}>
              <span className={`h-2.5 w-2.5 rounded-full ${isPaused ? "bg-orange-500" : "bg-teal-500"}`} />
              {statusLabel}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-pilot toggle */}
            <button
              type="button"
              onClick={() => handleToggleAutoMode(!autoMode)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
                autoMode
                  ? "bg-[#0D9488] text-white shadow-lg shadow-teal-100"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {autoMode ? "Auto-pilot bật" : "Auto-pilot tắt"}
            </button>

            {/* Tạm dừng / Tiếp tục */}
            <button
              type="button"
              onClick={handleToggleWorkflow}
              disabled={loadingControl || savingMode || !control}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition disabled:opacity-60 ${
                isPaused ? "bg-[#0D9488] hover:bg-[#0b7a6f]" : "bg-[#f97316] hover:bg-[#ea6a0f]"
              }`}
            >
              {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              {savingMode ? "Đang cập nhật..." : isPaused ? "Tiếp tục" : "Tạm dừng"}
            </button>

            {/* Chạy scheduler ngay */}
            <button
              type="button"
              onClick={handleRunScheduler}
              disabled={runningScheduler || isPaused}
              className="inline-flex items-center gap-2 rounded-full bg-[#6366f1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4f46e5] disabled:opacity-60"
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
      </section>

      {/* ─── GIỜ ĐĂNG ─── */}
      <section className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7fbfa] text-[#0D9488]">
            <CalendarClock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">Giờ đăng mặc định</p>
            <p className="mt-1 text-xs text-slate-500">Bài được duyệt sẽ tự động xuất bản vào giờ này mỗi ngày</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              onBlur={() => saveScheduleTime(scheduleTime)}
              className="rounded-xl border border-[#ece6dd] bg-[#fbfaf7] px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0D9488]"
            />
            {savingScheduleTime && (
              <span className="text-xs text-slate-400">Đang lưu...</span>
            )}
          </div>
        </div>
      </section>

      {/* ─── LỊCH SỬ HOẠT ĐỘNG ─── */}
      <section className="rounded-[2.25rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => setLogsCollapsed(!logsCollapsed)}
          className="flex w-full items-center gap-4 text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5f3ff] text-[#6366f1]">
            <History className="h-6 w-6" />
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
              <div className="rounded-2xl bg-[#fbfaf7] px-5 py-10 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-400">Chưa có lịch sử hoạt động</p>
                <p className="mt-1 text-xs text-slate-400">Nhấn "Chạy scheduler ngay" để bắt đầu</p>
              </div>
            ) : (
              <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
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