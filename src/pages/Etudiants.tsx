import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import FicheEtudiant from '../components/etudiants/FicheEtudiant';
import { COLONNES_FICHE, type EtudiantFiche } from '../components/etudiants/types';

type Section = { id: string; intitule: string };

export default function Etudiants() {
  const { aRole } = useAuth();
  const [liste, setListe] = useState<EtudiantFiche[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [recherche, setRecherche] = useState('');
  const [choisiId, setChoisiId] = useState<string | null>(null);

  const peutModifier = aRole('admin_central') || aRole('sgac') || aRole('agent_scolarite');
  const autorise = peutModifier || aRole('membre_commission') || aRole('president_jury');

  const charger = useCallback(async () => {
    const [e, s] = await Promise.all([
      supabase.from('etudiants').select(COLONNES_FICHE).order('nom'),
      supabase.from('sections').select('id, intitule'),
    ]);
    setListe((e.data as EtudiantFiche[] | null) ?? []);
    setSections((s.data as Section[] | null) ?? []);
  }, []);

  useEffect(() => {
    if (autorise) void charger();
  }, [autorise, charger]);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return liste;
    return liste.filter((e) => `${e.matricule} ${e.nom} ${e.prenom}`.toLowerCase().includes(q));
  }, [liste, recherche]);

  const nomSection = (id: string | null) => sections.find((s) => s.id === id)?.intitule ?? '—';
  const choisi = liste.find((e) => e.id === choisiId) ?? null;

  if (!autorise) {
    return (
      <div className="card p-5">
        <h1 className="text-lg font-semibold text-navy-800">Accès réservé</h1>
        <p className="mt-1 text-sm text-slate-600">Cette page est réservée à la scolarité et à la commission.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Espace académique</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Dossiers étudiants</h1>
        <p className="mt-1 text-sm text-navy-100">{liste.length} dossier(s) enregistré(s).</p>
      </section>

      {choisi && (
        <FicheEtudiant
          etudiant={choisi}
          sectionNom={nomSection(choisi.section_id)}
          peutModifier={peutModifier}
          onChange={charger}
          onFermer={() => setChoisiId(null)}
        />
      )}

      <section>
        <input
          type="search"
          aria-label="Rechercher un étudiant"
          placeholder="Rechercher par nom ou matricule…"
          value={recherche}
          onChange={(ev) => setRecherche(ev.target.value)}
          className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900"
        />
        <ul className="mt-3 space-y-2">
          {filtres.length === 0 && <li className="text-sm text-slate-500">Aucun dossier trouvé.</li>}
          {filtres.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => {
                  setChoisiId(e.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="card w-full p-3 text-left hover:border-navy-300"
              >
                <p className="font-semibold text-navy-800">
                  {e.prenom} {e.nom}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-navy-700">{e.matricule}</span>
                  <span>{nomSection(e.section_id)}</span>
                  <span className={e.statut === 'inscrit' ? 'badge-ok' : 'badge-attente'}>{e.statut}</span>
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
    }
