import { useParams, Link } from 'react-router-dom';
import { Calendar, Shield, ArrowLeft, Fuel, Users, MapPin, Search } from 'lucide-react';
import { Truck, MessagesSquare, ShieldCheck } from 'lucide-react'; // Trust icons

export default function VehicleDetail() {
    useParams();

    // Mock specific vehicle (Dacia Logan) for UI purposes
    const vehicle = {
        brand: 'Dacia',
        model: 'Logan',
        year: 2026,
        price_per_day: 250,
        image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80',
        transmission: 'Manuelle',
        fuel_type: 'Diesel',
        seats: 5,
        deposit_amount: 3000,
        description: `Le choix économique par excellence. La nouvelle Dacia Logan 2026 offre un espace généreux pour cinq adultes, une consommation de carburant très faible et un coffre volumineux. Parfaite pour vos trajets urbains ou vos déplacements professionnels inter-villes au Maroc.`
    };

    return (
        <div className="pb-24 bg-[var(--color-background)] min-h-screen">
            {/* Cinematic Hero Image Section */}
            <div className="relative h-[60vh] min-h-[500px] w-full bg-[var(--color-background)] border-b border-[var(--color-border)] overflow-hidden">
                <img
                    src={vehicle.image_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover opacity-60 mix-blend-luminosity brightness-110 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[#0F141D]/60 to-transparent" />

                <div className="absolute top-8 left-8 z-20">
                    <Link to="/vehicles" className="group flex items-center px-4 py-2 bg-[var(--color-card)]/80 backdrop-blur-md rounded-sm text-white hover:text-[var(--color-primary)] transition-colors border border-[var(--color-border)] font-medium text-sm tracking-widest uppercase">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Retour au catalogue
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full z-10 pb-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="inline-block px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-xs font-bold tracking-widest uppercase rounded-sm mb-4 backdrop-blur-md">
                            Économique
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white mb-0 drop-shadow-2xl tracking-tighter uppercase">{vehicle.brand}</h1>
                        <h2 className="text-4xl text-gradient-gold font-light tracking-wide -mt-2">{vehicle.model}</h2>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Details Column */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Specs */}
                        <section className="glass-card p-8 rounded-sm shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-8 border-b border-[var(--color-border)] pb-4 tracking-wider uppercase">Fiche Technique</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center group">
                                    <div className="w-12 h-12 mx-auto bg-[var(--color-background)] rounded-full flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors mb-3">
                                        <Search className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                                    </div>
                                    <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest mb-1">Boîte</p>
                                    <p className="text-white font-bold">{vehicle.transmission}</p>
                                </div>
                                <div className="text-center group">
                                    <div className="w-12 h-12 mx-auto bg-[var(--color-background)] rounded-full flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors mb-3">
                                        <Fuel className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                                    </div>
                                    <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest mb-1">Énergie</p>
                                    <p className="text-white font-bold">{vehicle.fuel_type}</p>
                                </div>
                                <div className="text-center group">
                                    <div className="w-12 h-12 mx-auto bg-[var(--color-background)] rounded-full flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors mb-3">
                                        <Users className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                                    </div>
                                    <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest mb-1">Passagers</p>
                                    <p className="text-white font-bold">{vehicle.seats}</p>
                                </div>
                                <div className="text-center group">
                                    <div className="w-12 h-12 mx-auto bg-[var(--color-background)] rounded-full flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors mb-3">
                                        <Calendar className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                                    </div>
                                    <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest mb-1">Année</p>
                                    <p className="text-white font-bold">{vehicle.year}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-6 tracking-wider uppercase">À propos de ce véhicule</h3>
                            <p className="text-[var(--color-text-muted)] leading-loose text-lg font-light text-justify">
                                {vehicle.description}
                            </p>
                        </section>

                        {/* Trust / Features */}
                        <section className="bg-[var(--color-card)] border border-[var(--color-border)] p-8 rounded-sm">
                            <h3 className="text-xl font-bold text-white mb-8 tracking-wider uppercase text-center">L'Engagement TRM Rent Car</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex flex-col items-center text-center">
                                    <ShieldCheck className="w-10 h-10 text-[var(--color-primary)] mb-4" />
                                    <h4 className="text-white font-bold mb-2">Assurance Tous Risques</h4>
                                    <p className="text-[var(--color-text-muted)] text-sm">Voyagez en toute sérénité. Nos tarifs incluent une couverture complète.</p>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <Truck className="w-10 h-10 text-[var(--color-primary)] mb-4" />
                                    <h4 className="text-white font-bold mb-2">Livraison sur Mesure</h4>
                                    <p className="text-[var(--color-text-muted)] text-sm">Récupérez votre voiture à l'aéroport, à l'hôtel ou dans nos agences.</p>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <MessagesSquare className="w-10 h-10 text-[var(--color-primary)] mb-4" />
                                    <h4 className="text-white font-bold mb-2">Assistance 24/7</h4>
                                    <p className="text-[var(--color-text-muted)] text-sm">Notre équipe est à votre disposition à tout moment via WhatsApp ou par téléphone.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Booking Widget Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--color-card)] p-8 rounded-sm border border-[var(--color-border)] shadow-2xl sticky top-32">
                            <div className="mb-8 pb-6 border-b border-[var(--color-border)]">
                                <p className="text-[var(--color-text-muted)] text-xs tracking-widest uppercase mb-2">Tarif Journalier TTC</p>
                                <div className="flex items-baseline text-white">
                                    <span className="text-5xl font-black">{vehicle.price_per_day}</span>
                                    <span className="text-lg ml-2 text-[var(--color-primary)] font-bold">MAD</span>
                                </div>
                                <div className="mt-4 flex items-center text-xs text-[var(--color-text-muted)] bg-[var(--color-background)] border border-[var(--color-border)] p-3 rounded-sm uppercase tracking-wider">
                                    <Shield className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
                                    Caution: {vehicle.deposit_amount} MAD
                                </div>
                            </div>

                            <form className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-2">Dates de location</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                                            <input type="date" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-sm py-3 pl-10 pr-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]" placeholder="Départ" />
                                        </div>
                                        <span className="text-[var(--color-text-muted)]">-</span>
                                        <div className="relative flex-1">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                                            <input type="date" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-sm py-3 pl-10 pr-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]" placeholder="Retour" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-2">Ville de retrait</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                                        <select className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-sm py-3 pl-10 pr-4 text-white text-sm appearance-none focus:outline-none focus:border-[var(--color-primary)]">
                                            <option>Casablanca (Aéroport CMN)</option>
                                            <option>Casablanca (Centre Ville)</option>
                                            <option>Rabat (Aéroport RBA)</option>
                                            <option>Marrakech (Aéroport RAK)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-2">Ville de restitution</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                                        <select className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-sm py-3 pl-10 pr-4 text-white text-sm appearance-none focus:outline-none focus:border-[var(--color-primary)]">
                                            <option>Idem (Retrait)</option>
                                            <option>Casablanca (Aéroport CMN)</option>
                                            <option>Marrakech (Aéroport RAK)</option>
                                            <option>Tanger (Aéroport TNG)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[var(--color-border)]">
                                    <div className="flex justify-between items-center text-sm mb-6 text-[var(--color-text-muted)]">
                                        <span>Total estimé (3 jours)</span>
                                        <span className="text-white font-bold text-lg">{vehicle.price_per_day * 3} MAD</span>
                                    </div>

                                    <Link to="/login" className="block w-full text-center bg-gradient-gold hover:opacity-90 text-slate-900 font-bold py-4 rounded-sm transition-all hover-glow-gold tracking-wider uppercase text-sm">
                                        Continuer la réservation
                                    </Link>
                                    <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
                                        Aucun paiement immédiat requis. Vous finaliserez votre réservation dans l'étape suivante.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
