import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, Clock, XCircle, Edit, Trash2, X, Loader2, Download, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { quotesApi, vehiclesApi, customersApi, type Quote, type Vehicle, type Customer } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Edit },
    sent: { label: 'Envoyé', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
    accepted: { label: 'Accepté', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    rejected: { label: 'Refusé', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
    expired: { label: 'Expiré', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
};

export default function Quotes() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Quote>>({
        customer_id: '',
        vehicle_id: '',
        start_date: '',
        end_date: '',
        pickup_location: 'Agence Taourirt',
        dropoff_location: 'Agence Taourirt',
        daily_rate: 0,
        total_days: 1,
        total_amount: 0,
        status: 'draft',
        notes: '',
        valid_until: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    // Calculate total whenever dates or vehicle/rate change
    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
            const total = days * (formData.daily_rate || 0);
            setFormData(prev => ({ ...prev, total_days: days, total_amount: total }));
        }
    }, [formData.start_date, formData.end_date, formData.daily_rate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [qData, vData, cData] = await Promise.all([
                quotesApi.getAll(),
                vehiclesApi.getAll(),
                customersApi.getAll()
            ]);
            setQuotes(qData);
            setVehicles(vData);
            setCustomers(cData);
        } catch (err: any) {
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (quote: Quote) => {
        setSelectedQuote(quote);
        setFormData({
            ...quote,
            start_date: quote.start_date.split('T')[0],
            end_date: quote.end_date.split('T')[0],
            valid_until: quote.valid_until ? quote.valid_until.split('T')[0] : ''
        });
        setShowForm(true);
    };

    const handleAdd = () => {
        setSelectedQuote(null);
        // Generate a more robust reference
        const prefix = 'DEV';
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        setFormData({
            quote_number: `${prefix}-${datePart}-${randomPart}`,
            customer_id: '',
            vehicle_id: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            pickup_location: 'Agence Taourirt',
            dropoff_location: 'Agence Taourirt',
            daily_rate: 0,
            total_days: 1,
            total_amount: 0,
            status: 'draft',
            notes: '',
            valid_until: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return;
        try {
            await quotesApi.delete(id);
            toast.success('Devis supprimé');
            setQuotes(prev => prev.filter(q => q.id !== id));
        } catch (err: any) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);

            // Strictly filter the payload to only include actual database columns
            const payload = {
                quote_number: formData.quote_number,
                customer_id: formData.customer_id,
                vehicle_id: formData.vehicle_id,
                start_date: formData.start_date,
                end_date: formData.end_date,
                total_amount: formData.total_amount,
                status: formData.status
            };

            if (selectedQuote) {
                await quotesApi.update(selectedQuote.id, payload);
                toast.success('Devis mis à jour');
            } else {
                await quotesApi.create(payload);
                toast.success('Devis créé');
            }
            setShowForm(false);
            loadData();
        } catch (err: any) {
            console.error("Save error details:", err);
            toast.error(err.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVehicleChange = (vId: string) => {
        const vehicle = vehicles.find(v => v.id === vId);
        if (vehicle) {
            setFormData(prev => ({
                ...prev,
                vehicle_id: vId,
                daily_rate: vehicle.price_per_day || 0
            }));
        }
    };

    const filteredQuotes = quotes.filter(q => {
        const matchesSearch =
            q.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.vehicles?.brand?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'all') return matchesSearch;
        return matchesSearch && q.status === filter;
    });

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight uppercase">Gestion des Devis</h1>
                    <p className="text-slate-500 font-medium mt-1">Gérez vos propositions commerciales et suivis clients</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-[#261CC1] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#261CC1]/20 hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> NOUVEAU DEVIS
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher un devis, client ou véhicule..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['all', 'draft', 'sent', 'accepted', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f
                                ? 'bg-[#1C0770] text-white shadow-md'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            {f === 'all' ? 'Tous' : STATUS_MAP[f]?.label || f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quotes Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-bottom border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Véhicule</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Période</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#261CC1]" />
                                    </td>
                                </tr>
                            ) : filteredQuotes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Aucun devis trouvé.
                                    </td>
                                </tr>
                            ) : filteredQuotes.map((quote) => (
                                <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-[#1C0770]">{quote.quote_number}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">{quote.customers?.full_name}</span>
                                            <span className="text-[10px] text-slate-400">{quote.customers?.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {quote.vehicles?.brand} {quote.vehicles?.model}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs font-medium text-slate-500">
                                            <span>Du {new Date(quote.start_date).toLocaleDateString()}</span>
                                            <span>Au {new Date(quote.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-[#261CC1]">{quote.total_amount?.toLocaleString()} MAD</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${STATUS_MAP[quote.status]?.color}`}>
                                            {STATUS_MAP[quote.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/quotes/${quote.id}/print`} className="p-2 text-slate-400 hover:text-[#3A9AFF] transition-colors" title="Voir le devis">
                                                <Search className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => handleEdit(quote)} className="p-2 text-slate-400 hover:text-[#261CC1] transition-colors" title="Modifier">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <Link to={`/admin/quotes/${quote.id}/print?action=print`} target="_blank" className="p-2 text-slate-400 hover:text-[#261CC1] transition-colors" title="Imprimer">
                                                <Printer className="w-4 h-4" />
                                            </Link>
                                            <Link to={`/admin/quotes/${quote.id}/print?action=download`} target="_blank" className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Télécharger PDF">
                                                <Download className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(quote.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Supprimer">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-[#1C0770]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-[scaleIn_0.3s_ease-out]">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-[#1C0770] uppercase">
                                    {selectedQuote ? 'Modifier le Devis' : 'Nouveau Devis'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Référence</label>
                                        <input
                                            type="text"
                                            value={formData.quote_number}
                                            disabled
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-mono font-bold text-[#1C0770] opacity-70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client</label>
                                        <select
                                            required
                                            name="customer_id"
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 font-bold text-slate-700"
                                            value={formData.customer_id}
                                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                        >
                                            <option value="">Sélectionner un client</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Véhicule</label>
                                        <select
                                            required
                                            name="vehicle_id"
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 font-bold text-slate-700"
                                            value={formData.vehicle_id}
                                            onChange={(e) => handleVehicleChange(e.target.value)}
                                        >
                                            <option value="">Sélectionner un véhicule</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate_number})</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 font-bold text-slate-700"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        >
                                            <option value="draft">Brouillon</option>
                                            <option value="sent">Envoyé</option>
                                            <option value="accepted">Accepté</option>
                                            <option value="rejected">Refusé</option>
                                            <option value="expired">Expiré</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Début</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 font-bold text-slate-700"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Fin</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 font-bold text-slate-700"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lieu Retrait</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 font-bold text-slate-700"
                                            value={formData.pickup_location}
                                            onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prix Journalier (MAD)</label>
                                        <input
                                            type="number"
                                            required
                                            name="daily_rate"
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 font-bold text-slate-700"
                                            value={formData.daily_rate}
                                            onChange={(e) => setFormData({ ...formData, daily_rate: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-[#F0F4FF] rounded-3xl flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calcul Total</span>
                                        <span className="font-bold text-[#1C0770]">{formData.total_days} jour(s) × {formData.daily_rate} MAD</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Estimation</span>
                                        <span className="text-2xl font-black text-[#261CC1]">{formData.total_amount?.toLocaleString()} MAD</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes / Conditions particulières</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#261CC1]/20 font-medium text-slate-700 min-h-[100px]"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                                    >
                                        ANNULER
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 py-4 bg-[#261CC1] text-white font-bold rounded-2xl shadow-lg shadow-[#261CC1]/20 hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ENREGISTRER LE DEVIS'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
