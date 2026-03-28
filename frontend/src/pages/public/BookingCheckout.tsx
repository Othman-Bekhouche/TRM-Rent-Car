import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Car, User, CheckCircle, Shield, Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function BookingCheckout() {
    const { vehicleId } = useParams();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1); // 1: recap, 2: info client, 3: confirmation
    const [loadingVehicle, setLoadingVehicle] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Client info
    const [client, setClient] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        cin: '',
        address: '',
        city: 'Taourirt',
        createAccount: true,
        password: '',
    });

    // Booking & Vehicle data
    const [booking, setBooking] = useState({
        vehicle: '',
        plate: '',
        pricePerDay: 0,
        deposit: 0,
        pickup: 'Agence Taourirt (Siège)',
        startDate: '',
        endDate: '',
        childSeat: false,
        image_url: ''
    });

    const [vehicleReservations, setVehicleReservations] = useState<{ start_date: string; end_date: string; status: string }[]>([]);

    useEffect(() => {
        if (vehicleId) {
            fetchVehicleReservations(vehicleId);
        }
    }, [vehicleId]);

    const fetchVehicleReservations = async (vid: string) => {
        const { data } = await supabase.from('reservations')
            .select('start_date, end_date, status')
            .eq('vehicle_id', vid)
            .not('status', 'in', '("cancelled","completed","returned","rejected")')
            .gte('end_date', new Date().toISOString());
        setVehicleReservations(data || []);
    };

    useEffect(() => {
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        if (start) setBooking(prev => ({ ...prev, startDate: start }));
        if (end) setBooking(prev => ({ ...prev, endDate: end }));

        const loadInitialData = async () => {
            try {
                setLoadingVehicle(true);

                // 1. Fetch Vehicle from DB
                if (vehicleId) {
                    const { data: vehicle, error } = await supabase
                        .from('vehicles')
                        .select('*, vehicle_images(*)')
                        .eq('id', vehicleId)
                        .limit(1)
                        .maybeSingle();

                    if (error) throw error;

                    if (vehicle) {
                        const coverImage = vehicle.vehicle_images?.find((img: { is_cover: boolean; image_url: string }) => img.is_cover)?.image_url
                            || vehicle.vehicle_images?.[0]?.image_url
                            || '/images/cars/default.png';

                        setBooking(prev => ({
                            ...prev,
                            vehicle: `${vehicle.brand} ${vehicle.model}`,
                            plate: vehicle.plate_number,
                            pricePerDay: vehicle.price_per_day,
                            deposit: vehicle.deposit_amount,
                            image_url: coverImage
                        }));
                    }
                }

                // 2. Check User Session
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setIsLoggedIn(true);
                    const fullName = session.user.user_metadata?.full_name || '';
                    const parts = fullName.split(' ');
                    setClient(prev => ({
                        ...prev,
                        firstName: parts[0] || '',
                        lastName: parts.slice(1).join(' ') || '',
                        email: session.user.email || '',
                        phone: session.user.user_metadata?.phone || '',
                        createAccount: false
                    }));

                    const { data: customer } = await supabase
                        .from('customers')
                        .select('*')
                        .eq('email', session.user.email)
                        .limit(1)
                        .maybeSingle();

                    if (customer) {
                        setClient(prev => ({
                            ...prev,
                            cin: customer.cin || prev.cin,
                            address: customer.address || prev.address,
                            city: customer.city || prev.city
                        }));
                    }
                }
            } catch (err: any) {
                console.error("Error loading booking data:", err);
                toast.error("Impossible de charger les informations du véhicule.");
            } finally {
                setLoadingVehicle(false);
            }
        };
        loadInitialData();
    }, [vehicleId, searchParams]);

    const totalDays = booking.startDate && booking.endDate
        ? Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    const childSeatTotal = booking.childSeat ? 50 * totalDays : 0;
    const totalPrice = (booking.pricePerDay * totalDays) + childSeatTotal;

    if (loadingVehicle) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-[var(--color-background)]">
                <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    const handleSubmitBooking = async () => {
        setLoading(true);
        try {
            // 1. Create or Update customer record via Secure RPC
            const { data: generatedCustomerId, error: custErr } = await supabase.rpc('handle_checkout_customer', {
                p_first_name: client.firstName,
                p_last_name: client.lastName,
                p_email: client.email || null,
                p_phone: client.phone,
                p_cin: client.cin || null,
                p_address: client.address || null,
                p_city: client.city || null,
                p_status: isLoggedIn ? 'Actif' : 'Nouveau'
            });

            if (custErr || !generatedCustomerId) {
                console.error("RPC Error:", custErr);
                throw new Error("Erreur: Impossible d'enregistrer le profil client.");
            }

            // 2. Find the vehicle ID is already in vehicleId

            // 3. Create Reservation
            const { error: resErr } = await supabase
                .from('reservations')
                .insert({
                    customer_id: generatedCustomerId,
                    vehicle_id: vehicleId,
                    start_date: booking.startDate,
                    end_date: booking.endDate,
                    pickup_location: booking.pickup,
                    dropoff_location: 'Agence Taourirt',
                    total_price: totalPrice,
                    status: 'pending',
                    payment_method: 'Espèces',
                    payment_status: 'pending',
                    notes: `Equipements: ${booking.childSeat ? 'Siège enfant included' : 'None'}`
                });

            if (resErr) {
                if (resErr.message?.includes('ERREUR_CHEVAUCHEMENT')) {
                    throw new Error('Ce vehicule est deja reserved sur cette periode. Veuillez choisir d\'autres dates.');
                }
                throw resErr;
            }

            // 4. Create account only if NOT logged in and requested
            if (!isLoggedIn && client.createAccount && client.password) {
                await supabase.auth.signUp({
                    email: client.email,
                    password: client.password,
                    options: {
                        data: {
                            full_name: `${client.firstName} ${client.lastName}`,
                            phone: client.phone,
                        }
                    }
                });
            }

            setStep(3);
            toast.success('Réservation envoyée avec succès !');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur lors de la réservation.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[var(--color-background)] min-h-screen py-12 px-4 sm:px-8">
            <Toaster position="top-center" />
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8 animate-slide-right opacity-0">
                    <Link to="/vehicles" className="inline-flex items-center text-slate-400 hover:text-[var(--color-primary)] transition text-sm font-medium group mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Retour à la flotte
                    </Link>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none">
                        Réserver votre <span className="text-[var(--color-primary)]">véhicule</span>
                    </h1>
                    <p className="text-slate-400 mt-3 font-medium">Remplissez les informations ci-dessous pour compléter votre réservation</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-0 mb-10 animate-fade-in opacity-0 delay-200">
                    {[
                        { n: 1, label: 'Dates & Options' },
                        { n: 2, label: 'Vos Informations' },
                        { n: 3, label: 'Confirmation' },
                    ].map((s, i) => (
                        <div key={i} className="flex-1 flex items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-500 shadow-xl ${step >= s.n ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white scale-110' : 'border-[var(--color-border)] text-slate-500'}`}>
                                {step > s.n ? <CheckCircle className="w-6 h-6" /> : s.n}
                            </div>
                            <span className={`ml-4 text-[10px] font-black uppercase tracking-widest ${step >= s.n ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                            {i < 2 && <div className={`flex-1 h-1 mx-6 rounded-full transition-colors duration-1000 ${step > s.n ? 'bg-[var(--color-primary)] shadow-[0_0_10px_rgba(58,154,255,0.5)]' : 'bg-[var(--color-border)]'}`} />}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Dates & Options */}
                        {step === 1 && (
                            <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    Dates & Options
                                </h2>

                                <div className="bg-[#0B0F19] rounded-2xl p-8 border border-[#1F2A3D] space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Lieu de retrait</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primary)]" />
                                            <select
                                                value={booking.pickup}
                                                onChange={(e) => setBooking({ ...booking, pickup: e.target.value })}
                                                className="w-full bg-[#121826] border border-[#1F2A3D] text-white rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none appearance-none"
                                            >
                                                <option>Agence Taourirt (Siège)</option>
                                                <option>Livraison Oujda</option>
                                                <option>Livraison Nador</option>
                                                <option>Livraison Fès</option>
                                                <option>Livraison Berkane</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Retrait</label>
                                            <input
                                                type="date"
                                                value={booking.startDate}
                                                onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                                                className="w-full bg-[#121826] border border-[#1F2A3D] text-white rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Retour</label>
                                            <input
                                                id="booking-end-date"
                                                name="end_date"
                                                type="date"
                                                value={booking.endDate}
                                                onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                                                min={booking.startDate}
                                                className="w-full bg-[#121826] border border-[#1F2A3D] text-white rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <label className="flex items-center p-5 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
                                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[#121826]">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Assurance Multirisque</p>
                                                <p className="text-xs text-slate-400">Protection complète incluse</p>
                                            </div>
                                            <span className="ml-auto text-[10px] font-black text-[var(--color-primary)] bg-white/5 px-4 py-2 rounded-full">OFFERT</span>
                                        </label>
                                        <label className="flex items-center p-5 rounded-2xl border border-[#1F2A3D] bg-[#121826]/50 cursor-pointer">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.childSeat ? 'bg-[var(--color-primary)]' : 'bg-[#1F2A3D]'}`}>
                                                <Car className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Siège Enfant</p>
                                                <p className="text-xs text-slate-400">Pour la sécurité des petits</p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-500">+50 MAD/J</span>
                                                <input
                                                    type="checkbox"
                                                    checked={booking.childSeat}
                                                    onChange={(e) => setBooking({ ...booking, childSeat: e.target.checked })}
                                                    className="w-6 h-6 bg-[#0B0F19] border-[#1F2A3D] rounded-lg"
                                                />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {vehicleReservations.length > 0 && (
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-black text-white uppercase tracking-wider">Disponibilité</h3>
                                                <p className="text-[10px] text-slate-500 font-bold mt-0.5 italic">* Déjà réservé :</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {vehicleReservations.map((res, idx) => (
                                                <div key={idx} className="bg-[#0B0F19] border border-[#1F2A3D] px-4 py-2 rounded-xl text-[10px] font-black">
                                                    <span className="text-slate-400">{new Date(res.start_date).toLocaleDateString()}</span>
                                                    <span className="mx-2 text-slate-600">→</span>
                                                    <span className="text-white">{new Date(res.end_date).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={async () => {
                                        if (!booking.startDate || !booking.endDate) {
                                            toast.error('Choisissez les dates.'); return;
                                        }
                                        if (new Date(booking.startDate) >= new Date(booking.endDate)) {
                                            toast.error('Date retour invalide.'); return;
                                        }
                                        setLoading(true);
                                        try {
                                            const { data, error } = await supabase.rpc('check_vehicle_availability', {
                                                p_vehicle_id: vehicleId,
                                                p_start_date: booking.startDate,
                                                p_end_date: booking.endDate
                                            });
                                            if (error) throw error;
                                            if (data && data.length > 0 && !data[0].is_available) {
                                                toast.error(`Indisponible. Prochain: ${new Date(data[0].next_available_date).toLocaleDateString()}`);
                                                return;
                                            }
                                            setStep(2);
                                        } catch (err) {
                                            toast.error("Erreur de vérification.");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="w-full py-5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-black uppercase tracking-widest text-sm rounded-2xl"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Suivant'}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Client Info */}
                        {step === 2 && (
                            <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-10 space-y-8 shadow-2xl">
                                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        <User className="w-5 h-5" />
                                    </div>
                                    Vos Informations
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Prénom *</label>
                                         <input id="client-first-name" name="first_name" type="text" value={client.firstName} onChange={(e) => setClient({ ...client, firstName: e.target.value })} className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nom *</label>
                                         <input id="client-last-name" name="last_name" type="text" value={client.lastName} onChange={(e) => setClient({ ...client, lastName: e.target.value })} className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email *</label>
                                         <input id="client-email" name="email" type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Téléphone *</label>
                                         <input id="client-phone" name="phone" type="tel" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">CIN / Passeport</label>
                                         <input id="client-cin" name="cin" type="text" value={client.cin} onChange={(e) => setClient({ ...client, cin: e.target.value })} className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold" />
                                    </div>
                                </div>

                                {!isLoggedIn && (
                                    <div className="bg-[#0B0F19] border border-[#1F2A3D] rounded-3xl p-8">
                                        <label className="flex items-center cursor-pointer">
                                             <input id="create-account-toggle" name="create_account" type="checkbox" checked={client.createAccount} onChange={(e) => setClient({ ...client, createAccount: e.target.checked })} className="w-6 h-6 mr-4" />
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Créer un profil client</p>
                                                <p className="text-[10px] text-slate-500">Pour suivre vos locations</p>
                                            </div>
                                        </label>
                                        {client.createAccount && (
                                            <div className="mt-8">
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Mot de passe</label>
                                                  <input id="client-password" name="password" type="password" value={client.password} onChange={(e) => setClient({ ...client, password: e.target.value })} className="w-full bg-[#121826] border border-[#3A9AFF]/30 text-white rounded-xl px-5 py-4 text-sm font-bold" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setStep(1)} className="px-8 py-5 border border-[#1F2A3D] text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl">Précédent</button>
                                    <button onClick={handleSubmitBooking} disabled={loading} className="flex-1 py-5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-black uppercase tracking-widest text-sm rounded-2xl">
                                        {loading ? 'Traitement...' : 'Finaliser la Réservation'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-12 text-center space-y-8 shadow-2xl">
                                <div className="w-24 h-24 mx-auto bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl">
                                    <CheckCircle className="w-12 h-12" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Demande <span className="text-emerald-500">Enregistrée</span> !</h2>
                                    <p className="text-slate-400 mt-4 leading-relaxed font-medium">Merci {client.firstName} ! Notre équipe va vous contacter.</p>
                                </div>
                                <Link to="/" className="inline-block px-10 py-4 bg-[#1F2A3D] text-white rounded-2xl text-xs font-black uppercase tracking-widest">Retour Accueil</Link>
                            </div>
                        )}

                    </div>

                    {/* Sidebar: Summary Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-8 shadow-2xl sticky top-8 space-y-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Car className="w-4 h-4 text-[var(--color-primary)]" /> Récapitulatif
                            </h3>
                            <div className="space-y-4">
                                <div className="aspect-video rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 bg-[#0B0F19] border border-[#1F2A3D]">
                                    <img src={booking.image_url} alt={booking.vehicle} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-tight">{booking.vehicle}</p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">{booking.plate}</p>
                                </div>
                            </div>
                            <div className="h-px bg-slate-800"></div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-[var(--color-primary)]/30 underline-offset-4">Location ({totalDays} jours)</span>
                                    <span className="text-sm font-black text-white">{booking.pricePerDay * totalDays} MAD</span>
                                </div>
                                {booking.childSeat && (
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-[var(--color-primary)]/30 underline-offset-4">Siège enfant</span>
                                        <span className="text-sm font-black text-white">{childSeatTotal} MAD</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                                    <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Total TTC</span>
                                    <span className="text-2xl font-black text-[var(--color-primary)] bg-clip-text drop-shadow-[0_0_10px_rgba(58,154,255,0.3)]">{totalPrice} MAD</span>
                                </div>
                            </div>
                            <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl p-6">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3 mb-2">
                                    <Shield className="w-4 h-4 text-[var(--color-primary)]" /> Caution Remboursable
                                </p>
                                <p className="text-xl font-black text-white">{booking.deposit} MAD</p>
                                <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-wide">A régler sur place</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
