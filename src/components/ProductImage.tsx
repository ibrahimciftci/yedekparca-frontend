import { useState } from "react";
import { Package } from "lucide-react";

function ProductImage({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`} aria-label={`${alt} görseli bulunmuyor`}><Package size={36} /></div>;
    }
    return <img src={src} alt={alt} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

export default ProductImage;
