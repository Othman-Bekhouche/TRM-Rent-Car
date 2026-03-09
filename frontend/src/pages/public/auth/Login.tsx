import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { authApi } from '../../../lib/api';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authApi.signIn(email, password);
            toast.success('Connexion réussie ! Redirection...', {
                style: {
                    background: '#1F2937',
                    color: '#fff',
                    border: '1px solid #3A9AFF'
                }
            });
            setTimeout(() => {
                navigate('/admin');
            }, 1000);
        } catch {
            toast.error('Identifiants incorrects.', {
                style: {
                    background: '#1F2937',
                    color: '#fff',
                    border: '1px solid #ef4444'
                }
            });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Toaster position="top-center" />
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-background)] to-[var(--color-surface)] z-0" />
            <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 bg-[var(--color-primary)] opacity-5 blur-[100px] rounded-full z-0 pointer-events-none" />

            <div className="max-w-md w-full space-y-8 bg-[var(--color-surface)] p-10 rounded-3xl border border-[var(--color-border)] shadow-2xl relative z-10">

                <div>
                    <Link to="/" className="inline-flex items-center text-slate-400 hover:text-[var(--color-primary)] transition-colors mb-4 text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Retour
                    </Link>
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/20">
                            <KeyRound className="w-8 h-8 text-[var(--color-primary)]" />
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-black text-white uppercase tracking-tight">
                        Espace Client
                    </h2>
                    <p className="mt-3 text-center text-sm text-slate-400">
                        Connectez-vous pour gérer vos réservations
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-4 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors"
                                placeholder="vous@exemple.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-4 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors"
                                placeholder="Mot de passe"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded bg-transparent"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300 cursor-pointer">
                                Se souvenir de moi
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                                Mot de passe oublié ?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-xl text-white bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] hover:from-[#1C0770] hover:to-[#261CC1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-background)] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se Connecter'}
                        </button>
                    </div>
                </form>

                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                    <span className="text-xs text-slate-500">OU</span>
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                </div>

                <div className="text-center text-sm text-slate-400">
                    Vous n'avez pas de compte ?{' '}
                    <Link to="/register" className="font-black text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] uppercase tracking-wider">
                        Créer un compte
                    </Link>
                </div>
            </div>
        </div>
    );
}
