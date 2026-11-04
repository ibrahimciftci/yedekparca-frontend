import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import ProductImage from "../../components/ProductImage";
import adminProductService from "../../services/adminProductService";
import type { ProductModerationStatus, ProductPageResponse, ProductResponse } from "../../types/api";

const statusLabels: Record<ProductModerationStatus, string> = { PENDING: "Bekliyor", APPROVED: "Onaylandı", REJECTED: "Reddedildi" };

function AdminProductsPage() {
    const [result, setResult] = useState<ProductPageResponse<ProductResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [sellerId, setSellerId] = useState("");
    const [moderationStatus, setModerationStatus] = useState("");
    const [active, setActive] = useState("");
    const [selected, setSelected] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [error, setError] = useState("");

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await adminProductService.getProducts({
                search: search || undefined,
                category: category || undefined,
                brand: brand || undefined,
                sellerId: sellerId ? Number(sellerId) : undefined,
                moderationStatus: (moderationStatus || undefined) as ProductModerationStatus | undefined,
                active: active === "" ? undefined : active === "true",
                page,
                size: 10,
            });
            setResult(response.data);
        } catch {
            setError("Ürünler yüklenemedi. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }, [search, category, brand, sellerId, moderationStatus, active, page]);

    useEffect(() => { void loadProducts(); }, [loadProducts]);

    const closeDetails = () => {
        setSelected(null);
        setRejectMode(false);
        setRejectionReason("");
    };

    const openDetails = async (id: number) => {
        setError("");
        try {
            const response = await adminProductService.getProduct(id);
            setSelected(response.data);
        } catch {
            setError("Ürün detayları yüklenemedi.");
        }
    };

    const handleApprove = async () => {
        if (!selected || actionLoading) return;
        if (!window.confirm(`“${selected.name}” ürününü onaylamak istiyor musunuz?`)) return;
        setActionLoading(true);
        setError("");
        try {
            await adminProductService.approveProduct(selected.id);
            closeDetails();
            await loadProducts();
        } catch {
            setError("Ürün onaylanamadı. Başvuru daha önce değerlendirilmiş olabilir.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selected || actionLoading) return;
        const reason = rejectionReason.trim();
        if (!reason) {
            setError("Ret gerekçesi zorunludur.");
            return;
        }
        if (!window.confirm(`“${selected.name}” ürününü bu gerekçeyle reddetmek istiyor musunuz?`)) return;
        setActionLoading(true);
        setError("");
        try {
            await adminProductService.rejectProduct(selected.id, reason);
            closeDetails();
            await loadProducts();
        } catch {
            setError("Ürün reddedilemedi. Başvuru daha önce değerlendirilmiş olabilir.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleActive = async (product: ProductResponse) => {
        const action = product.active ? "pasife almak" : "aktif etmek";
        if (!window.confirm(`“${product.name}” ürününü ${action} istiyor musunuz?`)) return;
        setActionLoading(true);
        setError("");
        try {
            await adminProductService.setActive(product.id, !product.active);
            if (selected?.id === product.id) setSelected({ ...selected, active: !product.active });
            await loadProducts();
        } catch {
            setError("Ürün aktiflik durumu güncellenemedi.");
        } finally {
            setActionLoading(false);
        }
    };

    const applySearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPage(0);
        setSearch(searchInput.trim());
    };

    const resetPage = (update: () => void) => {
        update();
        setPage(0);
    };

    return (
        <section>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#101d35]">Ürün Yönetimi</h1>
                <p className="mt-2 text-slate-500">Ürünleri inceleyin, moderasyon ve yayın durumlarını yönetin.</p>
            </div>

            {error && !selected && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <form onSubmit={applySearch} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 sm:col-span-2"><Search size={17} className="text-slate-400" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Ürün adı veya OEM" className="w-full py-2.5 text-sm outline-none" /></label>
                    <input value={category} onChange={(event) => resetPage(() => setCategory(event.target.value))} placeholder="Kategori" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                    <input value={brand} onChange={(event) => resetPage(() => setBrand(event.target.value))} placeholder="Marka" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                    <input value={sellerId} onChange={(event) => resetPage(() => setSellerId(event.target.value.replace(/\D/g, "")))} placeholder="Satıcı ID" inputMode="numeric" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                    <select value={moderationStatus} onChange={(event) => resetPage(() => setModerationStatus(event.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Tüm moderasyon</option><option value="PENDING">Bekliyor</option><option value="APPROVED">Onaylandı</option><option value="REJECTED">Reddedildi</option></select>
                    <select value={active} onChange={(event) => resetPage(() => setActive(event.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Aktiflik: tümü</option><option value="true">Aktif</option><option value="false">Pasif</option></select>
                    <button className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">Ara</button>
                </form>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? <div className="p-12 text-center text-slate-500">Ürünler yükleniyor...</div>
                    : !result?.content.length ? <div className="p-12 text-center"><p className="font-semibold text-[#101d35]">Ürün bulunamadı</p><p className="mt-2 text-sm text-slate-500">Filtreleri değiştirip yeniden arayabilirsiniz.</p></div>
                        : <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Ürün</th><th className="px-5 py-4">Satıcı</th><th className="px-5 py-4">Fiyat</th><th className="px-5 py-4">Moderasyon</th><th className="px-5 py-4">Yayın</th><th className="px-5 py-4">İşlemler</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {result.content.map((product) => <tr key={product.id}>
                                        <td className="px-5 py-4"><div className="flex items-center gap-3"><ProductImage src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-lg" /><div><p className="font-semibold text-[#101d35]">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.category} · {product.brand} · {product.oemNumber || "OEM yok"}</p></div></div></td>
                                        <td className="px-5 py-4"><p className="font-medium text-slate-700">{product.sellerStoreName}</p><p className="mt-1 text-xs text-slate-400">#{product.sellerId}</p></td>
                                        <td className="px-5 py-4">{product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.moderationStatus === "APPROVED" ? "bg-green-50 text-green-700" : product.moderationStatus === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{statusLabels[product.moderationStatus]}</span></td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{product.active ? "Aktif" : "Pasif"}</span></td>
                                        <td className="px-5 py-4"><div className="flex items-center gap-2"><button onClick={() => void openDetails(product.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Detay</button><button disabled={actionLoading} onClick={() => void handleActive(product)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50">{product.active ? "Pasife al" : "Aktifleştir"}</button></div></td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>}
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><span className="text-sm text-slate-500">Toplam {result?.totalElements ?? 0} ürün · Sayfa {result && result.totalPages > 0 ? result.page + 1 : 0} / {result?.totalPages ?? 0}</span><div className="flex gap-2"><button disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Önceki</button><button disabled={!result || result.last || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Sonraki</button></div></div>
            </div>

            {selected && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"><div role="dialog" aria-modal="true" aria-labelledby="admin-product-title" className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><h2 id="admin-product-title" className="text-xl font-bold text-[#101d35]">Ürün detayı</h2><p className="mt-1 text-sm text-slate-500">{selected.name}</p></div><button onClick={closeDetails} aria-label="Detayı kapat" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
                {error && <p role="alert" className="mx-6 mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <div className="grid gap-5 px-6 py-6 sm:grid-cols-[180px_1fr]"><ProductImage src={selected.imageUrl} alt={selected.name} className="h-44 w-full rounded-xl sm:h-40" /><div className="grid gap-4 sm:grid-cols-2"><Detail label="Kategori / marka" value={`${selected.category} · ${selected.brand}`} /><Detail label="OEM / parça no" value={selected.oemNumber || "—"} /><Detail label="Fiyat / stok" value={`${selected.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })} · ${selected.stockQuantity} adet`} /><Detail label="Durum" value={selected.condition === "NEW" ? "Sıfır" : "İkinci el"} /><Detail label="Satıcı" value={`${selected.sellerStoreName} (#${selected.sellerId})`} /><Detail label="Satıcı iletişim" value={`${selected.sellerFirstName} ${selected.sellerLastName} · ${selected.sellerEmail}`} /><div className="sm:col-span-2"><Detail label="Açıklama" value={selected.description || "Açıklama girilmemiş."} /></div><div className="sm:col-span-2"><p className="text-xs font-semibold uppercase text-slate-400">Araç uyumlulukları</p>{selected.vehicleCompatibilities.length ? <ul className="mt-2 space-y-1 text-sm text-slate-700">{selected.vehicleCompatibilities.map((fitment) => <li key={fitment.id ?? `${fitment.vehicleBrand}-${fitment.vehicleModel}-${fitment.yearFrom}`} >{fitment.vehicleBrand} {fitment.vehicleModel}, {fitment.yearFrom}–{fitment.yearTo}{fitment.engineInfo ? ` · ${fitment.engineInfo}` : ""}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">Uyumluluk bilgisi eklenmemiş.</p>}</div>{selected.rejectionReason && <div className="sm:col-span-2"><Detail label="Ret gerekçesi" value={selected.rejectionReason} /></div>}</div></div>
                {selected.moderationStatus === "PENDING" && !rejectMode && <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end"><button onClick={() => setRejectMode(true)} disabled={actionLoading} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Reddet</button><button onClick={() => void handleApprove()} disabled={actionLoading} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{actionLoading ? "İşleniyor..." : "Onayla"}</button></div>}
                {rejectMode && <form onSubmit={(event) => void handleReject(event)} className="border-t border-slate-100 px-6 py-5"><label htmlFor="product-rejection-reason" className="block text-sm font-semibold text-[#101d35]">Ret gerekçesi <span className="text-red-500">*</span></label><textarea id="product-rejection-reason" required maxLength={500} rows={3} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500" placeholder="Ürünün neden reddedildiğini açıklayın" /><p className="mt-1 text-right text-xs text-slate-400">{rejectionReason.length}/500</p><div className="mt-4 flex justify-end gap-3"><button type="button" onClick={() => setRejectMode(false)} disabled={actionLoading} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm">Vazgeç</button><button disabled={actionLoading || !rejectionReason.trim()} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{actionLoading ? "İşleniyor..." : "Gerekçeyle reddet"}</button></div></form>}
            </div></div>}
        </section>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return <div><p className="text-xs font-semibold uppercase text-slate-400">{label}</p><p className="mt-1 break-words whitespace-pre-wrap text-sm text-slate-700">{value}</p></div>;
}

export default AdminProductsPage;
