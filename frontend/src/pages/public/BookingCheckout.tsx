import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Car, User, Mail, Phone, CheckCircle, Shield, Loader2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function BookingCheckout() {
    const [step, setStep] = useState(1); // 1: recap, 2: info client, 3: confirmation
    const [loading, setLoading] = useState(false);

    // Booking data (from URL/state or localStorage in a real app — using mock for now)
    const [booking, setBooking] = useState({
        vehicle: 'Peugeot 208 Noir',
        plate: '208-A-001',
        pricePerDay: 420,
        deposit: 5000,
        pickup: 'Agence Taourirt (Siège)',
        startDate: '',
        endDate: '',
        childSeat: false,
    });

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

    const totalDays = booking.startDate && booking.endDate
        ? Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    const childSeatTotal = booking.childSeat ? 50 * totalDays : 0;
    const totalPrice = (booking.pricePerDay * totalDays) + childSeatTotal;

    const handleSubmitBooking = async () => {
        setLoading(true);
        try {
            // 1. Create customer record
            const { data: customerData, error: custErr } = await supabase
                .from('customers')
                .insert({
                    full_name: `${client.firstName} ${client.lastName}`,
                    email: client.email,
                    phone: client.phone,
                    cin: client.cin || null,
                    address: client.address || null,
                    city: client.city || null,
                    status: 'Nouveau',
                    total_reservations: 1,
                    total_spent: totalPrice,
                })
                .select()
                .single();

            if (custErr) throw custErr;

            // 2. Find the vehicle by plate/name
            const { data: vehicleData } = await supabase
                .from('vehicles')
                .select('id')
                .eq('plate_number', booking.plate)
                .single();

            // 3. Create reservation
            const { error: resErr } = await supabase
                .from('reservations')
                .insert({
                    customer_id: customerData.id,
                    vehicle_id: vehicleData?.id || null,
                    start_date: booking.startDate,
                    end_date: booking.endDate,
                    pickup_location: booking.pickup,
                    return_location: booking.pickup,
                    total_price: totalPrice,
                    status: 'pending',
                    payment_status: 'unpaid',
                    notes: booking.childSeat ? 'Siège enfant demandé' : null,
                });

            if (resErr) throw resErr;

            // 4. If user wants account, create auth user
            if (client.createAccount && client.password) {
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

            // Move to confirmation step
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
                <div className="mb-8">
                    <Link to="/vehicles" className="inline-flex items-center text-slate-400 hover:text-[var(--color-primary)] transition text-sm font-medium group mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Retour à la flotte
                    </Link>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                        Réserver votre <span className="text-[var(--color-primary)]">véhicule</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Remplissez les informations ci-dessous pour compléter votre réservation</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-0 mb-10">
                    {[
                        { n: 1, label: 'Dates & Options' },
                        { n: 2, label: 'Vos Informations' },
                        { n: 3, label: 'Confirmation' },
                    ].map((s, i) => (
                        <div key={i} className="flex-1 flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-colors ${step >= s.n ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)] text-slate-500'}`}>
                                {step > s.n ? <CheckCircle className="w-5 h-5" /> : s.n}
                            </div>
                            <span className={`ml-3 text-xs font-bold uppercase tracking-wider ${step >= s.n ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
                            {i < 2 && <div className={`flex-1 h-0.5 mx-4 ${step > s.n ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Dates & Options */}
                        {step === 1 && (
                            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 space-y-6">
                                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-[var(--color-primary)]" /> Dates & Options
                                </h2>

                                <div className="bg-[var(--color-background)] rounded-xl p-6 border border-[var(--color-border)] space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lieu de retrait</label>
                                        <select
                                            value={booking.pickup}
                                            onChange={(e) => setBooking({ ...booking, pickup: e.target.value })}
                                            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                        >
                                            <option>Agence Taourirt (Siège)</option>
                                            <option>Livraison Oujda</option>
                                            <option>Livraison Nador</option>
                                            <option>Livraison Fès</option>
                                            <option>Livraison Berkane</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date de retrait</label>
                                            <input
                                                type="date"
                                                value={booking.startDate}
                                                onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                                                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date de retour</label>
                                            <input
                                                type="date"
                                                value={booking.endDate}
                                                onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                                                min={booking.startDate}
                                                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3 pt-2">
                                        <label className="flex items-center p-3 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)]/5 cursor-default">
                                            <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                                            <span className="ml-3 text-sm font-bold text-white">Assurance Multirisque</span>
                                            <span className="ml-auto text-xs font-bold text-[var(--color-primary)]">INCLUS</span>
                                        </label>
                                        <label className="flex items-center p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-background)] cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={booking.childSeat}
                                                onChange={(e) => setBooking({ ...booking, childSeat: e.target.checked })}
                                                className="w-4 h-4 text-[var(--color-primary)] bg-[#141C2B] border-slate-600 rounded focus:ring-[var(--color-primary)]"
                                            />
                                            <span className="ml-3 text-sm font-medium text-slate-300">Siège Enfant</span>
                                            <span className="ml-auto text-xs font-bold text-slate-400">+50 MAD/J</span>
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
                                    className="w-full py-4 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-black uppercase tracking-widest text-sm rounded-xl hover:from-[#1C0770] hover:to-[#261CC1] transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Continuer
                                </button>
                            </div>
                        )}

                        {/* Step 2: Client Info */}
                        {step === 2 && (
                            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 space-y-6">
                                <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                    <User className="w-5 h-5 text-[var(--color-primary)]" /> Vos Informations
                                </h2>

                                <div className="bg-[var(--color-background)]/50 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-[var(--color-primary)] mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-300">
                                        <strong className="text-white">Pas besoin de compte</strong> pour réserver ! Remplissez simplement vos coordonnées ci-dessous. Vous pouvez créer un compte en option pour suivre vos réservations.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prénom *</label>
                                            <input
                                                type="text" required
                                                value={client.firstName}
                                                onChange={(e) => setClient({ ...client, firstName: e.target.value })}
                                                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                placeholder="Votre prénom"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom *</label>
                                            <input
                                                type="text" required
                                                value={client.lastName}
                                                onChange={(e) => setClient({ ...client, lastName: e.target.value })}
                                                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"><Mail className="w-3 h-3 inline mr-1" /> Email *</label>
                                        <input
                                            type="email" required
                                            value={client.email}
                                            onChange={(e) => setClient({ ...client, email: e.target.value })}
                                            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                            placeholder="vous@exemple.com"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"><Phone className="w-3 h-3 inline mr-1" /> Téléphone *</label>
                                            <input
                                                type="tel" required
                                                value={client.phone}
                                                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                                                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                placeholder="+212 6..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CIN / Passeport</label>
                                            <input
                                                type="text"
                                                value={client.cin}
                                                onChange={(e) => setClient({ ...client, cin: e.target.value })}
                                                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                placeholder="BH123456"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse</label>
                                            <input
                                                type="text"
                                                value={client.address}
                                                onChange={(e) => setClient({ ...client, address: e.target.value })}
                                                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                placeholder="Votre adresse"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ville</label>
                                            <input
                                                type="text"
                                                value={client.city}
                                                onChange={(e) => setClient({ ...client, city: e.target.value })}
                                                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                placeholder="Taourirt"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Create Account Section */}
                                <div className="border border-[var(--color-border)] rounded-xl p-5 bg-[var(--color-background)]/30">
                                    <label className="flex items-center cursor-pointer mb-3">
                                        <input
                                            type="checkbox"
                                            checked={client.createAccount}
                                            onChange={(e) => setClient({ ...client, createAccount: e.target.checked })}
                                            className="w-4 h-4 text-[var(--color-primary)] bg-[#141C2B] border-slate-600 rounded focus:ring-[var(--color-primary)]"
                                        />
                                        <span className="ml-3 text-sm font-bold text-white">Créer un compte pour suivre mes réservations</span>
                                    </label>
                                    {client.createAccount && (
                                        <div className="mt-3">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
                                            <input
                                                type="password"
                                                value={client.password}
                                                onChange={(e) => setClient({ ...client, password: e.target.value })}
                                                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                                placeholder="Min. 6 caractères"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-4 border border-[var(--color-border)] text-slate-300 font-bold rounded-xl text-sm hover:bg-[var(--color-background)] transition-colors"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!client.firstName || !client.lastName || !client.email || !client.phone) {
                                                toast.error('Veuillez remplir tous les champs obligatoires.');
                                                return;
                                            }
                                            if (client.createAccount && (!client.password || client.password.length < 6)) {
                                                toast.error('Le mot de passe doit faire au moins 6 caractères.');
                                                return;
                                            }
                                            handleSubmitBooking();
                                        }}
                                        disabled={loading}
                                        className="flex-1 py-4 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-black uppercase tracking-widest text-sm rounded-xl hover:from-[#1C0770] hover:to-[#261CC1] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</> : 'Confirmer la réservation'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-10 text-center space-y-6">
                                <div className="w-20 h-20 mx-auto bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                    Réservation envoyée !
                                </h2>
                                <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
                                    Merci <strong className="text-white">{client.firstName}</strong> pour votre confiance ! Votre demande de réservation a été enregistrée.
                                </p>

                                <div className="bg-[var(--color-background)] rounded-xl p-6 border border-[var(--color-border)] text-left space-y-3 max-w-md mx-auto">
                                    <h3 className="text-sm font-black text-[var(--color-primary)] uppercase tracking-wider mb-4">Prochaines étapes</h3>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5">1</div>
                                        <p className="text-sm text-slate-300">
                                            <strong className="text-white">Email de confirmation</strong> — Un email de remerciement a été envoyé à <span className="text-[var(--color-primary)]">{client.email}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5">2</div>
                                        <p className="text-sm text-slate-300">
                                            <strong className="text-white">Validation par notre équipe</strong> — Un gestionnaire va confirmer votre réservation. Vous recevrez un email de confirmation définitive.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5">3</div>
                                        <p className="text-sm text-slate-300">
                                            <strong className="text-white">Rappel 2 jours avant</strong> — Si votre location est dans plus de 3 jours, nous vous enverrons un rappel par email.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 justify-center pt-4">
                                    <Link
                                        to="/"
                                        className="px-8 py-3 border border-[var(--color-border)] text-slate-300 rounded-xl text-sm font-bold hover:bg-[var(--color-background)] transition-colors"
                                    >
                                        Retour à l'accueil
                                    </Link>
                                    <Link
                                        to="/vehicles"
                                        className="px-8 py-3 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white rounded-xl text-sm font-black uppercase tracking-wider"
                                    >
                                        Voir la flotte
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar — Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sticky top-24 space-y-5">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Car className="w-4 h-4 text-[var(--color-primary)]" /> Récapitulatif
                            </h3>

                            <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
                                <img src="/images/cars/peugeot_208_noir.png" alt="Vehicle" className="w-20 h-14 object-contain" />
                                <div>
                                    <p className="text-white font-bold text-sm">{booking.vehicle}</p>
                                    <p className="text-xs text-slate-400 font-mono">{booking.plate}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Retrait</span>
                                    <span className="text-white font-medium text-xs text-right">{booking.pickup}</span>
                                </div>
                                {booking.startDate && (
                                    <div className="flex justify-between text-slate-400">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Dates</span>
                                        <span className="text-white font-medium text-xs">{booking.startDate} → {booking.endDate}</span>
                                    </div>
                                )}
                                {totalDays > 0 && (
                                    <div className="flex justify-between text-slate-400">
                                        <span>Durée</span>
                                        <span className="text-white font-bold">{totalDays} jour{totalDays > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>

                            {totalDays > 0 && (
                                <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>{booking.pricePerDay} MAD × {totalDays} jours</span>
                                        <span className="text-white">{booking.pricePerDay * totalDays} MAD</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Assurance Multirisque</span>
                                        <span className="text-[var(--color-primary)] font-bold">Inclus</span>
                                    </div>
                                    {booking.childSeat && (
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Siège Enfant ({totalDays}j)</span>
                                            <span className="text-white">{childSeatTotal} MAD</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Caution (récupérable)</span>
                                        <span className="text-white">{booking.deposit} MAD</span>
                                    </div>
                                    <div className="flex justify-between font-black text-lg pt-3 border-t border-[var(--color-border)]">
                                        <span className="text-white">Total</span>
                                        <span className="text-[var(--color-primary)]">{totalPrice} MAD</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center text-xs text-slate-500 font-medium pt-2">
                                <Shield className="w-3.5 h-3.5 mr-2 text-[var(--color-primary)]" />
                                Paiement sécurisé ou à la livraison
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
