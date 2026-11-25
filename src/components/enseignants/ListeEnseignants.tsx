import { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Enseignant, SectionRef } from './types';

type Props = {
  enseignants: Enseignant[];
  sections: SectionRef[];
  peutModifier: boolean;
  onChange: () => void;
};

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function ListeEnseignants({ enseignants, sections, peutModifier, onChange }: Props) {
  const [recherche, setRecherche] = useState('');
  const [filtreSection, setFiltreSection] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  const nomSection = (id: string) => sections.find((s) => s.id === id)?.intitule ?? '—';

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return enseignants.filter((e) => {
      if (filtreSection && e.section_id !== filtreSection) return false;
      if (!q) return true;
      return `${e.matricule} ${e.nom} ${e.prenom} ${e.grade ?? ''}`.toLowerCase().includes(q);
    });
  }, [enseignants, recherche, filtreSection]);

  const basculer = async (e: Enseignant) => {
    setErreur(null);
    const { error } = await supabase.from('enseignants').update({ actif: !e.actif }).eq('id', e.id);
    if (error) {
      setErreur('Modification refusée : vérifiez vos droits.');
      return;
    }
    onChange();
  };

  return (
    <section>
      <div className="space-y-3">
        <input
          type="search"
          aria-label="Rechercher un enseignant"
          placeholder="Rechercher par nom, matricule ou grade…"
          value={recherche}
          onChange={(ev) => setRecherche(ev.target.value)}
          className={champ}
        />
        {sections.length > 1 && (
          <select aria-label="Filtrer par section" value={filtreSection} onChange={(ev) => setFiltreSection(ev.target.value)} className={champ}>
            <option value="">Toutes les sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.intitule}
              </option>
            ))}
          </select>
        )}
      </div>

      {erreur && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      <ul className="mt-3 space-y-2">
        {filtres.length === 0 && <li className="text-sm text-slate-500">Aucun enseignant trouvé.</li>}
        {filtres.map((e) => (
          <li key={e.id} className="card flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy-800">
                {e.prenom} {e.nom}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-navy-700">{e.matricule}</span>
                <span>{e.grade ?? 'Grade non précisé'}</span>
                <span>{nomSection(e.section_id)}</span>
              </p>
            </div>
            {peutModifier ? (
              <button type="button" onClick={() => basculer(e)} className={e.actif ? 'badge-ok' : 'badge-alerte'}>
                {e.actif ? 'Actif' : 'Inactif'}
              </button>
            ) : (
              <span className={e.actif ? 'badge-ok' : 'badge-alerte'}>{e.actif ? 'Actif' : 'Inactif'}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
    }
