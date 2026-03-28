import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import SEO from '../../components/common/SEO';

export default function Contact() {
    return (
        <div className="bg-[var(--color-background)]">
            <SEO 
                title="Contactez TRM Rent Car | Support Client 24/7"
                description="Besoin d'aide ? Contactez notre équipe pour vos réservations de voitures au Maroc. WhatsApp, Téléphone ou Email."
                keywords="contact trm rent car, reserver voiture maroc, support client location voiture, louer voiture taourirt contact"
            />
            {/* Hero Header */}
            <section className="relative py-24 border-b border-[var(--color-border)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-[#101828] to-[#161D2B]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
                        Contactez-<span className="text-[var(--color-primary)]">nous</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
                        Une question ? Une demande spécifique ? Notre équipe est à votre disposition 7j/7 pour vous accompagner.
                    </p>
                </div>
            </section>

            {/* Quick Contact Cards */}
            <section className="py-12 -mt-16 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a href="tel:+212606066426" className="bg-[#141C2B] border border-[var(--color-border)] rounded-2xl p-8 text-center group hover:border-[var(--color-primary)]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="w-16 h-16 mx-auto bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                                <Phone className="w-7 h-7 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Téléphone</h3>
                            <p className="text-[var(--color-primary)] text-2xl font-black">06 06 06 6426</p>
                            <p className="text-slate-400 text-sm mt-2">Disponible 7j/7</p>
                        </a>

                        <a href="mailto:trm.rentcar@gmail.com" className="bg-[#141C2B] border border-[var(--color-border)] rounded-2xl p-8 text-center group hover:border-[var(--color-primary)]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="w-16 h-16 mx-auto bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                                <Mail className="w-7 h-7 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Email</h3>
                            <p className="text-[var(--color-primary)] text-lg font-bold">trm.rentcar@gmail.com</p>
                            <p className="text-slate-400 text-sm mt-2">Réponse sous 24h</p>
                        </a>

                        <div className="bg-[#141C2B] border border-[var(--color-border)] rounded-2xl p-8 text-center group hover:border-[var(--color-primary)]/50 hover:-translate-y-1 transition-all duration-300">
                            <div className="w-16 h-16 mx-auto bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary)]/20 transition-colors">
                                <MapPin className="w-7 h-7 text-[var(--color-primary)]" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Adresse</h3>
                            <p className="text-slate-300 text-sm font-medium">Appt Sabrine 2éme Etage N°6 Bloc A</p>
                            <p className="text-[var(--color-primary)] font-bold mt-1">65800 Taourirt, Maroc</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form + Info */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                        {/* Left Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Horaires <span className="text-[var(--color-primary)]">d'ouverture</span></h2>
                                <div className="w-12 h-1 bg-[var(--color-primary)] mb-6" />
                            </div>

                            <div className="bg-[#141C2B] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-[var(--color-border)] flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                                    <span className="text-white font-bold">Nos Horaires</span>
                                </div>
                                <div className="divide-y divide-[var(--color-border)]">
                                    {[
                                        { day: 'Lundi – Vendredi', hours: '08:00 – 20:00', open: true },
                                        { day: 'Samedi', hours: '09:00 – 18:00', open: true },
                                        { day: 'Dimanche', hours: '10:00 – 16:00', open: true },
                                        { day: 'Jours Fériés', hours: 'Sur réservation', open: true },
                                    ].map((slot, i) => (
                                        <div key={i} className="px-6 py-4 flex items-center justify-between">
                                            <span className="text-sm text-slate-300 font-medium">{slot.day}</span>
                                            <span className={`text-sm font-bold ${slot.open ? 'text-[var(--color-primary)]' : 'text-red-400'}`}>{slot.hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <a
                                href="https://wa.me/212606066426"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 group hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">WhatsApp</p>
                                    <p className="text-emerald-300 text-sm">Réponse instantanée — Cliquez pour discuter</p>
                                </div>
                            </a>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-[var(--color-surface)] p-8 md:p-10 rounded-3xl border border-[var(--color-border)] shadow-2xl">
                                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Envoyez-nous un <span className="text-[var(--color-primary)]">message</span></h2>
                                <p className="text-slate-400 text-sm mb-8">Remplissez le formulaire et nous vous répondrons rapidement.</p>

                                <form className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom Complet</label>
                                            <input type="text" placeholder="Votre nom" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder-slate-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Téléphone</label>
                                            <input type="tel" placeholder="+212 6..." className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder-slate-500" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Adresse Email</label>
                                        <input type="email" placeholder="nom@exemple.com" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder-slate-500" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sujet</label>
                                        <select className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all appearance-none">
                                            <option className="bg-[#141C2B]">Demande de réservation</option>
                                            <option className="bg-[#141C2B]">Information tarifs</option>
                                            <option className="bg-[#141C2B]">Réclamation</option>
                                            <option className="bg-[#141C2B]">Partenariat</option>
                                            <option className="bg-[#141C2B]">Autre</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Votre Message</label>
                                        <textarea rows={5} placeholder="Comment pouvons-nous vous aider ?" className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none placeholder-slate-500" />
                                    </div>

                                    <button
                                        type="button"
                                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[#0B0F19] font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)] flex items-center justify-center text-sm uppercase tracking-widest mt-3"
                                    >
                                        Envoyer le message
                                        <Send className="w-4 h-4 ml-2" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
