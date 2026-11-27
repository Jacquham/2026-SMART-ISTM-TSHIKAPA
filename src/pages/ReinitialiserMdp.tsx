import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type Profil = { id: string; nom: string; prenom: string; email: string | null; statut: string };

export default function ReinitialiserMdp() {
  const { aRole, session } = useAuth();
  const estAdmin = aRole('admin_central');
  const moi = session?.user.id;
  const [profils, setProfils] = useState<Profil[]>([]);
  const [recherche, setRecherche] = useState('');
  const [enCours, setEnCours] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{ email: string; mdp: string } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const charger = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('id, nom, prenom, email, statut').order('nom');
    setProfils((data as Profil[] | null) ?? []);
  }, []);

  useEffect(() => {
    if (estAdmin) void charger();
  }, [estAdmin, charger]);

  const reinitialiser = async (p: Profil) => {
    if (!window.confirm(`Réinitialiser le mot de passe de ${p.prenom} ${p.nom} ?`)) return;
    setErreur(null);
    setResultat(null);
    setCopie(false);
    setEnCours(p.id);
    const { data, error } = await supabase.functions.invoke('reinitialiser-mdp', { body: { user_id: p.id } });
    setEnCours(null);
    if (error) {
      let message = 'Réinitialisation impossible pour le moment.';
      try {
        const contexte = (error as { context?: Response }).context;
        if (contexte && typeof contexte.json === 'function') {
          const corps = await contexte.json();
          if (corps?.erreur) message = String(corps.erreur);
        }
      } catch {
        // message par défaut
      }
      setErreur(message);
      return;
    }
    setResultat({ email: p.email ?? `${p.prenom} ${p.nom}`, mdp: data.mot_de_passe_provisoire });
  };

  const copier = async () => {
    if (!resultat) return;
    try {
      await navigator.clipboard.writeText(resultat.mdp);
      setCopie(true);
    } catch {
      setCopie(false);
    }
  };

  if (!estAdmin) {
    return (
      <div className="card p-5">
        <h1 className="text-lg font-semibold text-navy-800">Accès réservé</h1>
        <p className="mt-1 text-sm text-slate-600">Cette page est réservée à l'administrateur central.</p>
      </div>
    );
  }

  const q = recherche.trim().toLowerCase();
  const filtres = profils.filter((p) => !q || `${p.prenom} ${p.nom} ${p.email ?? ''}`.toLowerCase().includes(q));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Utilisateurs et sécurité</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Réinitialiser un mot de passe</h1>
        <p className="mt-1 text-sm text-navy-100">
          Un mot de passe provisoire est généré. La personne devra le remplacer dès sa prochaine connexion.
        </p>
      </section>

      {resultat && (
        <section className="card border-l-4 border-l-gold-500 p-4">
          <h2 className="text-base font-semibold text-navy-800">Mot de passe réinitialisé</h2>
          <p className="mt-1 text-sm text-slate-700">Compte : {resultat.email}</p>
          <p className="mt-3 text-xs font-medium text-slate-500">Mot de passe provisoire (affiché une seule fois) :</p>
          <p className="mt-1 break-all rounded-lg bg-gold-100 px-3 py-2 font-mono text-lg font-bold text-navy-900">
            {resultat.mdp}
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={copier} className="btn-secondary">
              {copie ? 'Copié' : 'Copier'}
            </button>
            <button type="button" onClick={() => setResultat(null)} className="btn-primary">
              J'ai noté, fermer
            </button>
          </div>
        </section>
      )}

      {erreur && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erreur}
        </p>
      )}

      <section>
        <input
          type="search"
          aria-label="Rechercher un compte"
          placeholder="Rechercher par nom ou adresse e-mail…"
          value={recherche}
          onChange={(ev) => setRecherche(ev.target.value)}
          className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900"
        />
        <ul className="mt-3 space-y-2">
          {filtres.length === 0 && <li className="text-sm text-slate-500">Aucun compte trouvé.</li>}
          {filtres.map((p) => (
            <li key={p.id} className="card flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy-800">
                  {p.prenom} {p.nom}
                </p>
                <p className="truncate text-xs text-slate-500">{p.email}</p>
              </div>
              {p.id === moi ? (
                <span className="text-xs text-slate-500">Votre compte</span>
              ) : (
                <button type="button" disabled={enCours === p.id} onClick={() => reinitialiser(p)} className="btn-secondary shrink-0">
                  {enCours === p.id ? 'En cours…' : 'Réinitialiser'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
    }
