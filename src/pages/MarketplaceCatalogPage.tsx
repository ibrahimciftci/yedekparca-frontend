import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CarFront, ChevronDown, ChevronUp, CircleDollarSign, Package, Search, SlidersHorizontal, Tag, X } from "lucide-react";
import marketplaceService, { type OfferView } from "../services/marketplaceService";
import ProductImage from "../components/ProductImage";
import DemoPhotoNotice, { isDemoImageUrl } from "../components/DemoPhotoNotice";
import PageHeading from "../components/PageHeading";
import vehicleService, { type VehicleBrand, type VehicleModel, type VehicleType } from "../services/vehicleService";
import type { ProductPageResponse } from "../types/api";

const input = "ph-catalog-control";
const pageParam = (value: string | null) => {
    if (value === null || value.trim() === "") return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
};
const photoUrls = (offers: OfferView[]) => Array.from(new Set(offers.flatMap(offer =>
    [...offer.photos].sort((a, b) => Number(b.primaryPhoto) - Number(a.primaryPhoto) || a.displayOrder - b.displayOrder)
        .map(photo => photo.url).concat(offer.legacyImageUrl)).filter((url): url is string => Boolean(url))));

const FILTER_LABELS: Record<string, string> = {
    search: "Arama", category: "Kategori", brand: "Ürün markası", oemNumber: "OEM / parça no",
    minPrice: "En düşük fiyat", maxPrice: "En yüksek fiyat", condition: "Ürün durumu",
    modelYear: "Model yılı", engineInfo: "Motor bilgisi", vehicleTypeId: "Araç türü",
    vehicleBrandId: "Araç markası", vehicleModelId: "Araç modeli",
};

