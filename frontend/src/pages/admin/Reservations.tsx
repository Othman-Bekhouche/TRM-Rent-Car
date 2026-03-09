import { Plus, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';

const RESERVATIONS = [
    { id: '#RES-2031', client: 'Mohammed Alaoui', phone: '06 12 34 56 78', vehicle: 'Peugeot 208 Noir', plate: '208-A-001', pickup: 'Aéroport Oujda', dateStart: '12/03/2026', dateEnd: '15/03/2026', days: 3, total: '1 260 MAD', status: 'pending', payment: 'Espèces' },
    { id: '#RES-2030', client: 'Sophie Martin', phone: '07 88 99 00 11', vehicle: 'Peugeot 208 Gris', plate: '208-B-002', pickup: 'Agence Taourirt', dateStart: '10/03/2026', dateEnd: '14/03/2026', days: 4, total: '2 080 MAD', status: 'confirmed', payment: 'Virement' },
    { id: '#RES-2029', client: 'Hassan Benali', phone: '06 55 44 33 22', vehicle: 'Dacia Logan Blanc', plate: 'LOG-C-003', pickup: 'Aéroport Oujda', dateStart: '08/03/2026', dateEnd: '15/03/2026', days: 7, total: '2 100 MAD', status: 'active', payment: 'Espèces' },
    { id: '#RES-2028', client: 'Fatima El Ouardi', phone: '06 99 88 77 66', vehicle: 'Dacia Sandero Gris', plate: 'SND-D-006', pickup: 'Agence Taourirt', dateStart: '05/03/2026', dateEnd: '08/03/2026', days: 3, total: '960 MAD', status: 'completed', payment: 'Espèces' },
    { id: '#RES-2027', client: 'Youssef Ziani', phone: '06 11 22 33 44', vehicle: 'Dacia Logan Gris', plate: 'LOG-C-004', pickup: 'Livraison Hôtel', dateStart: '01/03/2026', dateEnd: '06/03/2026', days: 5, total: '1 500 MAD', status: 'completed', payment: 'Carte' },
    { id: '#RES-2026', client: 'Amina Tazi', phone: '06 77 88 99 00', vehicle: 'Dacia Sandero Blanc', plate: 'SND-D-005', pickup: 'Aéroport Oujda', dateStart: '25/02/2026', dateEnd: '28/02/2026', days: 3, total: '960 MAD', status: 'cancelled', payment: 'Espèces' },
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    confirmed: { label: 'Confirmé', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
    active: { label: 'En cours', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    completed: { label: 'Terminé', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: CheckCircle },
    cancelled: { label: 'Annulé', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

export default function Reservations() {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? RESERVATIONS : RESERVATIONS.filter(r => r.status === filter);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Réservations</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez toutes les locations et demandes en cours</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all">
                    <Plus className="w-4 h-4" /> Nouvelle Réservation
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-5">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par n° résa, client, véhicule..."
                            className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#3A9AFF] focus:border-[#3A9AFF] block pl-10 p-3 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { key: 'all', label: 'Toutes', count: RESERVATIONS.length },
                            { key: 'pending', label: 'En attente', count: RESERVATIONS.filter(r => r.status === 'pending').length },
                            { key: 'confirmed', label: 'Confirmé', count: RESERVATIONS.filter(r => r.status === 'confirmed').length },
                            { key: 'active', label: 'En cours', count: RESERVATIONS.filter(r => r.status === 'active').length },
                            { key: 'completed', label: 'Terminé', count: RESERVATIONS.filter(r => r.status === 'completed').length },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${filter === f.key
                                    ? 'bg-[#261CC1] text-white border-[#261CC1] shadow-md'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#3A9AFF] hover:text-[#261CC1]'
                                    }`}
                            >
                                {f.label} ({f.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <th className="p-4 rounded-l-xl">Réf</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Véhicule</th>
                                <th className="p-4">Retrait</th>
                                <th className="p-4">Période</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Paiement</th>
                                <th className="p-4 text-right rounded-r-xl">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filtered.map((r, i) => {
                                const st = STATUS_MAP[r.status];
                                const StIcon = st.icon;
                                return (
                                    <tr key={i} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50 cursor-pointer group">
                                        <td className="p-4 text-[#261CC1] font-mono text-xs font-bold">{r.id}</td>
                                        <td className="p-4">
                                            <p className="text-slate-800 font-semibold">{r.client}</p>
                                            <p className="text-slate-400 text-xs">{r.phone}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-slate-700 font-medium">{r.vehicle}</p>
                                            <p className="text-slate-400 text-xs font-mono">{r.plate}</p>
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs">{r.pickup}</td>
                                        <td className="p-4 text-slate-500 text-xs">{r.dateStart} → {r.dateEnd}<br /><span className="font-bold text-[#261CC1]">{r.days}j</span></td>
                                        <td className="p-4">
                                            <span className={`${st.color} inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border`}>
                                                <StIcon className="w-3 h-3" /> {st.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs font-medium">{r.payment}</td>
                                        <td className="p-4 text-right font-black text-[#1C0770]">{r.total}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
