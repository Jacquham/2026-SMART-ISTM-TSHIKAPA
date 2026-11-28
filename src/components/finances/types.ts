export type FraisLigne = {
  frais_id: string;
  designation: string;
  motif: string;
  devise: string;
  annee_academique: string;
  date_exigibilite: string | null;
  montant_du: number;
  total_paye: number;
  solde: number;
  statut: 'solde' | 'partiel' | 'non_paye';
};

export type Paiement = {
  id: string;
  frais_id: string;
  montant: number;
  date_paiement: string;
  mode_paiement: string;
  reference_recu: string;
  statut: 'enregistre' | 'controle' | 'annule';
  motif_annulation: string | null;
  saisi_par: string | null;
};

export type EtudiantRef = {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  promotion: string | null;
};

export type StatLigne = {
  section_nom: string;
  promotion: string;
  devise: string;
  effectif: number;
  total_exige: number;
  total_paye: number;
  solde: number;
  en_ordre: number;
  non_en_ordre: number;
};

export type LigneEtudiant = {
  etudiant_id: string;
  matricule: string;
  nom: string;
  prenom: string;
  section_nom: string;
  promotion: string;
  devise: string;
  total_exige: number;
  total_paye: number;
  solde: number;
};

export const COLONNES_PAIEMENT =
  'id, frais_id, montant, date_paiement, mode_paiement, reference_recu, statut, motif_annulation, saisi_par';

export const LIBELLE_FRAIS = { solde: 'Soldé', partiel: 'Partiel', non_paye: 'Non payé' } as const;
export const LIBELLE_PAIEMENT = { enregistre: 'Enregistré', controle: 'Contrôlé', annule: 'Annulé' } as const;
export const LIBELLE_MODE: Record<string, string> = {
  especes: 'Espèces',
  banque: 'Banque',
  mobile_money: 'Mobile money',
  autre: 'Autre',
};

export function formatMontant(valeur: number, devise: string): string {
  const texte = Number(valeur).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${texte} ${devise}`;
    }
