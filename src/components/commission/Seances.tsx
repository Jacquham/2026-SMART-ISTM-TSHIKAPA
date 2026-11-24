import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Seance } from './types';

type Props = { seances: Seance[]; peutCreer: boolean; onChange: () => void };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function Seances({ seances, peutCreer, onChange }: Props) {
  const { session } = useAuth();
  const [date, setDate] = useState('');
  const [intitule, setIntitule] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const creer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const { error } = await supabase
      .from('commission_seances')
      .insert({ date_seance: date, intitule: intitule.trim(), cree_par: session?.user.id });
    setEnvoi(false);
    if (error) {
      setErreur('Création refusée : vérifiez vos droits et les champs.');
      return;
    }
    setDate('');
    setIntitule('');
    onChange();
  };

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold text-navy-800">Séances de la commission</h2>

      {peutCreer && (
        <form onSubmit={creer} className="mt-3 space-y-3">
          <div>
            <label htmlFor="seance-date" className="mb-1 block text-sm font-medium text-navy-800">
              Date de la séance
            </label>
            <input
              id="seance-date"
              type="date"
              required
              value={date}
              onChange={(ev) => setDate(ev.target.value)}
              className={champ}
            />
          </div>
          <div>
            <label htmlFor="seance-intitule" className="mb-1 block text-sm font-medium text-navy-800">
              Intitulé
            </label>
            <input
              id="seance-intitule"
              required
              value={intitule}
              onChange={(ev) => setIntitule(ev.target.value)}
              className={champ}
            />
          </div>
          {erreur && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {erreur}
            </p>
          )}
          <button type="submit" disabled={envoi} className="btn-primary w-full py-3">
            {envoi ? 'Création…' : 'Créer la séance'}
          </button>
        </form>
      )}

      <ul className="mt-4 space-y-2">
        {seances.length === 0 && <li className="text-sm text-slate-500">Aucune séance pour le moment.</li>}
        {seances.map((s) => (
          <li key={s.id} className="rounded-lg border border-navy-100 bg-white px-3 py-2">
            <p className="text-sm font-semibold text-navy-800">{s.intitule}</p>
            <p className="text-xs text-slate-500">{new Date(s.date_seance).toLocaleDateString('fr-FR')}</p>
          </li>
        ))}
      </ul>
    </section>
  );
              }
