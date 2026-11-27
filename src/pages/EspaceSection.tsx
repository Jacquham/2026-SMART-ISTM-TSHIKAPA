import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useNotifications } from '../lib/notifications';
import TableauSection from '../components/chef/TableauSection';
import RapportsChef from '../components/chef/RapportsChef';
import type { SectionRef } from '../components/chef/types';

export default function EspaceSection() {
  const { aRole, session } = useAuth();
  const { total, recharger } = useNotifications();
  const monId = session?.user.id;
  const estChef = aRole('chef_section');
  const [mesSections, setMesSections] = useState<SectionRef[]>([]);
  const [choisie, setChoisie] = useState('');
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    if (!estChef || !monId) return;
    let actif = true;
    (async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('section_id')
        .eq('user_id', monId)
        .eq('role_code', 'chef_section');
      const ids = ((roles as { section_id: string | null }[] | null) ?? [])
        .map((r) => r.section_id)
        .filter((x): x is string => Boolean(x));
      const { data: secs } = await supabase
        .from('sections')
        .select('id, intitule')
        .in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
      if (!actif) return;
      const liste = (secs as SectionRef[] | null) ?? [];
      setMesSections(liste);
      setChoisie(liste[0]?.id ?? '');
      setCharge(true);
    })();
    return () => {
      actif = false;
    };
  }, [estChef, monId]);

  if (!estChef) {
    return (
      <div className="card p-5">
        <h1 className="text-lg font-semibold text-navy-800">Accès réservé</h1>
        <p className="mt-1 text-sm text-slate-600">Cette page est réservée aux chefs de section.</p>
      </div>
    );
  }

  const section = mesSections.find((s) => s.id === choisie) ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Chef de section</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Espace de ma section</h1>
        <p className="mt-1 text-sm text-navy-100">
          {total > 0
            ? `${total} réponse(s) du SGAC à lire.`
            : 'Suivez vos étudiants, vos enseignants et vos cours, et transmettez vos rapports au SGAC.'}
        </p>
      </section>

      {charge && !section && (
        <div className="card p-5 text-sm text-slate-600">
          Aucune section n'est rattachée à votre compte. Contactez l'administrateur.
        </div>
      )}

      {mesSections.length > 1 && (
        <select
          aria-label="Section"
          value={choisie}
          onChange={(ev) => setChoisie(ev.target.value)}
          className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900"
        >
          {mesSections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.intitule}
            </option>
          ))}
        </select>
      )}

      {section && (
        <>
          <TableauSection sectionId={section.id} sectionNom={section.intitule} />
          <RapportsChef sectionId={section.id} onNotification={recharger} />
        </>
      )}
    </div>
  );
          }
