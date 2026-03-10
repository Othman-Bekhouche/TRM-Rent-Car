import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Car,
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    Clock,
    ChevronRight,
    Loader2,
    Activity,
    ArrowUpRight,
    BarChart3
} from 'lucide-react';
import {
    dashboardApi,
    reservationsApi,
    vehiclesApi,
    transactionsApi,
    type Reservation,
    type Vehicle,
    type Transaction
} from '../../lib/api';
import { startOfDay, endOfDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, subDays } from 'date-fns';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

const translateStatus = (s: string) => {
    switch (s) {
        case 'available': return 'Disponible';
        case 'booked': return 'Réservé';
        case 'rented': return 'Loué';
        case 'maintenance': return 'Maintenance';
        case 'inactive': return 'Inactif';
        case 'pending': return 'En attente';
        case 'confirmed': return 'Confirmé';
        case 'returned': return 'Retourné';
        case 'completed': return 'Terminé';
        case 'cancelled': return 'Annulé';
        default: return s;
    }
};

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [allReservations, setAllReservations] = useState<Reservation[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [fleetStatus, setFleetStatus] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('month');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [s, rb, fs, txs] = await Promise.all([
                dashboardApi.getStats(),
                reservationsApi.getAll(),
                vehiclesApi.getAll(),
                transactionsApi.getAll()
            ]);
            setStats(s);
            setAllReservations(rb);
            setFleetStatus(fs);
            setAllTransactions(txs);
        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStats = useMemo(() => {
        if (!allReservations.length) return null;

        const now = new Date();
        let start: Date;
        let end: Date = endOfDay(now);

        switch (period) {
            case 'today': start = startOfDay(now); break;
            case 'week': start = startOfWeek(now, { weekStartsOn: 1 }); break;
            case 'month': start = startOfMonth(now); break;
            case 'year': start = startOfMonth(subDays(now, 365)); break;
            default: return {
                revenue: allTransactions.filter(t => t.transaction_type === 'encaissement' && t.status === 'Payé').reduce((acc, t) => acc + Number(t.amount || 0), 0),
                resas: allReservations.length,
                newCustomers: stats?.totalCustomers || 0,
                occupation: Math.round(((fleetStatus.length - fleetStatus.filter(v => v.status === 'available').length) / fleetStatus.length) * 100) || 0
            };
        }

        const periodTxs = allTransactions.filter(t => isWithinInterval(parseISO(t.transaction_date || t.created_at), { start, end }));
        const periodResas = allReservations.filter(r => isWithinInterval(parseISO(r.start_date), { start, end }));

        // Calculate 15 point chart data representing daily revenue over the last 15 days
        const last15Days = Array.from({ length: 15 }).map((_, i) => subDays(now, 14 - i));
        let chartDataRaw = last15Days.map(date => {
            const dayTxs = allTransactions.filter(t =>
                t.transaction_type === 'encaissement' &&
                t.status === 'Payé' &&
                isWithinInterval(parseISO(t.transaction_date || t.created_at), { start: startOfDay(date), end: endOfDay(date) })
            );
            return dayTxs.reduce((acc, t) => acc + Number(t.amount || 0), 0);
        });

        // Normalize to 0-100 for SVG
        const maxVal = Math.max(...chartDataRaw, 1); // prevent division by zero
        const chartDataPoints = chartDataRaw.map(v => Math.round((v / maxVal) * 100));

        return {
            revenue: periodTxs.filter(t => t.transaction_type === 'encaissement' && t.status === 'Payé').reduce((acc, t) => acc + Number(t.amount || 0), 0),
            resas: periodResas.length,
            newCustomers: periodResas.reduce((acc: string[], r) => r.customer_id && !acc.includes(r.customer_id) ? [...acc, r.customer_id] : acc, []).length,
            occupation: Math.round(((fleetStatus.length - fleetStatus.filter(v => v.status === 'available').length) / fleetStatus.length) * 100) || 0,
            chartDataPoints,
            chartDataRaw
        };
    }, [allReservations, allTransactions, fleetStatus, period, stats]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-[#261CC1] animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronisation des données...</p>
            </div>
        );
    }

    const cards = [
        { label: 'Revenus Période', value: `${filteredStats?.revenue.toLocaleString()} MAD`, icon: DollarSign, color: 'from-[#261CC1] to-[#3A9AFF]', trend: 'Ventes confirmées' },
        { label: 'Réservations', value: filteredStats?.resas.toString(), icon: Calendar, color: 'from-[#1C0770] to-[#261CC1]', trend: 'Activité sur période' },
        { label: 'Taux Occupation', value: `${filteredStats?.occupation}%`, icon: Car, color: 'from-[#3A9AFF] to-[#60B8FF]', trend: 'Flotte en mouvement' },
        { label: 'Clients Période', value: filteredStats?.newCustomers.toString(), icon: Users, color: 'from-[#00C853] to-[#69F0AE]', trend: 'Nouveaux engagés' },
    ];

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] pb-10">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1C0770] tracking-tighter uppercase leading-none">Tableau de Bord</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Vue d'ensemble en temps réel de votre parc</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    {[
                        { id: 'today', label: 'Jour' },
                        { id: 'week', label: 'Sem.' },
                        { id: 'month', label: 'Mois' },
                        { id: 'year', label: 'An' },
                        { id: 'all', label: 'Global' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setPeriod(btn.id as Period)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${period === btn.id
                                ? 'bg-[#261CC1] text-white shadow-lg shadow-[#261CC1]/20'
                                : 'text-slate-400 hover:bg-slate-50'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat, i) => {
                    const Icon = stat.icon;
                    const isRevenue = stat.label === 'Revenus Période';
                    const CardContent = (
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <p className="text-slate-400 text-[9px] font-black tracking-widest uppercase">{stat.label}</p>
                                </div>
                                <p className="text-2xl font-black text-[#1C0770] mb-2 tracking-tighter">{stat.value}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{stat.trend}</span>
                                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    );

                    return isRevenue ? (
                        <Link key={i} to="/admin/accounting" className="block transform transition-transform hover:scale-[1.02]">
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={i}>{CardContent}</div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Chart Placeholder */}
                <div className="lg:col-span-2 bg-[#1C0770] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between group min-h-[400px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#261CC1]/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-[#261CC1]/30"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-white text-2xl font-black tracking-tight uppercase">Activité Journalière</h2>
                                <p className="text-indigo-200/60 text-[9px] font-bold uppercase tracking-widest mt-1">Évolution des flux entrants sur la période</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white text-3xl font-black">{filteredStats?.revenue.toLocaleString()} <span className="text-xs text-indigo-300 font-bold">MAD</span></p>
                                <div className="flex items-center justify-end gap-1 text-emerald-400 text-[9px] font-black uppercase tracking-widest mt-1">
                                    <Activity className="w-3 h-3" /> Synchronisé avec Supabase
                                </div>
                            </div>
                        </div>

                        {/* Premium SVG Curve Visualization */}
                        <div className="relative h-48 mb-6 group/chart pt-8">
                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={`M 0,100 L ${(filteredStats?.chartDataPoints || []).map((h: number, i: number) => `${(i * 100) / 14},${100 - h}`).join(' L ')} L 100,100 Z`}
                                    fill="url(#dashboardGradient)"
                                />
                                <path
                                    d={`M ${(filteredStats?.chartDataPoints || []).map((h: number, i: number) => `${(i * 100) / 14},${100 - h}`).join(' L ')}`}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeOpacity="0.6"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-end justify-between px-2">
                                {(filteredStats?.chartDataPoints || []).map((h: number, i: number) => (
                                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group/point relative">
                                        <div
                                            className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover/point:opacity-100 transition-opacity absolute"
                                            style={{ bottom: `${h}%`, transform: 'translateY(50%)' }}
                                        />
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/point:opacity-100 transition-all scale-75 group-hover/point:scale-100 whitespace-nowrap shadow-xl z-30">
                                            {filteredStats?.chartDataRaw[i]} MAD
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5 text-[9px] text-indigo-300/60 font-black uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div> Volume Locatif
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] text-indigo-300/60 font-black uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div> Projection
                            </span>
                        </div>
                        <Link to="/admin/accounting" className="text-white/40 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1">
                            Détails Analytiques <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* Fleet Health Status */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="text-sm font-black text-[#1C0770] uppercase tracking-tight">Statut de la Flotte</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Disponibilité immédiate</p>
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-sm"><BarChart3 className="w-4 h-4 text-slate-400" /></div>
                    </div>
                    <div className="p-2 flex-1 flex flex-col divide-y divide-slate-50">
                        {fleetStatus.slice(0, 8).map((v, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-2xl group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1C0770] group-hover:bg-[#261CC1] group-hover:text-white transition-all">
                                        <Car className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{v.brand} {v.model}</p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{v.plate_number}</p>
                                    </div>
                                </div>
                                <span className={`text-[8px] uppercase font-black px-2.5 py-1.5 rounded-lg border tracking-widest ${v.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    v.status === 'booked' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        v.status === 'rented' ? 'bg-[#261CC1]/5 text-[#261CC1] border-[#261CC1]/10' :
                                            'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                    {translateStatus(v.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Reservations */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#261CC1]/5 rounded-2xl text-[#261CC1]"><Clock className="w-5 h-5" /></div>
                        <div>
                            <h2 className="text-lg font-black text-[#1C0770] uppercase">Dernières Réservations</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Activités récentes synchronisées</p>
                        </div>
                    </div>
                    <Link to="/admin/reservations" className="px-6 py-2.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">Tout Voir</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em]">
                                <th className="px-8 py-5">Référence</th>
                                <th className="px-8 py-5">Identité Client</th>
                                <th className="px-8 py-5">Véhicule</th>
                                <th className="px-8 py-5">Période</th>
                                <th className="px-8 py-5 text-right">Statut</th>
                                <th className="px-8 py-5 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {allReservations.slice(0, 6).map((b, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                    <td className="px-8 py-4 font-mono text-[10px] font-bold text-[#261CC1]">
                                        #{b.reservation_number || b.id.slice(0, 8).toUpperCase()}
                                    </td>
                                    <td className="px-8 py-4">
                                        <p className="text-xs font-black text-[#1C0770] uppercase underline underline-offset-4 decoration-slate-200">{b.customers?.full_name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{b.customers?.phone}</p>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{b.vehicles?.brand}</span>
                                            <span className="text-[10px] font-black text-slate-900 uppercase">{b.vehicles?.model}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(b.start_date).toLocaleDateString()} ▸ {new Date(b.end_date).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${b.status === 'confirmed' || b.status === 'rented' || b.status === 'completed'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            b.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>{translateStatus(b.status)}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <p className="text-sm font-black text-[#1C0770] tracking-tighter">{Number(b.total_price).toLocaleString()} <span className="text-[9px] text-slate-300">MAD</span></p>
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
