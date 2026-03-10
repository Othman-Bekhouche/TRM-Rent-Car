import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    reservationsApi,
    vehiclesApi,
    contractsApi,
    invoicesApi,
    handoversApi,
    type Reservation,
    type RentalContract,
    type Invoice,
    type HandoverRecord
} from '../../../lib/api';
import {
    ArrowLeft, Loader2, Car, User, FileText, FileCheck, CheckCircle, Clock, CheckSquare, Printer
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

            if (action === 'confirm' && !contract) {
                // Auto-generate contract draft
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
            }

            toast.success(`Dossier ${action === 'confirm' ? 'confirmé' : 'annulé'} avec succès`);
            await loadData();
        } catch (err) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const generateInvoice = async () => {
        if (!reservation) return;
        try {
            const inv = await invoicesApi.create({
                reservation_id: reservation.id,
                invoice_number: `FAC-${reservation.id.slice(0, 8).toUpperCase()}`,
                subtotal: reservation.total_price,
                total_amount: reservation.total_price, // handle extras logic if needed
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
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            Réservation {reservation.reservation_number || reservation.id.slice(0, 8).toUpperCase()}
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusProps.color} ${statusProps.bg}`}>
                                {statusProps.label}
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Gérez le contrat, la facture et les mouvements du véhicule.</p>
                    </div>
                </div>

                {/* Global Actions */}
                <div className="flex gap-3">
                    {reservation.status === 'pending' && (
                        <>
                            <button onClick={() => handleAction('cancel')} className="px-4 py-2 border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 font-bold rounded-lg text-sm transition-colors">
                                Refuser
                            </button>
                            <button onClick={() => handleAction('confirm')} className="px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg text-sm shadow-[0_4px_15px_rgba(58,154,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Confirmer
                            </button>
                        </>
                    )}
                    {reservation.status === 'confirmed' && (
                        <button onClick={() => setShowHandoverModal(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            <Car className="w-4 h-4" /> Marquer comme Loué
                        </button>
                    )}
                    {reservation.status === 'rented' && (
                        <button onClick={() => setShowReturnModal(true)} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" /> Enregistrer le retour
                        </button>
                    )}
                    {(reservation.status === 'returned' || reservation.status === 'completed') && (
                        <button onClick={() => reservationsApi.update(reservation.id, { status: 'completed' })} disabled={reservation.status === 'completed'} className={`px-4 py-2 text-white font-bold rounded-lg text-sm shadow-lg flex items-center gap-2 ${reservation.status === 'completed' ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}>
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
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Car className="text-[var(--color-primary)] w-4 h-4" /> Informations Véhicule</h2>
                        <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl mb-4 text-slate-300">
                            <Car className="w-10 h-10 text-slate-500" />
                            <div>
                                <p className="font-bold text-white text-lg">{reservation.vehicles?.brand} {reservation.vehicles?.model}</p>
                                <p className="text-xs uppercase tracking-widest">{reservation.vehicles?.plate_number} • {reservation.vehicles?.fuel_type}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-slate-400">
                            <p>Dates : <span className="text-white">{new Date(reservation.start_date).toLocaleDateString('fr-FR')} - {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</span></p>
                            <p>Lieu Retrait : <span className="text-white">{reservation.pickup_location}</span></p>
                            <p>Prix journalier : <span className="text-white">{reservation.vehicles?.price_per_day} MAD</span></p>
                        </div>
                    </div>

                    {/* Client */}
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><User className="text-[var(--color-primary)] w-4 h-4" /> Informations Client</h2>
                        <div className="grid grid-cols-2 gap-4 text-slate-400">
                            <p>Nom Complet : <span className="text-white font-bold">{reservation.customers?.full_name}</span></p>
                            <p>Téléphone : <span className="text-white">{reservation.customers?.phone}</span></p>
                            <p>Email : <span className="text-white">{reservation.customers?.email}</span></p>
                            <p>CIN/Passeport : <span className="text-white">{reservation.customers?.cin || reservation.customers?.passport || '-'}</span></p>
                        </div>
                    </div>

                    {/* Handover Details if exist */}
                    {handover && (
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Clock className="text-blue-400 w-4 h-4" /> Historique des Opérations</h2>
                            <div className="space-y-4">
                                <div className="border-l-2 border-purple-500 pl-4 py-1">
                                    <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Départ (Remise du véhicule)</p>
                                    <div className="flex gap-4 text-slate-300 text-xs">
                                        <p>Date : <span className="text-white">{new Date(handover.handover_date).toLocaleString()}</span></p>
                                        <p>Km : <span className="text-white">{handover.departure_mileage}</span></p>
                                        <p>Carburant : <span className="text-white">{handover.departure_fuel_level}</span></p>
                                    </div>
                                    <p className="text-slate-400 text-xs mt-1 italic">"{handover.departure_condition_notes}"</p>
                                </div>
                                {handover.return_date && (
                                    <div className="border-l-2 border-emerald-500 pl-4 py-1">
                                        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Retour du véhicule</p>
                                        <div className="flex gap-4 text-slate-300 text-xs">
                                            <p>Date : <span className="text-white">{new Date(handover.return_date).toLocaleString()}</span></p>
                                            <p>Km : <span className="text-white">{handover.return_mileage}</span></p>
                                            <p>Carburant : <span className="text-white">{handover.return_fuel_level}</span></p>
                                            {handover.extra_charges > 0 && <p>Frais sup. : <span className="text-red-400 font-bold">+{handover.extra_charges} MAD</span></p>}
                                        </div>
                                        <p className="text-slate-400 text-xs mt-1 italic">"{handover.return_condition_notes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Documents & Billing) */}
                <div className="space-y-6">
                    {/* Documents */}
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><FileText className="text-[var(--color-primary)] w-4 h-4" /> Documents</h2>

                        <div className="space-y-3">
                            <div className="p-3 bg-black/20 rounded-xl border border-[var(--color-border)]/50">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-white font-medium flex items-center gap-2"><FileCheck className="w-4 h-4 text-amber-500" /> Contrat</p>
                                    {contract ? (
                                        <Link to={`/admin/reservations/${reservation.id}/contract-print`} target="_blank" className="p-1 text-slate-400 hover:text-[var(--color-primary)]" title="Imprimer">
                                            <Printer className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleAction('confirm')}
                                            disabled={reservation.status === 'pending'}
                                            className="text-xs text-[var(--color-primary)] font-bold hover:underline disabled:opacity-50"
                                        >
                                            Générer
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">{contract ? `Réf: ${contract.contract_number}` : 'Aucun contrat (Dossier non confirmé)'}</p>
                            </div>

                            <div className="p-3 bg-black/20 rounded-xl border border-[var(--color-border)]/50">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-white font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500" /> Facture</p>
                                    {invoice ? (
                                        <Link to={`/admin/reservations/${reservation.id}/invoice-print`} target="_blank" className="p-1 text-slate-400 hover:text-[var(--color-primary)]" title="Imprimer">
                                            <Printer className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={generateInvoice}
                                            disabled={reservation.status === 'pending'}
                                            className="text-xs text-[var(--color-primary)] font-bold hover:underline disabled:opacity-50"
                                        >
                                            Générer
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">{invoice ? `Réf: ${invoice.invoice_number}` : 'Aucune facture'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Billing Summary */}
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
                        <h2 className="text-white font-bold mb-4 flex items-center gap-2"><CheckCircle className="text-[var(--color-primary)] w-4 h-4" /> Bilan Financier</h2>
                        <div className="space-y-3 text-slate-300">
                            <div className="flex justify-between">
                                <span>Montant Location</span>
                                <span>{reservation.total_price - (handover?.extra_charges || 0)} MAD</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Méthode de paiement</span>
                                <span>{reservation.payment_method}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-2">
                                <span>Statut Paiement</span>
                                <span className={reservation.payment_status === 'paid' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>{reservation.payment_status}</span>
                            </div>
                            {handover?.extra_charges ? (
                                <div className="flex justify-between text-red-400 border-t border-[var(--color-border)] pt-2">
                                    <span>Suppléments / Frais</span>
                                    <span>+{handover.extra_charges} MAD</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 mt-2 text-white font-black text-lg">
                                <span>Total Final</span>
                                <span className="text-[var(--color-primary)]">{reservation.total_price} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HANDOVER MODAL (Départ) */}
            {showHandoverModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 animate-[fadeIn_0.2s_ease-out]">
                        <h2 className="text-xl font-black text-white mb-4">Remise du Véhicule <span className="text-[var(--color-primary)]">(Départ)</span></h2>
                        <div className="space-y-4 text-sm mt-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Kilométrage Actuel</label>
                                <input type="number" value={handoverData.departure_mileage} onChange={e => setHandoverData({ ...handoverData, departure_mileage: Number(e.target.value) })} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl p-3" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Niveau Carburant</label>
                                <select value={handoverData.departure_fuel_level} onChange={e => setHandoverData({ ...handoverData, departure_fuel_level: e.target.value })} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl p-3">
                                    <option>100%</option><option>75%</option><option>50%</option><option>25%</option><option>Réserve</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Notes État Véhicule</label>
                                <textarea value={handoverData.departure_condition_notes} onChange={e => setHandoverData({ ...handoverData, departure_condition_notes: e.target.value })} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl p-3 min-h-[80px]" />
                            </div>

                        </div>
                        <div className="flex gap-3 justify-end mt-8">
                            <button onClick={() => setShowHandoverModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-bold transition-colors">Annuler</button>
                            <button onClick={handleHandoverSubmit} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">Valider le Départ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* RETURN MODAL (Retour) */}
            {showReturnModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 animate-[fadeIn_0.2s_ease-out]">
                        <h2 className="text-xl font-black text-white mb-4">Enregistrer le Retour <span className="text-emerald-500">(Arrivée)</span></h2>
                        <div className="space-y-4 text-sm mt-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nouveau Kilométrage</label>
                                <input type="number" min={handoverData.departure_mileage} value={returnData.return_mileage} onChange={e => setReturnData({ ...returnData, return_mileage: Number(e.target.value) })} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl p-3" />
                                <p className="text-xs text-slate-500 mt-1">Au départ: {handoverData.departure_mileage} km</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Niveau Carburant (Retour)</label>
                                <select value={returnData.return_fuel_level} onChange={e => setReturnData({ ...returnData, return_fuel_level: e.target.value })} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl p-3">
                                    <option>100%</option><option>75%</option><option>50%</option><option>25%</option><option>Réserve</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nouveaux Dommages / Notes</label>
                                <textarea value={returnData.return_condition_notes} onChange={e => setReturnData({ ...returnData, return_condition_notes: e.target.value })} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl p-3 min-h-[60px]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Frais Supplémentaires (MAD)</label>
                                <input type="number" value={returnData.extra_charges} onChange={e => setReturnData({ ...returnData, extra_charges: Number(e.target.value) })} className="w-full bg-[var(--color-background)] border border-red-500/30 text-white rounded-xl p-3 focus:ring-red-500" placeholder="0" />
                                <p className="text-xs text-slate-500 mt-1">Sera ajouté au montant de la location (carburant, retard, dégâts).</p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-8">
                            <button onClick={() => setShowReturnModal(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-bold transition-colors">Annuler</button>
                            <button onClick={handleReturnSubmit} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-xl hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">Confirmer le Retour</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
