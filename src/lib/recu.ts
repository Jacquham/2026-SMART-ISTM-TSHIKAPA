import {
  formatMontant,
  LIBELLE_MODE,
  LIBELLE_PAIEMENT,
  type FraisLigne,
  type Paiement,
} from '../components/finances/types';

const echapper = (texte: string): string =>
  texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function imprimerRecu(paiement: Paiement, frais: FraisLigne, etudiant: string): void {
  const fenetre = window.open('', '_blank');
  if (!fenetre) return;
  const ligne = (titre: string, valeur: string) =>
    `<tr><td style="color:#555;padding:6px 12px 6px 0">${echapper(titre)}</td>` +
    `<td style="font-weight:bold">${echapper(valeur)}</td></tr>`;
  const annule =
    paiement.statut === 'annule' ? '<p style="color:#b00020;font-weight:bold">PAIEMENT ANNULÉ</p>' : '';
  fenetre.document.write(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8">` +
      `<title>Reçu ${echapper(paiement.reference_recu)}</title></head>` +
      `<body style="font-family:Arial,sans-serif;max-width:520px;margin:24px auto;padding:0 16px">` +
      `<h2 style="margin:0;color:#1F3A6E">Institut Supérieur des Techniques Médicales de Tshikapa</h2>` +
      `<h3 style="margin:4px 0 16px">REÇU DE PAIEMENT</h3>${annule}` +
      `<table>` +
      ligne('Numéro de reçu', paiement.reference_recu) +
      ligne('Date', new Date(paiement.date_paiement).toLocaleDateString('fr-FR')) +
      ligne('Étudiant', etudiant) +
      ligne('Désignation', frais.designation) +
      ligne('Motif', frais.motif) +
      ligne('Année académique', frais.annee_academique) +
      ligne('Montant versé', formatMontant(paiement.montant, frais.devise)) +
      ligne('Mode de paiement', LIBELLE_MODE[paiement.mode_paiement] ?? paiement.mode_paiement) +
      ligne('Statut', LIBELLE_PAIEMENT[paiement.statut]) +
      `</table>` +
      `<p style="margin-top:32px;font-size:12px;color:#555">` +
      `À signer et à cacheter selon la procédure de l'institution.</p>` +
      `</body></html>`,
  );
  fenetre.document.close();
  fenetre.focus();
  fenetre.print();
}
