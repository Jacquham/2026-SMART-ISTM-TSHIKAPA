export type Seance = { id: string; date_seance: string; intitule: string };

export type Etudiant = {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  statut: string;
};

export type Decision = {
  id: string;
  seance_id: string;
  etudiant_id: string;
  decision: string;
  motif: string;
  statut: string;
  proposee_par: string;
};

export type Section = { id: string; intitule: string };
