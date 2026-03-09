import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, Clock, XCircle, Send, Car, FileText, X, Loader2, Edit, Trash2, Check } from 'lucide-react';
import { infractionsApi, vehiclesApi, reservationsApi, type Infraction, type Vehicle, type Reservation } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    matched: { label: 'Matché', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
    transmitted: { label: 'Transmis', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Send },
    resolved: { label: 'Résolu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    unmatched: { label: 'Non identifié', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

export default function Infractions() {
    const [infractions, setInfractions] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedInfraction, setSelectedInfraction] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Infraction>>({
        vehicle_id: '',
        infraction_type: 'Excès de vitesse',
        infraction_date: new Date().toISOString().split('T')[0],
        infraction_time: '12:00',
        city: '',
        location: '',
        authority_name: 'Radar fixe',
        reference_number: '',
        fine_amount: 0,
        description: '',
        status: 'pending'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [infData, vehData, resData] = await Promise.all([
                infractionsApi.getAll(),
                vehiclesApi.getAll(),
                reservationsApi.getAll()
            ]);
            setInfractions(infData);
            setVehicles(vehData);
            setReservations(resData);
        } catch (err: any) {
            toast.error("Erreur chargement données");
        } finally {
            setLoading(false);
        }
    };

    const findMatchingReservation = (vehicleId: string, dateStr: string) => {
        const date = new Date(dateStr);
        return reservations.find(r =>
            r.vehicle_id === vehicleId &&
            new Date(r.start_date) <= date &&
            new Date(r.end_date) >= date
        );
    };

    const handleAdd = () => {
        setSelectedInfraction(null);
        setFormData({
            vehicle_id: '',
            infraction_type: 'Excès de vitesse',
            infraction_date: new Date().toISOString().split('T')[0],
            infraction_time: '12:00',
            city: '',
            location: '',
            authority_name: 'Radar fixe',
            reference_number: '',
            fine_amount: 0,
            description: '',
            status: 'pending'
        });
        setShowForm(true);
    };

    const handleEdit = (inf: any) => {
        setSelectedInfraction(inf);
        setFormData({
            ...inf,
            infraction_date: inf.infraction_date.split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette infraction ?')) return;
        try {
            await infractionsApi.delete(id);
            setInfractions(prev => prev.filter(i => i.id !== id));
            toast.success('Supprimé');
        } catch (err) {
            toast.error('Erreur suppression');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Auto-match
            const match = findMatchingReservation(formData.vehicle_id!, formData.infraction_date!);
            const finalData = {
                ...formData,
                reservation_id: match?.id || null,
                customer_id: match?.customer_id || null,
                status: match ? 'matched' : (formData.status || 'pending')
            };

            if (selectedInfraction) {
                const updated = await infractionsApi.update(selectedInfraction.id, finalData);
                const fresh = await infractionsApi.getById(selectedInfraction.id);
                setInfractions(prev => prev.map(i => i.id === updated.id ? fresh : i));
                toast.success('Mis à jour');
            } else {
                const created = await infractionsApi.create(finalData);
                const fresh = await infractionsApi.getById(created.id);
                setInfractions(prev => [fresh, ...prev]);
                toast.success('Ajouté');
            }
            setShowForm(false);
        } catch (err: any) {
            toast.error(err.message || 'Erreur enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredInfractions = infractions.filter(i => {
        const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
        const matchesSearch =
            (i.vehicles?.brand + ' ' + i.vehicles?.model).toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Infractions & Amendes</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez le suivi des amendes et leur imputation aux clients</p>
                </div>
                {!showForm && (
                    <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#E11D48] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(225,29,72,0.4)] transition-all">
                        <Plus className="w-4 h-4" /> Signaler une infraction
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1C0770]">Signaler une infraction</h2>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Véhicule concerné *</label>
                                    <select required value={formData.vehicle_id} onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800">
                                        <option value="">Sélectionner un véhicule</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate_number}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
                                        <input required type="date" value={formData.infraction_date} onChange={e => setFormData({ ...formData, infraction_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Heure *</label>
                                        <input required type="time" value={formData.infraction_time} onChange={e => setFormData({ ...formData, infraction_time: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lieu & Ville</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input required type="text" placeholder="Ville" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                                        <input type="text" placeholder="Précision lieu" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type & Autorité</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" placeholder="Autorité (Gendarmerie...)" value={formData.authority_name} onChange={e => setFormData({ ...formData, authority_name: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                                        <select value={formData.infraction_type} onChange={e => setFormData({ ...formData, infraction_type: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800">
                                            <option>Excès de vitesse</option>
                                            <option>Radar fixe</option>
                                            <option>Stationnement</option>
                                            <option>Feu rouge</option>
                                            <option>Autre</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Référence</label>
                                        <input type="text" placeholder="N° Procès..." value={formData.reference_number} onChange={e => setFormData({ ...formData, reference_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Montant (MAD)</label>
                                        <input required type="number" value={formData.fine_amount} onChange={e => setFormData({ ...formData, fine_amount: parseFloat(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-rose-600 text-slate-800" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes administratives</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-sm font-bold text-slate-500">Annuler</button>
                            <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl flex items-center gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {selectedInfraction ? 'Mettre à jour' : 'Enregistrer et Matcher'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Véhicule, client, référence..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#F0F4FF] border border-slate-200 text-sm rounded-xl pl-10 p-2.5" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {['all', 'pending', 'matched', 'transmitted', 'resolved'].map(s => (
                                <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 text-xs font-bold rounded-full border whitespace-nowrap ${filterStatus === s ? 'bg-[#1C0770] text-white' : 'bg-white text-slate-500 border-slate-200'}`}>
                                    {s === 'all' ? 'Tous' : STATUS_MAP[s].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center gap-3"><Loader2 className="animate-spin text-rose-600" /><p className="text-slate-400 text-sm">Chargement...</p></div>
                            ) : filteredInfractions.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#FFF1F2] text-rose-400 text-[10px] uppercase tracking-widest font-bold">
                                            <th className="p-4">Référence</th>
                                            <th className="p-4">Véhicule</th>
                                            <th className="p-4">Date & Lieu</th>
                                            <th className="p-4">Client Matché</th>
                                            <th className="p-4">Montant</th>
                                            <th className="p-4">Statut</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredInfractions.map(inf => {
                                            const st = STATUS_MAP[inf.status] || STATUS_MAP.pending;
                                            const Icon = st.icon;
                                            return (
                                                <tr key={inf.id} className="hover:bg-rose-50/30 transition-colors border-b border-slate-50 font-medium">
                                                    <td className="p-4 text-rose-600 font-mono text-xs">{inf.reference_number || 'N/A'}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <Car className="w-4 h-4 text-slate-400" />
                                                            <div>
                                                                <p className="text-slate-700">{inf.vehicles?.brand} {inf.vehicles?.model}</p>
                                                                <p className="text-[10px] text-slate-400">{inf.vehicles?.plate_number}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-slate-600 font-bold">{new Date(inf.infraction_date).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-slate-400">{inf.city}, {inf.location}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        {inf.customers ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] text-blue-600 font-black">{inf.customers.full_name[0]}</div>
                                                                <p className="text-slate-700 text-xs">{inf.customers.full_name}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-slate-300 italic text-xs">Non identifié</p>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-rose-600 font-black">{inf.fine_amount} MAD</td>
                                                    <td className="p-4">
                                                        <span className={`${st.color} px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1`}>
                                                            <Icon className="w-3 h-3" /> {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button onClick={() => handleEdit(inf)} className="p-2 text-slate-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(inf.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-20 text-center text-slate-400"><FileText className="w-8 h-8 mx-auto mb-2 opacity-20" /><p>Aucune infraction</p></div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
