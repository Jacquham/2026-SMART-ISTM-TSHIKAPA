import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { SectionRef } from './types';

type Props = { sections: SectionRef[]; onChange: () => void };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function NouveauCours({ sections, onChange }: Props) {
  const [code, setCode] = useState('');
  const [intitule, setIntitule] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [promotion, setPromotion] = useState('L1');
  const [semestre, setSemestre] = useState('S1');
  const [annee, setAnnee] = useState('');
  const [credits, setCredits] = useState('');
  const [volume, setVolume] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const creer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    const section = sectionId || (sections.length === 1 ? sections[0].id : '');
    if (!section) {
      setErreur('Choisissez une section.');
      return;
    }
    setEnvoi(true);
    const { error } = await supabase.from('cours').insert({
      code: code.trim().toUpperCase(),
      intitule: intitule.trim(),
      section_id: section,
      promotion,
      semestre,
      annee_academique: annee.trim(),
      credits: credits ? Number(credits) : null,
      volume_horaire: volume ? Number(volume) : null,
    });
    setEnvoi(false);
    if (error) {
      setErreur(
        error.message.includes('duplicate')
          ? 'Ce code existe déjà pour cette section et cette année.'
          : 'Création refusée : vérifiez vos droits et les champs.',
      );
      return;
    }
    setMessage('Cours créé.');
    setCode('');
    setIntitule('');
    setCredits('');
    setVolume('');
    onChange();
  };

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold text-navy-800">Nouveau cours</h2>
      <form onSubmit={creer} className="mt-3 space-y-3">
        {sections.length > 1 && (
          <select aria-label="Section" required value={sectionId} onChange={(ev) => setSectionId(ev.target.value)} className={champ}>
            <option value="">Choisir une section…</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.intitule}
              </option>
            ))}
          </select>
        )}
        {sections.length === 1 && <p className="text-sm text-navy-700">Section : {sections[0].intitule}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <input aria-label="Code du cours" placeholder="Code (ex. ANA101)" required value={code} onChange={(ev) => setCode(ev.target.value)} className={champ} />
          <input aria-label="Intitulé" placeholder="Intitulé du cours" required value={intitule} onChange={(ev) => setIntitule(ev.target.value)} className={champ} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select aria-label="Promotion" value={promotion} onChange={(ev) => setPromotion(ev.target.value)} className={champ}>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
          </select>
          <select aria-label="Semestre" value={semestre} onChange={(ev) => setSemestre(ev.target.value)} className={champ}>
            <option value="S1">Semestre 1</option>
            <option value="S2">Semestre 2</option>
          </select>
        </div>
        <input aria-label="Année académique" placeholder="Année académique (ex. 2026-2027)" required value={annee} onChange={(ev) => setAnnee(ev.target.value)} className={champ} />
        <div className="grid grid-cols-2 gap-3">
          <input aria-label="Crédits" type="number" min="0" placeholder="Crédits" value={credits} onChange={(ev) => setCredits(ev.target.value)} className={champ} />
          <input aria-label="Volume horaire" type="number" min="0" placeholder="Volume horaire (h)" value={volume} onChange={(ev) => setVolume(ev.target.value)} className={champ} />
        </div>
        {erreur && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {erreur}
          </p>
        )}
        {message && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
        <button type="submit" disabled={envoi || sections.length === 0} className="btn-primary w-full py-3">
          {envoi ? 'Création…' : 'Créer le cours'}
        </button>
      </form>
    </section>
  );
      }
