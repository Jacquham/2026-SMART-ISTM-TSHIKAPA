import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';

export default function ChangerMotDePasse() {
  const { profil, changerMotDePasse, signOut } = useAuth();
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);

    if (nouveau.length < 10) {
      setErreur('Le mot de passe doit contenir au moins 10 caractères.');
      return;
    }
    if (!/[A-Za-z]/.test(nouveau) || !/[0-9]/.test(nouveau)) {
      setErreur('Le mot de passe doit contenir au moins une lettre et un chiffre.');
      return;
    }
    if (nouveau !== confirmation) {
      setErreur('Les deux mots de passe ne sont pas identiques.');
      return;
    }

    setEnvoi(true);
    const message = await changerMotDePasse(nouveau);
    if (message) {
      setErreur(message);
      setEnvoi(false);
    }
    // En cas de succès, le profil est mis à jour et l'application s'ouvre automatiquement.
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="bg-brand-gradient px-4 pb-16 pt-8 text-center safe-top">
        <img
          src={`${import.meta.env.BASE_URL}icon-512.png`}
          alt="Logo SMART-ISTM-T'PA"
          className="mx-auto h-20 w-auto rounded-xl bg-white p-1.5 shadow-card"
        />
        <h1 className="mt-3 text-lg font-bold text-white">Sécurisez votre compte</h1>
        <p className="mt-1 text-sm text-navy-100">
          {profil?.prenom ? `Bonjour ${profil.prenom}. ` : ''}Choisissez votre mot de passe personnel.
        </p>
      </div>

      <main className="-mt-8 flex-1 px-4 pb-8">
        <div className="card mx-auto w-full max-w-md p-5 sm:p-6">
          <p className="rounded-lg bg-gold-100 px-3 py-2 text-sm text-navy-900">
            C'est votre première connexion : vous devez remplacer le mot de passe provisoire avant de continuer.
          </p>

          <form onSubmit={soumettre} className="mt-4 space-y-4">
            <div>
              <label htmlFor="nouveau" className="mb-1 block text-sm font-medium text-navy-800">
                Nouveau mot de passe
              </label>
              <div className="flex gap-2">
                <input
                  id="nouveau"
                  type={visible ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={nouveau}
                  onChange={(ev) => setNouveau(ev.target.value)}
                  className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="btn-secondary shrink-0"
                  aria-pressed={visible}
                >
                  {visible ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Au moins 10 caractères, avec une lettre et un chiffre.</p>
            </div>

            <div>
              <label htmlFor="confirmation" className="mb-1 block text-sm font-medium text-navy-800">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmation"
                type={visible ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmation}
                onChange={(ev) => setConfirmation(ev.target.value)}
                className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900"
              />
            </div>

            {erreur && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {erreur}
              </p>
            )}

            <button type="submit" disabled={envoi} className="btn-primary w-full py-3">
              {envoi ? 'Enregistrement…' : 'Enregistrer mon mot de passe'}
            </button>
          </form>

          <button type="button" onClick={signOut} className="mt-4 w-full text-center text-sm text-navy-700 underline">
            Se déconnecter
          </button>
        </div>
      </main>
    </div>
  );
                  }
