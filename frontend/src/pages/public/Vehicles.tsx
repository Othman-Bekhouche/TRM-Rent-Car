import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car as CarIcon, Users, Fuel, ArrowRight, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('*, vehicle_images(image_url, is_cover)');

                if (error) throw error;

                if (data) {
                    const mappedVehicles = data.map(v => {
                        const coverImg = v.vehicle_images?.find((img: any) => img.is_cover)?.image_url
                            || v.vehicle_images?.[0]?.image_url
                            || '/images/cars/default.png';
                        return {
                            ...v,
                            image_url: coverImg,
                            category: v.price_per_day > 1000 ? 'Luxe / SUV' : (v.price_per_day < 350 ? 'Économique' : 'Citadine')
                        };
                    });

                    // Sort to put premium first (highest price per day)
                    mappedVehicles.sort((a, b) => b.price_per_day - a.price_per_day);
                    setVehicles(mappedVehicles);
                }
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter(v => {
        if (filter === 'all') return true;
        if (filter === 'eco') return v.category === 'Économique';
        if (filter === 'city') return v.category === 'Citadine';
        if (filter === 'suv') return v.category === 'Luxe / SUV';
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-[var(--color-background)]">
                <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-background)] min-h-screen pb-24">
            {/* Dark Cinematic Header */}
            <div className="relative py-24 border-b border-[var(--color-border)] mb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F141D] to-[var(--color-background)] z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--color-primary)]/5 rounded-[100%] blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
                        Notre Flotte Automobile
                    </h1>
                    <p className="text-xl text-[var(--color-text-muted)] max-w-3xl mx-auto">
                        Que vous cherchiez la praticité d'une citadine ou le confort pour les longs trajets, TRM Rent Car vous propose un large choix pour vos déplacements au Maroc.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Advanced Filters */}
                <div className="glass-card p-6 rounded-xl mb-12 shadow-2xl relative z-20 hover:border-[var(--color-primary)]/30 transition-colors">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-lg">
                            <Filter className="w-5 h-5" />
                            <span>Affiner votre recherche</span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full md:w-auto flex-1 md:ml-8">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5"
                            >
                                <option value="all">Tous les Types</option>
                                <option value="eco">Économique</option>
                                <option value="city">Citadine</option>
                                <option value="suv">SUV / Luxe</option>
                            </select>
                            <select className="bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5">
                                <option value="">Transmission</option>
                                <option value="auto">Automatique</option>
                                <option value="man">Manuelle</option>
                            </select>
                            <select className="bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5">
                                <option value="">Carburant</option>
                                <option value="diesel">Diesel</option>
                                <option value="essence">Essence</option>
                                <option value="hybride">Hybride</option>
                            </select>
                            <select className="bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5">
                                <option value="">Prix</option>
                                <option value="asc">Croissant</option>
                                <option value="desc">Décroissant</option>
                            </select>
                            <button className="bg-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-slate-900 text-white font-medium text-sm rounded-lg px-5 py-2.5 text-center transition-colors">
                                Rechercher
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vehicle Grid (Glassmorphism & SaaS styled) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-[var(--color-card)] rounded-2xl overflow-hidden flex flex-col group border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-all duration-300 shadow-xl hover:shadow-[var(--color-primary)]/10 hover:-translate-y-1">
                            {/* Image Container */}
                            <div className="relative h-56 bg-gradient-to-t from-[var(--color-card)] to-[#111827] overflow-hidden flex items-center justify-center border-b border-[var(--color-border)] p-4">
                                <img
                                    src={vehicle.image_url}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 mix-blend-screen"
                                />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold tracking-wider rounded border border-white/10 shadow-sm uppercase">
                                        {vehicle.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content Container */}
                            <div className="p-6 flex-1 flex flex-col relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-white tracking-tight mb-1">{vehicle.brand}</h3>
                                        <p className="text-[var(--color-primary)] font-medium text-lg">{vehicle.model}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-[var(--color-primary)] leading-none">{vehicle.price_per_day} <span className="text-sm font-normal text-[var(--color-text-muted)]">MAD</span></p>
                                        <p className="text-[var(--color-text-muted)] text-xs mt-1 uppercase tracking-widest">/ jour</p>
                                    </div>
                                </div>

                                {/* Specs Grid */}
                                <div className="grid grid-cols-2 gap-4 mt-4 mb-8">
                                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                        <CarIcon className="w-4 h-4 mr-2" />
                                        {vehicle.transmission}
                                    </div>
                                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                        <Fuel className="w-4 h-4 mr-2" />
                                        {vehicle.fuel_type}
                                    </div>
                                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                        <Users className="w-4 h-4 mr-2" />
                                        {vehicle.seats} Places
                                    </div>
                                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                        <div className="w-4 h-4 mr-2 font-bold flex items-center justify-center text-xs">P</div>
                                        {vehicle.doors} Portes
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <Link
                                    to={`/vehicles/${vehicle.id}`}
                                    className="mt-auto flex items-center justify-center w-full py-3 bg-[var(--color-background)] border border-[var(--color-border)] hover:bg-[var(--color-primary)] text-white hover:text-slate-900 font-bold tracking-wide rounded-lg transition-all"
                                >
                                    Réserver
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>

                                {vehicle.status === 'booked' && (
                                    <div className="absolute inset-x-0 bottom-0 bg-red-900/90 text-red-100 text-center py-1 text-xs font-bold uppercase tracking-widest border-t border-red-800 backdrop-blur-md">
                                        Indisponible pour le moment
                                    </div>
                                )}
                                {vehicle.status === 'maintenance' && (
                                    <div className="absolute inset-x-0 bottom-0 bg-orange-900/90 text-orange-100 text-center py-1 text-xs font-bold uppercase tracking-widest border-t border-orange-800 backdrop-blur-md">
                                        En maintenance
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
