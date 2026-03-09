import { useState } from 'react';
import { Plus, Search, Eye, AlertTriangle, CheckCircle, Clock, XCircle, Send, Car, User, FileText, X } from 'lucide-react';

// ===== TYPES =====
type InfractionStatus = 'pending' | 'matched' | 'transmitted' | 'resolved' | 'unmatched';
type InfractionType = 'Radar fixe' | 'Excès de vitesse' | 'Stationnement interdit' | 'Feu rouge' | 'Contrôle routier' | 'Autre';

interface Infraction {
    id: string;
    vehicleId: string;
    vehicleName: string;
    plate: string;
    reservationId: string | null;
    clientId: string | null;
    clientName: string | null;
    clientPhone: string | null;
    clientEmail: string | null;
    clientCIN: string | null;
    clientAddress: string | null;
    reservationStart: string | null;
    reservationEnd: string | null;
    infractionType: InfractionType;
    infractionDate: string;
    infractionTime: string;
    city: string;
    location: string;
    authorityName: string;
    referenceNumber: string;
    fineAmount: number;
    description: string;
    adminNotes: string;
    status: InfractionStatus;
    createdAt: string;
}

// ===== MOCK RESERVATIONS (for matching) =====
const MOCK_RESERVATIONS = [
    { id: 'RES-2031', vehicleId: 'v1', clientName: 'Mohammed Alaoui', clientPhone: '06 12 34 56 78', clientEmail: 'alaoui.m@gmail.com', clientCIN: 'BH123456', clientAddress: 'Rue Hassan II, Oujda', startDate: '2026-03-12', endDate: '2026-03-15', plate: '208-A-001' },
    { id: 'RES-2030', vehicleId: 'v2', clientName: 'Sophie Martin', clientPhone: '07 88 99 00 11', clientEmail: 'sophie.martin@gmail.com', clientCIN: 'BE789012', clientAddress: 'Bd Anfa, Casablanca', startDate: '2026-03-10', endDate: '2026-03-14', plate: '208-B-002' },
    { id: 'RES-2029', vehicleId: 'v3', clientName: 'Hassan Benali', clientPhone: '06 55 44 33 22', clientEmail: 'hassan.b@gmail.com', clientCIN: 'BJ345678', clientAddress: 'Av Mohammed V, Fès', startDate: '2026-03-08', endDate: '2026-03-15', plate: 'LOG-C-003' },
    { id: 'RES-2028', vehicleId: 'v6', clientName: 'Fatima El Ouardi', clientPhone: '06 99 88 77 66', clientEmail: 'fatima.eo@gmail.com', clientCIN: 'BK901234', clientAddress: 'Rue Liberté, Taourirt', startDate: '2026-03-05', endDate: '2026-03-08', plate: 'SND-D-006' },
    { id: 'RES-2027', vehicleId: 'v4', clientName: 'Youssef Ziani', clientPhone: '06 11 22 33 44', clientEmail: 'y.ziani@gmail.com', clientCIN: 'BL567890', clientAddress: 'Hay Salam, Nador', startDate: '2026-03-01', endDate: '2026-03-06', plate: 'LOG-C-004' },
];

const VEHICLES = [
    { id: 'v1', name: 'Peugeot 208 Noir', plate: '208-A-001' },
    { id: 'v2', name: 'Peugeot 208 Gris', plate: '208-B-002' },
    { id: 'v3', name: 'Dacia Logan Blanc', plate: 'LOG-C-003' },
    { id: 'v4', name: 'Dacia Logan Gris', plate: 'LOG-C-004' },
    { id: 'v5', name: 'Dacia Sandero Blanc', plate: 'SND-D-005' },
    { id: 'v6', name: 'Dacia Sandero Gris', plate: 'SND-D-006' },
    { id: 'v7', name: 'Dacia Sandero Bleu', plate: 'SND-D-007' },
];

const INFRACTION_TYPES: InfractionType[] = ['Radar fixe', 'Excès de vitesse', 'Stationnement interdit', 'Feu rouge', 'Contrôle routier', 'Autre'];

