// Export Excel : fichier CSV (séparateur point-virgule, accents conservés, décimales avec virgule).
export function telechargerCsv(nomFichier: string, entetes: string[], lignes: (string | number)[][]): void {
  const proteger = (valeur: string | number): string => {
    let texte = typeof valeur === 'number' ? valeur.toFixed(2).replace('.', ',') : String(valeur);
    // Empêche l'interprétation d'un texte comme une formule dans Excel.
    if (typeof valeur === 'string' && /^[=+\-@]/.test(texte)) texte = `'${texte}`;
    return `"${texte.replace(/"/g, '""')}"`;
  };
  const contenu = [entetes, ...lignes].map((ligne) => ligne.map(proteger).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF' + contenu], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}
