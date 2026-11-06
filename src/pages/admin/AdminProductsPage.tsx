import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import ProductImage from "../../components/ProductImage";
import marketplaceService, { type CatalogView, type OfferView } from "../../services/marketplaceService";
import type { ProductPageResponse } from "../../types/api";

const statusLabels: Record<OfferView["moderationStatus"], string> = {
    PENDING: "Onay bekliyor",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi",
};

const statusClasses: Record<OfferView["moderationStatus"], string> = {
    PENDING: "bg-amber-50 text-amber-700",
    APPROVED: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700",
};

function sortedPhotos(offer: OfferView) {
    return [...offer.photos].sort((a, b) => Number(b.primaryPhoto) - Number(a.primaryPhoto) || a.displayOrder - b.displayOrder)
        .map(photo => photo.url).filter((url): url is string => Boolean(url));
}

function AdminProductsPage() {
    const [result, setResult] = useState<ProductPageResponse<OfferView> | null>(null);
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [sellerId, setSellerId] = useState("");
    const [moderationStatus, setModerationStatus] = useState("");
    const [active, setActive] = useState("");
    const [selected, setSelected] = useState<OfferView | null>(null);
    const [catalog, setCatalog] = useState<CatalogView | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    const loadOffers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await marketplaceService.adminOffers({
                search: search || undefined,
                category: category || undefined,
                brand: brand || undefined,
                sellerId: sellerId ? Number(sellerId) : undefined,
                status: (moderationStatus || undefined) as OfferView["moderationStatus"] | undefined,
                active: active === "" ? undefined : active === "true",
                page,
                size: 10,
            });
            setResult(response);
        } catch {
            setError("Firma ilanları yüklenemedi. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }, [search, category, brand, sellerId, moderationStatus, active, page]);

    useEffect(() => { void loadOffers(); }, [loadOffers]);

    const closeDetails = () => {
        setSelected(null);
        setCatalog(null);
    };

    const openDetails = async (id: number) => {
        setError("");
        try {
            const offer = await marketplaceService.adminOfferDetail(id);
            setSelected(offer);
            setCatalog(await marketplaceService.adminCatalogDetail(offer.catalogProductId));
        } catch {
            setError("İlan detayları yüklenemedi.");
        }
    };

    const reviewOffer = async (offer: OfferView, approve: boolean) => {
        if (actionLoading) return;
        if (!window.confirm(approve ? `“${offer.name}” firma ilanı onaylansın mı?` : `“${offer.name}” firma ilanı reddedilsin mi?`)) return;
        const reason = approve ? undefined : window.prompt("Ret gerekçesi (zorunlu)")?.trim();
        if (!approve && !reason) return;

        setActionLoading(true);
        setError("");
        try {
            await marketplaceService.reviewOffer(offer.id, approve, reason);
            closeDetails();
            await loadOffers();
        } catch {
            setError("İlan moderasyonu tamamlanamadı. İlan daha önce değerlendirilmiş olabilir.");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleActive = async (offer: OfferView) => {
        if (actionLoading) return;
        const nextActive = !offer.active;
        if (!window.confirm(`“${offer.name}” ilanı ${nextActive ? "aktif edilsin" : "pasife alınsın"} mı?`)) return;
        setActionLoading(true);
        setError("");
        try {
            await marketplaceService.setOfferActive(offer.id, nextActive);
            if (selected?.id === offer.id) setSelected({ ...selected, active: nextActive });
            await loadOffers();
        } catch {
            setError("İlanın aktiflik durumu güncellenemedi.");
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

    return <section>
        <Link to="/admin/marketplace" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 transition hover:border-orange-300 hover:bg-orange-100">
            <span><strong className="text-[#101d35]">Ortak katalog yönetimi</strong><span className="ml-2 text-sm text-slate-600">Katalog ürünlerinin moderasyonu firma ilanlarından ayrı yürütülür.</span></span>
            <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-white">Katalog yönetimine git</span>
        </Link>
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#101d35]">Firma İlanları</h1>
            <p className="mt-2 text-slate-500">Satıcıların fiyat ve stok ilanlarını inceleyin, moderasyon ve yayın durumlarını yönetin.</p>
        </div>

        {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <form onSubmit={applySearch} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 sm:col-span-2"><Search size={17} className="text-slate-400" /><input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Ürün adı veya OEM" className="w-full py-2.5 text-sm outline-none" /></label>
                <input value={category} onChange={event => resetPage(() => setCategory(event.target.value))} placeholder="Kategori" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                <input value={brand} onChange={event => resetPage(() => setBrand(event.target.value))} placeholder="Marka" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                <input value={sellerId} onChange={event => resetPage(() => setSellerId(event.target.value.replace(/\D/g, "")))} placeholder="Satıcı ID" inputMode="numeric" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                <select value={moderationStatus} onChange={event => resetPage(() => setModerationStatus(event.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Tüm moderasyon durumları</option><option value="PENDING">Onay bekliyor</option><option value="APPROVED">Onaylandı</option><option value="REJECTED">Reddedildi</option></select>
                <select value={active} onChange={event => resetPage(() => setActive(event.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">Aktiflik: tümü</option><option value="true">Aktif</option><option value="false">Pasif</option></select>
                <button className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">Ara</button>
            </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? <div className="p-12 text-center text-slate-500">Firma ilanları yükleniyor...</div>
                : !result?.content.length ? <div className="p-12 text-center"><p className="font-semibold text-[#101d35]">İlan bulunamadı</p><p className="mt-2 text-sm text-slate-500">Filtreleri değiştirip yeniden arayabilirsiniz.</p></div>
                    : <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">İlan</th><th className="px-5 py-4">Firma</th><th className="px-5 py-4">Fiyat / stok</th><th className="px-5 py-4">Moderasyon</th><th className="px-5 py-4">Yayın</th><th className="px-5 py-4">İşlemler</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {result.content.map(offer => {
                                    const photos = sortedPhotos(offer);
                                    return <tr key={offer.id}>
                                        <td className="px-5 py-4"><div className="flex items-center gap-3"><ProductImage src={photos[0]} fallbackSrcs={photos.slice(1)} alt={offer.name} className="h-12 w-12 rounded-lg" /><div><p className="font-semibold text-[#101d35]">{offer.name}</p><p className="mt-1 text-xs text-slate-500">{offer.category} · {offer.brand} · {offer.oemNumber || "OEM yok"} · {offer.condition === "NEW" ? "Sıfır" : "İkinci el"}</p></div></div></td>
                                        <td className="px-5 py-4"><p className="font-medium text-slate-700">{offer.sellerName}</p><p className="mt-1 text-xs text-slate-400">#{offer.sellerId}</p></td>
                                        <td className="px-5 py-4"><p>{offer.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p><p className="mt-1 text-xs text-slate-500">Stok: {offer.stockQuantity}</p></td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[offer.moderationStatus]}`}>{statusLabels[offer.moderationStatus]}</span></td>
                                        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${offer.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{offer.active ? "Aktif" : "Pasif"}</span></td>
                                        <td className="px-5 py-4"><div className="flex items-center gap-2"><button onClick={() => void openDetails(offer.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Detay</button><button disabled={actionLoading} onClick={() => void toggleActive(offer)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50">{offer.active ? "Pasife al" : "Aktifleştir"}</button></div></td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </div>}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><span className="text-sm text-slate-500">Toplam {result?.totalElements ?? 0} ilan · Sayfa {result && result.totalPages > 0 ? result.page + 1 : 0} / {result?.totalPages ?? 0}</span><div className="flex gap-2"><button disabled={page === 0 || loading} onClick={() => setPage(value => Math.max(0, value - 1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Önceki</button><button disabled={!result || result.last || loading} onClick={() => setPage(value => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Sonraki</button></div></div>
        </div>

        {selected && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"><div role="dialog" aria-modal="true" aria-labelledby="admin-offer-title" className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><h2 id="admin-offer-title" className="text-xl font-bold text-[#101d35]">Firma ilanı detayı</h2><p className="mt-1 text-sm text-slate-500">{selected.name} · {selected.sellerName}</p></div><button onClick={closeDetails} aria-label="Detayı kapat" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
            <div className="grid gap-5 px-6 py-6 sm:grid-cols-[180px_1fr]"><ProductImage src={sortedPhotos(selected)[0]} fallbackSrcs={sortedPhotos(selected).slice(1)} alt={selected.name} className="h-44 w-full rounded-xl sm:h-40" /><div className="grid gap-4 sm:grid-cols-2"><Detail label="Kategori / marka" value={`${selected.category} · ${selected.brand}`} /><Detail label="OEM / parça no" value={selected.oemNumber || "—"} /><Detail label="Fiyat / stok" value={`${selected.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })} · ${selected.stockQuantity} adet`} /><Detail label="Ürün durumu" value={selected.condition === "NEW" ? "Sıfır" : "İkinci el"} /><Detail label="Firma / konum" value={`${selected.sellerName} · ${selected.city}, ${selected.district}`} /><Detail label="Firma telefonu" value={selected.sellerPhone || "Belirtilmemiş"} /><Detail label="İlan durumu" value={`${statusLabels[selected.moderationStatus]} · ${selected.active ? "Aktif" : "Pasif"}`} />
                {catalog && <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-500">Ortak katalog moderasyonu</p><p className="mt-1 text-sm text-slate-700">{catalog.moderationStatus === "APPROVED" ? "Onaylandı" : catalog.moderationStatus === "PENDING" ? "Onay bekliyor" : "Reddedildi"} · {catalog.active ? "Aktif" : "Pasif"}</p>{catalog.moderationStatus === "PENDING" && <p className="mt-2 text-xs text-slate-500">Bu ilanı onaylamak ortak katalog ürününü onaylamaz. Katalog kaydı ayrı olarak incelenir.</p>}</div>}
                <div className="sm:col-span-2"><Detail label="Ürün açıklaması" value={selected.description || "Açıklama girilmemiş."} /></div><div className="sm:col-span-2"><Detail label="İlan açıklaması" value={selected.offerDescription || "Açıklama girilmemiş."} /></div>
                {sortedPhotos(selected).length > 1 && <div className="flex flex-wrap gap-3 sm:col-span-2">{sortedPhotos(selected).slice(1).map(url => <ProductImage key={url} src={url} alt={selected.name} className="h-20 w-20 rounded-lg" />)}</div>}
                {selected.rejectionReason && <div className="sm:col-span-2"><Detail label="Ret gerekçesi" value={selected.rejectionReason} /></div>}</div></div>
            {selected.moderationStatus === "PENDING" && <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end"><button onClick={() => void reviewOffer(selected, false)} disabled={actionLoading} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Reddet</button><button onClick={() => void reviewOffer(selected, true)} disabled={actionLoading} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{actionLoading ? "İşleniyor..." : "Onayla"}</button></div>}
        </div></div>}
    </section>;
}

function Detail({ label, value }: { label: string; value: string }) {
    return <div><p className="text-xs font-semibold uppercase text-slate-400">{label}</p><p className="mt-1 break-words whitespace-pre-wrap text-sm text-slate-700">{value}</p></div>;
}

export default AdminProductsPage;
