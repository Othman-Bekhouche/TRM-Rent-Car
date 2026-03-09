import { Plus, Shield, Edit, Trash2, Mail } from 'lucide-react';

const ADMINS = [
    { id: 1, name: 'Med Tahiri', email: 'admin@trmrentcar.ma', role: 'Super Admin', status: 'Actif', lastLogin: '09/03/2026 01:20', avatar: 'MT' },
    { id: 2, name: 'Ahmed Tahiri', email: 'ahmed.t@trmrentcar.ma', role: 'Gestionnaire', status: 'Actif', lastLogin: '08/03/2026 14:30', avatar: 'AT' },
    { id: 3, name: 'Sara Bennani', email: 'sara.b@trmrentcar.ma', role: 'Agent Réservation', status: 'Actif', lastLogin: '07/03/2026 09:15', avatar: 'SB' },
];

const ROLES = [
    { name: 'Super Admin', permissions: 'Accès complet — Toutes les fonctionnalités', color: 'bg-purple-50 text-purple-700 border-purple-200', count: 1 },
    { name: 'Gestionnaire', permissions: 'Véhicules, Réservations, Clients, Comptabilité', color: 'bg-blue-50 text-blue-700 border-blue-200', count: 1 },
    { name: 'Agent Réservation', permissions: 'Réservations, Clients (lecture seule)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', count: 1 },
];

export default function Users() {
    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Administrateurs</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez les accès et rôles de votre équipe</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all">
                    <Plus className="w-4 h-4" /> Nouvel Administrateur
                </button>
            </div>

            {/* Roles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ROLES.map((role, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className={`${role.color} px-3 py-1.5 rounded-full text-xs font-bold border`}>{role.name}</span>
                            <span className="text-lg font-black text-[#1C0770]">{role.count}</span>
                        </div>
                        <p className="text-xs text-slate-500">{role.permissions}</p>
                    </div>
                ))}
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-[#261CC1]/10 rounded-xl"><Shield className="w-5 h-5 text-[#261CC1]" /></div>
                    <h2 className="font-bold text-[#1C0770]">Liste des Administrateurs</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <th className="p-4">Utilisateur</th>
                                <th className="p-4">Rôle</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Dernière connexion</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {ADMINS.map((a) => (
                                <tr key={a.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#1C0770] to-[#3A9AFF] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                {a.avatar}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{a.name}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{a.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${a.role === 'Super Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            a.role === 'Gestionnaire' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>{a.role}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full" /> {a.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">{a.lastLogin}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 text-slate-400 hover:text-[#261CC1] hover:bg-[#261CC1]/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
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
