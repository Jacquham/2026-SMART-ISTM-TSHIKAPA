import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Props = { sectionId: string; sectionNom: string };

type Resume = {
  parPromotion: Record<string, number>;
  etudiants: number;
  enseignants: number;
  aVenir: number;
  enCours: number;
  termines: number;
  heuresValidees: number;
  heuresEnAttente: number;
};

function Carte({ label, valeur, accent }: { label: string; valeur: number; accent: string }) {
  return (
    <div className={`card border-t-4 p-3 ${accent}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-700">{valeur}</p>
    </div>
  );
}

export default function TableauSection({ sectionId, sectionNom }: Props) {
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    let actif = true;
    (async () => {
      const [e, p, c, a] = await Promise.all([
        supabase.from('etudiants').select('promotion').eq('section_id', sectionId),
        supabase.from('enseignants').select('id').eq('section_id', sectionId).eq('actif', true),
        supabase.from('cours').select('id, statut').eq('section_id', sectionId),
        supabase.from('affectations').select('heures, statut, cours_id'),
      ]);
      if (!actif) return;
      const etu = (e.data as { promotion: string | null }[] | null) ?? [];
      const cours = (c.data as { id: string; statut: string }[] | null) ?? [];
      const ids = new Set(cours.map((x) => x.id));
      const aff = ((a.data as { heures: number; statut: string; cours_id: string }[] | null) ?? []).filter((x) =>
        ids.has(x.cours_id),
      );
      const parPromotion: Record<string, number> = {};
      etu.forEach((x) => {
        const cle = x.promotion ?? 'Sans promotion';
        parPromotion[cle] = (parPromotion[cle] ?? 0) + 1;
      });
      const somme = (statut: string) => aff.filter((x) => x.statut === statut).reduce((t, x) => t + x.heures, 0);
      setResume({
        parPromotion,
        etudiants: etu.length,
        enseignants: (p.data ?? []).length,
        aVenir: cours.filter((x) => x.statut === 'a_venir').length,
        enCours: cours.filter((x) => x.statut === 'en_cours').length,
        termines: cours.filter((x) => x.statut === 'termine').length,
        heuresValidees: somme('validee'),
        heuresEnAttente: somme('proposee'),
      });
    })();
    return () => {
      actif = false;
    };
  }, [sectionId]);

  if (!resume) return <p className="text-sm text-slate-500">Chargement du tableau de bord…</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-navy-800">{sectionNom}</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Carte label="Étudiants" valeur={resume.etudiants} accent="border-t-navy-700" />
        <Carte label="Enseignants actifs" valeur={resume.enseignants} accent="border-t-green-600" />
        <Carte label="Heures validées" valeur={resume.heuresValidees} accent="border-t-gold-500" />
        <Carte label="Heures en attente" valeur={resume.heuresEnAttente} accent="border-t-sky-500" />
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-navy-800">Étudiants par promotion</h3>
        <ul className="mt-2 space-y-1">
          {Object.keys(resume.parPromotion).length === 0 && <li className="text-sm text-slate-500">Aucun étudiant.</li>}
          {Object.entries(resume.parPromotion)
            .sort(([x], [y]) => x.localeCompare(y))
            .map(([promo, nombre]) => (
              <li key={promo} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{promo}</span>
                <span className="font-semibold text-navy-700">{nombre}</span>
              </li>
            ))}
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Carte label="Cours à venir" valeur={resume.aVenir} accent="border-t-gold-500" />
        <Carte label="Cours en cours" valeur={resume.enCours} accent="border-t-green-600" />
        <Carte label="Cours terminés" valeur={resume.termines} accent="border-t-navy-700" />
      </div>
    </section>
  );
                   }
