import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async (sessionUser: any) => {
            if (!sessionUser) {
                setProfile(null);
                return;
            }
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', sessionUser.id)
                .single();
            setProfile(data);
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            fetchProfile(session?.user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            fetchProfile(session?.user);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav className="bg-[#0B0F19]/80 backdrop-blur-xl border-b border-[#1F2A3D] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 md:h-24">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center group relative">
                            <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                            <img src="/trm-logo-pour-arriere-noir.png" alt="TRM Rent Car" className="h-16 md:h-20 w-auto object-contain relative z-10 animate-slide-right transition-transform group-hover:scale-110 duration-500" />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-slate-300 hover:text-white transition-colors">Accueil</Link>
                        <Link to="/vehicles" className="text-slate-300 hover:text-white transition-colors">Flotte</Link>
                        <Link to="/about" className="text-slate-300 hover:text-white transition-colors">À Propos</Link>
                        <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>

                        <div className="flex items-center gap-4 ml-4">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-400 text-sm hidden lg:inline">{user.email}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-slate-300 hover:text-red-400 font-medium transition-colors"
                                    >
                                        Déconnexion
                                    </button>
                                    {profile && ['super_admin', 'admin', 'assistant'].includes(profile.role) && (
                                        <Link
                                            to="/admin"
                                            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(244,63,94,0.3)]"
                                        >
                                            Administration
                                        </Link>
                                    )}
                                    <Link to="/profile" className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white transition-all" title="Mon Profil">
                                        <User className="w-5 h-5" />
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                                        Connexion
                                    </Link>
                                    <Link to="/register" className="bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] hover:from-[#1C0770] hover:to-[#261CC1] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_15px_rgba(58,154,255,0.3)] hover:shadow-[0_6px_20px_rgba(58,154,255,0.5)]">
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-300 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-gradient-to-b from-[#0B0F19] to-[#121826] border-b border-[#1F2A3D] animate-fade-in">
                    <div className="px-6 pt-2 pb-8 space-y-2">
                        <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span> Accueil
                        </Link>
                        <Link to="/vehicles" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span> Flotte
                        </Link>
                        <Link to="/about" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span> À Propos
                        </Link>
                        <Link to="/contact" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span> Contact
                        </Link>

                        <div className="mt-6 pt-6 border-t border-[#1F2A3D] flex flex-col gap-4">
                            {user ? (
                                <>
                                    <div className="px-4 py-2 text-slate-500 text-xs font-bold uppercase tracking-widest">{user.email}</div>
                                    {profile && ['super_admin', 'admin', 'assistant'].includes(profile.role) && (
                                        <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 py-3 bg-rose-500 text-white font-black rounded-xl active:scale-95 transition-all uppercase tracking-widest">
                                            Administration
                                        </Link>
                                    )}
                                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 py-3 bg-slate-800 text-white font-bold rounded-xl active:scale-95 transition-all">
                                        <User className="w-4 h-4" /> Mon Profil
                                    </Link>
                                    <button onClick={handleLogout} className="py-3 text-rose-500 font-bold hover:bg-rose-500/5 rounded-xl transition-all">
                                        Déconnexion
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-3 text-slate-300 hover:text-white border border-slate-700 rounded-xl font-bold active:scale-95 transition-all">
                                        Connexion
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-3 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
