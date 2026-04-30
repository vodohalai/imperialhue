import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AutomationWorkflow from "@/components/admin/AutomationWorkflow";

const AdminAutomation = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="border-b border-[#ece6dd] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">Automation</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">AI Blog Automation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Giao diện đã được rút gọn để bạn tập trung vào trạng thái hệ thống, thao tác chính và hàng chờ nội dung.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0D9488]/10 px-4 py-2 text-sm font-bold text-[#0D9488]">
            <Sparkles className="h-4 w-4" />
            Simple control mode
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AutomationWorkflow />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/admin"
            className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-[#ece6dd]"
          >
            Về tổng quan
          </Link>
          <Link
            to="/admin/editor"
            className="rounded-full bg-[#0D9488] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-100"
          >
            Viết bài thủ công
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminAutomation;