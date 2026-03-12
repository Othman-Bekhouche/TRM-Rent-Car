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
                    scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                }
            }
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[var(--color-background)]">
            {/* SaaS Booking Hero Section */}
            <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden border-b border-[var(--color-border)]">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/morocco_hero.png"
                        alt="Desert Road Morocco"
                        className="w-full h-full object-cover opacity-20 mix-blend-luminosity brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/80 to-[#0F141D]/20" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
                    <div className="max-w-3xl mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.2em] mb-6 animate-fade-in">
                            <ShieldCheck className="w-3 h-3" /> No. 1 Premium Rental in Morocco
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-4 text-white uppercase leading-none drop-shadow-2xl animate-slide-up opacity-0">
                            Voyagez avec <br />
                            <span className="text-[var(--color-primary)]">Excellence.</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-xl font-light animate-slide-up opacity-0 delay-200 leading-relaxed">
                            Découvrez le Maroc au volant de notre flotte premium. De la ville aux routes du désert, nous assurons votre confort et votre sécurité.
                        </p>
                    </div>

                    {/* Booking Search Widget */}
                    <div className="bg-[#121826]/80 backdrop-blur-2xl border border-[#1F2A3D] p-6 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] animate-scale-in opacity-0 delay-400 group">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="md:col-span-1 group/input">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover/input:text-[var(--color-primary)]">Lieu de Retrait</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover/input:text-[var(--color-primary)] transition-colors" />
                                    <select className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white text-sm rounded-2xl focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-12 p-4 appearance-none font-bold transition-all hover:bg-[#1C2539]">
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

                            <div className="md:col-span-1 group/input">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover/input:text-[var(--color-primary)]">Lieu de Retour</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover/input:text-[var(--color-primary)] transition-colors" />
                                    <select className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white text-sm rounded-2xl focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-12 p-4 appearance-none font-bold transition-all hover:bg-[#1C2539]">
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

                            <div className="md:col-span-1 group/input">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover/input:text-[var(--color-primary)]">Date Retrait</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover/input:text-[var(--color-primary)] transition-colors" />
                                    <input type="date" className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white text-sm rounded-2xl focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-12 p-4 font-bold transition-all hover:bg-[#1C2539]" />
                                </div>
                            </div>

                            <div className="md:col-span-1 group/input">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover/input:text-[var(--color-primary)]">Date Retour</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover/input:text-[var(--color-primary)] transition-colors" />
                                    <input type="date" className="w-full bg-[#0B0F19] border border-[#1F2A3D] text-white text-sm rounded-2xl focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-12 p-4 font-bold transition-all hover:bg-[#1C2539]" />
                                </div>
                            </div>

                            <div className="md:col-span-1 flex items-end">
                                <Link to="/vehicles" className="w-full group/btn relative overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl p-4.5 py-4 transition-all shadow-[0_10px_30px_rgba(58,154,255,0.3)] hover:scale-[1.02] active:scale-[0.98]">
                                    <div className="absolute inset-0 bg-white/20 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                    <Search className="relative w-5 h-5" />
                                    <span className="relative">Rechercher</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in opacity-0 delay-600">
                        {[
                            { icon: ShieldCheck, title: "Assurance", desc: "Tout inclus & Sérénité" },
                            { icon: Clock, title: "Support 24/7", desc: "Assistance routière" },
                            { icon: CreditCard, title: "Zéro Frais", desc: "Annulation gratuite" },
                            { icon: MapPin, title: "Livraison", desc: "Dans tout le pays" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[var(--color-primary)]">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white text-xs font-black uppercase tracking-widest leading-none mb-1">{item.title}</h4>
                                    <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Comment ça <span className="text-[var(--color-primary)]">marche ?</span></h2>
                        <p className="text-slate-400 font-light">Réservez votre voiture en trois étapes simples.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { num: '01', title: 'Choisissez', desc: 'Parcourez notre catalogue et trouvez la voiture parfaite pour votre voyage.', icon: Search },
                            { num: '02', title: 'Réservez', desc: 'Remplissez vos informations et recevez une confirmation immédiate.', icon: Calendar },
                            { num: '03', title: 'Roulez', desc: 'Récupérez les clés à l\'agence ou faites-vous livrer à votre arrivée.', icon: Car }
                        ].map((step, i) => (
                            <div key={i} className="relative group text-center space-y-6">
                                <div className="w-20 h-20 mx-auto bg-[#121826] border border-[#1F2A3D] rounded-3xl flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-slate-900 transition-all duration-500 rotate-3 group-hover:rotate-0">
                                    <step.icon className="w-8 h-8" />
                                    <span className="absolute -top-4 -right-4 text-4xl font-black text-white/5 tracking-tighter group-hover:text-white/10 transition-colors uppercase">{step.num}</span>
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-[250px] mx-auto font-light">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Cars Section */}
            <section className="py-24 relative z-10 bg-gradient-to-b from-transparent to-[#0F141D]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12 border-b border-[#1F2A3D] pb-6 animate-fade-in opacity-0">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Véhicules <span className="text-[var(--color-primary)]">Favoris</span></h2>
                            <p className="text-slate-500 font-light italic">Nos modèles les plus demandés cette semaine.</p>
                        </div>
                        <Link to="/vehicles" className="text-[var(--color-primary)] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:text-white transition-all group">
                            Voir tout le catalogue <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-[#121826] h-[450px] rounded-[2rem] animate-pulse border border-[#1F2A3D]" />
                            ))}
                        </div>
                    ) : (vehicles as any[]).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {(vehicles as any[]).map((car) => (
                                <div key={car.id} className="bg-[#121826] border border-[#1F2A3D] rounded-[2.5rem] overflow-hidden group hover:border-[var(--color-primary)]/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500 animate-scale-in opacity-0">
                                    <div className="h-56 relative bg-gradient-to-b from-[#1C2539] to-[#121826] p-6 flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#121826] to-transparent z-0"></div>
                                        <img src={car.image_url || '/images/cars/default.png'} alt={car.model} className="w-full h-full object-contain relative z-10 mix-blend-screen scale-110 group-hover:scale-125 transition-transform duration-700 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
                                        <div className="absolute top-6 left-6 z-20">
                                            <span className="px-3 py-1 bg-[#3A9AFF]/10 border border-[#3A9AFF]/20 backdrop-blur-md rounded-lg text-[#3A9AFF] text-[9px] font-black uppercase tracking-[0.2em]">Exclusif</span>
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-black text-white leading-none uppercase tracking-tighter">{car.brand}</h3>
                                                <p className="text-[var(--color-primary)] font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">{car.model}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-black text-2xl tracking-tighter">{car.price_per_day}</p>
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em]">MAD / Jour</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] border-y border-[#1F2A3D] py-4">
                                            <div className="flex items-center gap-2"><Car className="w-3.5 h-3.5 text-[var(--color-primary)]" /> {car.transmission}</div>
                                            <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-[var(--color-primary)]" /> {car.seats} PL.</div>
                                        </div>

                                        <Link to={`/vehicles/${car.id}`} className="flex items-center justify-center gap-3 w-full py-4 bg-[#0B0F19] border border-[#1F2A3D] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl group-hover:bg-gradient-to-r group-hover:from-[#261CC1] group-hover:to-[#3A9AFF] group-hover:border-transparent transition-all shadow-xl">
                                            Détails <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-[#121826] border border-[#1F2A3D] rounded-[3rem] animate-fade-in">
                            <Car className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                            <p className="text-slate-500 font-black uppercase tracking-[0.2em]">Aucun véhicule disponible pour le moment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Delivery Zones */}
            <section className="py-32 bg-[#0B0F19] border-y border-[#1F2A3D] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-24 text-center animate-fade-in opacity-0">
                        <div className="inline-block px-5 py-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.4em] mb-8">Partout au Maroc</div>
                        <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.85]">Liberté Sans <br /><span className="text-[var(--color-primary)]">Frontières.</span></h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-xl font-light leading-relaxed">
                            Nous vous livrons l'excellence directement à votre porte, à l'aéroport ou à votre hôtel.
                        </p>
                    </div>

                    <div className="relative group/scroll">
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-10 overflow-x-auto pb-16 pt-4 snap-x no-scrollbar"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {DELIVERY_ZONES.map((zone, i) => (
                                <div
                                    key={i}
                                    className="min-w-[340px] md:min-w-[400px] snap-center group/card"
                                >
                                    <div className="relative h-[520px] rounded-[3rem] overflow-hidden border border-[#1F2A3D] group-hover/card:border-[var(--color-primary)]/50 transition-all duration-1000 shadow-2xl">
                                        <img
                                            src={zone.img}
                                            alt={zone.name}
                                            className="w-full h-full object-cover grayscale group-hover/card:grayscale-0 transition-all duration-1000 group-hover/card:scale-110 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent"></div>

                                        <div className="absolute top-10 right-10">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white text-xl font-black uppercase tracking-widest group-hover/card:bg-[var(--color-primary)] group-hover/card:text-slate-900 transition-colors duration-500">{zone.abbr}</div>
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 p-12 space-y-6">
                                            {zone.isMain && (
                                                <span className="px-4 py-1.5 bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 backdrop-blur-md rounded-lg text-[var(--color-primary)] text-[9px] font-black uppercase tracking-[0.3em]">Siège Principal</span>
                                            )}
                                            <div className="space-y-2">
                                                <h3 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{zone.name}</h3>
                                                <p className="text-slate-400 text-sm font-medium leading-relaxed opacity-0 group-hover/card:opacity-100 translate-y-4 group-hover/card:translate-y-0 transition-all duration-700 delay-100">
                                                    {zone.desc}
                                                </p>
                                            </div>
                                            <div className="pt-2 opacity-0 group-hover/card:opacity-100 transition-all duration-1000 delay-300">
                                                <div className="h-1 w-16 bg-[var(--color-primary)] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                                            </div>
                                        </div>
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
