import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Decision, Etudiant, Seance } from './types';

type Props = {
  seances: Seance[];
  etudiants: Etudiant[];
  decisions: Decision[];
  peutProposer: boolean;
  peutValider: boolean;
  onChange: () => void;
};

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';
const libelles: Record<string, string> = { admis: 'Admis', ajourne: 'Ajourné', refuse: 'Refusé' };

export default function Decisions({ seances, etudiants, decisions, peutProposer, peutValider, onChange }: Props) {
  const { session } = useAuth();
  const monId = session?.user.id;
  const [seanceId, setSeanceId] = useState('');
  const [etudiantId, setEtudiantId] = useState('');
  const [decision, setDecision] = useState('');
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const aTraiter = etudiants.filter((e) => e.statut === 'prealable');

  const nomEtudiant = (id: string) => {
    const e = etudiants.find((x) => x.id === id);
    return e ? `${e.matricule} – ${e.prenom} ${e.nom}` : 'Étudiant';
  };

  const proposer = async (ev: FormEvent) => {
    ev.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const { error } = await supabase.from('commission_decisions').insert({
      seance_id: seanceId,
      etudiant_id: etudiantId,
      decision,
      motif: motif.trim(),
      statut: 'proposee',
      proposee_par: monId,
    });
    setEnvoi(false);
    if (error) {
      setErreur('Proposition refusée : vérifiez vos droits et le motif.');
      return;
    }
    setEtudiantId('');
    setDecision('');
    setMotif('');
    onChange();
  };

  const valider = async (id: string) => {
    setErreur(null);
    const { error } = await supabase.rpc('valider_decision', { p_id: id });
    if (error) {
      setErreur(error.message);
      return;
    }
    onChange();
  };

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold text-navy-800">Décisions d'inscription</h2>

      {peutProposer && (
        <form onSubmit={proposer} className="mt-3 space-y-3">
          <select aria-label="Séance" required value={seanceId} onChange={(ev) => setSeanceId(ev.target.value)} className={champ}>
            <option value="">Choisir une séance…</option>
            {seances.map((s) => (
              <option key={s.id} value={s.id}>
                {s.intitule} – {new Date(s.date_seance).toLocaleDateString('fr-FR')}
              </option>
            ))}
          </select>
          <select aria-label="Étudiant" required value={etudiantId} onChange={(ev) => setEtudiantId(ev.target.value)} className={champ}>
            <option value="">Choisir un étudiant (dossier préalable)…</option>
            {aTraiter.map((e) => (
              <option key={e.id} value={e.id}>
                {e.matricule} – {e.prenom} {e.nom}
              </option>
            ))}
          </select>
          <select aria-label="Décision" required value={decision} onChange={(ev) => setDecision(ev.target.value)} className={champ}>
            <option value="">Choisir la décision…</option>
            <option value="admis">Admis</option>
            <option value="ajourne">Ajourné</option>
            <option value="refuse">Refusé</option>
          </select>
          <textarea
            aria-label="Motif"
            placeholder="Motif (obligatoire)"
            required
            rows={3}
            value={motif}
            onChange={(ev) => setMotif(ev.target.value)}
            className={champ}
          />
          <button type="submit" disabled={envoi} className="btn-primary w-full py-3">
            {envoi ? 'Envoi…' : 'Proposer la décision'}
          </button>
        </form>
      )}

      {erreur && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {decisions.length === 0 && <li className="text-sm text-slate-500">Aucune décision pour le moment.</li>}
        {decisions.map((d) => (
          <li key={d.id} className="rounded-lg border border-navy-100 bg-white p-3">
            <p className="text-sm font-semibold text-navy-800">{nomEtudiant(d.etudiant_id)}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-navy-50 px-2.5 py-0.5 font-medium text-navy-700">
                {libelles[d.decision] ?? d.decision}
              </span>
              <span className={d.statut === 'validee' ? 'badge-ok' : 'badge-attente'}>
                {d.statut === 'validee' ? 'Validée' : 'Proposée'}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600">{d.motif}</p>
            {d.statut === 'proposee' && peutValider && d.proposee_par !== monId && (
              <button type="button" onClick={() => valider(d.id)} className="btn-gold mt-3 w-full">
                Valider cette décision
              </button>
            )}
            {d.statut === 'proposee' && d.proposee_par === monId && (
              <p className="mt-2 text-xs text-slate-500">En attente de validation par une autre personne.</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
      }