function MarketplaceCatalogPage() {
    const [params, setParams] = useSearchParams();
    const [result, setResult] = useState<ProductPageResponse<OfferView> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [productBrands, setProductBrands] = useState<string[]>([]);
    const [types, setTypes] = useState<VehicleType[]>([]);
    const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [taxonomyLoading, setTaxonomyLoading] = useState(true);
    const [brandLoading, setBrandLoading] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const [taxonomyError, setTaxonomyError] = useState("");
    const [taxonomyRetry, setTaxonomyRetry] = useState(0);
    const [catalogRetry, setCatalogRetry] = useState(0);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [vehicle, setVehicle] = useState({ typeId: "", brandId: "", modelId: "" });
    const typeId = params.get("vehicleTypeId") || "";
    const brandId = params.get("vehicleBrandId") || "";
    const modelId = params.get("vehicleModelId") || "";

    useEffect(() => {
        let mounted = true;
        setTaxonomyLoading(true);
        setTaxonomyError("");
        Promise.all([marketplaceService.categories(), marketplaceService.brands(), vehicleService.types()])
            .then(([categoryList, brandList, typeList]) => {
                if (!mounted) return;
                setCategories(categoryList);
                setProductBrands(brandList);
                setTypes(typeList);
            })
            .catch(() => { if (mounted) setTaxonomyError("Kategori, ürün markası veya araç türü seçenekleri yüklenemedi."); })
            .finally(() => { if (mounted) setTaxonomyLoading(false); });
        return () => { mounted = false; };
    }, [taxonomyRetry]);

    useEffect(() => {
        setVehicle({ typeId, brandId, modelId });
    }, [typeId, brandId, modelId]);

    useEffect(() => {
        let mounted = true;
        setBrandLoading(true);
        setVehicleBrands([]);
        vehicleService.brands(vehicle.typeId ? Number(vehicle.typeId) : undefined)
            .then(items => { if (mounted) { setVehicleBrands(items); setTaxonomyError(""); } })
            .catch(() => { if (mounted) setTaxonomyError("Araç markaları yüklenemedi."); })
            .finally(() => { if (mounted) setBrandLoading(false); });
        return () => { mounted = false; };
    }, [vehicle.typeId, taxonomyRetry]);

    useEffect(() => {
        let mounted = true;
        setModels([]);
        if (!vehicle.brandId) { setModelLoading(false); return () => { mounted = false; }; }
        setModelLoading(true);
        vehicleService.models(Number(vehicle.brandId), vehicle.typeId ? Number(vehicle.typeId) : undefined)
            .then(items => { if (mounted) { setModels(items); setTaxonomyError(""); } })
            .catch(() => { if (mounted) setTaxonomyError("Seçilen araç markasının modelleri yüklenemedi."); })
            .finally(() => { if (mounted) setModelLoading(false); });
        return () => { mounted = false; };
    }, [vehicle.brandId, vehicle.typeId, taxonomyRetry]);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError("");
        const filters: Record<string, string> = {};
        params.forEach((value, key) => { if (key !== "page") filters[key] = value; });
        marketplaceService.offers(filters, pageParam(params.get("page")))
            .then(page => { if (mounted) setResult(page); })
            .catch(() => { if (mounted) setError("Ürünler yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin."); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [params, catalogRetry]);

    const activeFilters: [string, string][] = [];
    params.forEach((value, key) => { if (key !== "page") activeFilters.push([key, value]); });
    const advancedKeys = ["brand", "oemNumber", "minPrice", "maxPrice", "vehicleTypeId", "modelYear", "engineInfo"];
    const activeAdvancedCount = activeFilters.filter(([key]) => advancedKeys.includes(key)).length;
    const optionLabels: Record<string, Record<string, string>> = {
        category: Object.fromEntries(categories.map(value => [value, value])),
        brand: Object.fromEntries(productBrands.map(value => [value, value])),
        vehicleTypeId: Object.fromEntries(types.map(value => [String(value.id), value.name])),
        vehicleBrandId: Object.fromEntries(vehicleBrands.map(value => [String(value.id), value.name])),
        vehicleModelId: Object.fromEntries(models.map(value => [String(value.id), value.name])),
        condition: { NEW: "Sıfır", USED: "İkinci el" },
    };
    const displayFilter = (key: string, value: string) => `${FILTER_LABELS[key] || key}: ${optionLabels[key]?.[value] || value}`;
    const demoPhotoUrls = result?.content.flatMap(offer => photoUrls([offer])).filter(isDemoImageUrl) ?? [];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const next = new URLSearchParams();
        new FormData(event.currentTarget).forEach((value, key) => {
            const text = String(value).trim();
            if (text) next.set(key, text);
        });
        if (vehicle.typeId) next.set("vehicleTypeId", vehicle.typeId);
        if (vehicle.brandId) next.set("vehicleBrandId", vehicle.brandId);
        if (vehicle.modelId) next.set("vehicleModelId", vehicle.modelId);
        setParams(next);
    };

    const removeFilter = (removedKey: string) => setParams(current => {
        const next = new URLSearchParams(current);
        next.delete(removedKey);
        next.delete("page");
        if (removedKey === "vehicleTypeId") { next.delete("vehicleBrandId"); next.delete("vehicleModelId"); }
        if (removedKey === "vehicleBrandId") next.delete("vehicleModelId");
        return next;
    });
    const clearFilters = () => setParams(new URLSearchParams());
    const changePage = (nextPage: number) => setParams(current => {
        const next = new URLSearchParams(current);
        const safeNextPage = Number.isFinite(nextPage) ? Math.max(0, Math.floor(nextPage)) : 0;
        if (safeNextPage <= 0) next.delete("page"); else next.set("page", String(safeNextPage));
        return next;
    });

    return <main className="ph-catalog-page">
        <section className="ph-page-shell">
            <PageHeading icon={Package} title="Ürünler" description="Yedek parça, aksesuar ve otomotiv ürünlerini keşfedin." />
            <DemoPhotoNotice urls={demoPhotoUrls} />

            <form key={params.toString()} onSubmit={submit} className="ph-catalog-filter-panel">
                <div className="ph-catalog-main-filters">
                    <label className="ph-catalog-search"><span className="sr-only">Ürün adı, OEM veya parça numarası ara</span><Search size={19} /><input name="search" defaultValue={params.get("search") || ""} placeholder="Ürün adı, OEM veya parça numarası ara..." /></label>
                    <label className="ph-select-field"><Tag size={17} /><span className="sr-only">Kategori</span><select name="category" defaultValue={params.get("category") || ""} disabled={taxonomyLoading || !categories.length}><option value="">{taxonomyLoading ? "Yükleniyor…" : "Tüm kategoriler"}</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
                    <label className="ph-select-field"><CarFront size={18} /><span className="sr-only">Araç markası</span><select value={vehicle.brandId} disabled={brandLoading || !vehicleBrands.length} onChange={event => setVehicle(value => ({ ...value, brandId: event.target.value, modelId: "" }))}><option value="">{brandLoading ? "Markalar yükleniyor…" : "Tüm markalar"}</option>{vehicleBrands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
                    <label className="ph-select-field"><CarFront size={18} /><span className="sr-only">Araç modeli</span><select value={vehicle.modelId} disabled={!vehicle.brandId || modelLoading} onChange={event => setVehicle(value => ({ ...value, modelId: event.target.value }))}><option value="">{!vehicle.brandId ? "Tüm modeller" : modelLoading ? "Modeller yükleniyor…" : "Tüm modeller"}</option>{models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
                    <label className="ph-select-field"><Tag size={17} /><span className="sr-only">Ürün durumu</span><select name="condition" defaultValue={params.get("condition") || ""}><option value="">Tümü</option><option value="NEW">Sıfır</option><option value="USED">İkinci el</option></select></label>
                    <button className="ph-filter-primary" type="submit"><Search size={18} />Ara</button>
                </div>

                <div className="ph-advanced-wrap">
                    <button type="button" className="ph-advanced-toggle" aria-expanded={advancedOpen} onClick={() => setAdvancedOpen(open => !open)}>
                        <SlidersHorizontal size={17} /><strong>Gelişmiş Filtreler ({activeAdvancedCount})</strong>{advancedOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {advancedOpen && <div className="ph-advanced-grid">
                        <label>Ürün markası<select name="brand" defaultValue={params.get("brand") || ""} disabled={taxonomyLoading || !productBrands.length} className={input}><option value="">Tüm markalar</option>{productBrands.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
                        <label>OEM / Parça No<input name="oemNumber" defaultValue={params.get("oemNumber") || ""} placeholder="OEM veya parça no..." className={input} /></label>
                        <label>Fiyat aralığı<span className="ph-price-range"><input name="minPrice" type="number" min="0" step="0.01" defaultValue={params.get("minPrice") || ""} placeholder="Min ₺" className={input} /><input name="maxPrice" type="number" min="0" step="0.01" defaultValue={params.get("maxPrice") || ""} placeholder="Max ₺" className={input} /></span></label>
                        <label>Araç türü<select name="vehicleTypeId" value={vehicle.typeId} onChange={event => setVehicle({ typeId: event.target.value, brandId: "", modelId: "" })} disabled={taxonomyLoading || !types.length} className={input}><option value="">Tüm türler</option>{types.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
                        <label>Model yılı<input name="modelYear" type="number" min="1886" max="2100" defaultValue={params.get("modelYear") || ""} placeholder="Örn. 2020" className={input} /></label>
                        <label>Motor bilgisi<input name="engineInfo" defaultValue={params.get("engineInfo") || ""} placeholder="Motor bilgisi..." className={input} /></label>
                    </div>}
                </div>
                {taxonomyError && <div role="alert" className="ph-taxonomy-error"><span>{taxonomyError}</span><button type="button" onClick={() => setTaxonomyRetry(value => value + 1)}>Yeniden dene</button></div>}
            </form>

            <div className="ph-filter-summary">
                <div className="ph-active-filters"><strong>Aktif Filtreler:</strong>
                    {activeFilters.length ? activeFilters.map(([key, value]) => <button key={key} className="ph-filter-chip" type="button" onClick={() => removeFilter(key)}>{displayFilter(key, value)}<X size={14} /></button>) : <span className="ph-no-filters">Filtre seçilmedi</span>}
                    {activeFilters.length > 0 && <button type="button" className="ph-clear-chips" onClick={clearFilters}>Tümünü Temizle <X size={14} /></button>}
                </div>
                {!loading && !error && result && <strong className="ph-result-count">{result.totalElements} ürün bulundu</strong>}
            </div>

            {loading ? <p role="status" className="ph-state-message">Ürünler yükleniyor…</p> : error ? <div role="alert" className="ph-catalog-error"><p>{error}</p><button onClick={() => setCatalogRetry(value => value + 1)}>Yeniden dene</button></div> : !result?.content.length ?
                <div className="ph-empty-state"><Package size={31} /><p>Eşleşen ürün bulunamadı.</p>{activeFilters.length > 0 && <button className="ph-filter-reset" onClick={clearFilters}>Filtreleri temizle</button>}</div> : <>
                    <div className="ph-catalog-grid">{result.content.map(offer => {
                        const photos = photoUrls([offer]);
                        return <article key={offer.id} className="ph-catalog-card">
                            <Link to={`/offers/${offer.id}`} className="block">
                            <div className="ph-catalog-card-image"><ProductImage src={photos[0]} fallbackSrcs={photos.slice(1)} alt={offer.name} className="h-full w-full" /></div>
                            <div className="ph-catalog-card-body"><p className="ph-catalog-eyebrow">{offer.brand} <span>·</span> {offer.category}</p><h2>{offer.name}</h2>
                                {offer.oemNumber && <p className="ph-catalog-oem">OEM: {offer.oemNumber}</p>}
                                <div className="ph-catalog-card-meta"><span>{offer.sellerName}</span><span>{offer.condition === "NEW" ? "Sıfır" : "İkinci el"}</span></div>
                                <div className="ph-catalog-price"><CircleDollarSign size={19} /><strong>{offer.price.toLocaleString("tr-TR")} ₺</strong><small>{offer.stockQuantity > 0 ? `Stokta: ${offer.stockQuantity}` : "Stokta yok"}</small></div>
                                <span className="ph-catalog-detail-link">İlan detayını gör <ArrowRightIcon /></span>
                            </div>
                            </Link>
                            <div className="px-5 pb-4 text-sm text-slate-500">{offer.city}{offer.district ? `, ${offer.district}` : ""}</div>
                        </article>;
                    })}</div>
                    {result.totalPages > 1 && <div className="ph-pagination"><button disabled={(result.page ?? 0) <= 0 || loading} onClick={() => changePage((result.page ?? 0) - 1)}>Önceki</button><span>Sayfa {(result.page ?? 0) + 1} / {result.totalPages}</span><button disabled={result.last || (result.page ?? 0) >= result.totalPages - 1 || loading} onClick={() => changePage((result.page ?? 0) + 1)}>Sonraki</button></div>}
                </>}
        </section>
    </main>;
}

function ArrowRightIcon() { return <span aria-hidden="true">→</span>; }

export default MarketplaceCatalogPage;
