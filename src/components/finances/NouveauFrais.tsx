import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

type Props = { etudiantId: string; onChange: () => void };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';
const DESIGNATIONS = [
  "Frais d'inscription",
  'Frais académiques',
  'Frais de stage',
  'Frais de laboratoire',
  'Frais administratifs',
  'Autre frais autorisé',
];

export default function NouveauFrais({ etudiantId, onChange }: Props) {
  const [designation, setDesignation] = useState(DESIGNATIONS[0]);
  const [motif, setMotif] = useState('');
  const [montant, setMontant] = useState('');
  const [devise, setDevise] = useState('USD');
  const [annee, setAnnee] = useState('');
  const [exigibilite, setExigibilite] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const creer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    setEnvoi(true);
    const { error } = await supabase.rpc('creer_frais', {
      p_etudiant: etudiantId,
      p_designation: designation,
      p_motif: motif,
      p_montant: Number(montant),
      p_devise: devise,
      p_annee: annee,
      p_exigibilite: exigibilite || null,
    });
    setEnvoi(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setMessage('Frais enregistré.');
    setMotif('');
    setMontant('');
    onChange();
  };

  return (
    <form onSubmit={creer} className="card space-y-3 p-4">
      <h3 className="text-sm font-semibold text-navy-800">Ajouter un frais</h3>
      <select aria-label="Désignation" value={designation} onChange={(ev) => setDesignation(ev.target.value)} className={champ}>
        {DESIGNATIONS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <input aria-label="Motif" placeholder="Motif du frais" required value={motif} onChange={(ev) => setMotif(ev.target.value)} className={champ} />
      <div className="grid grid-cols-2 gap-3">
        <input aria-label="Montant exigé" type="number" min="0.01" step="0.01" required placeholder="Montant exigé" value={montant} onChange={(ev) => setMontant(ev.target.value)} className={champ} />
        <select aria-label="Devise" value={devise} onChange={(ev) => setDevise(ev.target.value)} className={champ}>
          <option value="USD">USD</option>
          <option value="CDF">CDF</option>
        </select>
      </div>
      <input aria-label="Année académique" placeholder="Année académique (ex. 2026-2027)" required value={annee} onChange={(ev) => setAnnee(ev.target.value)} className={champ} />
      <div>
        <label className="mb-1 block text-xs font-medium text-navy-800">Date d'exigibilité (facultatif)</label>
        <input type="date" value={exigibilite} onChange={(ev) => setExigibilite(ev.target.value)} className={champ} />
      </div>
      {erreur && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}
      {message && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
      <button type="submit" disabled={envoi} className="btn-primary w-full py-3">
        {envoi ? 'Enregistrement…' : 'Enregistrer le frais'}
      </button>
    </form>
  );
                                                                      }
