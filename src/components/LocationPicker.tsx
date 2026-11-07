import { useEffect, useState } from "react";
import locationService, { type CityOption, type DistrictOption } from "../services/locationService";

export interface LocationSelection {
    cityId: string;
    districtId: string;
    cityName: string;
    districtName: string;
}

export const emptyLocation: LocationSelection = { cityId: "", districtId: "", cityName: "", districtName: "" };

function key(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").trim().toLocaleLowerCase("tr-TR");
}

function LocationPicker({ value, onChange, required = false, disabled = false }: {
    value: LocationSelection;
    onChange: (value: LocationSelection) => void;
    required?: boolean;
    disabled?: boolean;
}) {
    const [cities, setCities] = useState<CityOption[]>([]);
    const [districts, setDistricts] = useState<DistrictOption[]>([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [districtsLoading, setDistrictsLoading] = useState(false);
    const [citiesError, setCitiesError] = useState("");
    const [districtsError, setDistrictsError] = useState("");
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let active = true;
        setCitiesLoading(true);
        setCitiesError("");
        locationService.cities().then(items => { if (active) setCities(items); })
            .catch(() => { if (active) setCitiesError("İl listesi yüklenemedi."); })
            .finally(() => { if (active) setCitiesLoading(false); });
        return () => { active = false; };
    }, [retry]);

    useEffect(() => {
        if (value.cityId || !value.cityName || !cities.length) return;
        const match = cities.find(city => key(city.name) === key(value.cityName));
        if (match) onChange({ cityId: String(match.id), districtId: "", cityName: match.name, districtName: value.districtName });
    }, [cities, value.cityId, value.cityName, value.districtName, onChange]);

    useEffect(() => {
        let active = true;
        setDistricts([]);
        if (!value.cityId) { setDistrictsLoading(false); setDistrictsError(""); return () => { active = false; }; }
        setDistrictsLoading(true);
        setDistrictsError("");
        locationService.districts(Number(value.cityId)).then(items => { if (active) setDistricts(items); })
            .catch(() => { if (active) setDistrictsError("Seçilen ilin ilçe listesi yüklenemedi."); })
            .finally(() => { if (active) setDistrictsLoading(false); });
        return () => { active = false; };
    }, [value.cityId, retry]);

    useEffect(() => {
        if (!value.cityId || value.districtId || !value.districtName || !districts.length) return;
        const match = districts.find(district => key(district.name) === key(value.districtName));
        if (match) onChange({ ...value, districtId: String(match.id), districtName: match.name });
    }, [districts, value, onChange]);

    const selectClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100";
    return <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">İl
            <select required={required} disabled={disabled || citiesLoading || !!citiesError && !cities.length} value={value.cityId}
                onChange={event => {
                    const city = cities.find(item => String(item.id) === event.target.value);
                    onChange({ cityId: city ? String(city.id) : "", districtId: "", cityName: city?.name || "", districtName: "" });
                }} className={selectClass}>
                <option value="">{citiesLoading ? "İller yükleniyor…" : cities.length ? "İl seçin" : "İl bulunamadı"}</option>
                {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
        </label>
        <label className="text-sm font-medium text-slate-700">İlçe
            <select required={required} disabled={disabled || !value.cityId || districtsLoading || !!districtsError && !districts.length} value={value.districtId}
                onChange={event => {
                    const district = districts.find(item => String(item.id) === event.target.value);
                    onChange({ ...value, districtId: district ? String(district.id) : "", districtName: district?.name || "" });
                }} className={selectClass}>
                <option value="">{!value.cityId ? "Önce il seçin" : districtsLoading ? "İlçeler yükleniyor…" : districts.length ? "İlçe seçin" : "İlçe bulunamadı"}</option>
                {districts.map(district => <option key={district.id} value={district.id}>{district.name}</option>)}
            </select>
        </label>
        {value.cityName && !value.cityId && <p className="text-xs text-amber-700 sm:col-span-2">Kayıtlı konum “{value.cityName}{value.districtName ? ` / ${value.districtName}` : ""}” merkezi listede eşleşmedi. Eski bilgi korunuyor; kaydetmek için geçerli bir konum seçin.</p>}
        {(citiesError || districtsError) && <div role="alert" className="flex items-center gap-2 text-sm text-red-700 sm:col-span-2"><span>{citiesError || districtsError}</span><button type="button" className="rounded border border-red-300 px-3 py-1" onClick={() => setRetry(value => value + 1)}>Yeniden dene</button></div>}
        {!districtsError && value.cityId && !districtsLoading && !districts.length && <p className="text-xs text-slate-500 sm:col-span-2">Seçilen il için kayıtlı ilçe bulunamadı.</p>}
    </div>;
}

export default LocationPicker;
