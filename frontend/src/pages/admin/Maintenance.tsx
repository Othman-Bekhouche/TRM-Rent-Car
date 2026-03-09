import { Wrench, Plus, AlertTriangle, CheckCircle, Clock, Car } from 'lucide-react';

const MAINTENANCE_LOG = [
    { id: 1, vehicle: 'Dacia Sandero Bleu', plate: 'SND-D-007', type: 'Vidange + Filtres', date: '09/03/2026', nextDate: '09/06/2026', km: '15 000 km', cost: '850 MAD', status: 'En cours', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 2, vehicle: 'Peugeot 208 Noir', plate: '208-A-001', type: 'Contrôle technique', date: '01/03/2026', nextDate: '01/03/2027', km: '22 000 km', cost: '400 MAD', status: 'Terminé', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 3, vehicle: 'Dacia Logan Blanc', plate: 'LOG-C-003', type: 'Pneus (4x)', date: '25/02/2026', nextDate: '25/02/2027', km: '18 000 km', cost: '2 400 MAD', status: 'Terminé', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 4, vehicle: 'Peugeot 208 Gris', plate: '208-B-002', type: 'Plaquettes frein AV', date: '15/02/2026', nextDate: '15/08/2026', km: '20 000 km', cost: '600 MAD', status: 'Terminé', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 5, vehicle: 'Dacia Sandero Gris', plate: 'SND-D-006', type: 'Vidange', date: '10/02/2026', nextDate: '10/05/2026', km: '14 500 km', cost: '500 MAD', status: 'Planifié', statusColor: 'bg-blue-50 text-blue-700 border-blue-200' },
];

const ALERTS = [
    { vehicle: 'Dacia Sandero Gris (SND-D-006)', alert: 'Prochaine vidange dans 15 jours', severity: 'warning' },
    { vehicle: 'Dacia Logan Gris (LOG-C-004)', alert: 'Contrôle technique à planifier avant le 15/04', severity: 'warning' },
    { vehicle: 'Dacia Sandero Bleu (SND-D-007)', alert: 'Actuellement en maintenance — Non disponible', severity: 'info' },
];

export default function Maintenance() {
    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Maintenance</h1>
                    <p className="text-slate-500 text-sm mt-1">Suivi de l'entretien des véhicules — Carnet digital</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all">
                    <Plus className="w-4 h-4" /> Planifier entretien
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl"><Wrench className="w-6 h-6 text-amber-600" /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">En Maintenance</p>
                        <p className="text-2xl font-black text-amber-600">1</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl"><Clock className="w-6 h-6 text-blue-600" /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Planifiés</p>
                        <p className="text-2xl font-black text-blue-600">1</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Coût Total (Mois)</p>
                        <p className="text-2xl font-black text-[#1C0770]">4 750 MAD</p>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="space-y-3">
                {ALERTS.map((a, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border ${a.severity === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${a.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
                        <div>
                            <p className={`text-sm font-bold ${a.severity === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>{a.vehicle}</p>
                            <p className={`text-xs ${a.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}>{a.alert}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Maintenance Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-[#1C0770] flex items-center gap-2"><Car className="w-4 h-4 text-[#3A9AFF]" /> Historique Entretien</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <th className="p-4">Véhicule</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Prochain</th>
                                <th className="p-4">Kilométrage</th>
                                <th className="p-4">Coût</th>
                                <th className="p-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {MAINTENANCE_LOG.map((m) => (
                                <tr key={m.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50">
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-800">{m.vehicle}</p>
                                        <p className="text-xs text-[#261CC1] font-mono">{m.plate}</p>
                                    </td>
                                    <td className="p-4 text-slate-700 font-medium">{m.type}</td>
                                    <td className="p-4 text-slate-500">{m.date}</td>
                                    <td className="p-4 text-slate-500">{m.nextDate}</td>
                                    <td className="p-4 text-slate-500">{m.km}</td>
                                    <td className="p-4 font-bold text-[#1C0770]">{m.cost}</td>
                                    <td className="p-4">
                                        <span className={`${m.statusColor} px-3 py-1.5 rounded-full text-xs font-bold border`}>{m.status}</span>
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
