import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { tierApi } from "../../api";
import { Tier } from "../../types";
import { formatCurrency, getTierColor, getTierIcon } from "../../utils";
import { toast } from "../../components/ui/Toast";

const emptyForm = { tierId: "", tierName: "", minExpense: 0, maxExpense: "" as string | number, obtainPoint: 0, description: "" };

export default function TiersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Tier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try { const res = await tierApi.getAll(); setTiers(res.data.data); }
    catch { toast.error("Không thể tải hạng thẻ"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t: Tier) => {
    setEditItem(t);
    setForm({ tierId: t.tierId, tierName: t.tierName, minExpense: t.minExpense, maxExpense: t.maxExpense ?? "", obtainPoint: t.obtainPoint, description: t.description || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, maxExpense: form.maxExpense === "" ? null : Number(form.maxExpense) };
      if (editItem) { await tierApi.update(editItem.id, payload); toast.success("Cập nhật hạng thẻ thành công"); }
      else { await tierApi.create(payload); toast.success("Thêm hạng thẻ thành công"); }
      setShowModal(false);
      fetchTiers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Có lỗi xảy ra");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await tierApi.delete(deleteId); toast.success("Xóa hạng thẻ thành công"); fetchTiers(); }
    catch { toast.error("Xóa thất bại"); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  return (
    <Layout title="Hạng thẻ" subtitle="Quản lý hạng thẻ thành viên" actions={
      <button onClick={openCreate} className="btn-primary flex items-center gap-2">➕ Thêm hạng</button>
    }>
      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div key={tier.id} className="card-hover">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{getTierIcon(tier.tierName)}</span>
                <div>
                  <span className={`badge ${getTierColor(tier.tierName)} text-sm`}>{tier.tierName}</span>
                  <p className="text-xs text-gray-500 mt-1">{tier.tierId}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Chi tiêu tối thiểu</span>
                  <span className="text-white">{formatCurrency(tier.minExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chi tiêu tối đa</span>
                  <span className="text-white">{tier.maxExpense ? formatCurrency(tier.maxExpense) : "Không giới hạn"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Điểm đổi quà nhận được</span>
                  <span className="text-primary-400">{tier.obtainPoint} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Số thành viên</span>
                  <span className="text-white font-semibold">{tier.memberCount ?? 0}</span>
                </div>
              </div>
              {tier.description && <p className="text-xs text-gray-500 mt-3 border-t border-white/10 pt-3">{tier.description}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(tier)} className="btn-secondary btn-sm flex-1">✏️ Sửa</button>
                <button onClick={() => setDeleteId(tier.id)} className="btn-danger btn-sm">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? "Sửa hạng thẻ" : "Thêm hạng thẻ"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mã hạng *</label>
              <input value={form.tierId} onChange={(e) => setForm((p) => ({ ...p, tierId: e.target.value }))} className="input-field text-sm" placeholder="TIER_BRONZE" disabled={!!editItem} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tên hạng *</label>
              <input value={form.tierName} onChange={(e) => setForm((p) => ({ ...p, tierName: e.target.value }))} className="input-field text-sm" placeholder="Bronze" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Chi tiêu tối thiểu *</label>
              <input type="number" value={form.minExpense} onChange={(e) => setForm((p) => ({ ...p, minExpense: +e.target.value }))} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Chi tiêu tối đa (trống = không giới hạn)</label>
              <input type="number" value={form.maxExpense} onChange={(e) => setForm((p) => ({ ...p, maxExpense: e.target.value }))} className="input-field text-sm" placeholder="Không giới hạn" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Điểm đổi quà nhận được</label>
            <input type="number" value={form.obtainPoint} onChange={(e) => setForm((p) => ({ ...p, obtainPoint: +e.target.value }))} className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Mô tả</label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1" disabled={saving}>Hủy</button>
            <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>{saving ? "Đang lưu..." : editItem ? "Cập nhật" : "Thêm hạng"}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Xóa hạng thẻ" message="Bạn có chắc muốn xóa hạng thẻ này?" loading={deleting} />
    </Layout>
  );
}
