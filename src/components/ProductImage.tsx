import { useState } from "react";
import { Package } from "lucide-react";

function ProductImage({ src, fallbackSrcs = [], alt, className = "" }: { src?: string | null; fallbackSrcs?: Array<string | null | undefined>; alt: string; className?: string }) {
    const [failedSrcs, setFailedSrcs] = useState<Set<string>>(() => new Set());
    const candidates = Array.from(new Set([src, ...fallbackSrcs].filter((candidate): candidate is string => Boolean(candidate))));
    const currentSrc = candidates.find(candidate => !failedSrcs.has(candidate));
    if (!currentSrc) {
        return <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`} aria-label={`${alt} görseli bulunmuyor`}><Package size={36} /></div>;
    }
    return <img src={currentSrc} alt={alt} onError={() => setFailedSrcs(previous => new Set(previous).add(currentSrc))} className={`object-cover ${className}`} />;
}

export default ProductImage;
