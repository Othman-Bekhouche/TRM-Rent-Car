import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, FileText, Loader2, Archive, Calendar, User, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reservationsApi } from '../../lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    completed: { label: 'Terminé', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
    cancelled: { label: 'Annulé', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: XCircle },
    returned: { label: 'Clôturé (Retour)', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Archive },
};

export default function History() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await reservationsApi.getAll();
            // Filter only closed/finished statuses
            const historyData = data.filter((r: any) =>
                ['completed', 'cancelled', 'returned'].includes(r.status)
            );
            setReservations(historyData);
        } catch (err) {
            console.error("Error loading history:", err);
        } finally {
            setLoading(false);
        }
    };

    const YEARS = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
    const MONTHS = [
        { val: '0', label: 'Janvier' }, { val: '1', label: 'Février' }, { val: '2', label: 'Mars' },
        { val: '3', label: 'Avril' }, { val: '4', label: 'Mai' }, { val: '5', label: 'Juin' },
        { val: '6', label: 'Juillet' }, { val: '7', label: 'Août' }, { val: '8', label: 'Septembre' },
        { val: '9', label: 'Octobre' }, { val: '10', label: 'Novembre' }, { val: '11', label: 'Décembre' }
    ];

    const filteredHistory = reservations.filter(r => {
        const date = new Date(r.start_date);
        const matchesYear = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
        const matchesMonth = selectedMonth === 'all' || date.getMonth().toString() === selectedMonth;
        const matchesSearch =
            (r.vehicles?.brand + ' ' + r.vehicles?.model).toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.reservation_number || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesYear && matchesMonth && matchesSearch;
    });

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-slate-900/20 shrink-0">
                        <Archive className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#1C0770] tracking-tighter uppercase leading-none">Historique</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Archives & Dossiers Clôturés</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Filters */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:ring-2 ring-slate-100 transition-all flex-1 md:flex-none"
                        >
                            <option value="all">Tous les mois</option>
                            {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-xl px-4 py-3 outline-none focus:ring-2 ring-slate-100 transition-all flex-1 md:flex-none"
                        >
                            <option value="all">Toutes les années</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 text-slate-800 text-sm rounded-xl focus:ring-2 ring-slate-100 focus:bg-white block pl-12 p-3.5 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Accès aux archives...</p>
                </div>
            ) : filteredHistory.length > 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[9px] uppercase tracking-[0.2em] font-black">
                                    <th className="px-8 py-5">Référence</th>
                                    <th className="px-8 py-5">Client</th>
                                    <th className="px-8 py-5">Véhicule</th>
                                    <th className="px-8 py-5">Période Réalisée</th>
                                    <th className="px-8 py-5">Statut Final</th>
                                    <th className="px-8 py-5 text-right">Recette</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredHistory.map((r) => {
                                    const st = STATUS_MAP[r.status] || { label: r.status, color: 'bg-slate-50 text-slate-400', icon: Archive };
                                    const StIcon = st.icon;
                                    return (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className="text-[#261CC1] font-mono text-[10px] font-bold">#{r.reservation_number || r.id.substring(0, 8).toUpperCase()}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User className="w-4 h-4" /></div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-[#1C0770] uppercase leading-none">{r.customers?.full_name}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{r.customers?.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <Car className="w-4 h-4 text-slate-300" />
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-700 uppercase leading-none">{r.vehicles?.brand} {r.vehicles?.model}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{r.vehicles?.plate_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(r.start_date), 'dd MMM')} – {format(new Date(r.end_date), 'dd MMM yyyy', { locale: fr })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`${st.color} inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-current/10`}>
                                                    <StIcon className="w-3 h-3" /> {st.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-[#1C0770] text-sm tracking-tighter">
                                                {Number(r.total_price).toLocaleString()} <span className="text-[9px] text-slate-300">MAD</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link
                                                    to={`/admin/reservations/${r.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1C0770] hover:text-white hover:border-[#1C0770] transition-all shadow-sm"
                                                >
                                                    <FileText className="w-3 h-3" /> Dossier
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
                        <Archive className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-[#1C0770] uppercase">Aucun archive</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Les dossiers apparaîtront ici une fois clôturés</p>
                </div>
            )}
        </div>
    );
}
