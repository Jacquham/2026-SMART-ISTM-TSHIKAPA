import { useEffect, useState, type ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { reduirePhoto } from '../../lib/photo';

type Props = {
  etudiantId: string;
  photoPath: string | null;
  peutModifier: boolean;
  onChange: () => void;
};

export default function PhotoEtudiant({ etudiantId, photoPath, peutModifier, onChange }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let actif = true;
    if (photoPath) {
      supabase.storage
        .from('photos-etudiants')
        .createSignedUrl(photoPath, 3600)
        .then(({ data }) => {
          if (actif) setUrl(data?.signedUrl ?? null);
        });
    } else {
      setUrl(null);
    }
    return () => {
      actif = false;
    };
  }, [photoPath]);

  const choisir = async (ev: ChangeEvent<HTMLInputElement>) => {
    const fichier = ev.target.files?.[0];
    ev.target.value = '';
    if (!fichier) return;
    setErreur(null);
    setEnvoi(true);
    try {
      const image = await reduirePhoto(fichier);
      const chemin = `${etudiantId}-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('photos-etudiants')
        .upload(chemin, image, { contentType: 'image/jpeg' });
      if (error) throw error;
      const { error: erreurMaj } = await supabase.from('etudiants').update({ photo_path: chemin }).eq('id', etudiantId);
      if (erreurMaj) throw erreurMaj;
      onChange();
    } catch {
      setErreur('Envoi de la photo impossible. Vérifiez vos droits et la photo.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-navy-200 bg-navy-50">
        {url ? (
          <img
