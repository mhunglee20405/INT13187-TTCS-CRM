import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { memberApi } from "../../api";
import { toast } from "../../components/ui/Toast";

export default function MemberFormPage({ editData }: { editData?: Record<string, unknown> }) {
  const navigate = useNavigate();
  const isEdit = !!editData;
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    name: (editData?.name as string) || "",
    phone: (editData?.phone as string) || "",
    birthday: editData?.birthday ? String(editData.birthday).split("T")[0] : "",
    mail: (editData?.mail as string) || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && editData?.id) {
        await memberApi.update(editData.id as string, form);
        toast.success("Cập nhật thành viên thành công");
      } else {
        await memberApi.create(form);
        toast.success("Thêm thành viên thành công");
      }
      navigate("/members");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: {
          field: string;
          message: string;
        }[]; } } };
      toast.error(
        e.response?.data?.errors?.[0]?.message ||
        e.response?.data?.message ||
        "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title={isEdit ? "Sửa thành viên" : "Thêm thành viên"}
      subtitle={isEdit ? "Cập nhật thông tin thành viên" : "Thêm thành viên mới vào hệ thống"}
    >
      <div className="max-w-lg">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Họ tên <span className="text-red-400">*</span>
              </label>
              <input name="name" type="text" value={form.name} onChange={handleChange} className="input-field" placeholder="Nguyễn Văn A" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="input-field" placeholder="0901234567" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input name="mail" type="email" value={form.mail} onChange={handleChange} className="input-field" placeholder="example@gmail.com " required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Ngày sinh</label>
              <input name="birthday" type="date" value={form.birthday} onChange={handleChange} className="input-field" required max={today}/>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate("/members")} className="btn-secondary flex-1">
                Hủy
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm thành viên"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
