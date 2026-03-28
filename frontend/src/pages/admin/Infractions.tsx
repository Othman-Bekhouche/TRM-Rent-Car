import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, Clock, XCircle, Send, Car, FileText, X, Loader2, Edit, Trash2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { infractionsApi, vehiclesApi, reservationsApi, customersApi, type Infraction, type Vehicle, type Reservation } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    matched: { label: 'Matché', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
    transmitted: { label: 'Transmis', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Send },
    resolved: { label: 'Résolu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    unmatched: { label: 'Non identifié', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
    exces_vitesse: 'Excès de vitesse',
    radar_fixe: 'Radar fixe',
    stationnement_interdit: 'Stationnement',
    feu_rouge: 'Feu rouge',
    controle_routier: 'Contrôle routier',
    autre: 'Autre'
};

export default function Infractions() {
    const [infractions, setInfractions] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedInfraction, setSelectedInfraction] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Infraction>>({
        vehicle_id: '',
        customer_id: '',
        infraction_type: 'exces_vitesse',
        infraction_date: new Date().toLocaleDateString('en-CA'),
        infraction_time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
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
            const [infData, vehData, resData, custData] = await Promise.all([
                infractionsApi.getAll(),
                vehiclesApi.getAll(),
                reservationsApi.getAll(),
                customersApi.getAll()
            ]);
            setInfractions(infData);
            setVehicles(vehData);
            setReservations(resData);
            setCustomers(custData);
        } catch (err: any) {
            toast.error("Erreur chargement données");
        } finally {
            setLoading(false);
        }
    };

    const findMatchingReservation = (vehicleId: string, dateStr: string, timeStr?: string) => {
        if (!vehicleId || !dateStr) return null;

        // Construct a full timestamp for precise matching if time is available
        const infractionTS = timeStr ? new Date(`${dateStr}T${timeStr}`) : null;
        const searchDate = new Date(`${dateStr}T12:00:00`); // Midday local is safe for date only

        // Find all potential matches
        const potentials = reservations.filter(r => {
            if (r.vehicle_id !== vehicleId) return false;
            if (['cancelled', 'rejected'].includes(r.status)) return false;

            // 1. If we have precise handover times, use them
            const handover = r.handover?.[0]; // Supabase joins return array
            if (infractionTS && handover?.handover_date) {
                const startTS = new Date(handover.handover_date);
                const endTS = handover.return_date ? new Date(handover.return_date) : new Date(); // assume till now if not returned

                if (infractionTS >= startTS && infractionTS <= endTS) return true;
                // If it doesn't match handover but we HAVE handover data, it might belong to next/prev contract
                // So we stick to precise match here
            }

            // 2. Fallback to Date-range comparison (inclusive)
            const startStr = r.start_date.split('T')[0];
            const endStr = r.end_date.split('T')[0];
            const start = new Date(startStr + 'T00:00:00');
            const end = new Date(endStr + 'T23:59:59');

            return searchDate >= start && searchDate <= end;
        });

        if (potentials.length === 0) return null;

        // If we have precise matches via handover, they'll be in potentials if they matched specifically.
        // We still prioritize by status and overlap logic.
        const statusPriority: Record<string, number> = {
            rented: 0,
            returned: 1,
            completed: 2,
            confirmed: 3,
            pending: 4
        };

        return potentials.sort((a, b) => {
            const prioA = statusPriority[a.status] ?? 10;
            const prioB = statusPriority[b.status] ?? 10;
            if (prioA !== prioB) return prioA - prioB;
            return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        })[0];
    };

    const handleAdd = () => {
        setSelectedInfraction(null);
        setFormData({
            vehicle_id: '',
            infraction_type: 'exces_vitesse',
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

    useEffect(() => {
        if (formData.vehicle_id && formData.infraction_date && !selectedInfraction) {
            autoMatch();
        }
    }, [formData.vehicle_id, formData.infraction_date, formData.infraction_time, selectedInfraction]);

    const autoMatch = () => {
        const match = findMatchingReservation(formData.vehicle_id!, formData.infraction_date!, formData.infraction_time);
        if (match) {
            setFormData(prev => ({
                ...prev,
                customer_id: match.customer_id,
                reservation_id: match.id
            }));
        } else {
            setFormData(prev => ({ ...prev, customer_id: '', reservation_id: undefined }));
        }
    };

    const handleManualRefreshMatch = () => {
        if (!formData.vehicle_id || !formData.infraction_date) {
            toast.error("Veuillez sélectionner un véhicule et une date");
            return;
        }

        const match = findMatchingReservation(formData.vehicle_id, formData.infraction_date, formData.infraction_time);
        if (match) {
            setFormData(prev => ({
                ...prev,
                customer_id: match.customer_id,
                reservation_id: match.id
            }));
            toast.success("Client trouvé pour cette période", { id: 'match_success' });
        } else {
            setFormData(prev => ({ ...prev, customer_id: '', reservation_id: undefined }));
            toast.error("Aucun client trouvé pour cette période", { id: 'match_fail' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Remove ANY joined properties or extra objects from formData before sending to the DB
            const baseData = { ...formData } as any;
            Object.keys(baseData).forEach(k => {
                if (typeof baseData[k] === 'object' && baseData[k] !== null) {
                    delete baseData[k];
                }
            });

            // Also specifically delete potential join keys just in case
            delete baseData.customer;
            delete baseData.customers;
            delete baseData.vehicle;
            delete baseData.vehicles;
            delete baseData.reservation;
            delete baseData.reservations;

            // Clean up data for database (avoid empty string UUIDs)
            const cleanData = {
                ...baseData,
                vehicle_id: baseData.vehicle_id || null,
                reservation_id: baseData.reservation_id || null,
                customer_id: baseData.customer_id || null,
                fine_amount: Number(baseData.fine_amount) || 0
            };

            if (!cleanData.vehicle_id) {
                toast.error('Sélectionnez un véhicule');
                setIsSaving(false);
                return;
            }

            // Status logic: if we have a customer_id, it is 'matched'
            const finalData: Partial<Infraction> = {
                ...cleanData,
                status: cleanData.customer_id ? 'matched' : (cleanData.status || 'pending')
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
        const vehicleInfo = (i.vehicle?.brand || '') + ' ' + (i.vehicle?.model || '') + ' ' + (i.vehicle?.plate_number || '');
        const matchesSearch =
            vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.customer?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
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
                        <Plus className="w-4 h-4" /> Ajouter une infraction
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
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client Responsable (Auto-matché)</label>
                                    <select value={formData.customer_id || ''} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800">
                                        <option value="">Non identifié</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
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
                                            <option value="exces_vitesse">Excès de vitesse</option>
                                            <option value="radar_fixe">Radar fixe</option>
                                            <option value="stationnement_interdit">Stationnement</option>
                                            <option value="feu_rouge">Feu rouge</option>
                                            <option value="controle_routier">Contrôle routier</option>
                                            <option value="autre">Autre</option>
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

                                {formData.vehicle_id && formData.infraction_date && (
                                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Aperçu du Match Client</p>
                                                <button type="button" onClick={handleManualRefreshMatch} className="p-1 hover:bg-rose-100 rounded-lg transition-colors text-rose-500" title="Actualiser la recherche">
                                                    <RefreshCw className="w-3 h-3" />
                                                </button>
                                            </div>
                                            {(() => {
                                                const infDateSafe = formData.infraction_date!.split('T')[0];
                                                const potentials = reservations.filter(r => {
                                                    if (r.vehicle_id !== formData.vehicle_id || ['cancelled', 'rejected'].includes(r.status)) return false;
                                                    const startStr = r.start_date.split('T')[0];
                                                    const endStr = r.end_date.split('T')[0];
                                                    return new Date(infDateSafe + 'T12:00:00') >= new Date(startStr + 'T00:00:00') &&
                                                        new Date(infDateSafe + 'T12:00:00') <= new Date(endStr + 'T23:59:59');
                                                });
                                                return potentials.length > 1 && (
                                                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                        <AlertCircle className="w-3 h-3" /> multi-match
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        {(() => {
                                            const match = findMatchingReservation(formData.vehicle_id!, formData.infraction_date!, formData.infraction_time);
                                            const isPrecise = match?.handover?.[0]?.handover_date && formData.infraction_time;

                                            return match ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-rose-600 font-bold shadow-sm">{match.customers?.full_name?.[0] || '?'}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{match.customers?.full_name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                                                            {isPrecise ? 'Match précis (Livraison)' : 'Match via dates contrat'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <Clock className="w-5 h-5" />
                                                    <p className="text-xs font-bold uppercase tracking-widest">Aucun client trouvé pour cette date</p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
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
                                            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                                            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Heure</th>
                                            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Véhicule</th>
                                            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Client Responsable</th>
                                            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Montant</th>
                                            <th className="p-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredInfractions.map(inf => {
                                            const st = STATUS_MAP[inf.status] || STATUS_MAP.pending;
                                            const Icon = st.icon;
                                            const isMatched = !!inf.customer_id;
                                            return (
                                                <tr key={inf.id} className="hover:bg-rose-50/30 transition-colors border-b border-slate-50 font-medium">
                                                    <td className="p-4 text-rose-600 font-mono text-xs">
                                                        <p className="font-bold underline decoration-rose-200">#{inf.reference_number || 'SANS-REF'}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">{TYPE_LABELS[inf.infraction_type] || inf.infraction_type}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-slate-700 font-bold">{new Date(inf.infraction_date).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {inf.infraction_time || '--:--'}
                                                        </p>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                                                                <Car className="w-4 h-4 text-slate-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-700 text-xs font-bold">{inf.vehicle?.brand} {inf.vehicle?.model}</p>
                                                                <p className="text-[10px] text-slate-400 font-mono">{inf.vehicle?.plate_number}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {inf.customer ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-[10px] text-blue-600 font-black border border-blue-100">
                                                                    {inf.customer?.full_name ? inf.customer.full_name[0] : '?'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-700 text-xs font-bold">{inf.customer?.full_name}</p>
                                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">CIN: {inf.customer?.cin || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-slate-300">
                                                                <XCircle className="w-4 h-4" />
                                                                <p className="italic text-[10px]">Non identifié</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-rose-600 font-black">{inf.fine_amount} MAD</td>
                                                    <td className="p-4">
                                                        <span className={`${st.color} px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1`} title={isMatched ? "Infraction associée à un client" : "Client non identifié"}>
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
            )
            }
        </div >
    );
}
