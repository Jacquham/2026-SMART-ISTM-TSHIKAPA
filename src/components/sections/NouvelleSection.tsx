import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { SectionLigne } from './types';

type Props = { sections: SectionLigne[]; onChange: () => void };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function NouvelleSection({ sections, onChange }: Props) {
  const [type, setType] = useState<'section' | 'departement'>('section');
  const [code, setCode] = useState('');
  const [intitule, setIntitule] = useState('');
  const [parentId, setParentId] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const principales = sections.filter((s) => s.type === 'section' && s.actif);

  const creer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    const codeNet = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,4}$/.test(codeNet)) {
      setErreur('Le code doit avoir 2 à 4 lettres ou chiffres, sans espace.');
      return;
    }
    if (type === 'departement' && !parentId) {
      setErreur('Choisissez la section de rattachement du département.');
      return;
    }
    setEnvoi(true);
    const { error } = await supabase.from('sections').insert({
      code: codeNet,
      intitule: intitule.trim(),
      type,
      parent_id: type === 'departement' ? parentId : null,
    });
    setEnvoi(false);
    if (error) {
      setErreur(error.message.includes('duplicate') ? 'Ce code existe déjà.' : 'Création refusée : vérifiez vos droits.');
      return;
    }
    setMessage(`${type === 'section' ? 'Section' : 'Département'} créé(e) avec le code ${codeNet}.`);
    setCode('');
    setIntitule('');
    setParentId('');
    onChange();
  };

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold text-navy-800">Nouvelle section ou nouveau département</h2>
      <form onSubmit={creer} className="mt-3 space-y-3">
        <select aria-label="Type" value={type} onChange={(ev) => setType(ev.target.value as 'section' | 'departement')} className={champ}>
          <option value="section">Section</option>
          <option value="departement">Département (rattaché à une section)</option>
        </select>
        {type === 'departement' && (
          <select aria-label="Section de rattachement" required value={parentId} onChange={(ev) => setParentId(ev.target.value)} className={champ}>
            <option value="">Choisir la section de rattachement…</option>
            {principales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.intitule} ({s.code})
              </option>
            ))}
          </select>
        )}
        <input aria-label="Intitulé" placeholder="Intitulé" required value={intitule} onChange={(ev) => setIntitule(ev.target.value)} className={champ} />
        <div>
          <input aria-label="Code" placeholder="Code (2 à 4 lettres, ex. SF)" required value={code} onChange={(ev) => setCode(ev.target.value)} className={champ} />
          <p className="mt-1 text-xs text-slate-500">
            Le code sert dans les matricules des étudiants. Choisissez-le avec soin : il ne doit plus être changé.
          </p>
        </div>
        {erreur && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {erreur}
          </p>
        )}
        {message && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
        <button type="submit" disabled={envoi} className="btn-primary w-full py-3">
          {envoi ? 'Création…' : 'Créer'}
        </button>
      </form>
    </section>
  );
      }
