import { Route, Routes } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Dashboard from './pages/Dashboard';
import EspacePage from './pages/EspacePage';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import ChangerMotDePasse from './pages/ChangerMotDePasse';
import Comptes from './pages/Comptes';
import Commission from './pages/Commission';
import { useAuth } from './lib/auth';
import { isSupabaseConfigured } from './lib/supabase';

function Chargement() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <p className="text-sm font-medium text-navy-700">Chargement…</p>
    </div>
  );
}

function CompteNonActive() {
  const { signOut } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="card w-full max-w-md p-6 text-center">
        <h1 className="text-lg font-semibold text-navy-800">Compte non activé</h1>
        <p className="mt-2 text-sm text-slate-600">
          Votre connexion est valide, mais aucun profil n'est rattaché à ce compte. Contactez l'administrateur de
          l'Institut.
        </p>
        <button type="button" onClick={signOut} className="btn-primary mt-5 w-full py-3">
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { loading, session, profil } = useAuth();

  // Mode démonstration local uniquement (sans configuration Supabase).
  if (isSupabaseConfigured) {
    if (loading) return <Chargement />;
    if (!session) return <Login />;
    if (!profil) return <CompteNonActive />;
    if (profil.doit_changer_mdp) return <ChangerMotDePasse />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/espace/:id" element={<EspacePage />} />
        <Route path="/comptes" element={<Comptes />} />
        <Route path="/commission" element={<Commission />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
