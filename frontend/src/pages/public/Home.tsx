import { Car, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function Home() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-32">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)]" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                        L'excellence de la
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mt-2">
                            Route s'offre à vous.
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-xl text-slate-300 mx-auto mb-10">
                        TRM Rent Car vous propose une flotte de véhicules fiables et économiques pour vos déplacements professionnels ou personnels.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 rounded-xl font-bold text-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer">
                            Réserver Maintenant
                        </button>
                        <button className="px-8 py-4 bg-[var(--color-surface-light)] hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-colors cursor-pointer">
                            Voir la Flotte
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-[var(--color-surface)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Pourquoi choisir TRM Rent Car ?</h2>
                        <p className="text-slate-400">Des services pensés pour votre confort et votre sécurité.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="bg-[var(--color-background)] p-8 rounded-2xl border border-[var(--color-surface-light)] hover:-translate-y-2 transition-transform duration-300">
                            <Car className="h-12 w-12 text-[var(--color-primary)] mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Flotte Récente</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Des véhicules économiques, parfaitement entretenus et équipés pour un confort optimal à petit prix.
                            </p>
                        </div>

                        <div className="bg-[var(--color-background)] p-8 rounded-2xl border border-[var(--color-surface-light)] hover:-translate-y-2 transition-transform duration-300">
                            <ShieldCheck className="h-12 w-12 text-[var(--color-primary)] mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Assurance Tous Risques</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Garantie et assistance 24/7. Roulez l'esprit libre avec notre couverture complète.
                            </p>
                        </div>

                        <div className="bg-[var(--color-background)] p-8 rounded-2xl border border-[var(--color-surface-light)] hover:-translate-y-2 transition-transform duration-300">
                            <Clock className="h-12 w-12 text-[var(--color-primary)] mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Flexibilité</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Réservation facile, modification ou annulation souple selon vos besoins.
                            </p>
                        </div>

                        <div className="bg-[var(--color-background)] p-8 rounded-2xl border border-[var(--color-surface-light)] hover:-translate-y-2 transition-transform duration-300">
                            <MapPin className="h-12 w-12 text-[var(--color-primary)] mb-6" />
                            <h3 className="text-xl font-bold text-white mb-3">Livraison</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Possibilité de livraison du véhicule à l'aéroport ou à votre hôtel (sur demande).
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
