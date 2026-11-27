export type Rapport = {
  id: string;
  section_id: string;
  titre: string;
  contenu: string;
  transmis_le: string;
  lu_le: string | null;
};

export type Reponse = {
  id: string;
  rapport_id: string;
  texte: string;
  lue: boolean;
  cree_le: string;
};

export type SectionRef = { id: string; intitule: string };

export const COLONNES_RAPPORT = 'id, section_id, titre, contenu, transmis_le, lu_le';
export const COLONNES_REPONSE = 'id, rapport_id, texte, lue, cree_le';
