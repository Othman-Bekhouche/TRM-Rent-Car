import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Search,
    Check,
    X,
    Loader2,
    FileText,
    Edit,
    Trash2,
    AlertCircle,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { reservationsApi, vehiclesApi, customersApi, supabase, type Reservation, type Vehicle, type Customer } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isWithinInterval,
    isBefore,
    startOfDay
} from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    confirmed: { label: 'Confirme', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle },
    active: { label: 'En cours', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    rented: { label: 'Loue', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: CheckCircle },
    returned: { label: 'Retourne', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: CheckCircle },
    completed: { label: 'Termine', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: CheckCircle },
    cancelled: { label: 'Annule', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
    rejected: { label: 'Refuse', color: 'bg-red-200 text-red-800 border-red-300', icon: XCircle },
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
    const [vehicleReservations, setVehicleReservations] = useState<any[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

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

    // Auto-calculate total price
    useEffect(() => {
        if (formData.vehicle_id && formData.start_date && formData.end_date) {
            const v = vehicles.find(v => v.id === formData.vehicle_id);
            if (v) {
                const start = new Date(formData.start_date);
                const end = new Date(formData.end_date);
                if (start <= end) {
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const days = diffDays === 0 ? 1 : diffDays;
                    setFormData(prev => ({ ...prev, total_price: v.price_per_day * days }));
                }
            }
        }
    }, [formData.vehicle_id, formData.start_date, formData.end_date, vehicles]);

    const fetchVehicleReservations = async (vid: string, excludeId?: string) => {
        try {
            console.log("Fetching reservations for vehicle:", vid);
            const { data, error } = await supabase.from('reservations')
                .select('id, start_date, end_date, customers(full_name), status')
                .eq('vehicle_id', vid);

            if (error) throw error;

            // Filter inactive statuses AND the current reservation being edited
            const activeReservations = (data || []).map((res: any) => ({
                ...res,
                // Ensure dates are strings for parsing
                start_date: res.start_date,
                end_date: res.end_date
            })).filter((res: any) => {
                const isActive = !['cancelled', 'completed', 'returned', 'confirmed_rejected', 'rejected'].includes(res.status);
                const isNotCurrent = excludeId ? res.id !== excludeId : true;
                return isActive && isNotCurrent;
            });

            console.log(`Fetched ${activeReservations.length} active reservations for calendar`);
            setVehicleReservations(activeReservations);
        } catch (err) {
            console.error("Error fetching vehicle reservations:", err);
            toast.error("Erreur lors de la récupération des disponibilités");
        }
    };

    const checkAvailabilityProactive = async () => {
        // En mode édition, on ne vérifie que si les dates ou le véhicule ont changé
        if (selectedReservation) {
            const hasChanged =
                selectedReservation.vehicle_id !== formData.vehicle_id ||
                selectedReservation.start_date.split('T')[0] !== formData.start_date ||
                selectedReservation.end_date.split('T')[0] !== formData.end_date;

            if (!hasChanged) return;
        }

        const isAvail = await checkAvailability(selectedReservation?.id);
        // Feedback UI uniquement
    };

    useEffect(() => {
        if (formData.vehicle_id) {
            fetchVehicleReservations(formData.vehicle_id, selectedReservation?.id);
        } else {
            setVehicleReservations([]);
        }
    }, [formData.vehicle_id, selectedReservation?.id]);

    useEffect(() => {
        if (formData.vehicle_id && formData.start_date && formData.end_date) {
            checkAvailabilityProactive();
        }
    }, [formData.vehicle_id, formData.start_date, formData.end_date]);

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
            start_date: '',
            end_date: '',
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
            toast.success('Reservation supprimee');
            setReservations(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const checkAvailability = async (excludeId?: string) => {
        if (!formData.vehicle_id || !formData.start_date || !formData.end_date) return true;

        try {
            setIsCheckingAvailability(true);
            const { data, error } = await supabase.rpc('check_vehicle_availability', {
                p_vehicle_id: formData.vehicle_id,
                p_start_date: formData.start_date,
                p_end_date: formData.end_date,
                p_exclude_id: excludeId || null
            });

            if (error) throw error;
            if (data && data.length > 0) {
                const result = data[0];
                if (!result.is_available) {
                    const nextDate = result.next_available_date ? format(new Date(result.next_available_date), 'dd/MM/yyyy') : 'plus tard';
                    toast.error(`Ce vehicule est deja reserve. Prochaine disponibilite : a partir du ${nextDate}.`);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Availability check failed:', error);
            return true;
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (new Date(formData.start_date!) >= new Date(formData.end_date!)) {
            toast.error("La date de fin doit etre apres la date de debut.");
            return;
        }

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
            const isAvailable = await checkAvailability(selectedReservation?.id);
            if (!isAvailable) return;
        }

        setIsSaving(true);
        try {
            if (selectedReservation) {
                const updated = await reservationsApi.update(selectedReservation.id, formData);
                const freshData = await reservationsApi.getById(selectedReservation.id);
                setReservations(prev => prev.map(r => r.id === updated.id ? freshData : r));
                toast.success('Reservation mise a jour');
            } else {
                const created = await reservationsApi.create(formData);
                const freshData = await reservationsApi.getById(created.id);
                setReservations(prev => [freshData, ...prev]);
                toast.success('Reservation ajoutee');
            }
            setShowForm(false);
        } catch (err: any) {
            if (err.message?.includes('ERREUR_CHEVAUCHEMENT')) {
                toast.error('Ce vehicule est deja reserve sur cette periode !');
            } else {
                toast.error(err.message || "Erreur lors de l'enregistrement");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const filteredReservations = reservations.filter(r => {
        const matchesFilter = filter === 'all' || r.status === filter;
        const brand = r.vehicles?.brand || '';
        const model = r.vehicles?.model || '';
        const matchesSearch =
            (brand + ' ' + model).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.customers?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.reservation_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const renderCalendar = () => {
        const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="bg-white border p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-[#1C0770] capitalize">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h4>
                    <div className="flex gap-1">
                        <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-50 rounded"><ChevronLeft className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-50 rounded"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-100 rounded overflow-hidden">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                        <div key={d} className="bg-slate-50 p-2 text-center text-[10px] font-black text-slate-400">{d}</div>
                    ))}
                    {days.map(day => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isToday = isSameDay(day, new Date());
                        const isPast = isBefore(day, startOfDay(new Date()));

                        // Use startOfDay and specific ISO parsing to avoid timezone shifts
                        const dayStart = startOfDay(day);

                        const isBooked = vehicleReservations.some(res => {
                            if (!res.start_date || !res.end_date) return false;
                            // Safe parsing by taking only YYYY-MM-DD to avoid timezone shifts
                            const s = res.start_date.substring(0, 10);
                            const e = res.end_date.substring(0, 10);
                            const resStart = startOfDay(new Date(s + 'T00:00:00'));
                            const resEnd = startOfDay(new Date(e + 'T00:00:00'));
                            return isWithinInterval(dayStart, { start: resStart, end: resEnd });
                        });

                        const isMatchingPreview = formData.start_date && formData.end_date && isWithinInterval(dayStart, {
                            start: startOfDay(new Date(formData.start_date.substring(0, 10) + 'T00:00:00')),
                            end: startOfDay(new Date(formData.end_date.substring(0, 10) + 'T00:00:00'))
                        });

                        let dayBgClass = 'bg-white';
                        let dayTextColorClass = 'text-slate-700';

                        if (!isCurrentMonth) {
                            dayBgClass = 'bg-slate-50 opacity-10';
                            dayTextColorClass = 'text-slate-300';
                        } else if (isPast) {
                            dayBgClass = 'bg-slate-200';
                            dayTextColorClass = 'text-slate-400';
                        } else if (isBooked) {
                            dayBgClass = 'bg-blue-600';
                            dayTextColorClass = 'text-white';
                        } else {
                            dayBgClass = 'bg-emerald-500';
                            dayTextColorClass = 'text-white';
                        }

                        if (isToday && !isPast && !isBooked) {
                            dayBgClass += ' ring-2 ring-inset ring-white ring-offset-1';
                        }

                        return (
                            <div key={day.toString()} className={`h-10 p-1 relative flex items-center justify-center group ${dayBgClass}`}>
                                {isMatchingPreview && <div className="absolute inset-0 border-2 border-[#3A9AFF] z-10" />}
                                <span className={`text-[11px] font-black z-20 ${dayTextColorClass}`}>
                                    {format(day, 'd')}
                                </span>
                                {isBooked && !isPast && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-3 flex items-center flex-wrap gap-4 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                    <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-sm bg-emerald-500" /> Libre</div>
                    <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-sm bg-blue-600" /> Reservé</div>
                    <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-sm bg-slate-200" /> Passé</div>
                    <div className="flex items-center gap-1.5"><div className="w-4 h-4 border-2 border-[#3A9AFF]" /> Choisi</div>
                    <div className="ml-auto text-xs font-mono bg-slate-100 p-1 rounded">DEBUG: {vehicleReservations.length} records</div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Reservations</h1>
                    <p className="text-slate-500 text-sm mt-1">Gerez toutes les locations et demandes en cours</p>
                </div>
                {!showForm && (
                    <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl">
                        <Plus className="w-4 h-4" /> Nouvelle Réservation
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-slate-500" /></button>
                            <h2 className="text-xl font-black text-slate-900">{selectedReservation ? 'Modifier la reservation' : 'Nouvelle reservation'}</h2>
                        </div>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client *</label>
                                    <div className="flex gap-2">
                                        <select required value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm">
                                            <option value="">Sélectionner un client</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                        </select>
                                        <button type="button" onClick={() => window.open('/admin/customers', '_blank')} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Véhicule *</label>
                                    <select required value={formData.vehicle_id} onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm">
                                        <option value="">Sélectionner un véhicule</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Début</label>
                                        <input required type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fin</label>
                                        <input required type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Disponibilités</label>
                                {formData.vehicle_id ? renderCalendar() : (
                                    <div className="h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        Sélectionnez un véhicule pour voir ses disponibilités
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lieu Retrait</label>
                                        <select value={PRESET_LOCATIONS.includes(formData.pickup_location!) ? formData.pickup_location : 'custom'} onChange={e => {
                                            if (e.target.value === 'custom') { setShowPickupCustom(true); setFormData({ ...formData, pickup_location: '' }); }
                                            else { setShowPickupCustom(false); setFormData({ ...formData, pickup_location: e.target.value }); }
                                        }} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm">
                                            {PRESET_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                            <option value="custom">Autre (Saisie manuelle)</option>
                                        </select>
                                        {showPickupCustom && <input type="text" placeholder="Lieu..." value={formData.pickup_location} onChange={e => setFormData({ ...formData, pickup_location: e.target.value })} className="w-full mt-2 bg-white border border-slate-200 rounded-xl p-3 text-sm" />}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lieu Retour</label>
                                        <select value={PRESET_LOCATIONS.includes(formData.dropoff_location!) ? formData.dropoff_location : 'custom'} onChange={e => {
                                            if (e.target.value === 'custom') { setShowDropoffCustom(true); setFormData({ ...formData, dropoff_location: '' }); }
                                            else { setShowDropoffCustom(false); setFormData({ ...formData, dropoff_location: e.target.value }); }
                                        }} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm">
                                            {PRESET_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                            <option value="custom">Autre (Saisie manuelle)</option>
                                        </select>
                                        {showDropoffCustom && <input type="text" placeholder="Lieu..." value={formData.dropoff_location} onChange={e => setFormData({ ...formData, dropoff_location: e.target.value })} className="w-full mt-2 bg-white border border-slate-200 rounded-xl p-3 text-sm" />}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total (MAD)</label>
                                        <input type="number" value={formData.total_price} onChange={e => setFormData({ ...formData, total_price: parseFloat(e.target.value) })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm font-black text-[#1C0770]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Statut</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm">
                                            {Object.entries(STATUS_MAP).map(([val, info]) => <option key={val} value={val}>{info.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mode Paiement</label>
                                        <select value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value as any })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm">
                                            <option value="Espèces">Espèces</option>
                                            <option value="Carte">Carte Bancaire</option>
                                            <option value="Virement">Virement</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">État Paiement</label>
                                        <select value={formData.payment_status} onChange={e => setFormData({ ...formData, payment_status: e.target.value as any })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm">
                                            <option value="pending">En attente</option>
                                            <option value="paid">Payé</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Annuler</button>
                                    <button type="submit" disabled={isSaving || isCheckingAvailability} className="px-8 py-2.5 bg-[#261CC1] text-sm font-bold text-white rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                                        {isSaving ? 'Envoi...' : 'Confirmer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 p-3 text-sm" />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'pending', 'confirmed', 'rented', 'returned', 'completed'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${filter === f ? 'bg-[#261CC1] text-white border-[#261CC1]' : 'bg-white text-slate-500 border-slate-200'}`}>
                                    {f === 'all' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                    <th className="p-4">Référence</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Véhicule</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredReservations.map((r) => {
                                    const st = STATUS_MAP[r.status] || STATUS_MAP.pending;
                                    return (
                                        <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-mono text-[10px] font-bold text-[#261CC1]">{r.reservation_number || r.id.substring(0, 8)}</td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800">{r.customers?.full_name}</p>
                                                <p className="text-[10px] text-slate-400">{r.customers?.phone}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-700">{r.vehicles?.brand} {r.vehicles?.model}</p>
                                                <p className="text-[10px] text-slate-400 font-mono italic">{r.vehicles?.plate_number}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`${st.color} px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="p-4 font-black text-[#1C0770]">{r.total_price} MAD</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link to={`/admin/reservations/${r.id}`} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><FileText className="w-4 h-4" /></Link>
                                                    <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 hover:text-[#261CC1] hover:bg-blue-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
