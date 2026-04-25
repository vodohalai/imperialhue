import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Mail } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showSuccess("Đăng nhập thành công");
      navigate("/admin");
    } catch (err: any) {
      showError(err.message || "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="w-full max-w-md rounded-[2.5rem] border border-[#ece6dd] bg-white p-10 shadow-xl shadow-slate-200/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Quản trị Imperial Hue</h1>
          <p className="mt-2 text-sm text-slate-500">Đăng nhập để quản lý nội dung website</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              className="w-full rounded-2xl border border-[#ece6dd] bg-[#fbfaf7] py-4 pl-12 pr-4 text-sm outline-none transition focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
              placeholder="Email quản trị"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              className="w-full rounded-2xl border border-[#ece6dd] bg-[#fbfaf7] py-4 pl-12 pr-4 text-sm outline-none transition focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#0D9488] py-4 text-base font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-[#0b7a6f] disabled:opacity-50"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;