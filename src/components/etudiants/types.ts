export type EtudiantFiche = {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  statut: string;
  section_id: string | null;
  promotion: string | null;
  annee_academique: string | null;
  parent_nom: string | null;
  parent_telephone: string | null;
  sexe: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  nationalite: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  ecole_origine: string | null;
  identifiant_national: string | null;
  photo_path: string | null;
};

export const COLONNES_FICHE =
  'id, matricule, nom, prenom, statut, section_id, promotion, annee_academique, parent_nom, parent_telephone, sexe, date_naissance, lieu_naissance, nationalite, adresse, telephone, email, ecole_origine, identifiant_national, photo_path';
