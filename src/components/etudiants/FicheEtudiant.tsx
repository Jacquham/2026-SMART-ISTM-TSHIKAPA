import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import PhotoEtudiant from './PhotoEtudiant';
import type { EtudiantFiche } from './types';

type Cle =
  | 'date_naissance'
  | 'lieu_naissance'
  | 'nationalite'
  | 'adresse'
  | 'telephone'
  | 'email'
  | 'ecole_origine'
  | 'parent_nom'
  | 'parent_telephone'
  | 'identifiant_national';

const CHAMPS: { cle: Cle; label: string; type?: string }[] = [
  { cle: 'date_naissance', label: 'Date de naissance', type: 'date' },
  { cle: 'lieu_naissance', label: 'Lieu de naissance' },
  { cle: 'nationalite', label: 'Nationalité' },
  { cle: 'adresse', label: 'Adresse' },
  { cle: 'telephone', label: 'Téléphone', type: 'tel' },
  { cle: 'email', label: 'Adresse e-mail', type: 'email' },
  { cle: 'ecole_origine', label: "École d'origine" },
  { cle: 'parent_nom', label: 'Parent ou tuteur' },
  { cle: 'parent_telephone', label: 'Téléphone du parent', type: 'tel' },
  { cle: 'identifiant_national', label: 'Identifiant national (carte)' },
];

type Props = {
  etudiant: EtudiantFiche;
  sectionNom: string;
  peutModifier: boolean;
  onChange: () => void;
  onFermer: () => void;
};

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function FicheEtudiant({ etudiant, sectionNom, peutModifier, onChange, onFermer }: Props) {
  const [edition, setEdition] = useState(false);
  const [valeurs, setValeurs] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const commencer = () => {
    const v: Record<string, string> = { sexe: etudiant.sexe ?? '' };
    CHAMPS.forEach((c) => {
      v[c.cle] = etudiant[c.cle] ?? '';
    });
    setValeurs(v);
    setErreur(null);
    setEdition(true);
  };

  const enregistrer = async (ev: FormEvent) => {
    ev.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const maj: Record<string, string | null> = { sexe: valeurs.sexe || null };
    CHAMPS.forEach((c) => {
      maj[c.cle] = valeurs[c.cle]?.trim() || null;
    });
    const { error } = await supabase.from('etudiants').update(maj).eq('id', etudiant.id);
    setEnvoi(false);
    if (error) {
      setErreur("Enregistrement refusé : vérifiez vos droits. L'identifiant national doit être unique.");
      return;
    }
    setEdition(false);
    onChange();
  };

  return (
    <section className="card border-l-4 border-l-navy-700 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-800">
            {etudiant.prenom} {etudiant.nom}
          </h2>
          <p className="font-mono text-sm text-navy-700">{etudiant.matricule}</p>
          <p className="mt-1 text-xs text-slate-500">
            {sectionNom} · {etudiant.promotion ?? '—'} · {etudiant.annee_academique ?? '—'} · {etudiant.statut}
          </p>
        </div>
        <button type="button" onClick={onFermer} className="btn-secondary shrink-0">
          Fermer
        </button>
      </div>

      <div className="mt-4">
        <PhotoEtudiant
          etudiantId={etudiant.id}
          photoPath={etudiant.photo_path}
          peutModifier={peutModifier}
          onChange={onChange}
        />
      </div>

      {!edition ? (
        <div className="mt-4">
          <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Sexe</dt>
              <dd className="text-sm text-slate-800">{etudiant.sexe === 'M' ? 'Masculin' : etudiant.sexe === 'F' ? 'Féminin' : '—'}</dd>
            </div>
            {CHAMPS.map((c) => (
              <div key={c.cle}>
                <dt className="text-xs text-slate-500">{c.label}</dt>
                <dd className="break-words text-sm text-slate-800">{etudiant[c.cle] || '—'}</dd>
              </div>
            ))}
          </dl>
          {peutModifier && (
            <button type="button" onClick={commencer} className="btn-primary mt-4 w-full py-3">
              Modifier les informations
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={enregistrer} className="mt-4 space-y-3">
          <select aria-label="Sexe" value={valeurs.sexe} onChange={(e) => setValeurs({ ...valeurs, sexe: e.target.value })} className={champ}>
            <option value="">Sexe…</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          {CHAMPS.map((c) => (
            <div key={c.cle}>
              <label className="mb-1 block text-xs font-medium text-navy-800">{c.label}</label>
              <input
                type={c.type ?? 'text'}
                value={valeurs[c.cle] ?? ''}
                onChange={(e) => setValeurs({ ...valeurs, [c.cle]: e.target.value })}
                className={champ}
              />
            </div>
          ))}
          {erreur && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {erreur}
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setEdition(false)} className="btn-secondary flex-1 py-3">
              Annuler
            </button>
            <button type="submit" disabled={envoi} className="btn-primary flex-1 py-3">
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
  }
