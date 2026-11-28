import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { telechargerCsv } from '../../lib/csv';
import { formatMontant, type StatLigne } from './types';

type SectionRef = { id: string; intitule: string };

const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

export default function StatsFinances() {
  const [annee, setAnnee] = useState('');
  const [section, setSection] = useState('');
  const [promotion, setPromotion] = useState('');
  const [filtres, setFiltres] = useState({ annee: '', section: '', promotion: '' });
  const [sections, setSections] = useState<SectionRef[]>([]);
  const [lignes, setLignes] = useState<StatLigne[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('sections')
      .select('id, intitule')
      .eq('actif', true)
      .order('intitule')
      .then(({ data }) => setSections((data as SectionRef[] | null) ?? []));
  }, []);

  useEffect(() => {
    let actif = true;
    (async () => {
      setErreur(null);
      const { data, error } = await supabase.rpc('statistiques_financieres', {
        p_annee: filtres.annee || null,
        p_section: filtres.section || null,
        p_promotion: filtres.promotion || null,
      });
      if (!actif) return;
      if (error) {
        setErreur(error.message);
        return;
      }
      setLignes((data as StatLigne[] | null) ?? []);
    })();
    return () => {
      actif = false;
    };
  }, [filtres]);

  const appliquer = (e: FormEvent) => {
    e.preventDefault();
    setFiltres({ annee: annee.trim(), section, promotion: promotion.trim() });
  };

  const exporter = () => {
    telechargerCsv(
      'frais-academiques-par-section.csv',
      ['Section', 'Promotion', 'Devise', 'Effectif', 'Total exigé', 'Total payé', 'Solde restant', 'En ordre', 'Non en ordre'],
      lignes.map((l) => [
        l.section_nom,
        l.promotion,
        l.devise,
        Number(l.effectif),
        Number(l.total_exige),
        Number(l.total_paye),
        Number(l.solde),
        Number(l.en_ordre),
        Number(l.non_en_ordre),
      ]),
    );
  };

  return (
    <section className="space-y-4">
      <form onSubmit={appliquer} className="card space-y-3 p-4">
        <h2 className="text-base font-semibold text-navy-800">Tableau général des frais académiques</h2>
        <input aria-label="Année académique" placeholder="Année académique (ex. 2026-2027)" value={annee} onChange={(ev) => setAnnee(ev.target.value)} className={champ} />
        <div className="grid grid-cols-2 gap-3">
          <select aria-label="Section" value={section} onChange={(ev) => setSection(ev.target.value)} className={champ}>
            <option value="">Toutes sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.intitule}
              </option>
            ))}
          </select>
          <input aria-label="Promotion" placeholder="Promotion (ex. L1)" value={promotion} onChange={(ev) => setPromotion(ev.target.value)} className={champ} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 py-3">
            Appliquer les filtres
          </button>
          <button type="button" onClick={exporter} disabled={lignes.length === 0} className="btn-secondary flex-1 py-3">
            Exporter Excel
          </button>
        </div>
      </form>

      {erreur && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      <ul className="space-y-3">
        {lignes.length === 0 && !erreur && <li className="text-sm text-slate-500">Aucune donnée pour ces filtres.</li>}
        {lignes.map((l, i) => (
          <li key={`${l.section_nom}-${l.promotion}-${l.devise}-${i}`} className="card border-l-4 border-l-navy-700 p-3">
            <p className="font-semibold text-navy-800">
              {l.section_nom} · {l.promotion} · {l.devise}
            </p>
            <p className="mt-1 text-xs text-slate-500">{l.effectif} étudiant(s) concerné(s)</p>
            <p className="mt-2 text-sm text-slate-700">
              Exigé : <b>{formatMontant(l.total_exige, l.devise)}</b>
            </p>
            <p className="text-sm text-slate-700">
              Encaissé : <b className="text-green-700">{formatMontant(l.total_paye, l.devise)}</b>
            </p>
            <p className="text-sm text-slate-700">
              Reste à payer : <b className="text-red-600">{formatMontant(l.solde, l.devise)}</b>
            </p>
            <p className="mt-2 flex gap-2">
              <span className="badge-ok">{l.en_ordre} en ordre</span>
              <span className="badge-alerte">{l.non_en_ordre} non en ordre</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
    }
