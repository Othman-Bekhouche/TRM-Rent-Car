import { Link } from 'react-router-dom';
import { Car, Fuel, Settings, Users, ArrowRight } from 'lucide-react';

// Mock data to visualize the UI
const MOCK_VEHICLES = [
    {
        id: '1',
        brand: 'Mercedes-Benz',
        model: 'S-Class S500',
        price_per_day: 2500,
        image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80',
        transmission: 'Automatique',
        fuel_type: 'Hybride',
        seats: 5,
    },
    {
        id: '2',
        brand: 'Range Rover',
        model: 'Sport HSE',
        price_per_day: 2200,
        image_url: 'https://images.unsplash.com/photo-1606016159991-e44b8ee7bc6d?auto=format&fit=crop&q=80',
        transmission: 'Automatique',
        fuel_type: 'Diesel',
        seats: 5,
    },
    {
        id: '3',
        brand: 'Porsche',
        model: 'Cayenne Coupe',
        price_per_day: 3000,
        image_url: 'https://images.unsplash.com/photo-1503376710356-748af20b66b7?auto=format&fit=crop&q=80',
        transmission: 'Automatique',
        fuel_type: 'Essence',
        seats: 5,
    },
    {
        id: '4',
        brand: 'BMW',
        model: 'M4 Competition',
        price_per_day: 2800,
        image_url: 'https://images.unsplash.com/photo-1617814076367-b77134882df5?auto=format&fit=crop&q=80',
        transmission: 'Automatique',
        fuel_type: 'Essence',
        seats: 4,
    }
];

export default function Vehicles() {
    return (
        <div className="pt-8 pb-24">
            {/* Header */}
            <div className="bg-[var(--color-surface)] py-16 border-b border-[var(--color-surface-light)] mb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Notre Flotte Premium</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Découvrez notre sélection exclusive de véhicules haut de gamme, préparés avec soin pour vous offrir une expérience de conduite inoubliable.
                    </p>
                </div>
            </div>

            {/* Filters (Mock) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex flex-wrap gap-4 items-center justify-center p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-light)] shadow-lg">
                    <button className="px-6 py-2 bg-[var(--color-primary)] text-slate-900 font-bold rounded-lg">Tous</button>
                    <button className="px-6 py-2 bg-[var(--color-background)] text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors">SUV</button>
                    <button className="px-6 py-2 bg-[var(--color-background)] text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors">Berline Luxe</button>
                    <button className="px-6 py-2 bg-[var(--color-background)] text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors">Sport</button>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_VEHICLES.map((vehicle) => (
                        <div key={vehicle.id} className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-surface-light)] flex flex-col group hover:border-[var(--color-primary)] transition-colors duration-300 shadow-xl">
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={vehicle.image_url}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700">
                                    <span className="text-[var(--color-primary)] font-bold text-lg">{vehicle.price_per_day} MAD</span>
                                    <span className="text-slate-300 text-sm"> / jour</span>
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <div className="mb-4">
                                    <h2 className="text-2xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">{vehicle.brand}</h2>
                                    <h3 className="text-lg text-slate-400">{vehicle.model}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center text-slate-300">
                                        <Settings className="w-5 h-5 mr-2 text-slate-500" />
                                        <span className="text-sm">{vehicle.transmission}</span>
                                    </div>
                                    <div className="flex items-center text-slate-300">
                                        <Fuel className="w-5 h-5 mr-2 text-slate-500" />
                                        <span className="text-sm">{vehicle.fuel_type}</span>
                                    </div>
                                    <div className="flex items-center text-slate-300">
                                        <Users className="w-5 h-5 mr-2 text-slate-500" />
                                        <span className="text-sm">{vehicle.seats} Places</span>
                                    </div>
                                    <div className="flex items-center text-slate-300">
                                        <Car className="w-5 h-5 mr-2 text-slate-500" />
                                        <span className="text-sm">Premium</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/vehicles/${vehicle.id}`}
                                    className="mt-auto flex items-center justify-center w-full py-3 bg-[var(--color-background)] hover:bg-[var(--color-surface-light)] border border-slate-600 hover:border-[var(--color-primary)] text-white font-semibold rounded-xl transition-all group/btn cursor-pointer"
                                >
                                    Voir les détails
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:text-[var(--color-primary)] transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
