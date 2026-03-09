import { useState } from 'react';
import { Mail, Search, Star, Trash2, Clock, Send } from 'lucide-react';

export default function Messages() {
    const [filter, setFilter] = useState('all');

    const mockMessages = [
        { id: 1, sender: 'Alaoui Mohammed', subject: 'Question sur réservation #1260', preview: 'Bonjour, j\'aimerais savoir s\'il est possible de...', date: '10:30', status: 'unread', priority: 'high' },
        { id: 2, sender: 'Sophie Martin', subject: 'Prolongation de contrat', preview: 'Serait-il possible de garder la Peugeot 208 une journée de plus ?', date: 'Hier', status: 'read', priority: 'medium' },
        { id: 3, sender: 'Hassan Benali', subject: 'Document manquant', preview: 'Voici la copie de mon permis de conduire mise à jour...', date: 'Lundi', status: 'read', priority: 'low' },
    ];

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Boîte Mail</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez les communications avec vos clients</p>
                </div>
                <button className="bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                    <Send className="w-4 h-4" /> Nouveau Message
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar */}
                <div className="w-full md:w-64 border-r border-slate-100 p-6 space-y-2 bg-slate-50/50">
                    <button onClick={() => setFilter('all')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm font-bold ${filter === 'all' ? 'bg-[#261CC1] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-white'}`}>
                        <div className="flex items-center gap-3"><Mail className="w-4 h-4" /> Tous</div>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">12</span>
                    </button>
                    <button onClick={() => setFilter('unread')} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm font-bold ${filter === 'unread' ? 'bg-[#261CC1] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-white'}`}>
                        <div className="flex items-center gap-3"><Clock className="w-4 h-4" /> Non-lus</div>
                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">3</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm font-bold text-slate-500 hover:bg-white">
                        <div className="flex items-center gap-3"><Star className="w-4 h-4" /> Importants</div>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm font-bold text-slate-500 hover:bg-white">
                        <div className="flex items-center gap-3"><Send className="w-4 h-4" /> Envoyés</div>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-sm font-bold text-slate-500 hover:bg-white">
                        <div className="flex items-center gap-3"><Trash2 className="w-4 h-4" /> Corbeille</div>
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-white">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un message ou un client..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#261CC1] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto">
                        {mockMessages.map((msg) => (
                            <div key={msg.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-4 ${msg.status === 'unread' ? 'bg-blue-50/30' : ''}`}>
                                <div className="mt-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs ${msg.id % 2 === 0 ? 'bg-gradient-to-br from-[#3A9AFF] to-[#261CC1]' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                                        {msg.sender[0]}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`text-sm tracking-tight truncate ${msg.status === 'unread' ? 'font-black text-[#1C0770]' : 'font-bold text-slate-700'}`}>
                                            {msg.sender}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{msg.date}</span>
                                    </div>
                                    <p className={`text-xs mb-1 truncate ${msg.status === 'unread' ? 'font-bold text-slate-600' : 'text-slate-500'}`}>
                                        {msg.subject}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate leading-relaxed">
                                        {msg.preview}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {msg.status === 'unread' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                    <Star className="w-3.5 h-3.5 text-slate-200 hover:text-yellow-400 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-8 h-8 text-slate-200" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sélectionnez un message</p>
                            <p className="text-slate-500 text-sm mt-1">Le contenu du message s'affichera ici</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
