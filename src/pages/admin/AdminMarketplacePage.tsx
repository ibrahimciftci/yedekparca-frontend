import {useEffect, useState} from "react";
import marketplaceService, {type OfferView, type SellerProfile} from "../../services/marketplaceService";

type Tab = "offers"|"complaints";
type Complaint = {id:number;sellerName:string;category:string;description:string;status:string;sellerId:number;offerId:number|null;createdAt:string};

function AdminMarketplacePage() {
    const [tab,setTab]=useState<Tab>("offers");
    const [offerStatus,setOfferStatus]=useState("PENDING");
    const [offers,setOffers]=useState<OfferView[]>([]);
    const [complaints,setComplaints]=useState<Complaint[]>([]);
    const [detail,setDetail]=useState<OfferView|null>(null);
    const [profile,setProfile]=useState<SellerProfile|null>(null);
    const [loading,setLoading]=useState(false);
    const [error,setError]=useState("");
    const load=async()=>{
        setLoading(true);setError("");
        try {
            if(tab==="offers") setOffers((await marketplaceService.adminOffers(offerStatus||undefined)).content);
            else setComplaints((await marketplaceService.complaints()).content);
        } catch {setError(tab==="offers"?"Satıcı ilanları yüklenemedi.":"Şikâyetler yüklenemedi.");}
        finally {setLoading(false);}
    };
    useEffect(()=>{void load();},[tab,offerStatus]);
    const review=async(offer:OfferView,approve:boolean)=>{
        if(!confirm(approve?"“"+offer.name+"” ilanı onaylansın mı?":"“"+offer.name+"” ilanı reddedilsin mi?"))return;
        const reason=approve?undefined:prompt("Ret gerekçesi (zorunlu)")?.trim();
        if(!approve&&!reason)return;
        try {await marketplaceService.reviewOffer(offer.id,approve,reason);setDetail(null);await load();}
        catch {setError("İlan moderasyonu tamamlanamadı.");}
    };
    return <section className="space-y-5">
        {profile&&<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4" onMouseDown={event=>{if(event.target===event.currentTarget)setProfile(null);}}><article className="mx-auto my-8 w-full max-w-lg rounded-2xl bg-white p-6"><button className="float-right rounded-lg border px-3 py-1.5" onClick={()=>setProfile(null)}>Kapat</button><h2 className="text-xl font-bold">{profile.storeName}</h2><p className="mt-2">{profile.city}, {profile.district} {profile.streetAddress}</p><p>{profile.phone} · {profile.contactEmail}</p><p className="mt-2">{profile.description}</p>{profile.logoUrl&&<img src={profile.logoUrl} alt="Firma logosu" className="mt-3 h-16 w-16 rounded object-cover"/>}</article></div>}
        {detail&&<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4" onMouseDown={event=>{if(event.target===event.currentTarget)setDetail(null);}}><article role="dialog" aria-modal="true" className="mx-auto my-5 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-orange-600">Satıcı ilanı · #{detail.id}</p><h2 className="mt-1 text-2xl font-bold">{detail.name}</h2></div><button onClick={()=>setDetail(null)} className="rounded-lg border px-3 py-1.5">Kapat</button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Kategori / marka" value={detail.category+" · "+detail.brand}/><Field label="OEM / parça no" value={detail.oemNumber||"—"}/>
                <Field label="Fiyat / stok" value={detail.price.toLocaleString("tr-TR")+" ₺ · "+detail.stockQuantity}/><Field label="Ürün durumu" value={detail.condition==="NEW"?"Sıfır":"İkinci el"}/>
                <Field label="Moderasyon" value={detail.moderationStatus}/><Field label="Satıcı" value={detail.sellerName+" · "+detail.city+", "+detail.district}/>
                <div className="sm:col-span-2"><button onClick={()=>void marketplaceService.adminSellerProfile(detail.sellerId).then(setProfile).catch(()=>setError("Satıcı profili yüklenemedi."))} className="text-sm font-semibold text-blue-700 underline">Satıcı profilini incele</button></div>
                <div className="sm:col-span-2"><Field label="Ürün açıklaması" value={detail.description||"Açıklama girilmemiş."}/></div>
                <div className="sm:col-span-2"><Field label="Satıcı açıklaması" value={detail.offerDescription||"Açıklama girilmemiş."}/></div>
                <div className="sm:col-span-2"><h3 className="text-sm font-semibold">Fotoğraflar</h3>{detail.photos.length?<div className="mt-2 flex flex-wrap gap-3">{detail.photos.map(photo=><img key={photo.id} src={photo.url||""} alt="İlan fotoğrafı" className="h-28 w-28 rounded-lg border object-cover"/>)}</div>:<p className="mt-1 text-sm text-slate-500">Fotoğraf eklenmemiş.</p>}</div>
                <div className="sm:col-span-2"><h3 className="text-sm font-semibold">Araç uyumlulukları</h3>{detail.vehicleCompatibilities.length?<ul className="mt-2 space-y-1">{detail.vehicleCompatibilities.map(vehicle=><li key={vehicle.id} className="text-sm text-slate-600">{vehicle.vehicleBrand} {vehicle.vehicleModel} · {vehicle.yearFrom}–{vehicle.yearTo}{vehicle.engineInfo?" · "+vehicle.engineInfo:""}</li>)}</ul>:<p className="mt-1 text-sm text-slate-500">Uyumluluk bilgisi girilmemiş.</p>}</div>
            </div>
            {detail.moderationStatus==="PENDING"&&<div className="mt-6 flex justify-end gap-3 border-t pt-5"><button onClick={()=>void review(detail,false)} className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white">Reddet</button><button onClick={()=>void review(detail,true)} className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white">Onayla ve yayına al</button></div>}
        </article></div>}
        <header><h1 className="text-2xl font-bold text-[#101d35]">Pazaryeri yönetimi</h1><p className="mt-1 text-sm text-slate-500">Satıcı ilanları tek moderasyon adımında incelenir.</p></header>
        <div className="flex flex-wrap gap-2"><button onClick={()=>setTab("offers")} className={"rounded-lg px-4 py-2 font-semibold "+(tab==="offers"?"bg-orange-500 text-white":"bg-white text-slate-700")}>Satıcı ilanları</button><button onClick={()=>setTab("complaints")} className={"rounded-lg px-4 py-2 font-semibold "+(tab==="complaints"?"bg-orange-500 text-white":"bg-white text-slate-700")}>Şikâyetler</button></div>
        {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {tab==="offers"&&<select aria-label="İlan moderasyon durumu" value={offerStatus} onChange={event=>setOfferStatus(event.target.value)} className="rounded-lg border bg-white px-3 py-2"><option value="PENDING">Onay bekleyen ilanlar</option><option value="APPROVED">Onaylı ilanlar</option><option value="REJECTED">Reddedilen ilanlar</option><option value="">Tüm ilanlar</option></select>}
        {loading&&<p className="rounded-xl bg-white p-6 text-slate-500">Yükleniyor…</p>}
        {tab==="offers"&&!loading&&(offers.length?offers.map(offer=><article key={offer.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5"><div className="flex items-center gap-3">{(offer.photos.find(photo=>photo.primaryPhoto)?.url||offer.photos[0]?.url)&&<img src={offer.photos.find(photo=>photo.primaryPhoto)?.url||offer.photos[0]?.url||""} alt="" className="h-16 w-16 rounded-lg object-cover"/>}<div><h2 className="font-bold">{offer.name} · {offer.sellerName}</h2><p className="text-sm text-slate-500">{offer.brand} · {offer.category} · {offer.condition==="NEW"?"Sıfır":"İkinci el"} · {offer.price.toLocaleString("tr-TR")} ₺ · stok {offer.stockQuantity}</p></div></div><div className="flex gap-2"><button onClick={()=>void marketplaceService.adminOfferDetail(offer.id).then(setDetail).catch(()=>setError("İlan detayı yüklenemedi."))} className="rounded-lg border px-3 py-2">Detay</button><button onClick={()=>void marketplaceService.setOfferActive(offer.id,!offer.active).then(load).catch(()=>setError("İlanın durumu güncellenemedi."))} className="rounded-lg border px-3 py-2">{offer.active?"Pasife al":"Aktifleştir"}</button>{offer.moderationStatus==="PENDING"&&<><button onClick={()=>void review(offer,false)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Reddet</button><button onClick={()=>void review(offer,true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-white">Onayla</button></>}</div></article>):<p className="rounded-xl bg-white p-6">Bu filtrede ilan yok.</p>)}
        {tab==="complaints"&&!loading&&(complaints.length?complaints.map(item=><article key={item.id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-bold">{item.sellerName} · {item.category}</h2><p className="mt-2">{item.description}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("tr-TR")} · ilan {item.offerId??"Firma geneli"}</p></div><div className="flex gap-2"><button onClick={()=>void marketplaceService.resolveComplaint(item.id,"REVIEWED",prompt("İnceleme notu")||"").then(load)} className="rounded-lg border px-3 py-2">İncelendi</button><button onClick={()=>void marketplaceService.resolveComplaint(item.id,"RESOLVED",prompt("Admin notu")||"").then(load)} className="rounded-lg bg-emerald-600 px-3 py-2 text-white">Çözüldü</button><button onClick={()=>void marketplaceService.resolveComplaint(item.id,"REJECTED",prompt("Ret notu")||"").then(load)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Reddet</button></div></div></article>):<p className="rounded-xl bg-white p-6">Açık şikâyet yok.</p>)}
    </section>;
}
function Field({label,value}:{label:string;value:string}){return <div><p className="text-xs font-semibold uppercase text-slate-400">{label}</p><p className="mt-1 whitespace-pre-line text-sm text-slate-700">{value}</p></div>}
export default AdminMarketplacePage;
