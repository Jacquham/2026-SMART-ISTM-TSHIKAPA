import { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AffectationsCours from './AffectationsCours';
import { LIBELLE_STATUT, type Affectation, type Cours, type EnseignantRef, type SectionRef, type StatutCours } from './types';

type Props = {
  cours: Cours[];
  affectations: Affectation[];
  enseignants: EnseignantRef[];
  sections: SectionRef[];
  peutGerer: boolean;
  peutProposer: boolean;
  estSgac: boolean;
  monId: string | undefined;
  onChange: () => void;
};

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function ListeCours({ cours, affectations, enseignants, sections, peutGerer, peutProposer, estSgac, monId, onChange }: Props) {
  const [promotion, setPromotion] = useState('');
  const [statut, setStatut] = useState('');
  const [recherche, setRecherche] = useState('');
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const promotions = useMemo(() => Array.from(new Set(cours.map((c) => c.promotion))).sort(), [cours]);
  const nomSection = (id: string) => sections.find((s) => s.id === id)?.intitule ?? '—';

  const filtres = cours.filter((c) => {
    if (promotion && c.promotion !== promotion) return false;
    if (statut && c.statut !== statut) return false;
    const q = recherche.trim().toLowerCase();
    return !q || `${c.code} ${c.intitule}`.toLowerCase().includes(q);
  });

  const changerStatut = async (id: string, nouveau: StatutCours) => {
    setErreur(null);
    const { error } = await supabase.from('cours').update({ statut: nouveau }).eq('id', id);
    if (error) {
      setErreur('Modification refusée : vérifiez vos droits.');
      return;
    }
    onChange();
  };

  return (
    <section>
      <div className="space-y-3">
        <input type="search" aria-label="Rechercher un cours" placeholder="Rechercher par code ou intitulé…" value={recherche} onChange={(ev) => setRecherche(ev.target.value)} className={champ} />
        <div className="grid grid-cols-2 gap-3">
          <select aria-label="Promotion" value={promotion} onChange={(ev) => setPromotion(ev.target.value)} className={champ}>
            <option value="">Toutes promotions</option>
            {promotions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select aria-label="État" value={statut} onChange={(ev) => setStatut(ev.target.value)} className={champ}>
            <option value="">Tous les états</option>
            <option value="a_venir">À venir</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
        </div>
      </div>

      {erreur && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      <ul className="mt-3 space-y-3">
        {filtres.length === 0 && <li className="text-sm text-slate-500">Aucun cours trouvé.</li>}
        {filtres.map((c) => (
          <li key={c.id} className="card p-3">
            <p className="font-semibold text-navy-800">{c.intitule}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-navy-700">{c.code}</span>
              <span>{c.promotion}</span>
              <span>{c.semestre}</span>
              <span>{c.credits ?? '—'} crédit(s)</span>
              <span>{c.volume_horaire ?? '—'} h</span>
              <span>{nomSection(c.section_id)}</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              {peutGerer ? (
                <select aria-label="État du cours" value={c.statut} onChange={(ev) => changerStatut(c.id, ev.target.value as StatutCours)} className="rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-sm">
                  <option value="a_venir">À venir</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              ) : (
                <span className="badge-attente">{LIBELLE_STATUT[c.statut]}</span>
              )}
              <button type="button" onClick={() => setOuvert(ouvert === c.id ? null : c.id)} className="btn-secondary">
                {ouvert === c.id ? 'Masquer' : 'Enseignants et heures'}
              </button>
            </div>
            {ouvert === c.id && (
              <AffectationsCours
                cours={c}
                affectations={affectations.filter((a) => a.cours_id === c.id)}
                enseignants={enseignants}
                peutProposer={peutProposer}
                estSgac={estSgac}
                monId={monId}
                onChange={onChange}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
                      }
