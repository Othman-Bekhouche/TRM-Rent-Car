import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Download, ArrowUpRight, CreditCard, Banknote, Receipt, CarFront, MapPin, Loader2 } from 'lucide-react';
import { transactionsApi, reservationsApi, vehiclesApi, type Transaction, type Reservation, type Vehicle } from '../../lib/api';

export default function Accounting() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [txs, resas, vehs] = await Promise.all([
                    transactionsApi.getAll(),
                    reservationsApi.getAll(),
                    vehiclesApi.getAll()
                ]);
                setTransactions(txs);
                setReservations(resas);
                setVehicles(vehs);
            } catch (error) {
                console.error("Error loading accounting data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-10 h-10 text-[#3A9AFF] animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Chargement des données financières...</p>
            </div>
        );
    }

    // --- 1. Filtrage sur 4 Mois (Décembre 2025 -> Mars 2026) ---
    const dec25 = transactions.filter(t => t.transaction_date.startsWith('2025-12'));
    const jan26 = transactions.filter(t => t.transaction_date.startsWith('2026-01'));
    const feb26 = transactions.filter(t => t.transaction_date.startsWith('2026-02'));
    const mar26 = transactions.filter(t => t.transaction_date.startsWith('2026-03'));

    const calcRevenue = (txArray: Transaction[]) =>
        txArray.filter(t => t.transaction_type === 'encaissement' && t.status === 'Payé')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const calcExpenses = (txArray: Transaction[]) => 28000 + (txArray.length * 100); // Fausse dépense calculée logiquement

    const MONTHLY_REVENUE = [
        { month: 'Décembre 2025', revenue: calcRevenue(dec25), expenses: calcExpenses(dec25), label: 'Fin d\'année' },
        { month: 'Janvier 2026', revenue: calcRevenue(jan26), expenses: calcExpenses(jan26), label: 'Basse saison' },
        { month: 'Février 2026', revenue: calcRevenue(feb26), expenses: calcExpenses(feb26), label: 'Hausse' },
        { month: 'Mars 2026', revenue: calcRevenue(mar26), expenses: calcExpenses(mar26), label: 'En cours' },
    ];

    const maxRevenue = Math.max(...MONTHLY_REVENUE.map(m => m.revenue), 1);

    // Total Trimestre 2026 (Jan, Fev, Mars)
    const t1Revenue = calcRevenue([...jan26, ...feb26, ...mar26]);
    const t1Expenses = calcExpenses(jan26) + calcExpenses(feb26) + calcExpenses(mar26);
    const totalBenefit = t1Revenue - t1Expenses;

    const impayes = transactions.filter(t => t.status === 'Impayé').reduce((acc, curr) => acc + Number(curr.amount), 0);

    // --- 2. Répartition par Catégorie de véhicule (basé sur la flotte)---
    const totalVehicles = vehicles.length || 1;
    const countCategory = (searchText: string) => vehicles.filter(v => v.model.toLowerCase().includes(searchText)).length;

    const citadines = countCategory('citadine') + countCategory('208') + countCategory('sandero');
    const berlines = countCategory('berline') + countCategory('logan');
    const suvs = countCategory('suv') + countCategory('tucson') + countCategory('evoque');
    const utilitaires = countCategory('utilitaire') + countCategory('kangoo');

    const CAR_SIZES = [
        { category: 'Citadines', percentage: Math.round((citadines / totalVehicles) * 100), count: citadines, color: 'from-[#261CC1] to-[#3A9AFF]', text: 'text-[#3A9AFF]' },
        { category: 'Berlines', percentage: Math.round((berlines / totalVehicles) * 100), count: berlines, color: 'from-purple-600 to-indigo-500', text: 'text-purple-500' },
        { category: 'SUV', percentage: Math.round((suvs / totalVehicles) * 100), count: suvs, color: 'from-emerald-500 to-teal-400', text: 'text-emerald-500' },
        { category: 'Utilitaires', percentage: Math.round((utilitaires / totalVehicles) * 100), count: utilitaires, color: 'from-amber-500 to-orange-400', text: 'text-amber-500' },
    ].sort((a, b) => b.percentage - a.percentage);

    // --- 3. Répartition Géographique (Basé sur les réservations de 2026) ---
    const totalRes2026 = reservations.filter(r => r.start_date.startsWith('2026')).length || 1;
    const countCity = (cityRegex: RegExp) => reservations.filter(r => r.start_date.startsWith('2026') && cityRegex.test(r.pickup_location.toLowerCase())).length;

    const oujda = countCity(/oujda/);
    const fes = countCity(/fès|fes/);
    const nador = countCity(/nador/);
    const berkane_taourirt = countCity(/berkane|taourirt/);

    const REGIONAL_DISTRIBUTION = [
        { region: 'Oujda (Ville & Aéroport)', count: oujda, percentage: Math.round((oujda / totalRes2026) * 100) },
        { region: 'Fès (Aéroport & Ville)', count: fes, percentage: Math.round((fes / totalRes2026) * 100) },
        { region: 'Taourirt & Berkane', count: berkane_taourirt, percentage: Math.round((berkane_taourirt / totalRes2026) * 100) },
        { region: 'Nador (El Aroui)', count: nador, percentage: Math.round((nador / totalRes2026) * 100) },
    ].sort((a, b) => b.percentage - a.percentage);

    // Filter missing/corrupted Transactions and format
    const formatAmount = (val: number, type: string) => {
        const sign = type === 'remboursement' ? '-' : '';
        return `${sign} ${new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(val).replace('MAD', 'MAD')}`;
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Comptabilité & Analytique</h1>
                    <p className="text-slate-500 text-sm mt-1">Analyse financière et flotte dynamique (Données Réelles)</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:shadow-md transition-all">
                        <Download className="w-4 h-4" /> Bilan T1 2026 (PDF)
                    </button>
                </div>
            </div>

            {/* KPIs TRIMESTRIELS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgba(38,28,193,0.15)] relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">CA T1 2026</p>
                        <div className="p-2 bg-gradient-to-br from-[#261CC1] to-[#3A9AFF] rounded-xl text-white"><DollarSign className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-[#1C0770] relative z-10">{new Intl.NumberFormat('fr-FR').format(t1Revenue)} MAD</p>
                    <div className="flex items-center mt-2 text-[10px] font-bold text-emerald-600 relative z-10"><ArrowUpRight className="w-3 h-3 mr-1" /> Données 100% connectées</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bénéfice Net T1</p>
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Banknote className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-emerald-600">{new Intl.NumberFormat('fr-FR').format(totalBenefit)} MAD</p>
                    <p className="text-[10px] text-slate-400 mt-2">Dépenses est. déduites ({new Intl.NumberFormat('fr-FR').format(t1Expenses)} MAD)</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Moy. Panier</p>
                        <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><CreditCard className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-purple-600">
                        {totalRes2026 > 0 ? new Intl.NumberFormat('fr-FR').format(Math.round(t1Revenue / totalRes2026)) : 0} MAD
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">Volume locatif trimestriel</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Créances Impayées</p>
                        <div className="p-2 bg-red-50 rounded-xl text-red-500"><Receipt className="w-4 h-4" /></div>
                    </div>
                    <p className="text-2xl font-black text-red-500">{new Intl.NumberFormat('fr-FR').format(impayes)} MAD</p>
                    <p className="text-[10px] text-slate-400 mt-2">Clients à relancer immédiatement</p>
                </div>
            </div>

            {/* GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. EVOLUTION CA */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-bold text-[#1C0770] flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-[#3A9AFF]" /> Évolution CA (4 Derniers Mois)</h2>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-end">
                        <div className="flex items-end gap-4 h-40">
                            {MONTHLY_REVENUE.map((m, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md absolute -mt-8 pointer-events-none whitespace-nowrap z-50">
                                        CA: {m.revenue} | Dép: {m.expenses}
                                    </div>
                                    <p className="text-[10px] font-bold text-[#1C0770]">{m.revenue > 0 ? (m.revenue / 1000).toFixed(1) + 'k' : '0'}</p>
                                    <div className="w-full relative flex items-end justify-center h-full">
                                        <div
                                            className="absolute bottom-0 w-full bg-slate-200 rounded-t-sm z-0"
                                            style={{ height: `${Math.min((m.expenses / maxRevenue) * 100, 100)}%` }}
                                        />
                                        <div
                                            className="w-full bg-gradient-to-t from-[#261CC1] to-[#3A9AFF] rounded-t-md transition-all duration-300 group-hover:from-[#1C0770] group-hover:to-[#261CC1] relative z-10 opacity-90"
                                            style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{m.month.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-slate-50">
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium"><div className="w-2 h-2 rounded-sm bg-[#3A9AFF]"></div> Chiffre d'Affaires</span>
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium"><div className="w-2 h-2 rounded-sm bg-slate-200"></div> Charges Sim.</span>
                        </div>
                    </div>
                </div>

                {/* 2. REPARTITION PAR TAILLE */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-bold text-[#1C0770] flex items-center gap-2 text-sm"><CarFront className="w-4 h-4 text-purple-500" /> Profil de Flotte TRM</h2>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center space-y-4">
                        {CAR_SIZES.map((size, index) => Math.round(size.percentage) > 0 && (
                            <div key={index}>
                                <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-xs font-bold text-slate-700">{size.category}</span>
                                    <div className="text-right">
                                        <span className={`text-sm font-black ${size.text}`}>{size.percentage}%</span>
                                        <span className="text-[10px] text-slate-400 ml-2">({size.count} vp)</span>
                                    </div>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${size.color}`}
                                        style={{ width: `${size.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. REPARTITION GEOGRAPHIQUE */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-bold text-[#1C0770] flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-emerald-500" /> Départs Locatifs Géographiques</h2>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center space-y-4">
                        {REGIONAL_DISTRIBUTION.map((reg, index) => reg.count > 0 && (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs shrink-0 border border-slate-100">
                                    {reg.percentage}%
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[11px] font-bold text-slate-700 truncate">{reg.region}</h3>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-400"
                                            style={{ width: `${reg.percentage}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-[10px] text-slate-400 shrink-0 font-medium">
                                    {reg.count} résas.
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* TABLEAU DES TRANSACTIONS DYNAMIQUES */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-[#1C0770]">Dernières Transactions (Base de données en direct)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F4FF] text-slate-400 text-[10px] uppercase tracking-[0.1em] font-bold">
                                <th className="p-4">Réf. Réservation</th>
                                <th className="p-4">Date Flux</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Méthode</th>
                                <th className="p-4 min-w-[100px]">Statut</th>
                                <th className="p-4 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {transactions.slice(0, 15).map((t) => (
                                <tr key={t.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50">
                                    <td className="p-4 font-mono text-[10px] text-[#261CC1] font-bold">
                                        {t.reservation_id ? t.reservation_id.split('-')[0].toUpperCase() : 'N/A'}
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">{new Date(t.transaction_date).toLocaleDateString('fr-FR')}</td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800 text-xs">{t.customer?.full_name || 'Inconnu'}</p>
                                    </td>
                                    <td className="p-4 text-slate-600 text-xs font-medium uppercase tracking-tight">{t.transaction_type}</td>
                                    <td className="p-4 text-slate-500 text-xs">{t.payment_method}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider border ${t.status === 'Payé' || t.status === 'Encaissé' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                t.status === 'En attente' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    t.status === 'Remboursé' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                                        'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>{t.status}</span>
                                    </td>
                                    <td className={`p-4 text-right font-black text-sm whitespace-nowrap ${t.amount < 0 || t.transaction_type === 'remboursement' ? 'text-slate-400' : t.status === 'Impayé' ? 'text-rose-600' : 'text-[#1C0770]'}`}>
                                        {formatAmount(Number(t.amount), t.transaction_type)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
