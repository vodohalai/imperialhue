import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AutomationWorkflow from "@/components/admin/AutomationWorkflow";

const AdminAutomation = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="border-b border-[#ece6dd] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-[#ece6dd] transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Về tổng quan
          </Link>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">Automation</p>
            <h1 className="text-xl font-black text-slate-900">AI Blog Automation</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0D9488]/10 px-4 py-2 text-sm font-bold text-[#0D9488]">
            <Sparkles className="h-4 w-4" />
            Simple control
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AutomationWorkflow />
      </main>
    </div>
  );
};

export default AdminAutomation;