import { reservationsApi, vehiclesApi, customersApi, supabase, type Reservation, type Vehicle, type Customer } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { format, addDays } from 'date-fns';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    confirmed: { label: 'Confirmé', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
    active: { label: 'En cours', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    rented: { label: 'Loué', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: CheckCircle },
    returned: { label: 'Retourné', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: CheckCircle },
    completed: { label: 'Terminé', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: CheckCircle },
    cancelled: { label: 'Annulé', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

export default function Reservations() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [showPickupCustom, setShowPickupCustom] = useState(false);
    const [showDropoffCustom, setShowDropoffCustom] = useState(false);

    const PRESET_LOCATIONS = [
        'Agence Taourirt',
        'Aéroport Oujda Angads',
        'Aéroport Nador Arrouit',
        'Gare Ferroviaire Taourirt',
    ];

    // Form state
    const [formData, setFormData] = useState<Partial<Reservation>>({
        customer_id: '',
        vehicle_id: '',
        start_date: '',
        end_date: '',
        pickup_location: 'Agence Taourirt',
        dropoff_location: 'Agence Taourirt',
        total_price: 0,
        status: 'pending',
        payment_method: 'Espèces',
        payment_status: 'pending',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [resData, vehData, custData] = await Promise.all([
                reservationsApi.getAll(),
                vehiclesApi.getAll(),
                customersApi.getAll()
            ]);
            setReservations(resData);
            setVehicles(vehData);
            setCustomers(custData);
        } catch (err: any) {
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (res: any) => {
        setSelectedReservation(res);
        setFormData({
            ...res,
            start_date: res.start_date.split('T')[0],
            end_date: res.end_date.split('T')[0],
        });
        setShowForm(true);
    };

    const handleAdd = () => {
        setSelectedReservation(null);
        setFormData({
            customer_id: '',
            vehicle_id: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            pickup_location: 'Agence Taourirt',
            dropoff_location: 'Agence Taourirt',
            total_price: 0,
            status: 'pending',
            payment_method: 'Espèces',
            payment_status: 'pending',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return;
        try {
            await reservationsApi.delete(id);
            toast.success('Réservation supprimée');
            setReservations(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const checkAvailability = async () => {
        if (!formData.vehicle_id || !formData.start_date || !formData.end_date) return true;

        try {
            setIsCheckingAvailability(true);
            const { data, error } = await supabase.rpc('check_vehicle_availability', {
                p_vehicle_id: formData.vehicle_id,
                p_start_date: formData.start_date,
                p_end_date: formData.end_date
            });

            if (error) throw error;
            if (data && data.length > 0) {
                const result = data[0];
                if (!result.is_available) {
                    const nextDate = result.next_available_date ? format(new Date(result.next_available_date), 'dd/MM/yyyy') : 'plus tard';
                    toast.error(`Ce véhicule est déjà réservé. Prochaine disponibilité : à partir du ${nextDate}.`);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Availability check failed:', error);
            // If check fails, we might still allow but warning
            return true;
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation basic
        if (new Date(formData.start_date!) >= new Date(formData.end_date!)) {
            toast.error("La date de fin doit être après la date de début.");
            return;
        }

        // Check availability strictly for NEW reservations or if dates/vehicle changed on EDIT
        let needsAvailabilityCheck = false;
        if (!selectedReservation) {
            needsAvailabilityCheck = true;
        } else if (
            selectedReservation.vehicle_id !== formData.vehicle_id ||
            selectedReservation.start_date.split('T')[0] !== formData.start_date ||
            selectedReservation.end_date.split('T')[0] !== formData.end_date
        ) {
            needsAvailabilityCheck = true;
        }

        if (needsAvailabilityCheck) {
            const isAvailable = await checkAvailability();
            if (!isAvailable) return;
        }

        setIsSaving(true);
        try {
            if (selectedReservation) {
                const updated = await reservationsApi.update(selectedReservation.id, formData);

                // Update Vehicle Status if reservation status changed to specific values
                if (formData.status === 'confirmed') {
                    await vehiclesApi.update(formData.vehicle_id!, { status: 'booked' });
                } else if (formData.status === 'rented') {
                    await vehiclesApi.update(formData.vehicle_id!, { status: 'rented' });
                } else if (['cancelled', 'returned', 'completed'].includes(formData.status!)) {
                    await vehiclesApi.update(formData.vehicle_id!, { status: 'available' });
                }

                // Refresh list to get joined data
                const freshData = await reservationsApi.getById(selectedReservation.id);
                setReservations(prev => prev.map(r => r.id === updated.id ? freshData : r));
                toast.success('Réservation mise à jour');
            } else {
                const created = await reservationsApi.create(formData);

                // If creating as confirmed or rented
                if (formData.status === 'confirmed') {
                    await vehiclesApi.update(formData.vehicle_id!, { status: 'booked' });
                } else if (formData.status === 'rented') {
                    await vehiclesApi.update(formData.vehicle_id!, { status: 'rented' });
                }

                const freshData = await reservationsApi.getById(created.id);
                setReservations(prev => [freshData, ...prev]);
                toast.success('Réservation ajoutée');
            }
            setShowForm(false);
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setIsSaving(false);
        }
    };


    const filteredReservations = reservations.filter(r => {
        const matchesFilter = filter === 'all' || r.status === filter;
        const matchesSearch =
            (r.vehicles?.brand + ' ' + r.vehicles?.model).toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.reservation_number?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Réservations</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez toutes les locations et demandes en cours</p>
                </div>
                {!showForm && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Nouvelle Réservation
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1C0770]">{selectedReservation ? 'Modifier la réservation' : 'Nouvelle réservation'}</h2>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client *</label>
                                    <select required value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800">
                                        <option value="">Sélectionner un client</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Véhicule *</label>
                                    <select required value={formData.vehicle_id} onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800">
                                        <option value="">Sélectionner un véhicule</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate_number}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date début *</label>
                                        <input required type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date fin *</label>
                                        <input required type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lieu Retrait</label>
                                        {!showPickupCustom ? (
                                            <select
                                                value={PRESET_LOCATIONS.includes(formData.pickup_location!) ? formData.pickup_location : 'custom'}
                                                onChange={e => {
                                                    if (e.target.value === 'custom') {
                                                        setShowPickupCustom(true);
                                                    } else {
                                                        setFormData({ ...formData, pickup_location: e.target.value });
                                                    }
                                                }}
                                                className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800"
                                            >
                                                {PRESET_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                                <option value="custom">+ Autre lieu...</option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={formData.pickup_location}
                                                    onChange={e => setFormData({ ...formData, pickup_location: e.target.value })}
                                                    className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800"
                                                    placeholder="Saisir lieu..."
                                                />
                                                <button type="button" onClick={() => setShowPickupCustom(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lieu Retour</label>
                                        {!showDropoffCustom ? (
                                            <select
                                                value={PRESET_LOCATIONS.includes(formData.dropoff_location!) ? formData.dropoff_location : 'custom'}
                                                onChange={e => {
                                                    if (e.target.value === 'custom') {
                                                        setShowDropoffCustom(true);
                                                    } else {
                                                        setFormData({ ...formData, dropoff_location: e.target.value });
                                                    }
                                                }}
                                                className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800"
                                            >
                                                {PRESET_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                                <option value="custom">+ Autre lieu...</option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={formData.dropoff_location}
                                                    onChange={e => setFormData({ ...formData, dropoff_location: e.target.value })}
                                                    className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800"
                                                    placeholder="Saisir lieu..."
                                                />
                                                <button type="button" onClick={() => setShowDropoffCustom(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prix Total (MAD)</label>
                                        <input type="number" value={formData.total_price} onChange={e => setFormData({ ...formData, total_price: parseFloat(e.target.value) })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] font-bold text-[#1C0770] text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Statut</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800">
                                            <option value="pending">En attente</option>
                                            <option value="confirmed">Confirmé</option>
                                            <option value="rented">Loué</option>
                                            <option value="returned">Retourné</option>
                                            <option value="completed">Terminé</option>
                                            <option value="cancelled">Annulé</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paiement</label>
                                        <select value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value as any })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800">
                                            <option value="Espèces">Espèces</option>
                                            <option value="Carte">Carte Bancaire</option>
                                            <option value="Virement">Virement</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">État Paiement</label>
                                        <select value={formData.payment_status} onChange={e => setFormData({ ...formData, payment_status: e.target.value as any })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800">
                                            <option value="pending">En attente</option>
                                            <option value="paid">Payé</option>
                                            <option value="failed">Échoué</option>
                                            <option value="refunded">Remboursé</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all">Annuler</button>
                            <button
                                type="submit"
                                disabled={isSaving || isCheckingAvailability}
                                className="flex items-center gap-2 px-8 py-2.5 bg-[#261CC1] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(38,28,193,0.3)] transition-all disabled:opacity-50"
                            >
                                {isSaving || isCheckingAvailability ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {isCheckingAvailability ? 'Vérification...' : 'Enregistrement...'}
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" /> {selectedReservation ? 'Mettre à jour' : 'Confirmer la réservation'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    {/* Filters & Search */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-5">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par n° résa, client, véhicule..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#3A9AFF] focus:border-[#3A9AFF] block pl-10 p-3 transition-colors"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { key: 'all', label: 'Toutes' },
                                    { key: 'pending', label: 'En attente' },
                                    { key: 'confirmed', label: 'Confirmé' },
                                    { key: 'rented', label: 'Loué' },
                                    { key: 'returned', label: 'Retourné' },
                                    { key: 'completed', label: 'Terminé' },
                                ].map(f => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${filter === f.key
                                            ? 'bg-[#261CC1] text-white border-[#261CC1] shadow-md'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#3A9AFF] hover:text-[#261CC1]'
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="w-10 h-10 text-[#3A9AFF] animate-spin" />
                                    <p className="text-slate-400 text-sm font-medium">Chargement des réservations...</p>
                                </div>
                            ) : filteredReservations.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                            <th className="p-4 rounded-l-xl hidden sm:table-cell">Réf</th>
                                            <th className="p-4 sm:rounded-none rounded-l-xl">Client</th>
                                            <th className="p-4">Véhicule</th>
                                            <th className="p-4 hidden lg:table-cell">Période</th>
                                            <th className="p-4">Statut</th>
                                            <th className="p-4 hidden md:table-cell">Paiement</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4 text-right rounded-r-xl">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredReservations.map((r) => {
                                            const st = STATUS_MAP[r.status] || STATUS_MAP.pending;
                                            const StIcon = st.icon;
                                            return (
                                                <tr key={r.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50 group text-xs sm:text-sm">
                                                    <td className="p-4 text-[#261CC1] font-mono text-[10px] sm:text-xs font-bold hidden sm:table-cell">{r.reservation_number || r.id.substring(0, 8)}</td>
                                                    <td className="p-4">
                                                        <p className="text-slate-800 font-semibold">{r.customers?.full_name || 'Étranger'}</p>
                                                        <p className="text-slate-400 text-[10px] sm:text-xs">{r.customers?.phone}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-slate-700 font-medium">{r.vehicles?.brand} {r.vehicles?.model}</p>
                                                        <p className="text-slate-400 text-[10px] sm:text-xs font-mono">{r.vehicles?.plate_number}</p>
                                                    </td>
                                                    <td className="p-4 text-slate-500 text-[10px] sm:text-xs hidden lg:table-cell">
                                                        {new Date(r.start_date).toLocaleDateString()} → {new Date(r.end_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`${st.color} inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap`}>
                                                            <StIcon className="w-3 h-3" /> {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 hidden md:table-cell">
                                                        <p className="text-slate-500 text-[10px] font-medium">{r.payment_method}</p>
                                                        <p className={`text-[10px] font-bold ${r.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {r.payment_status === 'paid' ? 'PAYÉ' : 'À RÉGLER'}
                                                        </p>
                                                    </td>
                                                    <td className="p-4 font-black text-[#1C0770]">{r.total_price} MAD</td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link to={`/admin/reservations/${r.id}`} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Ouvrir le dossier"><FileText className="w-4 h-4" /></Link>
                                                            <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 hover:text-[#261CC1] hover:bg-[#261CC1]/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-20">
                                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">Aucune réservation trouvée</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

