import { useState, useEffect, useRef } from 'react';
import {
    Car,
    ShieldCheck,
    Clock,
    MapPin,
    Calendar,
    Search,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Fuel,
    Users,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { vehiclesApi, type Vehicle } from '../../lib/api';

const DELIVERY_ZONES = [
    { name: 'Taourirt', desc: 'Agence Principale — Siège TRM', img: '/images/locations/taourirt.png', abbr: 'TRT', isMain: true },
    { name: 'Oujda', desc: 'Livraison Aéroport & Centre', img: '/images/locations/oujda.png', abbr: 'OUD', isMain: false },
    { name: 'Nador', desc: 'Livraison Aéroport & Ville', img: '/images/locations/nador.png', abbr: 'NDR', isMain: false },
    { name: 'Fès', desc: 'Livraison Aéroport Saïss', img: '/images/locations/fes.png', abbr: 'FEZ', isMain: false },
    { name: 'Berkane', desc: 'Livraison Centre Ville', img: '/images/locations/berkane.png', abbr: 'BRK', isMain: false },
    { name: 'Al Hoceima', desc: 'Livraison Aéroport & Ville', img: '/images/locations/alhoceima.png', abbr: 'AHC', isMain: false },
    { name: 'Rabat', desc: 'Livraison Aéroport & Ville', img: '/images/locations/rabat.png', abbr: 'RBA', isMain: false },
    { name: 'Casablanca', desc: 'Livraison Aéroport & Ville', img: '/images/locations/casablanca.png', abbr: 'CAS', isMain: false },
];

export default function Home() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await vehiclesApi.getAll();
                // Map the cover image to each vehicle
                const mapped = data.map(v => {
                    const coverImg = v.vehicle_images?.find(img => img.is_cover)?.image_url
                        || v.vehicle_images?.[0]?.image_url
                        || '/images/cars/default.png';
                    return { ...v, image_url: coverImg } as any;
                });
                setVehicles(mapped.filter(v => v.status === 'available').slice(0, 4));
            } catch (error) {
                console.error("Error fetching popular vehicles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

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
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 text-white uppercase drop-shadow-2xl animate-slide-up opacity-0">
                            Premium Car Rental <br />
                            <span className="text-[var(--color-primary)]">in Morocco.</span>
                        </h1>
                        <p className="text-lg text-slate-300 max-w-xl font-light animate-slide-up opacity-0 delay-200">
                            Drive your journey with confidence. Choose from our luxury and economy fleet with all-inclusive insurance and unlimited support.
                        </p>
                    </div>

                    {/* Booking Search Widget - Europcar/SaaS Style */}
                    <div className="bg-[#141C2B]/90 backdrop-blur-xl border border-[var(--color-border)] p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-scale-in opacity-0 delay-400">
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
                                        <option>Livraison Al Hoceima</option>
                                        <option>Livraison Rabat</option>
                                        <option>Livraison Casablanca</option>
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
                                        <option>Livraison Berkane</option>
                                        <option>Livraison Al Hoceima</option>
                                        <option>Livraison Rabat</option>
                                        <option>Livraison Casablanca</option>
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
                    <div className="flex justify-between items-end mb-12 border-b border-[var(--color-border)] pb-6 animate-fade-in opacity-0">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Notre Flotte Populaire</h2>
                            <p className="text-slate-400 font-light">Les véhicules disponibles en temps réel dans notre base.</p>
                        </div>
                        <Link to="/vehicles" className="text-[var(--color-primary)] text-sm font-bold uppercase tracking-wide flex items-center hover:text-white transition-colors">
                            Voir tout le catalogue <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-[var(--color-surface)] h-[400px] rounded-2xl animate-pulse border border-[var(--color-border)]" />
                            ))}
                        </div>
                    ) : (vehicles as any[]).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(vehicles as any[]).map((car) => (
                                <div key={car.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden group hover:border-[var(--color-primary)]/50 hover:shadow-[0_10px_40px_rgba(212,175,55,0.1)] transition-all duration-300 animate-scale-in opacity-0">
                                    <div className="h-48 relative bg-gradient-to-t from-[var(--color-surface)] to-[var(--color-background)] p-4 flex items-center justify-center overflow-hidden">
                                        <img src={car.image_url || '/images/cars/default.png'} alt={car.model} className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="p-5 border-t border-[var(--color-border)]/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-extrabold text-white leading-none">{car.brand}</h3>
                                                <p className="text-[var(--color-primary)] font-medium mt-1 uppercase text-xs tracking-widest">{car.model}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[var(--color-primary)] font-black text-xl">{car.price_per_day}</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">MAD / Jour</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-5">
                                            <div className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-slate-500" /> {car.transmission}</div>
                                            <div className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-slate-500" /> {car.fuel_type}</div>
                                            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-500" /> {car.seats} Pl.</div>
                                            <div className="flex items-center gap-1.5 border border-slate-700/50 rounded px-1 w-fit">{car.plate_number}</div>
                                        </div>

                                        <Link to={`/vehicles/${car.id}`} className="flex items-center justify-center gap-2 w-full py-3 bg-[#0B0F19] border border-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl group-hover:bg-[var(--color-primary)] group-hover:text-[#0B0F19] group-hover:border-[var(--color-primary)] transition-all">
                                            Réserver <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl animate-fade-in">
                            <Car className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest">Aucun véhicule disponible pour le moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Delivery Zones */}
            <section className="py-24 bg-[var(--color-surface)] border-y border-[var(--color-border)] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-16 text-center animate-fade-in opacity-0">
                        <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-4">Livraison dans tout le Maroc</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                            Agence basée à <span className="text-[var(--color-primary)] font-bold">Taourirt</span>.
                            Nous couvrons toute la région orientale et les grandes métropoles.
                        </p>
                    </div>

                    <div className="relative group/scroll px-12">
                        {/* Side Buttons */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-slate-700 flex items-center justify-center text-white bg-[#0B0F19]/80 backdrop-blur-md z-30 hover:bg-[var(--color-primary)] hover:text-[#0B0F19] hover:border-[var(--color-primary)] transition-all shadow-2xl opacity-0 group-hover/scroll:opacity-100 -translate-x-4 group-hover/scroll:translate-x-0"
                            aria-label="Précédent"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-slate-700 flex items-center justify-center text-white bg-[#0B0F19]/80 backdrop-blur-md z-30 hover:bg-[var(--color-primary)] hover:text-[#0B0F19] hover:border-[var(--color-primary)] transition-all shadow-2xl opacity-0 group-hover/scroll:opacity-100 translate-x-4 group-hover/scroll:translate-x-0"
                            aria-label="Suivant"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto gap-6 pb-12 snap-x scrollbar-hide scroll-smooth"
                        >
                            {DELIVERY_ZONES.map((city, idx) => (
                                <div key={idx} className={`min-w-[300px] h-[400px] relative rounded-[2rem] overflow-hidden group snap-center cursor-pointer border transition-all duration-500 ${city.isMain ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10' : 'border-slate-800 hover:border-[var(--color-primary)]/50 shadow-2xl'} animate-scale-in opacity-0`} style={{ animationDelay: `${idx * 100}ms` }}>
                                    <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent" />
                                    {city.isMain && <div className="absolute top-6 right-6 bg-[var(--color-primary)] text-[#0B0F19] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xl">Siège Social</div>}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="w-14 h-14 bg-[var(--color-primary)]/10 backdrop-blur-xl border border-[var(--color-primary)]/30 rounded-2xl flex items-center justify-center text-[var(--color-primary)] font-black text-xl mb-6 shadow-2xl">
                                            {city.abbr}
                                        </div>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{city.name}</h3>
                                        <p className="text-sm text-slate-300 mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">{city.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 relative overflow-hidden bg-[#0A0E17]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <div className="inline-block px-4 py-1.5 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full mb-6 animate-fade-in opacity-0">
                                <span className="text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.2em]">Excellence TRM</span>
                            </div>
                            <h2 className="text-5xl font-black text-white uppercase tracking-tight mb-8 leading-[0.9] animate-slide-up opacity-0">
                                Pourquoi nous faire <br />
                                <span className="text-[var(--color-primary)]">confiance ?</span>
                            </h2>
                            <div className="space-y-10">
                                <div className="flex gap-8 group animate-slide-right opacity-0 delay-200">
                                    <div className="w-16 h-16 shrink-0 bg-[#141C2B] border border-slate-800 rounded-2xl flex items-center justify-center group-hover:border-[var(--color-primary)]/50 transition-colors duration-500">
                                        <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide">Protection Totale</h3>
                                        <p className="text-slate-400 font-medium leading-relaxed">Assurance multirisque incluse et assistance technique rapide en cas de besoin sur toutes les routes du Maroc.</p>
                                    </div>
                                </div>
                                <div className="flex gap-8 group animate-slide-right opacity-0 delay-400">
                                    <div className="w-16 h-16 shrink-0 bg-[#141C2B] border border-slate-800 rounded-2xl flex items-center justify-center group-hover:border-[var(--color-primary)]/50 transition-colors duration-500">
                                        <CreditCard className="w-8 h-8 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide">Tarification Fixe</h3>
                                        <p className="text-slate-400 font-medium leading-relaxed">Pas de frais de dossier, pas de mauvaises surprises. Le prix affiché est celui que vous payez réellement.</p>
                                    </div>
                                </div>
                                <div className="flex gap-8 group animate-slide-right opacity-0 delay-600">
                                    <div className="w-16 h-16 shrink-0 bg-[#141C2B] border border-slate-800 rounded-2xl flex items-center justify-center group-hover:border-[var(--color-primary)]/50 transition-colors duration-500">
                                        <Clock className="w-8 h-8 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide">Disponibilité 24/7</h3>
                                        <p className="text-slate-400 font-medium leading-relaxed">Réservation en ligne instantanée et support client disponible à tout moment pour vous accompagner.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[700px] border border-slate-800 rounded-[3rem] overflow-hidden p-3 bg-[#111827] shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-scale-in opacity-0">
                            <div className="absolute inset-0 z-0 scale-125 opacity-20 blur-3xl bg-[var(--color-primary)]/20 animate-pulse" />
                            <img src={(vehicles as any[])[0]?.image_url || '/images/cars/default.png'} alt="Premium TRM" className="w-full h-full object-cover rounded-[2.5rem] filter contrast-110 brightness-110 active:scale-95 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent rounded-[2.5rem]" />
                            <div className="absolute bottom-12 left-12 right-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                                <div className="flex items-end gap-2 mb-2">
                                    <p className="text-[var(--color-primary)] font-black text-6xl leading-none tracking-tighter">15+</p>
                                    <p className="text-white font-black uppercase text-xs tracking-widest mb-2">Ans</p>
                                </div>
                                <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px]">Expérience TRM Rent Car Morocco</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
