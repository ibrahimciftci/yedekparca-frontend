import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import productService from "../services/productService";
import type { PublicProductResponse } from "../types/api";

function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<PublicProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const response = await productService.getProduct(Number(id));
                if (mounted) setProduct(response.data);
            } catch {
                if (mounted) setError("Ürün bulunamadı veya artık yayında değil.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        void load();
        return () => { mounted = false; };
    }, [id]);

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="bg-[#101d35] px-5 py-5 text-white"><div className="mx-auto flex max-w-6xl items-center justify-between"><Link to="/" className="text-xl font-extrabold">YEDEK<span className="text-orange-500">PARÇA</span></Link><Link to="/products" className="text-sm text-slate-300 hover:text-white">Ürünlere dön</Link></div></header>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                {loading ? <div className="rounded-2xl bg-white p-12 text-center text-slate-500">Ürün yükleniyor...</div>
                    : error || !product ? <div role="alert" className="rounded-2xl bg-white p-12 text-center"><p className="text-slate-700">{error || "Ürün bulunamadı."}</p><Link to="/products" className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white">Kataloğa dön</Link></div>
                        : <article className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2"><ProductImage src={product.imageUrl} alt={product.name} className="h-72 w-full sm:h-96 lg:h-full lg:min-h-[520px]" /><div className="p-6 sm:p-10"><p className="text-sm font-semibold uppercase text-orange-600">{product.category} · {product.brand}</p><h1 className="mt-3 text-3xl font-extrabold text-[#101d35]">{product.name}</h1><p className="mt-3 text-sm text-slate-500">OEM / parça no: {product.oemNumber || "Belirtilmemiş"}</p><p className="mt-6 text-3xl font-extrabold text-[#101d35]">{product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{product.condition === "NEW" ? "Sıfır" : "İkinci el"}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">Stok: {product.stockQuantity}</span></div><div className="mt-8 border-t border-slate-100 pt-6"><h2 className="font-bold text-[#101d35]">Ürün açıklaması</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{product.description || "Açıklama eklenmemiş."}</p></div><div className="mt-7 border-t border-slate-100 pt-6"><h2 className="font-bold text-[#101d35]">Araç uyumluluğu</h2>{product.vehicleCompatibilities.length ? <ul className="mt-3 space-y-2 text-sm text-slate-600">{product.vehicleCompatibilities.map((item) => <li key={item.id ?? `${item.vehicleBrand}-${item.vehicleModel}-${item.yearFrom}`} className="rounded-lg bg-slate-50 px-4 py-3">{item.vehicleBrand} {item.vehicleModel} · {item.yearFrom}–{item.yearTo}{item.engineInfo ? ` · ${item.engineInfo}` : ""}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">Belirli araç uyumluluğu belirtilmemiş.</p>}</div><div className="mt-7 rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Satıcı</p><p className="mt-1 font-semibold text-[#101d35]">{product.sellerStoreName}</p></div></div></article>}
            </div>
        </main>
    );
}

export default ProductDetailPage;
