import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    reservationsApi,
    vehiclesApi,
    contractsApi,
    invoicesApi,
    handoversApi,
    mileageApi,
    type Reservation,
    type RentalContract,
    type Invoice,
    type HandoverRecord
} from '../../../lib/api';
import {
    ArrowLeft, Loader2, Car, User, FileText, FileCheck, CheckCircle, Clock, CheckSquare, Printer, Download
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ReservationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [contract, setContract] = useState<RentalContract | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [handover, setHandover] = useState<HandoverRecord | null>(null);

    // Modals
    const [showHandoverModal, setShowHandoverModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);

    // Modal forms state
    const [handoverData, setHandoverData] = useState({
        departure_mileage: 0,
        departure_fuel_level: '100%',
        departure_condition_notes: 'Véhicule remis propre et fonctionnel, aucun dommage signalé.',
        deposit_collected: false,
    });

    const [returnData, setReturnData] = useState({
        return_mileage: 0,
        return_fuel_level: '100%',
        return_condition_notes: 'Rien à signaler.',
        extra_charges: 0,
        admin_notes: '',
    });

    const loadData = async () => {
        try {
            if (!id) return;
            setLoading(true);
            const [resData, conData, invData, handData] = await Promise.all([
                reservationsApi.getById(id),
                contractsApi.getByReservation(id),
                invoicesApi.getByReservation(id),
                handoversApi.getByReservation(id)
            ]);
            setReservation(resData);
            setContract(conData);
            setInvoice(invData);
            setHandover(handData);

            if (resData.vehicles?.mileage) {
                setHandoverData(prev => ({ ...prev, departure_mileage: resData.vehicles!.mileage }));
            }
            if (handData?.departure_mileage) {
                setReturnData(prev => ({ ...prev, return_mileage: handData.departure_mileage }));
            } else if (resData.vehicles?.mileage) {
                setReturnData(prev => ({ ...prev, return_mileage: resData.vehicles!.mileage }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur de chargement du dossier");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'En attente', color: 'text-amber-500', bg: 'bg-amber-500/10' };
            case 'confirmed': return { label: 'Confirmée', color: 'text-blue-500', bg: 'bg-blue-500/10' };
            case 'rented': return { label: 'Loué', color: 'text-purple-500', bg: 'bg-purple-500/10' };
            case 'returned': return { label: 'Retourné', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            case 'completed': return { label: 'Terminée', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
            case 'cancelled': return { label: 'Annulée', color: 'text-red-500', bg: 'bg-red-500/10' };
            default: return { label: status, color: 'text-slate-500', bg: 'bg-slate-500/10' };
        }
    };

    const handleAction = async (action: 'confirm' | 'cancel') => {
        if (!reservation) return;
        try {
            const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
            await reservationsApi.update(reservation.id, { status: newStatus });

            // Update Vehicle Status
            const vStatus = action === 'confirm' ? 'booked' : 'available';
            await vehiclesApi.update(reservation.vehicle_id, { status: vStatus });

            if (action === 'confirm' && !contract) {
                // Auto-generate contract draft only if one doesn't exist
                const existing = await contractsApi.getByReservation(reservation.id);
                if (!existing) {
                    const ctr = await contractsApi.create({
                        reservation_id: reservation.id,
                        contract_number: `CTR-${reservation.id.slice(0, 8).toUpperCase()}`,
                        customer_id: reservation.customer_id,
                        vehicle_id: reservation.vehicle_id,
                        contract_status: 'draft',
                        total_amount: reservation.total_price,
                        deposit_amount: reservation.vehicles?.deposit_amount || 0,
                        contract_date: new Date().toISOString()
                    });
                    setContract(ctr);
                } else {
                    setContract(existing);
                }
            }

            toast.success(`Dossier ${action === 'confirm' ? 'confirmé' : 'annulé'} avec succès et véhicule mis à jour`);
            await loadData();
        } catch (err) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const generateInvoice = async () => {
        if (!reservation) return;
        try {
            const existing = await invoicesApi.getByReservation(reservation.id);
            if (existing) {
                setInvoice(existing);
                toast.success("Facture déjà existante");
                return;
            }
            const inv = await invoicesApi.create({
                reservation_id: reservation.id,
                invoice_number: `FAC-${reservation.id.slice(0, 8).toUpperCase()}`,
                subtotal: reservation.total_price,
                total_amount: reservation.total_price,
                payment_status: reservation.payment_status
            });
            setInvoice(inv);
            toast.success("Facture générée !");
        } catch (err) {
            toast.error("Erreur lors de la création de la facture");
        }
    };

    const handleHandoverSubmit = async () => {
        if (!reservation) return;
        try {
            // Create handover record
            await handoversApi.create({
                reservation_id: reservation.id,
                vehicle_id: reservation.vehicle_id,
                customer_id: reservation.customer_id,
                handover_date: new Date().toISOString(),
                departure_mileage: handoverData.departure_mileage,
                departure_fuel_level: handoverData.departure_fuel_level,
                departure_condition_notes: handoverData.departure_condition_notes,
                deposit_collected: handoverData.deposit_collected,
            });

            // Update Reservation Status
            await reservationsApi.update(reservation.id, { status: 'rented' });

            // Update Vehicle Status & Mileage
            await vehiclesApi.update(reservation.vehicle_id, {
                status: 'rented',
                mileage: handoverData.departure_mileage
            });

            // Log mileage update
            await mileageApi.create({
                vehicle_id: reservation.vehicle_id,
                mileage_value: handoverData.departure_mileage,
                recorded_by: 'Admin',
                notes: `Départ location N° ${reservation.id.slice(0, 8)}`
            });

            toast.success("Véhicule marqué comme loué et remis au client !");
            setShowHandoverModal(false);
            await loadData();
        } catch (error) {
            toast.error("Erreur lors de la remise du véhicule");
        }
    };

    const handleReturnSubmit = async () => {
        if (!reservation || !handover) return;
        try {
            await handoversApi.update(handover.id, {
                return_date: new Date().toISOString(),
                return_mileage: returnData.return_mileage,
                return_fuel_level: returnData.return_fuel_level,
                return_condition_notes: returnData.return_condition_notes,
                extra_charges: returnData.extra_charges,
                admin_notes: returnData.admin_notes
            });

            // Update Reservation
            await reservationsApi.update(reservation.id, {
                status: 'returned',
                total_price: reservation.total_price + returnData.extra_charges
            });

            // Update Vehicle Status to available
            await vehiclesApi.update(reservation.vehicle_id, {
                status: 'available',
                mileage: returnData.return_mileage
            });

            // Log mileage update
            await mileageApi.create({
                vehicle_id: reservation.vehicle_id,
                mileage_value: returnData.return_mileage,
                recorded_by: 'Admin',
                notes: `Retour location N° ${reservation.id.slice(0, 8)}`
            });

            toast.success("Le retour a été enregistré avec succès !");
            setShowReturnModal(false);
            await loadData();
        } catch (error) {
            toast.error("Erreur lors du retour du véhicule");
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;
    if (!reservation) return <div className="p-8 text-center text-slate-300">Dossier introuvable.</div>;

    const statusProps = getStatusInfo(reservation.status);

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out] text-slate-800">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/reservations')} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#1C0770] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-[#1C0770] tracking-tight flex items-center gap-3">
                            Réservation {reservation.reservation_number || reservation.id.slice(0, 8).toUpperCase()}
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusProps.bg.replace('/10', '/5')} ${statusProps.color} border-current`}>
                                {statusProps.label}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Gestion complète du dossier de location</p>
                    </div>
                </div>

                {/* Global Actions */}
                <div className="flex gap-3">
                    {reservation.status === 'pending' && (
                        <>
                            <button onClick={() => handleAction('cancel')} className="px-4 py-2 border border-red-200 text-red-500 bg-white hover:bg-red-50 font-bold rounded-xl text-sm transition-colors">
                                Refuser
                            </button>
                            <button onClick={() => handleAction('confirm')} className="px-4 py-2 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#261CC1]/20 hover:scale-105 transition-transform flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Confirmer
                            </button>
                        </>
                    )}
                    {reservation.status === 'confirmed' && (
                        <button onClick={() => setShowHandoverModal(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-[#261CC1] text-white font-bold rounded-xl text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            <Car className="w-4 h-4" /> Remise du véhicule
                        </button>
                    )}
                    {reservation.status === 'rented' && (
                        <button onClick={() => setShowReturnModal(true)} className="px-4 py-2 bg-[#00C853] text-white font-bold rounded-xl text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" /> Enregistrer le retour
                        </button>
                    )}
                    {(reservation.status === 'returned' || reservation.status === 'completed') && (
                        <button onClick={() => reservationsApi.update(reservation.id, { status: 'completed' })} disabled={reservation.status === 'completed'} className={`px-4 py-2 text-white font-bold rounded-xl text-sm shadow-lg flex items-center gap-2 ${reservation.status === 'completed' ? 'bg-slate-400 opacity-50 cursor-not-allowed' : 'bg-slate-800 hover:bg-black'}`}>
                            {reservation.status === 'completed' ? 'Dossier Clôturé' : 'Clôturer le dossier'}
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">

                {/* Left Column (Info) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Vehicle */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-[#1C0770] font-black mb-4 flex items-center gap-2 uppercase tracking-tighter"><Car className="text-[#261CC1] w-4 h-4" /> Informations Véhicule</h2>
                        <div className="flex items-center gap-4 p-4 bg-[#F0F4FF] rounded-2xl mb-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                <Car className="w-6 h-6 text-[#261CC1]" />
                            </div>
                            <div>
                                <p className="font-bold text-[#1C0770] text-lg leading-none mb-1">{reservation.vehicles?.brand} {reservation.vehicles?.model}</p>
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{reservation.vehicles?.plate_number} • {reservation.vehicles?.fuel_type}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Période</span><span className="font-bold">{new Date(reservation.start_date).toLocaleDateString()} - {new Date(reservation.end_date).toLocaleDateString()}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Lieu Retrait</span><span className="font-bold">{reservation.pickup_location}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Lieu Retour</span><span className="font-bold">{reservation.dropoff_location || reservation.pickup_location}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Tarif</span><span className="font-bold">{reservation.vehicles?.price_per_day} MAD / jour</span></div>
                        </div>
                    </div>

                    {/* Client */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-[#1C0770] font-black mb-4 flex items-center gap-2 uppercase tracking-tighter"><User className="text-[#261CC1] w-4 h-4" /> Informations Client</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Locataire</span><span className="font-bold">{reservation.customers?.full_name}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Téléphone</span><span className="font-bold text-slate-700">{reservation.customers?.phone}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Email</span><span className="font-bold text-slate-700 text-xs">{reservation.customers?.email}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Identité (CIN/P)</span><span className="font-bold text-slate-700">{reservation.customers?.cin || reservation.customers?.passport || '-'}</span></div>
                        </div>
                    </div>

                    {/* Handover Details if exist */}
                    {handover && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                            <h2 className="text-slate-700 font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-xs"><Clock className="text-[#261CC1] w-4 h-4" /> Historique des Opérations</h2>
                            <div className="space-y-4">
                                <div className="border-l-2 border-[#261CC1] pl-4 py-1">
                                    <p className="text-[10px] text-[#261CC1] font-black uppercase tracking-widest mb-1">DÉPART (REMISE)</p>
                                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-bold mb-1">
                                        <p>Date : <span className="text-slate-900">{new Date(handover.handover_date).toLocaleDateString()}</span></p>
                                        <p>Km : <span className="text-slate-900">{handover.departure_mileage}</span></p>
                                        <p>Plein : <span className="text-slate-900">{handover.departure_fuel_level}</span></p>
                                    </div>
                                    <p className="text-slate-500 text-[11px] italic">"{handover.departure_condition_notes}"</p>
                                </div>
                                {handover.return_date && (
                                    <div className="border-l-2 border-emerald-500 pl-4 py-1">
                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">RETOUR (RÉCEPTION)</p>
                                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-bold mb-1">
                                            <p>Date : <span className="text-slate-900">{new Date(handover.return_date).toLocaleDateString()}</span></p>
                                            <p>Km : <span className="text-slate-900">{handover.return_mileage}</span></p>
                                            <p>Plein : <span className="text-slate-900">{handover.return_fuel_level}</span></p>
                                        </div>
                                        {handover.extra_charges > 0 && <p className="text-[10px] text-red-500 font-bold mb-1 underline decoration-red-200">Frais sup. appliqués : {handover.extra_charges} MAD</p>}
                                        <p className="text-slate-500 text-[11px] italic">"{handover.return_condition_notes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Documents & Billing) */}
                <div className="space-y-6">
                    {/* Documents */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-[#1C0770] font-black mb-4 flex items-center gap-2 uppercase tracking-tighter"><FileText className="text-[#261CC1] w-4 h-4" /> Documents de Bord</h2>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative overflow-hidden">
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <p className="text-slate-800 font-bold text-xs flex items-center gap-2 uppercase tracking-wider"><FileCheck className="w-4 h-4 text-[#261CC1]" /> Contrat de Location</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{contract ? `Réf: ${contract.contract_number}` : 'Non généré'}</p>
                                    </div>
                                    {contract ? (
                                        <div className="flex gap-2">
                                            <Link to={`/admin/reservations/${reservation.id}/print/contract?action=print`} target="_blank" className="p-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-400 hover:text-[#261CC1] hover:border-[#261CC1] transition-all" title="Imprimer">
                                                <Printer className="w-4 h-4" />
                                            </Link>
                                            <Link to={`/admin/reservations/${reservation.id}/print/contract?action=download`} target="_blank" className="p-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all" title="Télécharger PDF">
                                                <Download className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleAction('confirm')} disabled={reservation.status === 'pending'} className="px-3 py-1.5 bg-[#261CC1] text-white text-[10px] font-black rounded-lg uppercase brightness-110 disabled:opacity-30">Créer</button>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative overflow-hidden">
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <p className="text-slate-800 font-bold text-xs flex items-center gap-2 uppercase tracking-wider"><FileText className="w-4 h-4 text-emerald-500" /> Facture Client</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{invoice ? `Réf: ${invoice.invoice_number}` : 'Non générée'}</p>
                                    </div>
                                    {invoice ? (
                                        <div className="flex gap-2">
                                            <Link to={`/admin/reservations/${reservation.id}/print/invoice?action=print`} target="_blank" className="p-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all" title="Imprimer">
                                                <Printer className="w-4 h-4" />
                                            </Link>
                                            <Link to={`/admin/reservations/${reservation.id}/print/invoice?action=download`} target="_blank" className="p-2.5 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all" title="Télécharger PDF">
                                                <Download className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <button onClick={generateInvoice} disabled={reservation.status === 'pending'} className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase disabled:opacity-30">Générer</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing Summary */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#261CC1]/5 rounded-full -mr-12 -mt-12"></div>
                        <h2 className="text-[#1C0770] font-black mb-5 flex items-center gap-2 uppercase tracking-tighter relative z-10"><CheckCircle className="text-[#261CC1] w-4 h-4" /> Bilan Financier</h2>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between text-slate-500 text-xs font-bold">
                                <span>TOTAL LOCATION</span>
                                <span className="text-slate-800 underline decoration-blue-100 underline-offset-4 font-black">{reservation.total_price - (handover?.extra_charges || 0)} MAD</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 uppercase tracking-widest font-black">
                                <span>Paiment</span>
                                <span className="text-[#261CC1]">{reservation.payment_method}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                <span className="text-slate-400">État Règlement</span>
                                <span className={`px-2 py-0.5 rounded border ${reservation.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {reservation.payment_status === 'paid' ? 'RÉGLÉ' : 'À PAYER'}
                                </span>
                            </div>
                            {handover?.extra_charges ? (
                                <div className="flex justify-between text-red-500 border-t border-red-50 pt-2 text-[11px] font-bold">
                                    <span>SUPPLÉMENTS</span>
                                    <span>+{handover.extra_charges} MAD</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-2">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter mb-1">TOTAL FINAL</span>
                                <span className="text-2xl font-black text-[#1C0770] tracking-tighter">{reservation.total_price} <span className="text-xs text-[#261CC1]">MAD</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HANDOVER MODAL (Départ) */}
            {showHandoverModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                        <h2 className="text-2xl font-black text-[#1C0770] mb-2 tracking-tighter underline decoration-[#261CC1] decoration-4">REMISE DU VÉHICULE</h2>
                        <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold">État de départ du client</p>
                        <div className="space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Kilométrage actuel</label>
                                    <input type="number" value={handoverData.departure_mileage} onChange={e => setHandoverData({ ...handoverData, departure_mileage: Number(e.target.value) })} className="w-full bg-[#F0F4FF] border border-slate-100 text-[#1C0770] font-black rounded-xl p-3 focus:ring-2 ring-[#261CC1]/20 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Niveau Carburant</label>
                                    <select value={handoverData.departure_fuel_level} onChange={e => setHandoverData({ ...handoverData, departure_fuel_level: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-100 text-[#1C0770] font-black rounded-xl p-3 focus:ring-2 ring-[#261CC1]/20 outline-none">
                                        <option>100%</option><option>75%</option><option>50%</option><option>25%</option><option>Réserve</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Notes & Observations</label>
                                <textarea value={handoverData.departure_condition_notes} onChange={e => setHandoverData({ ...handoverData, departure_condition_notes: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-100 text-slate-800 rounded-xl p-3 min-h-[100px] outline-none focus:ring-2 ring-[#261CC1]/20" />
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end mt-10">
                            <button onClick={() => setShowHandoverModal(false)} className="px-6 py-3 text-slate-400 hover:text-slate-800 text-xs font-black uppercase tracking-widest transition-colors">Retour</button>
                            <button onClick={handleHandoverSubmit} className="px-8 py-3 bg-[#1C0770] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#261CC1] transition-all shadow-xl shadow-[#261CC1]/20">Valider la sortie</button>
                        </div>
                    </div>
                </div>
            )}

            {/* RETURN MODAL (Retour) */}
            {showReturnModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
                        <h2 className="text-2xl font-black text-[#1C0770] mb-2 tracking-tighter underline decoration-emerald-500 decoration-4 uppercase">RÉCEPTION DU VÉHICULE</h2>
                        <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold font-mono">Clôture de la location</p>
                        <div className="space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Relais Km (Retour)</label>
                                    <input type="number" min={handoverData.departure_mileage} value={returnData.return_mileage} onChange={e => setReturnData({ ...returnData, return_mileage: Number(e.target.value) })} className="w-full bg-emerald-50/30 border border-emerald-100 text-[#1C0770] font-black rounded-xl p-3 outline-none" />
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Départ: {handoverData.departure_mileage} km</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Plein d'essence</label>
                                    <select value={returnData.return_fuel_level} onChange={e => setReturnData({ ...returnData, return_fuel_level: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-100 text-[#1C0770] font-black rounded-xl p-3 outline-none">
                                        <option>100%</option><option>75%</option><option>50%</option><option>25%</option><option>Réserve</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Frais de remise en état / Retards (MAD)</label>
                                <input type="number" value={returnData.extra_charges} onChange={e => setReturnData({ ...returnData, extra_charges: Number(e.target.value) })} className="w-full bg-red-50/30 border border-red-100 text-red-600 font-black rounded-xl p-3 outline-none" placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Notes & Dégats</label>
                                <textarea value={returnData.return_condition_notes} onChange={e => setReturnData({ ...returnData, return_condition_notes: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-100 text-slate-800 rounded-xl p-3 min-h-[80px] outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end mt-10">
                            <button onClick={() => setShowReturnModal(false)} className="px-6 py-3 text-slate-400 hover:text-slate-800 text-xs font-black uppercase tracking-widest transition-colors">Annuler</button>
                            <button onClick={handleReturnSubmit} className="px-8 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20">Finaliser le retour</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
