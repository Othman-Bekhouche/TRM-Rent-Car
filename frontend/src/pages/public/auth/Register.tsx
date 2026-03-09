import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function Register() {
    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface)] z-0" />
            <div className="absolute bottom-0 left-0 -ml-48 -mb-48 w-96 h-96 bg-[var(--color-primary)] opacity-5 blur-[100px] rounded-full z-0 pointer-events-none" />

            <div className="max-w-xl w-full space-y-8 bg-[var(--color-surface)] p-10 rounded-3xl border border-[var(--color-border)] shadow-2xl relative z-10">

                <div>
                    <Link to="/" className="inline-flex items-center text-slate-400 hover:text-[var(--color-primary)] transition-colors mb-4 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                    </Link>
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-[var(--color-background)] rounded-full border border-[var(--color-border)]">
                            <UserPlus className="w-8 h-8 text-[var(--color-primary)]" />
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
                        Créer un compte
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Rejoignez TRM Rent Car pour réserver votre véhicule premium
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="rounded-md space-y-4">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-medium text-slate-300 mb-2">Prénom <span className="text-[var(--color-primary)]">*</span></label>
                                <input
                                    id="first-name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-slate-600 bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors"
                                    placeholder="Jean"
                                />
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-sm font-medium text-slate-300 mb-2">Nom <span className="text-[var(--color-primary)]">*</span></label>
                                <input
                                    id="last-name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-slate-600 bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors"
                                    placeholder="Dupont"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Adresse Email <span className="text-[var(--color-primary)]">*</span></label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-600 bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors"
                                placeholder="jean.dupont@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Numéro de Téléphone <span className="text-[var(--color-primary)]">*</span></label>
                            <input
                                id="phone"
                                type="tel"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-600 bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors"
                                placeholder="+212 6..."
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Mot de passe <span className="text-[var(--color-primary)]">*</span></label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-slate-600 bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors"
                                placeholder="Min. 8 caractères"
                            />
                        </div>

                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded bg-transparent"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-slate-400">
                                J'accepte les <a href="#" className="font-medium text-[var(--color-primary)] hover:underline">Conditions d'utilisation</a> et la <a href="#" className="font-medium text-[var(--color-primary)] hover:underline">Politique de confidentialité</a>.
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-900 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-background)] transition-all shadow-lg shadow-amber-500/20"
                        >
                            Créer mon compte
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
}
