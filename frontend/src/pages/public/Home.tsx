import { Car, ShieldCheck, Clock, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="bg-[var(--color-background)]">
            {/* Cinematic Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Dark Luxury Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-background)] via-[#0F141D] to-[#161D2B] z-0" />

                {/* Spotlight/Glow effect behind the car */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-[var(--color-primary)]/10 rounded-full blur-[150px] z-0 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12 mt-12 lg:mt-0">

                    {/* Left text content */}
                    <div className="flex-1 text-center lg:text-left pt-12 lg:pt-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 mb-6">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                            <span className="text-sm font-medium text-[var(--color-primary)] tracking-wider uppercase">TRM Luxury Collection</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                            L'excellence de la <br />
                            <span className="text-gradient-gold">route commence ici.</span>
                        </h1>

                        <p className="mt-4 text-xl text-[var(--color-text-muted)] max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                            Découvrez une flotte de véhicules premium pour vos déplacements professionnels et personnels. L'alliance parfaite entre puissance, élégance et confort.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link to="/vehicles" className="group relative flex items-center justify-center px-8 py-4 bg-gradient-gold text-slate-900 rounded-sm font-bold text-lg transition-all hover-glow-gold overflow-hidden">
                                <span className="relative z-10 flex items-center gap-2">
                                    Réserver maintenant
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Link>

                            <Link to="/about" className="group flex items-center justify-center px-8 py-4 bg-transparent border border-[var(--color-border)] hover:border-[var(--color-primary)] text-white rounded-sm font-bold text-lg transition-colors">
                                <span className="relative z-10 flex items-center gap-2 group-hover:text-[var(--color-primary)] transition-colors">
                                    Voir la flotte
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Right side cinematic image */}
                    <div className="flex-1 relative w-full h-[400px] lg:h-[600px] flex items-center justify-center">
                        {/* Floor reflection effect */}
                        <div className="absolute bottom-10 w-3/4 h-8 bg-[var(--color-primary)]/20 blur-2xl rounded-[100%] skew-x-12" />

                        {/* Car Image (Floating effect) */}
                        {/* Ideally replace with a transparent PNG of a high-end luxury car without background */}
                        <img
                            src="https://images.unsplash.com/photo-1627454819213-f56f18b52a92?auto=format&fit=crop&q=80&w=2000&blend=0B0F14&blend-mode=darken"
                            alt="Luxury Car Showcase"
                            className="w-full object-contain drop-shadow-2xl animate-[float_6s_ease-in-out_infinite] scale-110 lg:scale-125 object-center origin-center"
                            style={{ filter: 'contrast(1.2) brightness(1.1)' }}
                        />
                    </div>
                </div>

                {/* Animated Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce cursor-pointer text-[var(--color-text-muted)] hover:text-white transition-colors">
                    <span className="text-xs uppercase tracking-widest mb-2 font-medium">Découvrir</span>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </section>

            {/* Features Section - Premium Style */}
            <section className="py-24 bg-[var(--color-surface)] relative border-t border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">L'Avantage TRM</h2>
                        <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full mb-6" />
                        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
                            Des services pensés pour répondre aux exigences les plus élevées en matière de confort et de sécurité.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="glass-card p-8 rounded-sm group hover:-translate-y-2 transition-transform duration-500 hover:border-[var(--color-primary)]/50">
                            <div className="w-14 h-14 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                                <Car className="h-6 w-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Véhicules Impeccables</h3>
                            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                                Un entretien méticuleux et rigoureux pour chaque modèle de notre flotte.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-sm group hover:-translate-y-2 transition-transform duration-500 hover:border-[var(--color-primary)]/50">
                            <div className="w-14 h-14 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                                <ShieldCheck className="h-6 w-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Sérénité Absolue</h3>
                            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                                Assurance tous risques, garanties complètes et assistance 24/7 incluse.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-sm group hover:-translate-y-2 transition-transform duration-500 hover:border-[var(--color-primary)]/50">
                            <div className="w-14 h-14 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                                <Clock className="h-6 w-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Service Flexible</h3>
                            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                                Modifications et annulations simplifiées pour s'adapter à votre emploi du temps.
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-sm group hover:-translate-y-2 transition-transform duration-500 hover:border-[var(--color-primary)]/50">
                            <div className="w-14 h-14 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                                <MapPin className="h-6 w-6 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Service Voiturier</h3>
                            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                                Livraison de votre véhicule où vous le souhaitez : aéroport, hôtel ou bureau.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Add these keyframes to your Tailwind config or index.css for the float animation
// @keyframes float {
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-15px); }
// }
