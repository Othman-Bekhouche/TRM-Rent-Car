import { useState, useEffect } from 'react';
import { Search, Printer, Receipt, Loader2, Eye, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { invoicesApi } from '../../lib/api';

export default function Invoices() {
    const [searchTerm, setSearchTerm] = useState('');
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoicesApi.getAll();
            setInvoices(data);
        } catch (error) {
            console.error("Error loading invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(c =>
        c.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.invoices[0]?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Facturation</h1>
                    <p className="text-slate-500 text-sm mt-1">Historique des factures générées pour vos clients</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher une facture, client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm rounded-xl focus:ring-[#3A9AFF] focus:border-[#3A9AFF]"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[#3A9AFF] animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F0F4FF] text-slate-400 text-[10px] uppercase tracking-[0.1em] font-bold">
                                    <th className="p-4 rounded-tl-xl whitespace-nowrap">N° Facture</th>
                                    <th className="p-4 whitespace-nowrap">Client</th>
                                    <th className="p-4 whitespace-nowrap">Montant Total</th>
                                    <th className="p-4 whitespace-nowrap">Date</th>
                                    <th className="p-4 whitespace-nowrap">Statut Paiement</th>
                                    <th className="p-4 rounded-tr-xl text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">Aucune facture trouvée.</td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((res: any) => {
                                        const invoice = res.invoices[0] || {};
                                        const total = invoice.total_amount || res.total_price;
                                        const status = invoice.payment_status || res.payment_status;
                                        return (
                                            <tr key={invoice.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                            <Receipt className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-mono text-xs font-bold text-[#1C0770]">
                                                            {invoice.invoice_number ? invoice.invoice_number.toUpperCase() : `FAC-${res.id.slice(0, 8).toUpperCase()}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-slate-800 text-xs">{res.customers?.full_name}</p>
                                                </td>
                                                <td className="p-4 font-black text-[#1C0770] text-sm whitespace-nowrap">
                                                    {total} MAD
                                                </td>
                                                <td className="p-4 text-xs font-medium text-slate-600">
                                                    {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold border ${status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                        {status === 'paid' ? 'Payée' : 'En attente'}
                                                    </span>
                                                </td>
                                                <td className="p-4 flex items-center justify-end gap-2">
                                                    <Link to={`/admin/reservations/${res.id}/print/invoice`} className="p-2 bg-white text-slate-400 hover:text-[#3A9AFF] border border-transparent hover:border-[#3A9AFF]/20 rounded-lg transition-all" title="Voir la facture">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link to={`/admin/reservations/${res.id}/print/invoice?action=print`} target="_blank" className="p-2 bg-white text-slate-400 hover:text-[#261CC1] border border-transparent hover:border-[#261CC1]/20 rounded-lg transition-all" title="Imprimer Facture">
                                                        <Printer className="w-4 h-4" />
                                                    </Link>
                                                    <Link to={`/admin/reservations/${res.id}/print/invoice?action=download`} target="_blank" className="p-2 bg-white text-slate-400 hover:text-emerald-500 border border-transparent hover:border-emerald-500/20 rounded-lg transition-all" title="Télécharger PDF">
                                                        <Download className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
