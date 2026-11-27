import {useEffect, useRef, useState} from "react";
import {ChevronLeft, ChevronRight, X} from "lucide-react";
import ProductImage from "./ProductImage";

export default function PhotoGallery({photos, alt}: {photos: string[]; alt: string}) {
    const [selected, setSelected] = useState(0);
    const [open, setOpen] = useState(false);
    const [badThumbs, setBadThumbs] = useState<Set<number>>(() => new Set());
    const trigger = useRef<HTMLButtonElement>(null);
    const touchStart = useRef<number | null>(null);
    const count = photos.length;
    const change = (delta: number) => setSelected(index => (index + delta + count) % count);
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const key = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); }
            if (event.key === "ArrowRight") { event.preventDefault(); change(1); }
        };
        window.addEventListener("keydown", key);
        return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", key); trigger.current?.focus(); };
    }, [open, count]);
    const swipeStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0]?.clientX ?? null; };
    const swipeEnd = (e: React.TouchEvent) => { if (touchStart.current !== null) { const d = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(d) > 45 && count > 1) change(d < 0 ? 1 : -1); } touchStart.current = null; };
    return <div>
        <div className="relative">
            {count ? <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-label="Fotoğrafı büyüt" className="block w-full cursor-zoom-in">
                <ProductImage src={photos[selected]} fallbackSrcs={photos.filter((_, i) => i !== selected)} alt={alt} className="h-[340px] w-full rounded-2xl bg-white sm:h-[460px]" />
            </button> : <ProductImage alt={alt} className="h-[340px] w-full rounded-2xl sm:h-[460px]" />}
            {count > 1 && <>
                <button type="button" aria-label="Önceki fotoğraf" onClick={() => change(-1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"><ChevronLeft/></button>
                <button type="button" aria-label="Sonraki fotoğraf" onClick={() => change(1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"><ChevronRight/></button>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white">{selected + 1} / {count}</span>
            </>}
        </div>
        {count > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-1">{photos.map((photo, index) => badThumbs.has(index) ? null : <button key={photo+index} type="button" onClick={() => setSelected(index)} aria-label={`Fotoğraf ${index+1}`} aria-pressed={selected===index} className={`shrink-0 rounded-lg border-2 ${selected===index ? "border-orange-600 ring-2 ring-orange-200" : "border-transparent"}`}><img src={photo} alt={`${alt} fotoğraf ${index+1}`} onError={() => setBadThumbs(prev => new Set(prev).add(index))} className="h-20 w-24 rounded-md object-cover sm:h-24 sm:w-28"/></button>)}</div>}
        {open && count > 0 && <div role="dialog" aria-modal="true" aria-label="Fotoğraf galerisi" onClick={e => {if(e.target===e.currentTarget)setOpen(false);}} onTouchStart={swipeStart} onTouchEnd={swipeEnd} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-8">
            <button type="button" aria-label="Kapat" onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white"><X/></button>
            {count>1 && <button type="button" aria-label="Önceki fotoğraf" onClick={() => change(-1)} className="absolute left-2 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white sm:left-5"><ChevronLeft/></button>}
            <ProductImage src={photos[selected]} fallbackSrcs={photos.filter((_,i)=>i!==selected)} alt={alt} className="max-h-[88dvh] max-w-[92vw] rounded object-contain sm:max-h-[92dvh] sm:max-w-[90vw]"/>
            {count>1 && <><button type="button" aria-label="Sonraki fotoğraf" onClick={() => change(1)} className="absolute right-2 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white sm:right-5"><ChevronRight/></button><span className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-white">{selected+1} / {count}</span></>}
        </div>}
    </div>;
}
