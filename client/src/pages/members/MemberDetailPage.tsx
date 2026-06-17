import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { memberApi, membershipApi } from "../../api";
import { Member, Membership } from "../../types";
import {
  formatDate,
  formatCurrency,
  getTierColor,
  getTierIcon,
  getMembershipColor,
} from "../../utils";
import { toast } from "../../components/ui/Toast";
import MemberFormPage from "./MemberFormPage";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchMember = () => {
    if (!id) return;
    setLoading(true);
    memberApi
      .getById(id)
      .then((res) => setMember(res.data.data))
      .catch(() => navigate("/members"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const handleCheckin = async () => {
    if (!id || !member) return;
    setCheckingIn(true);
    try {
      const res = await memberApi.checkin(id);
      const data = res.data.data;
      toast.success(res.data.message);
      setMember((prev) =>
        prev
          ? {
              ...prev,
              point: data.currentPoint,
              absentDays: data.absentDays,
              lastCheckinDate: data.checkinTime,
            }
          : prev,
      );
    } catch {
      toast.error("Check-in thất bại");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleOpenUpgrade = async () => {
    const res = await membershipApi.getAll();
    setMemberships(res.data.data);
    setShowUpgrade(true);
  };

  const handleAddMembership = async (
    membershipId: string,
    membershipName: string,
    urPrice: number,
  ) => {
    if (!id) return;
    if (urPrice <= currentPrice) {
      toast.error("Gói này không đủ điều kiện nâng cấp!");
      return;
    }
    setUpgrading(membershipId);
    try {
      const res = await memberApi.addMembership(id, membershipId);
      toast.success(`Nâng cấp lên gói ${membershipName} thành công!`);
      setShowUpgrade(false);
      fetchMember();
      const d = res.data.data;
      if (d.tier.oldTier !== d.tier.newTier) {
        setTimeout(
          () => toast.success(`🏆 Hạng thẻ nâng lên: ${d.tier.newTier}!`),
          500,
        );
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Nâng cấp thất bại");
    } finally {
      setUpgrading(null);
    }
  };

  if (loading)
    return (
      <Layout title="Chi tiết thành viên">
        <PageLoader />
      </Layout>
    );
  if (!member) return null;
  if (showEdit)
    return (
      <MemberFormPage editData={member as unknown as Record<string, unknown>} />
    );
  const currentPrice = member.currentMembership?.urPrice || 0;
  return (
    <Layout
      title={member.name}
      subtitle={`Mã thành viên: ${member.memberId}`}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/members")}
            className="btn-secondary btn-sm"
          >
            ← Quay lại
          </button>
          <button
            onClick={handleCheckin}
            className="btn-success btn-sm"
            disabled={checkingIn}
            id="checkin-btn"
          >
            {checkingIn ? "Đang xử lý..." : "✅ Check-in"}
          </button>
          <button
            onClick={handleOpenUpgrade}
            className="btn-primary btn-sm"
            id="upgrade-btn"
          >
            🏋️ Up gói
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="btn-secondary btn-sm"
          >
            ✏️ Sửa
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h3 className="text-base font-semibold text-white mb-4">
              👤 Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Họ tên", value: member.name },
                { label: "Số điện thoại", value: member.phone },
                { label: "Email", value: member.mail || "—" },
                { label: "Ngày sinh", value: formatDate(member.birthday) },
                {
                  label: "Check-in gần nhất",
                  value: formatDate(member.lastCheckinDate),
                },
                {
                  label: "Số ngày vắng",
                  value: `${member.absentDays} ngày${member.absentDays > 5 ? " ⚠️" : ""}`,
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-base font-semibold text-white mb-4">
              🏋️ Gói tập
            </h3>
            {member.currentMembership ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Gói hiện tại</p>
                  <p
                    className={`text-sm font-semibold ${getMembershipColor(member.currentMembership.membershipName)}`}
                  >
                    {member.currentMembership.membershipName}
                  </p>
                </div>
                {member.currentMembership.durationMonths && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Thời hạn</p>
                    <p className="text-sm font-medium text-white">
                      {member.currentMembership.durationMonths} tháng
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Ngày bắt đầu</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(member.membershipStartDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Ngày kết thúc</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(member.membershipEndDate)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">Chưa có gói tập</p>
                <button
                  onClick={handleOpenUpgrade}
                  className="btn-primary btn-sm"
                >
                  ➕ Thêm gói
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats */}
        <div className="space-y-4">
          <div className="card text-center">
            <div className="text-4xl mb-2">
              {member.tier ? getTierIcon(member.tier.tierName) : "🏅"}
            </div>
            <p className="text-sm text-gray-400 mb-1">Hạng thẻ</p>
            <span
              className={`badge ${getTierColor(member.tier?.tierName)} text-sm px-3 py-1`}
            >
              {member.tier?.tierName || "—"}
            </span>
          </div>

          {[
            {
              label: "Điểm đổi quà",
              value: `${member.point} pts`,
              icon: "⭐",
              color: "text-yellow-400",
            },
            {
              label: "Điểm tích lũy",
              value: `${member.obtainPoint} pts`,
              icon: "📈",
              color: "text-primary-400",
            },
            {
              label: "Tổng chi tiêu",
              value: formatCurrency(member.totalExpense),
              icon: "💰",
              color: "text-emerald-400",
            },
          ].map((item) => (
            <div key={item.label} className="card flex items-center gap-4">
              <div className="text-2xl">{item.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="🏋️ Chọn gói tập"
        size="xl"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {memberships
            .filter((m) => m.isActive)
            .map((ms) => (
              <div
                key={ms.id}
                className="flex items-center justify-between p-4 bg-dark-700 rounded-xl border border-white/10 hover:border-primary-500/30 transition-colors"
              >
                <div>
                  <p
                    className={`font-semibold ${getMembershipColor(ms.membershipName)}`}
                  >
                    {ms.membershipName}
                  </p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span>⏱️ {ms.durationMonths} tháng</span>
                    <span>⭐ +{ms.rewardPoint} điểm</span>
                    <span>💰 {formatCurrency(ms.urPrice)}</span>
                  </div>
                  {ms.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {ms.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    handleAddMembership(ms.id, ms.membershipName, ms.urPrice)
                  }
                  className="btn-primary btn-sm shrink-0 ml-4"
                  disabled={upgrading === ms.id || ms.urPrice <= currentPrice}
                >
                  {upgrading === ms.id ? "Đang xử lý..." : "Chọn"}
                </button>
              </div>
            ))}
        </div>
      </Modal>
    </Layout>
  );
}
