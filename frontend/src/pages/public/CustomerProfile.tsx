import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Clock, CreditCard, ChevronRight, Package, Bell, LogOut, Settings, FileText, FileCheck, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function CustomerProfile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('reservations');
    const [reservations, setReservations] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) {
                    navigate('/login');
                    return;
                }
                setUser(authUser);

                // Fetch customer record(s) to get full info and reservations (with all documents)
                // Case-insensitive match for email. Select all in case of duplicates.
                const { data: customers, error: custError } = await supabase
                    .from('customers')
                    .select('*, reservations(*, vehicles(*, vehicle_images(*)), contracts:rental_contracts(*), invoices(*))')
                    .ilike('email', authUser.email || '');

                if (custError) throw custError;

                if (customers && customers.length > 0) {
                    // Combine all reservations from all matching customer records (in case of duplicates)
                    const allReservations = customers.flatMap(c => c.reservations || []);

                    // Sort reservations by date desc
                    const sorted = allReservations.sort((a, b) =>
                        new Date(b.start_date || b.created_at).getTime() - new Date(a.start_date || a.created_at).getTime()
                    );
                    setReservations(sorted);
                }
            } catch (err: any) {
                console.error("Error loading profile:", err);
                toast.error("Erreur lors du chargement de vos données.");
            } finally {
                setLoading(false);
            }
        };
        loadProfileData();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-[#0B0F19]">
                <Loader2 className="w-12 h-12 animate-spin text-[#3A9AFF]" />
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'rented': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'Confirmée';
            case 'pending': return 'En attente';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            case 'rented': return 'En cours';
            default: return status;
        }
    };

    return (
        <div className="bg-[#0B0F19] min-h-screen py-12 px-4 sm:px-8">
            <Toaster position="top-center" />
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 space-y-6">
                        <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] overflow-hidden">
                            <div className="p-8 text-center bg-gradient-to-b from-[#1F2A3D]/50 to-transparent">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#261CC1] to-[#3A9AFF] rounded-full flex items-center justify-center text-3xl font-black text-white mb-4 shadow-2xl shadow-blue-500/20">
                                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                                </div>
                                <h2 className="text-xl font-black text-white tracking-tight">{user?.user_metadata?.full_name || 'Utilisateur'}</h2>
                                <p className="text-slate-400 text-sm">{user?.email}</p>
                            </div>

                            <nav className="p-4 space-y-1">
                                <button
                                    onClick={() => setActiveTab('reservations')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'reservations' ? 'bg-[#3A9AFF] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-[#1C2539] hover:text-white'}`}
                                >
                                    <Package className="w-5 h-5" /> Mes Réservations
                                </button>
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'info' ? 'bg-[#3A9AFF] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-[#1C2539] hover:text-white'}`}
                                >
                                    <User className="w-5 h-5" /> Informations
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-[#3A9AFF] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-[#1C2539] hover:text-white'}`}
                                >
                                    <Settings className="w-5 h-5" /> Paramètres
                                </button>
                                <div className="h-px bg-[#1F2A3D] my-4 mx-4"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
                                >
                                    <LogOut className="w-5 h-5" /> Déconnexion
                                </button>
                            </nav>
                        </div>

                        <div className="bg-gradient-to-br from-[#1C0770] to-[#261CC1] rounded-3xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <h3 className="font-black text-lg uppercase tracking-wider mb-2">Besoin d'aide ?</h3>
                            <p className="text-white/70 text-sm leading-relaxed mb-6">Notre équipe est disponible 24/7 pour vous accompagner dans vos locations.</p>
                            <Link to="/contact" className="inline-flex items-center text-sm font-black uppercase tracking-widest text-[#3A9AFF] bg-white px-6 py-3 rounded-xl hover:bg-slate-100 transition-all">
                                Nous Contacter
                            </Link>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-6">

                        {activeTab === 'reservations' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Mes <span className="text-[#3A9AFF]">Réservations</span></h1>
                                    <div className="p-2 bg-[#121826] border border-[#1F2A3D] rounded-xl">
                                        <Bell className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>

                                {reservations.length === 0 ? (
                                    <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-12 text-center space-y-4">
                                        <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-4">
                                            <Package className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Aucune réservation pour le moment</h2>
                                        <p className="text-slate-400 text-sm max-w-xs mx-auto">Explorez notre flotte premium et réservez votre prochain véhicule dès maintenant.</p>
                                        <Link to="/vehicles" className="inline-block px-8 py-3 bg-[#3A9AFF] text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-[#261CC1] transition-all">
                                            Voir la flotte
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {reservations.map((res: any) => (
                                            <div key={res.id} className="bg-[#121826] rounded-3xl border border-[#1F2A3D] overflow-hidden hover:border-[#3A9AFF]/30 transition-all group shadow-2xl">
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="w-full md:w-64 h-48 relative overflow-hidden">
                                                        <img
                                                            src={res.vehicles?.vehicle_images?.find((i: any) => i.is_cover)?.image_url || '/images/cars/default.png'}
                                                            alt={res.vehicles?.model}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                        <div className="absolute top-4 left-4">
                                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current ${getStatusStyle(res.status)}`}>
                                                                {getStatusLabel(res.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 p-8 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{res.vehicles?.brand} {res.vehicles?.model}</h3>
                                                                <span className="text-2xl font-black text-[#3A9AFF]">{res.total_price} MAD</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date de début</p>
                                                                    <p className="text-sm text-white font-bold">{new Date(res.start_date).toLocaleDateString()}</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date de fin</p>
                                                                    <p className="text-sm text-white font-bold">{new Date(res.end_date).toLocaleDateString()}</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Lieu de retrait</p>
                                                                    <p className="text-sm text-white font-bold">{res.pickup_location}</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Paiement</p>
                                                                    <p className="text-sm text-white font-bold">{res.payment_status === 'paid' ? 'Payé' : 'À régler'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 justify-between mt-6 border-t border-[#1F2A3D] pt-4">
                                                            <div className="flex gap-4">
                                                                {res.contracts && res.contracts.length > 0 && (
                                                                    <Link
                                                                        to={`/admin/reservations/${res.id}/print/contract?action=print`}
                                                                        target="_blank"
                                                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#3A9AFF] hover:text-white transition-all bg-[#3A9AFF]/10 px-4 py-2 rounded-lg"
                                                                    >
                                                                        <FileCheck className="w-3.5 h-3.5" /> Contrat de location
                                                                    </Link>
                                                                )}
                                                                {res.invoices && res.invoices.length > 0 && (
                                                                    <Link
                                                                        to={`/admin/reservations/${res.id}/print/invoice?action=print`}
                                                                        target="_blank"
                                                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-all bg-emerald-500/10 px-4 py-2 rounded-lg"
                                                                    >
                                                                        <FileText className="w-3.5 h-3.5" /> Facture
                                                                    </Link>
                                                                )}
                                                            </div>
                                                            <button className="flex items-center text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all group">
                                                                Détails <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Mes <span className="text-[#3A9AFF]">Informations</span></h1>
                                <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><User className="w-3.5 h-3.5" /> Nom complet</label>
                                            <div className="bg-[#0B0F19] border border-[#1F2A3D] p-4 rounded-2xl text-white font-medium">
                                                {user?.user_metadata?.full_name}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</label>
                                            <div className="bg-[#0B0F19] border border-[#1F2A3D] p-4 rounded-2xl text-white font-medium">
                                                {user?.email}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Téléphone</label>
                                            <div className="bg-[#0B0F19] border border-[#1F2A3D] p-4 rounded-2xl text-white font-medium">
                                                {user?.user_metadata?.phone || '+212 6...'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> CIN / Passeport</label>
                                            <div className="bg-[#0B0F19] border border-[#1F2A3D] p-4 rounded-2xl text-white font-medium">
                                                (Vérifié)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-[#3A9AFF]/5 border border-[#3A9AFF]/10 rounded-2xl">
                                        <p className="text-xs text-slate-400 leading-relaxed italic">Pour modifier vos informations personnelles ou ajouter des documents (CIN, Permis), veuillez contacter notre support pour des raisons de sécurité.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Paramètres <span className="text-[#3A9AFF]">Compte</span></h1>
                                <div className="bg-[#121826] rounded-3xl border border-[#1F2A3D] p-8 space-y-6">
                                    <div className="space-y-4">
                                        <article className="flex items-center justify-between p-6 bg-[#0B0F19] rounded-2xl border border-[#1F2A3D]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#3A9AFF]/10 rounded-xl flex items-center justify-center text-[#3A9AFF]">
                                                    <CreditCard className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">Notifications de sécurité</h4>
                                                    <p className="text-xs text-slate-500">Recevoir des alertes sur votre activité</p>
                                                </div>
                                            </div>
                                            <div className="w-12 h-6 bg-[#1F2A3D] rounded-full relative cursor-pointer">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-[#3A9AFF] rounded-full shadow-lg"></div>
                                            </div>
                                        </article>
                                        <article className="flex items-center justify-between p-6 bg-[#0B0F19] rounded-2xl border border-[#1F2A3D]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">Journal d'activité</h4>
                                                    <p className="text-xs text-slate-500">Historique des connexions</p>
                                                </div>
                                            </div>
                                            <button className="text-xs font-black uppercase tracking-widest text-[#3A9AFF] hover:underline">Consulter</button>
                                        </article>
                                    </div>
                                </div>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
}
