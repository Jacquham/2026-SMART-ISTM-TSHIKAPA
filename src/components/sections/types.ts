export type SectionLigne = {
  id: string;
  code: string;
  intitule: string;
  type: 'section' | 'departement';
  actif: boolean;
  parent_id: string | null;
};
