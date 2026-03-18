import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Car,
    Users,
    Calendar,
    DollarSign,
    Clock,
    Loader2,
    Activity,
    ArrowUpRight,
    BarChart3,
    Filter,
    LayoutDashboard
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
import {
    startOfDay,
    endOfDay,
    isWithinInterval,
    startOfWeek,
    startOfMonth,
    parseISO,
    subDays,
    format
} from 'date-fns';

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

        const isPaid = (status: string) => {
            if (!status) return false;
            const s = status.toLowerCase();
            return s.includes('pay') || s.includes('encaiss') || s.includes('termin');
        };

        switch (period) {
            case 'today': start = startOfDay(now); break;
            case 'week': start = startOfWeek(now, { weekStartsOn: 1 }); break;
            case 'month': start = startOfMonth(now); break;
            case 'year': start = startOfMonth(subDays(now, 365)); break;
            case 'all':
            default: return {
                revenue: allTransactions.filter(t => t.transaction_type === 'encaissement' && isPaid(t.status)).reduce((acc, t) => acc + Number(t.amount || 0), 0),
                expenses: allTransactions.filter(t => t.transaction_type === 'décaissement' && isPaid(t.status)).reduce((acc, t) => acc + Number(t.amount || 0), 0),
                resas: allReservations.length,
                newCustomers: stats?.totalCustomers || 0,
                occupation: Math.round(((fleetStatus.length - fleetStatus.filter(v => v.status === 'available').length) / fleetStatus.length) * 100) || 0,
                chartDataPoints: [],
                chartDataRaw: []
            };
        }

        const periodTxs = allTransactions.filter(t => isWithinInterval(parseISO(t.transaction_date || t.created_at), { start, end }));
        const periodResas = allReservations.filter(r => isWithinInterval(parseISO(r.start_date), { start, end }));

        // Calculate 15 point chart data representing daily revenue over the last 15 days
        const last15Days = Array.from({ length: 15 }).map((_, i) => subDays(now, 14 - i));
        let chartDataRaw = last15Days.map(date => {
            const dayTxs = allTransactions.filter(t =>
                t.transaction_type === 'encaissement' &&
                isPaid(t.status) &&
                isWithinInterval(parseISO(t.transaction_date || t.created_at), { start: startOfDay(date), end: endOfDay(date) })
            );
            return dayTxs.reduce((acc, t) => acc + Number(t.amount || 0), 0);
        });

        const maxVal = Math.max(...chartDataRaw, 1);
        const chartDataPoints = chartDataRaw.map(v => Math.round((v / maxVal) * 100));

        const revenue = periodTxs.filter(t => t.transaction_type === 'encaissement' && isPaid(t.status)).reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const expenses = periodTxs.filter(t => t.transaction_type === 'décaissement' && isPaid(t.status)).reduce((acc, t) => acc + Number(t.amount || 0), 0);

        return {
            revenue,
            expenses,
            net: revenue - expenses,
            resas: periodResas.length,
            newCustomers: periodResas.reduce((acc: string[], r) => r.customer_id && !acc.includes(r.customer_id) ? [...acc, r.customer_id] : acc, []).length,
            occupation: Math.round(((fleetStatus.length - fleetStatus.filter(v => v.status === 'available').length) / fleetStatus.length) * 100) || 0,
            chartDataPoints,
            chartDataRaw
        };
    }, [allReservations, allTransactions, fleetStatus, period, stats]);

    const getBezierPath = (points: number[]) => {
        if (!points || points.length < 2) return "";
        const width = 100;
        const height = 100;
        const step = width / (points.length - 1);
        let d = `M 0,${height - points[0]}`;
        for (let i = 0; i < points.length - 1; i++) {
            const x1 = i * step;
            const y1 = height - points[i];
            const x2 = (i + 1) * step;
            const y2 = height - points[i + 1];
            const xc = (x1 + x2) / 2;
            const yc = (y1 + y2) / 2;
            d += ` Q ${x1},${y1} ${xc},${yc} T ${x2},${y2}`;
        }
        return d;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-[#261CC1]" />
            </div>
        );
    }

    const cards = [
        { label: 'Chiffre d\'Affaires', value: `${(filteredStats?.revenue || 0).toLocaleString()} MAD`, icon: DollarSign, color: 'text-emerald-500', trend: '+12.5%', bg: 'bg-emerald-50' },
        { label: 'Dépenses (Charges)', value: `${(filteredStats?.expenses || 0).toLocaleString()} MAD`, icon: Activity, color: 'text-rose-500', trend: 'Global', bg: 'bg-rose-50' },
        { label: 'Réservations', value: filteredStats?.resas || 0, icon: Calendar, color: 'text-[#3A9AFF]', trend: '+5.4%', bg: 'bg-[#3A9AFF]/10' },
        { label: 'Taux d\'Occupation', value: `${filteredStats?.occupation || 0}%`, icon: Activity, color: 'text-amber-500', trend: 'Stable', bg: 'bg-amber-50' },
    ];

    const bezierPath = getBezierPath(filteredStats?.chartDataPoints || []);

    return (
        <div className="space-y-8 pb-12 animate-fade-in font-sans">
            {/* SaaS Header Profile Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] uppercase tracking-tight leading-none">
                        Dashboard <span className="text-[#3A9AFF] font-light">Overview</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Bienvenue dans votre centre de pilotage TRM Rent Car</p>
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
            </div>

            {/* Main KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3.5 ${card.bg} rounded-2xl transition-transform group-hover:scale-110 duration-500`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                {card.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                        <p className="text-3xl font-black text-[#1C0770] tracking-tighter">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Fleet Status Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Revenue Evolution Chart (SaaS Minimalist Style) */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="px-4 py-2 bg-emerald-50 rounded-2xl flex items-center gap-2 text-emerald-600">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Connecté</span>
                        </div>
                        <p className="text-[9px] text-slate-300 font-bold text-right mt-2 uppercase tracking-tighter">maj: {format(new Date(), 'HH:mm')}</p>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-xs font-black text-[#1C0770] uppercase tracking-[0.2em] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#3A9AFF]"></div>
                            Performances Financières
                        </h2>
                        <div className="mt-4 flex items-baseline gap-3">
                            <span className="text-6xl font-black text-[#1C0770] tracking-tighter">{(filteredStats?.revenue || 0).toLocaleString()}</span>
                            <span className="text-xl font-bold text-slate-300">MAD</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Évolution des flux entrants (15 derniers jours)</p>
                    </div>

                    <div className="relative h-64 w-full">
                        {/* SVG Chart Layer */}
                        <div className="absolute inset-0">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3A9AFF" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#3A9AFF" stopOpacity="0" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="2" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                <path
                                    d={`${bezierPath} L 100,100 L 0,100 Z`}
                                    fill="url(#areaGradient)"
                                    className="transition-all duration-1000 ease-in-out"
                                />

                                <path
                                    d={bezierPath}
                                    fill="none"
                                    stroke="#3A9AFF"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#glow)"
                                    className="transition-all duration-1000 ease-in-out"
                                />
                            </svg>

                            <div className="absolute inset-0 flex items-end justify-between px-0">
                                {(filteredStats?.chartDataPoints || []).map((h: number, i: number) => (
                                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group/point relative">
                                        <div className="w-[1px] h-full bg-gradient-to-t from-[#3A9AFF]/20 to-transparent opacity-0 group-hover/point:opacity-100 transition-opacity" />

                                        <div
                                            className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#3A9AFF] shadow-lg opacity-0 group-hover/point:opacity-100 transition-all absolute scale-50 group-hover/point:scale-100"
                                            style={{ bottom: `${h}%`, transform: 'translateY(50%)' }}
                                        />

                                        <div
                                            className="absolute bg-[#1C0770] text-white text-[10px] font-black px-3 py-2 rounded-xl opacity-0 group-hover/point:opacity-100 transition-all -translate-y-4 group-hover/point:-translate-y-8 whitespace-nowrap shadow-2xl z-30 pointer-events-none"
                                            style={{ bottom: `${h}%` }}
                                        >
                                            <p className="text-[#3A9AFF] mb-0.5">{format(subDays(new Date(), 14 - i), 'dd MMM')}</p>
                                            <p>{filteredStats?.chartDataRaw?.[i]?.toLocaleString()} MAD</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center text-slate-400">
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-1 rounded-full bg-[#3A9AFF]"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest tracking-tighter">Encaissements</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-1 rounded-full bg-slate-200"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest tracking-tighter">Comparaison</span>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-[#3A9AFF] transition-colors">
                                <Filter className="w-3 h-3" /> Filtres
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fleet Status Summary */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                        <div>
                            <h2 className="text-sm font-black text-[#1C0770] uppercase tracking-tight">Statut Flotte</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Disponibilité immédiate</p>
                        </div>
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-50"><BarChart3 className="w-4 h-4 text-[#3A9AFF]" /></div>
                    </div>
                    <div className="p-2 flex-1 flex flex-col divide-y divide-slate-50 overflow-y-auto max-h-[350px] custom-scrollbar">
                        {fleetStatus.slice(0, 8).map((v, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-2xl group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1C0770] group-hover:bg-[#261CC1] group-hover:text-white transition-all">
                                        <Car className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{v.brand} {v.model}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{v.plate_number}</p>
                                    </div>
                                </div>
                                <span className={`text-[8px] uppercase font-black px-2.5 py-1.5 rounded-lg border tracking-widest ${v.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    v.status === 'booked' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        v.status === 'rented' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
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
                            <h2 className="text-lg font-black text-[#1C0770] uppercase">Opérations Récentes</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dernières réservations enregistrées</p>
                        </div>
                    </div>
                    <Link to="/admin/reservations" className="px-6 py-2.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">Journal complet</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em]">
                                <th className="px-8 py-5">Référence</th>
                                <th className="px-8 py-5">Client</th>
                                <th className="px-8 py-5">Véhicule</th>
                                <th className="px-8 py-5">Dates</th>
                                <th className="px-8 py-5 text-right">Statut</th>
                                <th className="px-8 py-5 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(allReservations || []).slice(0, 6).map((b, i) => (
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
