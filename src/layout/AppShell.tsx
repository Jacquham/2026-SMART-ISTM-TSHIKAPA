import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { espaces } from '../config/espaces';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useNotifications } from '../lib/notifications';

const LOGO = `${import.meta.env.BASE_URL}icon-512.png`;

export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const { profil, session, signOut, aRole } = useAuth();

  const { total } = useNotifications();

  const estChefSection = aRole('chef_section');
  const estSgac = aRole('sgac');
  const estDirecteur = aRole('dg');

  const nomAffiche =
    [profil?.prenom, profil?.nom].filter(Boolean).join(' ') ||
    session?.user.email ||
    '';

  const lienStyle = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${
      isActive
        ? 'bg-navy-700 text-white'
        : 'text-slate-700 hover:bg-navy-50'
    }`;

  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Espaces de travail">

      <NavLink
        to="/"
        end
        onClick={() => setOpen(false)}
        className={lienStyle}
      >
        Tableau de bord général
      </NavLink>

      {espaces.map((e) => (
        <NavLink
          key={e.id}
          to={`/espace/${e.id}`}
          onClick={() => setOpen(false)}
          className={lienStyle}
        >
          {e.nom}
        </NavLink>
      ))}

      {/* ESPACE PERSONNEL DU CHEF DE SECTION */}
      {estChefSection && (
        <NavLink
          to="/ma-section"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `mt-3 flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold ${
              isActive
                ? 'bg-green-700 text-white'
                : 'bg-green-50 text-green-800 hover:bg-green-100'
            }`
          }
        >
          <span>Ma section</span>

          {total > 0 && (
            <span className="ml-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
              {total > 99 ? '99+' : total}
            </span>
          )}
        </NavLink>
      )}

      {/* RAPPORTS DES SECTIONS POUR LE SGAC ET LA DIRECTION */}
      {(estSgac || estDirecteur) && (
        <NavLink
          to="/rapports"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold ${
              isActive
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`
          }
        >
          <span>Rapports des sections</span>

          {total > 0 && (
            <span className="ml-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
              {total > 99 ? '99+' : total}
            </span>
          )}
        </NavLink>
      )}

      {/* GESTION DES COMPTES */}
      {aRole('admin_central') && (
        <NavLink
          to="/comptes"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `mt-2 rounded-lg px-3 py-2 text-sm font-semibold ${
              isActive
                ? 'bg-green-700 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`
          }
        >
          Comptes (administrateur)
        </NavLink>
      )}

      {/* UTILISATEUR CONNECTÉ */}
      {session && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="px-3 text-xs text-slate-500">
            Connecté :
          </p>

          <p className="px-3 pb-3 text-sm font-semibold text-navy-800">
            {nomAffiche}
          </p>

          <button
            type="button"
            onClick={signOut}
            className="btn-secondary w-full"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex">

      {/* MENU LATÉRAL : ORDINATEUR ET TABLETTE */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">

        <Link
          to="/"
          className="flex items-center gap-3 border-b border-slate-200 p-4"
        >
          <img src={LOGO} alt="" className="h-10 w-auto" />

          <span className="text-sm font-bold leading-tight text-navy-700">
            SMART-ISTM-T'PA
          </span>
        </Link>

        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">
          {nav}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">

        {/* BARRE SUPÉRIEURE : TÉLÉPHONE */}
        <header className="safe-top sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">

          <Link to="/" className="flex items-center gap-2">
            <img src={LOGO} alt="" className="h-8 w-auto" />

            <span className="text-sm font-bold text-navy-700">
              SMART-ISTM-T'PA
            </span>
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

        {/* MENU COULISSANT DU TÉLÉPHONE */}
        {open && (
          <div
            id="menu-mobile"
            className="fixed inset-x-0 bottom-0 top-[57px] z-30 overflow-y-auto bg-white md:hidden"
          >
            {nav}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="bg-gold-400/20 px-4 py-2 text-xs text-slate-700">
            Mode démonstration : la connexion à la base n'est pas configurée.
            Les données affichées sont fictives.
          </div>
        )}

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* PIED DE PAGE INSTITUTIONNEL */}
        <footer className="border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500">

          <p>
            Conçu par SCIENCE-PLUS — Académie de la connaissance · WhatsApp :
            +243 973 213 157
          </p>

          <p className="mt-1">
            <a
              href="mailto:istmtshikapa2026@gmail.com"
              className="hover:text-navy-700"
            >
              istmtshikapa2026@gmail.com
            </a>
            {' | '}Ville de Tshikapa
          </p>

        </footer>
      </div>
    </div>
  );
      }
