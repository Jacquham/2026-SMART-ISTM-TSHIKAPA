import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { telechargerCsv } from '../../lib/csv';
import { formatMontant, type EtudiantRef, type LigneEtudiant } from './types';

type Props = { onChoisir: (e: EtudiantRef) => void };
type Vue = 'debiteurs' | 'soldes' | 'tous';

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function ListeDebiteurs({ onChoisir }: Props) {
  const [annee, setAnnee] = useState('');
  const [promotion, setPromotion] = useState('');
  const [filtres, setFiltres] = useState({ annee: '', promotion: '' });
  const [vue, setVue] = useState<Vue>('debiteurs');
  const [lignes, setLignes] = useState<LigneEtudiant[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    (async () => {
      setErreur(null);
      const { data, error } = await supabase.rpc('etudiants_financier', {
        p_annee: filtres.annee || null,
        p_section: null,
        p_promotion: filtres.promotion || null,
      });
      if (!actif) return;
      if (error) {
        setErreur(error.message);
        return;
      }
      setLignes((data as LigneEtudiant[] | null) ?? []);
    })();
    return () => {
      actif = false;
    };
  }, [filtres]);

  const affichees = lignes.filter((l) => {
    if (vue === 'tous') return true;
    return vue === 'debiteurs' ? Number(l.solde) > 0 : Number(l.solde) <= 0;
  });

  const appliquer = (e: FormEvent) => {
    e.preventDefault();
    setFiltres({ annee: annee.trim(), promotion: promotion.trim() });
  };

  const exporter = () => {
    telechargerCsv(
      `etudiants-${vue}.csv`,
      ['Matricule', 'Nom', 'Prénom', 'Section', 'Promotion', 'Devise', 'Total exigé', 'Total payé', 'Solde restant'],
      affichees.map((l) => [
        l.matricule,
        l.nom,
        l.prenom,
        l.section_nom,
        l.promotion,
        l.devise,
        Number(l.total_exige),
        Number(l.total_paye),
        Number(l.solde),
      ]),
    );
  };

  const bouton = (cle: Vue, texte: string) => (
    <button
      type="button"
      onClick={() => setVue(cle)}
      className={vue === cle ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
    >
      {texte}
    </button>
  );

  return (
    <section className="space-y-4">
      <form onSubmit={appliquer} className="card space-y-3 p-4">
        <h2 className="text-base font-semibold text-navy-800">Étudiants débiteurs et soldés</h2>
        <div className="grid grid-cols-2 gap-3">
          <input aria-label="Année académique" placeholder="Année (ex. 2026-2027)" value={annee} onChange={(ev) => setAnnee(ev.target.value)} className={champ} />
          <input aria-label="Promotion" placeholder="Promotion (ex. L1)" value={promotion} onChange={(ev) => setPromotion(ev.target.value)} className={champ} />
        </div>
        <button type="submit" className="btn-secondary w-full">
          Appliquer les filtres
        </button>
        <div className="flex gap-2">
          {bouton('debiteurs', 'Débiteurs')}
          {bouton('soldes', 'Soldés')}
          {bouton('tous', 'Tous')}
        </div>
        <button type="button" onClick={exporter} disabled={affichees.length === 0} className="btn-gold w-full">
          Exporter Excel ({affichees.length})
        </button>
      </form>

      {erreur && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      <ul className="space-y-2">
        {affichees.length === 0 && !erreur && <li className="text-sm text-slate-500">Aucun étudiant dans cette liste.</li>}
        {affichees.map((l) => (
          <li key={`${l.etudiant_id}-${l.devise}`}>
            <button
              type="button"
              onClick={() =>
                onChoisir({ id: l.etudiant_id, matricule: l.matricule, nom: l.nom, prenom: l.prenom, promotion: l.promotion })
              }
              className="card w-full p-3 text-left hover:border-navy-300"
            >
              <p className="font-semibold text-navy-800">
                {l.prenom} {l.nom}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-mono text-navy-700">{l.matricule}</span> · {l.section_nom} · {l.promotion}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Reste : <b className={Number(l.solde) > 0 ? 'text-red-600' : 'text-green-700'}>{formatMontant(l.solde, l.devise)}</b>{' '}
                sur {formatMontant(l.total_exige, l.devise)}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
        }
