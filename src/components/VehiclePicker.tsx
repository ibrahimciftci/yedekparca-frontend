import { useEffect, useState } from "react";
import vehicleService, { type VehicleBrand, type VehicleModel, type VehicleType } from "../services/vehicleService";

export interface VehicleSelection { typeId: string; brandId: string; modelId: string; }

function VehiclePicker({ value, onChange, disabled = false }: {
    value: VehicleSelection;
    onChange: (selection: VehicleSelection) => void;
    disabled?: boolean;
}) {
    const [types, setTypes] = useState<VehicleType[]>([]);
    const [brands, setBrands] = useState<VehicleBrand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        vehicleService.types().then(items => { if (mounted) setTypes(items); })
            .catch(() => { if (mounted) setError("Araç türleri yüklenemedi."); })
            .finally(() => { if (mounted) setLoadingTypes(false); });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        let mounted = true;
        setBrands([]);
        setModels([]);
        if (!value.typeId) { setLoadingBrands(false); return () => { mounted = false; }; }
        setLoadingBrands(true);
        vehicleService.brands(Number(value.typeId)).then(items => { if (mounted) setBrands(items); })
            .catch(() => { if (mounted) setError("Araç markaları yüklenemedi."); })
            .finally(() => { if (mounted) setLoadingBrands(false); });
        return () => { mounted = false; };
    }, [value.typeId]);

    useEffect(() => {
        let mounted = true;
        setModels([]);
        if (!value.brandId || !value.typeId) { setLoadingModels(false); return () => { mounted = false; }; }
        setLoadingModels(true);
        vehicleService.models(Number(value.brandId), Number(value.typeId)).then(items => { if (mounted) setModels(items); })
            .catch(() => { if (mounted) setError("Araç modelleri yüklenemedi."); })
            .finally(() => { if (mounted) setLoadingModels(false); });
        return () => { mounted = false; };
    }, [value.brandId, value.typeId]);

    const selectClass = "mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100";
    return <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Araç türü<select disabled={disabled || loadingTypes} value={value.typeId} onChange={event => onChange({ typeId: event.target.value, brandId: "", modelId: "" })} className={selectClass}>
            <option value="">{loadingTypes ? "Yükleniyor…" : types.length ? "Tür seçin" : "Araç türü yok"}</option>{types.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
        </select></label>
        <label className="text-sm">Araç markası<select disabled={disabled || !value.typeId || loadingBrands} value={value.brandId} onChange={event => onChange({ ...value, brandId: event.target.value, modelId: "" })} className={selectClass}>
            <option value="">{loadingBrands ? "Yükleniyor…" : !value.typeId ? "Önce tür seçin" : brands.length ? "Marka seçin" : "Bu türde marka yok"}</option>{brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select></label>
        <label className="text-sm">Araç modeli<select disabled={disabled || !value.brandId || loadingModels} value={value.modelId} onChange={event => onChange({ ...value, modelId: event.target.value })} className={selectClass}>
            <option value="">{loadingModels ? "Yükleniyor…" : !value.brandId ? "Önce marka seçin" : models.length ? "Model seçin" : "Bu markada model yok"}</option>{models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
        </select></label>
        {error && <p role="alert" className="text-xs text-red-600 sm:col-span-3">{error}</p>}
        {!error && value.typeId && !loadingBrands && !brands.length && <p className="text-xs text-slate-500 sm:col-span-3">Seçilen araç türünde henüz kayıtlı marka yok.</p>}
    </div>;
}

export default VehiclePicker;
