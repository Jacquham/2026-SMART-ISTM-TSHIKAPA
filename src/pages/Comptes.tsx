import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type RoleRef = { code: string; libelle: string };
type SectionRef = { id: string; intitule: string };
type ProfilListe = { id: string; nom: string; prenom: string; email: string | null; statut: string };
type RoleAttribue = { user_id: string; role_code: string };

export default function Comptes() {
  const { aRole } = useAuth();
  const estAdmin = aRole('admin_central');

  const [roles, setRoles] = useState<RoleRef[]>([]);
  const [sections, setSections] = useState<SectionRef[]>([]);
  const [profils, setProfils] = useState<ProfilListe[]>([]);
  const [attributions, setAttributions] = useState<RoleAttribue[]>([]);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [sectionId, setSectionId] = useState('');

  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{ email: string; mdp: string } | null>(null);
  const [copie, setCopie] = useState(false);

  const charger = useCallback(async () => {
    const [r, s, p, a] = await Promise.all([
      supabase.from('roles').select('code, libelle').order('libelle'),
      supabase.from('sections').select('id, intitule').eq('actif', true).order('intitule'),
      supabase.from('profiles').select('id, nom, prenom, email, statut').order('nom'),
      supabase.from('user_roles').select('user_id, role_code'),
    ]);
    setRoles((r.data as RoleRef[]) ?? []);
    setSections((s.data as SectionRef[]) ?? []);
    setProfils((p.data as ProfilListe[]) ?? []);
    setAttributions((a.data as RoleAttribue[]) ?? []);
  }, []);

  useEffect(() => {
    if (estAdmin) void charger();
  }, [estAdmin, charger]);

  const libelleRole = (code: string) => roles.find((r) => r.code === code)?.libelle ?? code;

  const creer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setResultat(null);
    setCopie(false);
    setEnvoi(true);

    const { data, error } = await supabase.functions.invoke('creer-compte', {
      body: {
        nom,
        prenom,
        email,
        role_code: roleCode,
        section_id: sectionId || null,
      },
    });

    if (error) {
      let message = 'Création impossible pour le moment.';
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
      setEnvoi(false);
      return;
    }

    setResultat({ email: data.email, mdp: data.mot_de_passe_provisoire });
    setNom('');
    setPrenom('');
    setEmail('');
    setRoleCode('');
    setSectionId('');
    setEnvoi(false);
    void charger();
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

  const champ = 'w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-base text-slate-900';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Utilisateurs et sécurité</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Comptes</h1>
        <p className="mt-1 text-sm text-navy-100">Créer un compte, attribuer son rôle et lui remettre un accès provisoire.</p>
      </section>

      {resultat && (
        <section className="card border-l-4 border-l-gold-500 p-4">
          <h2 className="text-base font-semibold text-navy-800">Compte créé</h2>
          <p className="mt-1 text-sm text-slate-700">Adresse : {resultat.email}</p>
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
          <p className="mt-3 text-xs text-slate-600">
            Remettez-le en personne ou par un canal privé. La personne devra le remplacer dès sa première connexion.
          </p>
        </section>
      )}

      <section className="card p-4 sm:p-5">
        <h2 className="text-base font-semibold text-navy-800">Nouveau compte</h2>
        <form onSubmit={creer} className="mt-3 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nom" className="mb-1 block text-sm font-medium text-navy-800">
                Nom
              </label>
              <input id="nom" required value={nom} onChange={(ev) => setNom(ev.target.value)} className={champ} />
            </div>
            <div>
              <label htmlFor="prenom" className="mb-1 block text-sm font-medium text-navy-800">
                Prénom
              </label>
              <input id="prenom" required value={prenom} onChange={(ev) => setPrenom(ev.target.value)} className={champ} />
            </div>
          </div>

          <div>
            <label htmlFor="mail" className="mb-1 block text-sm font-medium text-navy-800">
              Adresse e-mail
            </label>
            <input
              id="mail"
              type="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className={champ}
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-navy-800">
              Rôle
            </label>
            <select id="role" required value={roleCode} onChange={(ev) => setRoleCode(ev.target.value)} className={champ}>
              <option value="">Choisir un rôle…</option>
              {roles.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.libelle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="section" className="mb-1 block text-sm font-medium text-navy-800">
              Section ou département (facultatif)
            </label>
            <select id="section" value={sectionId} onChange={(ev) => setSectionId(ev.target.value)} className={champ}>
              <option value="">Aucune (rôle pour toute l'institution)</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.intitule}
                </option>
              ))}
                          </select>
          </div>

          {erreur && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {erreur}
            </p>
          )}

          <button type="submit" disabled={envoi} className="btn-primary w-full py-3">
            {envoi ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-navy-800">Comptes existants ({profils.length})</h2>
        <ul className="space-y-2">
          {profils.map((p) => {
            const rolesDuCompte = attributions.filter((a) => a.user_id === p.id).map((a) => libelleRole(a.role_code));
            return (
              <li key={p.id} className="card p-3">
                <p className="font-semibold text-navy-800">
                  {p.prenom} {p.nom}
                </p>
                <p className="text-xs text-slate-500">{p.email}</p>
                <p className="mt-2 flex flex-wrap gap-1.5">
                  <span className={p.statut === 'actif' ? 'badge-ok' : 'badge-alerte'}>{p.statut}</span>
                  {rolesDuCompte.map((r) => (
                    <span key={r} className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700">
                      {r}
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
          }
