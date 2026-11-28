import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import NouveauFrais from './NouveauFrais';
import PaiementsFrais from './PaiementsFrais';
import { COLONNES_PAIEMENT, formatMontant, type EtudiantRef, type FraisLigne, type Paiement } from './types';

type Props = { etudiant: EtudiantRef; onFermer: () => void };

export default function SituationEtudiant({ etudiant, onFermer }: Props) {
  const { aRole, session } = useAuth();
  const monId = session?.user.id;
  const [frais, setFrais] = useState<FraisLigne[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  const nom = `${etudiant.prenom} ${etudiant.nom} (${etudiant.matricule})`;

  const charger = useCallback(async () => {
    setErreur(null);
    const { data, error } = await supabase.rpc('situation_etudiant', { p_etudiant: etudiant.id });
    if (error) {
      setErreur(error.message);
      return;
    }
    const lignes = (data as FraisLigne[] | null) ?? [];
    setFrais(lignes);
    if (lignes.length === 0) {
      setPaiements([]);
      return;
    }
    const { data: p } = await supabase
      .from('paiements')
      .select(COLONNES_PAIEMENT)
      .in('frais_id', lignes.map((l) => l.frais_id))
      .order('cree_le', { ascending: true });
    setPaiements((p as Paiement[] | null) ?? []);
  }, [etudiant.id]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const totaux: Record<string, { exige: number; paye: number; solde: number }> = {};
  frais.forEach((f) => {
    const t = totaux[f.devise] ?? { exige: 0, paye: 0, solde: 0 };
    t.exige += Number(f.montant_du);
    t.paye += Number(f.total_paye);
    t.solde += Number(f.solde);
    totaux[f.devise] = t;
  });

  return (
    <section className="card border-l-4 border-l-gold-500 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-700">Situation financière de l'étudiant</p>
          <h2 className="mt-1 text-lg font-bold text-navy-800">{nom}</h2>
          <p className="text-xs text-slate-500">Promotion : {etudiant.promotion ?? '—'}</p>
        </div>
        <button type="button" onClick={onFermer} className="btn-secondary shrink-0">
          Fermer
        </button>
      </div>

      {erreur && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      {Object.entries(totaux).map(([devise, t]) => (
        <div key={devise} className="mt-3 rounded-lg bg-navy-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-800">Total en {devise}</p>
            <span className={t.solde <= 0 ? 'badge-ok' : 'badge-alerte'}>{t.solde <= 0 ? 'En ordre' : 'Non en ordre'}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700">
            Exigé : <b>{formatMontant(t.exige, devise)}</b> · Payé : <b>{formatMontant(t.paye, devise)}</b> · Reste :{' '}
            <b>{formatMontant(t.solde, devise)}</b>
          </p>
        </div>
      ))}

      {aRole('ab') && (
        <div className="mt-4">
          <NouveauFrais etudiantId={etudiant.id} onChange={charger} />
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {frais.length === 0 && <li className="text-sm text-slate-500">Aucun frais enregistré pour cet étudiant.</li>}
        {frais.map((f) => (
          <PaiementsFrais
            key={f.frais_id}
            frais={f}
            paiements={paiements.filter((p) => p.frais_id === f.frais_id)}
            etudiantNom={nom}
            peutSaisir={aRole('caissier')}
            estAb={aRole('ab')}
            monId={monId}
            onChange={charger}
          />
        ))}
      </ul>
    </section>
  );
    }
