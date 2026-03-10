import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reservationsApi, invoicesApi, settingsApi } from '../../../lib/api';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function InvoicePrint() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<any>(null);
    const [invoice, setInvoice] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!id) return;
                const [resData, invData, set] = await Promise.all([
                    reservationsApi.getById(id),
                    invoicesApi.getByReservation(id),
                    settingsApi.get()
                ]);
                setReservation(resData);
                setInvoice(invData);
                setSettings(set);
            } catch (err: any) {
                console.error(err);
                toast.error("Erreur de chargement de la facture");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!reservation) return <div className="p-10 text-center">Réservation introuvable</div>;

    const days = Math.max(1, Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24)));
    const pricePerDay = reservation.vehicles?.price_per_day || 0;
    const subtotal = pricePerDay * days;
    const extras = invoice?.extras_amount || Math.max(0, reservation.total_price - subtotal);
    const total = invoice?.total_amount || reservation.total_price;

    return (
        <div className="bg-slate-100 text-slate-800 min-h-screen font-sans p-8 relative">
            <Toaster />
            {/* Action Bar (hidden in print) */}
            <div className="print:hidden flex justify-between items-center mb-8 max-w-4xl mx-auto bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <Link to={`/admin/reservations/${id}`} className="flex items-center gap-2 text-slate-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4" /> Retour au dossier
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-2 bg-[#261CC1] text-white rounded-lg font-bold hover:bg-[#1C0770] transition shadow-lg shadow-[#261CC1]/20"
                    >
                        <Printer className="w-4 h-4" /> Imprimer
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-[#261CC1] border-2 border-[#261CC1] rounded-lg font-bold hover:bg-slate-50 transition"
                    >
                        Télécharger PDF
                    </button>
                </div>
            </div>

            {/* A4 Container */}
            <div className="max-w-4xl mx-auto bg-white p-12 border border-slate-200 shadow-md print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-blue-600 pb-8 mb-8">
                    <div>
                        <img src="/trm-logo-pour-arriere-noir.png" alt="TRM Rent Car" className="h-[70px] mb-4 object-contain brightness-0" style={{ filter: 'grayscale(100%) brightness(0)' }} />
                        <div className="text-sm space-y-1 text-slate-600 font-medium">
                            <p className="font-bold text-xl text-slate-800 mb-2">{settings?.company_name || 'TRM Rent Car'}</p>
                            <p>{settings?.address || 'Appt Sabrine, 2ème Étage N°6 Bloc A, 65800 Taourirt'}</p>
                            <p>Tél : {settings?.phone || '06 06 06 6426'}</p>
                            <p>Email : {settings?.email || 'trm.rentcar@gmail.com'}</p>
                            <div className="pt-2 text-[10px] text-slate-500 font-mono">
                                <p>RC : 12345 · Patente : 12345678</p>
                                <p>IF : 12345678 · ICE : 000000000000000</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-black uppercase tracking-widest text-slate-800 mb-2">Facture</h1>
                        <p className="text-xl font-medium text-blue-600 mb-1">N° {invoice?.invoice_number || `FAC-${reservation.id.slice(0, 8).toUpperCase()}`}</p>
                        <p className="text-sm text-slate-500">Date : {invoice ? new Date(invoice.invoice_date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</p>
                        <div className="mt-4 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded border border-slate-200 inline-block">
                            État : {invoice?.payment_status === 'paid' || reservation.payment_status === 'paid' ? 'Payée' : 'En attente'}
                        </div>
                    </div>
                </div>

                {/* Client Box */}
                <div className="flex justify-end mb-12">
                    <div className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <h2 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">Facturé à</h2>
                        <div className="text-sm space-y-2">
                            <p className="font-bold text-lg text-slate-800">{reservation.customers?.full_name}</p>
                            <p className="text-slate-600">{reservation.customers?.address || ''}</p>
                            <p className="text-slate-600">{reservation.customers?.city || ''}</p>
                            <p className="text-slate-600 pt-2"><span className="font-medium text-slate-500">Tél :</span> {reservation.customers?.phone}</p>
                            <p className="text-slate-600"><span className="font-medium text-slate-500 inline-block w-24">Email :</span> {reservation.customers?.email}</p>
                            <p className="text-slate-600"><span className="font-medium text-slate-500 inline-block w-24">CIN/Pass. :</span> {reservation.customers?.cin || reservation.customers?.passport || 'N/A'}</p>
                            <p className="text-slate-600 pt-2 border-t border-slate-200 mt-2"><span className="font-medium text-slate-500 inline-block w-24">Permis N° :</span> {reservation.customers?.driver_license || '_________________'}</p>
                        </div>
                    </div>
                </div>

                {/* Reservation Context */}
                <div className="flex gap-10 mb-8 border-y border-slate-100 py-4 text-sm bg-slate-50 px-4 rounded-xl">
                    <div>
                        <p className="text-slate-400 font-bold uppercase text-xs mb-1">Véhicule</p>
                        <p className="font-medium text-slate-800">{reservation.vehicles?.brand} {reservation.vehicles?.model}</p>
                        <p className="text-slate-500 text-xs">{reservation.vehicles?.plate_number}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase text-xs mb-1">Période</p>
                        <p className="font-medium text-slate-800">{new Date(reservation.start_date).toLocaleDateString('fr-FR')} → {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
                        <p className="text-slate-500 text-xs">{days} jour(s)</p>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase text-xs mb-1">Dossier / Résa</p>
                        <p className="font-medium text-slate-800">{reservation.reservation_number || reservation.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="mb-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-3 px-4 font-bold text-sm text-slate-600 uppercase w-1/2">Description</th>
                                <th className="py-3 px-4 font-bold text-sm text-slate-600 uppercase text-center w-1/6">Quantité</th>
                                <th className="py-3 px-4 font-bold text-sm text-slate-600 uppercase text-right w-1/6">Prix Unitaire</th>
                                <th className="py-3 px-4 font-bold text-sm text-slate-600 uppercase text-right w-1/6">Total MAD</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-slate-100">
                                <td className="py-4 px-4 text-slate-800 font-medium">Location véhicule: {reservation.vehicles?.brand} {reservation.vehicles?.model}</td>
                                <td className="py-4 px-4 text-slate-600 text-center">{days} j.</td>
                                <td className="py-4 px-4 text-slate-600 text-right">{pricePerDay}</td>
                                <td className="py-4 px-4 text-slate-800 font-medium text-right">{subtotal}</td>
                            </tr>
                            {extras > 0 && (
                                <tr className="border-b border-slate-100">
                                    <td className="py-4 px-4 text-slate-800 font-medium">Suppléments (Siège enfant, etc.)</td>
                                    <td className="py-4 px-4 text-slate-600 text-center">1</td>
                                    <td className="py-4 px-4 text-slate-600 text-right">{extras}</td>
                                    <td className="py-4 px-4 text-slate-800 font-medium text-right">{extras}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals Box */}
                <div className="flex justify-end mb-16">
                    <div className="w-1/2">
                        <div className="space-y-3 px-4 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Sous-total HT</span>
                                <span>{total * 0.8} MAD</span>
                            </div>
                            <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-3">
                                <span>TVA (20%)</span>
                                <span>{total * 0.2} MAD</span>
                            </div>
                            <div className="flex justify-between font-black text-xl text-blue-600 items-end pt-2">
                                <span className="uppercase text-sm text-slate-800 tracking-wider">Total TTC</span>
                                <span>{total} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-8">
                    <p className="mb-1 font-medium">Merci de votre confiance !</p>
                    <p>En cas de retard de paiement, des pénalités pourraient être appliquées conformément aux conditions générales de location.</p>
                    <p className="mt-2 font-mono text-[10px]">
                        {settings?.company_name || 'TRM Rent Car'} - SARL AU au capital de 100.000 MAD - Siège social: {settings?.address || 'Taourirt, Maroc'}
                    </p>
                </div>
            </div>
        </div>
    );
}
