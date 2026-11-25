import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { SectionLigne } from './types';

type Props = { sections: SectionLigne[]; onChange: () => void };

export default function ListeSections({ sections, onChange }: Props) {
  const [erreur, setErreur] = useState<string | null>(null);

  const principales = sections.filter((s) => s.type === 'section');
  const departements = sections.filter((s) => s.type === 'departement');
  const orphelins = departements.filter((d) => !d.parent_id || !principales.some((s) => s.id === d.parent_id));

  const basculer = async (s: SectionLigne) => {
    setErreur(null);
    const { error } = await supabase.from('sections').update({ actif: !s.actif }).eq('id', s.id);
    if (error) {
      setErreur('Modification refusée : vérifiez vos droits.');
      return;
    }
    onChange();
  };

  const rattacher = async (departementId: string, parentId: string) => {
    setErreur(null);
    const { error } = await supabase
      .from('sections')
      .update({ parent_id: parentId || null })
      .eq('id', departementId);
    if (error) {
      setErreur('Rattachement refusé : vérifiez vos droits.');
      return;
    }
    onChange();
  };

  const ligne = (s: SectionLigne, retrait: boolean) => (
    <li
      key={s.id}
      className={`flex items-center justify-between gap-2 rounded-lg border border-navy-100 bg-white px-3 py-2 ${retrait ? 'ml-4' : ''}`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-navy-800">{s.intitule}</p>
        <p className="font-mono text-xs text-navy-700">{s.code}</p>
      </div>
      <button type="button" onClick={() => basculer(s)} className={s.actif ? 'badge-ok' : 'badge-alerte'}>
        {s.actif ? 'Actif' : 'Désactivé'}
      </button>
    </li>
  );

  return (
    <section className="space-y-4">
      {erreur && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      {principales.length === 0 && <p className="text-sm text-slate-500">Aucune section pour le moment.</p>}

      {principales.map((s) => (
        <div key={s.id} className="card border-l-4 border-l-navy-700 p-3">
          <ul className="space-y-2">
            {ligne(s, false)}
            {departements.filter((d) => d.parent_id === s.id).map((d) => ligne(d, true))}
          </ul>
        </div>
      ))}

      {orphelins.length > 0 && (
        <div className="card border-l-4 border-l-gold-500 p-3">
          <h3 className="text-sm font-semibold text-navy-800">Départements à rattacher à une section</h3>
          <ul className="mt-2 space-y-2">
            {orphelins.map((d) => (
              <li key={d.id} className="rounded-lg border border-navy-100 bg-white px-3 py-2">
                <p className="text-sm font-semibold text-navy-800">
                  {d.intitule} <span className="font-mono text-xs text-navy-700">({d.code})</span>
                </p>
                <select
                  aria-label="Rattacher à une section"
                  value=""
                  onChange={(ev) => rattacher(d.id, ev.target.value)}
                  className="mt-2 w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Choisir la section…</option>
                  {principales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.intitule} ({s.code})
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
                                        }
