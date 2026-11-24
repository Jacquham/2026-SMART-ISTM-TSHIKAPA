import { Link, useParams } from 'react-router-dom';
import { findEspace } from '../config/espaces';

const badge: Record<string, string> = {
  Indispensable: 'bg-navy-700 text-white',
  Haute: 'bg-green-600 text-white',
  Moyenne: 'bg-navy-500 text-white',
  Basse: 'bg-slate-200 text-slate-700',
  'À arbitrer': 'bg-gold-500 text-slate-900',
};

export default function EspacePage() {
  const { id } = useParams();
  const espace = findEspace(id);

  if (!espace) {
    return (
      <div>
        <p>Espace introuvable.</p>
        <Link className="text-navy-500 underline" to="/">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-slate-500">
          <Link to="/" className="underline">
            Tableau de bord
          </Link>{' '}
          / {espace.nom}
        </p>

        <h1 className="text-2xl font-bold text-navy-700">
          {espace.nom}
        </h1>

        <p className="text-sm text-slate-600">
          Responsable : {espace.responsable}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {espace.modules.map((m) => (
          <div
            key={m.code}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs text-navy-500">
                {m.code}
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${badge[m.priorite]}`}
              >
                {m.priorite}
              </span>
            </div>

            <p className="mt-2 font-semibold text-slate-800">
              {m.nom}
            </p>

            {m.code === 'ACA-04' ? (
              <Link
                to="/sections-departements"
                className="mt-4 inline-block rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
              >
                Ouvrir la gestion des sections
              </Link>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                Écran en cours de réalisation — phase 1 (prototype).
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
