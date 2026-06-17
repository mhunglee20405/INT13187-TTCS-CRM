import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { giftApi, memberApi } from "../../api";
import { Gift, GiftRedemption, Member, PaginationInfo } from "../../types";
import { formatDateTime } from "../../utils";
import { toast } from "../../components/ui/Toast";
import { useAuth } from "../../contexts/AuthContext";

type Tab = "gifts" | "redeem" | "history";

const emptyGiftForm = {
  giftId: "",
  giftName: "",
  requiredPoint: 50,
  quantity: 10,
  description: "",
};

export default function GiftsPage() {
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("gifts");
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [history, setHistory] = useState<GiftRedemption[]>([]);

  const [histPagination, setHistPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const [editGift, setEditGift] = useState<Gift | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [giftForm, setGiftForm] = useState(emptyGiftForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const fetchGifts = useCallback(async () => {
    setLoading(true);

    try {
      const res = await giftApi.getAll();
      setGifts(res.data.data);
    } catch {
      toast.error("Không thể tải danh sách quà");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      const res = await giftApi.getRedemptionHistory({
        page,
        limit: 20,
      });

      setHistory(res.data.data.history);
      setHistPagination(res.data.data.pagination);
    } catch {
      toast.error("Không thể tải lịch sử");
    }
  }, []);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  useEffect(() => {
    if (activeTab === "history" && isAdmin()) {
      fetchHistory();
    }
  }, [activeTab, fetchHistory, isAdmin]);

  const openCreate = () => {
    setEditGift(null);
    setGiftForm(emptyGiftForm);
    setShowGiftModal(true);
  };

  const openEdit = (g: Gift) => {
    setEditGift(g);

    setGiftForm({
      giftId: g.giftId,
      giftName: g.giftName,
      requiredPoint: g.requiredPoint,
      quantity: g.quantity,
      description: g.description || "",
    });

    setShowGiftModal(true);
  };

  const handleSaveGift = async () => {
    const { giftId, giftName, requiredPoint, quantity } = giftForm;

    if (!giftId || !giftId.trim()) {
      toast.error("Vui lòng nhập mã quà.");
      return;
    }

    if (!giftName || !giftName.trim()) {
      toast.error("Vui lòng nhập tên quà.");
      return;
    }

    if (!Number.isInteger(requiredPoint) || requiredPoint <= 0) {
      toast.error("Điểm cần đổi phải là số nguyên dương (> 0).");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      toast.error("Số lượng không được âm và phải là số nguyên.");
      return;
    }

    setSaving(true);

    try {
      if (editGift) {
        await giftApi.update(editGift.id, giftForm);
        toast.success("Cập nhật quà thành công");
      } else {
        await giftApi.create(giftForm);
        toast.success("Thêm quà thành công");
      }

      setShowGiftModal(false);
      fetchGifts();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGift = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      await giftApi.delete(deleteId);
      toast.success("Xóa quà thành công");
      fetchGifts();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleMemberSearch = async () => {
    if (!memberSearch.trim()) return;

    const res = await memberApi.getAll({
      keyword: memberSearch,
      limit: 5,
    });

    setMemberResults(res.data.data.members);
  };

  const handleRedeem = async () => {
    if (!selectedMember || !selectedGift) return;

    setRedeeming(true);

    try {
      await giftApi.redeem(selectedMember.id, selectedGift.id);

      toast.success(
        `Đổi quà "${selectedGift.giftName}" thành công cho ${selectedMember.name}`,
      );

      setShowRedeemModal(false);
      setSelectedMember(null);
      setSelectedGift(null);
      setMemberSearch("");
      setMemberResults([]);

      fetchGifts();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Đổi quà thất bại");
    } finally {
      setRedeeming(false);
    }
  };

  const tabs: { key: Tab; label: string; adminOnly: boolean }[] = [
    { key: "gifts", label: "🎁 Danh sách quà", adminOnly: false },
    { key: "redeem", label: "⭐ Đổi quà", adminOnly: false },
    { key: "history", label: "📋 Lịch sử đổi quà", adminOnly: true },
  ];

  return (
    <Layout
      title="Quà tặng"
      subtitle="Quản lý quà tặng và đổi quà"
      actions={
        isAdmin() ? (
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            ➕ Thêm quà
          </button>
        ) : undefined
      }
    >
      {/* Tabs ở giữa */}
      <div className="mx-auto flex gap-1 mb-6 bg-dark-800 border border-white/10 rounded-xl p-1 w-fit">
        {tabs
          .filter((t) => !t.adminOnly || isAdmin())
          .map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.key
                  ? "bg-primary-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {activeTab === "gifts" &&
        (loading ? (
          <PageLoader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {gifts.map((gift) => (
              <div key={gift.id} className="card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {gift.giftName}
                    </h3>

                    <p className="text-xs text-gray-500">{gift.giftId}</p>
                  </div>

                  <span
                    className={`badge ${
                      gift.isActive
                        ? "bg-emerald-900/50 text-emerald-400 border-emerald-700/50"
                        : "bg-gray-700 text-gray-400 border-gray-600"
                    }`}
                  >
                    {gift.isActive ? "Có sẵn" : "Ẩn"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Điểm đổi</span>

                    <span className="text-yellow-400 font-semibold">
                      ⭐ {gift.requiredPoint} pts
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Còn lại</span>

                    <span
                      className={`font-semibold ${
                        gift.quantity > 0 ? "text-white" : "text-red-400"
                      }`}
                    >
                      {gift.quantity} cái
                    </span>
                  </div>
                </div>

                {gift.description && (
                  <p className="text-xs text-gray-500 mt-3 border-t border-white/10 pt-3">
                    {gift.description}
                  </p>
                )}

                {isAdmin() && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEdit(gift)}
                      className="btn-secondary btn-sm flex-1"
                    >
                      ✏️ Sửa
                    </button>

                    <button
                      onClick={() => setDeleteId(gift.id)}
                      className="btn-danger btn-sm"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

      {activeTab === "redeem" && (
        <div className="w-full max-w-lg mx-auto">
          <div className="card">
            <h3 className="text-base font-semibold text-white mb-4">
              Đổi quà cho thành viên
            </h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                1. Tìm thành viên
              </label>

              <div className="flex gap-2">
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMemberSearch()}
                  className="input-field text-sm flex-1"
                  placeholder="Nhập tên, SĐT..."
                />

                <button
                  onClick={handleMemberSearch}
                  className="btn-secondary btn-sm"
                >
                  Tìm
                </button>
              </div>

              {memberResults.length > 0 && !selectedMember && (
                <div className="mt-2 space-y-1">
                  {memberResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMember(m);
                        setMemberResults([]);
                      }}
                      className="w-full text-left p-3 rounded-lg bg-dark-700 hover:bg-dark-600 border border-white/10 transition-colors"
                    >
                      <p className="text-sm font-medium text-white">
                        {m.name} — {m.phone}
                      </p>

                      <p className="text-xs text-yellow-400">
                        ⭐ {m.point} điểm
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {selectedMember && (
                <div className="mt-2 p-3 rounded-lg bg-primary-900/30 border border-primary-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {selectedMember.name}
                    </p>

                    <p className="text-xs text-yellow-400">
                      ⭐ {selectedMember.point} điểm
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    ✕ Đổi
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                2. Chọn quà
              </label>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gifts
                  .filter((g) => g.isActive && g.quantity > 0)
                  .map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() =>
                        setSelectedGift(
                          selectedGift?.id === gift.id ? null : gift,
                        )
                      }
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedGift?.id === gift.id
                          ? "bg-primary-900/30 border-primary-500/50"
                          : "bg-dark-700 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                          {gift.giftName}
                        </p>

                        <span className="text-yellow-400 text-xs font-semibold">
                          ⭐ {gift.requiredPoint} pts
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Còn: {gift.quantity} cái
                      </p>
                    </button>
                  ))}
              </div>
            </div>

            <button
              onClick={() => setShowRedeemModal(true)}
              className="btn-primary w-full"
              disabled={!selectedMember || !selectedGift}
            >
              Đổi quà
            </button>
          </div>
        </div>
      )}

      {activeTab === "history" && isAdmin() && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-dark-700/50">
              <tr>
                {[
                  "Thành viên",
                  "Quà tặng",
                  "Điểm dùng",
                  "Người thực hiện",
                  "Thời gian",
                ].map((h) => (
                  <th key={h} className="table-header px-4 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {history.map((h) => (
                <tr key={h.redemptionId} className="hover:bg-white/5">
                  <td className="table-cell">
                    {h.member?.name || "—"}

                    <p className="text-xs text-gray-500">
                      {h.member?.memberId}
                    </p>
                  </td>

                  <td className="table-cell">{h.gift?.giftName || "—"}</td>

                  <td className="table-cell">
                    <span className="text-yellow-400">⭐ {h.pointUsed}</span>
                  </td>

                  <td className="table-cell">{h.redeemedBy?.username}</td>

                  <td className="table-cell text-gray-400">
                    {formatDateTime(h.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {histPagination.totalPages > 1 && (
            <div className="flex gap-2 p-4 justify-end border-t border-white/10">
              <button
                onClick={() => fetchHistory(histPagination.page - 1)}
                disabled={histPagination.page <= 1}
                className="btn-secondary btn-sm"
              >
                ← Trước
              </button>

              <span className="text-sm text-gray-400 py-1.5 px-2">
                Trang {histPagination.page}/{histPagination.totalPages}
              </span>

              <button
                onClick={() => fetchHistory(histPagination.page + 1)}
                disabled={histPagination.page >= histPagination.totalPages}
                className="btn-secondary btn-sm"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        title={editGift ? "Sửa quà tặng" : "Thêm quà tặng"}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Mã quà *
              </label>

              <input
                value={giftForm.giftId}
                onChange={(e) =>
                  setGiftForm((p) => ({
                    ...p,
                    giftId: e.target.value,
                  }))
                }
                className="input-field text-sm"
                disabled={!!editGift}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Tên quà *
              </label>

              <input
                value={giftForm.giftName}
                onChange={(e) =>
                  setGiftForm((p) => ({
                    ...p,
                    giftName: e.target.value,
                  }))
                }
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Điểm cần *
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={
                  giftForm.requiredPoint === 0 ? "" : giftForm.requiredPoint
                }
                onChange={(e) =>
                  setGiftForm((p) => ({
                    ...p,
                    requiredPoint: parseInt(e.target.value) || 0,
                  }))
                }
                onKeyDown={(e) => {
                  if ([".", ",", "-", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Số lượng *
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={
                  giftForm.quantity === 0 && !editGift ? "" : giftForm.quantity
                }
                onChange={(e) =>
                  setGiftForm((p) => ({
                    ...p,
                    quantity: parseInt(e.target.value) || 0,
                  }))
                }
                onKeyDown={(e) => {
                  if ([".", ",", "-", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Mô tả</label>

            <input
              value={giftForm.description}
              onChange={(e) =>
                setGiftForm((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
              className="input-field text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowGiftModal(false)}
              className="btn-secondary flex-1"
              disabled={saving}
            >
              Hủy
            </button>

            <button
              onClick={handleSaveGift}
              className="btn-primary flex-1"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : editGift ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onConfirm={handleRedeem}
        title="Xác nhận đổi quà"
        confirmText="Đổi quà"
        confirmVariant="primary"
        loading={redeeming}
        message={
          selectedMember && selectedGift
            ? `Đổi "${selectedGift.giftName}" (${selectedGift.requiredPoint} điểm) cho ${selectedMember.name} (hiện có ${selectedMember.point} điểm)?`
            : ""
        }
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteGift}
        title="Xóa quà tặng"
        message="Bạn có chắc muốn xóa quà tặng này?"
        loading={deleting}
      />
    </Layout>
  );
}
