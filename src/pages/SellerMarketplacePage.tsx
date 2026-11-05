import {useEffect, useRef, useState, type FormEvent} from "react";
import {Link} from "react-router-dom";
import {Pencil} from "lucide-react";
import axios from "axios";
import marketplaceService, {type OfferView, type CatalogView, type SellerProfile} from "../services/marketplaceService";

type FormState = {
    catalogProductId: string;
    name: string;
    description: string;
    offerDescription: string;
    category: string;
    brand: string;
    oemNumber: string;
    price: string;
    stockQuantity: string;
    condition: "NEW" | "USED";
};

const empty: FormState = {
    catalogProductId: "", name: "", description: "", offerDescription: "", category: "", brand: "",
    oemNumber: "", price: "", stockQuantity: "0", condition: "NEW"
};

type Tab = "profile" | "offers";

const moderationLabels: Record<OfferView["moderationStatus"], string> = {
    PENDING: "Onay bekliyor",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi"
};

const moderationStyles: Record<OfferView["moderationStatus"], string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-800",
    APPROVED: "border-green-200 bg-green-50 text-green-700",
    REJECTED: "border-red-200 bg-red-50 text-red-700"
};

function apiErrorMessage(error: unknown): string | null {
    if (!axios.isAxiosError(error)) return null;
    const body: unknown = error.response?.data;
    if (body && typeof body === "object" && "message" in body) {
        const message = body.message;
        if (typeof message === "string" && message.trim()) return message;
    }
    return null;
}

