type Props = { urls: Array<string | null | undefined> };

export const isDemoImageUrl = (url?: string | null) =>
    Boolean(url?.includes("/api/dev-demo/images/"));

export default function DemoPhotoNotice({ urls }: Props) {
    if (!urls.some(isDemoImageUrl)) return null;
    return <aside role="note" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-950">
        Demo ortamındaki görseller temsil amaçlıdır; satıcının ilanındaki gerçek ürün fotoğraflarını göstermez.
    </aside>;
}
