import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import productService from "../services/productService";
import type { ProductCatalogFilters } from "../services/productService";
import type { ProductCondition, ProductPageResponse, PublicProductResponse } from "../types/api";

const initialFilters = (params: URLSearchParams): ProductCatalogFilters => ({
    search: params.get("search") || "",
    category: params.get("category") || "",
    brand: "",
    oemNumber: "",
    minPrice: undefined,
    maxPrice: undefined,
    condition: undefined,
    vehicleBrand: "",
    vehicleModel: "",
    modelYear: undefined,
    engineInfo: "",
    sortBy: "createdAt",
    direction: "desc",
});

function ProductCatalogPage() {
    const [urlParams, setUrlParams] = useSearchParams();
    const [filters, setFilters] = useState<ProductCatalogFilters>(() => initialFilters(urlParams));
    const [searchInput, setSearchInput] = useState(filters.search ?? "");
    const [categoryInput, setCategoryInput] = useState(filters.category ?? "");
    const [result, setResult] = useState<ProductPageResponse<PublicProductResponse> | null>(null);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await productService.getProducts({ ...filters, page, size: 12 });
            setResult(response.data);
        } catch {
            setError("Ürünler yüklenemedi. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => { void loadProducts(); }, [loadProducts]);

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const next: ProductCatalogFilters = {
            search: searchInput.trim(),
            category: categoryInput.trim(),
            brand: String(data.get("brand") ?? "").trim(),
            oemNumber: String(data.get("oemNumber") ?? "").trim(),
            minPrice: String(data.get("minPrice") ?? "") ? Number(data.get("minPrice")) : undefined,
            maxPrice: String(data.get("maxPrice") ?? "") ? Number(data.get("maxPrice")) : undefined,
            condition: (String(data.get("condition") ?? "") || undefined) as ProductCondition | undefined,
            vehicleBrand: String(data.get("vehicleBrand") ?? "").trim(),
            vehicleModel: String(data.get("vehicleModel") ?? "").trim(),
            modelYear: String(data.get("modelYear") ?? "") ? Number(data.get("modelYear")) : undefined,
            engineInfo: String(data.get("engineInfo") ?? "").trim(),
            sortBy: String(data.get("sortBy") ?? "createdAt") as ProductCatalogFilters["sortBy"],
            direction: String(data.get("direction") ?? "desc") as ProductCatalogFilters["direction"],
        };
        setFilters(next);
        setPage(0);
        const params = new URLSearchParams();
        if (next.search) params.set("search", next.search);
        if (next.category) params.set("category", next.category);
        setUrlParams(params);
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="bg-[#101d35] px-5 py-5 text-white"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link to="/" className="text-xl font-extrabold">YEDEK<span className="text-orange-500">PARÇA</span></Link><Link to="/" className="text-sm text-slate-300 hover:text-white">Ana sayfa</Link></div></header>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="mb-7"><h1 className="text-3xl font-bold text-[#101d35]">Yedek Parçalar</h1><p className="mt-2 text-slate-500">Aracınıza uygun parçaları arayın ve filtreleyin.</p></div>
                <form onSubmit={submitFilters} className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Ürün adı veya marka" className={inputClass} />
                        <input value={categoryInput} onChange={(event) => setCategoryInput(event.target.value)} placeholder="Kategori" className={inputClass} />
                        <input name="brand" defaultValue={filters.brand} placeholder="Ürün markası" className={inputClass} />
                        <input name="oemNumber" defaultValue={filters.oemNumber} placeholder="OEM / parça no" className={inputClass} />
                        <input name="minPrice" type="number" min="0" step="0.01" defaultValue={filters.minPrice} placeholder="Min. fiyat" className={inputClass} />
                        <input name="maxPrice" type="number" min="0" step="0.01" defaultValue={filters.maxPrice} placeholder="Maks. fiyat" className={inputClass} />
                        <select name="condition" defaultValue={filters.condition ?? ""} className={inputClass}><option value="">Sıfır / ikinci el</option><option value="NEW">Sıfır</option><option value="USED">İkinci el</option></select>
                        <input name="vehicleBrand" defaultValue={filters.vehicleBrand} placeholder="Araç markası" className={inputClass} />
                        <input name="vehicleModel" defaultValue={filters.vehicleModel} placeholder="Araç modeli" className={inputClass} />
                        <input name="modelYear" type="number" min="1886" defaultValue={filters.modelYear} placeholder="Model yılı" className={inputClass} />
                        <input name="engineInfo" defaultValue={filters.engineInfo} placeholder="Motor bilgisi" className={inputClass} />
                        <div className="flex gap-2"><select name="sortBy" defaultValue={filters.sortBy} className={`${inputClass} min-w-0`}><option value="createdAt">Tarihe göre</option><option value="price">Fiyata göre</option><option value="name">Ada göre</option></select><select name="direction" defaultValue={filters.direction} className={`${inputClass} min-w-0`}><option value="desc">Azalan</option><option value="asc">Artan</option></select></div>
                    </div>
                    <div className="mt-4 flex justify-end"><button className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600">Filtrele</button></div>
                </form>

                {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
                {loading ? <div className="rounded-2xl bg-white p-12 text-center text-slate-500">Ürünler yükleniyor...</div>
                    : !result?.content.length ? <div className="rounded-2xl bg-white p-12 text-center"><p className="font-semibold text-[#101d35]">Ürün bulunamadı</p><p className="mt-2 text-sm text-slate-500">Filtrelerinizi değiştirip tekrar deneyin.</p></div>
                        : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{result.content.map((product) => <Link key={product.id} to={`/products/${product.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><ProductImage src={product.imageUrl} alt={product.name} className="h-48 w-full transition group-hover:scale-[1.02]" /><div className="p-5"><p className="text-xs font-semibold uppercase text-orange-600">{product.category} · {product.brand}</p><h2 className="mt-2 line-clamp-2 font-bold text-[#101d35]">{product.name}</h2><p className="mt-2 text-xs text-slate-500">OEM: {product.oemNumber || "—"}</p><div className="mt-4 flex items-end justify-between"><span className="text-lg font-extrabold text-[#101d35]">{product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span><span className="text-xs text-slate-500">{product.condition === "NEW" ? "Sıfır" : "İkinci el"}</span></div><p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">Satıcı: {product.sellerStoreName}</p></div></Link>)}</div>}

                <div className="mt-6 flex items-center justify-between"><span className="text-sm text-slate-500">Toplam {result?.totalElements ?? 0} ürün · Sayfa {result && result.totalPages > 0 ? result.page + 1 : 0} / {result?.totalPages ?? 0}</span><div className="flex gap-2"><button disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40">Önceki</button><button disabled={!result || result.last || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40">Sonraki</button></div></div>
            </div>
        </main>
    );
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-orange-500";

export default ProductCatalogPage;
