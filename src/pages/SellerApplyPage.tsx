import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import LocationPicker, { emptyLocation, type LocationSelection } from "../components/LocationPicker";
import sellerService from "../services/sellerService";
import userService from "../services/userService";
import type { SellerResponse } from "../types/api";

function SellerApplyPage() {
    const navigate = useNavigate();
    const authenticated = Boolean(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [application, setApplication] = useState<SellerResponse | null>(null);
    const [location, setLocation] = useState<LocationSelection>(emptyLocation);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [retry, setRetry] = useState(0);
    const updateLocation = useCallback((value: LocationSelection) => setLocation(value), []);

    useEffect(() => {
        if (!authenticated) return;
        let active = true;
        setLoading(true);
        setLoadError("");
        userService.getProfile().then(async response => {
            const user = response.data.data;
            if (user.role === "SELLER") { navigate("/seller/products", { replace: true }); return; }
            if (user.role === "ADMIN") { navigate("/admin", { replace: true }); return; }
            try {
                const existing = await sellerService.getMyApplication();
                if (active) setApplication(existing.data);
            } catch (err) {
                const status = axios.isAxiosError(err) ? err.response?.status : undefined;
                const message = axios.isAxiosError(err) ? String(err.response?.data?.message || "") : "";
                if (!(status === 409 && message.toLocaleLowerCase("tr-TR").includes("başvurunuz bulunamadı")) && active) {
                    setLoadError("Başvuru durumunuz kontrol edilemedi. Yeniden deneyin.");
                }
            }
        }).catch(() => { if (active) setLoadError("Kullanıcı bilgileri yüklenemedi. Yeniden deneyin."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [authenticated, navigate, retry]);

    if (!authenticated) return <Navigate to="/login?redirect=%2Fseller%2Fapply" replace />;

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(""); setSuccess("");
        if (!location.cityId || !location.districtId) { setError("Lütfen il ve ilçe seçin."); return; }
        const data = new FormData(event.currentTarget);
        const storeName = String(data.get("storeName") || "").trim();
        const phone = String(data.get("phone") || "").trim();
        const description = String(data.get("description") || "").trim();
        if (!storeName || storeName.length > 150) { setError("Firma adı 1–150 karakter olmalıdır."); return; }
        if (!/^[+0-9() -]{7,20}$/.test(phone)) { setError("Geçerli bir telefon numarası girin."); return; }
        if (description.length > 1000) { setError("Firma açıklaması en fazla 1000 karakter olabilir."); return; }
        setSaving(true);
        try {
            const response = await sellerService.apply({ storeName, phone, city: location.cityName, district: location.districtName,
                cityId: Number(location.cityId), districtId: Number(location.districtId), description });
            setApplication(response.data);
            setSuccess("Başvurunuz alındı, yönetici onayı bekleniyor.");
        } catch (err) {
            const message = axios.isAxiosError(err) ? err.response?.data?.message : null;
            setError(typeof message === "string" && message ? message : "Başvurunuz gönderilemedi. Bilgileri kontrol edip yeniden deneyin.");
        } finally { setSaving(false); }
    };

    return <main className="min-h-[70vh] bg-slate-50 px-4 py-10"><section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-600">ParçaHan satıcı ağı</span>
        <h1 className="mt-2 text-3xl font-bold text-[#101d35]">Satıcı başvurusu</h1>
        <p className="mt-2 text-slate-600">Firma bilgilerinizi gönderin. Başvurunuz yönetici tarafından incelenir.</p>
        {loading && <p role="status" className="mt-6">Başvuru durumunuz kontrol ediliyor…</p>}
        {loadError && <div role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-800"><p>{loadError}</p><button className="mt-2 underline" onClick={() => setRetry(value => value + 1)}>Yeniden dene</button></div>}
        {!loading && !loadError && application?.status === "PENDING" && <div role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><h2 className="font-bold">Başvurunuz alındı, yönetici onayı bekleniyor.</h2><p className="mt-2">{application.storeName} · {application.city} / {application.district}</p><p className="mt-1 text-sm">Başvuru tarihi: {new Date(application.appliedAt).toLocaleDateString("tr-TR")}</p></div>}
        {!loading && !loadError && application?.status === "REJECTED" && <div role="status" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-900"><h2 className="font-bold">Başvurunuz reddedildi.</h2><p className="mt-2">Gerekçe: {application.rejectionReason || "Yönetici tarafından gerekçe belirtilmedi."}</p><p className="mt-3 text-sm">Mevcut sistem kullanıcı başına tek başvuru kaydını koruyor. Yeniden değerlendirme için yöneticiyle iletişime geçin.</p></div>}
        {!loading && !loadError && !application && <form onSubmit={submit} className="mt-7 grid gap-5">
            <label className="text-sm font-semibold text-slate-700">Firma adı<input name="storeName" maxLength={150} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3" /></label>
            <label className="text-sm font-semibold text-slate-700">Telefon<input name="phone" type="tel" inputMode="tel" pattern="[+0-9() -]{7,20}" maxLength={20} required placeholder="05xx xxx xx xx" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3" /></label>
            <LocationPicker value={location} onChange={updateLocation} required />
            <label className="text-sm font-semibold text-slate-700">Firma açıklaması<textarea name="description" maxLength={1000} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3" /></label>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}
            <button disabled={saving} className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{saving ? "Gönderiliyor…" : "Başvuruyu gönder"}</button>
        </form>}
        {!loading && !loadError && application?.status === "APPROVED" && <div className="mt-6 rounded-xl bg-green-50 p-5 text-green-800"><p>Satıcı hesabınız onaylandı.</p><Link to="/seller/products" className="mt-3 inline-block font-semibold underline">Satıcı paneline git</Link></div>}
    </section></main>;
}

export default SellerApplyPage;
