import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import type { Decision, Etudiant, Seance, Section } from '../components/commission/types';
import Seances from '../components/commission/Seances';
import NouvelEtudiant from '../components/commission/NouvelEtudiant';
import Decisions from '../components/commission/Decisions';

export default function Commission() {
  const { aRole } = useAuth();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const peutProposer = aRole('membre_commission') || aRole('president_jury');
  const peutValider = aRole('president_jury');
  const peutGererSeances = aRole('admin_central') || aRole('sgac');
  const peutCreerEtudiant = aRole('admin_central') || aRole('sgac') || aRole('agent_scolarite');
  const autorise = peutProposer || peutGererSeances || peutCreerEtudiant;

  const charger = useCallback(async () => {
    const [a, b, c, d] = await Promise.all([
      supabase.from('commission_seances').select('id, date_seance, intitule').order('date_seance', { ascending: false }),
      supabase.from('etudiants').select('id, matricule, nom, prenom, statut').order('nom'),
      supabase
        .from('commission_decisions')
        .select('id, seance_id, etudiant_id, decision, motif, statut, proposee_par')
        .order('cree_le', { ascending: false }),
      supabase.from('sections').select('id, intitule').eq('actif', true).order('intitule'),
    ]);
    setSeances((a.data as Seance[]) ?? []);
    setEtudiants((b.data as Etudiant[]) ?? []);
    setDecisions((c.data as Decision[]) ?? []);
    setSections((d.data as Section[]) ?? []);
  }, []);

  useEffect(() => {
    if (autorise) void charger();
  }, [autorise, charger]);

  if (!autorise) {
    return (
      <div className="card p-5">
        <h1 className="text-lg font-semibold text-navy-800">Accès réservé</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cette page est réservée aux membres de la commission d'inscription et aux responsables concernés.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Espace académique</p>
                <h1 className="mt-1 text-2xl font-bold text-white">Commission d'inscription</h1>
        <p className="mt-1 text-sm text-navy-100">
          Un membre propose une décision, le président du jury la valide.
        </p>
      </section>

      <Seances seances={seances} peutCreer={peutGererSeances} onChange={charger} />
      {peutCreerEtudiant && <NouvelEtudiant sections={sections} onChange={charger} />}
      <Decisions
        seances={seances}
        etudiants={etudiants}
        decisions={decisions}
        peutProposer={peutProposer}
        peutValider={peutValider}
        onChange={charger}
      />
    </div>
  );
}
