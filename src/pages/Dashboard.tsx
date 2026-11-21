import { Link } from 'react-router-dom';
import { espaces, transversal } from '../config/espaces';

// Tableau de bord général. Les indicateurs sont des valeurs fictives tant que la base
// n'est pas connectée (principe P17 du cahier : aucun chiffre décoratif en production).
const indicateursFictifs = [
  { label: 'Étudiants inscrits', valeur: '—' },
  { label: 'Enseignants actifs', valeur: '—' },
  { label: 'Charges à valider', valeur: '—' },
  { label: 'Décisions non exécutées', valeur: '—' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-navy-700">Tableau de bord général</h1>
        <p className="text-sm text-slate-600">Vue d'ensemble de l'Institut, selon vos droits d'accès.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {indicateursFictifs.map((i) => (
          <div key={i.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{i.label}</p>
            <p className="mt-1 text-2xl font-bold text-navy-700">{i.valeur}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy-700">Espaces de travail</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {espaces.map((e) => (
            <Link
              key={e.id}
              to={`/espace/${e.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-navy-500"
            >
              <p className="font-semibold text-navy-700 group-hover:underline">{e.nom}</p>
              <p className="mt-1 text-xs text-slate-500">Responsable : {e.responsable}</p>
              <p className="mt-2 text-xs text-slate-600">{e.modules.length} module(s)</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy-700">Transversal</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {transversal.map((m) => (
            <li key={m.code} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
              <span className="mr-2 font-mono text-xs text-navy-500">{m.code}</span>
              {m.nom}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
