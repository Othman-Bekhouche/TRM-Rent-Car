import { Link, useParams } from 'react-router-dom';
import { Calendar, CheckCircle2, Shield, ArrowLeft } from 'lucide-react';

export default function VehicleDetail() {
    useParams();

    // Dans un cas réel, nous ferions un fetch Supabase ici selon l'ID.
    // Affichage factice pour le UI/UX

    return (
        <div className="pb-24">
            {/* Hero Image Section */}
            <div className="relative h-[50vh] min-h-[400px] w-full bg-slate-900 border-b border-[var(--color-surface-light)]">
                <img
                    src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80"
                    alt="Dacia Logan"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent" />

                <div className="absolute top-8 left-8">
                    <Link to="/vehicles" className="flex items-center px-4 py-2 bg-slate-900/60 backdrop-blur-md rounded-lg text-white hover:bg-[var(--color-primary)] hover:text-slate-900 transition-colors border border-slate-700 border-opacity-50 font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Retour à la flotte
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-2 drop-shadow-xl">Dacia</h1>
                        <h2 className="text-3xl text-[var(--color-primary)] font-medium drop-shadow-lg">Logan</h2>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Details Column */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h3 className="text-2xl font-bold text-white mb-6 border-b border-[var(--color-surface-light)] pb-4">Caractéristiques</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-surface-light)] text-center">
                                    <p className="text-slate-400 text-sm mb-1">Transmission</p>
                                    <p className="text-white font-semibold">Manuelle</p>
                                </div>
                                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-surface-light)] text-center">
                                    <p className="text-slate-400 text-sm mb-1">Carburant</p>
                                    <p className="text-white font-semibold">Diesel</p>
                                </div>
                                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-surface-light)] text-center">
                                    <p className="text-slate-400 text-sm mb-1">Places</p>
                                    <p className="text-white font-semibold">5</p>
                                </div>
                                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-surface-light)] text-center">
                                    <p className="text-slate-400 text-sm mb-1">Année</p>
                                    <p className="text-white font-semibold">2026</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold text-white mb-6 border-b border-[var(--color-surface-light)] pb-4">Description</h3>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                Le choix économique par excellence. La nouvelle Dacia Logan 2026 offre un espace généreux, une consommation de carburant très faible et un confort optimal pour vos trajets en ville comme sur autoroute.
                                Vivez une expérience de conduite sereine et économique avec une fiabilité à toute épreuve.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold text-white mb-6 border-b border-[var(--color-surface-light)] pb-4">Inclus dans la location</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <li className="flex items-center text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                                    Assurance Tous Risques
                                </li>
                                <li className="flex items-center text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                                    Assistance 24/7
                                </li>
                                <li className="flex items-center text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                                    Nettoyage Complet Inclus
                                </li>
                                <li className="flex items-center text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                                    Kilométrage: 250 km / jour
                                </li>
                            </ul>
                        </section>
                    </div>

                    {/* Booking Widget Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-surface-light)] shadow-2xl sticky top-32">
                            <div className="mb-6 pb-6 border-b border-[var(--color-surface-light)]">
                                <p className="text-slate-400 text-sm mb-2">Tarif Journalier</p>
                                <div className="flex items-baseline text-white">
                                    <span className="text-4xl font-bold">300</span>
                                    <span className="text-xl ml-2">MAD</span>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-amber-500/80 bg-amber-500/10 p-3 rounded-lg">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Caution exigée: 5 000 MAD
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Date de départ</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input type="date" className="w-full bg-[var(--color-background)] border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Date de retour</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input type="date" className="w-full bg-[var(--color-background)] border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]" />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Link to="/login" className="block w-full text-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer text-lg">
                                        Réserver ce véhicule
                                    </Link>
                                    <p className="text-center text-xs text-slate-500 mt-4">
                                        Vous ne serez pas débité immédiatement. Une connexion est requise.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
