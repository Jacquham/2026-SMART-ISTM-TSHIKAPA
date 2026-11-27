import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { COLONNES_RAPPORT, COLONNES_REPONSE, type Rapport, type Reponse, type SectionRef } from './types';

type Props = { onNotification: () => void };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function RapportsSgac({ onNotification }: Props) {
  const { session, aRole } = useAuth();
  const monId = session?.user.id;
  const peutRepondre = aRole('sgac');
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [sections, setSections] = useState<SectionRef[]>([]);
  const [brouillon, setBrouillon] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      supabase.from('rapports').select(COLONNES_RAPPORT).order('transmis_le', { ascending: false }),
      supabase.from('reponses_rapport').select(COLONNES_REPONSE).order('cree_le', { ascending: true }),
      supabase.from('sections').select('id, intitule'),
    ]);
    setRapports((a.data as Rapport[] | null) ?? []);
    setReponses((b.data as Reponse[] | null) ?? []);
    setSections((c.data as SectionRef[] | null) ?? []);
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const nomSection = (id: string) => sections.find((s) => s.id === id)?.intitule ?? 'Section';

  const marquerLu = async (id: string) => {
    setErreur(null);
    const { error } = await supabase.rpc('marquer_rapport_lu', { p_id: id });
    if (error) {
      setErreur(error.message);
      return;
    }
    await charger();
    onNotification();
  };

  const repondre = async (id: string) => {
    setErreur(null);
    const texte = (brouillon[id] ?? '').trim();
    if (!texte) {
      setErreur('Écrivez une réponse avant de l’envoyer.');
      return;
    }
    const { error } = await supabase.from('reponses_rapport').insert({ rapport_id: id, auteur: monId, texte });
    if (error) {
      setErreur('Réponse refusée : vérifiez vos droits.');
      return;
    }
    setBrouillon({ ...brouillon, [id]: '' });
    await supabase.rpc('marquer_rapport_lu', { p_id: id });
    await charger();
    onNotification();
  };

  return (
    <section>
      {erreur && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}
      <ul className="space-y-3">
        {rapports.length === 0 && <li className="text-sm text-slate-500">Aucun rapport reçu.</li>}
        {rapports.map((r) => {
          const siennes = reponses.filter((x) => x.rapport_id === r.id);
          return (
            <li key={r.id} className={`card border-l-4 p-3 ${r.lu_le ? 'border-l-green-600' : 'border-l-gold-500'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-700">
                Rapport de la section {nomSection(r.section_id)}
              </p>
              <div className="mt-1 flex items-start justify-between gap-2">
                <p className="font-semibold text-navy-800">{r.titre}</p>
                <span className={r.lu_le ? 'badge-ok' : 'badge-attente'}>{r.lu_le ? 'Lu' : 'Nouveau'}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{new Date(r.transmis_le).toLocaleDateString('fr-FR')}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{r.contenu}</p>

              {siennes.map((x) => (
                <div key={x.id} className="mt-3 rounded-lg bg-gold-100 p-3">
                  <p className="text-xs font-semibold text-navy-900">Réponse du SGAC</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{x.texte}</p>
                </div>
              ))}

              {peutRepondre && (
                <div className="mt-3 space-y-2">
                  <textarea
                    aria-label="Réponse"
                    placeholder="Répondre à la section…"
                    rows={3}
                    value={brouillon[r.id] ?? ''}
                    onChange={(ev) => setBrouillon({ ...brouillon, [r.id]: ev.target.value })}
                    className={champ}
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => repondre(r.id)} className="btn-primary flex-1">
                      Envoyer la réponse
                    </button>
                    {!r.lu_le && (
                      <button type="button" onClick={() => marquerLu(r.id)} className="btn-secondary flex-1">
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
    }
