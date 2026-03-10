import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { reservationsApi, settingsApi } from '../../../lib/api';
import { Loader2, Printer } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContractPrint() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [searchParams] = useSearchParams();
    const shouldPrint = searchParams.get('action') === 'print';

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!id) return;
                const [resData, set] = await Promise.all([
                    reservationsApi.getById(id),
                    settingsApi.get()
                ]);
                setReservation(resData);
                setSettings(set);

                if (shouldPrint) {
                    setTimeout(() => {
                        window.print();
                    }, 800);
                }
            } catch (err: any) {
                console.error(err);
                toast.error("Erreur");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, shouldPrint]);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!reservation) return <div className="p-10 text-center">Introuvable</div>;

    // Remove unused calculation
    // const days = ...

    return (
        <div className="bg-[#f1f5f9] min-h-screen font-sans text-slate-900">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 5mm; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    .page-container { padding: 30px !important; margin: 0 !important; width: 100% !important; border: none !important; box-shadow: none !important; }
                }
            `}} />
            <Toaster />

            <div className="print:hidden fixed top-6 right-6 flex gap-3 z-50">
                <Link to={`/admin/reservations/${id}`} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold">Retour</Link>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Printer className="w-4 h-4" /> IMPRIMER
                </button>
            </div>

            <div className="max-w-[850px] mx-auto my-10 bg-white p-12 shadow-xl border border-slate-100 rounded-3xl page-container">
                <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-900">
                    <div>
                        <img src="/trm-logo-pour-arriere-blanc.png" alt="Logo" className="h-14 mb-3" />
                        <div className="text-[11px] text-slate-600">
                            <p className="font-black text-slate-900 uppercase text-lg leading-tight">{settings?.company_name}</p>
                            <p>{settings?.address}</p>
                            <p className="font-bold">Tél: {settings?.phone}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">CONTRAT DE LOCATION</h1>
                        <p className="text-sm font-bold text-slate-400 mt-1">DOSSIER N° {id?.slice(0, 10).toUpperCase()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Locataire</p>
                        <p className="font-black text-lg text-slate-900 uppercase leading-none">{reservation.customers?.full_name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-2">CIN/PASS: {reservation.customers?.cin || reservation.customers?.passport}</p>
                        <p className="text-[11px] font-medium text-slate-500">Tél: {reservation.customers?.phone}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">Véhicule</p>
                        <div className="text-right">
                            <p className="font-black text-lg text-slate-900 uppercase leading-none">{reservation.vehicles?.brand} {reservation.vehicles?.model}</p>
                            <p className="font-black text-xl text-slate-900 mt-1">{reservation.vehicles?.plate_number}</p>
                        </div>
                    </div>
                </div>

                <div className="border border-slate-900 rounded-2xl overflow-hidden mb-8">
                    <div className="grid grid-cols-3 divide-x divide-slate-900 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest text-center py-1.5">
                        <div>Départ</div>
                        <div>Retour</div>
                        <div>Total</div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-slate-900 text-center items-center py-3">
                        <div className="font-bold text-sm">{new Date(reservation.start_date).toLocaleDateString('fr-FR')}</div>
                        <div className="font-bold text-sm">{new Date(reservation.end_date).toLocaleDateString('fr-FR')}</div>
                        <div className="font-black text-sm">{reservation.total_price.toLocaleString()} MAD</div>
                    </div>
                </div>

                {/* Compact Conditions Section */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center border-b pb-1">Conditions Simplifiées</p>
                    <div className="grid grid-cols-2 gap-x-8 text-[8px] leading-tight text-slate-600">
                        <ul className="list-disc pl-3 space-y-1">
                            <li>Usage personnel uniquement. Pas de sous-location.</li>
                            <li>Véhicule remis propre et avec le plein de carburant.</li>
                            <li>Locataire responsable des amendes et infractions.</li>
                        </ul>
                        <ul className="list-disc pl-3 space-y-1">
                            <li>Déclarer tout accident (constat) sous 24h.</li>
                            <li>Franchise applicable selon les conditions d'assurance.</li>
                            <li>Restituer le véhicule au lieu indiqué au contrat.</li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mt-12 mb-4">
                    <div className="text-center group">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-16">Signature Locataire</p>
                        <div className="h-px w-20 bg-slate-100 mx-auto"></div>
                        <p className="text-[7px] text-slate-400 mt-1 uppercase tracking-tighter italic">Lu et approuvé</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-16">Cachet Agence</p>
                        <div className="h-px w-20 bg-slate-100 mx-auto"></div>
                    </div>
                </div>

                <div className="text-center opacity-30 mt-8 pt-4 border-t border-slate-50">
                    <p className="text-[7px] font-black text-slate-900 uppercase tracking-[0.5em] leading-none">
                        {settings?.company_name} • RC: 123456 • IF: 12345678 • ICE: 123456789012345
                    </p>
                </div>
            </div>
        </div>
    );
}
