import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Fuel, Users, MapPin, Search as Box, CheckCircle, CreditCard, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function VehicleDetail() {
    const { id: vehicleId } = useParams();
    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                if (!vehicleId) return;
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('*, vehicle_images(*)')
                    .eq('id', vehicleId)
                    .single();

                if (error) throw error;
                if (data) {
                    const coverImage = data.vehicle_images?.find((img: any) => img.is_cover)?.image_url
                        || data.vehicle_images?.[0]?.image_url
                        || '/images/cars/default.png';

                    setVehicle({
                        ...data,
                        image_url: coverImage
                    });
                }
            } catch (error) {
                console.error("Error fetching vehicle:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [vehicleId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-[var(--color-background)]">
                <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[var(--color-background)]">
                <h2 className="text-2xl font-bold text-white mb-4">Véhicule introuvable</h2>
                <Link to="/vehicles" className="text-[var(--color-primary)] hover:underline">
                    Retour au catalogue
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-24 bg-[var(--color-background)] min-h-screen font-sans">
            {/* SaaS Header Breadcrumb Navigation */}
            <div className="bg-[#141C2B] border-b border-[var(--color-border)] py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/vehicles" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
                    </Link>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column (Images & Details) */}
                    <div className="lg:col-span-2 flex flex-col gap-10">
                        {/* Title Section */}
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                                    {vehicle.brand} <span className="text-[var(--color-primary)]">{vehicle.model}</span>
                                </h1>
                                <span className="px-4 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-black tracking-widest uppercase rounded-lg border border-[var(--color-primary)]/50">
                                    Disponible
                                </span>
                            </div>
                            <p className="text-slate-400 text-lg flex items-center font-medium">
                                <MapPin className="w-4 h-4 mr-2" />
                                Retrait à l'Agence Taourirt ou Livraison (Oujda, Nador, Fès)
                            </p>
                        </div>

                        {/* Image Gallery */}
                        <div className="flex flex-col gap-4">
                            {/* Main Large Image */}
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 relative overflow-hidden group h-[400px]">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-50" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[var(--color-primary)]/10 blur-[150px] rounded-full pointer-events-none" />
                                <img
                                    src={selectedImage || vehicle.image_url}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className="w-full h-full object-contain relative z-10 mix-blend-screen scale-105 transition-transform duration-700"
                                />
                            </div>

                            {/* Thumbnails */}
                            {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                    {(vehicle.vehicle_images as any[]).map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedImage(img.image_url)}
                                            className={`h-24 bg-[var(--color-surface)] border rounded-xl p-2 cursor-pointer overflow-hidden flex items-center justify-center transition-all ${selectedImage === img.image_url ? 'border-[var(--color-primary)] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'}`}
                                        >
                                            <img src={img.image_url} alt="Vue véhicule" className="w-full h-full object-contain mix-blend-screen" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Specifications Grid */}
                        <div className="bg-[#141C2B] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl">
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider">Caractéristiques <span className="text-[var(--color-primary)]">Techniques</span></h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] flex flex-col items-center justify-center text-center">
                                    <Box className="w-6 h-6 text-[var(--color-primary)] mb-2" />
                                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Boîte</span>
                                    <span className="text-sm text-white font-bold">{vehicle.transmission}</span>
                                </div>
                                <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] flex flex-col items-center justify-center text-center">
                                    <Fuel className="w-6 h-6 text-[var(--color-primary)] mb-2" />
                                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Carburant</span>
                                    <span className="text-sm text-white font-bold">{vehicle.fuel_type}</span>
                                </div>
                                <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] flex flex-col items-center justify-center text-center">
                                    <Users className="w-6 h-6 text-[var(--color-primary)] mb-2" />
                                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Places</span>
                                    <span className="text-sm text-white font-bold">{vehicle.seats} Passagers</span>
                                </div>
                                <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] flex flex-col items-center justify-center text-center">
                                    <div className="w-6 h-6 text-[var(--color-primary)] mb-2 font-black flex items-center justify-center text-lg">P</div>
                                    <span className="text-xs text-slate-500 uppercase tracking-widest mb-1">Portes</span>
                                    <span className="text-sm text-white font-bold">{vehicle.doors} Portes</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 border-t border-[var(--color-border)] pt-6">
                                <div className="flex items-center text-sm font-medium text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-[var(--color-primary)] mr-2" /> Couleur : <span className="text-white ml-2">{vehicle.color}</span>
                                </div>
                                <div className="flex items-center text-sm font-medium text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-[var(--color-primary)] mr-2" /> Traction : <span className="text-white ml-2">{vehicle.traction}</span>
                                </div>
                                <div className="flex items-center text-sm font-medium text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-[var(--color-primary)] mr-2" /> Année : <span className="text-white ml-2">{vehicle.year}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-[#141C2B] rounded-3xl p-8 border border-[var(--color-border)] shadow-xl">
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider">Aperçu du <span className="text-[var(--color-primary)]">Véhicule</span></h3>
                            <p className="text-slate-300 leading-loose text-lg font-light">
                                {vehicle.description}
                            </p>
                        </div>

                    </div>

                    {/* Right Column (Booking SaaS Widget) */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#141C2B] p-8 rounded-3xl border border-[var(--color-border)] shadow-2xl sticky top-24">

                            <div className="mb-8 pb-6 border-b border-[var(--color-border)]/50">
                                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">Prix location TTC</p>
                                <div className="flex items-end">
                                    <span className="text-5xl font-black text-[var(--color-primary)] leading-none">{vehicle.price_per_day}</span>
                                    <span className="text-sm ml-2 text-slate-400 font-bold uppercase tracking-widest mb-1">MAD / jour</span>
                                </div>
                                <div className="mt-5 flex items-center text-xs text-slate-300 bg-[var(--color-background)] border border-[var(--color-primary)]/30 p-4 rounded-xl font-medium">
                                    <Shield className="w-5 h-5 mr-3 text-[var(--color-primary)]" />
                                    Assurance tous risques incluse (sans caution)
                                </div>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                {/* Configuration Date */}
                                <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-4">
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lieu de retrait</label>
                                        <select className="w-full bg-transparent border-b border-[var(--color-border)] text-white text-sm focus:ring-0 focus:border-[var(--color-primary)] block pb-2 px-0 appearance-none font-medium">
                                            <option className="bg-[#141C2B]">Agence Taourirt (Siège)</option>
                                            <option className="bg-[#141C2B]">Livraison Oujda</option>
                                            <option className="bg-[#141C2B]">Livraison Nador</option>
                                            <option className="bg-[#141C2B]">Livraison Fès</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Retrait</label>
                                            <input type="date" className="w-full bg-transparent border-b border-[var(--color-border)] text-white text-sm focus:ring-0 focus:border-[var(--color-primary)] block pb-2 px-0 font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Retour</label>
                                            <input type="date" className="w-full bg-transparent border-b border-[var(--color-border)] text-white text-sm focus:ring-0 focus:border-[var(--color-primary)] block pb-2 px-0 font-medium" />
                                        </div>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-3">
                                    <label className="flex items-center p-3 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary)]/5 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-background)] border-[var(--color-primary)] rounded focus:ring-[var(--color-primary)] focus:ring-2" defaultChecked />
                                        <span className="ml-3 text-sm font-bold text-white uppercase tracking-wider">Assurance Multirisque</span>
                                        <span className="ml-auto text-xs font-bold text-[var(--color-primary)]">INCLUS</span>
                                    </label>
                                    <label className="flex items-center p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-background)] cursor-pointer transition-colors">
                                        <input type="checkbox" className="w-4 h-4 text-[var(--color-primary)] bg-[#141C2B] border-slate-600 rounded focus:ring-[var(--color-primary)]" />
                                        <span className="ml-3 text-sm font-medium text-slate-300">Siège Enfant</span>
                                        <span className="ml-auto text-xs font-bold text-slate-400">+50 MAD/J</span>
                                    </label>
                                </div>

                                <Link
                                    to={`/booking/checkout/${vehicle.id}`}
                                    className="flex w-full justify-center items-center px-6 py-4 border border-transparent text-sm font-black rounded-xl text-[#0B0F19] bg-[var(--color-primary)] hover:bg-white hover:text-[#0B0F19] uppercase tracking-widest transition-all shadow-lg hover:-translate-y-1"
                                >
                                    Poursuivre la Réservation
                                </Link>

                                <div className="flex items-center justify-center text-xs text-slate-500 font-medium">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Paiement sécurisé ou à la livraison
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
