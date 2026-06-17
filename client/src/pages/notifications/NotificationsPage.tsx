import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/layout/Layout";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { notificationApi, tierApi, memberApi, templateApi } from "../../api";
import { Notification, NotificationTemplate, Tier, Member } from "../../types";
import { formatDateTime } from "../../utils";
import { toast } from "../../components/ui/Toast";

type Tab = "send" | "history" | "templates";

const TARGET_TYPES = [
  { value: "all", label: "🌐 Tất cả thành viên" },
  { value: "tier", label: "🏆 Theo hạng thẻ" },
  { value: "member", label: "👤 Thành viên cụ thể" },
  { value: "absent_over_5_days", label: "⚠️ Vắng quá 5 ngày" },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("send");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    targetType: "all",
    targetValue: "",
  });

  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [templateForm, setTemplateForm] = useState({
    templateName: "",
    title: "",
    content: "",
  });

  const [editTemplate, setEditTemplate] = useState<NotificationTemplate | null>(
    null,
  );

  const [savingTemplate, setSavingTemplate] = useState(false);

  const [viewingNotification, setViewingNotification] =
    useState<Notification | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    try {
      const [nRes, tRes, tiersRes] = await Promise.all([
        notificationApi.getAll(),
        templateApi.getAll(),
        tierApi.getAll(),
      ]);

      setNotifications(nRes.data.data.notifications);
      setTemplates(tRes.data.data);
      setTiers(tiersRes.data.data);
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSend = async () => {
    if (!form.title || !form.content) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    setSending(true);

    try {
      const payload = {
        ...form,
        targetValue:
          form.targetType === "member" && selectedMember
            ? selectedMember.id
            : form.targetValue,
      };

      await notificationApi.send(payload);

      toast.success("Gửi thông báo thành công!");

      setForm({
        title: "",
        content: "",
        targetType: "all",
        targetValue: "",
      });

      setSelectedMember(null);
      fetchAll();
      setActiveTab("history");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Gửi thất bại");
    } finally {
      setSending(false);
    }
  };

  const handleSearchMember = async () => {
    if (!memberSearch.trim()) return;

    const res = await memberApi.getAll({
      keyword: memberSearch,
      limit: 5,
    });

    setMemberResults(res.data.data.members);
  };

  const applyTemplate = (t: NotificationTemplate) => {
    setForm((prev) => ({
      ...prev,
      title: t.title,
      content: t.content,
    }));

    setActiveTab("send");
    toast.info(`Đã áp dụng mẫu: ${t.templateName}`);
  };

  const handleSaveTemplate = async () => {
    if (
      !templateForm.templateName ||
      !templateForm.title ||
      !templateForm.content
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSavingTemplate(true);

    try {
      if (editTemplate) {
        await templateApi.update(editTemplate.id, templateForm);
        toast.success("Cập nhật mẫu thành công");
      } else {
        await templateApi.create(templateForm);
        toast.success("Thêm mẫu thành công");
      }

      setTemplateForm({
        templateName: "",
        title: "",
        content: "",
      });

      setEditTemplate(null);
      fetchAll();
    } catch {
      toast.error("Lưu mẫu thất bại");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await templateApi.delete(id);
      toast.success("Xóa mẫu thành công");
      fetchAll();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "send", label: "📤 Gửi thông báo" },
    { key: "history", label: "📋 Lịch sử" },
    { key: "templates", label: "📝 Mẫu thông báo" },
  ];

  const targetTypeLabel: Record<string, string> = {
    all: "Tất cả",
    tier: "Hạng thẻ",
    member: "Thành viên",
    absent_over_5_days: "Vắng > 5 ngày",
  };

  return (
    <Layout title="Thông báo" subtitle="Gửi thông báo đến thành viên">
      {/* TAB Ở GIỮA */}
      <div className="mx-auto flex gap-1 mb-6 bg-dark-800 border border-white/10 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
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

      {activeTab === "send" && (
        // FORM Ở GIỮA
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {templates.length > 0 && (
            <div className="card">
              <p className="text-xs text-gray-400 mb-2 font-medium">
                ⚡ Dùng mẫu nhanh
              </p>

              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="px-3 py-1.5 rounded-lg bg-primary-900/30 border border-primary-500/30 text-primary-400 text-xs hover:bg-primary-900/50 transition-colors"
                  >
                    {t.templateName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5 font-medium">
                Đối tượng nhận
              </label>

              <div className="grid grid-cols-2 gap-2">
                {TARGET_TYPES.map((tt) => (
                  <button
                    key={tt.value}
                    onClick={() => {
                      setForm((p) => ({
                        ...p,
                        targetType: tt.value,
                        targetValue: "",
                      }));
                      setSelectedMember(null);
                    }}
                    className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                      form.targetType === tt.value
                        ? "bg-primary-900/30 border-primary-500/50 text-primary-400"
                        : "bg-dark-700 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {tt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.targetType === "tier" && (
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">
                  Chọn hạng thẻ
                </label>

                <select
                  value={form.targetValue}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      targetValue: e.target.value,
                    }))
                  }
                  className="input-field"
                >
                  <option value="">-- Chọn hạng --</option>

                  {tiers.map((t) => (
                    <option key={t.id} value={t.tierId}>
                      {t.tierName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.targetType === "member" && (
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">
                  Tìm thành viên
                </label>

                <div className="flex gap-2 mb-2">
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
                    className="input-field text-sm flex-1"
                    placeholder="Nhập tên, SĐT..."
                  />

                  <button
                    onClick={handleSearchMember}
                    className="btn-secondary btn-sm"
                  >
                    Tìm
                  </button>
                </div>

                {memberResults.length > 0 && !selectedMember && (
                  <div className="space-y-1">
                    {memberResults.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMember(m);
                          setMemberResults([]);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-dark-700 hover:bg-dark-600 border border-white/10 text-sm"
                      >
                        {m.name} — {m.phone}
                      </button>
                    ))}
                  </div>
                )}

                {selectedMember && (
                  <div className="p-2 rounded-lg bg-primary-900/30 border border-primary-500/30 flex items-center justify-between">
                    <p className="text-sm text-white">
                      {selectedMember.name} — {selectedMember.phone}
                    </p>

                    <button
                      onClick={() => setSelectedMember(null)}
                      className="text-gray-400 text-xs hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-1.5 font-medium">
                Tiêu đề *
              </label>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    title: e.target.value,
                  }))
                }
                className="input-field"
                placeholder="Ưu đãi tháng 6..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5 font-medium">
                Nội dung *
              </label>

              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    content: e.target.value,
                  }))
                }
                rows={4}
                className="input-field resize-none"
                placeholder="Nội dung thông báo..."
              />
            </div>

            <button
              onClick={handleSend}
              className="btn-primary w-full py-3 font-semibold"
              disabled={sending}
            >
              {sending ? "Đang gửi..." : "📤 Gửi thông báo"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "history" &&
        (loading ? (
          <PageLoader />
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-dark-700/50">
                <tr>
                  {[
                    "Tiêu đề",
                    "Đối tượng",
                    "Người nhận",
                    "Người gửi",
                    "Thời gian",
                  ].map((h) => (
                    <th key={h} className="table-header px-4 py-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <tr
                    key={n.notificationId}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="table-cell">
                      <button
                        onClick={() => setViewingNotification(n)}
                        className="text-left block w-full focus:outline-none group"
                      >
                        <p className="font-medium text-white group-hover:text-primary-400 transition-colors cursor-pointer flex items-center gap-2">
                          {n.title}

                          <span className="text-[10px] text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Xem chi tiết 🔍
                          </span>
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">
                          {n.content}
                        </p>
                      </button>
                    </td>

                    <td className="table-cell">
                      <span className="badge bg-primary-900/50 text-primary-400 border-primary-700/50">
                        {(n as any).targetName ||
                          targetTypeLabel[n.targetType] ||
                          n.targetType}
                      </span>
                    </td>

                    <td className="table-cell">{n.receiverCount} người</td>

                    <td className="table-cell">{n.sentBy?.username}</td>

                    <td className="table-cell text-gray-400">
                      {formatDateTime(n.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-base font-semibold text-white mb-4">
              {editTemplate ? "✏️ Sửa mẫu" : "➕ Thêm mẫu"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Tên mẫu *
                </label>

                <input
                  value={templateForm.templateName}
                  onChange={(e) =>
                    setTemplateForm((p) => ({
                      ...p,
                      templateName: e.target.value,
                    }))
                  }
                  className="input-field text-sm"
                  placeholder="Nhắc lịch tập"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Tiêu đề *
                </label>

                <input
                  value={templateForm.title}
                  onChange={(e) =>
                    setTemplateForm((p) => ({
                      ...p,
                      title: e.target.value,
                    }))
                  }
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Nội dung *
                </label>

                <textarea
                  value={templateForm.content}
                  onChange={(e) =>
                    setTemplateForm((p) => ({
                      ...p,
                      content: e.target.value,
                    }))
                  }
                  rows={3}
                  className="input-field text-sm resize-none"
                />
              </div>

              <div className="flex gap-2">
                {editTemplate && (
                  <button
                    onClick={() => {
                      setEditTemplate(null);
                      setTemplateForm({
                        templateName: "",
                        title: "",
                        content: "",
                      });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Hủy
                  </button>
                )}

                <button
                  onClick={handleSaveTemplate}
                  className="btn-primary flex-1"
                  disabled={savingTemplate}
                >
                  {savingTemplate
                    ? "Đang lưu..."
                    : editTemplate
                      ? "Cập nhật"
                      : "Thêm mẫu"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {templates.map((t) => (
              <div key={t.id} className="card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">
                      {t.templateName}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">{t.title}</p>

                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {t.content}
                    </p>
                  </div>

                  <div className="flex gap-1 ml-3 shrink-0">
                    <button
                      onClick={() => applyTemplate(t)}
                      className="btn-success btn-sm text-xs"
                      title="Dùng mẫu"
                    >
                      ▶
                    </button>

                    <button
                      onClick={() => {
                        setEditTemplate(t);
                        setTemplateForm({
                          templateName: t.templateName,
                          title: t.title,
                          content: t.content,
                        });
                      }}
                      className="btn-secondary btn-sm text-xs"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDeleteTemplate(t.id)}
                      className="btn-danger btn-sm text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">
                Chưa có mẫu thông báo nào
              </p>
            )}
          </div>
        </div>
      )}

      {viewingNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all">
          <div className="card w-full max-w-md border border-white/10 shadow-2xl relative bg-dark-800 p-6 rounded-xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex-1 pr-4">
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-primary-900/50 text-primary-400 border border-primary-800/50 px-2 py-0.5 rounded mb-1.5 inline-block">
                  Chi tiết lịch sử gửi
                </span>

                <h3 className="text-lg font-bold text-white leading-tight">
                  {viewingNotification.title}
                </h3>
              </div>

              <button
                onClick={() => setViewingNotification(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1.5">
                  Nội dung thông báo
                </label>

                <div className="bg-dark-700/50 border border-white/5 rounded-xl p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                  {viewingNotification.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-xs">
                <div>
                  <p className="text-gray-500 font-medium">Đối tượng nhận</p>

                  <p className="text-primary-400 font-semibold mt-1">
                    {(viewingNotification as any).targetName ||
                      viewingNotification.targetType}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Quy mô tiếp cận</p>

                  <p className="text-gray-200 font-semibold mt-1">
                    {viewingNotification.receiverCount} người
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">
                    Người phê duyệt/gửi
                  </p>

                  <p className="text-gray-200 font-medium mt-1">
                    {viewingNotification.sentBy?.username || "admin"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Thời gian tạo</p>

                  <p className="text-gray-400 mt-1">
                    {formatDateTime(viewingNotification.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setViewingNotification(null)}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600 border border-white/10 transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
