import { Link } from 'react-router-dom';
import { Car, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-[var(--color-surface)] border-b border-[var(--color-surface-light)] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <Car className="h-8 w-8 text-[var(--color-primary)]" />
                            <span className="font-bold text-xl tracking-tight text-white">TRM Rent Car</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-slate-300 hover:text-white transition-colors">Accueil</Link>
                        <Link to="/vehicles" className="text-slate-300 hover:text-white transition-colors">Flotte</Link>
                        <Link to="/about" className="text-slate-300 hover:text-white transition-colors">À Propos</Link>
                        <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>

                        <div className="flex items-center gap-4 ml-4">
                            <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                                Connexion
                            </Link>
                            <Link to="/register" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                S'inscrire
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-300 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[var(--color-surface)] border-b border-[var(--color-surface-light)]">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-[var(--color-surface-light)] rounded-md">Accueil</Link>
                        <Link to="/vehicles" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-[var(--color-surface-light)] rounded-md">Flotte</Link>
                        <Link to="/about" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-[var(--color-surface-light)] rounded-md">À Propos</Link>
                        <Link to="/contact" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-[var(--color-surface-light)] rounded-md">Contact</Link>
                        <div className="mt-4 pt-4 border-t border-[var(--color-surface-light)] flex flex-col gap-2 px-3">
                            <Link to="/login" className="text-center py-2 text-slate-300 hover:text-white border border-slate-600 rounded-lg">Connexion</Link>
                            <Link to="/register" className="text-center py-2 bg-[var(--color-primary)] text-slate-900 font-bold rounded-lg">S'inscrire</Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
