import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Download,
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
    CheckCircle2,
    Printer,
    ArrowRightLeft
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
        category: 'Location',
        amount: 0,
        payment_method: 'Espèces',
        status: 'Payé',
        description: ''
    });

    const [filterType, setFilterType] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterMethod, setFilterMethod] = useState<string>('all');

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
            setNewTx({ transaction_type: 'encaissement', category: 'Location', amount: 0, payment_method: 'Espèces', status: 'Payé', description: '' });
            await fetchData();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSaving(false);
        }
    };

    const exportToCSV = () => {
        if (transactions.length === 0) return;
        const headers = ['ID', 'Date', 'Client', 'Type', 'Methode', 'Status', 'Montant'];
        const rows = transactions.map(t => [
            t.id,
            t.transaction_date || t.created_at,
            t.customer?.full_name || 'Passager',
            t.transaction_type,
            t.payment_method,
            t.status,
            t.amount
        ]);
        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `comptabilite_trm_${format(new Date(), 'dd_MM_yyyy')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Export CSV terminé");
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

        // Calculate Previous Period for Growth
        let prevStart: Date;
        let prevEnd: Date = start;
        switch (period) {
            case 'today': prevStart = startOfDay(subMonths(now, 0)); prevStart.setDate(prevStart.getDate() - 1); prevEnd = startOfDay(now); break;
            case 'week': prevStart = startOfWeek(subMonths(now, 0), { weekStartsOn: 1 }); prevStart.setDate(prevStart.getDate() - 7); prevEnd = startOfWeek(now, { weekStartsOn: 1 }); break;
            case 'month': prevStart = startOfMonth(subMonths(now, 1)); break;
            case 'year': prevStart = startOfMonth(subMonths(now, 23)); prevEnd = startOfMonth(subMonths(now, 11)); break;
            default: prevStart = start; break;
        }

        const filteredTxs = transactions.filter(t => {
            const d = parseISO(t.transaction_date || t.created_at);
            return isWithinInterval(d, { start, end });
        });

        const filteredResas = reservations.filter(r => {
            const d = parseISO(r.start_date);
            return isWithinInterval(d, { start, end });
        });

        const isStatusValid = (s: string) => {
            const normalized = (s || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return ['PAYE', 'ENCAISSE', 'VALIDATED', 'PAID', 'SUCCESS', 'CONFIRMED'].includes(normalized);
        };

        const totalRevenue = filteredTxs
            .filter(t => t.transaction_type === 'encaissement' && isStatusValid(t.status))
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);

        const totalExpenses = filteredTxs
            .filter(t => (t.transaction_type === 'charge' || t.transaction_type === 'remboursement') && isStatusValid(t.status))
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);

        const pendingRevenue = filteredTxs
            .filter(t => t.transaction_type === 'encaissement' && !isStatusValid(t.status))
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);

        // Previous period calc
        const prevTxs = transactions.filter(t => {
            const d = parseISO(t.transaction_date || t.created_at);
            return isWithinInterval(d, { start: prevStart, end: prevEnd });
        });
        const prevRevenue = prevTxs
            .filter(t => t.transaction_type === 'encaissement' && isStatusValid(t.status))
            .reduce((acc, t) => acc + Number(t.amount || 0), 0);
        
        const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        // Chart Data Generation
        let chartPoints: any[] = [];
        if (period === 'today' || period === 'week') {
            const days = eachDayOfInterval({ start: period === 'today' ? start : startOfWeek(now, { weekStartsOn: 1 }), end });
            chartPoints = days.map(day => {
                const dayTxs = transactions.filter(t => isSameDay(parseISO(t.transaction_date || t.created_at), day));
                return {
                    label: format(day, 'EEE', { locale: fr }),
                    revenue: dayTxs.filter(t => t.transaction_type === 'encaissement' && isStatusValid(t.status)).reduce((acc, t) => acc + Number(t.amount), 0)
                };
            });
        } else {
            const months = eachMonthOfInterval({ start: startOfMonth(subMonths(now, 5)), end });
            chartPoints = months.map(month => {
                const monthTxs = transactions.filter(t => isSameMonth(parseISO(t.transaction_date || t.created_at), month));
                return {
                    label: format(month, 'MMM', { locale: fr }),
                    revenue: monthTxs.filter(t => t.transaction_type === 'encaissement' && isStatusValid(t.status)).reduce((acc, t) => acc + Number(t.amount), 0)
                };
            });
        }

        // Top Vehicles calc
        const vehicleRevenue: Record<string, { brand: string; model: string; amount: number; count: number }> = {};
        filteredTxs.forEach(t => {
            if (t.transaction_type === 'encaissement' && isStatusValid(t.status)) {
                const vehicle = t.reservation?.vehicle;
                if (vehicle) {
                    const key = vehicle.id;
                    if (!vehicleRevenue[key]) {
                        vehicleRevenue[key] = { brand: vehicle.brand, model: vehicle.model, amount: 0, count: 0 };
                    }
                    vehicleRevenue[key].amount += Number(t.amount || 0);
                    vehicleRevenue[key].count += 1;
                }
            }
        });

        const topVehicles = Object.values(vehicleRevenue).sort((a, b) => b.amount - a.amount).slice(0, 3);

        // Payment Distribution calc
        const methodCounts: Record<string, number> = {};
        filteredTxs.forEach(t => {
            if (t.transaction_type === 'encaissement') {
                const meth = t.payment_method || 'Espèces';
                methodCounts[meth] = (methodCounts[meth] || 0) + Number(t.amount || 0);
            }
        });

        return {
            transactions: filteredTxs,
            reservations: filteredResas,
            totalRevenue,
            totalExpenses,
            netBalance: totalRevenue - totalExpenses,
            pendingRevenue,
            growth,
            chartPoints,
            maxChartVal: Math.max(...chartPoints.map(p => p.revenue), 1),
            topVehicles,
            methodCounts: Object.entries(methodCounts).map(([name, value]) => ({ name, value })),
            categoryAnalysis: filteredTxs.reduce((acc: any, t) => {
                const cat = t.category || 'Non classé';
                acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
                return acc;
            }, {})
        };
    }, [transactions, reservations, period]);

    const filteredTransactions = dataAnalysis.transactions.filter(t => {
        const s = searchTerm.toLowerCase();
        const matchesSearch = (t.customer?.full_name?.toLowerCase() || '').includes(s) ||
                             (t.id?.toLowerCase() || '').includes(s) ||
                             (t.description?.toLowerCase() || '').includes(s);
        const matchesType = filterType === 'all' || t.transaction_type === filterType;
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchesMethod = filterMethod === 'all' || t.payment_method === filterMethod;
        
        return matchesSearch && matchesType && matchesCategory && matchesMethod;
    });

    const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean))) as string[];

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
                        <div className={`flex items-center gap-1 text-[10px] font-black ${dataAnalysis.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {dataAnalysis.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(dataAnalysis.growth).toFixed(1)}%
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
                    <p className="text-3xl font-black tracking-tighter">{dataAnalysis.totalRevenue.toLocaleString()} <span className="text-xs text-indigo-400 ml-1">MAD</span></p>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-indigo-300/60">
                        <span>{dataAnalysis.transactions.length} Transactions</span>
                        <span className={dataAnalysis.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {dataAnalysis.growth >= 0 ? 'En Hausse' : 'En Baisse'}
                        </span>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Véhicule</p>
                    <p className="text-xl font-black text-[#1C0770] tracking-tighter truncate">
                        {dataAnalysis.topVehicles[0] ? `${dataAnalysis.topVehicles[0].brand} ${dataAnalysis.topVehicles[0].model}` : 'N/A'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {dataAnalysis.topVehicles[0] ? `${dataAnalysis.topVehicles[0].amount.toLocaleString()} MAD engrangés` : 'En attente de données'}
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

                {/* Expense Categories Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-1 lg:col-span-3">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-black text-[#1C0770] uppercase">Répartition par Catégorie</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analyse granulaire des flux</p>
                        </div>
                        <PieChart className="w-5 h-5 text-slate-200" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {Object.entries(dataAnalysis.categoryAnalysis).map(([cat, amount]: any, i) => (
                            <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:scale-[1.02] transition-all">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{cat}</p>
                                <p className="text-lg font-black text-[#1C0770] tracking-tighter">{amount.toLocaleString()} <span className="text-[10px] text-slate-400">MAD</span></p>
                            </div>
                        ))}
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
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-[#261CC1]/10 transition-all"
                        >
                            <option value="all">Tous Flux</option>
                            <option value="encaissement">Entrées (CA)</option>
                            <option value="charge">Charges (Frais)</option>
                            <option value="caution">Cautions</option>
                        </select>
                        <select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-[#261CC1]/10 transition-all"
                        >
                            <option value="all">Toutes Catégories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select 
                            value={filterMethod} 
                            onChange={(e) => setFilterMethod(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-[#261CC1]/10 transition-all"
                        >
                            <option value="all">Paiement</option>
                            <option value="Espèces">Espèces</option>
                            <option value="Virement">Virement</option>
                            <option value="Carte Bancaire">Carte</option>
                            <option value="Chèque">Chèque</option>
                        </select>
                        <div className="relative flex-1 md:w-48">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-[#261CC1]/10 focus:bg-white transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => window.print()}
                            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl shadow-sm hover:text-slate-900 transition-all"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={exportToCSV}
                            className="p-3 bg-slate-900 text-white rounded-xl shadow-xl shadow-slate-900/10 hover:bg-black transition-all"
                        >
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
                                    onClick={() => setNewTx({ ...newTx, transaction_type: 'charge' })}
                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${newTx.transaction_type === 'charge'
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
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Catégorie</label>
                                        <select
                                            value={newTx.category}
                                            onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#261CC1]/20 focus:bg-white rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                                        >
                                            <option value="Location">Location</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Carburant">Carburant</option>
                                            <option value="Lavage">Lavage</option>
                                            <option value="Assurance">Assurance</option>
                                            <option value="Vignette">Vignette</option>
                                            <option value="Personnel">Salaire / Personnel</option>
                                            <option value="Loyer">Loyer / Factures</option>
                                            <option value="Marketing">Marketing / Publicité</option>
                                            <option value="Caution">Caution</option>
                                            <option value="Autre">Autre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Méthode</label>
                                        <select
                                            value={newTx.payment_method}
                                            onChange={(e) => setNewTx({ ...newTx, payment_method: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#261CC1]/20 focus:bg-white rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                                        >
                                            <option>Espèces</option>
                                            <option>Virement</option>
                                            <option>Carte Bancaire</option>
                                            <option>Chèque</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Statut</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Payé', 'En attente', 'Impayé'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setNewTx({ ...newTx, status: s })}
                                                    className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all ${newTx.status === s 
                                                        ? 'bg-slate-900 border-slate-900 text-white' 
                                                        : 'bg-slate-50 border-transparent text-slate-400'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
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
