import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [visible, setVisible] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const message = await signIn(email, motDePasse);
    if (message) {
      setErreur(message);
      setEnvoi(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <style>{`
        @keyframes apparition-logo {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes montee-texte {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tourbillon {
          0% { opacity: 0; transform: rotate(-720deg) scale(0.05); }
          65% { opacity: 1; transform: rotate(18deg) scale(1.15); }
          85% { transform: rotate(-6deg) scale(0.97); }
          100% { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        .anim-logo { animation: apparition-logo 0.9s ease-out both; }
        .anim-texte { animation: montee-texte 0.8s ease-out 0.5s both; }
        .anim-texte-2 { animation: montee-texte 0.8s ease-out 0.8s both; }
        .anim-tourbillon { animation: tourbillon 1.8s cubic-bezier(0.22, 0.8, 0.3, 1) 1.2s both; }
        @media (prefers-reduced-motion: reduce) {
          .anim-logo, .anim-texte, .anim-texte-2, .anim-tourbillon { animation: none; }
        }
      `}</style>

      <div className="bg-brand-gradient px-4 pb-20 pt-10 text-center safe-top">
        <img
          src={`${import.meta.env.BASE_URL}icon-512.png`}
          alt="Logo SMART-ISTM-T'PA"
          className="anim-logo mx-auto h-36 w-auto rounded-2xl bg-white p-2 shadow-card"
        />
        <h1 className="anim-texte mt-5 text-xl font-extrabold uppercase leading-tight tracking-wide text-white sm:text-2xl">
          Bienvenue sur SMART-ISTM-TSHIKAPA
        </h1>
        <p className="anim-texte-2 mt-2 text-sm text-navy-100 sm:text-base">
          Le logiciel qui garantit votre gestion numérique.
        </p>
        <p className="anim-tourbillon mx-auto mt-5 inline-block rounded-full bg-gold-400 px-5 py-2 text-sm font-bold uppercase tracking-wide text-navy-900 shadow-card">
          D.G PROF. BOSCO TSHITENGE
        </p>
      </div>

      <main className="-mt-10 flex-1 px-4 pb-8">
        <div className="card mx-auto w-full max-w-md p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-navy-800">Connexion</h2>
          <p className="mt-1 text-sm text-slate-600">
            Les comptes sont créés par l'administrateur de l'Institut.
          </p>

          {!isSupabaseConfigured && (
            <p className="mt-4 rounded-lg bg-gold-100 px-3 py-2 text-xs text-navy-900">
              La connexion à la base n'est pas configurée.
            </p>
          )}

          <form onSubmit={soumettre} className="mt-4 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-800">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="mdp" className="mb-1 block text-sm font-medium text-navy-800">
                Mot de passe
              </label>
              <div className="flex gap-2">
                <input
                  id="mdp"
                  type={visible ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={motDePasse}
                  onChange={(ev) => setMotDePasse(ev.target.value)}
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
            </div>

            {erreur && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {erreur}
              </p>
            )}

            <button type="submit" disabled={envoi || !isSupabaseConfigured} className="btn-primary w-full py-3">
              {envoi ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </main>

      <footer className="px-4 pb-4 text-center text-xs text-slate-500">
        Conçu par SCIENCE-PLUS — Académie de la connaissance
      </footer>
    </div>
  );
      }
