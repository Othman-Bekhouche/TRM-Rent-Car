import { ShieldCheck, Users, Award, Car, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const VALUES = [
    { icon: ShieldCheck, title: 'Sécurité Maximale', desc: 'Assurance multirisque incluse, véhicules récents et contrôlés avant chaque location.' },
    { icon: Users, title: 'Service Client 24/7', desc: 'Assistance téléphonique et WhatsApp disponible à tout moment, partout au Maroc.' },
    { icon: Award, title: 'Transparence Totale', desc: 'Aucun frais caché. Nos tarifs affichés incluent tout, sans surprises au comptoir.' },
    { icon: Clock, title: 'Flexibilité', desc: 'Livraison aéroport, hôtel ou bureau. Annulation et modification simplifiées.' },
];

const MILESTONES = [
    { number: '15+', label: 'Années d\'expérience' },
    { number: '7', label: 'Véhicules 2026' },
    { number: '100%', label: 'Satisfaction client' },
    { number: '24/7', label: 'Assistance' },
];

export default function About() {
    return (
        <div className="bg-[var(--color-background)]">
            {/* Hero */}
            <section className="relative py-28 border-b border-[var(--color-border)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-[#101828] to-[#161D2B]" />
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1503376710356-748af20b66b7?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-luminosity" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 mb-8">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                        <span className="text-sm font-bold text-[var(--color-primary)] tracking-wider uppercase">Depuis Taourirt, Maroc</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">
                        Qui sommes-<span className="text-[var(--color-primary)]">nous</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
                        Chez <span className="text-[var(--color-primary)] font-bold">TRM Rent Car</span>, nous redéfinissons les standards de la location de véhicules au Maroc. Plus qu'un simple déplacement : une expérience premium, abordable et sécurisée.
                    </p>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-[#141C2B] border-b border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--color-border)]">
                        {MILESTONES.map((m, i) => (
                            <div key={i} className="py-8 text-center">
                                <p className="text-4xl font-black text-[var(--color-primary)]">{m.number}</p>
                                <p className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-wider">{m.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">Notre <span className="text-[var(--color-primary)]">Histoire</span></h2>
                            <div className="w-16 h-1 bg-[var(--color-primary)] mb-8" />
                            <div className="space-y-6 text-lg text-slate-300 font-light leading-relaxed">
                                <p>
                                    Fondée à <strong className="text-white font-semibold">Taourirt</strong>, notre agence est née d'une passion pour l'automobile et d'un constat simple : offrir aux Marocains et aux visiteurs des véhicules modèles <strong className="text-[var(--color-primary)]">2026</strong>, fiables et à des prix transparents.
                                </p>
                                <p>
                                    Chaque véhicule de notre flotte — des <strong className="text-white font-semibold">Peugeot 208</strong> aux <strong className="text-white font-semibold">Dacia Logan et Sandero</strong> — est minutieusement inspecté, nettoyé et préparé avant chaque location. Nous ne faisons aucun compromis sur la sécurité.
                                </p>
                                <p>
                                    Notre mission : rendre la location de voiture aussi simple qu'un appel téléphonique, avec un service de livraison à l'aéroport, à l'hôtel ou directement chez vous.
                                </p>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <Link to="/vehicles" className="px-8 py-3 bg-[var(--color-primary)] text-[#0B0F19] font-black text-sm uppercase tracking-widest rounded-xl hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)] transition-all">
                                    Voir la Flotte
                                </Link>
                                <Link to="/contact" className="px-8 py-3 border border-[var(--color-border)] text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
                                    Nous Contacter
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-6 bg-[var(--color-primary)]/10 blur-3xl rounded-[3rem] pointer-events-none" />
                            <div className="relative bg-[#141C2B] border border-[var(--color-border)] rounded-3xl p-6 overflow-hidden">
                                <img
                                    src="/images/cars/peugeot_208_gris.png"
                                    alt="TRM Rent Car Fleet"
                                    className="w-full h-80 object-contain mix-blend-screen"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#141C2B] to-transparent h-24" />
                                <div className="absolute bottom-6 left-6 right-6 bg-[#0B0F19]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-black text-lg">Flotte 100% Modèle 2026</p>
                                        <p className="text-slate-400 text-sm">Peugeot, Dacia — Disponibles maintenant</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-[var(--color-primary)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Nos <span className="text-[var(--color-primary)]">Engagements</span></h2>
                        <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mb-6" />
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">Des services pensés pour répondre aux exigences les plus élevées en matière de confort, sécurité et transparence.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map((v, i) => {
                            const Icon = v.icon;
                            return (
                                <div key={i} className="bg-[#141C2B] border border-[var(--color-border)] rounded-2xl p-8 group hover:border-[var(--color-primary)]/50 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                                        <Icon className="w-7 h-7 text-[var(--color-primary)]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">{v.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1C0770]/20 to-[#261CC1]/10 pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <MapPin className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tight">Prêt à prendre la route ?</h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto font-light">Réservez votre véhicule en quelques clics ou appelez-nous directement au <span className="text-[var(--color-primary)] font-bold">06 06 06 6426</span>.</p>
                    <Link to="/vehicles" className="inline-flex items-center px-10 py-4 bg-[var(--color-primary)] text-[#0B0F19] font-black text-sm uppercase tracking-widest rounded-xl hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)] transition-all">
                        <Car className="w-5 h-5 mr-2" /> Explorer la flotte
                    </Link>
                </div>
            </section>
        </div>
    );
}
