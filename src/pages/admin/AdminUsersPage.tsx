import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import adminUserService from "../../services/adminUserService";
import type { AdminUserPageResponse } from "../../types/api";

const PAGE_SIZE = 10;

function AdminUsersPage() {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [page, setPage] = useState(0);
    const [result, setResult] = useState<AdminUserPageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [changingId, setChangingId] = useState<number | null>(null);
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await adminUserService.getUsers({ search, role, page, size: PAGE_SIZE });
            setResult(response.data);
        } catch {
            setError("Kullanıcılar yüklenemedi. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }, [search, role, page]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPage(0);
        setSearch(searchInput.trim());
    };

    const handleRoleChange = (value: string) => {
        setRole(value);
        setPage(0);
    };

    const handleStatusChange = async (id: number, active: boolean) => {
        setChangingId(id);
        setError("");
        try {
            await adminUserService.updateStatus(id, active);
            await loadUsers();
        } catch {
            setError("Kullanıcı durumu güncellenemedi.");
        } finally {
            setChangingId(null);
        }
    };

    return (
        <section>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#101d35]">Kullanıcılar</h1>
                <p className="mt-2 text-slate-500">Kayıtlı kullanıcıları ara ve hesap durumlarını yönet.</p>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <label className="flex flex-1 items-center gap-3 rounded-lg border border-slate-300 px-4">
                            <Search size={18} className="text-slate-400" />
                            <input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="E-posta, ad veya soyad ara"
                                className="w-full py-3 text-sm outline-none"
                            />
                        </label>
                        <button className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600">
                            Ara
                        </button>
                    </form>
                    <select
                        value={role}
                        onChange={(event) => handleRoleChange(event.target.value)}
                        aria-label="Role göre filtrele"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                        <option value="">Tüm roller</option>
                        <option value="CUSTOMER">Müşteri</option>
                        <option value="SELLER">Satıcı</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Kullanıcı</th>
                                <th className="px-6 py-4">E-posta</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Kayıt tarihi</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Kullanıcılar yükleniyor...</td></tr>
                            ) : result?.content.length ? result.content.map((user) => (
                                <tr key={user.id} className="text-slate-700">
                                    <td className="px-6 py-4 font-medium text-[#101d35]">{user.firstName} {user.lastName}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{{ CUSTOMER: "Müşteri", SELLER: "Satıcı", ADMIN: "Admin" }[user.role]}</td>
                                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                            {user.active ? "Aktif" : "Pasif"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => void handleStatusChange(user.id, !user.active)}
                                            disabled={changingId === user.id}
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${user.active ? "border border-red-200 text-red-600 hover:bg-red-50" : "bg-orange-500 text-white hover:bg-orange-600"}`}
                                        >
                                            {changingId === user.id ? "Güncelleniyor..." : user.active ? "Pasif yap" : "Aktif yap"}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Aramanızla eşleşen kullanıcı bulunamadı.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">Toplam {result?.totalElements ?? 0} kullanıcı</p>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">Sayfa {result && result.totalPages > 0 ? result.page + 1 : 0} / {result?.totalPages ?? 0}</span>
                        <button
                            aria-label="Önceki sayfa"
                            onClick={() => setPage((current) => Math.max(0, current - 1))}
                            disabled={page === 0 || loading}
                            className="rounded-lg border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                        ><ChevronLeft size={18} /></button>
                        <button
                            aria-label="Sonraki sayfa"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={!result || result.last || loading}
                            className="rounded-lg border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                        ><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AdminUsersPage;
