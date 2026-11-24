import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { Section } from './types';

type Props = { sections: Section[]; onChange: () => void };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function NouvelEtudiant({ sections, onChange }: Props) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [promotion, setPromotion] = useState('');
  const [annee, setAnnee] = useState('');
  const [parentNom, setParentNom] = useState('');
  const [parentTel, setParentTel] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [matricule, setMatricule] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const creer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setMatricule(null);
    setEnvoi(true);
    const { data, error } = await supabase.rpc('creer_etudiant', {
      p_nom: nom,
      p_prenom: prenom,
      p_section: sectionId,
      p_promotion: promotion,
      p_annee: annee,
      p_parent_nom: parentNom,
      p_parent_tel: parentTel,
    });
    setEnvoi(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setMatricule(String(data));
    setNom('');
    setPrenom('');
    setPromotion('');
    setParentNom('');
    setParentTel('');
    onChange();
  };

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-base font-semibold text-navy-800">Nouveau dossier étudiant</h2>
      <p className="mt-1 text-xs text-slate-500">Données fictives uniquement pendant la phase de test.</p>

      <form onSubmit={creer} className="mt-3 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input aria-label="Nom" placeholder="Nom" required value={nom} onChange={(ev) => setNom(ev.target.value)} className={champ} />
          <input aria-label="Prénom" placeholder="Prénom" required value={prenom} onChange={(ev) => setPrenom(ev.target.value)} className={champ} />
        </div>
        <select aria-label="Section" required value={sectionId} onChange={(ev) => setSectionId(ev.target.value)} className={champ}>
          <option value="">Choisir une section…</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.intitule}
            </option>
          ))}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <input aria-label="Promotion" placeholder="Promotion (ex. L1)" value={promotion} onChange={(ev) => setPromotion(ev.target.value)} className={champ} />
          <input aria-label="Année académique" placeholder="Année académique (ex. 2026-2027)" required value={annee} onChange={(ev) => setAnnee(ev.target.value)} className={champ} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input aria-label="Nom du parent" placeholder="Nom du parent" value={parentNom} onChange={(ev) => setParentNom(ev.target.value)} className={champ} />
          <input aria-label="Téléphone du parent" placeholder="Téléphone du parent" value={parentTel} onChange={(ev) => setParentTel(ev.target.value)} className={champ} />
        </div>

        {erreur && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {erreur}
          </p>
        )}
        {matricule && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Dossier créé. Matricule : <span className="font-mono font-bold">{matricule}</span>
          </p>
        )}

        <button type="submit" disabled={envoi || sections.length === 0} className="btn-primary w-full py-3">
          {envoi ? 'Création…' : 'Créer le dossier'}
        </button>
        {sections.length === 0 && (
          <p className="text-xs text-slate-500">Aucune section active : créez d'abord une section.</p>
        )}
      </form>
    </section>
  );
}
