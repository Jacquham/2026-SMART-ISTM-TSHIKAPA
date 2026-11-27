import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { COLONNES_RAPPORT, COLONNES_REPONSE, type Rapport, type Reponse } from './types';

type Props = { sectionId: string; onNotification: () => void };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function RapportsChef({ sectionId, onNotification }: Props) {
  const { session } = useAuth();
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from('rapports').select(COLONNES_RAPPORT).eq('section_id', sectionId).order('transmis_le', { ascending: false }),
      supabase.from('reponses_rapport').select(COLONNES_REPONSE).order('cree_le', { ascending: true }),
    ]);
    setRapports((a.data as Rapport[] | null) ?? []);
    setReponses((b.data as Reponse[] | null) ?? []);
  }, [sectionId]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const transmettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const { error } = await supabase
      .from('rapports')
      .insert({ section_id: sectionId, titre: titre.trim(), contenu: contenu.trim(), transmis_par: session?.user.id });
    setEnvoi(false);
    if (error) {
      setErreur('Transmission refusée : vérifiez vos droits.');
      return;
    }
    setTitre('');
    setContenu('');
    await charger();
  };

  const marquerLue = async (id: string) => {
    await supabase.rpc('marquer_reponse_lue', { p_id: id });
    await charger();
    onNotification();
  };

  return (
    <section className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h2 className="text-base font-semibold text-navy-800">Transmettre un rapport au SGAC</h2>
        <form onSubmit={transmettre} className="mt-3 space-y-3">
          <input aria-label="Titre du rapport" placeholder="Titre du rapport" required value={titre} onChange={(ev) => setTitre(ev.target.value)} className={champ} />
          <textarea aria-label="Contenu du rapport" placeholder="Contenu du rapport" required rows={5} value={contenu} onChange={(ev) => setContenu(ev.target.value)} className={champ} />
          {erreur && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {erreur}
            </p>
          )}
          <button type="submit" disabled={envoi} className="btn-primary w-full py-3">
            {envoi ? 'Transmission…' : 'Transmettre au SGAC'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold text-navy-800">Mes rapports</h2>
        <ul className="space-y-3">
          {rapports.length === 0 && <li className="text-sm text-slate-500">Aucun rapport transmis.</li>}
          {rapports.map((r) => {
            const siennes = reponses.filter((x) => x.rapport_id === r.id);
            return (
              <li key={r.id} className="card p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-navy-800">{r.titre}</p>
                  <span className={r.lu_le ? 'badge-ok' : 'badge-attente'}>{r.lu_le ? 'Lu' : 'Transmis'}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{new Date(r.transmis_le).toLocaleDateString('fr-FR')}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{r.contenu}</p>
                {siennes.map((x) => (
                  <div key={x.id} className="mt-3 rounded-lg border-l-4 border-l-gold-500 bg-gold-100 p-3">
                    <p className="text-xs font-semibold text-navy-900">Réponse du SGAC</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{x.texte}</p>
                    {!x.lue && (
                      <button type="button" onClick={() => marquerLue(x.id)} className="btn-secondary mt-2">
                        Marquer comme lue
                      </button>
                    )}
                  </div>
                ))}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
      }
