import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

type AdminImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const AdminImageUpload = ({ value, onChange }: AdminImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSelectFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showError("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showError("Ảnh phải nhỏ hơn 5MB");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${crypto.randomUUID()}.${extension}`;

    setUploading(true);

    const { error } = await supabase.storage.from("blog-images").upload(fileName, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      setUploading(false);
      showError(error.message);
      return;
    }

    const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);

    if (data?.publicUrl) {
      onChange(data.publicUrl);
      showSuccess("Tải ảnh lên thành công");
    }

    setUploading(false);
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleSelectFile(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[#ece6dd] bg-slate-50">
        {value ? (
          <div className="relative h-full w-full">
            <img src={value} alt="Blog preview" className="h-full w-full object-cover" loading="lazy" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
              <ImagePlus className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Chưa có ảnh đại diện</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Tải ảnh từ thiết bị để bài blog hiển thị nhanh và ổn định hơn.</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0D9488] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-[#0b7a6f] disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Đang tải ảnh..." : "Tải ảnh từ thiết bị"}
      </button>

      <p className="text-xs leading-5 text-slate-500">Hỗ trợ ảnh tối đa 5MB. Sau khi tải lên, ảnh sẽ tự động gắn vào bài viết.</p>
    </div>
  );
};

export default AdminImageUpload;