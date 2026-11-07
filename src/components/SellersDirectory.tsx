import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowRight, MapPin, RotateCcw, Search, Store, X } from "lucide-react";
import { Link } from "react-router-dom";
import marketplaceService, { type PublicSeller } from "../services/marketplaceService";
import LocationPicker, { emptyLocation, type LocationSelection } from "./LocationPicker";
import type { ProductPageResponse } from "../types/api";

function SellersDirectory() {
    const [result, setResult] = useState<ProductPageResponse<PublicSeller> | null>(null);
    const [name, setName] = useState("");
    const [location, setLocation] = useState<LocationSelection>(emptyLocation);
    const [appliedName, setAppliedName] = useState("");
    const [appliedLocation, setAppliedLocation] = useState<LocationSelection>(emptyLocation);
    const [page, setPage] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [retry, setRetry] = useState(0);
    const updateLocation = useCallback((value: LocationSelection) => setLocation(value), []);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        const filters: Record<string, string | number> = { name: appliedName.trim(), page, size: 12 };
        if (appliedLocation.cityId) filters.cityId = Number(appliedLocation.cityId);
        if (appliedLocation.districtId) filters.districtId = Number(appliedLocation.districtId);
        marketplaceService.publicSellers(filters)
            .then(value => { if (active) setResult(value); })
            .catch(() => { if (active) { setResult(null); setError("Satıcılar yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin."); } })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [appliedName, appliedLocation.cityId, appliedLocation.districtId, page, retry]);

    const apply = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPage(0);
        setAppliedName(name.trim());
        setAppliedLocation(location);
    };
    const clear = () => {
        setName("");
        setLocation(emptyLocation);
        setAppliedName("");
        setAppliedLocation(emptyLocation);
        setPage(0);
    };
    const removeCity = () => {
        const next = emptyLocation;
        setLocation(next);
        setAppliedLocation(next);
        setPage(0);
    };
    const removeDistrict = () => {
        const next = { ...appliedLocation, districtId: "", districtName: "" };
        setLocation(next);
        setAppliedLocation(next);
        setPage(0);
    };
    const removeName = () => { setName(""); setAppliedName(""); setPage(0); };
    const hasFilters = Boolean(appliedName || appliedLocation.cityId || appliedLocation.districtId);

    return <div className="ph-directory">
        <form className="ph-seller-filters" onSubmit={apply}>
            <label className="ph-filter-field ph-seller-search"><span className="sr-only">Firma adına göre ara</span><Search size={19} /><input placeholder="Firma adına göre ara..." value={name} onChange={event => setName(event.target.value)} /></label>
            <div className="ph-location-fields"><LocationPicker value={location} onChange={updateLocation} /></div>
            <button type="submit" className="ph-filter-primary"><Search size={17} />Satıcıları Göster</button>
            <button type="button" className="ph-filter-reset" onClick={clear}><RotateCcw size={16} />Filtreleri Temizle</button>
        </form>

        <div className="ph-filter-summary">
            <div className="ph-active-filters"><strong>Aktif Filtreler:</strong>
                {appliedName && <button className="ph-filter-chip" onClick={removeName}>Firma: {appliedName}<X size={14} /></button>}
                {appliedLocation.cityId && <button className="ph-filter-chip" onClick={removeCity}>İl: {appliedLocation.cityName}<X size={14} /></button>}
                {appliedLocation.districtId && <button className="ph-filter-chip" onClick={removeDistrict}>İlçe: {appliedLocation.districtName}<X size={14} /></button>}
                {!hasFilters && <span className="ph-no-filters">Filtre seçilmedi</span>}
            </div>
            {!loading && !error && result && <strong className="ph-result-count">{result.totalElements} satıcı bulundu</strong>}
        </div>

        {loading && <p role="status" className="ph-state-message">Satıcılar yükleniyor…</p>}
        {error && <div role="alert" className="ph-seller-error"><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>Yeniden dene</button></div>}
        {!loading && !error && <>
            {result?.content.length ? <div className="ph-seller-list">{result.content.map(seller => <Link to={`/sellers/${seller.id}`} className="ph-seller-card" key={seller.id}>
                {seller.logoUrl ? <img src={seller.logoUrl} alt={`${seller.storeName} logosu`} /> : <span className="ph-seller-mark"><Store size={30} /></span>}
                <div className="ph-seller-card-copy"><b>{seller.storeName}</b><small><MapPin size={15} />{[seller.city, seller.district].filter(Boolean).join(" / ") || "Konum belirtilmemiş"}</small>{seller.description && <p>{seller.description}</p>}<small className="ph-seller-offers"><span aria-hidden="true">▤</span>{seller.offerCount} yayındaki ilan</small></div><ArrowRight className="ph-seller-arrow" size={22} />
            </Link>)}</div> : <div className="ph-empty-state"><Store size={30} /><p>{hasFilters ? "Bu filtrelerle eşleşen satıcı bulunamadı." : "Henüz satıcı bulunmuyor."}</p>{hasFilters && <button className="ph-filter-reset" onClick={clear}>Filtreleri temizle</button>}</div>}
            {result && result.totalPages > 1 && <div className="ph-pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Önceki</button><span>{page + 1} / {result.totalPages}</span><button disabled={result.last} onClick={() => setPage(page + 1)}>Sonraki</button></div>}
        </>}
    </div>;
}

export default SellersDirectory;
