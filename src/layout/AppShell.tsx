import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { espaces } from '../config/espaces';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';

// Adresse du logo (fonctionne en local et sur GitHub Pages).
const LOGO = `${import.meta.env.BASE_URL}icon-512.png`;

// Navigation responsive :
// - ordinateur et tablette (≥ md) : menu latéral permanent ;
// - téléphone : barre supérieure et menu coulissant.
export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { profil, session, signOut } = useAuth();

  const nomAffiche =
    [profil?.prenom, profil?.nom].filter(Boolean).join(' ') || session?.user.email || '';

  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Espaces de travail">
      <NavLink
        to="/"
        end
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-navy-700 text-white' : 'text-navy-900 hover:bg-navy-50'}`
        }
      >
        Tableau de bord général
      </NavLink>
      {espaces.map((e) => (
        <NavLink
          key={e.id}
          to={`/espace/${e.id}`}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-navy-700 text-white' : 'text-slate-700 hover:bg-navy-50'}`
          }
        >
          {e.nom}
        </NavLink>
      ))}
      {session && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="px-3 text-xs text-slate-500">Connecté :</p>
          <p className="px-3 pb-3 text-sm font-semibold text-navy-800">{nomAffiche}</p>
          <button type="button" onClick={signOut} className="btn-secondary w-full">
            Se déconnecter
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Menu latéral (ordinateur, tablette) */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
        <Link to="/" className="flex items-center gap-3 border-b border-slate-200 p-4">
          <img src={LOGO} alt="" className="h-10 w-auto" />
          <span className="text-sm font-bold leading-tight text-navy-700">SMART-ISTM-T'PA</span>
        </Link>
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">{nav}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre supérieure (téléphone) */}
        <header className="safe-top sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img src={LOGO} alt="" className="h-8 w-auto" />
            <span className="text-sm font-bold text-navy-700">SMART-ISTM-T'PA</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-navy-700"
            aria-expanded={open}
            aria-controls="menu-mobile"
          >
            {open ? 'Fermer' : 'Menu'}
          </button>
        </header>
        {open && (
          <div id="menu-mobile" className="fixed inset-x-0 bottom-0 top-[57px] z-30 overflow-y-auto bg-white md:hidden">
            {nav}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="bg-gold-400/20 px-4 py-2 text-xs text-slate-700">
            Mode démonstration : la connexion à la base n'est pas configurée. Les données affichées sont fictives.
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500">
          Conçu par SCIENCE-PLUS — Académie de la connaissance · WhatsApp : +243 973 213 157
        </footer>
      </div>
    </div>
  );
}
