import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Heart, PackageOpen } from "lucide-react";
import marketplaceService, { type CatalogView, type OfferView } from "../services/marketplaceService";
import ProductImage from "../components/ProductImage";
import VehiclePicker, { type VehicleSelection } from "../components/VehiclePicker";
import vehicleService from "../services/vehicleService";
import type { ProductPageResponse } from "../types/api";

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const imageCandidates = (offers: OfferView[]) => Array.from(new Set(offers.flatMap(offer =>
    [...offer.photos].sort((a, b) => Number(b.primaryPhoto) - Number(a.primaryPhoto) || a.displayOrder - b.displayOrder)
        .map(photo => photo.url).concat(offer.legacyImageUrl)).filter((url): url is string => Boolean(url))));

function MarketplaceCatalogPage() {
    const [params, setParams] = useSearchParams();
    const [result, setResult] = useState<ProductPageResponse<CatalogView> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [taxonomyLoading, setTaxonomyLoading] = useState(true);
    const [taxonomyError, setTaxonomyError] = useState("");
    const [vehicle, setVehicle] = useState<VehicleSelection>({ typeId: "", brandId: "", modelId: "" });

    useEffect(() => {
        let mounted = true;
        setTaxonomyLoading(true);
        Promise.all([marketplaceService.categories(), marketplaceService.brands(), vehicleService.types()])
            .then(([categoryList, brandList]) => {
                if (!mounted) return;
                setCategories(categoryList);
                setBrands(brandList);
                setTaxonomyError("");
            })
            .catch(() => { if (mounted) setTaxonomyError("Kategori, marka veya araç seçenekleri yüklenemedi."); })
            .finally(() => { if (mounted) setTaxonomyLoading(false); });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        setVehicle({
            typeId: params.get("vehicleTypeId") || "",
            brandId: params.get("vehicleBrandId") || "",
            modelId: params.get("vehicleModelId") || "",
        });
    }, [params]);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError("");
        const filters: Record<string, string> = {};
        params.forEach((value, key) => { if (key !== "page") filters[key] = value; });
        marketplaceService.catalog(filters, Number(params.get("page") || 0))
            .then(page => { if (mounted) setResult(page); })
            .catch(() => { if (mounted) setError("Ürünler yüklenemedi."); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [params]);

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

    const changePage = (nextPage: number) => setParams(current => {
        const next = new URLSearchParams(current);
        if (nextPage <= 0) next.delete("page");
        else next.set("page", String(nextPage));
        return next;
    });

    return <main className="min-h-screen bg-slate-50">
        <header className="bg-[#101d35] p-5 text-white"><div className="mx-auto flex max-w-7xl justify-between"><Link to="/" className="font-bold">YEDEKPARÇA</Link><Link to="/favorites">Favorilerim</Link></div></header>
        <section className="mx-auto max-w-7xl px-4 py-8">
            <h1 className="text-3xl font-bold text-[#101d35]">Ürün kataloğu ve firma fiyatları</h1>
            <p className="mt-2 text-slate-500">Aynı parçayı listeleyen firmaların fiyatlarını karşılaştırın.</p>
            <form onSubmit={submit} className="my-6 rounded-2xl border bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input name="search" defaultValue={params.get("search") || ""} placeholder="Ürün, marka veya OEM ara" className={input} />
                    <select name="category" defaultValue={params.get("category") || ""} disabled={taxonomyLoading || !categories.length} className={input}>
                        <option value="">{taxonomyLoading ? "Kategoriler yükleniyor…" : "Tüm kategoriler"}</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <select name="brand" defaultValue={params.get("brand") || ""} disabled={taxonomyLoading || !brands.length} className={input}>
                        <option value="">{taxonomyLoading ? "Ürün markaları yükleniyor…" : "Tüm ürün markaları"}</option>{brands.map(value => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <input name="oemNumber" defaultValue={params.get("oemNumber") || ""} placeholder="OEM / parça no" className={input} />
                    <input name="minPrice" type="number" min="0" step="0.01" defaultValue={params.get("minPrice") || ""} placeholder="En düşük fiyat" className={input} />
                    <input name="maxPrice" type="number" min="0" step="0.01" defaultValue={params.get("maxPrice") || ""} placeholder="En yüksek fiyat" className={input} />
                    <select name="condition" defaultValue={params.get("condition") || ""} className={input}><option value="">Sıfır / ikinci el</option><option value="NEW">Sıfır</option><option value="USED">İkinci el</option></select>
                    <input name="modelYear" type="number" min="1886" defaultValue={params.get("modelYear") || ""} placeholder="Model yılı" className={input} />
                    <input name="engineInfo" defaultValue={params.get("engineInfo") || ""} placeholder="Motor bilgisi" className={input} />
                    <div className="sm:col-span-2 lg:col-span-4"><VehiclePicker value={vehicle} onChange={setVehicle} />
                        <a href="https://vehiclesdb.com" target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-slate-500 underline">Vehicle data by VehiclesDB</a>
                    </div>
                    {taxonomyError && <p role="alert" className="text-sm text-red-600 sm:col-span-2 lg:col-span-4">{taxonomyError}</p>}
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white"><Search size={17} />Filtrele</button>
                </div>
            </form>
            {loading ? <p>Ürünler yükleniyor…</p> : error ? <p role="alert" className="text-red-600">{error}</p> : !result?.content.length ?
                <div className="rounded-2xl bg-white p-10 text-center"><PackageOpen className="mx-auto text-slate-400" /><p className="mt-3">Eşleşen ürün bulunamadı.</p></div> : <>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.content.map(product => {
                        const photos = imageCandidates(product.offers);
                        return <article key={product.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                            <ProductImage src={photos[0]} fallbackSrcs={photos.slice(1)} alt={product.name} className="mb-4 h-40 w-full rounded-xl" />
                            <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase text-orange-600">{product.brand} · {product.category}</p><h2 className="mt-2 text-lg font-bold text-[#101d35]">{product.name}</h2></div><button aria-label="Favoriye ekle" onClick={() => marketplaceService.favorite(product.id).catch(() => location.assign("/login"))} className="rounded-full border p-2 text-rose-500"><Heart size={18} /></button></div>
                            <p className="mt-4 text-sm text-slate-500">{product.offers.length} firma teklifi</p>
                            <p className="mt-1 text-2xl font-bold">{product.offers.length ? `${Math.min(...product.offers.map(offer => offer.price)).toLocaleString("tr-TR")} ₺` : "Teklif yok"}<span className="ml-2 text-sm font-normal text-slate-500">başlayan fiyat</span></p>
                            <Link to={`/catalog/${product.id}`} className="mt-5 block rounded-lg bg-[#101d35] px-4 py-3 text-center text-sm font-semibold text-white">Fiyatları karşılaştır</Link>
                        </article>;
                    })}</div>
                    <div className="mt-6 flex justify-between"><button disabled={result.page <= 0} onClick={() => changePage(result.page - 1)} className="rounded border bg-white px-4 py-2 disabled:opacity-40">Önceki</button><span>Sayfa {result.page + 1} / {result.totalPages}</span><button disabled={result.last} onClick={() => changePage(result.page + 1)} className="rounded border bg-white px-4 py-2 disabled:opacity-40">Sonraki</button></div>
                </>}
        </section>
    </main>;
}

export default MarketplaceCatalogPage;
