import { Car, ShieldCheck, Clock, MapPin, Calendar, Search, CreditCard, ChevronRight, Fuel, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const POPULAR_CARS = [
    {
        id: '1',
        brand: 'Peugeot',
        model: '208',
        image_url: '/images/cars/peugeot_208_noir.png',
        price_per_day: 420,
        transmission: 'Manuelle 6-vitesses',
        fuel_type: 'Diesel',
        seats: 5,
        doors: 5
    },
    {
        id: '3',
        brand: 'Dacia',
        model: 'Logan',
        image_url: '/images/cars/dacia_logan_blanc.png',
        price_per_day: 300,
        transmission: 'Manuelle',
        fuel_type: 'Diesel',
        seats: 5,
        doors: 5
    },
    {
        id: '5',
        brand: 'Dacia',
        model: 'Sandero',
        image_url: '/images/cars/dacia_sandero_gris.png',
        price_per_day: 320,
        transmission: 'Manuelle',
        fuel_type: 'Essence',
        seats: 5,
        doors: 5
    },
    {
        id: 'premium-7',
        brand: 'Range Rover',
        model: 'Evoque',
        image_url: '/images/cars/range_rover_evoque.png',
        price_per_day: 1200,
        transmission: 'Automatique',
        fuel_type: 'Diesel',
        seats: 5,
        doors: 5
    }
];

const DELIVERY_ZONES = [
    { name: 'Taourirt', desc: 'Agence Principale — Siège TRM', img: '/images/locations/taourirt.png', abbr: 'TRT', isMain: true },
    { name: 'Oujda', desc: 'Livraison Aéroport & Centre', img: '/images/locations/oujda.png', abbr: 'OUD', isMain: false },
    { name: 'Nador', desc: 'Livraison Aéroport & Ville', img: '/images/locations/nador.png', abbr: 'NDR', isMain: false },
    { name: 'Fès', desc: 'Livraison Aéroport Saïss', img: '/images/locations/fes.png', abbr: 'FEZ', isMain: false },
    { name: 'Berkane', desc: 'Livraison Centre Ville', img: '/images/locations/berkane.png', abbr: 'BRK', isMain: false },
];

export default function Home() {
    return (
        <div className="bg-[var(--color-background)]">
            {/* SaaS Booking Hero Section */}
            <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden border-b border-[var(--color-border)]">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/morocco_hero.png"
                        alt="Desert Road Morocco"
                        className="w-full h-full object-cover opacity-30 mix-blend-luminosity brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/80 to-[#0F141D]/20" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
                    <div className="max-w-3xl mb-12">
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 text-white uppercase drop-shadow-2xl">
                            Premium Car Rental <br />
                            <span className="text-[var(--color-primary)]">in Morocco.</span>
                        </h1>
                        <p className="text-lg text-slate-300 max-w-xl font-light">
                            Drive your journey with confidence. Choose from our luxury and economy fleet with all-inclusive insurance and unlimited support.
                        </p>
                    </div>

                    {/* Booking Search Widget - Europcar/SaaS Style */}
                    <div className="bg-[#141C2B]/90 backdrop-blur-xl border border-[var(--color-border)] p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Retrait</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <select className="w-full bg-[#0B0F19] border border-[var(--color-border)] text-white text-sm rounded-xl focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-10 p-3.5 appearance-none">
                                        <option>Agence Taourirt (Siège)</option>
                                        <option>Livraison Oujda</option>
                                        <option>Livraison Nador</option>
                                        <option>Livraison Fès</option>
                                        <option>Livraison Berkane</option>
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Retour</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <select className="w-full bg-[#0B0F19] border border-[var(--color-border)] text-white text-sm rounded-xl focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-10 p-3.5 appearance-none">
                                        <option>Identique au retrait</option>
                                        <option>Agence Taourirt (Siège)</option>
                                        <option>Livraison Oujda</option>
                                        <option>Livraison Nador</option>
                                        <option>Livraison Fès</option>
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Date Départ</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input type="date" className="w-full bg-[#0B0F19] border border-[var(--color-border)] text-white text-sm rounded-xl focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-10 pr-3 p-3.5" />
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Date Retour</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input type="date" className="w-full bg-[#0B0F19] border border-[var(--color-border)] text-white text-sm rounded-xl focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-10 pr-3 p-3.5" />
                                </div>
                            </div>

                            <div className="md:col-span-1 flex items-end">
                                <Link to="/vehicles" className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[#0B0F19] font-black text-sm uppercase tracking-widest rounded-xl p-3.5 transition-all shadow-lg hover:-translate-y-0.5">
                                    <Search className="w-5 h-5" />
                                    Rechercher
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Cars Section */}
            <section className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12 border-b border-[var(--color-border)] pb-6">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Notre Flotte Populaire</h2>
                            <p className="text-slate-400 font-light">Les véhicules les plus demandés au Maroc.</p>
                        </div>
                        <Link to="/vehicles" className="text-[var(--color-primary)] text-sm font-bold uppercase tracking-wide flex items-center hover:text-white transition-colors">
                            Voir tout le catalogue <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {POPULAR_CARS.map((car) => (
                            <div key={car.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden group hover:border-[var(--color-primary)]/50 hover:shadow-[0_10px_40px_rgba(212,175,55,0.1)] transition-all duration-300">
                                <div className="h-48 relative bg-gradient-to-t from-[var(--color-surface)] to-[var(--color-background)] p-4 flex items-center justify-center overflow-hidden">
                                    <img src={car.image_url} alt={car.model} className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="p-5 border-t border-[var(--color-border)]/50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-extrabold text-white leading-none">{car.brand}</h3>
                                            <p className="text-[var(--color-primary)] font-medium mt-1">{car.model}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[var(--color-primary)] font-black text-xl">{car.price_per_day}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">MAD / Jour</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-400 font-medium mb-5">
                                        <div className="flex items-center"><Car className="w-3.5 h-3.5 mr-2 text-slate-500" /> {car.transmission}</div>
                                        <div className="flex items-center"><Fuel className="w-3.5 h-3.5 mr-2 text-slate-500" /> {car.fuel_type}</div>
                                        <div className="flex items-center"><Users className="w-3.5 h-3.5 mr-2 text-slate-500" /> {car.seats} Places</div>
                                        <div className="flex items-center"><div className="w-3.5 h-3.5 mr-2 text-slate-500 text-[10px] font-bold text-center">P</div> {car.doors} Portes</div>
                                    </div>

                                    <Link to={`/vehicles/${car.id}`} className="block w-full py-2.5 text-center bg-[#0B0F19] border border-[var(--color-border)] text-white text-sm font-bold uppercase tracking-wider rounded-lg group-hover:bg-[var(--color-primary)] group-hover:text-[#0B0F19] transition-colors">
                                        Réserver
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Delivery Zones */}
            <section className="py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-4">Livraison dans tout le Maroc Oriental</h2>
                        <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mb-6" />
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">Notre agence est basée à <span className="text-[var(--color-primary)] font-bold">Taourirt</span>. Nous livrons votre véhicule où vous le souhaitez dans la région orientale et au-delà.</p>
                    </div>

                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
                        {DELIVERY_ZONES.map((city, idx) => (
                            <div key={idx} className={`min-w-[280px] h-[360px] relative rounded-2xl overflow-hidden group snap-center cursor-pointer border transition-colors ${city.isMain ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'}`}>
                                <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/60 to-transparent" />
                                {city.isMain && <div className="absolute top-4 right-4 bg-[var(--color-primary)] text-[#0B0F19] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Siège</div>}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <div className="w-12 h-12 bg-[var(--color-primary)]/20 backdrop-blur border border-[var(--color-primary)] rounded-lg flex items-center justify-center text-[var(--color-primary)] font-black mb-4">
                                        {city.abbr}
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">{city.name}</h3>
                                    <p className="text-sm text-slate-300 mt-2">{city.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1503376710356-748af20b66b7?auto=format&fit=crop&q=80')] bg-cover bg-fixed opacity-5 mix-blend-luminosity" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-8">
                                Pourquoi choisir <span className="text-[var(--color-primary)]">TRM</span>
                            </h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 shrink-0 bg-[#141C2B] border border-[var(--color-border)] rounded-2xl flex items-center justify-center">
                                        <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Assurance & Sécurité</h3>
                                        <p className="text-slate-400 font-light leading-relaxed">Partez l'esprit tranquille. Nos véhicules récents sont rigoureusement entretenus et bénéficient d'une assurance multirisque.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 shrink-0 bg-[#141C2B] border border-[var(--color-border)] rounded-2xl flex items-center justify-center">
                                        <CreditCard className="w-8 h-8 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Transparence des Prix</h3>
                                        <p className="text-slate-400 font-light leading-relaxed">Les meilleurs tarifs du marché marocain, sans suppléments cachés ni surprises de dernière minute au comptoir.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 shrink-0 bg-[#141C2B] border border-[var(--color-border)] rounded-2xl flex items-center justify-center">
                                        <Clock className="w-8 h-8 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Assistance Rapide 24/7</h3>
                                        <p className="text-slate-400 font-light leading-relaxed">Notre équipe support et nos dépanneurs partenaires interviennent à tout moment où que vous soyez au Maroc.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[600px] border border-[var(--color-border)] rounded-3xl overflow-hidden p-2 bg-[#141C2B]">
                            <img src="/images/cars/peugeot_208_noir.png" alt="Premium TRM" className="w-full h-full object-cover rounded-2xl filter contrast-125 saturate-50 mix-blend-screen opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent rounded-2xl" />
                            <div className="absolute bottom-8 left-8 right-8 bg-[#0B0F19]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl p-6">
                                <p className="text-[var(--color-primary)] font-black text-4xl mb-2">15+</p>
                                <p className="text-white font-bold uppercase tracking-widest text-sm">Années d'expérience au Maroc</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
