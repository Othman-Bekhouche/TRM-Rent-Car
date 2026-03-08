import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-surface-light)] max-w-lg w-full transform hover:-translate-y-1 transition-transform duration-300">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-4">
          TRM Rent Car
        </h1>
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          Votre plateforme premium de réservation et gestion de véhicules haut de gamme.
        </p>
        <button className="px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer">
          Explorer la Flotte
        </button>
      </div>
    </div>
  )
}

export default App
