import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import NouveauCours from '../components/cours/NouveauCours';
import ListeCours from '../components/cours/ListeCours';
import ChargeHoraire from '../components/cours/ChargeHoraire';
import {
  COLONNES_COURS,
  type Affectation,
  type Cours,
  type EnseignantRef,
  type SectionRef,
} from '../components/cours/types';

export default function CoursPage() {
  const { aRole, session } = useAuth();
  const monId = session?.user.id;
  const [cours, setCours] = useState<Cours[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [enseignants, setEnseignants] = useState<EnseignantRef[]>([]);
  const [toutesSections, setToutesSections] = useState<SectionRef[]>([]);
  const [sectionsGerees, setSectionsGerees] = useState<string[]>([]);

  const global = aRole('admin_central') || aRole('sgac');
  const estSgac = aRole('sgac');
  const autorise = global || aRole('dg') || aRole('chef_section');

  const charger = useCallback(async () => {
    const [c, a, e, s, r] = await Promise.all([
      supabase.from('cours').select(COLONNES_COURS).order('promotion').order('code'),
      supabase.from('affectations').select('id, cours_id, enseignant_id, heures, statut, motif, propose_par'),
      supabase.from('enseignants').select('id, matricule, nom, prenom, section_id, actif').order('nom'),
      supabase.from('sections').select('id, intitule').eq('actif', true).order('intitule'),
      supabase.from('user_roles').select('section_id').eq('user_id', monId ?? '').eq('role_code', 'chef_section'),
    ]);
    setCours((c.data as Cours[] | null) ?? []);
    setAffectations((a.data as Affectation[] | null) ?? []);
    setEnseignants((e.data as EnseignantRef[] | null) ?? []);
    setToutesSections((s.data as SectionRef[] | null) ?? []);
    const ids = ((r.data as { section_id: string | null }[] | null) ?? [])
      .map((x) => x.section_id)
      .filter((x): x is string => Boolean(x));
    setSectionsGerees(ids);
  }, [monId]);

  useEffect(() => {
    if (autorise) void charger();
  }, [autorise, charger]);

  const gerees = toutesSections.filter((s) => sectionsGerees.includes(s.id));
  const sectionsVisibles = global || aRole('dg') ? toutesSections : gerees;
  const sectionsFormulaire = global ? toutesSections : gerees;
  const peutGerer = global || sectionsGerees.length > 0;

  if (!autorise) {
    return (
      <div className="card p-5">
        <h1 className="text-lg font-semibold text-navy-800">Accès réservé</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cette page est réservée à l'administration, au SGAC, à la Direction générale et aux chefs de section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Espace académique</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Cours et charges horaires</h1>
        <p className="mt-1 text-sm text-navy-100">
          Le chef de section propose, le SGAC valide. {cours.length} cours dans votre périmètre.
        </p>
      </section>

      {peutGerer && sectionsFormulaire.length > 0 && <NouveauCours sections={sectionsFormulaire} onChange={charger} />}

      <ListeCours
        cours={cours}
        affectations={affectations}
        enseignants={enseignants}
        sections={sectionsVisibles}
        peutGerer={peutGerer}
        peutProposer={peutGerer}
        estSgac={estSgac}
        monId={monId}
        onChange={charger}
      />

      <ChargeHoraire enseignants={enseignants} affectations={affectations} />
    </div>
  );
    }
