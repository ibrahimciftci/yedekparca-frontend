import {useEffect, useMemo, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {MapPin, MessageCircle, Phone, Tag} from "lucide-react";
import marketplaceService, {type OfferView} from "../services/marketplaceService";
import ProductImage from "../components/ProductImage";
import DemoPhotoNotice from "../components/DemoPhotoNotice";

function OfferDetailPage() {
    const {id} = useParams();
    const offerId = Number(id);
    const [offer, setOffer] = useState<OfferView|null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAllVehicles, setShowAllVehicles] = useState(false);
    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError("");
        if (!Number.isSafeInteger(offerId) || offerId <= 0) {
            setError("İlan numarası geçersiz.");
            setLoading(false);
            return;
        }
        marketplaceService.offer(offerId).then(value => {if(alive)setOffer(value);})
            .catch(() => {if(alive)setError("Bu ilan bulunamadı veya artık yayında değil.");})
            .finally(() => {if(alive)setLoading(false);});
        return () => {alive = false;};
    }, [offerId]);
    const photos = useMemo(() => offer ? [...offer.photos]
        .sort((a,b) => Number(b.primaryPhoto)-Number(a.primaryPhoto) || a.displayOrder-b.displayOrder)
        .map(photo=>photo.url).filter((url):url is string=>Boolean(url))
        .concat(offer.legacyImageUrl ? [offer.legacyImageUrl] : []) : [], [offer]);
    const phone = offer?.sellerPhone.replace(/[^+0-9]/g,"") || "";
    const whatsapp = (offer?.whatsappPhone || offer?.sellerPhone || "").replace(/[^0-9]/g,"");
    const vehicles = offer?.vehicleCompatibilities ?? [];
    if (loading) return <main className="mx-auto max-w-6xl px-4 py-12"><p role="status">İlan yükleniyor…</p></main>;
    if (error || !offer) return <main className="mx-auto max-w-6xl px-4 py-12"><p role="alert" className="rounded-xl bg-amber-50 p-5 text-slate-800">{error || "İlan bulunamadı."}</p><Link className="mt-4 inline-block text-orange-700 underline" to="/products">İlanlara dön</Link></main>;
    return <main className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/products" className="text-sm font-semibold text-orange-700">‹ İlanlara dön</Link>
        <DemoPhotoNotice urls={photos}/>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section>
                <ProductImage src={photos[0]} fallbackSrcs={photos.slice(1)} alt={offer.name} className="h-[340px] w-full rounded-2xl bg-white sm:h-[460px]"/>
                {photos.length>1&&<div className="mt-3 grid grid-cols-4 gap-3">{photos.slice(1).map((photo,index)=><img key={photo+"-"+index} src={photo} alt={offer.name+" fotoğraf "+(index+2)} className="h-24 w-full rounded-lg border object-cover"/>)}</div>}
            </section>
            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
                <p className="text-sm font-bold text-orange-700">{offer.category} · {offer.brand}</p>
                <h1 className="mt-2 text-3xl font-extrabold text-[#101d35]">{offer.name}</h1>
                {offer.oemNumber&&<p className="mt-2 text-sm text-slate-600">OEM / Parça no: <b>{offer.oemNumber}</b></p>}
                <p className="mt-5 text-3xl font-extrabold text-orange-600">{offer.price.toLocaleString("tr-TR")} ₺</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-slate-100 px-3 py-1">{offer.condition==="NEW"?"Sıfır":"İkinci el"}</span><span className="rounded-full bg-slate-100 px-3 py-1">{offer.stockQuantity>0?"Stokta "+offer.stockQuantity+" adet":"Stokta yok"}</span></div>
                {offer.description&&<div className="mt-6"><h2 className="font-bold">Ürün açıklaması</h2><p className="mt-2 whitespace-pre-line text-slate-600">{offer.description}</p></div>}
                {offer.offerDescription&&<div className="mt-5"><h2 className="font-bold">Satıcı notu</h2><p className="mt-2 whitespace-pre-line text-slate-600">{offer.offerDescription}</p></div>}
                <div className="mt-6 border-t pt-5">
                    <Link to={"/sellers/"+offer.sellerId} className="flex items-center gap-3 hover:text-orange-700">{offer.sellerLogo?<img src={offer.sellerLogo} alt="" className="h-12 w-12 rounded-full object-cover"/>:<span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100"><Tag/></span>}<span><b className="block">{offer.sellerName}</b><small className="flex items-center gap-1 text-slate-500"><MapPin size={13}/>{offer.city}{offer.district?", "+offer.district:""}</small></span></Link>
                    <div className="mt-4 flex flex-wrap gap-2">{phone&&<a href={"tel:"+phone} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white"><Phone size={17}/>Satıcıyı ara</a>}{whatsapp&&<a href={"https://wa.me/"+whatsapp+"?text="+encodeURIComponent("Merhaba, "+offer.name+" ilanınız hakkında bilgi almak istiyorum.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 font-semibold text-white"><MessageCircle size={17}/>WhatsApp</a>}<Link to={"/sellers/"+offer.sellerId} className="rounded-lg border px-4 py-3 font-semibold">Satıcı profili</Link></div>
                </div>
            </section>
        </div>
        <section className="mt-8 rounded-2xl border bg-white p-5">
            <h2 className="text-xl font-bold">Araç uyumluluğu</h2>
            {!vehicles.length?<p className="mt-3 text-slate-500">Bu ilan için araç uyumluluğu bilgisi girilmemiş.</p>:<>
                <ul className="mt-3 space-y-2">{(showAllVehicles?vehicles:vehicles.slice(0,5)).map(vehicle=><li key={vehicle.id} className="rounded-lg bg-slate-50 p-3 text-sm">{vehicle.vehicleBrand} {vehicle.vehicleModel} · {vehicle.yearFrom}–{vehicle.yearTo}{vehicle.engineInfo?" · "+vehicle.engineInfo:""}</li>)}</ul>
                {vehicles.length>5&&<button type="button" onClick={()=>setShowAllVehicles(value=>!value)} className="mt-3 font-semibold text-orange-700">{showAllVehicles?"Daha az göster":(vehicles.length-5)+" uyumluluğu daha göster"}</button>}
            </>}
        </section>
    </main>;
}
export default OfferDetailPage;
