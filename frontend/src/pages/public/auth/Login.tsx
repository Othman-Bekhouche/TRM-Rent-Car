import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';

export default function Login() {
    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-background)] to-[var(--color-surface)] z-0" />
            <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 bg-[var(--color-primary)] opacity-5 blur-[100px] rounded-full z-0 pointer-events-none" />

            <div className="max-w-md w-full space-y-8 bg-[var(--color-surface)] p-10 rounded-3xl border border-[var(--color-border)] shadow-2xl relative z-10">

                <div>
                    <Link to="/" className="inline-flex items-center text-slate-400 hover:text-[var(--color-primary)] transition-colors mb-4 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                    </Link>
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-[var(--color-background)] rounded-full border border-[var(--color-border)]">
                            <KeyRound className="w-8 h-8 text-[var(--color-primary)]" />
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
                        Espace Client
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Connectez-vous pour gérer vos réservations
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Adresse Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-4 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:z-10 sm:text-sm transition-colors"
                                placeholder="Votre adresse email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-4 py-4 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:z-10 sm:text-sm transition-colors"
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
                            type="button"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-900 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-background)] transition-all shadow-lg shadow-amber-500/20"
                        >
                            Se Connecter
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Vous n'avez pas de compte ?{' '}
                    <Link to="/register" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                        Créer un compte
                    </Link>
                </div>
            </div>
        </div>
    );
}
