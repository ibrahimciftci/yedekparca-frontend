import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Store } from "lucide-react";
import { Link } from "react-router-dom";
import marketplaceService, { type PublicSeller } from "../services/marketplaceService";
import LocationPicker, { emptyLocation, type LocationSelection } from "./LocationPicker";
import type { ProductPageResponse } from "../types/api";

function SellersDirectory() {
    const [result, setResult] = useState<ProductPageResponse<PublicSeller> | null>(null);
    const [name, setName] = useState("");
    const [location, setLocation] = useState<LocationSelection>(emptyLocation);
    const [page, setPage] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [retry, setRetry] = useState(0);
    const updateLocation = useCallback((value: LocationSelection) => setLocation(value), []);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        const filters: Record<string, string | number> = { name: name.trim(), page, size: 12 };
        if (location.cityId) filters.cityId = Number(location.cityId);
        if (location.districtId) filters.districtId = Number(location.districtId);
        marketplaceService.publicSellers(filters).then(value => { if (active) setResult(value); })
            .catch(() => { if (active) { setResult(null); setError("Satıcılar yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin."); } })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [name, location.cityId, location.districtId, page, retry]);

    const reset = () => { setName(""); setLocation(emptyLocation); setPage(0); };
    return <>
        <div className="ph-seller-filters">
            <input placeholder="Firma adına göre ara" value={name} onChange={event => { setName(event.target.value); setPage(0); }} />
            <LocationPicker value={location} onChange={updateLocation} />
            <button type="button" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm" onClick={reset}>Filtreleri temizle</button>
        </div>
        {loading && <p role="status">Satıcılar yükleniyor…</p>}
        {error && <div role="alert" className="ph-seller-error"><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>Yeniden dene</button></div>}
        {!loading && !error && <>
            <div className="ph-seller-list">{result?.content.map(seller => <Link to={`/sellers/${seller.id}`} className="ph-seller-card" key={seller.id}>
                {seller.logoUrl ? <img src={seller.logoUrl} alt={`${seller.storeName} logosu`} /> : <span className="ph-seller-mark"><Store /></span>}
                <div><b>{seller.storeName}</b><small>{seller.city} · {seller.district}</small>{seller.description && <p>{seller.description}</p>}<small>{seller.offerCount} yayındaki ilan</small></div><ArrowRight />
            </Link>)}</div>
            {result?.totalElements === 0 && <p>{name || location.cityId || location.districtId ? "Bu kriterlere uygun onaylı satıcı bulunamadı." : "Henüz satıcı bulunmuyor."}</p>}
            {result && result.totalPages > 1 && <div className="ph-pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Önceki</button><span>{page + 1} / {result.totalPages}</span><button disabled={result.last} onClick={() => setPage(page + 1)}>Sonraki</button></div>}
        </>}
    </>;
}

export default SellersDirectory;