function SellerMarketplacePage() {
    const [tab, setTab] = useState<Tab>("offers");
    const [offers, setOffers] = useState<OfferView[]>([]);
    const [catalogMatches, setCatalogMatches] = useState<CatalogView[]>([]);
    const [catalogSearch, setCatalogSearch] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [profile, setProfile] = useState<SellerProfile | null>(null);
    const [form, setForm] = useState<FormState>(empty);
    const [files, setFiles] = useState<File[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editingOffer, setEditingOffer] = useState<OfferView | null>(null);
    const photoInput = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const loadOffers = async () => {
        try {
            const page = await marketplaceService.sellerOffers();
            setOffers(page.content);
        } catch {
            setMessage("İlanlar yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadOffers();
        marketplaceService.profileMine().then(setProfile).catch(() => setMessage("Firma profili yüklenemedi."));
        Promise.all([marketplaceService.categories(), marketplaceService.brands()])
            .then(([categoryList, brandList]) => {
                setCategories(categoryList);
                setBrands(brandList);
            })
            .catch(() => setMessage("Kategori ve marka listesi yüklenemedi."));
    }, []);

    const change = (key: keyof FormState, value: string) => setForm(current => ({...current, [key]: value}));

    const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const values: Record<string, string> = {};
        data.forEach((value, key) => values[key] = String(value));
        try {
            const updated = await marketplaceService.updateProfile(values);
            setProfile(updated);
            setMessage("Firma profili güncellendi.");
        } catch {
            setMessage("Profil kaydedilemedi.");
        }
    };

    const createOffer = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (files.some(file => file.size > 5 * 1024 * 1024)) {
            setMessage("Her fotoğraf 5 MB sınırını aşmamalıdır.");
            return;
        }
        if (editingOffer && editingOffer.photos.length + files.length > 8) {
            setMessage("Bir ilana en fazla 8 fotoğraf eklenebilir.");
            return;
        }
        const price = Number(form.price);
        const stock = Number(form.stockQuantity);
        if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
            setMessage("Fiyat sıfırdan büyük, stok sıfır veya daha fazla olmalıdır.");
            return;
        }
        setBusy(true);
        try {
            const detailsChanged = editingOffer && (
                form.name !== editingOffer.name || form.category !== editingOffer.category ||
                form.brand !== editingOffer.brand || form.oemNumber !== (editingOffer.oemNumber || "") ||
                form.description !== (editingOffer.description || "")
            );
            const payload = {
                ...form,
                catalogProductId: editingOffer
                    ? (detailsChanged ? null : editingOffer.catalogProductId)
                    : (form.catalogProductId ? Number(form.catalogProductId) : null),
                price,
                stockQuantity: stock,
                vehicleCompatibilities: []
            };
            let saved: OfferView;
            try {
                saved = editingOffer
                    ? await marketplaceService.updateOffer(editingOffer.id, payload)
                    : await marketplaceService.createOffer(payload);
            } catch {
                setMessage("İlan bilgileri kaydedilemedi. Kategori ve marka seçimlerini kontrol edip tekrar deneyin.");
                return;
            }
            let photoUploadFailed = false;
            let photoUploadError: string | null = null;
            for (const file of files) {
                try {
                    await marketplaceService.uploadPhoto(saved.id, file);
                } catch (error) {
                    photoUploadFailed = true;
                    photoUploadError = apiErrorMessage(error);
                    break;
                }
            }
            setForm(empty);
            setFiles([]);
            setCatalogSearch("");
            setShowCreate(false);
            setEditingOffer(null);
            setMessage(photoUploadFailed
                ? `İlan bilgileri kaydedildi ancak fotoğraf yüklenemedi.${photoUploadError ? ` ${photoUploadError}` : " R2 S3 API loglarını kontrol edin."}`
                : editingOffer ? "İlan güncellendi." : "İlan incelemeye gönderildi.");
            await loadOffers();
        } catch {
            setMessage("İlan kaydedilemedi. Katalog ürünü, kategori ve marka seçimlerini kontrol edin.");
        } finally {
            setBusy(false);
        }
    };

    const searchCatalog = (value: string) => {
        setCatalogSearch(value);
        if (!value.trim()) {
            setCatalogMatches([]);
            return;
        }
        marketplaceService.sellerCatalog(value).then(setCatalogMatches).catch(() => setCatalogMatches([]));
    };

    const selectCatalog = (catalog: CatalogView) => {
        setForm(current => ({
            ...current,
            catalogProductId: String(catalog.id),
            name: catalog.name,
            category: catalog.category,
            brand: catalog.brand,
            oemNumber: catalog.oemNumber || "",
            description: catalog.description || ""
        }));
        setCatalogSearch(catalog.name);
        setCatalogMatches([]);
    };

    const openEdit = (offer: OfferView) => {
        setEditingOffer(offer);
        setForm({
            catalogProductId: String(offer.catalogProductId), name: offer.name,
            description: offer.description || "", offerDescription: offer.offerDescription || "",
            category: offer.category, brand: offer.brand, oemNumber: offer.oemNumber || "",
            price: String(offer.price), stockQuantity: String(offer.stockQuantity), condition: offer.condition
        });
        setFiles([]);
        setCatalogSearch(offer.name);
        setShowCreate(true);
    };

    return <main className="min-h-screen bg-slate-50">
        <header className="bg-[#101d35] p-5 text-white">
            <div className="mx-auto flex max-w-6xl justify-between"><Link to="/">YEDEKPARÇA</Link><Link to="/products">Kataloğa dön</Link></div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="text-3xl font-bold text-[#101d35]">Satıcı paneli</h1>
            <div className="mt-6 flex gap-2 border-b" role="tablist" aria-label="Satıcı yönetimi">
                <button type="button" role="tab" aria-selected={tab === "offers"} onClick={() => setTab("offers")}
                        className={`border-b-2 px-5 py-3 font-semibold ${tab === "offers" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500"}`}>
                    Ürün ilanları ({offers.length})
                </button>
                <button type="button" role="tab" aria-selected={tab === "profile"} onClick={() => setTab("profile")}
                        className={`border-b-2 px-5 py-3 font-semibold ${tab === "profile" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500"}`}>
                    Firma profili
                </button>
            </div>

            {message && <div role="status" className="mt-5 flex justify-between rounded-lg bg-amber-50 p-3 text-amber-800">
                <span>{message}</span><button type="button" onClick={() => setMessage("")} aria-label="Bildirimi kapat">×</button>
            </div>}

            {tab === "profile" && <section role="tabpanel" className="mt-6 rounded-2xl border bg-white p-6">
                <h2 className="text-xl font-bold">Firma profili</h2>
                <form key={profile?.id ?? "profile-loading"} onSubmit={saveProfile} className="mt-4 grid gap-3 sm:grid-cols-2">
                    {([ ["storeName", "Firma adı"], ["phone", "Telefon"], ["whatsappPhone", "WhatsApp numarası"], ["contactEmail", "İletişim e-postası"], ["city", "İl"], ["district", "İlçe"], ["streetAddress", "Açık adres"], ["latitude", "Enlem"], ["longitude", "Boylam"], ["websiteUrl", "Web sitesi"], ["logoUrl", "Firma logosu URL"] ] as const).map(([name, label]) =>
                        <label key={name} className="text-sm">{label}<input name={name} defaultValue={profile?.[name] ?? ""}
                            required={["storeName", "phone", "city", "district"].includes(name)}
                            className="mt-1 w-full rounded-lg border px-3 py-2" /></label>)}
                    <label className="text-sm sm:col-span-2">Çalışma saatleri (JSON)<textarea name="workingHours" defaultValue={profile?.workingHours ?? ""}
                        className="mt-1 w-full rounded-lg border px-3 py-2" placeholder='{"monday":"09:00-18:00"}' /></label>
                    <label className="text-sm sm:col-span-2">Açıklama<textarea name="description" defaultValue={profile?.description ?? ""}
                        className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <button className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white sm:col-span-2">Profili kaydet</button>
                </form>
            </section>}

            {tab === "offers" && <section role="tabpanel" className="mt-6 rounded-2xl border bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h2 className="text-xl font-bold">Ürün ilanlarım</h2><p className="mt-1 text-sm text-slate-500">İlanlarınızı ve moderasyon durumlarını yönetin.</p></div>
                    <button type="button" onClick={() => { setEditingOffer(null); setForm(empty); setFiles([]); setCatalogSearch(""); setShowCreate(true); }}
                            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">+ Yeni ürün ekle</button>
                </div>
                {loading ? <p className="mt-6 text-slate-500">İlanlar yükleniyor…</p> : offers.length === 0 ?
                    <p className="mt-6 rounded-lg bg-slate-50 p-6 text-center text-slate-500">Henüz ürün ilanınız yok. Yeni ürün ekleyerek başlayın.</p> :
                    <div className="mt-5 divide-y">{offers.map(offer => <article key={offer.id} className="flex flex-wrap justify-between gap-4 py-5">
                        <div className="flex gap-4">
                            <img src={offer.photos.find(photo => photo.primaryPhoto)?.url || offer.photos[0]?.url || offer.legacyImageUrl || "/placeholder-product.svg"}
                                 alt="" className="h-20 w-20 rounded-lg bg-slate-100 object-cover" />
                            <div><h3 className="font-semibold">{offer.name}</h3>
                                <p className="mt-1 text-sm text-slate-500">{offer.condition === "NEW" ? "Sıfır" : "İkinci el"} · {offer.price} ₺ · Stok {offer.stockQuantity}</p>
                                <span className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${moderationStyles[offer.moderationStatus]}`}>
                                    {moderationLabels[offer.moderationStatus]}
                                </span>
                                {offer.rejectionReason && <p className="mt-2 text-sm text-red-600">Ret gerekçesi: {offer.rejectionReason}</p>}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-start gap-2">
                            <button type="button" onClick={() => openEdit(offer)}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-[#101d35] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
                                <Pencil size={15} className="transition-transform group-hover:-rotate-12" /> Düzenle
                            </button>
                            {offer.photos.map(photo => <div key={photo.id} className="flex items-center gap-1 rounded border px-2 py-1">
                                <button type="button" onClick={() => void marketplaceService.reorderPhotos(offer.id, [photo.id, ...offer.photos.filter(item => item.id !== photo.id).map(item => item.id)]).then(loadOffers)} className="text-xs">
                                    {photo.primaryPhoto ? "Ana fotoğraf" : "Ana yap"}</button>
                                <button type="button" onClick={() => { if (confirm("Fotoğraf silinsin mi?")) void marketplaceService.deletePhoto(photo.id).then(loadOffers); }} className="text-xs text-red-600">Sil</button>
                            </div>)}
                        </div>
                    </article>)}</div>}
            </section>}
        </div>

        {showCreate && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 sm:p-6" onMouseDown={event => {
            if (event.target === event.currentTarget && !busy) setShowCreate(false);
        }}>
            <section role="dialog" aria-modal="true" aria-labelledby="new-offer-title" className="mx-auto my-2 w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:my-4 sm:p-7">
                <div className="flex items-start justify-between gap-4"><div><h2 id="new-offer-title" className="text-2xl font-bold">{editingOffer ? "Ürün ilanını düzenle" : "Yeni ürün ilanı"}</h2>
                    <p className="mt-1 text-sm text-slate-500">{editingOffer ? "İlan bilgilerini güncelleyin." : "Mevcut kataloğu seçin veya yeni katalog ürünü önerin."}</p></div>
                    <button type="button" onClick={() => !busy && setShowCreate(false)} className="rounded-lg px-3 py-1 text-2xl text-slate-500" aria-label="Pencereyi kapat">×</button>
                </div>
                <form onSubmit={event => void createOffer(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm sm:col-span-2">Onaylı katalogda ürün ara
                        <input value={catalogSearch} onChange={event => searchCatalog(event.target.value)} placeholder="Ürün adı, marka veya OEM"
                               className="mt-1 w-full rounded-lg border px-3 py-2" />
                        {!!catalogMatches.length && <div className="mt-2 max-h-40 overflow-auto rounded-lg border">{catalogMatches.map(catalog =>
                            <button type="button" key={catalog.id} onClick={() => selectCatalog(catalog)} className="block w-full border-b px-3 py-2 text-left text-sm last:border-0 hover:bg-orange-50">
                                {catalog.name} · {catalog.brand} · OEM {catalog.oemNumber || "—"}</button>)}</div>}
                    </label>
                    <label className="text-sm">Ürün adı<input required disabled={!!form.catalogProductId && !editingOffer} value={form.name} onChange={event => change("name", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-slate-100" /></label>
                    <label className="text-sm">OEM / parça no<input disabled={!!form.catalogProductId && !editingOffer} value={form.oemNumber} onChange={event => change("oemNumber", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 disabled:bg-slate-100" /></label>
                    <label className="text-sm">Kategori<select required disabled={!!form.catalogProductId && !editingOffer} value={form.category} onChange={event => change("category", event.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 disabled:bg-slate-100">
                        <option value="">Kategori seçin</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}
                    </select></label>
                    <label className="text-sm">Marka<select required disabled={!!form.catalogProductId && !editingOffer} value={form.brand} onChange={event => change("brand", event.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 disabled:bg-slate-100">
                        <option value="">Marka seçin</option>{brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select></label>
                    <label className="text-sm">Fiyat<input required type="number" min="0.01" step="0.01" value={form.price} onChange={event => change("price", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="text-sm">Stok<input required type="number" min="0" step="1" value={form.stockQuantity} onChange={event => change("stockQuantity", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="text-sm">Ürün durumu<select value={form.condition} onChange={event => change("condition", event.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2">
                        <option value="NEW">Sıfır</option><option value="USED">İkinci el</option>
                    </select></label>
                    <label className="text-sm sm:col-span-2">Ürün açıklaması<textarea value={form.description} onChange={event => change("description", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="text-sm sm:col-span-2">İlan açıklaması<textarea value={form.offerDescription} onChange={event => change("offerDescription", event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <div className="text-sm sm:col-span-2">
                        <span className="block font-medium">Ürün fotoğrafları <span className="font-normal text-slate-500">(JPG, PNG, WebP; en fazla 5 MB / fotoğraf)</span></span>
                        <input ref={photoInput} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => setFiles(Array.from(event.target.files ?? []))} className="hidden" />
                        <button type="button" onClick={() => photoInput.current?.click()} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1">
                            <span aria-hidden="true">＋</span> Fotoğraf seç
                        </button>
                        {files.length > 0 && <span className="ml-3 inline-block max-w-[220px] truncate align-middle text-sm text-slate-600" title={files.map(file => file.name).join(", ")}>{files.length === 1 ? files[0].name : `${files.length} fotoğraf seçildi`}</span>}
                    </div>
                    {!categories.length || !brands.length ? <p className="text-sm text-red-600 sm:col-span-2">Kategori ve marka seçenekleri yüklenemedi. Sayfayı yenileyip tekrar deneyin.</p> : null}
                    <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" disabled={busy} onClick={() => setShowCreate(false)} className="rounded-lg border px-5 py-3">Vazgeç</button>
                        <button disabled={busy || !categories.length || !brands.length} className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Kaydediliyor…" : editingOffer ? "Değişiklikleri kaydet" : "İlanı gönder"}</button></div>
                </form>
            </section>
        </div>}
    </main>;
}

export default SellerMarketplacePage;
