import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { reservationsApi, invoicesApi, settingsApi } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { Loader2, Printer } from 'lucide-react';
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
                    }, 800);
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

    return (
        <div className="bg-white min-h-screen font-sans text-slate-900 antialiased">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
                
                body { font-family: 'Inter', sans-serif; }

                @media print {
                    @page { size: A4; margin: 0; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    .invoice-container { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 15mm !important; }
                    .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                }
            `}} />
            <Toaster />

            {/* Print Controls */}
            <div className="print:hidden fixed top-8 right-8 flex gap-3 z-50">
                <Link
                    to={['admin', 'super_admin', 'gestionnaire', 'assistant'].includes(role || '') ? `/admin/reservations/${id}` : '/profile'}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                    Retour
                </Link>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-black transition-all uppercase tracking-widest">
                    <Printer className="w-4 h-4" /> Imprimer
                </button>
            </div>

            <div className="max-w-[850px] mx-auto my-6 bg-white invoice-container p-12">

                {/* Header: Compressed but Elegant */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <img src="/trm-logo-pour-arriere-blanc.png" alt="Logo" className="h-14 mb-6 object-contain" />
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Facture</h1>
                        <div className="mt-2 flex gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <span>ID: {invoice?.invoice_number || id?.slice(0, 8).toUpperCase()}</span>
                            <span>•</span>
                            <span>{new Date().toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                    <div className="text-right max-w-[220px]">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1 border-b border-slate-900 pb-0.5 inline-block">Émetteur</p>
                        <p className="font-bold text-base text-slate-900 leading-tight">{settings?.company_name || 'TRM Rent Car'}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{settings?.address}</p>
                        <p className="text-[10px] font-bold text-slate-900 mt-1">Tél: {settings?.phone}</p>
                    </div>
                </div>

                {/* Info Grid: Compressed */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-1">Client</p>
                        <p className="font-black text-xl text-slate-900 uppercase tracking-tight">{reservation.customers?.full_name}</p>
                        <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                            <p className="font-medium underline decoration-slate-200 underline-offset-4 decoration-1">CIN: {reservation.customers?.cin || 'N/A'}</p>
                            <p>Tél: {reservation.customers?.phone}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-1">Détails de location</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-end border-b border-slate-50 pb-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Véhicule</span>
                                <span className="font-bold text-xs text-slate-900 uppercase tracking-tight">{reservation.vehicles?.brand} {reservation.vehicles?.model}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Matricule</span>
                                <span className="font-black text-xs text-slate-900 uppercase">{reservation.vehicles?.plate_number}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table: Compressed */}
                <div className="mb-10">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="py-2 text-left text-[10px] font-black text-slate-900 uppercase tracking-widest">Désignation</th>
                                <th className="py-2 text-center text-[10px] font-black text-slate-900 uppercase tracking-widest">Durée</th>
                                <th className="py-2 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest">Total Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-6">
                                    <p className="font-black text-slate-900 uppercase text-base leading-none tracking-tight">Location de véhicule de tourisme</p>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Service journalier premium • Assurance incluse</p>
                                </td>
                                <td className="py-6 text-center">
                                    <span className="text-sm font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded tracking-widest">{days} JRS</span>
                                </td>
                                <td className="py-6 text-right">
                                    <span className="text-xl font-black text-slate-900 tracking-tighter">{total.toLocaleString()} MAD</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Finance Box: Precise & Compact */}
                <div className="flex justify-between items-start gap-12 mb-12">
                    <div className="flex-1 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode de règlement</p>
                                <div className="flex flex-col gap-2 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 border border-slate-400 rounded-sm flex items-center justify-center ${reservation.payment_method === 'Espèces' ? 'bg-slate-900' : ''}`}></div>
                                        <span className="text-[9px] font-bold uppercase text-slate-600">Espèces / Cash</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 border border-slate-400 rounded-sm flex items-center justify-center ${reservation.payment_method === 'Virement' ? 'bg-slate-900' : ''}`}></div>
                                        <span className="text-[9px] font-bold uppercase text-slate-600">Virement</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border border-slate-400 rounded-sm"></div>
                                        <span className="text-[9px] font-bold uppercase text-slate-600">Chèque</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col justify-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">État Paiement</p>
                                <p className="text-[10px] font-black tracking-[0.2em] text-slate-900 uppercase underline decoration-2 decoration-slate-900 underline-offset-4">
                                    {reservation.payment_status === 'paid' ? 'Payé' : 'À Régler'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="w-64 border-t-2 border-slate-900 pt-4 text-right">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">TOTAL À PAYER TTC</span>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{total.toLocaleString()}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Dirhams Marocains</p>
                    </div>
                </div>

                {/* Signature Block: Optimized for Page Fitting */}
                <div className="grid grid-cols-2 gap-20 text-center mb-10 pt-4">
                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-12">Signature Client</p>
                        <p className="text-[7px] text-slate-300 italic -mt-8">Lu et approuvé</p>
                    </div>
                    <div className="border-t border-slate-100 pt-4 relative">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-12">Cachet Agence</p>
                        <p className="text-[7px] text-slate-300 italic -mt-8">Réservé à l'administration</p>
                    </div>
                </div>

                {/* Footer Legal: Compact */}
                <div className="text-center pt-6 border-t border-slate-50">
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.5em] mb-1 leading-relaxed">
                        RC: 123456 • IF: 12345678 • PATENTE: 12345678 • ICE: 123456789012345
                    </p>
                    <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest opacity-20">
                        Document officiel • TRM RENT CAR
                    </p>
                </div>
            </div>
        </div>
    );
}
