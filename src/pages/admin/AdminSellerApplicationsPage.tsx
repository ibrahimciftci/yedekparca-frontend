import { useCallback, useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import adminSellerService from "../../services/adminSellerService";
import type { SellerResponse } from "../../types/api";

function AdminSellerApplicationsPage() {
    const [applications, setApplications] = useState<SellerResponse[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<SellerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const loadApplications = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await adminSellerService.getPendingApplications();
            setApplications(response.data);
        } catch {
            setError("Satıcı başvuruları yüklenemedi. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadApplications();
    }, [loadApplications]);

    const closeDetails = () => {
        setSelectedApplication(null);
        setIsRejecting(false);
        setRejectionReason("");
    };

    const handleApprove = async () => {
        if (!selectedApplication || actionLoading) return;
        const confirmed = window.confirm(
            `${selectedApplication.storeName} başvurusunu onaylamak istiyor musunuz?`,
        );
        if (!confirmed) return;

        setActionLoading(true);
        setError("");
        try {
            await adminSellerService.approveApplication(selectedApplication.id);
            closeDetails();
            await loadApplications();
        } catch {
            setError("Başvuru onaylanamadı. Lütfen tekrar deneyin.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedApplication || actionLoading) return;

        const trimmedReason = rejectionReason.trim();
        if (!trimmedReason) {
            setError("Ret gerekçesi zorunludur.");
            return;
        }

        const confirmed = window.confirm(
            `${selectedApplication.storeName} başvurusunu bu gerekçeyle reddetmek istiyor musunuz?`,
        );
        if (!confirmed) return;

        setActionLoading(true);
        setError("");
        try {
            await adminSellerService.rejectApplication(selectedApplication.id, {
                rejectionReason: trimmedReason,
            });
            closeDetails();
            await loadApplications();
        } catch {
            setError("Başvuru reddedilemedi. Lütfen tekrar deneyin.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <section>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#101d35]">Satıcı Başvuruları</h1>
                <p className="mt-2 text-slate-500">Bekleyen başvuruları inceleyip değerlendirebilirsiniz.</p>
            </div>

            {error && !selectedApplication && (
                <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Başvurular yükleniyor...</div>
                ) : applications.length === 0 ? (
                    <div className="p-12 text-center">
                        <h2 className="font-semibold text-[#101d35]">Bekleyen başvuru yok</h2>
                        <p className="mt-2 text-sm text-slate-500">Yeni başvurular bu ekranda görüntülenecek.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Mağaza</th>
                                    <th className="px-6 py-4">Başvuru sahibi</th>
                                    <th className="px-6 py-4">Konum</th>
                                    <th className="px-6 py-4">Başvuru tarihi</th>
                                    <th className="px-6 py-4">Detay</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.map((application) => (
                                    <tr key={application.id} className="text-slate-700">
                                        <td className="px-6 py-4 font-semibold text-[#101d35]">{application.storeName}</td>
                                        <td className="px-6 py-4">
                                            <div>{application.applicantFirstName} {application.applicantLastName}</div>
                                            <div className="mt-1 text-xs text-slate-500">{application.applicantEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">{application.city}, {application.district}</td>
                                        <td className="px-6 py-4">{new Date(application.appliedAt).toLocaleDateString("tr-TR")}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedApplication(application);
                                                    setIsRejecting(false);
                                                    setRejectionReason("");
                                                    setError("");
                                                }}
                                                className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
                                            >
                                                İncele
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="seller-application-title" className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 id="seller-application-title" className="text-xl font-bold text-[#101d35]">Başvuru Detayı</h2>
                                <p className="mt-1 text-sm text-slate-500">{selectedApplication.storeName}</p>
                            </div>
                            <button onClick={closeDetails} aria-label="Detayı kapat" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>

                        {error && <p role="alert" className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
                            <Detail label="Başvuru sahibi" value={`${selectedApplication.applicantFirstName} ${selectedApplication.applicantLastName}`} />
                            <Detail label="E-posta" value={selectedApplication.applicantEmail} />
                            <Detail label="Telefon" value={selectedApplication.phone} />
                            <Detail label="Konum" value={`${selectedApplication.city}, ${selectedApplication.district}`} />
                            <Detail label="Başvuru tarihi" value={new Date(selectedApplication.appliedAt).toLocaleString("tr-TR")} />
                            <Detail label="Durum" value="İnceleniyor" />
                            <div className="sm:col-span-2">
                                <p className="text-xs font-semibold uppercase text-slate-400">Mağaza açıklaması</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{selectedApplication.description || "Açıklama eklenmemiş."}</p>
                            </div>

                            {isRejecting && (
                                <form onSubmit={(event) => void handleReject(event)} className="sm:col-span-2">
                                    <label htmlFor="rejection-reason" className="mb-2 block text-sm font-semibold text-[#101d35]">Ret gerekçesi <span className="text-red-500">*</span></label>
                                    <textarea
                                        id="rejection-reason"
                                        value={rejectionReason}
                                        onChange={(event) => setRejectionReason(event.target.value)}
                                        maxLength={500}
                                        required
                                        rows={4}
                                        placeholder="Başvurunun neden reddedildiğini yazın"
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    />
                                    <p className="mt-1 text-right text-xs text-slate-400">{rejectionReason.length}/500</p>
                                    <div className="mt-4 flex justify-end gap-3">
                                        <button type="button" onClick={() => setIsRejecting(false)} disabled={actionLoading} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Vazgeç</button>
                                        <button type="submit" disabled={actionLoading || !rejectionReason.trim()} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{actionLoading ? "İşleniyor..." : "Gerekçeyle reddet"}</button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {!isRejecting && (
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
                                <button onClick={() => setIsRejecting(true)} disabled={actionLoading} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Reddet</button>
                                <button onClick={() => void handleApprove()} disabled={actionLoading} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{actionLoading ? "İşleniyor..." : "Başvuruyu onayla"}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
            <p className="mt-1 break-words text-sm font-medium text-slate-700">{value}</p>
        </div>
    );
}

export default AdminSellerApplicationsPage;
