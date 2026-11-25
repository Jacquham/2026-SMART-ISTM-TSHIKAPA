import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import ListeSections from '../components/sections/ListeSections';
import NouvelleSection from '../components/sections/NouvelleSection';
import type { SectionLigne } from '../components/sections/types';

export default function SectionsDepartements() {
  const { aRole } = useAuth();
  const [sections, setSections] = useState<SectionLigne[]>([]);

  const autorise = aRole('admin_central') || aRole('dg');

  const charger = useCallback(async () => {
    const { data } = await supabase
      .from('sections')
      .select('id, code, intitule, type, actif, parent_id')
      .order('intitule');
    setSections((data as SectionLigne[] | null) ?? []);
  }, []);

  useEffect(() => {
    if (autorise) void charger();
  }, [autorise, charger]);

  if (!autorise) {
    return (
      <div className="card p-5">
        <h1 className="text-lg font-semibold text-navy-800">Accès réservé</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cette page est réservée à l'administrateur central et à la Direction générale.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Espace académique</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Sections et départements</h1>
        <p className="mt-1 text-sm text-navy-100">
          Chaque département est rattaché à sa section. Les étudiants et les enseignants dépendent de leur section.
        </p>
      </section>

      <NouvelleSection sections={sections} onChange={charger} />
      <ListeSections sections={sections} onChange={charger} />
    </div>
  );
      }
