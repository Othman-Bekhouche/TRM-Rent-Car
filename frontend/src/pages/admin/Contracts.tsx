import { useState, useEffect } from 'react';
import { FileText, Search, Printer, Eye, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contractsApi } from '../../lib/api';

export default function Contracts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            setLoading(true);
            const data = await contractsApi.getAll();
            setContracts(data);
        } catch (error) {
            console.error("Error loading contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContracts = contracts.filter(c =>
        c.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rental_contracts[0]?.contract_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Contrats de Location</h1>
                    <p className="text-slate-500 text-sm mt-1">Historique des contrats signés électroniquement et physiquement</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Chercher un contrat, client..."
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
                                    <th className="p-4 rounded-tl-xl whitespace-nowrap">N° Contrat</th>
                                    <th className="p-4 whitespace-nowrap">Client</th>
                                    <th className="p-4 whitespace-nowrap">Véhicule</th>
                                    <th className="p-4 whitespace-nowrap">Période</th>
                                    <th className="p-4 whitespace-nowrap">Statut / Caution</th>
                                    <th className="p-4 rounded-tr-xl text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredContracts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">Aucun contrat trouvé.</td>
                                    </tr>
                                ) : (
                                    filteredContracts.map((res: any) => {
                                        const contract = res.rental_contracts[0] || {};
                                        return (
                                            <tr key={contract.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-mono text-xs font-bold text-[#1C0770]">
                                                            {contract.contract_number ? contract.contract_number.toUpperCase() : `CTR-${res.id.slice(0, 8).toUpperCase()}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-slate-800 text-xs">
                                                    {res.customers?.full_name}
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-slate-800 text-xs">{res.vehicles?.brand} {res.vehicles?.model}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase">{res.vehicles?.plate_number}</p>
                                                </td>
                                                <td className="p-4 text-xs font-medium text-slate-600">
                                                    {new Date(res.start_date).toLocaleDateString('fr-FR')} → {new Date(res.end_date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-xs text-slate-500">Signé le {new Date(contract.created_at).toLocaleDateString('fr-FR')}</p>
                                                </td>
                                                <td className="p-4 flex items-center justify-end gap-2">
                                                    <Link to={`/admin/reservations/${res.id}/print/contract`} className="p-2 bg-white text-slate-400 hover:text-[#3A9AFF] border border-transparent hover:border-[#3A9AFF]/20 rounded-lg transition-all" title="Voir le contrat">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link to={`/admin/reservations/${res.id}/print/contract?action=print`} target="_blank" className="p-2 bg-white text-slate-400 hover:text-[#261CC1] border border-transparent hover:border-[#261CC1]/20 rounded-lg transition-all" title="Imprimer Contrat">
                                                        <Printer className="w-4 h-4" />
                                                    </Link>
                                                    <Link to={`/admin/reservations/${res.id}/print/contract?action=download`} target="_blank" className="p-2 bg-white text-slate-400 hover:text-emerald-500 border border-transparent hover:border-emerald-500/20 rounded-lg transition-all" title="Télécharger PDF">
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
