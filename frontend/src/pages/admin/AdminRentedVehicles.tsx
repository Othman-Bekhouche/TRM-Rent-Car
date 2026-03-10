import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, AlertCircle, Car, Calendar, ExternalLink, Key } from 'lucide-react';
import { reservationsApi, type Reservation } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminRentedVehicles() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRentedVehicles();
    }, []);

    const fetchRentedVehicles = async () => {
        try {
            setLoading(true);
            const allRes = await reservationsApi.getAll();
            // Filter only rented vehicles
            const rented = allRes.filter(r => r.status === 'rented');
            setReservations(rented);
        } catch (err: any) {
            toast.error("Erreur lors du chargement des véhicules loués");
        } finally {
            setLoading(false);
        }
    };

    const filteredReservations = reservations.filter(r => {
        const term = searchTerm.toLowerCase();
        return (
            r.vehicles?.brand.toLowerCase().includes(term) ||
            r.vehicles?.model.toLowerCase().includes(term) ||
            r.vehicles?.plate_number.toLowerCase().includes(term) ||
            r.customers?.full_name.toLowerCase().includes(term) ||
            r.reservation_number?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Véhicules Loués</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez et suivez les véhicules actuellement en cours de location</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 line-clamp-2">
                <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par véhicule, client, réf..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#3A9AFF] focus:border-[#3A9AFF] block pl-10 p-3 transition-colors"
                        />
                    </div>
                    <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100 flex items-center gap-2">
                        <Key className="w-4 h-4" /> {reservations.length} Véhicules en circulation
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 text-[#3A9AFF] animate-spin" />
                        <p className="text-slate-400 text-sm font-medium">Récupération des données...</p>
                    </div>
                ) : filteredReservations.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredReservations.map((res) => {
                            const vehicle = res.vehicles;
                            const customer = res.customers;

                            // Get Cover Image
                            const imgs = vehicle?.vehicle_images || [];
                            const coverImg = imgs.find(i => i.is_cover)?.image_url || imgs[0]?.image_url || '';

                            return (
                                <div key={res.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row gap-5 hover:border-purple-200 hover:shadow-md transition-all group bg-white">
                                    <div className="w-full sm:w-32 h-24 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                                        {coverImg ? (
                                            <img src={coverImg} alt={`${vehicle?.brand} ${vehicle?.model}`} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Car className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{vehicle?.brand} {vehicle?.model}</h3>
                                                <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-purple-200">En cours</span>
                                            </div>
                                            <p className="text-xs font-mono text-[#261CC1] font-bold mb-3">{vehicle?.plate_number}</p>
                                        </div>

                                        <div className="space-y-1.5 text-xs text-slate-500">
                                            <p className="flex items-center gap-2"><span className="w-4 flex justify-center text-slate-400">👤</span> <span className="font-semibold text-slate-700">{customer?.full_name}</span></p>
                                            <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Du {new Date(res.start_date).toLocaleDateString()} au {new Date(res.end_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-center gap-2 shrink-0">
                                        <Link
                                            to={`/admin/reservations/${res.id}`}
                                            className="w-full sm:w-auto text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            Voir dossier <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">Aucun véhicule actuellement loué</p>
                        <p className="text-slate-400 text-sm mt-1">Tous vos véhicules sont disponibles ou en attente.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
