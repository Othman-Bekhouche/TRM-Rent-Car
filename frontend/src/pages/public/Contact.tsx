import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
    return (
        <div className="pt-8 pb-24">
            {/* Header */}
            <div className="bg-[var(--color-surface)] py-16 border-b border-[var(--color-surface-light)] mb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Contactez-nous</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Une question ? Une demande spécifique ? Notre équipe est à votre disposition 7j/7 pour vous accompagner.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Contact Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8 border-b border-[var(--color-surface-light)] pb-4">Informations de l'Agence</h2>

                        <div className="space-y-8">
                            <div className="flex items-start">
                                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-surface-light)] mr-6">
                                    <MapPin className="w-8 h-8 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Notre Adresse</h3>
                                    <p className="text-slate-400 text-lg leading-relaxed">
                                        Siège TRM Rent Car<br />
                                        Avenue Principal<br />
                                        Maroc
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-surface-light)] mr-6">
                                    <Phone className="w-8 h-8 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Téléphone</h3>
                                    <p className="text-slate-400 text-lg">Bureau : +212 5XX XX XX XX</p>
                                    <p className="text-slate-400 text-lg">Urgence 24/7 : +212 6XX XX XX XX</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-surface-light)] mr-6">
                                    <Mail className="w-8 h-8 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                                    <p className="text-[var(--color-primary)] text-lg hover:underline cursor-pointer">
                                        contact@trmrentcar.ma
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-[var(--color-surface)] p-8 md:p-12 rounded-2xl border border-[var(--color-surface-light)] shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-8 text-center">Envoyez-nous un message</h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Nom Complet</label>
                                    <input
                                        type="text"
                                        placeholder="Votre nom"
                                        className="w-full bg-[var(--color-background)] border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Numéro de Téléphone</label>
                                    <input
                                        type="tel"
                                        placeholder="+212 6..."
                                        className="w-full bg-[var(--color-background)] border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Adresse Email</label>
                                <input
                                    type="email"
                                    placeholder="nom@exemple.com"
                                    className="w-full bg-[var(--color-background)] border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Votre Message</label>
                                <textarea
                                    rows={5}
                                    placeholder="Comment pouvons-nous vous aider ?"
                                    className="w-full bg-[var(--color-background)] border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none"
                                />
                            </div>

                            <button
                                type="button"
                                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center text-lg mt-8"
                            >
                                Envoyer le message
                                <Send className="w-5 h-5 ml-2" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
