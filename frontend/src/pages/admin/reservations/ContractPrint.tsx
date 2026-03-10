import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reservationsApi, contractsApi, settingsApi } from '../../../lib/api';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContractPrint() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<any>(null);
    const [contract, setContract] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!id) return;
                const [resData, conData, set] = await Promise.all([
                    reservationsApi.getById(id),
                    contractsApi.getByReservation(id),
                    settingsApi.get()
                ]);
                setReservation(resData);
                setContract(conData);
                setSettings(set);
            } catch (err: any) {
                console.error(err);
                toast.error("Erreur de chargement du contrat");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!reservation) return <div className="p-10 text-center">Réservation introuvable</div>;

    const days = Math.max(1, Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="bg-white text-black min-h-screen font-sans p-4 relative">
            <Toaster />
            {/* Action Bar (hidden in print) */}
            <div className="print:hidden flex justify-between items-center mb-8 max-w-4xl mx-auto bg-slate-100 p-4 rounded-xl">
                <Link to={`/admin/reservations/${id}`} className="flex items-center gap-2 text-slate-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4" /> Retour au dossier
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-2 bg-[#261CC1] text-white rounded-lg font-bold hover:bg-[#1C0770] transition shadow-lg shadow-[#261CC1]/20"
                    >
                        <Printer className="w-4 h-4" /> Imprimer
                    </button>
                    {/* Pour le téléchargement, le comportement natif d'impression gère 'Enregistrer au format PDF' parfaitement aujourd'hui, on réutilise la fonction print avec un label différent pour l'UX */}
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-[#261CC1] border-2 border-[#261CC1] rounded-lg font-bold hover:bg-slate-50 transition"
                    >
                        Télécharger PDF
                    </button>
                </div>
            </div>

            {/* A4 Container */}
            <div className="max-w-4xl mx-auto bg-white p-10 border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                    <div>
                        <img src="/trm-logo-pour-arriere-noir.png" alt="TRM Rent Car" className="h-16 mb-4 object-contain brightness-0" style={{ filter: 'grayscale(100%) brightness(0)' }} />
                        <div className="text-sm space-y-1 text-slate-700">
                            <p className="font-bold text-lg text-black">{settings?.company_name || 'TRM Rent Car'}</p>
                            <p>{settings?.address || 'Appt Sabrine, 2ème Étage N°6 Bloc A, 65800 Taourirt'}</p>
                            <p>Tél : {settings?.phone || '06 06 06 6426'}</p>
                            <p>Email : {settings?.email || 'trm.rentcar@gmail.com'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-800 mb-2">Contrat de Location</h1>
                        <p className="text-lg font-medium text-slate-600">N° {contract?.contract_number || `CTR-${reservation.id.slice(0, 8).toUpperCase()}`}</p>
                        <p className="text-sm text-slate-500 mt-2">Fait le : {new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                {/* Info blocks */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Customer */}
                    <div className="border border-slate-300 rounded-lg p-5">
                        <h2 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-wider border-b border-slate-200 pb-2">Informations Locataire</h2>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium inline-block w-32">Nom / Prénom :</span> {reservation.customers?.full_name}</p>
                            <p><span className="font-medium inline-block w-32">Tél :</span> {reservation.customers?.phone}</p>
                            <p><span className="font-medium inline-block w-32">Email :</span> {reservation.customers?.email}</p>
                            <p><span className="font-medium inline-block w-32">CIN / Passeport :</span> {reservation.customers?.cin || reservation.customers?.passport || 'N/A'}</p>
                            <p><span className="font-medium inline-block w-32">Adresse :</span> {reservation.customers?.address || 'N/A'}, {reservation.customers?.city}</p>
                        </div>
                    </div>

                    {/* Vehicle */}
                    <div className="border border-slate-300 rounded-lg p-5">
                        <h2 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-wider border-b border-slate-200 pb-2">Détails Véhicule</h2>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium inline-block w-32">Marque / Modèle :</span> {reservation.vehicles?.brand} {reservation.vehicles?.model}</p>
                            <p><span className="font-medium inline-block w-32">Immatriculation :</span> {reservation.vehicles?.plate_number}</p>
                            <p><span className="font-medium inline-block w-32">Carburant :</span> {reservation.vehicles?.fuel_type}</p>
                            <p><span className="font-medium inline-block w-32">KM Départ :</span> {contract?.departure_mileage || reservation.vehicles?.mileage || '______'} km</p>
                            <p><span className="font-medium inline-block w-32">Niveau Carburant :</span> {contract?.fuel_level_departure || '______'}</p>
                        </div>
                    </div>
                </div>

                {/* Rental Details */}
                <div className="border border-slate-300 rounded-lg p-5 mb-8">
                    <h2 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-wider border-b border-slate-200 pb-2">Période de Location & Paiement</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <p><span className="font-medium inline-block w-32">Retrait le :</span> {new Date(reservation.start_date).toLocaleDateString('fr-FR')}</p>
                        <p><span className="font-medium inline-block w-32">Retour le :</span> {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
                        <p><span className="font-medium inline-block w-32">Lieu retrait :</span> {reservation.pickup_location}</p>
                        <p><span className="font-medium inline-block w-32">Lieu retour :</span> {reservation.dropoff_location || reservation.pickup_location}</p>
                        <p><span className="font-medium inline-block w-32">Durée :</span> {days} jours</p>
                        <p><span className="font-medium inline-block w-32">Prix par jour :</span> {reservation.vehicles?.price_per_day} MAD</p>
                        <p><span className="font-medium inline-block w-32">Total Location :</span> <span className="font-bold">{reservation.total_price} MAD</span></p>
                        <p className="col-span-2"><span className="font-medium inline-block w-32">Statut Paiement :</span> {reservation.payment_status === 'paid' ? 'Payé' : 'En attente'}</p>
                    </div>
                </div>

                {/* Condition Notes */}
                <div className="border border-slate-300 rounded-lg p-5 mb-8">
                    <h2 className="text-sm font-bold uppercase text-slate-500 mb-4 tracking-wider border-b border-slate-200 pb-2">État du Véhicule au Départ</h2>
                    <div className="min-h-[80px] bg-slate-50 rounded p-3 text-sm">
                        {contract?.vehicle_condition_departure || 'Aucun dommage signalé. Le véhicule est remis en parfait état de fonctionnement et de propreté.'}
                    </div>
                </div>

                {/* Terms */}
                <div className="mb-12 text-xs text-justify text-slate-600 space-y-2">
                    <h3 className="font-bold uppercase text-slate-800">Conditions Générales (Extrait)</h3>
                    <p>1. Le locataire reconnaît avoir reçu le véhicule décrit ci-dessus en bon état de marche et de propreté, avec les accessoires normaux (roue de secours, cric, etc.).</p>
                    <p>2. Le locataire s'engage à restituer le véhicule à la date, heure et lieu convenus, dans le même état qu'à la livraison.</p>
                    <p>3. En cas d'infraction au code de la route, le locataire est seul responsable des amendes et poursuites pendant la durée de la location.</p>
                    <p>4. L'usage du véhicule est strictement interdit hors des voies carrossables, pour des sous-locations ou pour le transport de passagers à titre onéreux.</p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center pt-8 mt-auto">
                    <div>
                        <p className="font-bold text-sm uppercase mb-16">Signature de l'Agence</p>
                        <div className="border-t border-slate-300 pt-2 text-xs text-slate-400 w-48 mx-auto">Cachet et Signature</div>
                    </div>
                    <div>
                        <p className="font-bold text-sm uppercase mb-16">Signature du Locataire</p>
                        <div className="border-t border-slate-300 pt-2 text-xs text-slate-400 w-48 mx-auto">(Lu et approuvé)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
