import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { reservationsApi, invoicesApi, settingsApi } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { Loader2, Printer, MapPin, Phone, CreditCard, Hash, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function InvoicePrint() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<any>(null);
    const [invoice, setInvoice] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const shouldPrint = searchParams.get('action') === 'print';

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!id) return;
                const [resData, invData, set, { data: { user: authUser } }] = await Promise.all([
                    reservationsApi.getById(id),
                    invoicesApi.getByReservation(id),
                    settingsApi.get(),
                    supabase.auth.getUser()
                ]);

                if (authUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', authUser.id)
                        .single();
                    setRole(profile?.role || 'client');
                }

                setReservation(resData);
                setInvoice(invData);
                setSettings(set);

                if (shouldPrint) {
                    setTimeout(() => {
                        window.print();
                    }, 1000);
                }
            } catch (err: any) {
                console.error(err);
                toast.error("Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, shouldPrint]);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    if (!reservation) return <div className="p-10 text-center uppercase font-bold tracking-widest text-slate-400">Dossier Introuvable</div>;

    const days = Math.max(1, Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24)));
    const total = invoice?.total_amount || reservation.total_price;
    const pricePerDay = reservation.vehicles?.price_per_day || (total / days);

    return (
        <div className="bg-[#f1f5f9] min-h-screen font-sans text-slate-900 antialiased pb-20">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                
                body { font-family: 'Outfit', sans-serif; }

                @media print {
                    @page { size: A4; margin: 0; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    .invoice-container { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 15mm !important; }
                    .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                    .bg-slate-900 { background-color: #0f172a !important; -webkit-print-color-adjust: exact; color: white !important; }
                }
            `}} />
            <Toaster />

            <div className="print:hidden fixed top-8 right-8 flex gap-3 z-50">
                <Link
                    to={['admin', 'super_admin', 'gestionnaire', 'assistant'].includes(role || '') ? `/admin/reservations/${id}` : '/profile'}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600"
                >
                    Retour au dossier
                </Link>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-black transition-all uppercase tracking-widest">
                    <Printer className="w-4 h-4" /> Imprimer la facture
                </button>
            </div>

            <div className="max-w-[850px] mx-auto my-6 bg-white shadow-2xl rounded-[3rem] invoice-container p-16 relative overflow-hidden">

                {/* Accent Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0"></div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-16">
                        <div className="space-y-4">
                            <img src="/trm-logo-pour-arriere-blanc.png" alt="Logo" className="h-16 object-contain" />
                            <div>
                                <h1 className="text-5xl font-[900] text-slate-900 tracking-tighter uppercase leading-none">Facture</h1>
                                <div className="mt-3 flex items-center gap-3">
                                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full tracking-[0.2em] uppercase">
                                        N° {invoice?.invoice_number || id?.slice(0, 8).toUpperCase()}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] text-right min-w-[240px]">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Émetteur</p>
                                <p className="font-black text-xl leading-none mb-2">{settings?.company_name || 'TRM Rent Car'}</p>
                                <p className="text-[10px] text-white/60 leading-tight mb-4">{settings?.address}</p>
                                <p className="font-bold text-sm flex items-center justify-end gap-2"><Phone className="w-3 h-3" /> {settings?.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Parties Section */}
                    <div className="grid grid-cols-2 gap-16 mb-16">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Destinataire / Client</p>
                            <div>
                                <p className="font-black text-2xl text-slate-900 uppercase tracking-tight">{reservation.customers?.full_name}</p>
                                <div className="mt-2 space-y-1 text-xs text-slate-500 font-medium">
                                    <p className="flex items-center gap-2"><Hash className="w-3 h-3" /> CIN: {reservation.customers?.cin || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {reservation.customers?.phone}</p>
                                    <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {reservation.customers?.city || 'Maroc'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Détails Location</p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Véhicule</span>
                                    <span className="font-black text-sm text-slate-900 uppercase">{reservation.vehicles?.brand} {reservation.vehicles?.model}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2 bg-white rounded-2xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Matricule</span>
                                    <span className="font-black text-sm text-[#261CC1] uppercase tracking-wider">{reservation.vehicles?.plate_number}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="mb-12 overflow-hidden rounded-[2.5rem] border-2 border-slate-900/5">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b-2 border-slate-900/5">
                                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Désignation des prestations</th>
                                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">P.U.</th>
                                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Qté</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-900 uppercase tracking-widest">Montant TTC</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <tr>
                                    <td className="px-8 py-8">
                                        <p className="font-black text-slate-900 uppercase text-lg leading-none tracking-tight">Location de véhicule de tourisme</p>
                                        <p className="text-xs text-slate-400 mt-2 font-medium">Du {new Date(reservation.start_date).toLocaleDateString()} au {new Date(reservation.end_date).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-8 text-center text-sm font-bold text-slate-600">
                                        {pricePerDay.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-8 text-center font-black text-slate-900 text-lg">
                                        {days} <span className="text-[10px] text-slate-400">Jours</span>
                                    </td>
                                    <td className="px-8 py-8 text-right font-[900] text-2xl text-slate-900 tracking-tighter">
                                        {(pricePerDay * days).toLocaleString()}
                                    </td>
                                </tr>
                                {Number(invoice?.extras_amount || 0) > 0 && (
                                    <tr>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-900 uppercase text-sm">Frais Supplémentaires / Extras</p>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">Kilométrage / Carburant / Autres</p>
                                        </td>
                                        <td className="px-8 py-6 text-center text-sm font-bold text-slate-600">---</td>
                                        <td className="px-8 py-6 text-center font-black text-slate-900">1</td>
                                        <td className="px-8 py-6 text-right font-black text-xl text-slate-900 tracking-tighter">
                                            {Number(invoice?.extras_amount).toLocaleString()}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary & Payment */}
                    <div className="grid grid-cols-12 gap-8 items-end mb-16">
                        <div className="col-span-12 lg:col-span-7 bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mode de règlement</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 border-2 border-slate-200 rounded-lg flex items-center justify-center ${reservation.payment_method === 'Espèces' ? 'bg-slate-900 border-slate-900 text-white' : ''}`}>
                                                {reservation.payment_method === 'Espèces' && <CreditCard className="w-3 h-3" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-600">{reservation.payment_method || 'Espèces'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-slate-200 rounded-lg"></div>
                                            <span className="text-[10px] font-black uppercase text-slate-300">Virement / Chèque</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col justify-between border-l border-slate-200 pl-8">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Facture</p>
                                        <span className={`inline-block text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full ${reservation.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {reservation.payment_status === 'paid' ? 'Soldée' : 'À régler'}
                                        </span>
                                    </div>
                                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter leading-tight mt-4">
                                        Arrêtée la présente facture à la somme de {total.toLocaleString()} Dirhams.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-5 bg-white border-4 border-slate-900 p-8 rounded-[3rem] text-center shadow-xl shadow-slate-900/5">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Net à Payer TTC</span>
                            <p className="text-5xl font-[900] text-slate-900 tracking-tighter leading-none">{total.toLocaleString()}</p>
                            <p className="text-[11px] font-black text-[#261CC1] uppercase tracking-[0.5em] mt-3">Dirhams (MAD)</p>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-20 text-center pt-8 border-t border-slate-100 mb-10">
                        <div className="space-y-16">
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Signature du Client</p>
                            <div className="h-0.5 w-16 bg-slate-50 mx-auto"></div>
                        </div>
                        <div className="space-y-16">
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Cachet de l'Agence</p>
                            <div className="h-0.5 w-16 bg-slate-50 mx-auto"></div>
                        </div>
                    </div>

                    {/* Legal Footer */}
                    <div className="text-center">
                        <div className="inline-flex flex-wrap justify-center gap-x-6 gap-y-2 text-[8px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50 pt-8 w-full max-w-lg mx-auto">
                            <span className="flex items-center gap-1">RC: {settings?.legal_rc || '---'}</span>
                            <span className="flex items-center gap-1">IF: {settings?.legal_if || '---'}</span>
                            <span className="flex items-center gap-1">Patente: {settings?.legal_patente || '---'}</span>
                            <span className="flex items-center gap-1">ICE: {settings?.legal_ice || '---'}</span>
                        </div>
                        <p className="text-[9px] font-[900] text-slate-900 uppercase tracking-[0.6em] mt-4 opacity-10">
                            TRM RENT CAR • {settings?.website || 'WWW.TRMRENTCAR.MA'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
