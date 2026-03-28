import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, X, Loader2, AlertCircle, Check, Car, ImagePlus, Upload, Wrench } from 'lucide-react';
import { vehiclesApi, type Vehicle } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Vehicle>>({
        brand: '',
        model: '',
        year: 2026,
        color: '',
        plate_number: '',
        fuel_type: 'Diesel',
        transmission: 'Manuelle',
        seats: 5,
        doors: 5,
        price_per_day: 0,
        deposit_amount: 0,
        status: 'available',
        description: '',
    });

    // Image state — 4 separate slots for full multi-image CRUD
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [frontImageUrl, setFrontImageUrl] = useState('');
    const [rearImageUrl, setRearImageUrl] = useState('');
    const [interiorImageUrl, setInteriorImageUrl] = useState('');

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehiclesApi.getAll();
            setVehicles(data);
        } catch {
            toast.error("Erreur lors du chargement des véhicules");
        } finally {
            setLoading(false);
        }
    };

    // --- CRUD: EDIT ---
    const handleEdit = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData(vehicle);

        // Extract images by type from vehicle_images array
        const imgs = vehicle.vehicle_images || [];
        const coverImg = imgs.find((img) => img.is_cover)?.image_url || imgs[0]?.image_url || '';
        const frontImg = imgs.find((img) => img.image_url.includes('front'))?.image_url || '';
        const rearImg = imgs.find((img) => img.image_url.includes('rear'))?.image_url || '';
        const interiorImg = imgs.find((img) => img.image_url.includes('interior'))?.image_url || '';

        setCoverImageUrl(coverImg);
        setFrontImageUrl(frontImg);
        setRearImageUrl(rearImg);
        setInteriorImageUrl(interiorImg);
        setShowForm(true);
    };

    // --- CRUD: ADD ---
    const handleAdd = () => {
        setSelectedVehicle(null);
        setFormData({
            brand: '', model: '', year: 2026, color: '', plate_number: '',
            fuel_type: 'Diesel', transmission: 'Manuelle', seats: 5, doors: 5,
            price_per_day: 0, deposit_amount: 0, status: 'available', description: '',
        });
        setCoverImageUrl('');
        setFrontImageUrl('');
        setRearImageUrl('');
        setInteriorImageUrl('');
        setShowForm(true);
    };

    // --- CRUD: DELETE ---
    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;
        try {
            await vehiclesApi.delete(id);
            toast.success('Véhicule supprimé');
            setVehicles(prev => prev.filter(v => v.id !== id));
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    // --- CRUD: SUBMIT (CREATE / UPDATE) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Build vehicle_images array from the 4 image slots
        const dataToSave = { ...formData };
        const images: { image_url: string; is_cover: boolean }[] = [];
        if (coverImageUrl) images.push({ image_url: coverImageUrl, is_cover: true });
        if (frontImageUrl) images.push({ image_url: frontImageUrl, is_cover: false });
        if (rearImageUrl) images.push({ image_url: rearImageUrl, is_cover: false });
        if (interiorImageUrl) images.push({ image_url: interiorImageUrl, is_cover: false });
        dataToSave.vehicle_images = images;

        try {
            if (selectedVehicle) {
                const updated = await vehiclesApi.update(selectedVehicle.id, dataToSave);
                setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
                toast.success('Véhicule mis à jour');
            } else {
                const created = await vehiclesApi.create(dataToSave);
                setVehicles(prev => [created, ...prev]);
                toast.success('Véhicule ajouté');
            }
            setShowForm(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.plate_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'available': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'booked': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'rented': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'maintenance': return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'inactive': return 'bg-slate-50 text-slate-500 border-slate-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available': return 'Disponible';
            case 'booked': return 'Réservé';
            case 'rented': return 'Loué';
            case 'maintenance': return 'Maintenance';
            case 'inactive': return 'Inactif';
            default: return status;
        }
    };

    const getVehicleCover = (v: Vehicle) => {
        const imgs = v.vehicle_images || [];
        return imgs.find(i => i.is_cover)?.image_url || imgs[0]?.image_url || '';
    };

    const [uploading, setUploading] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void, slotName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(slotName);
            const publicUrl = await vehiclesApi.uploadImage(file);
            setter(publicUrl);
            toast.success('Image téléchargée avec succès');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            toast.error('Erreur lors du téléchargement : ' + message);
        } finally {
            setUploading(null);
        }
    };

    // Reusable image field component
    const ImageField = ({ label, value, onChange, placeholder, slotName }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; slotName: string }) => {
        const fileInputRef = useRef<HTMLInputElement>(null);

        return (
            <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
                <div className="flex gap-2">
                    <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder={placeholder} />
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, onChange, slotName)} />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading === slotName}
                        className="px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors flex items-center justify-center shrink-0"
                    >
                        {uploading === slotName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </button>
                </div>
                {value ? (
                    <div className="mt-1 p-2 border border-slate-100 rounded-xl bg-white flex items-center gap-3">
                        <img src={value} alt={label} className="h-16 w-24 object-contain rounded-lg bg-slate-50" onError={(e) => { (e.target as HTMLImageElement).src = '/images/cars/default.png'; }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400 truncate">{value}</p>
                        </div>
                        <button type="button" onClick={() => onChange('')} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer cette image">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="mt-1 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
                        <ImagePlus className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                        <p className="text-xs text-slate-400">Collez une URL ou téléchargez une image</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Flotte Véhicules</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez le catalogue complet des véhicules TRM Rent Car</p>
                </div>
                {!showForm && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Ajouter un véhicule
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1C0770]">{selectedVehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}</h2>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Vehicle Info Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4 md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Marque *</label>
                                        <input required name="brand" type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="ex: Peugeot" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Modèle *</label>
                                        <input required name="model" type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="ex: 208" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Année</label>
                                        <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Immatriculation *</label>
                                        <input required name="plate_number" type="text" value={formData.plate_number} onChange={e => setFormData({ ...formData, plate_number: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="ex: 208-A-001" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Couleur</label>
                                        <input type="text" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="ex: Noir" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Carburant</label>
                                        <select value={formData.fuel_type} onChange={e => setFormData({ ...formData, fuel_type: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800">
                                            <option value="Diesel">Diesel</option>
                                            <option value="Essence">Essence</option>
                                            <option value="Hybride">Hybride</option>
                                            <option value="Electrique">Electrique</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transmission</label>
                                        <select value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800">
                                            <option value="Manuelle">Manuelle</option>
                                            <option value="Automatique">Automatique</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Statut</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800">
                                            <option value="available">Disponible</option>
                                            <option value="booked">Réservé</option>
                                            <option value="rented">Loué</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="inactive">Inactif</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prix par jour (MAD) *</label>
                                    <input required name="price_per_day" type="number" value={formData.price_per_day} onChange={e => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] font-bold text-[#1C0770]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sièges / Portes</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={formData.seats} onChange={e => setFormData({ ...formData, seats: parseInt(e.target.value) })} className="w-1/2 bg-white border border-slate-200 rounded-xl p-3 text-xs" placeholder="Sièges" />
                                        <input type="number" value={formData.doors} onChange={e => setFormData({ ...formData, doors: parseInt(e.target.value) })} className="w-1/2 bg-white border border-slate-200 rounded-xl p-3 text-xs" placeholder="Portes" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ====== IMAGES SECTION — CRUD COMPLET ====== */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <ImagePlus className="w-5 h-5 text-[#3A9AFF]" />
                                <h3 className="text-sm font-bold text-[#1C0770]">Galerie Photos du Véhicule</h3>
                                <span className="text-xs text-slate-400 ml-auto">
                                    {[coverImageUrl, frontImageUrl, rearImageUrl, interiorImageUrl].filter(Boolean).length} / 4 photos
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">Ajoutez jusqu'à 4 photos : Couverture (principale), Vue Avant, Vue Arrière et Intérieur. Collez le chemin ou l'URL de chaque image.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <ImageField label="📷 Photo Couverture (principale)" value={coverImageUrl} onChange={setCoverImageUrl} placeholder="/images/cars/voiture_cover.png" slotName="cover" />
                                <ImageField label="🚗 Vue Avant" value={frontImageUrl} onChange={setFrontImageUrl} placeholder="/images/cars/voiture_front.png" slotName="front" />
                                <ImageField label="🔙 Vue Arrière" value={rearImageUrl} onChange={setRearImageUrl} placeholder="/images/cars/voiture_rear.png" slotName="rear" />
                                <ImageField label="🪑 Intérieur" value={interiorImageUrl} onChange={setInteriorImageUrl} placeholder="/images/cars/voiture_interior.png" slotName="interior" />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="Description du véhicule..." />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Annuler</button>
                            <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {selectedVehicle ? 'Mettre à jour' : 'Enregistrer le véhicule'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Flotte</p>
                            <p className="text-3xl font-black text-[#1C0770] mt-1">{vehicles.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Disponibles</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">{vehicles.filter(v => v.status === 'available').length}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">En Location</p>
                            <p className="text-3xl font-black text-blue-600 mt-1">{vehicles.filter(v => v.status === 'booked').length}</p>
                        </div>
                    </div>

                    {/* Vehicles Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher marque, modèle, plaque..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-[#3A9AFF] focus:border-[#3A9AFF] block pl-10 p-3 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="w-10 h-10 text-[#3A9AFF] animate-spin" />
                                    <p className="text-slate-400 text-sm font-medium">Chargement de la flotte...</p>
                                </div>
                            ) : filteredVehicles.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                            <th className="p-4">Véhicule</th>
                                            <th className="p-4">Plaque</th>
                                            <th className="p-4 hidden md:table-cell">Couleur</th>
                                            <th className="p-4 hidden lg:table-cell">Entretien</th>
                                            <th className="p-4">Prix/Jour</th>
                                            <th className="p-4">Statut</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredVehicles.map((v) => (
                                            <tr key={v.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50 group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-11 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-100 group-hover:shadow-md transition-shadow relative">
                                                            {getVehicleCover(v) ? (
                                                                <img src={getVehicleCover(v)} alt="" className="w-full h-full object-contain" />
                                                            ) : (
                                                                <Car className="w-6 h-6 text-slate-400" />
                                                            )}
                                                            {(v.next_service_mileage && v.mileage >= v.next_service_mileage - 1000) && (
                                                                <div className="absolute top-0 right-0 p-1 bg-red-500 rounded-bl-lg shadow-sm">
                                                                    <AlertCircle className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-800">{v.brand} {v.model}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{v.year} · {v.transmission}</p>
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black">{v.mileage?.toLocaleString()} KM</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-[#261CC1] font-bold">{v.plate_number}</td>
                                                <td className="p-4 text-slate-600 hidden md:table-cell">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs">{v.color}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold">{v.fuel_type}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 hidden lg:table-cell">
                                                    {v.next_service_mileage ? (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <Wrench className="w-3 h-3 text-emerald-500" />
                                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Planifié à</span>
                                                            </div>
                                                            <p className={`text-xs font-black ${v.mileage >= v.next_service_mileage - 1000 ? 'text-red-600' : 'text-emerald-700'}`}>
                                                                {v.next_service_mileage.toLocaleString()} KM
                                                            </p>
                                                            <div className="w-20 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                                <div
                                                                    className={`h-full ${v.mileage >= v.next_service_mileage - 1000 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                    style={{ width: `${Math.min((v.mileage / v.next_service_mileage) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-300 font-bold uppercase">Non configuré</span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-black text-[#1C0770]">{v.price_per_day} <span className="text-[10px] text-slate-400">MAD</span></td>
                                                <td className="p-4">
                                                    <span className={`${getStatusStyle(v.status)} px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap`}>
                                                        {getStatusLabel(v.status)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => handleEdit(v)} title="Mise à jour technique" className="p-2 text-slate-400 hover:text-[#261CC1] hover:bg-[#261CC1]/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(v.id)} title="Retirer de la flotte" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-20">
                                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">Aucun véhicule trouvé</p>
                                    <p className="text-slate-400 text-sm mt-1">Essayez d'ajuster votre recherche ou ajoutez un nouveau véhicule.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
