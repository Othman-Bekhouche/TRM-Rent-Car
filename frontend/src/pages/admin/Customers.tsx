import { useState, useEffect } from 'react';
import { Search, Download, Phone, MapPin, Edit, Trash2, X, Check, Loader2, AlertCircle, User, Mail, Shield, Plus } from 'lucide-react';
import { customersApi, type Customer } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Customer>>({
        full_name: '',
        email: '',
        phone: '',
        cin: '',
        passport: '',
        address: '',
        city: 'Taourirt',
        status: 'Actif',
        notes: '',
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await customersApi.getAll();
            setCustomers(data);
        } catch (err: any) {
            toast.error("Erreur lors du chargement des clients");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData(customer);
        setShowForm(true);
    };

    const handleAdd = () => {
        setSelectedCustomer(null);
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            cin: '',
            passport: '',
            address: '',
            city: 'Taourirt',
            status: 'Actif',
            notes: '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
        try {
            await customersApi.delete(id);
            toast.success('Client supprimé');
            setCustomers(prev => prev.filter(c => c.id !== id));
        } catch (err: any) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (selectedCustomer) {
                const updated = await customersApi.update(selectedCustomer.id, formData);
                setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
                toast.success('Client mis à jour');
            } else {
                const created = await customersApi.create(formData);
                setCustomers(prev => [created, ...prev]);
                toast.success('Client ajouté');
            }
            setShowForm(false);
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cin?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'VIP': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Actif': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Nouveau': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Bloqué': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Base Clients</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez la relation client et l'historique des réservations</p>
                </div>
                <div className="flex gap-2">
                    {!showForm && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-sm font-bold text-white rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all"
                        >
                            <Plus className="w-4 h-4" /> Ajouter un client
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:shadow-md transition-all">
                        <Download className="w-4 h-4" /> Exporter CSV
                    </button>
                </div>
            </div>

            {showForm ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1C0770]">{selectedCustomer ? 'Modifier le client' : 'Nouveau client'}</h2>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom Complet *</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input required type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="Prénom Nom" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="email@exemple.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Téléphone *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="+212 ..." />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CIN</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="text" value={formData.cin} onChange={e => setFormData({ ...formData, cin: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] text-slate-800" placeholder="ex: BH123456" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passeport</label>
                                        <input type="text" value={formData.passport} onChange={e => setFormData({ ...formData, passport: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" placeholder="ex: EX12345" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse</label>
                                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" placeholder="Adresse complète" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ville</label>
                                        <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" placeholder="Taourirt" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Statut</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]">
                                            <option value="Actif">Actif</option>
                                            <option value="VIP">VIP</option>
                                            <option value="Nouveau">Nouveau</option>
                                            <option value="Bloqué">Bloqué</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</label>
                            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full bg-[#F0F4FF] border border-slate-200 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" placeholder="Observations particulières..." />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Annuler</button>
                            <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {selectedCustomer ? 'Mettre à jour' : 'Enregistrer le client'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Clients</p>
                            <p className="text-3xl font-black text-[#1C0770] mt-1">{customers.length}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Actifs</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">{customers.filter(c => c.status === 'Actif' || c.status === 'VIP').length}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs text-[#3A9AFF] font-bold uppercase tracking-wider">VIP</p>
                            <p className="text-3xl font-black text-[#3A9AFF] mt-1">{customers.filter(c => c.status === 'VIP').length}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Nouveaux</p>
                            <p className="text-3xl font-black text-amber-600 mt-1">{customers.filter(c => c.status === 'Nouveau').length}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher nom, email, CIN, téléphone..."
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
                                    <p className="text-slate-400 text-sm font-medium">Chargement des clients...</p>
                                </div>
                            ) : filteredCustomers.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F0F4FF] text-slate-400 text-[11px] uppercase tracking-[0.15em] font-bold">
                                            <th className="p-4">Client</th>
                                            <th className="p-4">CIN</th>
                                            <th className="p-4">Contact</th>
                                            <th className="p-4">Ville</th>
                                            <th className="p-4">Réservations</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredCustomers.map((c) => (
                                            <tr key={c.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-[#261CC1] to-[#3A9AFF] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                            {c.full_name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{c.full_name}</p>
                                                            <p className="text-xs text-slate-400">{c.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-[#261CC1] font-bold">{c.cin || '-'}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-slate-500 text-xs"><Phone className="w-3 h-3" /> {c.phone}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 text-slate-500 text-xs"><MapPin className="w-3 h-3" /> {c.city}</div>
                                                </td>
                                                <td className="p-4 text-center font-bold text-slate-700">{c.total_reservations || 0}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span className={`${getStatusStyle(c.status)} px-3 py-1.5 rounded-full text-xs font-bold border mr-4`}>{c.status}</span>
                                                        <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-[#261CC1] hover:bg-[#261CC1]/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-20">
                                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">Aucun client trouvé</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

