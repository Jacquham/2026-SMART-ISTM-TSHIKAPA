import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { SectionRef } from './types';

type Props = { sections: SectionRef[]; onChange: () => void };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function NouvelEnseignant({ sections, onChange }: Props) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [sectionId, setSectionId] = useState(sections.length === 1 ? sections[0].id : '');
  const [grade, setGrade] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [matricule, setMatricule] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const creer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setMatricule(null);
    setEnvoi(true);
    const { data, error } = await supabase.rpc('creer_enseignant', {
      p_nom: nom,
      p_prenom: prenom,
      p_section: sectionId || sections[0]?.id,
      p_grade: grade,
      p_specialite: specialite,
      p_tel: telephone,
      p_email: email,
    });
    setEnvoi(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setMatricule(String(data));
    setNom('');
    setPrenom('');
    setGrade('');
    setSpecialite('');
    setTelephone('');
    setEmail('');
    onChange();
  };

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold text-navy-800">Nouvel enseignant</h2>
      <p className="mt-1 text-xs text-slate-500">Données fictives uniquement pendant la phase de test.</p>

      <form onSubmit={creer} className="mt-3 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input aria-label="Nom" placeholder="Nom" required value={nom} onChange={(ev) => setNom(ev.target.value)} className={champ} />
          <input aria-label="Prénom" placeholder="Prénom" required value={prenom} onChange={(ev) => setPrenom(ev.target.value)} className={champ} />
        </div>
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
          <input aria-label="Grade" placeholder="Grade (ex. Assistant)" value={grade} onChange={(ev) => setGrade(ev.target.value)} className={champ} />
          <input aria-label="Spécialité" placeholder="Spécialité" value={specialite} onChange={(ev) => setSpecialite(ev.target.value)} className={champ} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input aria-label="Téléphone" type="tel" placeholder="Téléphone" value={telephone} onChange={(ev) => setTelephone(ev.target.value)} className={champ} />
          <input aria-label="Adresse e-mail" type="email" placeholder="Adresse e-mail" value={email} onChange={(ev) => setEmail(ev.target.value)} className={champ} />
        </div>

        {erreur && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {erreur}
          </p>
        )}
        {matricule && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Enseignant créé. Matricule : <span className="font-mono font-bold">{matricule}</span>
          </p>
        )}

        <button type="submit" disabled={envoi || sections.length === 0} className="btn-primary w-full py-3">
          {envoi ? 'Création…' : "Créer l'enseignant"}
        </button>
      </form>
    </section>
  );
        }
