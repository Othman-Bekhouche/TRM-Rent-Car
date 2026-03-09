import { Link } from 'react-router-dom';
import { Car as CarIcon, Users, Fuel, ArrowRight, Calendar, Filter } from 'lucide-react';

// Demo Data for Moroccan Market
const MOCK_VEHICLES = [
    {
        id: '1',
        brand: 'Dacia',
        model: 'Logan',
        image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80',
        price_per_day: 250,
        category: 'Économique',
        transmission: 'Manuelle',
        fuel_type: 'Diesel',
        seats: 5,
        status: 'available'
    },
    {
        id: '2',
        brand: 'Peugeot',
        model: '208',
        image_url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80',
        price_per_day: 300,
        category: 'Citadine',
        transmission: 'Automatique',
        fuel_type: 'Essence',
        seats: 5,
        status: 'available'
    },
    {
        id: '3',
        brand: 'Renault',
        model: 'Clio 5',
        image_url: 'https://images.unsplash.com/photo-1542318858-a5796a5af520?auto=format&fit=crop&q=80',
        price_per_day: 350,
        category: 'Citadine',
        transmission: 'Automatique',
        fuel_type: 'Diesel',
        seats: 5,
        status: 'booked'
    },
    {
        id: '4',
        brand: 'Dacia',
        model: 'Duster',
        image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80',
        price_per_day: 450,
        category: 'SUV',
        transmission: 'Manuelle',
        fuel_type: 'Diesel',
        seats: 5,
        status: 'available'
    },
    {
        id: '5',
        brand: 'Hyundai',
        model: 'Tucson',
        image_url: 'https://images.unsplash.com/photo-1627454819213-f56f18b52a92?auto=format&fit=crop&q=80',
        price_per_day: 800,
        category: 'SUV Premium',
        transmission: 'Automatique',
        fuel_type: 'Diesel',
        seats: 5,
        status: 'available'
    },
    {
        id: '6',
        brand: 'Mercedes-Benz',
        model: 'Classe C',
        image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80',
        price_per_day: 1500,
        category: 'Luxe',
        transmission: 'Automatique',
        fuel_type: 'Diesel',
        seats: 5,
        status: 'available'
    }
];

export default function Vehicles() {
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
                        Que vous cherchiez la praticité d'une citadine ou le prestige d'une berline de luxe, TRM Rent Car vous propose un large choix pour vos déplacements au Maroc.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Advanced Filters */}
                <div className="glass-card p-6 rounded-sm mb-12 shadow-2xl relative z-20 hover:border-[var(--color-primary)]/30 transition-colors">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-lg">
                            <Filter className="w-5 h-5" />
                            <span>Affiner votre recherche</span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto flex-1 md:ml-8">
                            <select className="bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5 max-w-[200px]">
                                <option value="">Toutes les Villes</option>
                                <option value="casablanca">Casablanca</option>
                                <option value="marrakech">Marrakech</option>
                                <option value="rabat">Rabat</option>
                                <option value="tanger">Tanger</option>
                                <option value="fes">Fès</option>
                                <option value="oujda">Oujda</option>
                            </select>
                            <select className="bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5 max-w-[200px]">
                                <option value="">Toutes Catégories</option>
                                <option value="eco">Économique</option>
                                <option value="city">Citadine</option>
                                <option value="suv">SUV</option>
                                <option value="luxe">Luxe & Premium</option>
                            </select>
                            <select className="bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5 max-w-[200px]">
                                <option value="">Boîte de Vitesse</option>
                                <option value="auto">Automatique</option>
                                <option value="man">Manuelle</option>
                            </select>
                            <button className="bg-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-slate-900 text-white font-medium text-sm rounded-sm px-5 py-2.5 text-center transition-colors">
                                Rechercher
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vehicle Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_VEHICLES.map((vehicle) => (
                        <div key={vehicle.id} className="glass-card rounded-sm overflow-hidden flex flex-col group hover:-translate-y-1 hover:border-[var(--color-primary)]/50 transition-all duration-300 shadow-2xl">
                            {/* Image Container */}
                            <div className="relative h-56 bg-gradient-to-t from-[var(--color-card)] to-[#111827] overflow-hidden flex items-center justify-center border-b border-[var(--color-border)]">
                                <img
                                    src={vehicle.image_url}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                />
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[var(--color-text-main)] text-xs font-semibold tracking-wider rounded border border-white/10 shadow-sm uppercase">
                                        {vehicle.category}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] to-transparent opacity-80" />
                            </div>

                            {/* Content Container */}
                            <div className="p-6 flex-1 flex flex-col relative z-10 bg-[var(--color-card)]">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-white tracking-tight mb-1">{vehicle.brand}</h3>
                                        <p className="text-[var(--color-primary)] font-medium text-lg">{vehicle.model}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-white leading-none">{vehicle.price_per_day} <span className="text-sm font-normal text-[var(--color-text-muted)]">MAD</span></p>
                                        <p className="text-[var(--color-text-muted)] text-xs mt-1 uppercase tracking-widest">/ jour</p>
                                    </div>
                                </div>

                                {/* Specs Grid */}
                                <div className="grid grid-cols-2 gap-4 mt-4 mb-8">
                                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                        <CarIcon className="w-4 h-4 mr-2 opacity-70" />
                                        {vehicle.transmission}
                                    </div>
                                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                        <Fuel className="w-4 h-4 mr-2 opacity-70" />
                                        {vehicle.fuel_type}
                                    </div>
                                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                        <Users className="w-4 h-4 mr-2 opacity-70" />
                                        {vehicle.seats} Places
                                    </div>
                                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                                        <Calendar className="w-4 h-4 mr-2 opacity-70" />
                                        250 km / j
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <Link
                                    to={`/vehicles/${vehicle.id}`}
                                    className="mt-auto flex items-center justify-center w-full py-3 bg-transparent border border-[var(--color-primary)] hover:bg-[var(--color-primary)] text-[var(--color-primary)] hover:text-slate-900 font-bold tracking-wide rounded-sm transition-all group/btn"
                                >
                                    Détails & Réservation
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>

                                {vehicle.status === 'booked' && (
                                    <div className="absolute inset-x-0 bottom-0 bg-red-900/90 text-red-100 text-center py-1.5 text-xs font-bold uppercase tracking-widest border-t border-red-800">
                                        Indisponible pour le moment
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
