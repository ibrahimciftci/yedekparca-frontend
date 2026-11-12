import marketplaceService from "./marketplaceService";

let favoriteIds = new Set<number>();
let loaded = false;
let pending: Promise<Set<number>> | null = null;
const mutations = new Map<number, Promise<boolean>>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());

export const subscribeFavorites = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };
export const getFavoriteIds = () => favoriteIds;
export async function loadFavorites() {
    if (!localStorage.getItem("token")) { favoriteIds = new Set(); loaded = true; emit(); return favoriteIds; }
    if (loaded) return favoriteIds;
    if (!pending) pending = marketplaceService.favorites().then(items => { favoriteIds = new Set(items.map(item => item.id)); loaded = true; emit(); return favoriteIds; }).finally(() => { pending = null; });
    return pending;
}
export async function toggleFavorite(id: number) {
    const existing = mutations.get(id);
    if (existing) return existing;
    const operation = mutateFavorite(id);
    mutations.set(id, operation);
    try { return await operation; } finally { mutations.delete(id); }
}
async function mutateFavorite(id: number) {
    if (!localStorage.getItem("token")) throw new Error("Favorilere eklemek için giriş yapın.");
    await loadFavorites();
    const removing = favoriteIds.has(id);
    if (removing) await marketplaceService.unfavorite(id); else await marketplaceService.favorite(id);
    favoriteIds = new Set(favoriteIds);
    if (removing) favoriteIds.delete(id); else favoriteIds.add(id);
    emit();
    return !removing;
}
export function resetFavorites() { favoriteIds = new Set(); loaded = false; emit(); }
