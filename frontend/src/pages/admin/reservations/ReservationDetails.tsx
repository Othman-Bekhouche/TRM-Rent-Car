import { useState, useEffect, useCallback } from 'react';
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
    ArrowLeft,
    Loader2,
    Car,
    User,
    FileText,
    CheckCircle,
    Clock,
    CheckSquare,
    Printer
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
        deposit_collected: 0,
        payment_collected: 0,
    });

    const [returnData, setReturnData] = useState({
        return_mileage: 0,
        return_fuel_level: '100%',
        return_condition_notes: 'Rien à signaler.',
        extra_charges: 0,
        admin_notes: '',
    });

    const loadData = useCallback(async () => {
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
                setHandoverData(prev => ({ 
                    ...prev, 
                    departure_mileage: resData.vehicles!.mileage,
                    deposit_collected: resData.vehicles!.deposit_amount || 0,
                    payment_collected: resData.total_price || 0
                }));
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
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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

    const handleAction = async (action: 'confirm' | 'cancel' | 'complete') => {
        if (!reservation) return;
        try {
            if (action === 'complete') {
                await reservationsApi.update(reservation.id, { status: 'completed' });
                // Auto generate invoice if not exists
                const existingInvoice = await invoicesApi.getByReservation(reservation.id);
                if (!existingInvoice) {
                    await invoicesApi.create({
                        reservation_id: reservation.id,
                        invoice_number: `FAC-${reservation.id.slice(0, 8).toUpperCase()}`,
                        subtotal: reservation.total_price,
                        total_amount: reservation.total_price,
                        payment_status: reservation.payment_status
                    });
                }
                toast.success("Dossier clôturé et facture générée !");
            } else {
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
            }
            await loadData();
        } catch {
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
        } catch {
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
                deposit_collected: Number(handoverData.deposit_collected),
                payment_collected: Number(handoverData.payment_collected),
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
                notes: `Départ location N° ${reservation.id.slice(0, 8)}`
            });

            toast.success("Véhicule marqué comme loué et remis au client !");
            setShowHandoverModal(false);
            await loadData();
        } catch {
            toast.error("Erreur lors de la remise du véhicule");
        }
    };

    const handleReturnSubmit = async () => {
        if (!reservation) return;
        try {
            const returnPayload = {
                return_date: new Date().toISOString(),
                return_mileage: returnData.return_mileage,
                return_fuel_level: returnData.return_fuel_level,
                return_condition_notes: returnData.return_condition_notes,
                extra_charges: returnData.extra_charges,
                admin_notes: returnData.admin_notes
            };

            if (handover) {
                // Mode Mise à jour classique
                await handoversApi.update(handover.id, returnPayload);
            } else {
                // Mode Création de secours
                await handoversApi.create({
                    reservation_id: reservation.id,
                    vehicle_id: reservation.vehicle_id,
                    customer_id: reservation.customer_id,
                    handover_date: new Date(reservation.start_date).toISOString(),
                    departure_mileage: reservation.vehicles?.mileage || 0,
                    departure_fuel_level: '100%',
                    departure_condition_notes: 'Départ auto-généré au retour',
                    ...returnPayload
                });
            }

            // Update Reservation
            await reservationsApi.update(reservation.id, {
                status: 'returned',
                total_price: Number(reservation.total_price) + Number(returnData.extra_charges)
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
                notes: `Retour location N° ${reservation.id.slice(0, 8)}`
            });

            toast.success("Le retour a été enregistré avec succès !");
            setShowReturnModal(false);
            await loadData();
        } catch (error) {
            console.error(error);
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
                        <button onClick={() => handleAction('complete')} disabled={reservation.status === 'completed'} className={`px-4 py-2 text-white font-bold rounded-xl text-sm shadow-lg flex items-center gap-2 ${reservation.status === 'completed' ? 'bg-slate-400 opacity-50 cursor-not-allowed' : 'bg-slate-800 hover:bg-black'}`}>
                            {reservation.status === 'completed' ? 'Dossier Clôturé' : 'Clôturer le dossier'}
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
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
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Tarif</span><span className="font-bold">{reservation.vehicles?.price_per_day} MAD / jour</span></div>
                        </div>
                    </div>

                    {/* Client */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-[#1C0770] font-black mb-4 flex items-center gap-2 uppercase tracking-tighter"><User className="text-[#261CC1] w-4 h-4" /> Informations Client</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Locataire</span><span className="font-bold">{reservation.customers?.full_name}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Téléphone</span><span className="font-bold text-slate-700">{reservation.customers?.phone}</span></div>
                        </div>
                    </div>

                    {/* Handover History */}
                    {handover && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                            <h2 className="text-slate-700 font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-xs"><Clock className="text-[#261CC1] w-4 h-4" /> Historique</h2>
                            <div className="space-y-4">
                                <div className="border-l-2 border-[#261CC1] pl-4 py-1">
                                    <p className="text-[10px] text-[#261CC1] font-black uppercase tracking-widest mb-1">DÉPART</p>
                                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-bold mb-1">
                                        <p>Km : <span className="text-slate-900">{handover.departure_mileage}</span></p>
                                        <p>Caution : <span className="text-slate-900">{handover.deposit_collected} MAD</span></p>
                                    </div>
                                    <p className="text-slate-500 text-[11px] italic">"{handover.departure_condition_notes}"</p>
                                </div>
                                {handover.return_date && (
                                    <div className="border-l-2 border-emerald-500 pl-4 py-1">
                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1">RETOUR</p>
                                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-bold mb-1">
                                            <p>Km : <span className="text-slate-900">{handover.return_mileage}</span></p>
                                            <p>Frais sup. : <span className="text-red-600">{handover.extra_charges} MAD</span></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Docs & Billing) */}
                <div className="space-y-6">
                    {/* Documents */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-[#1C0770] font-black mb-4 flex items-center gap-2 uppercase tracking-tighter"><FileText className="text-[#261CC1] w-4 h-4" /> Documents</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <div>
                                    <p className="text-slate-800 font-bold text-xs flex items-center gap-2 uppercase tracking-wider">Contrat</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{contract ? contract.contract_number : 'Non généré'}</p>
                                </div>
                                {contract ? (
                                    <div className="flex gap-2">
                                        <Link to={`/admin/reservations/${reservation.id}/print/contract?action=print`} target="_blank" className="p-2.5 bg-white border rounded-xl text-slate-400 hover:text-[#261CC1]"><Printer className="w-4 h-4" /></Link>
                                    </div>
                                ) : (
                                    <button onClick={() => handleAction('confirm')} className="px-3 py-1.5 bg-[#261CC1] text-white text-[10px] font-black rounded-lg">Créer</button>
                                )}
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <div>
                                    <p className="text-slate-800 font-bold text-xs uppercase">Facture</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{invoice ? invoice.invoice_number : 'Non générée'}</p>
                                </div>
                                {invoice ? (
                                    <div className="flex gap-2">
                                        <Link to={`/admin/reservations/${reservation.id}/print/invoice?action=print`} target="_blank" className="p-2.5 bg-white border rounded-xl text-slate-400 hover:text-emerald-500"><Printer className="w-4 h-4" /></Link>
                                    </div>
                                ) : (
                                    <button onClick={generateInvoice} className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg">Générer</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Billing Summary */}
                    <div className="bg-[#1C0770] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <h2 className="text-indigo-300 font-black mb-6 uppercase tracking-widest text-[10px]">Bilan Financier</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold">
                                <span>Coût Total</span>
                                <span className="text-white text-xl font-black">{reservation.total_price} MAD</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-indigo-300">
                                <span>Statut</span>
                                <span className={reservation.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>{reservation.payment_status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HANDOVER MODAL */}
            {showHandoverModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-[#1C0770] mb-8">REMISE DU VÉHICULE</h2>
                        <div className="space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Km actuelle</label>
                                    <input name="departure_mileage" type="number" value={handoverData.departure_mileage} onChange={e => setHandoverData({ ...handoverData, departure_mileage: Number(e.target.value) })} className="w-full bg-[#F0F4FF] rounded-xl p-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Carburant</label>
                                    <select name="departure_fuel_level" value={handoverData.departure_fuel_level} onChange={e => setHandoverData({ ...handoverData, departure_fuel_level: e.target.value })} className="w-full bg-[#F0F4FF] rounded-xl p-3 outline-none">
                                        <option>100%</option><option>75%</option><option>50%</option><option>25%</option><option>Réserve</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Caution (MAD)</label>
                                    <input name="deposit_collected" type="number" value={handoverData.deposit_collected} onChange={e => setHandoverData({ ...handoverData, deposit_collected: Number(e.target.value) })} className="w-full bg-[#F0F4FF] rounded-xl p-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Paiement (MAD)</label>
                                    <input name="payment_collected" type="number" value={handoverData.payment_collected} onChange={e => setHandoverData({ ...handoverData, payment_collected: Number(e.target.value) })} className="w-full bg-emerald-50 rounded-xl p-3 outline-none text-emerald-600" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Notes</label>
                                <textarea name="departure_condition_notes" value={handoverData.departure_condition_notes} onChange={e => setHandoverData({ ...handoverData, departure_condition_notes: e.target.value })} className="w-full bg-[#F0F4FF] rounded-xl p-3 min-h-[100px] outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end mt-10">
                            <button onClick={() => setShowHandoverModal(false)} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase">Annuler</button>
                            <button onClick={handleHandoverSubmit} className="px-8 py-3 bg-[#1C0770] text-white font-black text-[10px] uppercase rounded-xl">Valider la sortie</button>
                        </div>
                    </div>
                </div>
            )}

            {/* RETURN MODAL */}
            {showReturnModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-[#1C0770] mb-8 uppercase">RECEPTION</h2>
                        <div className="space-y-5 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Km Retour</label>
                                    <input name="return_mileage" type="number" min={handoverData.departure_mileage} value={returnData.return_mileage} onChange={e => setReturnData({ ...returnData, return_mileage: Number(e.target.value) })} className="w-full bg-emerald-50 rounded-xl p-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Frais Sup. (MAD)</label>
                                    <input name="extra_charges" type="number" value={returnData.extra_charges} onChange={e => setReturnData({ ...returnData, extra_charges: Number(e.target.value) })} className="w-full bg-red-50 rounded-xl p-3 outline-none text-red-600" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Notes</label>
                                <textarea name="return_condition_notes" value={returnData.return_condition_notes} onChange={e => setReturnData({ ...returnData, return_condition_notes: e.target.value })} className="w-full bg-[#F0F4FF] rounded-xl p-3 min-h-[80px] outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end mt-10">
                            <button onClick={() => setShowReturnModal(false)} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest transition-colors">Annuler</button>
                            <button onClick={handleReturnSubmit} className="px-8 py-3 bg-emerald-600 text-white font-black text-[10px] uppercase rounded-xl">Finaliser le retour</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
