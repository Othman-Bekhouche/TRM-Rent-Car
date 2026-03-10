import { useState, useEffect } from 'react';
import {
    Wrench, Plus, CheckCircle, Clock, Car, Loader2, X, Edit,
    AlertTriangle, Calendar, TrendingUp, History, Bell, ShieldAlert, BadgeCheck,
    Gauge, ArrowRight, Save, Settings
} from 'lucide-react';
import {
    maintenanceApi, vehiclesApi, mileageApi, alertsApi,
    type MaintenanceRecord, type Vehicle, type MileageLog, type MaintenanceAlert
} from '../../lib/api';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

const MAINTENANCE_TYPES = [
    'Vidange', 'Révision générale', 'Freins / plaquettes', 'Pneus', 'Batterie',
    'Climatisation', 'Chaîne / courroie', 'Assurance', 'Visite technique',
    'Vignette', 'Carte grise', 'Autre'
];

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    'Planifié': { label: 'Planifié', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
    'En cours': { label: 'En cours', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Wrench },
    'Terminé': { label: 'Terminé', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    'Annulé': { label: 'Annulé', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: X },
};

export default function Maintenance() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'mileage' | 'alerts'>('dashboard');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
    const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
    const [loading, setLoading] = useState(true);

    // UI state
    const [showRecordForm, setShowRecordForm] = useState(false);
    const [showMileageForm, setShowMileageForm] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

    // Form states
    const [recordData, setRecordData] = useState<Partial<MaintenanceRecord>>({
        maintenance_type: 'Vidange',
        status: 'Planifié',
        last_service_date: new Date().toISOString().split('T')[0],
        last_service_mileage: 0,
        next_service_date: '',
        next_service_mileage: 0,
        estimated_cost: 0,
        actual_cost: 0,
        vendor_name: '',
        notes: ''
    });

    const [mileageData, setMileageData] = useState({
        vehicle_id: '',
        mileage_value: 0,
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [vData, rData, mData, aData] = await Promise.all([
                vehiclesApi.getAll().catch(e => { throw new Error(`Véhicules: ${e.message}`); }),
                maintenanceApi.getAll().catch(e => { throw new Error(`Historique: ${e.message}`); }),
                mileageApi.getAll().catch(e => { throw new Error(`Kilométrage: ${e.message}`); }),
                alertsApi.getAllActive().catch(e => { throw new Error(`Alertes: ${e.message}`); })
            ]);
            setVehicles(vData);
            setRecords(rData);
            setMileageLogs(mData);
            setAlerts(aData);
        } catch (err: any) {
            console.error(err);
            toast.error(`Erreur: ${err.message || "Chargement impossible"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = (vehicle?: Vehicle) => {
        setEditingRecord(null);
        setRecordData({
            vehicle_id: vehicle?.id || '',
            maintenance_type: 'Vidange',
            status: 'Planifié',
            last_service_date: new Date().toISOString().split('T')[0],
            last_service_mileage: vehicle?.mileage || 0,
            next_service_date: '',
            next_service_mileage: (vehicle?.mileage || 0) + 10000,
            estimated_cost: 0,
            actual_cost: 0,
            vendor_name: '',
            notes: ''
        });
        setShowRecordForm(true);
    };

    const handleEditRecord = (record: MaintenanceRecord) => {
        setEditingRecord(record);
        setRecordData({
            ...record,
            last_service_date: record.last_service_date || '',
            next_service_date: record.next_service_date || ''
        });
        setShowRecordForm(true);
    };

    const handleSaveRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingRecord) {
                await maintenanceApi.update(editingRecord.id, recordData);
                toast.success('Entretien mis à jour');
            } else {
                await maintenanceApi.create(recordData);
                toast.success('Entretien enregistré');
            }
            setShowRecordForm(false);
            loadData();
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de l’enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveMileage = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await mileageApi.create({
                ...mileageData,
                recorded_by: user?.id
            });
            toast.success('Kilométrage mis à jour');
            setShowMileageForm(false);
            loadData();
        } catch (err) {
            toast.error('Erreur mise à jour kilométrage');
        } finally {
            setIsSaving(false);
        }
    };

    const getVehicleHealth = (vehicleId: string) => {
        const vAlerts = alerts.filter(a => a.vehicle_id === vehicleId);
        if (vAlerts.some(a => a.priority === 'urgent' || a.priority === 'high')) return { label: 'Urgent', color: 'text-rose-500 bg-rose-50 border-rose-100' };
        if (vAlerts.length > 0) return { label: 'À surveiller', color: 'text-amber-500 bg-amber-50 border-amber-100' };
        return { label: 'Bon état', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#261CC1] animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse">Chargement de la maintenance...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
            <Toaster position="top-right" />

            {/* Header section with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-black text-[#1C0770] tracking-tight">Maintenance</h1>
                    <p className="text-slate-500 font-medium mt-1">Gérez la santé technique et réglementaire de votre flotte TRM</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowMileageForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-[#1C0770] font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                    >
                        <Gauge className="w-4 h-4" /> Ajouter Kilométrage
                    </button>
                    <button
                        onClick={() => handleAddRecord()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-bold rounded-2xl shadow-lg hover:shadow-[0_8px_25px_rgba(58,154,255,0.4)] transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Planifier Entretien
                    </button>
                </div>
            </div>

            {/* Main Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle className="w-20 h-20 text-rose-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-rose-50 rounded-2xl"><ShieldAlert className="w-6 h-6 text-rose-600" /></div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Urgent / En retard</h3>
                    </div>
                    <p className="text-4xl font-black text-rose-600">{alerts.filter(a => a.priority === 'urgent' || a.priority === 'high').length}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">Interventions critiques requises</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-20 h-20 text-amber-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl"><Calendar className="w-6 h-6 text-amber-600" /></div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">À prévoir bientôt</h3>
                    </div>
                    <p className="text-4xl font-black text-amber-600">{alerts.filter(a => a.priority === 'medium').length}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">Échéances sous 30 jours / 1000km</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wrench className="w-20 h-20 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl"><History className="w-6 h-6 text-blue-600" /></div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">En Maintenance</h3>
                    </div>
                    <p className="text-4xl font-black text-blue-600">{records.filter(r => r.status === 'En cours').length}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">Véhicules actuellement au garage</p>
                </div>

                <div className="bg-[#1C0770] p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-20 h-20 text-white" />
                    </div>
                    <div className="items-center gap-4 mb-4 hidden lg:flex">
                        <div className="p-3 bg-white/10 rounded-2xl"><TrendingUp className="w-6 h-6 text-[#3A9AFF]" /></div>
                        <h3 className="text-xs font-black text-white/60 uppercase tracking-widest">Coûts Annuels</h3>
                    </div>
                    <p className="text-3xl font-black text-white mt-4">{records.filter(r => r.status === 'Terminé' && new Date(r.last_service_date).getFullYear() === new Date().getFullYear()).reduce((sum, r) => sum + Number(r.actual_cost), 0).toLocaleString()} <span className="text-sm font-bold opacity-60">MAD</span></p>
                    <p className="text-xs font-bold text-white/40 mt-2">Investissement entretien total {new Date().getFullYear()}</p>
                </div>
            </div>

            {/* Tabs for detailed view */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-4 bg-slate-50 border-b flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-[#1C0770] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                    >
                        <Car className="w-4 h-4" /> Flotte & Santé
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-[#1C0770] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                    >
                        <Bell className="w-4 h-4" /> Alertes Actives
                        {alerts.length > 0 && <span className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px]">{alerts.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-[#1C0770] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                    >
                        <History className="w-4 h-4" /> Historique complet
                    </button>
                    <button
                        onClick={() => setActiveTab('mileage')}
                        className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'mileage' ? 'bg-[#1C0770] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                    >
                        <Gauge className="w-4 h-4" /> Logs Kilométrage
                    </button>
                </div>

                <div className="flex-1 p-8">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles.map(v => {
                                const health = getVehicleHealth(v.id);
                                const vAlerts = alerts.filter(a => a.vehicle_id === v.id);
                                return (
                                    <div key={v.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setSelectedVehicle(v)}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm"><Car className="w-6 h-6 text-[#261CC1]" /></div>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${health.color}`}>
                                                {health.label}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-[#1C0770] text-lg leading-tight uppercase tracking-tight">{v.brand} {v.model}</h4>
                                        <p className="text-[#3A9AFF] font-mono font-bold text-xs mt-1 mb-6 tracking-widest">{v.plate_number}</p>

                                        <div className="space-y-3 pb-6 border-b border-slate-200/50">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-widest">Km Actuel</span>
                                                <span className="text-slate-800 font-black">{v.mileage?.toLocaleString()} km</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-widest">Prochaine Vidange</span>
                                                <span className={`${(v.next_oil_change_mileage || 0) <= (v.mileage || 0) + 500 ? 'text-rose-600' : 'text-slate-800'} font-black`}>
                                                    {v.next_oil_change_mileage?.toLocaleString() || '---'} km
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {vAlerts.length > 0 ? (
                                                    vAlerts.slice(0, 3).map((a, i) => (
                                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${a.priority === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'} text-white shadow-sm`} title={a.alert_message}>
                                                            <AlertTriangle className="w-4 h-4" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                                        <BadgeCheck className="w-5 h-5" />
                                                    </div>
                                                )}
                                                {vAlerts.length > 3 && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">+{vAlerts.length - 3}</div>}
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-[#3A9AFF] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div className="space-y-4">
                            {alerts.length > 0 ? (
                                alerts.map(a => (
                                    <div key={a.id} className={`flex items-center gap-6 p-6 rounded-3xl border ${a.priority === 'urgent' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'} transition-all hover:shadow-md`}>
                                        <div className={`p-4 rounded-2xl ${a.priority === 'urgent' ? 'bg-rose-600 text-white shadow-[0_4px_15px_rgba(225,29,72,0.4)]' : 'bg-amber-500 text-white shadow-[0_4px_15px_rgba(245,158,11,0.4)]'}`}>
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-black text-[#1C0770] uppercase tracking-tighter">{a.vehicle?.brand} {a.vehicle?.model}</span>
                                                <span className="text-[#3A9AFF] font-mono font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-[#3A9AFF]/20">{a.vehicle?.plate_number}</span>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${a.priority === 'urgent' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>{a.priority}</span>
                                            </div>
                                            <p className="text-slate-600 font-bold text-sm tracking-tight">{a.alert_message}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(a.created_at).toLocaleDateString()}</p>
                                            <button
                                                onClick={async () => {
                                                    await alertsApi.resolve(a.id);
                                                    toast.success('Alerte archivée');
                                                    loadData();
                                                }}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                                            >
                                                Marquer comme résolu
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-32 text-center">
                                    <BadgeCheck className="w-20 h-20 text-emerald-100 mx-auto mb-6" />
                                    <h3 className="text-xl font-black text-[#1C0770]">Flotte saine</h3>
                                    <p className="text-slate-400 font-medium">Aucune alerte critique n'est active pour le moment.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="overflow-x-auto -mx-8 px-8">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-50">
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Véhicule</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Intervention</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Date</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 text-right">Km</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 text-right">Coût</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Statut</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(r => {
                                        const st = STATUS_MAP[r.status] || STATUS_MAP.Planifié;
                                        return (
                                            <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/5 transition-colors group">
                                                <td className="py-5 px-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[#1C0770] text-sm tracking-tight">{r.vehicle?.brand} {r.vehicle?.model}</span>
                                                        <span className="text-[#3A9AFF] font-mono font-bold text-[10px]">{r.vehicle?.plate_number}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-700 text-sm tracking-tight">{r.maintenance_type}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]">{r.vendor_name || '---'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-3">
                                                    <span className="text-slate-500 font-bold text-xs">{new Date(r.last_service_date).toLocaleDateString()}</span>
                                                </td>
                                                <td className="py-5 px-3 text-right">
                                                    <span className="text-slate-800 font-black text-xs">{r.last_service_mileage?.toLocaleString()}</span>
                                                </td>
                                                <td className="py-5 px-3 text-right">
                                                    <span className="text-[#1C0770] font-black text-sm">{Number(r.actual_cost || r.estimated_cost).toLocaleString()} MAD</span>
                                                </td>
                                                <td className="py-5 px-3">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border-2 ${st.color}`}>{st.label}</span>
                                                </td>
                                                <td className="py-5 px-3 text-right">
                                                    <button onClick={() => handleEditRecord(r)} className="p-2 text-slate-300 hover:text-[#1C0770] hover:bg-white rounded-xl shadow-sm transition-all"><Edit className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {records.length === 0 && <div className="py-20 text-center text-slate-400 font-bold italic">Aucun historique d'entretien</div>}
                        </div>
                    )}

                    {activeTab === 'mileage' && (
                        <div className="overflow-x-auto -mx-8 px-8">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-50">
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Véhicule</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Kilométrage</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Date d'enregistrement</th>
                                        <th className="pb-4 pt-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mileageLogs.map(m => (
                                        <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/5 transition-colors group">
                                            <td className="py-4 px-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-xl border border-slate-100"><Car className="w-4 h-4 text-slate-400" /></div>
                                                    <div>
                                                        <p className="font-black text-[#1C0770] text-sm tracking-tight leading-none uppercase">{m.vehicle?.brand} {m.vehicle?.model}</p>
                                                        <p className="text-[#3A9AFF] font-mono font-bold text-[10px]">{m.vehicle?.plate_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-3">
                                                <span className="text-xl font-black text-[#1C0770] tracking-tighter">{m.mileage_value.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold uppercase">km</span></span>
                                            </td>
                                            <td className="py-4 px-3">
                                                <span className="text-slate-500 font-bold text-xs">{new Date(m.recorded_at).toLocaleString()}</span>
                                            </td>
                                            <td className="py-4 px-3">
                                                <span className="text-slate-400 font-medium text-xs break-words max-w-[300px] block">{m.notes || '---'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {mileageLogs.length === 0 && <div className="py-20 text-center text-slate-400 font-bold italic">Aucun log de kilométrage</div>}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: Record Maintenance Form */}
            {showRecordForm && (
                <div className="fixed inset-0 bg-[#0F0440]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-[scaleIn_0.3s_ease-out]">
                        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#1C0770] rounded-2xl text-white shadow-lg shadow-[#1C0770]/20"><Wrench className="w-6 h-6" /></div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#1C0770] tracking-tight">{editingRecord ? 'Modifier Entretien' : 'Planifier Entretien'}</h2>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">Saisie Carnet d'Entretien Digital</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRecordForm(false)} className="p-3 hover:bg-white rounded-full transition-all text-slate-400 hover:text-rose-500 shadow-sm border border-transparent hover:border-slate-100"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSaveRecord} className="flex-1 overflow-y-auto p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><Car className="w-3 h-3 text-[#3A9AFF]" /> Véhicule *</label>
                                    <select
                                        required
                                        value={recordData.vehicle_id}
                                        onChange={e => {
                                            const v = vehicles.find(v => v.id === e.target.value);
                                            setRecordData({ ...recordData, vehicle_id: e.target.value, last_service_mileage: v?.mileage || 0 });
                                        }}
                                        className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-700 focus:border-[#3A9AFF] focus:ring-0 outline-none transition-all"
                                    >
                                        <option value="">Sélectionner un véhicule...</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate_number}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><Wrench className="w-3 h-3 text-[#3A9AFF]" /> Type *</label>
                                        <select
                                            required
                                            value={recordData.maintenance_type}
                                            onChange={e => setRecordData({ ...recordData, maintenance_type: e.target.value })}
                                            className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-[#3A9AFF] transition-all"
                                        >
                                            {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><CheckCircle className="w-3 h-3 text-[#3A9AFF]" /> Statut</label>
                                        <select
                                            value={recordData.status}
                                            onChange={e => setRecordData({ ...recordData, status: e.target.value as any })}
                                            className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-[#3A9AFF] transition-all"
                                        >
                                            {Object.keys(STATUS_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><Calendar className="w-3 h-3 text-[#261CC1]" /> Date Service *</label>
                                        <input
                                            required type="date"
                                            value={recordData.last_service_date}
                                            onChange={e => setRecordData({ ...recordData, last_service_date: e.target.value })}
                                            className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-[#3A9AFF] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><Calendar className="w-3 h-3 text-rose-500" /> Prochaine Échéance</label>
                                        <input
                                            type="date"
                                            value={recordData.next_service_date}
                                            onChange={e => setRecordData({ ...recordData, next_service_date: e.target.value })}
                                            className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-all placeholder:text-slate-300"
                                            placeholder="Date d'expiration"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><Gauge className="w-3 h-3 text-[#3A9AFF]" /> Km au service</label>
                                        <input
                                            type="number"
                                            value={recordData.last_service_mileage}
                                            onChange={e => setRecordData({ ...recordData, last_service_mileage: parseInt(e.target.value) })}
                                            className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-[#3A9AFF] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><TrendingUp className="w-3 h-3 text-rose-500" /> Km Prochain</label>
                                        <input
                                            type="number"
                                            value={recordData.next_service_mileage}
                                            onChange={e => setRecordData({ ...recordData, next_service_mileage: parseInt(e.target.value) })}
                                            className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><Clock className="w-3 h-3 text-slate-400" /> Prévu (MAD)</label>
                                        <input
                                            type="number"
                                            value={recordData.estimated_cost}
                                            onChange={e => setRecordData({ ...recordData, estimated_cost: parseFloat(e.target.value) })}
                                            className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-400 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1 flex items-center gap-2"><BadgeCheck className="w-3 h-3 text-emerald-500" /> Réel (MAD)</label>
                                        <input
                                            type="number"
                                            value={recordData.actual_cost}
                                            onChange={e => setRecordData({ ...recordData, actual_cost: parseFloat(e.target.value) })}
                                            className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-[1.25rem] p-4 text-xl font-black text-emerald-600 outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Prestataire / Garage / Notes</label>
                                    <textarea
                                        rows={2}
                                        value={recordData.notes}
                                        onChange={e => setRecordData({ ...recordData, notes: e.target.value })}
                                        className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-[1.25rem] p-4 text-sm font-bold text-slate-700 resize-none focus:border-[#3A9AFF] outline-none"
                                        placeholder="Ex: Garage du Nord - Changement plaquettes avant..."
                                    />
                                </div>
                            </div>
                            <div className="col-span-full flex justify-end gap-4 mt-4 border-t pt-8">
                                <button type="button" onClick={() => setShowRecordForm(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-xs tracking-[0.2em] hover:text-slate-600 transition-all">Annuler</button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-12 py-4 bg-[#1C0770] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-[#1C0770]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingRecord ? 'Mettre à jour' : 'Enregistrer Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Mileage Form */}
            {showMileageForm && (
                <div className="fixed inset-0 bg-[#0F0440]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl flex flex-col animate-[scaleIn_0.3s_ease-out]">
                        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#3A9AFF] rounded-2xl text-white shadow-lg shadow-[#3A9AFF]/20"><Gauge className="w-6 h-6" /></div>
                                <h2 className="text-xl font-black text-[#1C0770] tracking-tight">Mise à jour Compteur</h2>
                            </div>
                            <button onClick={() => setShowMileageForm(false)} className="text-slate-400 hover:text-rose-500"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSaveMileage} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Véhicule</label>
                                <select
                                    required
                                    value={mileageData.vehicle_id}
                                    onChange={e => setMileageData({ ...mileageData, vehicle_id: e.target.value })}
                                    className="w-full bg-[#f8faff] border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-[#3A9AFF] transition-all"
                                >
                                    <option value="">Sélectionner...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate_number}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">Kilométrage Actuel</label>
                                <div className="relative">
                                    <input
                                        required type="number"
                                        value={mileageData.mileage_value}
                                        onChange={e => setMileageData({ ...mileageData, mileage_value: parseInt(e.target.value) })}
                                        className="w-full bg-[#1C0770] border-2 border-[#1C0770] rounded-2xl p-6 text-3xl font-black text-[#3A9AFF] font-mono outline-none text-right pr-20"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 font-black text-sm uppercase">km</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-[#3A9AFF] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-[#3A9AFF]/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Mettre à jour la flotte
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Selection Vehicle Side Detail (Optional Overlay) */}
            {selectedVehicle && (
                <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-[-20px_0_50px_rgba(15,4,64,0.1)] z-[90] flex flex-col animate-[slideInRight_0.4s_ease-out]">
                    <div className="p-8 border-b bg-gradient-to-br from-[#1C0770] to-[#0F0440] text-white flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl"><Car className="w-8 h-8 text-[#3A9AFF]" /></div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                                <p className="text-[#3A9AFF] font-mono font-bold text-sm tracking-[0.2em] mt-1">{selectedVehicle.plate_number}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedVehicle(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-10">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernière Vidange</p>
                                <p className="text-xl font-black text-[#1C0770]">{selectedVehicle.last_oil_change_mileage?.toLocaleString() || '---'} km</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Échéance Vidange</p>
                                <p className="text-xl font-black text-rose-500">{selectedVehicle.next_oil_change_mileage?.toLocaleString() || '---'} km</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-[#1C0770] uppercase tracking-widest flex items-center justify-between">
                                Alertes Actives
                                <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{alerts.filter(a => a.vehicle_id === selectedVehicle.id).length}</span>
                            </h3>
                            <div className="space-y-3">
                                {alerts.filter(a => a.vehicle_id === selectedVehicle.id).map(a => (
                                    <div key={a.id} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                        <p className="text-xs font-bold text-rose-700">{a.alert_message}</p>
                                    </div>
                                ))}
                                {alerts.filter(a => a.vehicle_id === selectedVehicle.id).length === 0 && (
                                    <div className="py-4 text-center text-slate-300 font-bold text-sm italic border-2 border-dashed border-slate-100 rounded-2xl">Aucune alerte</div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-[#1C0770] uppercase tracking-widest">Historique Entretien</h3>
                                <button onClick={() => { setSelectedVehicle(null); handleAddRecord(selectedVehicle); }} className="text-[#3A9AFF] font-bold text-[10px] uppercase underline">Planifier</button>
                            </div>
                            <div className="space-y-3">
                                {records.filter(r => r.vehicle_id === selectedVehicle.id).slice(0, 5).map(r => (
                                    <div key={r.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-[#3A9AFF]/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-[#3A9AFF]/10 transition-all"><Settings className="w-4 h-4 text-slate-400 group-hover:text-[#3A9AFF]" /></div>
                                            <div>
                                                <p className="text-[11px] font-black text-[#1C0770] uppercase">{r.maintenance_type}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{new Date(r.last_service_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-[#1C0770]">{Number(r.actual_cost).toLocaleString()} MAD</span>
                                    </div>
                                ))}
                                {records.filter(r => r.vehicle_id === selectedVehicle.id).length === 0 && (
                                    <div className="py-6 text-center text-slate-300 font-bold text-sm italic border-2 border-dashed border-slate-100 rounded-2xl">Aucun entretien enregistré</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
