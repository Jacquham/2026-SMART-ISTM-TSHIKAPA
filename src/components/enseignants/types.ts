export type Enseignant = {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: string | null;
  grade: string | null;
  specialite: string | null;
  telephone: string | null;
  email: string | null;
  section_id: string;
  actif: boolean;
};

export const COLONNES_ENSEIGNANT =
  'id, matricule, nom, prenom, sexe, grade, specialite, telephone, email, section_id, actif';

export type SectionRef = { id: string; intitule: string };
