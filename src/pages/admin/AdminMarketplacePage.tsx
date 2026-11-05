import {useEffect, useState} from "react";
import marketplaceService, {type CatalogView, type OfferView, type SellerProfile} from "../../services/marketplaceService";

type Tab = "offers" | "catalog" | "complaints";
type Complaint = {id:number;sellerName:string;category:string;description:string;status:string;sellerId:number;offerId:number|null;createdAt:string};

function AdminMarketplacePage() {
    const [tab, setTab] = useState<Tab>("offers");
    const [catalogStatus, setCatalogStatus] = useState("PENDING");
    const [offerStatus, setOfferStatus] = useState("PENDING");
    const [offers, setOffers] = useState<OfferView[]>([]);
    const [catalog, setCatalog] = useState<CatalogView[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [offerDetail, setOfferDetail] = useState<OfferView | null>(null);
    const [catalogDetail, setCatalogDetail] = useState<CatalogView | null>(null);
    const [linkedCatalogDetail, setLinkedCatalogDetail] = useState<CatalogView | null>(null);
    const [profile, setProfile] = useState<SellerProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            if (tab === "complaints") {
                const page = await marketplaceService.complaints();
                setComplaints(page.content);
            } else if (tab === "catalog") {
                const page = await marketplaceService.adminCatalog(catalogStatus || undefined);
                setCatalog(page.content);
            } else {
                const page = await marketplaceService.adminOffers(offerStatus || undefined);
                setOffers(page.content);
            }
        } catch {
            setError(tab === "complaints" ? "Şikâyetler yüklenemedi." : tab === "catalog" ? "Katalog yüklenemedi." : "Bekleyen firma ilanları yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, [tab, catalogStatus, offerStatus]);

    const reviewOffer = async (offer: OfferView, approve: boolean) => {
        if (!confirm(approve ? `“${offer.name}” ilanı onaylansın mı?` : `“${offer.name}” ilanı reddedilsin mi?`)) return;
        const reason = approve ? undefined : prompt("Ret gerekçesi (zorunlu)")?.trim();
        if (!approve && !reason) return;
        try {
            await marketplaceService.reviewOffer(offer.id, approve, reason);
            setOfferDetail(null);
            await load();
        } catch {
            setError("İlan moderasyonu tamamlanamadı.");
        }
    };

    const reviewCatalog = async (item: CatalogView, approve: boolean) => {
        if (!confirm(approve ? `“${item.name}” katalog kaydı onaylansın mı?` : `“${item.name}” katalog kaydı reddedilsin mi?`)) return;
        const reason = approve ? undefined : prompt("Ret gerekçesi (zorunlu)")?.trim();
        if (!approve && !reason) return;
        try {
            await marketplaceService.reviewCatalog(item.id, approve, reason);
            setCatalogDetail(null);
            await load();
        } catch {
            setError("Katalog moderasyonu tamamlanamadı.");
        }
    };

    const openOffer = async (id:number) => {
        try {
            const offer = await marketplaceService.adminOfferDetail(id);
            setOfferDetail(offer);
            setLinkedCatalogDetail(await marketplaceService.adminCatalogDetail(offer.catalogProductId));
        }
        catch { setError("İlan detayı yüklenemedi."); }
    };

    const openCatalog = async (id:number) => {
        try { setCatalogDetail(await marketplaceService.adminCatalogDetail(id)); }
        catch { setError("Katalog detayı yüklenemedi."); }
    };

    return <section className="space-y-5">
        {profile && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4" onMouseDown={event => {if(event.target===event.currentTarget)setProfile(null);}}>
            <article className="mx-auto my-8 w-full max-w-lg rounded-2xl bg-white p-6">
                <button className="float-right rounded-lg border px-3 py-1.5" onClick={()=>setProfile(null)}>Kapat</button>
                <h2 className="text-xl font-bold">{profile.storeName}</h2><p className="mt-2">{profile.city}, {profile.district} {profile.streetAddress}</p>
                <p>{profile.phone} · {profile.contactEmail}</p><p className="mt-2">{profile.description}</p>
                {profile.logoUrl&&<img src={profile.logoUrl} alt="Firma logosu" className="mt-3 h-16 w-16 rounded object-cover"/>}
            </article>
        </div>}

        {(offerDetail || catalogDetail) && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4" onMouseDown={event => {if(event.target===event.currentTarget){setOfferDetail(null);setCatalogDetail(null);setLinkedCatalogDetail(null);}}}>
            <article role="dialog" aria-modal="true" className="mx-auto my-5 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-orange-600">{offerDetail ? "Firma ilanı" : "Ortak katalog ürünü"}</p><h2 className="mt-1 text-2xl font-bold">{offerDetail?.name || catalogDetail?.name}</h2></div>
                    <button onClick={()=>{setOfferDetail(null);setCatalogDetail(null);setLinkedCatalogDetail(null);}} className="rounded-lg border px-3 py-1.5">Kapat</button></div>
                {offerDetail && <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Detail label="Kategori / marka" value={`${offerDetail.category} · ${offerDetail.brand}`} />
                    <Detail label="OEM / parça no" value={offerDetail.oemNumber || "—"} />
                    <Detail label="Fiyat / stok" value={`${offerDetail.price.toLocaleString("tr-TR")} ₺ · ${offerDetail.stockQuantity}`} />
                    <Detail label="Ürün durumu" value={offerDetail.condition === "NEW" ? "Sıfır" : "İkinci el"} />
                    <Detail label="Firma" value={`${offerDetail.sellerName} · ${offerDetail.city}, ${offerDetail.district}`} />
                    <Detail label="Firma telefonu" value={offerDetail.sellerPhone} />
                    {linkedCatalogDetail && <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="font-semibold text-amber-900">Katalog durumu: {linkedCatalogDetail.moderationStatus === "APPROVED" ? "Onaylı" : linkedCatalogDetail.moderationStatus === "PENDING" ? "Onay bekliyor" : "Reddedildi"}</p>
                        {linkedCatalogDetail.moderationStatus === "PENDING" && <p className="mt-1 text-sm text-amber-800">İlan onaylansa bile ürün, katalog kaydı da ayrıca onaylanana kadar müşteri listesinde görünmez.</p>}
                        {linkedCatalogDetail.moderationStatus === "PENDING" && <button onClick={()=>{setOfferDetail(null);setCatalogDetail(linkedCatalogDetail);setTab("catalog");}} className="mt-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-900">Katalog kaydını incele</button>}
                    </div>}
                    <div className="sm:col-span-2"><Detail label="Ürün açıklaması" value={offerDetail.description || "Açıklama girilmemiş."}/></div>
                    <div className="sm:col-span-2"><Detail label="İlan açıklaması" value={offerDetail.offerDescription || "Açıklama girilmemiş."}/></div>
                    {!!offerDetail.photos.length && <div className="flex flex-wrap gap-3 sm:col-span-2">{offerDetail.photos.map(photo=><img key={photo.id} src={photo.url || ""} alt="İlan fotoğrafı" className="h-24 w-24 rounded-lg object-cover"/>)}</div>}
                </div>}
                {catalogDetail && <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Detail label="Kategori / marka" value={`${catalogDetail.category} · ${catalogDetail.brand}`} />
                    <Detail label="OEM / parça no" value={catalogDetail.oemNumber || "—"} />
                    <div className="sm:col-span-2"><Detail label="Açıklama" value={catalogDetail.description || "Açıklama girilmemiş."}/></div>
                    <div className="sm:col-span-2"><p className="text-sm font-semibold">Araç uyumlulukları</p>{catalogDetail.vehicleCompatibilities.length ? catalogDetail.vehicleCompatibilities.map(v=><p key={v.id} className="mt-1 text-sm text-slate-600">{v.vehicleBrand} {v.vehicleModel} · {v.yearFrom}–{v.yearTo} {v.engineInfo}</p>):<p className="mt-1 text-sm text-slate-500">Uyumluluk bilgisi yok.</p>}</div>
                </div>}
                {offerDetail?.moderationStatus === "PENDING" && <div className="mt-6 flex justify-end gap-3 border-t pt-5"><button onClick={()=>void reviewOffer(offerDetail,false)} className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white">Reddet</button><button onClick={()=>void reviewOffer(offerDetail,true)} className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white">Onayla</button></div>}
                {catalogDetail?.moderationStatus === "PENDING" && <div className="mt-6 flex justify-end gap-3 border-t pt-5"><button onClick={()=>void reviewCatalog(catalogDetail,false)} className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white">Reddet</button><button onClick={()=>void reviewCatalog(catalogDetail,true)} className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white">Onayla</button></div>}
            </article>
        </div>}

        <header><h1 className="text-2xl font-bold text-[#101d35]">Pazaryeri yönetimi</h1><p className="mt-1 text-sm text-slate-500">Satıcı ilanları ve ortak katalog kayıtları ayrı ayrı moderasyona alınır.</p></header>
        <div className="flex flex-wrap gap-2">{([["offers","Bekleyen firma ilanları"],["catalog","Katalog ürünleri"],["complaints","Şikâyetler"]] as const).map(([key,title])=><button key={key} onClick={()=>setTab(key)} className={`rounded-lg px-4 py-2 font-semibold ${tab===key?"bg-orange-500 text-white":"bg-white text-slate-700"}`}>{title}</button>)}</div>
        {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {tab==="catalog"&&<select value={catalogStatus} onChange={event=>setCatalogStatus(event.target.value)} className="rounded-lg border bg-white px-3 py-2"><option value="PENDING">Onay bekleyen</option><option value="APPROVED">Onaylı</option><option value="REJECTED">Reddedilen</option><option value="">Tümü</option></select>}
        {tab==="offers"&&<select aria-label="İlan moderasyon durumu" value={offerStatus} onChange={event=>setOfferStatus(event.target.value)} className="rounded-lg border bg-white px-3 py-2"><option value="PENDING">Onay bekleyen ilanlar</option><option value="APPROVED">Onaylı ilanlar</option><option value="REJECTED">Reddedilen ilanlar</option><option value="">Tüm ilanlar</option></select>}
        {loading?<p className="rounded-xl bg-white p-6 text-slate-500">Yükleniyor…</p>:null}

        {tab==="offers"&&!loading&&(offers.length?offers.map(offer=><article key={offer.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5">
            <div><h2 className="font-bold">{offer.name} · {offer.sellerName}</h2><p className="text-sm text-slate-500">{offer.brand} · {offer.condition==="NEW"?"Sıfır":"İkinci el"} · {offer.price.toLocaleString("tr-TR")} ₺ · stok {offer.stockQuantity}</p><button onClick={()=>void marketplaceService.adminSellerProfile(offer.sellerId).then(setProfile)} className="mt-2 text-sm text-blue-700 underline">Firma profilini incele</button></div>
            <div className="flex gap-2"><button onClick={()=>void openOffer(offer.id)} className="rounded-lg border px-3 py-2">Detay</button><button onClick={()=>void marketplaceService.setOfferActive(offer.id,!offer.active).then(load).catch(()=>setError("İlanın aktiflik durumu güncellenemedi."))} className="rounded-lg border px-3 py-2">{offer.active?"Pasife al":"Aktifleştir"}</button>{offer.moderationStatus==="PENDING"&&<><button onClick={()=>void reviewOffer(offer,false)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Reddet</button><button onClick={()=>void reviewOffer(offer,true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-white">Onayla</button></>}</div>
        </article>):<p className="rounded-xl bg-white p-6">Onay bekleyen firma ilanı yok.</p>)}

        {tab==="catalog"&&!loading&&(catalog.length?catalog.map(item=><article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5">
            <div><h2 className="font-bold">{item.name}</h2><p className="text-sm text-slate-500">{item.brand} · {item.category} · {item.moderationStatus}</p></div>
            <div className="flex gap-2"><button onClick={()=>void openCatalog(item.id)} className="rounded-lg border px-3 py-2">Detay</button><button onClick={()=>void marketplaceService.setCatalogActive(item.id,!item.active).then(load).catch(()=>setError("Katalog ürününün aktiflik durumu güncellenemedi."))} className="rounded-lg border px-3 py-2">{item.active?"Pasife al":"Aktifleştir"}</button>{item.moderationStatus==="PENDING"&&<><button onClick={()=>void reviewCatalog(item,false)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Reddet</button><button onClick={()=>void reviewCatalog(item,true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-white">Onayla</button></>}</div>
        </article>):<p className="rounded-xl bg-white p-6">Bu filtrede katalog ürünü yok.</p>)}

        {tab==="complaints"&&!loading&&(complaints.length?complaints.map(item=><article key={item.id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-bold">{item.sellerName} · {item.category}</h2><p className="mt-2">{item.description}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("tr-TR")} · ilan {item.offerId??"Firma geneli"}</p></div><div className="flex gap-2"><button onClick={()=>void marketplaceService.resolveComplaint(item.id,"REVIEWED",prompt("İnceleme notu")||"").then(load)} className="rounded-lg border px-3 py-2">İncelendi</button><button onClick={()=>void marketplaceService.resolveComplaint(item.id,"RESOLVED",prompt("Admin notu")||"").then(load)} className="rounded-lg bg-emerald-600 px-3 py-2 text-white">Çözüldü</button><button onClick={()=>void marketplaceService.resolveComplaint(item.id,"REJECTED",prompt("Ret notu")||"").then(load)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Reddet</button></div></div></article>):<p className="rounded-xl bg-white p-6">Açık şikâyet yok.</p>)}
    </section>;
}

function Detail({label,value}:{label:string;value:string}){return <div><p className="text-xs font-semibold uppercase text-slate-400">{label}</p><p className="mt-1 text-sm text-slate-700">{value}</p></div>}

export default AdminMarketplacePage;
