import { Car, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATS = [
    { label: 'Revenus (Ce mois)', value: '45 200 MAD', change: '+12.5%', up: true, icon: DollarSign, color: 'from-[#261CC1] to-[#3A9AFF]', shadow: 'shadow-[0_8px_30px_rgba(38,28,193,0.3)]' },
    { label: 'Réservations Actives', value: '18', change: '3 en attente', up: true, icon: Calendar, color: 'from-[#1C0770] to-[#261CC1]', shadow: 'shadow-[0_8px_30px_rgba(28,7,112,0.3)]' },
    { label: 'Véhicules Disponibles', value: '5 / 7', change: '71% dispo', up: true, icon: Car, color: 'from-[#3A9AFF] to-[#60B8FF]', shadow: 'shadow-[0_8px_30px_rgba(58,154,255,0.3)]' },
    { label: 'Nouveaux Clients', value: '42', change: '+5 ce mois', up: true, icon: Users, color: 'from-[#00C853] to-[#69F0AE]', shadow: 'shadow-[0_8px_30px_rgba(0,200,83,0.2)]' },
];

const RECENT_BOOKINGS = [
    { id: '#RES-2026', client: 'Mohammed Alaoui', vehicle: 'Peugeot 208 Noir', dates: '12 Mar – 15 Mar', status: 'En attente', statusColor: 'bg-amber-100 text-amber-700 border-amber-200', amount: '1 260 MAD' },
    { id: '#RES-2025', client: 'Sophie Martin', vehicle: 'Peugeot 208 Gris (Hybride)', dates: '10 Mar – 12 Mar', status: 'Confirmé', statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200', amount: '1 040 MAD' },
    { id: '#RES-2024', client: 'Hassan Benali', vehicle: 'Dacia Logan Blanc', dates: '08 Mar – 15 Mar', status: 'En cours', statusColor: 'bg-blue-100 text-blue-700 border-blue-200', amount: '2 100 MAD' },
    { id: '#RES-2023', client: 'Fatima El Ouardi', vehicle: 'Dacia Sandero Gris', dates: '05 Mar – 08 Mar', status: 'Terminé', statusColor: 'bg-slate-100 text-slate-500 border-slate-200', amount: '960 MAD' },
    { id: '#RES-2022', client: 'Youssef Ziani', vehicle: 'Dacia Logan Gris', dates: '01 Mar – 06 Mar', status: 'Terminé', statusColor: 'bg-slate-100 text-slate-500 border-slate-200', amount: '1 500 MAD' },
];

const FLEET_STATUS = [
    { vehicle: 'Peugeot 208 Noir', plate: '208-A-001', status: 'Disponible', color: 'bg-emerald-100 text-emerald-700' },
    { vehicle: 'Peugeot 208 Gris', plate: '208-B-002', status: 'Disponible', color: 'bg-emerald-100 text-emerald-700' },
    { vehicle: 'Dacia Logan Blanc', plate: 'LOG-C-003', status: 'Loué', color: 'bg-blue-100 text-blue-700' },
    { vehicle: 'Dacia Logan Gris', plate: 'LOG-C-004', status: 'Loué', color: 'bg-blue-100 text-blue-700' },
    { vehicle: 'Dacia Sandero Blanc', plate: 'SND-D-005', status: 'Disponible', color: 'bg-emerald-100 text-emerald-700' },
    { vehicle: 'Dacia Sandero Gris', plate: 'SND-D-006', status: 'Disponible', color: 'bg-emerald-100 text-emerald-700' },
    { vehicle: 'Dacia Sandero Bleu', plate: 'SND-D-007', status: 'Maintenance', color: 'bg-orange-100 text-orange-700' },
];

export default function Dashboard() {
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
                    <button className="px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all">
                        + Nouvelle Réservation
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, i) => {
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
                            <p className="text-xs text-slate-400">Mars 2026</p>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold">
                            <TrendingUp className="w-3.5 h-3.5" /> +12.5%
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Simulated Bar Chart */}
                        <div className="flex items-end gap-3 h-48">
                            {[35, 50, 42, 68, 55, 72, 60, 80, 45].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
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
                        {FLEET_STATUS.map((v, i) => (
                            <div key={i} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{v.vehicle}</p>
                                    <p className="text-xs text-slate-400 font-mono">{v.plate}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${v.color}`}>{v.status}</span>
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
                            {RECENT_BOOKINGS.map((b, i) => (
                                <tr key={i} className="hover:bg-[#F0F4FF] transition-colors border-b border-slate-50 cursor-pointer">
                                    <td className="p-4 text-slate-400 font-mono text-xs">{b.id}</td>
                                    <td className="p-4 text-slate-800 font-semibold">{b.client}</td>
                                    <td className="p-4 text-slate-600">{b.vehicle}</td>
                                    <td className="p-4 text-slate-400">{b.dates}</td>
                                    <td className="p-4">
                                        <span className={`${b.statusColor} px-3 py-1.5 rounded-full text-xs font-bold border`}>{b.status}</span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-[#1C0770]">{b.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
