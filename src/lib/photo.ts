// Réduit une photo de téléphone (JPEG, 600 px au maximum) avant l'envoi.
export async function reduirePhoto(fichier: File): Promise<Blob> {
  const url = URL.createObjectURL(fichier);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Image illisible.'));
      i.src = url;
    });
    const max = 600;
    const echelle = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * echelle);
    canvas.height = Math.round(img.height * echelle);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Traitement impossible.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) throw new Error('Traitement impossible.');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
      }
