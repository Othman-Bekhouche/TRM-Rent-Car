import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

const VEHICLES = [
    { id: 1, brand: 'Peugeot', model: '208', color: 'Noir', plate: '208-A-001', fuel: 'Diesel', transmission: 'Manuelle 6V', year: 2026, price: 420, status: 'Disponible', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', image: '/images/cars/peugeot_208_noir.png' },
    { id: 2, brand: 'Peugeot', model: '208', color: 'Gris', plate: '208-B-002', fuel: 'Hybride', transmission: 'Automatique', year: 2026, price: 520, status: 'Disponible', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', image: '/images/cars/peugeot_208_gris.png' },
    { id: 3, brand: 'Dacia', model: 'Logan', color: 'Blanc', plate: 'LOG-C-003', fuel: 'Diesel', transmission: 'Manuelle', year: 2026, price: 300, status: 'Loué', statusColor: 'bg-blue-50 text-blue-700 border-blue-200', image: '/images/cars/dacia_logan_blanc.png' },
    { id: 4, brand: 'Dacia', model: 'Logan', color: 'Gris', plate: 'LOG-C-004', fuel: 'Diesel', transmission: 'Manuelle', year: 2026, price: 300, status: 'Loué', statusColor: 'bg-blue-50 text-blue-700 border-blue-200', image: '/images/cars/dacia_logan_gris.png' },
    { id: 5, brand: 'Dacia', model: 'Sandero', color: 'Blanc', plate: 'SND-D-005', fuel: 'Essence', transmission: 'Manuelle', year: 2026, price: 320, status: 'Disponible', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', image: '/images/cars/dacia_sandero_blanc.png' },
    { id: 6, brand: 'Dacia', model: 'Sandero', color: 'Gris', plate: 'SND-D-006', fuel: 'Essence', transmission: 'Manuelle', year: 2026, price: 320, status: 'Disponible', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', image: '/images/cars/dacia_sandero_gris.png' },
    { id: 7, brand: 'Dacia', model: 'Sandero', color: 'Bleu', plate: 'SND-D-007', fuel: 'Essence', transmission: 'Manuelle', year: 2026, price: 320, status: 'Maintenance', statusColor: 'bg-orange-50 text-orange-700 border-orange-200', image: '/images/cars/dacia_sandero_blanc.png' },
];

export default function AdminVehicles() {
    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Flotte Véhicules</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez le catalogue complet des véhicules TRM Rent Car</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all">
                    <Plus className="w-4 h-4" /> Ajouter un véhicule
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Flotte</p>
                    <p className="text-3xl font-black text-[#1C0770] mt-1">7</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Disponibles</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">4</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">En Location</p>
                    <p className="text-3xl font-black text-blue-600 mt-1">2</p>
                </div>
            </div>

            {/* Vehicles Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Rechercher marque, modèle, plaque..." className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#3A9AFF] focus:border-[#3A9AFF] block pl-10 p-3 transition-colors" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <th className="p-4">Véhicule</th>
                                <th className="p-4">Plaque</th>
                                <th className="p-4">Couleur</th>
                                <th className="p-4">Carburant</th>
                                <th className="p-4">Transmission</th>
                                <th className="p-4">Prix/Jour</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {VEHICLES.map((v) => (
                                <tr key={v.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50 group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-10 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-100 group-hover:shadow-md transition-shadow">
                                                <img src={v.image} alt={v.model} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{v.brand} {v.model}</p>
                                                <p className="text-xs text-slate-400">{v.year}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-[#261CC1] font-bold">{v.plate}</td>
                                    <td className="p-4 text-slate-600">{v.color}</td>
                                    <td className="p-4 text-slate-600">{v.fuel}</td>
                                    <td className="p-4 text-slate-600">{v.transmission}</td>
                                    <td className="p-4 font-black text-[#1C0770]">{v.price} MAD</td>
                                    <td className="p-4">
                                        <span className={`${v.statusColor} px-3 py-1.5 rounded-full text-xs font-bold border`}>{v.status}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 text-slate-400 hover:text-[#3A9AFF] hover:bg-[#3A9AFF]/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
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
