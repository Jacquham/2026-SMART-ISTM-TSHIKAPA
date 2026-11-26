import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { Affectation, Cours, EnseignantRef } from './types';

type Props = {
  cours: Cours;
  affectations: Affectation[];
  enseignants: EnseignantRef[];
  peutProposer: boolean;
  estSgac: boolean;
  monId: string | undefined;
  onChange: () => void;
};

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';
const libelles = { proposee: 'Proposée', validee: 'Validée', refusee: 'Refusée' };
const classes = { proposee: 'badge-attente', validee: 'badge-ok', refusee: 'badge-alerte' };

export default function AffectationsCours({ cours, affectations, enseignants, peutProposer, estSgac, monId, onChange }: Props) {
  const [enseignantId, setEnseignantId] = useState('');
  const [heures, setHeures] = useState('');
  const [refusId, setRefusId] = useState<string | null>(null);
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  const candidats = enseignants.filter(
    (e) => e.actif && e.section_id === cours.section_id && !affectations.some((a) => a.enseignant_id === e.id),
  );
  const nom = (id: string) => {
    const e = enseignants.find((x) => x.id === id);
    return e ? `${e.prenom} ${e.nom}` : 'Enseignant';
  };

  const proposer = async (ev: FormEvent) => {
    ev.preventDefault();
    setErreur(null);
    const { error } = await supabase.from('affectations').insert({
      cours_id: cours.id,
      enseignant_id: enseignantId,
      heures: Number(heures),
      statut: 'proposee',
      propose_par: monId,
    });
    if (error) {
      setErreur('Proposition refusée : vérifiez vos droits et les heures.');
      return;
    }
    setEnseignantId('');
    setHeures('');
    onChange();
  };

  const decider = async (id: string, decision: 'validee' | 'refusee') => {
    setErreur(null);
    const { error } = await supabase.rpc('valider_affectation', {
      p_id: id,
      p_decision: decision,
      p_motif: decision === 'refusee' ? motif : null,
    });
    if (error) {
      setErreur(error.message);
      return;
    }
    setRefusId(null);
    setMotif('');
    onChange();
  };

  const retirer = async (id: string) => {
    setErreur(null);
    const { error } = await supabase.from('affectations').delete().eq('id', id);
    if (error) {
      setErreur('Retrait refusé.');
      return;
    }
    onChange();
  };

  return (
    <div className="mt-3 border-t border-navy-100 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enseignants du cours</p>
      <ul className="mt-2 space-y-2">
        {affectations.length === 0 && <li className="text-sm text-slate-500">Aucun enseignant proposé.</li>}
        {affectations.map((a) => (
          <li key={a.id} className="rounded-lg border border-navy-100 bg-white p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-navy-800">
                {nom(a.enseignant_id)} · {a.heures} h
              </p>
              <span className={classes[a.statut]}>{libelles[a.statut]}</span>
            </div>
            {a.motif && <p className="mt-1 text-xs text-slate-600">Motif : {a.motif}</p>}
            {a.statut === 'proposee' && estSgac && a.propose_par !== monId && (
              <div className="mt-2 space-y-2">
                {refusId === a.id ? (
                  <>
                    <input aria-label="Motif du refus" placeholder="Motif du refus (obligatoire)" value={motif} onChange={(ev) => setMotif(ev.target.value)} className={champ} />
                    <button type="button" onClick={() => decider(a.id, 'refusee')} className="btn-secondary w-full">
                      Confirmer le refus
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => decider(a.id, 'validee')} className="btn-gold flex-1">
                      Valider
                    </button>
                    <button type="button" onClick={() => setRefusId(a.id)} className="btn-secondary flex-1">
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            )}
            {a.statut === 'proposee' && peutProposer && (
              <button type="button" onClick={() => retirer(a.id)} className="mt-2 text-xs text-red-600 underline">
                Retirer la proposition
              </button>
            )}
          </li>
        ))}
      </ul>

      {erreur && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      {peutProposer && (
        <form onSubmit={proposer} className="mt-3 space-y-2">
          <select aria-label="Enseignant" required value={enseignantId} onChange={(ev) => setEnseignantId(ev.target.value)} className={champ}>
            <option value="">Proposer un enseignant…</option>
            {candidats.map((e) => (
              <option key={e.id} value={e.id}>
                {e.matricule} – {e.prenom} {e.nom}
              </option>
            ))}
          </select>
          <input aria-label="Heures" type="number" min="1" required placeholder="Nombre d'heures" value={heures} onChange={(ev) => setHeures(ev.target.value)} className={champ} />
          <button type="submit" className="btn-primary w-full">
            Proposer cette affectation
          </button>
        </form>
      )}
    </div>
  );
    }
