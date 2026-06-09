import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { membershipApi } from "../../api";
import { Membership } from "../../types";
import { formatCurrency } from "../../utils";
import { toast } from "../../components/ui/Toast";

const emptyForm = { membershipId: "", membershipName: "", durationMonths: 3, originalPrice: 0, urPrice: 0, rewardPoint: 0, description: "" };

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Membership | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    try { const res = await membershipApi.getAll(); setMemberships(res.data.data); }
    catch { toast.error("Không thể tải danh sách gói tập"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMemberships(); }, [fetchMemberships]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (m: Membership) => {
    setEditItem(m);
    setForm({ membershipId: m.membershipId, membershipName: m.membershipName, durationMonths: m.durationMonths, originalPrice: m.originalPrice, urPrice: m.urPrice, rewardPoint: m.rewardPoint, description: m.description || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await membershipApi.update(editItem.id, form);
        toast.success("Cập nhật gói tập thành công");
      } else {
        await membershipApi.create(form);
        toast.success("Thêm gói tập thành công");
      }
      setShowModal(false);
      fetchMemberships();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await membershipApi.delete(deleteId); toast.success("Xóa gói tập thành công"); fetchMemberships(); }
    catch { toast.error("Xóa thất bại"); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const colorMap: Record<string, string> = { classic: "text-blue-400", plus: "text-purple-400", royal: "text-amber-400", signature: "text-rose-400" };

  return (
    <Layout title="Gói tập" subtitle="Quản lý các gói tập" actions={
      <button onClick={openCreate} className="btn-primary flex items-center gap-2" id="add-membership-btn">➕ Thêm gói</button>
    }>
      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {memberships.map((ms) => {
            const color = colorMap[ms.membershipName.toLowerCase()] || "text-primary-400";
            return (
              <div key={ms.id} className="card-hover flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`text-xl font-bold ${color}`}>{ms.membershipName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{ms.membershipId}</p>
                  </div>
                  <span className={`badge ${ms.isActive ? "bg-emerald-900/50 text-emerald-400 border-emerald-700/50" : "bg-gray-700 text-gray-400 border-gray-600"}`}>
                    {ms.isActive ? "Hoạt động" : "Ẩn"}
                  </span>
                </div>
                <div className="flex-1 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Thời hạn</span>
                    <span className="text-white font-medium">{ms.durationMonths} tháng</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Giá</span>
                    <span className="text-white font-medium">{formatCurrency(ms.urPrice)}</span>
                  </div>
                  {ms.originalPrice !== ms.urPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Giá gốc</span>
                      <span className="text-gray-500 line-through">{formatCurrency(ms.originalPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Điểm thưởng</span>
                    <span className="text-yellow-400 font-medium">+{ms.rewardPoint} pts</span>
                  </div>
                </div>
                {ms.description && <p className="text-xs text-gray-500 mt-3 border-t border-white/10 pt-3">{ms.description}</p>}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(ms)} className="btn-secondary btn-sm flex-1">✏️ Sửa</button>
                  <button onClick={() => setDeleteId(ms.id)} className="btn-danger btn-sm">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? "Sửa gói tập" : "Thêm gói tập"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mã gói *</label>
              <input value={form.membershipId} onChange={(e) => setForm((p) => ({ ...p, membershipId: e.target.value }))} className="input-field text-sm" placeholder="CLASSIC" disabled={!!editItem} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tên gói *</label>
              <input value={form.membershipName} onChange={(e) => setForm((p) => ({ ...p, membershipName: e.target.value }))} className="input-field text-sm" placeholder="Classic" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Thời hạn (tháng) *</label>
              <input type="number" value={form.durationMonths} onChange={(e) => setForm((p) => ({ ...p, durationMonths: +e.target.value }))} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Điểm thưởng *</label>
              <input type="number" value={form.rewardPoint} onChange={(e) => setForm((p) => ({ ...p, rewardPoint: +e.target.value }))} className="input-field text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Giá gốc (VNĐ) *</label>
              <input type="number" value={form.originalPrice} onChange={(e) => setForm((p) => ({ ...p, originalPrice: +e.target.value }))} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Giá áp dụng (VNĐ) *</label>
              <input type="number" value={form.urPrice} onChange={(e) => setForm((p) => ({ ...p, urPrice: +e.target.value }))} className="input-field text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Mô tả</label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field text-sm" placeholder="Mô tả gói tập..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1" disabled={saving}>Hủy</button>
            <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>{saving ? "Đang lưu..." : editItem ? "Cập nhật" : "Thêm gói"}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Xóa gói tập" message="Bạn có chắc muốn xóa gói tập này?" loading={deleting} />
    </Layout>
  );
}
