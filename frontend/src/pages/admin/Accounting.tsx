import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Download,
    ArrowUpRight,
    Banknote,
    Receipt,
    Loader2,
    BarChart3,
    Activity,
    PieChart,
    ChevronRight,
    Search,
    Plus,
    X,
    CheckCircle2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
    transactionsApi,
    reservationsApi,
    type Transaction,
    type Reservation
} from '../../lib/api';
import {
    format,
    startOfDay,
    endOfDay,
    isWithinInterval,
    startOfWeek,
    startOfMonth,
    parseISO,
    eachDayOfInterval,
    eachMonthOfInterval,
    subMonths,
    isSameDay,
    isSameMonth
} from 'date-fns';
import { fr } from 'date-fns/locale';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

export default function Accounting() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('month');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newTx, setNewTx] = useState<Partial<Transaction>>({
        transaction_type: 'encaissement',
        amount: 0,
        payment_method: 'Espèces',
        status: 'Payé',
        description: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [txs, resas] = await Promise.all([
                transactionsApi.getAll(),
                reservationsApi.getAll()
            ]);
            setTransactions(txs);
            setReservations(resas);
        } catch (error) {
            console.error("Error loading accounting data:", error);
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTransaction = async () => {
        if (!newTx.amount || newTx.amount <= 0) {
            toast.error("Montant invalide");
            return;
        }
        try {
            setIsSaving(true);
            await transactionsApi.create({
                ...newTx,
                transaction_date: new Date().toISOString().split('T')[0]
            });
            toast.success("Transaction enregistrée !");
            setShowModal(false);
            setNewTx({ transaction_type: 'encaissement', amount: 0, payment_method: 'Espèces', status: 'Payé', description: '' });
            await fetchData();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSaving(false);
        }
    };

    const dataAnalysis = useMemo(() => {
        const now = new Date();
        let start: Date;
        let end: Date = endOfDay(now);

        switch (period) {
            case 'today': start = startOfDay(now); break;
            case 'week': start = startOfWeek(now, { weekStartsOn: 1 }); break;
            case 'month': start = startOfMonth(now); break;
            case 'year': start = startOfMonth(subMonths(now, 11)); break;
            case 'all': default: start = subMonths(now, 120); break;
        }

        const filteredTxs = transactions.filter(t => {
            const d = parseISO(t.transaction_date || t.created_at);
            return isWithinInterval(d, { start, end });
        });

        const filteredResas = reservations.filter(r => {
            const d = parseISO(r.start_date);
            return isWithinInterval(d, { start, end });
        });

        const totalRevenue = filteredTxs
            .filter(t => t.transaction_type === 'encaissement' && t.status === 'Payé')
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);

        const totalExpenses = filteredTxs
            .filter(t => t.transaction_type === 'décaissement' && t.status === 'Payé')
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);

        const pendingRevenue = filteredTxs
            .filter(t => t.transaction_type === 'encaissement' && (t.status === 'En attente' || t.status === 'Impayé'))
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);

        // Chart Data Generation
        let chartPoints: any[] = [];
        if (period === 'today' || period === 'week') {
            const days = eachDayOfInterval({ start: period === 'today' ? start : startOfWeek(now, { weekStartsOn: 1 }), end });
            chartPoints = days.map(day => {
                const dayTxs = transactions.filter(t => isSameDay(parseISO(t.transaction_date || t.created_at), day));
                return {
                    label: format(day, 'EEE', { locale: fr }),
                    revenue: dayTxs.filter(t => t.transaction_type === 'encaissement' && t.status === 'Payé').reduce((acc, t) => acc + Number(t.amount), 0)
                };
            });
        } else {
            const months = eachMonthOfInterval({ start: startOfMonth(subMonths(now, 5)), end });
            chartPoints = months.map(month => {
                const monthTxs = transactions.filter(t => isSameMonth(parseISO(t.transaction_date || t.created_at), month));
                return {
                    label: format(month, 'MMM', { locale: fr }),
                    revenue: monthTxs.filter(t => t.transaction_type === 'encaissement' && t.status === 'Payé').reduce((acc, t) => acc + Number(t.amount), 0)
                };
            });
        }

        return {
            transactions: filteredTxs,
            reservations: filteredResas,
            totalRevenue,
            totalExpenses,
            netBalance: totalRevenue - totalExpenses,
            pendingRevenue,
            chartPoints,
            maxChartVal: Math.max(...chartPoints.map(p => p.revenue), 1)
        };
    }, [transactions, reservations, period]);

    const filteredTransactions = dataAnalysis.transactions.filter(t =>
        t.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-10 h-10 text-[#261CC1] animate-spin" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Analyse financière TRM...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] pb-20">
            {/* Contextual Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#261CC1] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-[#261CC1]/20">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#1C0770] tracking-tighter uppercase leading-none">Comptabilité</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Analytique & Flux de trésorerie</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/50">
                    {['today', 'week', 'month', 'year', 'all'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as Period)}
                            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${period === p
                                ? 'bg-white text-[#261CC1] shadow-lg shadow-slate-200 ring-1 ring-slate-100'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {p === 'today' ? 'Jour' : p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : p === 'year' ? 'Année' : 'Global'}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-[#261CC1] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[#261CC1]/20 hover:scale-[1.05] transition-all flex items-center gap-3"
                >
                    <Plus className="w-4 h-4" /> Nouveau Flux
                </button>
            </div>

            <Toaster position="top-right" />

            {/* Main KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1C0770] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-150"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl"><DollarSign className="w-6 h-6 text-indigo-300" /></div>
                        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
                    <p className="text-3xl font-black tracking-tighter">{dataAnalysis.totalRevenue.toLocaleString()} <span className="text-xs text-indigo-400 ml-1">MAD</span></p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-indigo-300/60">
                        <span>{dataAnalysis.transactions.length} Transactions</span>
                        <span className="text-emerald-400">Stable</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Banknote className="w-6 h-6" /></div>
                        <div className="px-2 py-1 bg-emerald-50 text-[8px] font-black text-emerald-600 rounded-lg">CALCULÉ</div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Panier Moyen</p>
                    <p className="text-3xl font-black text-[#1C0770] tracking-tighter">
                        {dataAnalysis.reservations.length > 0 ? Math.round(dataAnalysis.totalRevenue / dataAnalysis.reservations.length).toLocaleString() : 0} <span className="text-xs text-slate-300 ml-1">MAD</span>
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span>Sur {dataAnalysis.reservations.length} départs</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600"><TrendingDown className="w-6 h-6" /></div>
                        <div className="px-2 py-1 bg-red-50 text-[8px] font-black text-red-600 rounded-lg">CHARGES</div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Dépenses</p>
                    <p className="text-3xl font-black text-[#1C0770] tracking-tighter">{dataAnalysis.totalExpenses.toLocaleString()} <span className="text-xs text-slate-300 ml-1">MAD</span></p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span>Maintenance & Autres</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Activity className="w-6 h-6" /></div>
                        <div className="px-2 py-1 bg-blue-50 text-[8px] font-black text-blue-600 rounded-lg">RÉSULTAT</div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Résultat Net</p>
                    <p className="text-3xl font-black text-[#1C0770] tracking-tighter">{dataAnalysis.netBalance.toLocaleString()} <span className="text-xs text-slate-300 ml-1">MAD</span></p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span>Solde actuel</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
                    <div className="flex justify-between items-start mb-6 text-amber-500">
                        <div className="p-3 bg-amber-50 rounded-2xl"><Activity className="w-6 h-6" /></div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Encours / Créances</p>
                    <p className="text-3xl font-black text-amber-500 tracking-tighter">{dataAnalysis.pendingRevenue.toLocaleString()} <span className="text-xs text-slate-200 ml-1">MAD</span></p>
                    <div className="mt-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase tracking-widest text-amber-600/60 underline underline-offset-4 cursor-pointer hover:text-amber-600 transition-colors">
                        Relancer les impayés
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
                    <div className="flex justify-between items-start mb-6 text-purple-600">
                        <div className="p-3 bg-purple-50 rounded-2xl"><Receipt className="w-6 h-6" /></div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facturation</p>
                    <p className="text-3xl font-black text-[#1C0770] tracking-tighter">{dataAnalysis.transactions.filter(t => t.transaction_type === 'encaissement').length} <span className="text-xs text-slate-300 ml-1">Docs</span></p>
                    <div className="mt-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Émissions sur la période
                    </div>
                </div>
            </div>

            {/* Dynamic Charts & Regional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Evolution Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-lg font-black text-[#1C0770] uppercase">Évolution des Flux</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variation du CA sur la période sélectionnée</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-slate-200" />
                    </div>

                    <div className="relative h-56 mb-10 group/chart">
                        <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
                            {dataAnalysis.chartPoints.map((point: any, i: number) => {
                                const height = (point.revenue / (dataAnalysis.maxChartVal || 1)) * 100;
                                return (
                                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group/point relative">
                                        {/* Activity Dot */}
                                        <div
                                            className="absolute w-2.5 h-2.5 bg-[#261CC1] rounded-full z-20 shadow-[0_0_12px_rgba(38,28,193,0.4)] transition-all duration-300 group-hover/point:scale-150 ring-2 ring-white"
                                            style={{ bottom: `${height}%`, transform: 'translateY(50%)' }}
                                        />
                                        {/* Smooth Area/Vertical Projection */}
                                        <div
                                            className="w-full bg-gradient-to-t from-[#F0F4FF] to-[#261CC1]/10 rounded-t-xl transition-all duration-700 group-hover/point:from-[#261CC1]/5 group-hover/point:to-[#261CC1]/20"
                                            style={{ height: `${height}%` }}
                                        />

                                        {/* Detailed Tooltip */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1C0770] text-white text-[9px] font-black px-4 py-2 rounded-2xl opacity-0 group-hover/point:opacity-100 transition-all scale-75 group-hover/point:scale-100 whitespace-nowrap shadow-2xl z-40">
                                            {point.revenue.toLocaleString()} MAD
                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1C0770] rotate-45"></div>
                                        </div>

                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-4 group-hover/point:text-[#1C0770] transition-colors">
                                            {point.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#261CC1]"></div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Chiffre d'Affaires Réel</span>
                        </div>
                    </div>
                </div>

                {/* Regional Sector Analytics */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-black text-[#1C0770] uppercase">Répartition Géo.</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zones de départs locatifs</p>
                        </div>
                        <PieChart className="w-5 h-5 text-slate-200" />
                    </div>
                    <div className="space-y-6">
                        {Object.entries(dataAnalysis.reservations.reduce((acc: any, curr) => {
                            const loc = curr.pickup_location || 'Agence';
                            acc[loc] = (acc[loc] || 0) + 1;
                            return acc;
                        }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 4).map(([name, count]: any, i) => {
                            const pct = Math.round((count / (dataAnalysis.reservations.length || 1)) * 100);
                            return (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{name}</span>
                                        <span className="text-xs font-black text-[#261CC1]">{pct}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div className="h-full bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-10 pt-6 border-t border-slate-50 text-center">
                        <Link to="/admin/gps" className="text-[10px] font-black text-[#3A9AFF] uppercase tracking-widest hover:underline flex items-center justify-center gap-1">
                            Analyse de mouvement complète <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Registry Section (Transactions) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-black text-[#1C0770] uppercase">Registre des Flux</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction synchronisées en direct avec la base Supabase</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher flux..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 ring-[#261CC1]/10 focus:bg-white transition-all"
                            />
                        </div>
                        <button className="p-3 bg-slate-900 text-white rounded-xl shadow-xl shadow-slate-900/10 hover:bg-black transition-all">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto px-6 pb-6 pt-2">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-400 text-[9px] uppercase font-black tracking-[0.2em] border-b border-slate-50">
                                <th className="px-6 py-4">ID Flux</th>
                                <th className="px-6 py-4">Date & Heure</th>
                                <th className="px-6 py-4">Partenaire / Client</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Méthode</th>
                                <th className="px-6 py-4 text-right">Statut</th>
                                <th className="px-6 py-4 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5 font-mono text-[9px] font-bold text-[#261CC1]">#TX-{t.id.slice(0, 6).toUpperCase()}</td>
                                    <td className="px-6 py-5">
                                        <p className="text-[11px] font-bold text-slate-800">{format(parseISO(t.transaction_date || t.created_at), 'dd/MM/yyyy', { locale: fr })}</p>
                                        <p className="text-[9px] text-slate-400 font-medium">{format(parseISO(t.transaction_date || t.created_at), 'HH:mm')}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-[11px] font-black text-[#1C0770] uppercase leading-none">{t.customer?.full_name || 'Passager'}</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-widest">{t.customer?.phone || 'ANONYME'}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${t.transaction_type === 'encaissement' ? 'bg-indigo-50 text-[#261CC1]' : 'bg-red-50 text-red-600'}`}>
                                            {t.transaction_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.payment_method}</td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${t.status === 'Payé' || t.status === 'Encaissé' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            t.status === 'Impayé' || t.status === 'En attente' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-slate-50 text-slate-400 border-slate-200'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <p className={`text-sm font-black tracking-tighter ${t.transaction_type === 'encaissement' ? 'text-[#1C0770]' : 'text-red-500'}`}>
                                            {t.amount.toLocaleString()} <span className="text-[9px] text-slate-300">MAD</span>
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                        <div className="py-20 text-center animate-[fadeIn_0.3s]">
                            <Search className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune donnée trouvée sur cette sélection</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Nouveau Flux */}
            {showModal && (
                <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-[#1C0770] uppercase">Opération de Caisse</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enregistrer un nouveau flux financier</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setNewTx({ ...newTx, transaction_type: 'encaissement' })}
                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${newTx.transaction_type === 'encaissement'
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                        : 'bg-slate-50 border-transparent text-slate-400'
                                        }`}
                                >
                                    Entrée (CA)
                                </button>
                                <button
                                    onClick={() => setNewTx({ ...newTx, transaction_type: 'décaissement' })}
                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${newTx.transaction_type === 'décaissement'
                                        ? 'bg-rose-50 border-rose-500 text-rose-600'
                                        : 'bg-slate-50 border-transparent text-slate-400'
                                        }`}
                                >
                                    Sortie (Frais)
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Montant (MAD)</label>
                                    <input
                                        type="number"
                                        value={newTx.amount || ''}
                                        onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#261CC1]/20 focus:bg-white rounded-2xl px-6 py-4 text-lg font-black text-[#1C0770] transition-all outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Description / Motif</label>
                                    <textarea
                                        value={newTx.description}
                                        onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#261CC1]/20 focus:bg-white rounded-2xl px-6 py-4 text-xs font-bold text-slate-600 transition-all outline-none min-h-[100px]"
                                        placeholder="Ex: Frais de dossier, Révision, Règlement..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Méthode</label>
                                        <select
                                            value={newTx.payment_method}
                                            onChange={(e) => setNewTx({ ...newTx, payment_method: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 outline-none"
                                        >
                                            <option>Espèces</option>
                                            <option>Virement</option>
                                            <option>Carte Bancaire</option>
                                            <option>Chèque</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Statut</label>
                                        <select
                                            value={newTx.status}
                                            onChange={(e) => setNewTx({ ...newTx, status: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 outline-none"
                                        >
                                            <option>Payé</option>
                                            <option>En attente</option>
                                            <option>Impayé</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50/50 flex gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateTransaction}
                                disabled={isSaving}
                                className="flex-[2] py-4 bg-[#261CC1] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#261CC1]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Enregistrer</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
