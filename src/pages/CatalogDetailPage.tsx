import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {Heart, Phone, MapPin, MessageCircle, Flag} from "lucide-react";
import marketplaceService, {type CatalogView} from "../services/marketplaceService";

const ageDays = (s: string) => Math.floor((Date.now() - new Date(s).getTime()) / 86400000);

function CatalogDetailPage() {
    const {id} = useParams();
    const [item, setItem] = useState<CatalogView | null>(null);
    const [condition, setCondition] = useState("NEW");
    const [error, setError] = useState("");
    useEffect(() => {
        if (id) marketplaceService.detail(Number(id)).then(setItem).catch(() => setError("Ürün bulunamadı veya yayında değil."));
    }, [id]);
    if (error) return <main className="p-10 text-center text-red-600">{error}</main>;
    if (!item) return <main className="p-10">Ürün yükleniyor…</main>;
    const offers = item.offers.filter(o => o.condition === condition).sort((a, b) => a.price - b.price);
    return <main className="min-h-screen bg-slate-50">
        <header className="bg-[#101d35] p-5 text-white">
            <div className="mx-auto max-w-6xl"><Link to="/products">← Ürünlere dön</Link></div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8"><p
            className="text-sm font-semibold text-orange-600">{item.brand} · {item.category} {item.oemNumber && `· OEM ${item.oemNumber}`}</p>
            <div className="flex flex-wrap items-center justify-between gap-4"><h1
                className="text-3xl font-bold text-[#101d35]">{item.name}</h1>
                <button onClick={() => marketplaceService.favorite(item.id).catch(() => location.assign("/login"))}
                        className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-rose-600"><Heart
                    size={18}/> Favori
                </button>
            </div>
            {item.description && <p className="mt-3 max-w-3xl text-slate-600">{item.description}</p>}
            <div className="mt-8 flex gap-2">
                <button onClick={() => setCondition("NEW")}
                        className={`rounded-full px-5 py-2 ${condition === "NEW" ? "bg-orange-500 text-white" : "bg-white"}`}>Sıfır
                </button>
                <button onClick={() => setCondition("USED")}
                        className={`rounded-full px-5 py-2 ${condition === "USED" ? "bg-orange-500 text-white" : "bg-white"}`}>İkinci
                    el
                </button>
            </div>
            <div className="mt-5 space-y-4">{offers.length === 0 ?
                <p className="rounded-xl bg-white p-8">Bu durumda yayında firma ilanı yok.</p> : offers.map(o => {
                    const stale = ageDays(o.priceUpdatedAt) > 30 || ageDays(o.stockUpdatedAt) > 30;
                    const phone = o.sellerPhone.replace(/[^+0-9]/g, "");
                    const waNumber = (o.whatsappPhone || o.sellerPhone).replace(/[^0-9]/g, "");
                    const destination = o.latitude && o.longitude ? `${o.latitude},${o.longitude}` : encodeURIComponent(`${o.streetAddress || ""} ${o.city} ${o.district}`);
                    const wa = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Merhaba, ${item.name} ürününüz hakkında bilgi almak istiyorum.`)}`;
                    return <article key={o.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex gap-4"><div className="flex gap-2">{o.photos.map(photo => photo.url &&
                                <img key={photo.id} src={photo.url} alt={item.name}
                                     className="h-20 w-20 rounded-xl object-cover"/>)}{!o.photos.length && o.legacyImageUrl &&
                                <img src={o.legacyImageUrl} alt={item.name}
                                     className="h-20 w-20 rounded-xl object-cover"/>}</div>
                            <div>{o.sellerLogo && <img src={o.sellerLogo} alt="Firma logosu"
                                                       className="mb-2 h-10 w-10 rounded-full object-cover"/>}<Link
                                to={`/sellers/${o.sellerId}`}
                                className="text-lg font-bold text-[#101d35]">{o.sellerName}</Link><p
                                className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin
                                size={15}/>{o.city}, {o.district}</p>{o.offerDescription &&
                                <p className="mt-1 text-sm text-slate-600">{o.offerDescription}</p>}<p
                                className="mt-1 text-sm">Stok: {o.stockQuantity > 0 ? `${o.stockQuantity} adet (firma beyanı)` : "Tükendi"}</p>
                                <p className="mt-1 text-xs text-slate-500">Fiyat
                                    güncelleme: {new Date(o.priceUpdatedAt).toLocaleDateString("tr-TR")} · stok
                                    güncelleme: {new Date(o.stockUpdatedAt).toLocaleDateString("tr-TR")}{stale && <span
                                        className="ml-2 text-amber-700">Fiyat veya stok bilgisi eski olabilir.</span>}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2"><strong
                            className="mr-2 text-2xl">{o.price.toLocaleString("tr-TR")} ₺</strong><a
                            href={`tel:${phone}`} className="rounded-lg bg-emerald-600 p-3 text-white"
                            title="Ara"><Phone size={18}/></a><a href={wa} target="_blank" rel="noreferrer"
                                                                 className="rounded-lg bg-green-600 p-3 text-white"
                                                                 title="WhatsApp"><MessageCircle size={18}/></a><Link
                            to={`/sellers/${o.sellerId}`} className="rounded-lg border px-4 py-3 text-sm">Firma
                            profili</Link><a href={`https://www.google.com/maps/dir/?api=1&destination=${destination}`}
                                             target="_blank" rel="noreferrer"
                                             className="rounded-lg border px-3 py-3 text-sm">Google Maps</a><a
                            href={`https://maps.apple.com/?daddr=${destination}&dirflg=d`} target="_blank"
                            rel="noreferrer" className="rounded-lg border px-3 py-3 text-sm">Apple Maps</a><a
                            href={`https://yandex.com/maps/?rtext=~${destination}&rtt=auto`} target="_blank"
                            rel="noreferrer" className="rounded-lg border px-3 py-3 text-sm">Yandex</a>
                            <button onClick={async () => {
                                const category = prompt("Şikâyet kategorisi (WRONG_PRICE, WRONG_PRODUCT_INFO, WRONG_STOCK, UNREACHABLE_SELLER, MISLEADING_PHOTO, OTHER)");
                                const description = prompt("Şikâyet açıklaması");
                                if (category && description) try {
                                    await marketplaceService.complain({
                                        sellerId: o.sellerId,
                                        offerId: o.id,
                                        category,
                                        description
                                    });
                                    alert("Şikâyet gönderildi.")
                                } catch {
                                    alert("Şikâyet için giriş yapın veya daha sonra tekrar deneyin.")
                                }
                            }} className="rounded-lg border p-3" title="Şikâyet et"><Flag size={18}/></button>
                        </div>
                    </div>
                </article>
                })}</div>
        </div>
    </main>
}

export default CatalogDetailPage;
