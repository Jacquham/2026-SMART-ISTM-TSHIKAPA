import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import ListeEnseignants from '../components/enseignants/ListeEnseignants';
import NouvelEnseignant from '../components/enseignants/NouvelEnseignant';
import { COLONNES_ENSEIGNANT, type Enseignant, type SectionRef } from '../components/enseignants/types';

export default function Enseignants() {
  const { aRole, session } = useAuth();
  const monId = session?.user.id;
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [toutesSections, setToutesSections] = useState<SectionRef[]>([]);
  const [sectionsGerees, setSectionsGerees] = useState<string[]>([]);

  const global = aRole('admin_central') || aRole('sgac');
  const autorise = global || aRole('dg') || aRole('chef_section');

  const charger = useCallback(async () => {
    const [e, s, r] = await Promise.all([
      supabase.from('enseignants').select(COLONNES_ENSEIGNANT).order('nom'),
      supabase.from('sections').select('id, intitule').eq('actif', true).order('intitule'),
      supabase.from('user_roles').select('section_id').eq('user_id', monId ?? '').eq('role_code', 'chef_section'),
    ]);
    setEnseignants((e.data as Enseignant[] | null) ?? []);
    setToutesSections((s.data as SectionRef[] | null) ?? []);
    const ids = ((r.data as { section_id: string | null }[] | null) ?? [])
      .map((x) => x.section_id)
      .filter((x): x is string => Boolean(x));
    setSectionsGerees(ids);
  }, [monId]);

  useEffect(() => {
    if (autorise) void charger();
  }, [autorise, charger]);

  const sectionsVisibles =
    global || aRole('dg') ? toutesSections : toutesSections.filter((s) => sectionsGerees.includes(s.id));
  const sectionsFormulaire = global ? toutesSections : toutesSections.filter((s) => sectionsGerees.includes(s.id));
  const peutCreer = sectionsFormulaire.length > 0;
  const peutModifier = global || sectionsGerees.length > 0;

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
        <h1 className="mt-1 text-2xl font-bold text-white">Enseignants</h1>
        <p className="mt-1 text-sm text-navy-100">{enseignants.length} enseignant(s) dans votre périmètre.</p>
      </section>

      {peutCreer && <NouvelEnseignant sections={sectionsFormulaire} onChange={charger} />}
      <ListeEnseignants
        enseignants={enseignants}
        sections={sectionsVisibles}
        peutModifier={peutModifier}
        onChange={charger}
      />
    </div>
  );
      }
