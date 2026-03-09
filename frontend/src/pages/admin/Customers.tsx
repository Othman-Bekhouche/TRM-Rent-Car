import { Search, Download, Phone, MapPin, Eye } from 'lucide-react';

const CUSTOMERS = [
    { id: 1, name: 'Mohammed Alaoui', email: 'alaoui.m@gmail.com', phone: '06 12 34 56 78', city: 'Oujda', cin: 'BH123456', reservations: 5, totalSpent: '6 300 MAD', lastRental: '12/03/2026', status: 'Actif' },
    { id: 2, name: 'Sophie Martin', email: 'sophie.martin@gmail.com', phone: '07 88 99 00 11', city: 'Casablanca', cin: 'BE789012', reservations: 2, totalSpent: '3 120 MAD', lastRental: '10/03/2026', status: 'Actif' },
    { id: 3, name: 'Hassan Benali', email: 'hassan.b@gmail.com', phone: '06 55 44 33 22', city: 'Fès', cin: 'BJ345678', reservations: 8, totalSpent: '12 400 MAD', lastRental: '08/03/2026', status: 'VIP' },
    { id: 4, name: 'Fatima El Ouardi', email: 'fatima.eo@gmail.com', phone: '06 99 88 77 66', city: 'Taourirt', cin: 'BK901234', reservations: 3, totalSpent: '2 880 MAD', lastRental: '05/03/2026', status: 'Actif' },
    { id: 5, name: 'Youssef Ziani', email: 'y.ziani@gmail.com', phone: '06 11 22 33 44', city: 'Nador', cin: 'BL567890', reservations: 1, totalSpent: '1 500 MAD', lastRental: '01/03/2026', status: 'Nouveau' },
    { id: 6, name: 'Amina Tazi', email: 'amina.tazi@gmail.com', phone: '06 77 88 99 00', city: 'Tanger', cin: 'BM123456', reservations: 0, totalSpent: '0 MAD', lastRental: '-', status: 'Annulé' },
];

export default function Customers() {
    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Base Clients</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez la relation client et l'historique des réservations</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:shadow-md transition-all">
                    <Download className="w-4 h-4" /> Exporter CSV
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Clients</p>
                    <p className="text-3xl font-black text-[#1C0770] mt-1">42</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Actifs</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">36</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs text-[#3A9AFF] font-bold uppercase tracking-wider">VIP</p>
                    <p className="text-3xl font-black text-[#3A9AFF] mt-1">4</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Nouveaux (Mars)</p>
                    <p className="text-3xl font-black text-amber-600 mt-1">5</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Rechercher nom, email, CIN, téléphone..." className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#3A9AFF] focus:border-[#3A9AFF] block pl-10 p-3 transition-colors" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <th className="p-4">Client</th>
                                <th className="p-4">CIN</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Ville</th>
                                <th className="p-4">Réservations</th>
                                <th className="p-4">Total Dépensé</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {CUSTOMERS.map((c) => (
                                <tr key={c.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50 cursor-pointer">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#261CC1] to-[#3A9AFF] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {c.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{c.name}</p>
                                                <p className="text-xs text-slate-400">{c.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-[#261CC1] font-bold">{c.cin}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-slate-500 text-xs"><Phone className="w-3 h-3" /> {c.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-slate-500 text-xs"><MapPin className="w-3 h-3" /> {c.city}</div>
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-700">{c.reservations}</td>
                                    <td className="p-4 font-bold text-[#1C0770]">{c.totalSpent}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${c.status === 'VIP' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            c.status === 'Actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                c.status === 'Nouveau' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-red-50 text-red-600 border-red-200'
                                            }`}>{c.status}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-[#3A9AFF] hover:bg-[#3A9AFF]/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
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
