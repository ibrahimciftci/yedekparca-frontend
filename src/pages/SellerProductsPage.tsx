import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import ProductImage from "../components/ProductImage";
import sellerProductService from "../services/sellerProductService";
import type { ProductModerationStatus, ProductRequest, ProductResponse, ProductVehicleCompatibility } from "../types/api";

const initialForm = (): ProductRequest => ({
    name: "", description: "", category: "", brand: "", oemNumber: "", price: 0,
    stockQuantity: 0, condition: "NEW", imageUrl: "", vehicleCompatibilities: [],
});

const statusLabels: Record<ProductModerationStatus, string> = {
    PENDING: "İncelemede", APPROVED: "Onaylandı", REJECTED: "Reddedildi",
};

function SellerProductsPage() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<ProductRequest>(initialForm);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await sellerProductService.getProducts({ page, size: 10 });
            setProducts(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch {
            setError("Ürünler yüklenemedi. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { void loadProducts(); }, [loadProducts]);

    const startCreate = () => {
        setEditingId(null);
        setForm(initialForm());
        setFormOpen(true);
        setError("");
        setNotice("");
    };

    const startEdit = async (id: number) => {
        setError("");
        setNotice("");
        try {
            const response = await sellerProductService.getProduct(id);
            const product = response.data;
            setForm({
                name: product.name,
                description: product.description ?? "",
                category: product.category,
                brand: product.brand,
                oemNumber: product.oemNumber ?? "",
                price: product.price,
                stockQuantity: product.stockQuantity,
                condition: product.condition,
                imageUrl: product.imageUrl ?? "",
                vehicleCompatibilities: product.vehicleCompatibilities.map(({ vehicleBrand, vehicleModel, yearFrom, yearTo, engineInfo }) => ({ vehicleBrand, vehicleModel, yearFrom, yearTo, engineInfo })),
            });
            setEditingId(id);
            setFormOpen(true);
        } catch {
            setError("Ürün detayı alınamadı.");
        }
    };

    const updateCompatibility = (index: number, key: keyof ProductVehicleCompatibility, value: string) => {
        setForm((current) => ({
            ...current,
            vehicleCompatibilities: current.vehicleCompatibilities.map((item, itemIndex) => itemIndex === index
                ? { ...item, [key]: key === "yearFrom" || key === "yearTo" ? Number(value) : value }
                : item),
        }));
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");
        try {
            if (editingId === null) {
                await sellerProductService.createProduct(form);
                setNotice("Ürün inceleme için gönderildi.");
            } else {
                await sellerProductService.updateProduct(editingId, form);
                setNotice("Ürün güncellendi. İçerik değişiklikleri gerekiyorsa yeniden incelemeye alınır.");
            }
            setFormOpen(false);
            setEditingId(null);
            await loadProducts();
        } catch (requestError: unknown) {
            const apiMessage = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
            setError(apiMessage || "Ürün kaydedilemedi. Bilgileri kontrol edip tekrar deneyin.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link to="/" className="text-sm font-medium text-orange-600 hover:text-orange-700">← Ana sayfa</Link>
                        <h1 className="mt-3 text-2xl font-bold text-[#101d35]">Ürünlerim</h1>
                        <p className="mt-1 text-sm text-slate-500">Ürünlerinizi ve inceleme durumlarını yönetin.</p>
                    </div>
                    <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"><Plus size={18} /> Yeni ürün ekle</button>
                </div>

                {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
                {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {loading ? <div className="p-12 text-center text-slate-500">Ürünler yükleniyor...</div>
                        : products.length === 0 ? <div className="p-12 text-center"><p className="font-semibold text-[#101d35]">Henüz ürününüz yok</p><p className="mt-2 text-sm text-slate-500">İlk ürününüzü ekleyerek başlayabilirsiniz.</p></div>
                            : <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Ürün</th><th className="px-5 py-4">Kategori / Marka</th><th className="px-5 py-4">Fiyat / Stok</th><th className="px-5 py-4">Durum</th><th className="px-5 py-4">İşlem</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {products.map((product) => <tr key={product.id}>
                                            <td className="px-5 py-4"><div className="flex items-center gap-3"><ProductImage src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-lg" /><div><p className="font-semibold text-[#101d35]">{product.name}</p><p className="mt-1 text-xs text-slate-500">OEM: {product.oemNumber || "—"}</p></div></div></td>
                                            <td className="px-5 py-4 text-slate-600">{product.category}<span className="block mt-1 text-xs text-slate-400">{product.brand}</span></td>
                                            <td className="px-5 py-4 text-slate-700">{product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}<span className="block mt-1 text-xs text-slate-400">Stok: {product.stockQuantity}</span></td>
                                            <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.moderationStatus === "APPROVED" ? "bg-green-50 text-green-700" : product.moderationStatus === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{statusLabels[product.moderationStatus]}</span>{product.rejectionReason && <p className="mt-2 max-w-48 text-xs text-red-600">{product.rejectionReason}</p>}{!product.active && <p className="mt-1 text-xs text-slate-500">Pasif</p>}</td>
                                            <td className="px-5 py-4"><button onClick={() => void startEdit(product.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Düzenle</button></td>
                                        </tr>)}
                                    </tbody>
                                </table>
                            </div>}
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><span className="text-sm text-slate-500">Sayfa {totalPages ? page + 1 : 0} / {totalPages}</span><div className="flex gap-2"><button disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Önceki</button><button disabled={page + 1 >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Sonraki</button></div></div>
                </div>
            </div>

            {formOpen && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4"><div role="dialog" aria-modal="true" aria-labelledby="product-form-title" className="mx-auto my-6 max-w-3xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
                <h2 id="product-form-title" className="text-xl font-bold text-[#101d35]">{editingId === null ? "Yeni ürün" : "Ürünü düzenle"}</h2>
                <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Ürün adı"><input required maxLength={200} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} /></Field>
                        <Field label="Kategori"><input required maxLength={100} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={inputClass} /></Field>
                        <Field label="Marka"><input required maxLength={100} value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className={inputClass} /></Field>
                        <Field label="OEM / parça numarası"><input maxLength={100} value={form.oemNumber} onChange={(event) => setForm({ ...form, oemNumber: event.target.value })} className={inputClass} /></Field>
                        <Field label="Fiyat (₺)"><input type="number" min="0" step="0.01" required value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} className={inputClass} /></Field>
                        <Field label="Stok"><input type="number" min="0" step="1" required value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: Number(event.target.value) })} className={inputClass} /></Field>
                        <Field label="Ürün durumu"><select value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value as ProductRequest["condition"] })} className={inputClass}><option value="NEW">Sıfır</option><option value="USED">İkinci el</option></select></Field>
                        <Field label="Görsel URL"><input type="url" maxLength={2048} value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className={inputClass} placeholder="https://..." /></Field>
                    </div>
                    <Field label="Açıklama"><textarea maxLength={4000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} /></Field>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold text-[#101d35]">Araç uyumluluğu</h3><p className="mt-1 text-xs text-slate-500">Uyumluluk eklemek zorunlu değildir.</p></div><button type="button" onClick={() => setForm({ ...form, vehicleCompatibilities: [...form.vehicleCompatibilities, { vehicleBrand: "", vehicleModel: "", yearFrom: 2000, yearTo: 2000, engineInfo: "" }] })} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"><Plus size={15} /> Araç ekle</button></div>
                        <div className="space-y-3">{form.vehicleCompatibilities.map((item, index) => <div key={index} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-5">
                            <input required placeholder="Araç markası" value={item.vehicleBrand} onChange={(event) => updateCompatibility(index, "vehicleBrand", event.target.value)} className={inputClass} />
                            <input required placeholder="Model" value={item.vehicleModel} onChange={(event) => updateCompatibility(index, "vehicleModel", event.target.value)} className={inputClass} />
                            <input required type="number" min="1886" placeholder="İlk yıl" value={item.yearFrom} onChange={(event) => updateCompatibility(index, "yearFrom", event.target.value)} className={inputClass} />
                            <input required type="number" min="1886" placeholder="Son yıl" value={item.yearTo} onChange={(event) => updateCompatibility(index, "yearTo", event.target.value)} className={inputClass} />
                            <div className="flex gap-2"><input placeholder="Motor" value={item.engineInfo ?? ""} onChange={(event) => updateCompatibility(index, "engineInfo", event.target.value)} className={inputClass} /><button type="button" aria-label="Uyumluluğu kaldır" onClick={() => setForm({ ...form, vehicleCompatibilities: form.vehicleCompatibilities.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button></div>
                            {item.yearFrom > item.yearTo && <p className="text-xs text-red-600 sm:col-span-5">İlk yıl, son yıldan büyük olamaz.</p>}
                        </div>)}</div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => setFormOpen(false)} disabled={saving} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Vazgeç</button><button disabled={saving || form.vehicleCompatibilities.some((item) => item.yearFrom > item.yearTo)} className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Kaydediliyor..." : "Kaydet"}</button></div>
                </form>
            </div></div>}
        </main>
    );
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="block text-sm font-medium text-slate-700">{label}<span className="mt-1.5 block">{children}</span></label>;
}

export default SellerProductsPage;
