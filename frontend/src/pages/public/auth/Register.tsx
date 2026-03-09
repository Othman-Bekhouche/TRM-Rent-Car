import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, CheckCircle } from 'lucide-react';

export default function Register() {
    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface)] z-0" />
            <div className="absolute bottom-0 left-0 -ml-48 -mb-48 w-96 h-96 bg-[var(--color-primary)] opacity-5 blur-[100px] rounded-full z-0 pointer-events-none" />
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-80 h-80 bg-blue-600 opacity-5 blur-[80px] rounded-full z-0 pointer-events-none" />

            <div className="max-w-xl w-full space-y-8 bg-[var(--color-surface)] p-10 rounded-3xl border border-[var(--color-border)] shadow-2xl relative z-10">

                <div>
                    <Link to="/" className="inline-flex items-center text-slate-400 hover:text-[var(--color-primary)] transition-colors mb-4 text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Retour
                    </Link>
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/20">
                            <UserPlus className="w-8 h-8 text-[var(--color-primary)]" />
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-black text-white uppercase tracking-tight">
                        Créer un compte
                    </h2>
                    <p className="mt-3 text-center text-sm text-slate-400">
                        Rejoignez <span className="text-[var(--color-primary)] font-bold">TRM Rent Car</span> pour réserver votre véhicule premium
                    </p>
                </div>

                {/* Benefits */}
                <div className="flex flex-wrap justify-center gap-3">
                    {['Réservation rapide', 'Tarifs exclusifs', 'Historique complet'].map((b, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-[var(--color-background)] border border-[var(--color-border)] px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-[var(--color-primary)]" /> {b}
                        </span>
                    ))}
                </div>

                <form className="mt-6 space-y-5">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prénom <span className="text-[var(--color-primary)]">*</span></label>
                                <input id="first-name" type="text" required className="appearance-none block w-full px-4 py-3.5 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors" placeholder="Prénom" />
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom <span className="text-[var(--color-primary)]">*</span></label>
                                <input id="last-name" type="text" required className="appearance-none block w-full px-4 py-3.5 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors" placeholder="Nom de famille" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="register-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse Email <span className="text-[var(--color-primary)]">*</span></label>
                            <input id="register-email" type="email" required className="appearance-none block w-full px-4 py-3.5 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors" placeholder="vous@exemple.com" />
                        </div>

                        <div>
                            <label htmlFor="register-phone" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Numéro de Téléphone <span className="text-[var(--color-primary)]">*</span></label>
                            <input id="register-phone" type="tel" required className="appearance-none block w-full px-4 py-3.5 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors" placeholder="+212 6..." />
                        </div>

                        <div>
                            <label htmlFor="register-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mot de passe <span className="text-[var(--color-primary)]">*</span></label>
                            <input id="register-password" type="password" required className="appearance-none block w-full px-4 py-3.5 border border-[var(--color-border)] bg-[var(--color-background)] placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm transition-colors" placeholder="Min. 8 caractères" />
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="terms" type="checkbox" required className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] rounded bg-transparent" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-slate-400">
                                J'accepte les <a href="#" className="font-bold text-[var(--color-primary)] hover:underline">Conditions d'utilisation</a> et la <a href="#" className="font-bold text-[var(--color-primary)] hover:underline">Politique de confidentialité</a>.
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            className="group w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-xl text-[#0B0F19] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-background)] transition-all shadow-lg hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)]"
                        >
                            Créer mon compte
                        </button>
                    </div>
                </form>

                <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                    <span className="text-xs text-slate-500">OU</span>
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                </div>

                <div className="text-center text-sm text-slate-400">
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="font-black text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] uppercase tracking-wider">
                        Se connecter
                    </Link>
                </div>

                {/* Trust Badge */}
                <div className="text-center pt-2">
                    <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <Shield className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        Données protégées · Paiement 100% sécurisé
                    </p>
                </div>
            </div>
        </div>
    );
}
