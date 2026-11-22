import { Link } from 'react-router-dom';
import { espaces, transversal } from '../config/espaces';

// Tableau de bord général. Les indicateurs sont des valeurs fictives tant que la base
// n'est pas connectée (principe P17 du cahier : aucun chiffre décoratif en production).
const indicateursFictifs = [
  { label: 'Étudiants inscrits', valeur: '—', accent: 'border-t-navy-700' },
  { label: 'Enseignants actifs', valeur: '—', accent: 'border-t-green-600' },
  { label: 'Charges à valider', valeur: '—', accent: 'border-t-gold-500' },
  { label: 'Décisions non exécutées', valeur: '—', accent: 'border-t-sky-500' },
];

// Bandes de couleur des cartes d'espaces (alternance des couleurs du logo).
const accentsEspaces = ['border-l-navy-700', 'border-l-green-600', 'border-l-sky-500', 'border-l-gold-500'];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">ISTM-Tshikapa</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Tableau de bord général</h1>
        <p className="mt-1 text-sm text-navy-100">Vue d'ensemble de l'Institut, selon vos droits d'accès.</p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {indicateursFictifs.map((i) => (
          <div key={i.label} className={`card border-t-4 p-4 ${i.accent}`}>
            <p className="text-xs font-medium text-slate-500">{i.label}</p>
            <p className="mt-1 text-3xl font-bold text-navy-700">{i.valeur}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy-800">Espaces de travail</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {espaces.map((e, index) => (
            <Link
              key={e.id}
              to={`/espace/${e.id}`}
              className={`card group border-l-4 p-4 transition hover:-translate-y-0.5 hover:border-navy-300 ${accentsEspaces[index % accentsEspaces.length]}`}
            >
              <p className="font-semibold text-navy-700 group-hover:underline">{e.nom}</p>
              <p className="mt-1 text-xs text-slate-500">Responsable : {e.responsable}</p>
              <p className="mt-3">
                <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
                  {e.modules.length} module(s)
                </span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy-800">Transversal</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {transversal.map((m) => (
            <li key={m.code} className="card flex items-center gap-3 px-4 py-3 text-sm text-slate-700">
              <span className="rounded-md bg-gold-100 px-2 py-0.5 font-mono text-xs font-semibold text-navy-900">
                {m.code}
              </span>
              {m.nom}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
