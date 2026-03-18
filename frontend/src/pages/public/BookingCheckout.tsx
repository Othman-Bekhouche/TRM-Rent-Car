import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Car, User, CheckCircle, Shield, Loader2, Lock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function BookingCheckout() {
    const { vehicleId } = useParams();
    console.log('Booking for vehicle:', vehicleId); // Use it to fix lint
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

    useEffect(() => {
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
                        const coverImage = vehicle.vehicle_images?.find((img: any) => img.is_cover)?.image_url
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
    }, [vehicleId]);

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
            // 1. Create or Update customer record via Secure RPC (bypasses RLS reading limits for public users)
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

            const customerId = generatedCustomerId;

            // 2. Find the vehicle by plate/name
            const { data: vehicleData } = await supabase
                .from('vehicles')
                .select('id')
                .eq('plate_number', booking.plate)
                .limit(1)
                .maybeSingle();

            if (!vehicleData?.id) {
                throw new Error("Erreur: Le véhicule sélectionné n'est plus disponible.");
            }

            // 3. Create reservation
            const { error: resErr } = await supabase
                .from('reservations')
                .insert({
                    customer_id: customerId,
                    vehicle_id: vehicleData?.id || null,
                    start_date: booking.startDate,
                    end_date: booking.endDate,
                    pickup_location: booking.pickup,
                    dropoff_location: booking.pickup,
                    total_price: totalPrice,
                    status: 'pending',
                    payment_status: 'unpaid',
                    notes: booking.childSeat ? 'Siège enfant demandé' : null,
                });

            if (resErr) throw resErr;

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
            toast.success('Réservation envoyée avec succès !', {
                style: { background: '#1F2937', color: '#fff', border: '1px solid #3A9AFF' },
            });
        } catch (err: any) {
            toast.error(err?.message || 'Erreur lors de la réservation.', {
                style: { background: '#1F2937', color: '#fff', border: '1px solid #ef4444' },
            });
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
                    <div className="lg:col-span-2 space-y-6 animate-slide-up opacity-0 delay-400">

                        {/* Step 1: Dates & Options */}
                        {step === 1 && (
                            <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-32 -mt-32"></div>
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
                                                className="w-full bg-[#121826] border border-[#1F2A3D] text-white rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none appearance-none cursor-pointer"
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
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Date de retrait</label>
                                            <input
                                                type="date"
                                                value={booking.startDate}
                                                onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                                                className="w-full bg-[#121826] border border-[#1F2A3D] text-white rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Date de retour</label>
                                            <input
                                                type="date"
                                                value={booking.endDate}
                                                onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                                                min={booking.startDate}
                                                className="w-full bg-[#121826] border border-[#1F2A3D] text-white rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-4 pt-4">
                                        <label className="flex items-center p-5 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 cursor-default group/option transition-all">
                                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[#121826]">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Assurance Multirisque</p>
                                                <p className="text-xs text-slate-400">Protection complète incluse par défaut</p>
                                            </div>
                                            <span className="ml-auto text-xs font-black text-[var(--color-primary)] tracking-widest bg-white/5 px-4 py-2 rounded-full">OFFERT</span>
                                        </label>
                                        <label className="flex items-center p-5 rounded-2xl border border-[#1F2A3D] hover:border-[var(--color-primary)]/50 bg-[#121826]/50 cursor-pointer transition-all group/option">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${booking.childSeat ? 'bg-[var(--color-primary)] text-[#121826]' : 'bg-[#1F2A3D] text-slate-500'}`}>
                                                <Car className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Siège Enfant</p>
                                                <p className="text-xs text-slate-400">Siège homologué pour la sécurité</p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-4">
                                                <span className="text-xs font-black text-slate-500">+50 MAD/J</span>
                                                <input
                                                    type="checkbox"
                                                    checked={booking.childSeat}
                                                    onChange={(e) => setBooking({ ...booking, childSeat: e.target.checked })}
                                                    className="w-6 h-6 text-[var(--color-primary)] bg-[#0B0F19] border-[#1F2A3D] rounded-lg focus:ring-[var(--color-primary)]/20"
                                                />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!booking.startDate || !booking.endDate) {
                                            toast.error('Veuillez choisir les dates de retrait et retour.');
                                            return;
                                        }
                                        setStep(2);
                                    }}
                                    className="w-full py-5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:scale-[1.02] transition-all shadow-2xl shadow-blue-500/20 active:scale-[0.98]"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}

                        {/* Step 2: Client Info */}
                        {step === 2 && (
                            <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-10 space-y-8 shadow-2xl animate-fade-in">
                                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                        <User className="w-5 h-5" />
                                    </div>
                                    Vos Informations
                                </h2>

                                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex items-start gap-4">
                                    <Shield className="w-6 h-6 text-[var(--color-primary)] shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">Réservation Sécurisée</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Vos données sont protégées. Pas de compte obligatoire, mais vous pouvez en créer un pour suivre l'historique de vos locations.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Prénom *</label>
                                        <input
                                            type="text" required
                                            value={client.firstName}
                                            onChange={(e) => setClient({ ...client, firstName: e.target.value })}
                                            className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                                            placeholder="Ex: Omar"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Nom *</label>
                                        <input
                                            type="text" required
                                            value={client.lastName}
                                            onChange={(e) => setClient({ ...client, lastName: e.target.value })}
                                            className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                                            placeholder="Ex: El Alami"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email *</label>
                                        <input
                                            type="email" required
                                            value={client.email}
                                            onChange={(e) => setClient({ ...client, email: e.target.value })}
                                            className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                                            placeholder="omar.alami@exemple.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Téléphone *</label>
                                        <input
                                            type="tel" required
                                            value={client.phone}
                                            onChange={(e) => setClient({ ...client, phone: e.target.value })}
                                            className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                                            placeholder="+212 6..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">CIN / Passeport</label>
                                        <input
                                            type="text"
                                            value={client.cin}
                                            onChange={(e) => setClient({ ...client, cin: e.target.value })}
                                            className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                                            placeholder="Ex: BH123456"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Adresse complète</label>
                                        <input
                                            type="text"
                                            value={client.address}
                                            onChange={(e) => setClient({ ...client, address: e.target.value })}
                                            className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all outline-none"
                                            placeholder="N°6 Bloc A, Sabrine..."
                                        />
                                    </div>
                                </div>

                                {/* Create Account Section */}
                                {!isLoggedIn && (
                                    <div className={`rounded-3xl p-8 transition-all duration-500 ${client.createAccount ? 'bg-[#3A9AFF]/5 border border-[#3A9AFF]/30' : 'bg-[#0B0F19] border border-[#1F2A3D]'}`}>
                                        <label className="flex items-center cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={client.createAccount}
                                                    onChange={(e) => setClient({ ...client, createAccount: e.target.checked })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-14 h-7 rounded-full transition-all duration-300 ${client.createAccount ? 'bg-[#3A9AFF]' : 'bg-slate-700'}`}></div>
                                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${client.createAccount ? 'left-8' : 'left-1'}`}></div>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-black text-white uppercase tracking-tight">Créer un profil client</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Pour suivre vos locations et profiter d'offres exclusives</p>
                                            </div>
                                        </label>
                                        {client.createAccount && (
                                            <div className="mt-8 space-y-4 animate-scale-in">
                                                <div className="h-px bg-[#3A9AFF]/20 w-full mb-6"></div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Choisir un mot de passe</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                    <input
                                                        type="password"
                                                        value={client.password}
                                                        onChange={(e) => setClient({ ...client, password: e.target.value })}
                                                        className="w-full bg-[#0B0F19] border border-[#3A9AFF]/30 text-white rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
                                                        placeholder="6 caractères minimum"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-8 py-5 border border-[#1F2A3D] text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#1F2A3D] hover:text-white transition-all"
                                    >
                                        Précédent
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!client.firstName || !client.lastName || !client.email || !client.phone) {
                                                toast.error('Veuillez remplir tous les champs obligatoires.');
                                                return;
                                            }
                                            if (!isLoggedIn && client.createAccount && (!client.password || client.password.length < 6)) {
                                                toast.error('Le mot de passe doit faire au moins 6 caractères.');
                                                return;
                                            }
                                            handleSubmitBooking();
                                        }}
                                        disabled={loading}
                                        className="flex-1 py-5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl hover:scale-[1.02] shadow-2xl shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                                    >
                                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</> : 'Finaliser ma Réservation'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-12 text-center space-y-8 shadow-2xl animate-scale-in">
                                <div className="w-24 h-24 mx-auto relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse"></div>
                                    <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl">
                                        <CheckCircle className="w-12 h-12" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                        Demande <span className="text-emerald-500">Enregistrée</span> !
                                    </h2>
                                    <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
                                        Merci <strong className="text-white">{client.firstName}</strong> ! Votre demande de réservation pour la <strong className="text-white">{booking.vehicle}</strong> a été transmise à notre équipe.
                                    </p>
                                </div>

                                <div className="bg-[#0B0F19] rounded-3xl p-8 border border-[#1F2A3D] text-left space-y-6 max-w-md mx-auto">
                                    <h3 className="text-xs font-black text-[var(--color-primary)] uppercase tracking-widest border-b border-[#1F2A3D] pb-4">Et après ?</h3>
                                    <div className="space-y-6">
                                        {[
                                            { t: 'Vérification', d: 'Un conseiller valide vos dates et la disponibilité.', c: 'bg-blue-500' },
                                            { t: 'Confirmation', d: 'Vous recevrez un email de confirmation définitive.', c: 'bg-emerald-500' },
                                            { t: 'Livraison', d: 'Préparez votre CIN et permis pour le jour J.', c: 'bg-amber-500' }
                                        ].map((step, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className={`w-1 h-10 ${step.c} rounded-full`}></div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{step.t}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{step.d}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                    <Link
                                        to="/"
                                        className="px-10 py-4 border border-[#1F2A3D] text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#1F2A3D] hover:text-white transition-all"
                                    >
                                        Accueil
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="px-10 py-4 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-500/20"
                                    >
                                        Mes Réservations
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar — Booking Summary */}
                    <div className="lg:col-span-1 animate-slide-up opacity-0 delay-600">
                        <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-8 sticky top-28 space-y-8 shadow-2xl group overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50"></div>

                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Car className="w-4 h-4 text-[var(--color-primary)]" /> Votre Sélection
                            </h3>

                            <div className="space-y-6">
                                <div className="relative h-40 bg-[#0B0F19] rounded-2xl overflow-hidden border border-[#1F2A3D] group-hover:border-[var(--color-primary)]/30 transition-all">
                                    <img src={booking.image_url} alt="Vehicle" className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{booking.vehicle}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                        <Shield className="w-3 h-3 text-[var(--color-primary)]" /> Flotte Premium TRM
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-[#1F2A3D] pt-6">
                                <div className="flex justify-between items-start text-xs">
                                    <span className="text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Lieu</span>
                                    <span className="text-white font-bold text-right">{booking.pickup}</span>
                                </div>
                                {booking.startDate && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Période</span>
                                            <span className="text-white font-bold">{totalDays} jour{totalDays > 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#1F2A3D]">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Retrait</p>
                                                <p className="text-[11px] text-white font-black">{new Date(booking.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#1F2A3D]">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Retour</p>
                                                <p className="text-[11px] text-white font-black">{new Date(booking.endDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {totalDays > 0 && (
                                <div className="border-t border-[#1F2A3D] pt-6 space-y-4">
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                        <span>Tarif Journalier</span>
                                        <span className="text-white">{booking.pricePerDay} MAD</span>
                                    </div>
                                    {booking.childSeat && (
                                        <div className="flex justify-between text-xs font-bold text-slate-400">
                                            <span>Option Siège Enfant</span>
                                            <span className="text-white">{childSeatTotal} MAD</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                        <span>Assurance</span>
                                        <span className="text-emerald-500 uppercase tracking-widest">Inclus</span>
                                    </div>

                                    <div className="bg-[#0B0F19] p-6 rounded-2xl border border-[var(--color-primary)]/20 shadow-inner">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Total</span>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-[var(--color-primary)] tracking-tighter leading-none">{totalPrice} MAD</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">TVA Incluse</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl">
                                <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Garantie & Sérénité TRM</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
