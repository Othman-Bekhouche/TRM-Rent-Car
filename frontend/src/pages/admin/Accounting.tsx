import { DollarSign, TrendingUp, Download, ArrowUpRight, CreditCard, Banknote, Receipt } from 'lucide-react';

const MONTHLY_REVENUE = [
    { month: 'Oct', revenue: 28000 },
    { month: 'Nov', revenue: 34000 },
    { month: 'Déc', revenue: 42000 },
    { month: 'Jan', revenue: 38000 },
    { month: 'Fév', revenue: 41000 },
    { month: 'Mar', revenue: 45200 },
];

const TRANSACTIONS = [
    { id: 'TRX-001', date: '12/03/2026', client: 'Mohammed Alaoui', type: 'Encaissement', method: 'Espèces', amount: '1 260 MAD', status: 'Payé' },
    { id: 'TRX-002', date: '10/03/2026', client: 'Sophie Martin', type: 'Encaissement', method: 'Virement', amount: '2 080 MAD', status: 'Payé' },
    { id: 'TRX-003', date: '08/03/2026', client: 'Hassan Benali', type: 'Caution', method: 'Espèces', amount: '3 000 MAD', status: 'En attente' },
    { id: 'TRX-004', date: '05/03/2026', client: 'Fatima El Ouardi', type: 'Remboursement', method: 'Virement', amount: '- 960 MAD', status: 'Remboursé' },
    { id: 'TRX-005', date: '01/03/2026', client: 'Youssef Ziani', type: 'Encaissement', method: 'Carte', amount: '1 500 MAD', status: 'Payé' },
];

export default function Accounting() {
    const maxRevenue = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Comptabilité</h1>
                    <p className="text-slate-500 text-sm mt-1">Suivi financier et chiffre d'affaires</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:shadow-md transition-all">
                        <Download className="w-4 h-4" /> Bilan Mensuel
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgba(38,28,193,0.15)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">CA Mars 2026</p>
                        <div className="p-2 bg-gradient-to-br from-[#261CC1] to-[#3A9AFF] rounded-xl text-white"><DollarSign className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-[#1C0770]">45 200 MAD</p>
                    <div className="flex items-center mt-2 text-xs font-bold text-emerald-600"><ArrowUpRight className="w-3 h-3 mr-1" />+12.5%</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Encaissements</p>
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Banknote className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-emerald-600">38 400 MAD</p>
                    <p className="text-xs text-slate-400 mt-2">Sur 12 factures</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mois en cours</p>
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><CreditCard className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-amber-600">En progréssion</p>
                    <p className="text-xs text-slate-400 mt-2">Dépôts/Cautions temporairement suspendus</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Charges Mensuelles</p>
                        <div className="p-2 bg-red-50 rounded-xl text-red-500"><Receipt className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-red-500">12 800 MAD</p>
                    <p className="text-xs text-slate-400 mt-2">Maintenance + assurance</p>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-[#1C0770] flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#3A9AFF]" /> Évolution CA (6 derniers mois)</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-end gap-6 h-52">
                        {MONTHLY_REVENUE.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <p className="text-xs font-bold text-[#1C0770]">{(m.revenue / 1000).toFixed(0)}k</p>
                                <div
                                    className="w-full bg-gradient-to-t from-[#261CC1] to-[#3A9AFF] rounded-t-lg transition-all duration-500 hover:from-[#1C0770] hover:to-[#261CC1] cursor-pointer"
                                    style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                                />
                                <span className="text-[11px] text-slate-400 font-semibold">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-[#1C0770]">Dernières Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <th className="p-4">Réf</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Méthode</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {TRANSACTIONS.map((t, i) => (
                                <tr key={i} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50">
                                    <td className="p-4 font-mono text-xs text-[#261CC1] font-bold">{t.id}</td>
                                    <td className="p-4 text-slate-500">{t.date}</td>
                                    <td className="p-4 font-semibold text-slate-800">{t.client}</td>
                                    <td className="p-4 text-slate-600">{t.type}</td>
                                    <td className="p-4 text-slate-500">{t.method}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${t.status === 'Payé' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            t.status === 'En attente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>{t.status}</span>
                                    </td>
                                    <td className={`p-4 text-right font-black ${t.amount.startsWith('-') ? 'text-red-500' : 'text-[#1C0770]'}`}>{t.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
