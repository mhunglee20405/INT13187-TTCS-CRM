import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { memberApi } from "../../api";
import { Member, PaginationInfo } from "../../types";
import { formatDate, formatCurrency, getTierColor, getTierIcon } from "../../utils";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "../../components/ui/Toast";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchMembers = useCallback(async (page = 1, kw = keyword) => {
    setLoading(true);
    try {
      const res = await memberApi.getAll({ keyword: kw, page, limit: 10 });
      setMembers(res.data.data.members);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error("Không thể tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { fetchMembers(1); }, [fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
    fetchMembers(1, searchInput);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await memberApi.delete(deleteId);
      toast.success("Xóa thành viên thành công");
      fetchMembers(pagination.page);
    } catch {
      toast.error("Xóa thành viên thất bại");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCheckin = async (id: string, name: string) => {
    try {
      const res = await memberApi.checkin(id);
      const data = res.data.data;
      toast.success(`Check-in ${name} ${data.isPointAdded ? "(+1 điểm)" : "(đã cộng điểm hôm nay)"}`);
      fetchMembers(pagination.page);
    } catch {
      toast.error("Check-in thất bại");
    }
  };

  return (
    <Layout
      title="Thành viên"
      subtitle={`${pagination.totalItems} thành viên`}
      actions={
        <Link to="/members/new" className="btn-primary flex items-center gap-2" id="add-member-btn">
          <span>➕</span> Thêm thành viên
        </Link>
      }
    >
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input-field max-w-sm"
          placeholder="🔍 Tìm theo tên, SĐT, email..."
          id="member-search-input"
        />
        <button type="submit" className="btn-primary btn-sm px-5">Tìm kiếm</button>
        {keyword && (
          <button type="button" onClick={() => { setSearchInput(""); setKeyword(""); fetchMembers(1, ""); }} className="btn-secondary btn-sm">
            Xóa lọc
          </button>
        )}
      </form>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12"><PageLoader /></div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-3">👥</div>
            <p className="font-medium">Không tìm thấy thành viên nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-dark-700/50">
                <tr>
                  {["Thành viên", "Liên hệ", "Hạng thẻ", "Điểm", "Chi tiêu", "Check-in cuối", "Thao tác"].map((h) => (
                    <th key={h} className="table-header px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p>{member.phone}</p>
                      <p className="text-xs text-gray-500">{member.mail || "—"}</p>
                    </td>
                    <td className="table-cell">
                      {member.tier ? (
                        <span className={`badge ${getTierColor(member.tier.tierName)}`}>
                          {getTierIcon(member.tier.tierName)} {member.tier.tierName}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="table-cell">
                      <p className="font-semibold text-primary-400">{member.point} pts</p>
                      <p className="text-xs text-gray-500">Tích: {member.obtainPoint}</p>
                    </td>
                    <td className="table-cell">{formatCurrency(member.totalExpense)}</td>
                    <td className="table-cell">
                      <div>
                        <p>{formatDate(member.lastCheckinDate)}</p>
                        {member.absentDays > 5 && (
                          <p className="text-xs text-amber-400">⚠️ Vắng {member.absentDays} ngày</p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCheckin(member.id, member.name)}
                          className="btn-success btn-sm text-xs"
                          title="Check-in"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => navigate(`/members/${member.id}`)}
                          className="btn-secondary btn-sm text-xs"
                          title="Chi tiết"
                        >
                          👁️
                        </button>
                        {isAdmin() && (
                          <button
                            onClick={() => setDeleteId(member.id)}
                            className="btn-danger btn-sm text-xs"
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">
            Trang {pagination.page} / {pagination.totalPages} — {pagination.totalItems} thành viên
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchMembers(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              ← Trước
            </button>
            <button
              onClick={() => fetchMembers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa thành viên"
        message="Bạn có chắc chắn muốn xóa thành viên này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        loading={deleting}
      />
    </Layout>
  );
}
