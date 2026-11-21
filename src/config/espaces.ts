// Espaces de travail et modules — extraits de la version 1.2 du cahier des charges.
// Source unique : toute évolution du cahier doit être reportée ici.

export type Module = { code: string; nom: string; priorite: 'Indispensable' | 'Haute' | 'Moyenne' | 'Basse' | 'À arbitrer' };

export type Espace = {
  id: string;
  nom: string;
  responsable: string;
  modules: Module[];
};

export const espaces: Espace[] = [
  {
    id: 'direction',
    nom: 'Direction générale',
    responsable: 'Directeur général',
    modules: [
      { code: 'DG-01', nom: 'Tableau de bord de la Direction générale', priorite: 'Haute' },
      { code: 'DG-02', nom: 'Gouvernance, décisions et réunions', priorite: 'Haute' },
      { code: 'DG-03', nom: 'Visas et validations', priorite: 'Haute' },
      { code: 'DG-04', nom: 'Partenariats et conventions', priorite: 'Moyenne' },
    ],
  },
  {
    id: 'academique',
    nom: 'Espace académique',
    responsable: 'Secrétaire général académique',
    modules: [
      { code: 'ACA-01', nom: 'Tableau de bord académique', priorite: 'Haute' },
      { code: 'ACA-02', nom: 'Personnel académique et comptes enseignants', priorite: 'Haute' },
      { code: 'ACA-03', nom: 'Charges horaires et horaires', priorite: 'Haute' },
      { code: 'ACA-04', nom: 'Sections, départements et rattachements', priorite: 'Haute' },
      { code: 'ACA-05', nom: 'Programmes LMD et supports de cours', priorite: 'Haute' },
      { code: 'ACA-06', nom: 'Dossiers étudiants et scolarité (IUN)', priorite: 'À arbitrer' },
      { code: 'ACA-07', nom: "Commission d'inscription", priorite: 'Haute' },
      { code: 'ACA-08', nom: 'Parcours et cycle de vie étudiant', priorite: 'Moyenne' },
      { code: 'ACA-09', nom: 'Évaluations, examens et délibérations', priorite: 'À arbitrer' },
      { code: 'ACA-10', nom: 'Stages cliniques et affectations', priorite: 'Moyenne' },
    ],
  },
  {
    id: 'recherche',
    nom: 'Recherche scientifique',
    responsable: 'Secrétaire général à la recherche',
    modules: [
      { code: 'REC-01', nom: 'Projets, chercheurs et équipes', priorite: 'Moyenne' },
      { code: 'REC-02', nom: 'Production scientifique et publications', priorite: 'Moyenne' },
      { code: 'REC-03', nom: 'TFC, mémoires et soutenances', priorite: 'Moyenne' },
      { code: 'REC-04', nom: 'Partenariats scientifiques', priorite: 'Basse' },
    ],
  },
  {
    id: 'administratif',
    nom: 'Espace administratif',
    responsable: 'Secrétaire général administratif',
    modules: [
      { code: 'ADM-01', nom: 'Ressources humaines intégrées', priorite: 'Haute' },
      { code: 'ADM-02', nom: 'Patrimoine et infrastructures', priorite: 'Haute' },
      { code: 'ADM-03', nom: 'Laboratoires et équipements pédagogiques', priorite: 'Haute' },
      { code: 'ADM-04', nom: 'Achats et approvisionnement', priorite: 'Moyenne' },
      { code: 'ADM-05', nom: 'Stocks', priorite: 'Moyenne' },
      { code: 'ADM-06', nom: 'Réunions administratives et comptes rendus', priorite: 'Basse' },
    ],
  },
  {
    id: 'budget',
    nom: 'Budget et finances',
    responsable: "Administrateur du budget",
    modules: [
      { code: 'BUD-01', nom: 'Budget et engagements', priorite: 'Haute' },
      { code: 'BUD-02', nom: 'Frais académiques, caisse et recettes', priorite: 'À arbitrer' },
      { code: 'BUD-03', nom: 'Dépenses et justificatifs', priorite: 'À arbitrer' },
      { code: 'BUD-04', nom: 'Honoraires et paie', priorite: 'À arbitrer' },
      { code: 'BUD-05', nom: 'Rapports financiers', priorite: 'Haute' },
    ],
  },
  {
    id: 'bibliotheque',
    nom: 'Bibliothèque et documentation',
    responsable: 'Responsable de la bibliothèque',
    modules: [
      { code: 'BIB-01', nom: 'Catalogue et exemplaires', priorite: 'Moyenne' },
      { code: 'BIB-02', nom: 'Prêts, abonnés et inventaire', priorite: 'Moyenne' },
    ],
  },
  {
    id: 'qualite',
    nom: 'Qualité institutionnelle',
    responsable: 'Cellule qualité',
    modules: [
      { code: 'QUA-01', nom: 'Évaluation des enseignements et des services', priorite: 'Moyenne' },
      { code: 'QUA-02', nom: "Indicateurs, plans d'amélioration et audits", priorite: 'Moyenne' },
    ],
  },
  {
    id: 'communication',
    nom: 'Communication',
    responsable: 'Cellule communication',
    modules: [{ code: 'COM-01', nom: 'Annonces, communiqués, notes et événements', priorite: 'Moyenne' }],
  },
  {
    id: 'documents',
    nom: 'Archives et documents',
    responsable: 'Secrétaire général administratif',
    modules: [
      { code: 'DOC-01', nom: 'Gestion électronique des documents', priorite: 'Haute' },
      { code: 'DOC-02', nom: 'Courrier entrant et sortant', priorite: 'Moyenne' },
      { code: 'DOC-03', nom: 'Archives et conservation', priorite: 'Haute' },
    ],
  },
  {
    id: 'rapports',
    nom: 'Rapports et statistiques',
    responsable: 'Chaque bureau (son périmètre)',
    modules: [{ code: 'RAP-01', nom: 'Rapports et statistiques', priorite: 'Haute' }],
  },
  {
    id: 'securite',
    nom: 'Utilisateurs et sécurité',
    responsable: 'Administrateur central',
    modules: [
      { code: 'SEC-01', nom: 'Comptes, rôles et délégations', priorite: 'Indispensable' },
      { code: 'SEC-02', nom: 'Authentification et sessions', priorite: 'Indispensable' },
      { code: 'SEC-03', nom: "Journal d'audit et centre de contrôle", priorite: 'Indispensable' },
      { code: 'SEC-04', nom: 'Sauvegardes et restauration', priorite: 'Indispensable' },
    ],
  },
  {
    id: 'parametres',
    nom: 'Paramètres institutionnels',
    responsable: 'Direction générale',
    modules: [
      { code: 'PAR-01', nom: 'Année académique et calendrier réglementaire', priorite: 'Indispensable' },
      { code: 'PAR-02', nom: 'Structure institutionnelle', priorite: 'Indispensable' },
      { code: 'PAR-03', nom: 'Règles et barèmes', priorite: 'Indispensable' },
    ],
  },
];

export const transversal: Module[] = [
  { code: 'TRV-01', nom: 'Calendrier institutionnel', priorite: 'Haute' },
  { code: 'TRV-02', nom: 'Notifications', priorite: 'Moyenne' },
  { code: 'TRV-03', nom: 'Tâches et suivi des actions', priorite: 'Haute' },
  { code: 'TRV-04', nom: 'Incidents et assistance', priorite: 'Moyenne' },
];

export const findEspace = (id: string | undefined) => espaces.find((e) => e.id === id);
       
