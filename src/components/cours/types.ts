export type StatutCours = 'a_venir' | 'en_cours' | 'termine';

export type Cours = {
  id: string;
  code: string;
  intitule: string;
  section_id: string;
  promotion: string;
  semestre: string;
  annee_academique: string;
  credits: number | null;
  volume_horaire: number | null;
  statut: StatutCours;
};

export type Affectation = {
  id: string;
  cours_id: string;
  enseignant_id: string;
  heures: number;
  statut: 'proposee' | 'validee' | 'refusee';
  motif: string | null;
  propose_par: string | null;
};

export type EnseignantRef = {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  section_id: string;
  actif: boolean;
};

export type SectionRef = { id: string; intitule: string };

export const COLONNES_COURS =
  'id, code, intitule, section_id, promotion, semestre, annee_academique, credits, volume_horaire, statut';

export const LIBELLE_STATUT: Record<StatutCours, string> = {
  a_venir: 'À venir',
  en_cours: 'En cours',
  termine: 'Terminé',
};
