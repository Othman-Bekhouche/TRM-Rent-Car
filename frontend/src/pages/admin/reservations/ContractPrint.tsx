import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { reservationsApi, settingsApi, handoversApi } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { Loader2, Printer, MapPin, Phone, Car, Gauge, Fuel, CheckCircle2, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ContractPrint() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [handover, setHandover] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const shouldPrint = searchParams.get('action') === 'print';

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!id) return;
                const [resData, set, handData, { data: { user: authUser } }] = await Promise.all([
                    reservationsApi.getById(id),
                    settingsApi.get(),
                    handoversApi.getByReservation(id),
                    supabase.auth.getUser()
                ]);

                if (authUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', authUser.id)
                        .single();
                    setRole(profile?.role || 'client');
                }

                setReservation(resData);
                setSettings(set);
                setHandover(handData);

                if (shouldPrint) {
                    setTimeout(() => {
                        window.print();
                    }, 1000);
                }
            } catch (err: any) {
                console.error(err);
                toast.error("Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, shouldPrint]);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    if (!reservation) return <div className="p-10 text-center">Contrat introuvable</div>;

    const days = Math.max(1, Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-900 pb-10">
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                
                body { font-family: 'Outfit', sans-serif; print-color-adjust: exact; -webkit-print-color-adjust: exact; }

                @media print {
                    @page { size: A4; margin: 0; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    .page-container { 
                        box-shadow: none !important; 
                        border: none !important; 
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important; 
                        padding: 10mm !important;
                        border-radius: 0 !important;
                    }
                    .bg-slate-50 { background-color: #f8fafc !important; }
                }
            `}} />
            <Toaster />

            <div className="print:hidden fixed top-6 right-6 flex gap-3 z-50">
                <Link
                    to={['admin', 'super_admin', 'gestionnaire', 'assistant'].includes(role || '') ? `/admin/reservations/${id}` : '/profile'}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600"
                >
                    Retour au dossier
                </Link>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all uppercase tracking-widest">
                    <Printer className="w-4 h-4" /> Imprimer le contrat
                </button>
            </div>

            <div className="max-w-[850px] mx-auto my-6 bg-white shadow-2xl border border-slate-100 rounded-[2.5rem] page-container relative overflow-hidden">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900/10 pb-6">
                    <div className="space-y-3">
                        <img src="/trm-logo-pour-arriere-blanc.png" alt="Logo" className="h-12 object-contain" />
                        <div className="text-[10px] text-slate-500 leading-tight">
                            <p className="font-extrabold text-slate-800 uppercase text-base tracking-tighter">{settings?.company_name}</p>
                            <p className="max-w-[250px]">{settings?.address}</p>
                            <p className="font-bold flex items-center gap-1 mt-1 text-slate-700"><Phone className="w-2.5 h-2.5" /> {settings?.phone}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-[900] uppercase tracking-tighter text-slate-900 mb-1">Location de Voiture</h1>
                        <p className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-full inline-block tracking-[0.2em]">
                            CONTRAT N° {reservation.rental_contracts?.[0]?.contract_number || id?.slice(0, 8).toUpperCase()}
                        </p>
                        <div className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Date d'émission: {new Date().toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Client Information */}
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col justify-between">
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Locataire (Conducteur 1)</span>
                            <p className="font-black text-lg text-slate-800 uppercase leading-none">{reservation.customers?.full_name}</p>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                                <div>
                                    <span className="block font-bold text-slate-400 uppercase text-[7px]">CIN / Passport</span>
                                    <span className="font-bold text-slate-700">{reservation.customers?.cin || reservation.customers?.passport || '---'}</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-400 uppercase text-[7px]">Téléphone</span>
                                    <span className="font-bold text-slate-700">{reservation.customers?.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200/50">
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest block mb-1">Conducteur Secondaire</span>
                            <div className="h-4 border-b border-dashed border-slate-300"></div>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-slate-900 text-white p-4 rounded-3xl relative overflow-hidden">
                        <Car className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5" />
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block mb-1">Information Véhicule</span>
                        <p className="font-black text-lg uppercase leading-none">{reservation.vehicles?.brand} {reservation.vehicles?.model}</p>
                        <div className="mt-2 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                            <span className="text-xl font-[900] tracking-wider">{reservation.vehicles?.plate_number}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4 text-[9px]">
                            <div className="flex flex-col">
                                <span className="text-white/40 uppercase font-bold text-[7px]">Carburant</span>
                                <span className="font-bold">{reservation.vehicles?.fuel_type}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/40 uppercase font-bold text-[7px]">Transmission</span>
                                <span className="font-bold">{reservation.vehicles?.transmission?.split(' ')[0]}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/40 uppercase font-bold text-[7px]">Kilométrage</span>
                                <span className="font-bold">{handover?.departure_mileage || reservation.vehicles?.mileage} KM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Handover Table */}
                <div className="border-2 border-slate-900 rounded-[2rem] overflow-hidden mb-6">
                    <div className="grid grid-cols-4 divide-x-2 divide-slate-900 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest text-center py-2">
                        <div>Détails</div>
                        <div>Départ (Handover)</div>
                        <div>Retour (Collection)</div>
                        <div>Suppléments</div>
                    </div>
                    <div className="grid grid-cols-4 divide-x-2 divide-slate-900 bg-white">
                        <div className="p-3 space-y-3 text-[9px] font-bold uppercase text-slate-400">
                            <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> Date & Heure</div>
                            <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Lieu</div>
                            <div className="flex items-center gap-2"><Gauge className="w-3 h-3" /> Kilométrage</div>
                            <div className="flex items-center gap-2"><Fuel className="w-3 h-3" /> Carburant</div>
                        </div>
                        <div className="p-3 space-y-3 font-black text-xs text-slate-800">
                            <div>{new Date(reservation.start_date).toLocaleDateString('fr-FR')}</div>
                            <div className="truncate">{reservation.pickup_location || 'Agence'}</div>
                            <div>{handover?.departure_mileage || reservation.vehicles?.mileage} KM</div>
                            <div>{handover?.departure_fuel_level || '100%'}</div>
                        </div>
                        <div className="p-3 space-y-3 font-black text-xs text-slate-800">
                            <div>{new Date(reservation.end_date).toLocaleDateString('fr-FR')}</div>
                            <div className="truncate">{reservation.dropoff_location || 'Agence'}</div>
                            <div>{handover?.return_mileage ? `${handover.return_mileage} KM` : '---'}</div>
                            <div>{handover?.return_fuel_level || '---'}</div>
                        </div>
                        <div className="p-3 flex flex-col justify-center">
                            <div className="text-center">
                                <span className="block text-[7px] text-slate-400 font-bold uppercase mb-1">Durée Prévue</span>
                                <span className="text-lg font-black bg-slate-100 px-3 py-1 rounded-xl">{days} JRS</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle Condition Diagram Section */}
                <div className="grid grid-cols-12 gap-6 mb-6">
                    <div className="col-span-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative">
                        <div className="absolute top-4 left-6 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">État du véhicule à la sortie</span>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            {/* Car Diagram SVG Placeholder */}
                            <img src="https://cdns-api.leasys.com/api/v1/assets/generic-car-top-view.png" alt="Car Diagram" className="h-40 opacity-20 grayscale sepia" />
                            <div className="flex-1 ml-6 space-y-3">
                                <div className="p-3 bg-white rounded-2xl border border-slate-200/50">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase mb-1 block">Notes de carrosserie</span>
                                    <p className="text-[10px] font-medium text-slate-600 italic">
                                        {handover?.departure_condition_notes || "Aucun dommage majeur signalé. Le véhicule est remis propre."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-2 rounded-xl border border-slate-200/50 text-center">
                                        <span className="text-[7px] text-slate-400 uppercase font-black block">Roue Secours</span>
                                        <span className="text-[9px] font-bold">OUI</span>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl border border-slate-200/50 text-center">
                                        <span className="text-[7px] text-slate-400 uppercase font-black block">Accessoires</span>
                                        <span className="text-[9px] font-bold">CRIC+CLÉ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="col-span-4 flex flex-col gap-3">
                        <div className="flex-1 bg-slate-900 text-white rounded-[2rem] p-5 flex flex-col justify-center text-center">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Caution Déposée</span>
                            <span className="text-2xl font-black tracking-tighter">{(reservation.vehicles?.deposit_amount || 0).toLocaleString()} MAD</span>
                        </div>
                        <div className="flex-1 bg-[#261CC1] text-white rounded-[2rem] p-5 flex flex-col justify-center text-center">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total Contrat TTC</span>
                            <span className="text-3xl font-[900] tracking-tighter leading-none">{reservation.total_price.toLocaleString()}</span>
                            <span className="text-[9px] font-bold opacity-50 mt-1 uppercase tracking-widest">MAD</span>
                        </div>
                    </div>
                </div>

                {/* T&C Section */}
                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 mb-6">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center border-b border-slate-200 pb-1">Conditions d'Engagement Locataire</p>
                    <div className="grid grid-cols-2 gap-x-8 text-[8.5px] leading-tight text-slate-600 font-medium">
                        <ul className="list-disc pl-3 space-y-2">
                            <li>Le locataire déclare avoir reçu le véhicule en parfait état de marche et de carrosserie.</li>
                            <li>Responsabilité totale en cas de vol, accident ou dégradation si le constat n'est pas fourni.</li>
                            <li>Paiement immédiat des amendes, frais de fourrière et majorations durant la location.</li>
                        </ul>
                        <ul className="list-disc pl-3 space-y-2">
                            <li>Interdiction stricte de transporter des passagers à titre onéreux ou de sous-louer.</li>
                            <li>Restituer le véhicule à la date et heure exactes prévues, sinon une pénalité s'applique.</li>
                            <li>La caution sera restituée après inspection finale et preuve de non-infraction grave.</li>
                        </ul>
                    </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-12 mt-10">
                    <div className="text-center relative">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-16">Signature du Client</p>
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
                            <img src="/cachet-sample.png" alt="" className="w-24 rotate-12" />
                        </div>
                        <p className="text-[8px] text-slate-300 uppercase tracking-tighter font-bold italic">Lu et approuvé</p>
                    </div>
                    <div className="text-center border-l border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-16">Cachet de l'Agence</p>
                        <div className="text-[7px] font-black text-slate-200 uppercase tracking-[1em] opacity-30 mt-4 leading-none">{settings?.company_name}</div>
                    </div>
                </div>

                {/* Footer Legal Info */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-12 text-center">
                    <div className="h-px w-full bg-slate-100 mb-4"></div>
                    <div className="flex justify-center gap-6 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        <span>RC: {settings?.legal_rc}</span>
                        <span>IF: {settings?.legal_if}</span>
                        <span>PATENTE: {settings?.legal_patente}</span>
                        <span>ICE: {settings?.legal_ice}</span>
                    </div>
                    <p className="text-[8px] font-black text-slate-200 mt-1 tracking-[0.5em] uppercase">
                        TRM RENT CAR • {settings?.website || 'WWW.TRMRENTCAR.MA'}
                    </p>
                </div>
            </div>
        </div>
    );
}
