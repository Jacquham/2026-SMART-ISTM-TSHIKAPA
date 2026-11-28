import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { imprimerRecu } from '../../lib/recu';
import {
  formatMontant,
  LIBELLE_FRAIS,
  LIBELLE_MODE,
  LIBELLE_PAIEMENT,
  type FraisLigne,
  type Paiement,
} from './types';

type Props = {
  frais: FraisLigne;
  paiements: Paiement[];
  etudiantNom: string;
  peutSaisir: boolean;
  estAb: boolean;
  monId: string | undefined;
  onChange: () => void;
};

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';
const classesFrais = { solde: 'badge-ok', partiel: 'badge-attente', non_paye: 'badge-alerte' };
const classesPaiement = { enregistre: 'badge-attente', controle: 'badge-ok', annule: 'badge-alerte' };

export default function PaiementsFrais({ frais, paiements, etudiantNom, peutSaisir, estAb, monId, onChange }: Props) {
  const [montant, setMontant] = useState('');
  const [mode, setMode] = useState('especes');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [annulationId, setAnnulationId] = useState<string | null>(null);
  const [motif, setMotif] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    const { data, error } = await supabase.rpc('enregistrer_paiement', {
      p_frais: frais.frais_id,
      p_montant: Number(montant),
      p_mode: mode,
      p_date: date,
    });
    if (error) {
      setErreur(error.message);
      return;
    }
    setMessage(`Paiement enregistré. Reçu : ${String(data)}`);
    setMontant('');
    onChange();
  };

  const controler = async (id: string) => {
    setErreur(null);
    const { error } = await supabase.rpc('controler_paiement', { p_id: id });
    if (error) {
      setErreur(error.message);
      return;
    }
    onChange();
  };

  const annuler = async (id: string) => {
    setErreur(null);
    const { error } = await supabase.rpc('annuler_paiement', { p_id: id, p_motif: motif });
    if (error) {
      setErreur(error.message);
      return;
    }
    setAnnulationId(null);
    setMotif('');
    onChange();
  };

  return (
    <li className="card p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-navy-800">{frais.designation}</p>
          <p className="text-xs text-slate-500">{frais.motif} · {frais.annee_academique}</p>
        </div>
        <span className={classesFrais[frais.statut]}>{LIBELLE_FRAIS[frais.statut]}</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        Exigé : <b>{formatMontant(frais.montant_du, frais.devise)}</b> · Payé :{' '}
        <b className="text-green-700">{formatMontant(frais.total_paye, frais.devise)}</b> · Reste :{' '}
        <b className="text-red-600">{formatMontant(frais.solde, frais.devise)}</b>
      </p>

      <ul className="mt-3 space-y-2">
        {paiements.map((p) => (
          <li key={p.id} className="rounded-lg border border-navy-100 bg-white p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-navy-800">{formatMontant(p.montant, frais.devise)}</p>
              <span className={classesPaiement[p.statut]}>{LIBELLE_PAIEMENT[p.statut]}</span>
            </div>
            <p className="text-xs text-slate-500">
              {p.reference_recu} · {new Date(p.date_paiement).toLocaleDateString('fr-FR')} ·{' '}
              {LIBELLE_MODE[p.mode_paiement] ?? p.mode_paiement}
            </p>
            {p.motif_annulation && <p className="text-xs text-red-600">Motif d'annulation : {p.motif_annulation}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => imprimerRecu(p, frais, etudiantNom)} className="btn-secondary">
                Reçu
              </button>
              {estAb && p.statut === 'enregistre' && p.saisi_par !== monId && (
                <button type="button" onClick={() => controler(p.id)} className="btn-gold">
                  Contrôler
                </button>
              )}
              {estAb && p.statut !== 'annule' && (
                <button type="button" onClick={() => setAnnulationId(p.id)} className="btn-secondary">
                  Annuler
                </button>
              )}
            </div>
            {annulationId === p.id && (
              <div className="mt-2 space-y-2">
                <input aria-label="Motif d'annulation" placeholder="Motif (obligatoire)" value={motif} onChange={(ev) => setMotif(ev.target.value)} className={champ} />
                <button type="button" onClick={() => annuler(p.id)} className="btn-primary w-full">
                  Confirmer l'annulation
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {erreur && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}
      {message && <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

      {peutSaisir && frais.statut !== 'solde' && (
        <form onSubmit={enregistrer} className="mt-3 space-y-2">
          <input aria-label="Montant versé" type="number" min="0.01" step="0.01" required placeholder="Montant versé" value={montant} onChange={(ev) => setMontant(ev.target.value)} className={champ} />
          <div className="grid grid-cols-2 gap-2">
            <select aria-label="Mode de paiement" value={mode} onChange={(ev) => setMode(ev.target.value)} className={champ}>
              <option value="especes">Espèces</option>
              <option value="banque">Banque</option>
              <option value="mobile_money">Mobile money</option>
              <option value="autre">Autre</option>
            </select>
            <input aria-label="Date du paiement" type="date" required value={date} onChange={(ev) => setDate(ev.target.value)} className={champ} />
          </div>
          <button type="submit" className="btn-primary w-full">
            Enregistrer le paiement
          </button>
        </form>
      )}
    </li>
  );
      }
