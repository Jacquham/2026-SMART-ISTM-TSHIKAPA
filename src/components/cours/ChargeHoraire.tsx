import type { Affectation, EnseignantRef } from './types';

type Props = { enseignants: EnseignantRef[]; affectations: Affectation[] };

export default function ChargeHoraire({ enseignants, affectations }: Props) {
  const lignes = enseignants
    .filter((e) => e.actif)
    .map((e) => {
      const siennes = affectations.filter((a) => a.enseignant_id === e.id);
      const somme = (statut: Affectation['statut']) =>
        siennes.filter((a) => a.statut === statut).reduce((total, a) => total + a.heures, 0);
      return { e, validees: somme('validee'), proposees: somme('proposee') };
    });

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold text-navy-800">Charge horaire par enseignant</h2>
      <p className="mt-1 text-xs text-slate-500">
        Seules les heures validées par le SGAC comptent dans la charge officielle.
      </p>
      <ul className="mt-3 space-y-2">
        {lignes.length === 0 && <li className="text-sm text-slate-500">Aucun enseignant actif.</li>}
        {lignes.map(({ e, validees, proposees }) => (
          <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-navy-100 bg-white px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy-800">
                {e.prenom} {e.nom}
              </p>
              <p className="font-mono text-xs text-navy-700">{e.matricule}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-green-700">{validees} h validées</p>
              {proposees > 0 && <p className="text-xs text-slate-500">{proposees} h en attente</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
      }
