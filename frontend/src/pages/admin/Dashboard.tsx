import { useState, useEffect } from 'react';
import { Car, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi, reservationsApi, vehiclesApi, type Reservation, type Vehicle } from '../../lib/api';

const translateStatus = (s: string) => {
    switch (s) {
        case 'available': return 'Disponible';
        case 'booked': return 'Réservé';
        case 'rented': return 'Loué';
        case 'maintenance': return 'En panne / Maintenance';
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
    const [recentBookings, setRecentBookings] = useState<Reservation[]>([]);
    const [fleetStatus, setFleetStatus] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [s, rb, fs] = await Promise.all([
                dashboardApi.getStats(),
                reservationsApi.getAll(),
                vehiclesApi.getAll()
            ]);
            setStats(s);
            setRecentBookings(rb.slice(0, 5));
            setFleetStatus(fs.slice(0, 7));
        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-[#261CC1] animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Initialisation du panel...</p>
            </div>
        );
    }

    const cards = [
        { label: 'Revenus Totaux', value: `${stats?.totalRevenue.toLocaleString()} MAD`, change: '+12.5%', up: true, icon: DollarSign, color: 'from-[#261CC1] to-[#3A9AFF]', shadow: 'shadow-[0_8px_30px_rgba(38,28,193,0.3)]' },
        { label: 'Réservations Actives', value: stats?.activeReservations.toString(), change: `${stats?.totalReservations} total`, up: true, icon: Calendar, color: 'from-[#1C0770] to-[#261CC1]', shadow: 'shadow-[0_8px_30px_rgba(28,7,112,0.3)]' },
        { label: 'Véhicules Dispo', value: `${stats?.availableVehicles} / ${stats?.totalVehicles}`, change: `${Math.round((stats?.availableVehicles / stats?.totalVehicles) * 100)}% dispo`, up: true, icon: Car, color: 'from-[#3A9AFF] to-[#60B8FF]', shadow: 'shadow-[0_8px_30px_rgba(58,154,255,0.3)]' },
        { label: 'Total Clients', value: stats?.totalCustomers.toString(), change: '+5 ce mois', up: true, icon: Users, color: 'from-[#00C853] to-[#69F0AE]', shadow: 'shadow-[0_8px_30px_rgba(0,200,83,0.2)]' },
    ];

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Tableau de bord</h1>
                    <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de votre agence TRM Rent Car — Taourirt</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:shadow-md transition-all">
                        Rapport Mensuel
                    </button>
                    <Link to="/admin/reservations" className="px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all flex items-center gap-2">
                        + Nouvelle Réservation
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className={`bg-white rounded-2xl p-6 border border-slate-100 hover:-translate-y-1 transition-all duration-300 ${stat.shadow} group`}>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-slate-500 text-xs font-bold tracking-wider uppercase">{stat.label}</p>
                                <div className={`bg-gradient-to-br ${stat.color} p-2.5 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-[#1C0770] mb-2">{stat.value}</p>
                            <div className={`flex items-center text-xs font-bold ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                                {stat.up ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                                {stat.change}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Revenue Chart Placeholder + Fleet Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-[#1C0770]">Chiffre d'Affaires</h2>
                            <p className="text-xs text-slate-400">Derniers 30 jours (Estimation)</p>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold">
                            <TrendingUp className="w-3.5 h-3.5" /> +12.5%
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-end gap-3 h-48">
                            {[35, 50, 42, 68, 55, 72, 60, 80, 45].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#261CC1] to-[#3A9AFF] rounded-t-lg transition-all duration-500 hover:from-[#1C0770] hover:to-[#261CC1] cursor-pointer relative group"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1C0770] text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                                            {Math.round(h * 600)} MAD
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">{['1', '4', '7', '10', '13', '16', '19', '22', '25'][i]} Mar</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fleet Status */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-[#1C0770]">État Flotte</h2>
                        <Link to="/admin/vehicles" className="text-[#3A9AFF] text-xs font-bold hover:underline flex items-center">Voir <ChevronRight className="w-3 h-3" /></Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {fleetStatus.map((v, i) => (
                            <div key={i} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{v.brand} {v.model}</p>
                                    <p className="text-xs text-slate-400 font-mono">{v.plate_number}</p>
                                </div>
                                <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${v.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    v.status === 'booked' || v.status === 'rented' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        'bg-rose-50 text-rose-700 border-rose-100'
                                    }`}>{translateStatus(v.status)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#261CC1]/10 rounded-xl">
                            <Clock className="w-5 h-5 text-[#261CC1]" />
                        </div>
                        <h2 className="text-lg font-bold text-[#1C0770]">Réservations Récentes</h2>
                    </div>
                    <Link to="/admin/reservations" className="text-[#3A9AFF] text-xs font-bold hover:underline flex items-center">Tout voir <ChevronRight className="w-3 h-3" /></Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <th className="p-4">ID</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Véhicule</th>
                                <th className="p-4">Dates</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {recentBookings.map((b, i) => (
                                <tr key={i} className="hover:bg-[#F0F4FF] transition-colors border-b border-slate-50 cursor-pointer">
                                    <td className="p-4 text-slate-400 font-mono text-xs">#{b.reservation_number || b.id.slice(0, 8)}</td>
                                    <td className="p-4 text-slate-800 font-semibold">{b.customers?.full_name}</td>
                                    <td className="p-4 text-slate-600">{b.vehicles?.brand} {b.vehicles?.model}</td>
                                    <td className="p-4 text-slate-400">{new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${b.status === 'confirmed' || b.status === 'rented' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            b.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>{translateStatus(b.status)}</span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-[#1C0770]">{b.total_price} MAD</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