const STATUS_MAP: Record<InfractionStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
    pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    matched: { label: 'Client identifié', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: User },
    transmitted: { label: 'Transmis', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Send },
    resolved: { label: 'Résolu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    unmatched: { label: 'Non identifié', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

// ===== INITIAL DATA =====
const INITIAL_INFRACTIONS: Infraction[] = [
    { id: 'INF-001', vehicleId: 'v3', vehicleName: 'Dacia Logan Blanc', plate: 'LOG-C-003', reservationId: 'RES-2029', clientId: 'c3', clientName: 'Hassan Benali', clientPhone: '06 55 44 33 22', clientEmail: 'hassan.b@gmail.com', clientCIN: 'BJ345678', clientAddress: 'Av Mohammed V, Fès', reservationStart: '2026-03-08', reservationEnd: '2026-03-15', infractionType: 'Radar fixe', infractionDate: '2026-03-10', infractionTime: '14:32', city: 'Taza', location: 'Route N6 — PK 125', authorityName: 'NARSA', referenceNumber: 'NR-2026-08451', fineAmount: 400, description: 'Excès de vitesse détecté par radar fixe à 95 km/h en zone limitée à 60 km/h.', adminNotes: 'PV reçu par courrier le 12/03/2026.', status: 'matched', createdAt: '2026-03-12' },
    { id: 'INF-002', vehicleId: 'v1', vehicleName: 'Peugeot 208 Noir', plate: '208-A-001', reservationId: 'RES-2031', clientId: 'c1', clientName: 'Mohammed Alaoui', clientPhone: '06 12 34 56 78', clientEmail: 'alaoui.m@gmail.com', clientCIN: 'BH123456', clientAddress: 'Rue Hassan II, Oujda', reservationStart: '2026-03-12', reservationEnd: '2026-03-15', infractionType: 'Stationnement interdit', infractionDate: '2026-03-13', infractionTime: '09:15', city: 'Oujda', location: 'Boulevard Mohammed V — Centre Ville', authorityName: 'Police Oujda', referenceNumber: 'PO-2026-03892', fineAmount: 150, description: 'Stationnement sur trottoir en zone interdite.', adminNotes: '', status: 'transmitted', createdAt: '2026-03-14' },
    { id: 'INF-003', vehicleId: 'v5', vehicleName: 'Dacia Sandero Blanc', plate: 'SND-D-005', reservationId: null, clientId: null, clientName: null, clientPhone: null, clientEmail: null, clientCIN: null, clientAddress: null, reservationStart: null, reservationEnd: null, infractionType: 'Feu rouge', infractionDate: '2026-02-20', infractionTime: '18:45', city: 'Casablanca', location: 'Carrefour Bd Zerktouni / Bd Anfa', authorityName: 'NARSA', referenceNumber: 'NR-2026-07122', fineAmount: 700, description: 'Passage au feu rouge détecté par caméra de surveillance.', adminNotes: 'Aucune réservation trouvée pour cette date. Véhicule en déplacement interne ?', status: 'unmatched', createdAt: '2026-02-25' },
];

// ===== MATCHING FUNCTION =====
function findMatchingReservation(vehicleId: string, date: string) {
    return MOCK_RESERVATIONS.filter(r => {
        return r.vehicleId === vehicleId && r.startDate <= date && r.endDate >= date;
    });
}

// ===== COMPONENT =====
export default function Infractions() {
    const [infractions, setInfractions] = useState<Infraction[]>(INITIAL_INFRACTIONS);
    const [showForm, setShowForm] = useState(false);
    const [selectedInfraction, setSelectedInfraction] = useState<Infraction | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formVehicle, setFormVehicle] = useState('');
    const [formType, setFormType] = useState<InfractionType>('Radar fixe');
    const [formDate, setFormDate] = useState('');
    const [formTime, setFormTime] = useState('');
    const [formCity, setFormCity] = useState('');
    const [formLocation, setFormLocation] = useState('');
    const [formAuthority, setFormAuthority] = useState('');
    const [formRef, setFormRef] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [matchResult, setMatchResult] = useState<typeof MOCK_RESERVATIONS | null>(null);

    const resetForm = () => {
        setFormVehicle(''); setFormType('Radar fixe'); setFormDate(''); setFormTime('');
        setFormCity(''); setFormLocation(''); setFormAuthority(''); setFormRef('');
        setFormAmount(''); setFormDesc(''); setFormNotes(''); setMatchResult(null);
    };

    const handleSearch = () => {
        if (!formVehicle || !formDate) return;
        const matches = findMatchingReservation(formVehicle, formDate);
        setMatchResult(matches);
    };

    const handleSubmit = (selectedReservation?: typeof MOCK_RESERVATIONS[0]) => {
        const vehicle = VEHICLES.find(v => v.id === formVehicle);
        if (!vehicle) return;

        const newInf: Infraction = {
            id: `INF-${String(infractions.length + 1).padStart(3, '0')}`,
            vehicleId: formVehicle,
            vehicleName: vehicle.name,
            plate: vehicle.plate,
            reservationId: selectedReservation?.id || null,
            clientId: selectedReservation ? 'auto' : null,
            clientName: selectedReservation?.clientName || null,
            clientPhone: selectedReservation?.clientPhone || null,
            clientEmail: selectedReservation?.clientEmail || null,
            clientCIN: selectedReservation?.clientCIN || null,
            clientAddress: selectedReservation?.clientAddress || null,
            reservationStart: selectedReservation?.startDate || null,
            reservationEnd: selectedReservation?.endDate || null,
            infractionType: formType,
            infractionDate: formDate,
            infractionTime: formTime,
            city: formCity,
            location: formLocation,
            authorityName: formAuthority,
            referenceNumber: formRef,
            fineAmount: parseFloat(formAmount) || 0,
            description: formDesc,
            adminNotes: formNotes,
            status: selectedReservation ? 'matched' : 'unmatched',
            createdAt: new Date().toISOString().split('T')[0],
        };

        setInfractions(prev => [newInf, ...prev]);
        setShowForm(false);
        resetForm();
    };

    const updateStatus = (id: string, status: InfractionStatus) => {
        setInfractions(prev => prev.map(inf => inf.id === id ? { ...inf, status } : inf));
        if (selectedInfraction?.id === id) setSelectedInfraction({ ...selectedInfraction, status });
    };

    // Filtering
    const filtered = infractions.filter(inf => {
        if (filterStatus !== 'all' && inf.status !== filterStatus) return false;
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                inf.clientName?.toLowerCase().includes(s) ||
                inf.plate.toLowerCase().includes(s) ||
                inf.referenceNumber.toLowerCase().includes(s) ||
                inf.city.toLowerCase().includes(s)
            );
        }
        return true;
    });

    // ===== DETAIL VIEW =====
    if (selectedInfraction) {
        const inf = selectedInfraction;
        const st = STATUS_MAP[inf.status];
        const StIcon = st.icon;
        return (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <button onClick={() => setSelectedInfraction(null)} className="text-sm text-[#3A9AFF] font-bold hover:underline">← Retour à la liste</button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Infraction {inf.id}</h1>
                        <p className="text-slate-500 text-sm mt-1">Créé le {inf.createdAt}</p>
                    </div>
                    <span className={`${st.color} inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border`}>
                        <StIcon className="w-4 h-4" /> {st.label}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vehicle Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-[#1C0770] uppercase tracking-wider mb-4 flex items-center gap-2"><Car className="w-4 h-4 text-[#3A9AFF]" /> Véhicule</h3>
                        <div className="space-y-3 text-sm">
                            <div><span className="text-slate-400">Véhicule :</span> <span className="font-bold text-slate-800 ml-2">{inf.vehicleName}</span></div>
                            <div><span className="text-slate-400">Immatriculation :</span> <span className="font-mono font-bold text-[#261CC1] ml-2">{inf.plate}</span></div>
                        </div>
                    </div>

                    {/* Reservation Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-[#1C0770] uppercase tracking-wider mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-[#3A9AFF]" /> Réservation</h3>
                        {inf.reservationId ? (
                            <div className="space-y-3 text-sm">
                                <div><span className="text-slate-400">Réf :</span> <span className="font-mono font-bold text-[#261CC1] ml-2">{inf.reservationId}</span></div>
                                <div><span className="text-slate-400">Début :</span> <span className="font-bold text-slate-800 ml-2">{inf.reservationStart}</span></div>
                                <div><span className="text-slate-400">Fin :</span> <span className="font-bold text-slate-800 ml-2">{inf.reservationEnd}</span></div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-bold">
                                <AlertTriangle className="w-4 h-4" /> Aucune réservation trouvée
                            </div>
                        )}
                    </div>

                    {/* Client Info */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-[#1C0770] uppercase tracking-wider mb-4 flex items-center gap-2"><User className="w-4 h-4 text-[#3A9AFF]" /> Client Responsable</h3>
                        {inf.clientName ? (
                            <div className="space-y-3 text-sm">
                                <div><span className="text-slate-400">Nom :</span> <span className="font-bold text-slate-800 ml-2">{inf.clientName}</span></div>
                                <div><span className="text-slate-400">Tél :</span> <span className="font-bold text-slate-800 ml-2">{inf.clientPhone}</span></div>
                                <div><span className="text-slate-400">Email :</span> <span className="font-bold text-slate-800 ml-2">{inf.clientEmail}</span></div>
                                <div><span className="text-slate-400">CIN :</span> <span className="font-mono font-bold text-[#261CC1] ml-2">{inf.clientCIN}</span></div>
                                <div><span className="text-slate-400">Adresse :</span> <span className="text-slate-700 ml-2">{inf.clientAddress}</span></div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-bold">
                                <AlertTriangle className="w-4 h-4" /> Client non identifié
                            </div>
                        )}
                    </div>
                </div>

                {/* Infraction Details */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-[#1C0770] uppercase tracking-wider mb-6 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#3A9AFF]" /> Détails de l'infraction</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div><span className="text-slate-400 block mb-1">Type</span> <span className="font-bold text-slate-800">{inf.infractionType}</span></div>
                        <div><span className="text-slate-400 block mb-1">Date</span> <span className="font-bold text-slate-800">{inf.infractionDate}</span></div>
                        <div><span className="text-slate-400 block mb-1">Heure</span> <span className="font-bold text-slate-800">{inf.infractionTime}</span></div>
                        <div><span className="text-slate-400 block mb-1">Ville</span> <span className="font-bold text-slate-800">{inf.city}</span></div>
                        <div><span className="text-slate-400 block mb-1">Lieu</span> <span className="font-bold text-slate-800">{inf.location}</span></div>
                        <div><span className="text-slate-400 block mb-1">Autorité</span> <span className="font-bold text-slate-800">{inf.authorityName}</span></div>
                        <div><span className="text-slate-400 block mb-1">Référence</span> <span className="font-mono font-bold text-[#261CC1]">{inf.referenceNumber}</span></div>
                        <div><span className="text-slate-400 block mb-1">Montant</span> <span className="font-black text-[#1C0770] text-lg">{inf.fineAmount} MAD</span></div>
                    </div>
                    {inf.description && <div className="mt-6 pt-6 border-t border-slate-100"><span className="text-slate-400 block mb-2 text-xs font-bold uppercase tracking-wider">Description</span><p className="text-slate-700">{inf.description}</p></div>}
                    {inf.adminNotes && <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl"><span className="text-amber-800 text-xs font-bold uppercase tracking-wider block mb-1">Notes Admin</span><p className="text-amber-700 text-sm">{inf.adminNotes}</p></div>}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    {inf.status === 'matched' && <button onClick={() => updateStatus(inf.id, 'transmitted')} className="px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"><Send className="w-4 h-4" /> Marquer comme Transmis</button>}
                    {inf.status === 'transmitted' && <button onClick={() => updateStatus(inf.id, 'resolved')} className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Marquer comme Résolu</button>}
                    {inf.status === 'pending' && <button onClick={() => updateStatus(inf.id, 'matched')} className="px-5 py-2.5 bg-blue-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"><User className="w-4 h-4" /> Client identifié</button>}
                </div>
            </div>
        );
    }

    // ===== FORM VIEW =====
    if (showForm) {
        return (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Ajouter une infraction</h1>
                        <p className="text-slate-500 text-sm mt-1">Enregistrez une nouvelle infraction et identifiez le client responsable</p>
                    </div>
                    <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Véhicule *</label>
                                <select value={formVehicle} onChange={e => setFormVehicle(e.target.value)} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]">
                                    <option value="">Sélectionner un véhicule</option>
                                    {VEHICLES.map(v => <option key={v.id} value={v.id}>{v.name} — {v.plate}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type d'infraction *</label>
                                <select value={formType} onChange={e => setFormType(e.target.value as InfractionType)} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]">
                                    {INFRACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date *</label>
                                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Heure</label>
                                <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ville *</label>
                                <input type="text" value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="Ex: Oujda" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lieu exact</label>
                            <input type="text" value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Ex: Route N6 — PK 125" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Autorité</label>
                                <input type="text" value={formAuthority} onChange={e => setFormAuthority(e.target.value)} placeholder="Ex: NARSA" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Numéro de référence</label>
                                <input type="text" value={formRef} onChange={e => setFormRef(e.target.value)} placeholder="Ex: NR-2026-XXXXX" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Montant (MAD)</label>
                                <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="400" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} placeholder="Détails de l'infraction..." className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes administratives</label>
                            <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} placeholder="Notes internes..." className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] resize-none" />
                        </div>
                    </div>

                    {/* Matching Panel */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-[#1C0770] uppercase tracking-wider mb-4">🔍 Identification Client</h3>
                            <p className="text-xs text-slate-500 mb-4">Sélectionnez un véhicule et une date, puis lancez la recherche pour identifier automatiquement le client responsable.</p>
                            <button
                                onClick={handleSearch}
                                disabled={!formVehicle || !formDate}
                                className="w-full px-5 py-3 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" /> Rechercher le client
                            </button>
                        </div>

                        {matchResult !== null && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                {matchResult.length === 0 ? (
                                    <div className="text-center">
                                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                                        <p className="text-red-600 font-bold text-sm">Aucune réservation trouvée</p>
                                        <p className="text-slate-400 text-xs mt-2">Aucun client n'a loué ce véhicule à cette date.</p>
                                        <button onClick={() => handleSubmit()} className="mt-4 w-full px-5 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all">
                                            Enregistrer (Non identifié)
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-emerald-600 font-bold text-sm mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {matchResult.length} réservation(s) trouvée(s)</p>
                                        {matchResult.map(r => (
                                            <div key={r.id} className="p-4 bg-[#F0F4FF] rounded-xl border border-slate-200 mb-3">
                                                <p className="font-bold text-slate-800">{r.clientName}</p>
                                                <p className="text-xs text-slate-500">{r.id} • {r.startDate} → {r.endDate}</p>
                                                <p className="text-xs text-slate-500">CIN : {r.clientCIN} • {r.clientPhone}</p>
                                                <button onClick={() => handleSubmit(r)} className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all">
                                                    ✓ Confirmer ce client et enregistrer
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ===== LIST VIEW =====
    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Gestion des Infractions</h1>
                    <p className="text-slate-500 text-sm mt-1">Amendes et infractions routières — Identification et transmission</p>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all">
                    <Plus className="w-4 h-4" /> Nouvelle Infraction
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-[#1C0770]">{infractions.length}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-amber-600">{infractions.filter(i => i.status === 'pending').length}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">En attente</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-blue-600">{infractions.filter(i => i.status === 'matched').length}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">Identifié</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-purple-600">{infractions.filter(i => i.status === 'transmitted').length}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">Transmis</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-red-500">{infractions.filter(i => i.status === 'unmatched').length}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">Non identifié</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher client, plaque, référence, ville..." className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#3A9AFF] focus:border-[#3A9AFF] block pl-10 p-3 transition-colors" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { key: 'all', label: 'Toutes' },
                            { key: 'pending', label: 'En attente' },
                            { key: 'matched', label: 'Identifié' },
                            { key: 'transmitted', label: 'Transmis' },
                            { key: 'resolved', label: 'Résolu' },
                            { key: 'unmatched', label: 'Non identifié' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilterStatus(f.key)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${filterStatus === f.key ? 'bg-[#261CC1] text-white border-[#261CC1]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#3A9AFF]'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                <th className="p-4">Véhicule</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Date / Heure</th>
                                <th className="p-4">Ville</th>
                                <th className="p-4">Montant</th>
                                <th className="p-4">Référence</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filtered.map(inf => {
                                const st = STATUS_MAP[inf.status];
                                const StIcon = st.icon;
                                return (
                                    <tr key={inf.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50 cursor-pointer" onClick={() => setSelectedInfraction(inf)}>
                                        <td className="p-4">
                                            <p className="font-semibold text-slate-800">{inf.vehicleName}</p>
                                            <p className="text-xs font-mono text-[#261CC1]">{inf.plate}</p>
                                        </td>
                                        <td className="p-4">
                                            {inf.clientName ? (
                                                <><p className="font-semibold text-slate-800">{inf.clientName}</p><p className="text-xs text-slate-400">{inf.clientCIN}</p></>
                                            ) : (
                                                <span className="text-red-500 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Non identifié</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-700 font-medium">{inf.infractionType}</td>
                                        <td className="p-4 text-slate-500 text-xs">{inf.infractionDate}<br />{inf.infractionTime}</td>
                                        <td className="p-4 text-slate-600">{inf.city}</td>
                                        <td className="p-4 font-black text-[#1C0770]">{inf.fineAmount} MAD</td>
                                        <td className="p-4 font-mono text-xs text-[#261CC1]">{inf.referenceNumber}</td>
                                        <td className="p-4">
                                            <span className={`${st.color} inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border`}><StIcon className="w-3 h-3" /> {st.label}</span>
                                        </td>
                                        <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setSelectedInfraction(inf)} className="p-2 text-slate-400 hover:text-[#3A9AFF] hover:bg-[#3A9AFF]/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="font-bold">Aucune infraction trouvée</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
