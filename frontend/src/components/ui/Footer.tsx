import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center mb-4">
                            <img src="/trm-logo-pour-arriere-noir.png" alt="TRM Rent Car" className="h-16 w-auto object-contain -ml-2" />
                        </Link>
                        <p className="text-slate-400 text-sm">
                            Votre partenaire de confiance pour la location de véhicules premium et confortables.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Liens Rapides</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="text-slate-400 hover:text-[var(--color-primary)] transition-colors">Accueil</Link></li>
                            <li><Link to="/vehicles" className="text-slate-400 hover:text-[var(--color-primary)] transition-colors">Notre Flotte</Link></li>
                            <li><Link to="/about" className="text-slate-400 hover:text-[var(--color-primary)] transition-colors">À Propos</Link></li>
                            <li><Link to="/contact" className="text-slate-400 hover:text-[var(--color-primary)] transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Légal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/terms" className="text-slate-400 hover:text-[var(--color-primary)] transition-colors">Conditions d'utilisation</Link></li>
                            <li><Link to="/privacy" className="text-slate-400 hover:text-[var(--color-primary)] transition-colors">Politique de confidentialité</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Suivez-nous</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-500 text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} TRM Rent Car. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
}
