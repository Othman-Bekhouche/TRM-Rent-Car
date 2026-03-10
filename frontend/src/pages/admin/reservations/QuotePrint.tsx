import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { quotesApi, settingsApi } from '../../../lib/api';
import { Loader2, Printer, ArrowLeft, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function QuotePrint() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [quote, setQuote] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [searchParams] = useSearchParams();
    const shouldPrint = searchParams.get('action') === 'print';

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!id) return;
                const [qData, set] = await Promise.all([
                    quotesApi.getById(id),
                    settingsApi.get()
                ]);
                setQuote(qData);
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
    if (!quote) return <div className="p-10 text-center">Introuvable</div>;

    const days = quote.total_days || 1;
    const total = quote.total_amount || 0;

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    .quote-container { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
                }
            `}} />
            <Toaster />

            <div className="print:hidden fixed top-6 right-6 flex gap-3 z-50">
                <Link to="/admin/quotes" className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm">Retour</Link>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Printer className="w-4 h-4" /> IMPRIMER
                </button>
            </div>

            <div className="max-w-[850px] mx-auto my-10 bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100 quote-container">
                <div className="p-12 border-b-2 border-slate-900 flex justify-between items-center">
                    <div>
                        <img src="/trm-logo-pour-arriere-blanc.png" alt="Logo" className="h-16 mb-6" />
                        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">DEVIS</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Référence</p>
                        <p className="text-xl font-black text-slate-900">{quote.quote_number}</p>
                        <div className="mt-4 px-3 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-widest">
                            Valable 15 jours
                        </div>
                    </div>
                </div>

                <div className="p-12">
                    <div className="grid grid-cols-2 gap-16 mb-16">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informations Client</p>
                            <p className="font-black text-2xl text-slate-900 uppercase tracking-tight">{quote.customers?.full_name}</p>
                            <p className="text-slate-500 mt-2">{quote.customers?.phone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Détails de l'offre</p>
                            <p className="font-black text-xl text-slate-900 uppercase">{quote.vehicles?.brand} {quote.vehicles?.model}</p>
                            <p className="text-slate-500 mt-1">{days} Jours de location</p>
                        </div>
                    </div>

                    <table className="w-full mb-12">
                        <thead>
                            <tr className="border-b-2 border-slate-900 text-left">
                                <th className="py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest">Prestation</th>
                                <th className="py-4 text-right text-[11px] font-black text-slate-900 uppercase tracking-widest">Montant MAD</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <td className="py-8">
                                    <p className="font-black text-slate-800 uppercase text-lg">Location de véhicule</p>
                                    <p className="text-xs text-slate-400 mt-1 italic italic">Service de location journalière</p>
                                </td>
                                <td className="py-8 text-right font-black text-2xl text-slate-900">{total.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end pt-8">
                        <div className="w-80 bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Estimé TTC</p>
                            <div className="flex justify-center items-end">
                                <span className="text-4xl font-black text-slate-900 leading-none">{total.toLocaleString()}</span>
                                <span className="text-sm font-black text-slate-400 ml-2 uppercase">MAD</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-20 mt-24 text-center">
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-12">Bon pour accord client</p>
                            <div className="h-px w-16 bg-slate-100 mx-auto"></div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-12">Cachet Agence</p>
                            <div className="h-px w-16 bg-slate-100 mx-auto"></div>
                        </div>
                    </div>

                    <div className="mt-20 text-center opacity-30">
                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.6em]">TRM RENT CAR • DOCUMENT DE PROPOSITION</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
