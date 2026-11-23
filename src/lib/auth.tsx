import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export type Profil = {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  statut: string | null;
  doit_changer_mdp: boolean;
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  profil: Profil | null;
  signIn: (email: string, motDePasse: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  changerMotDePasse: (nouveau: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  // Suivi de la session (connexion, déconnexion, renouvellement du jeton).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: abonnement } = supabase.auth.onAuthStateChange((_evenement, nouvelle) => {
      setSession(nouvelle);
      if (!nouvelle) {
        setProfil(null);
        setLoading(false);
      }
    });
    return () => abonnement.subscription.unsubscribe();
  }, []);

  // Chargement du profil de la personne connectée.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) return;
    let actif = true;
    setLoading(true);
    supabase
      .from('profiles')
      .select('id, nom, prenom, email, statut, doit_changer_mdp')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!actif) return;
        setProfil(error ? null : ((data as Profil | null) ?? null));
        setLoading(false);
      });
    return () => {
      actif = false;
    };
  }, [userId]);

  const signIn = async (email: string, motDePasse: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: motDePasse });
    if (!error) return null;
    return error.message.toLowerCase().includes('invalid')
      ? 'Adresse e-mail ou mot de passe incorrect.'
      : 'Connexion impossible pour le moment. Réessayez dans un instant.';
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const changerMotDePasse = async (nouveau: string): Promise<string | null> => {
    const { error } = await supabase.auth.updateUser({ password: nouveau });
    if (error) {
      return error.message.toLowerCase().includes('different')
        ? 'Le nouveau mot de passe doit être différent de l’ancien.'
        : 'Mot de passe refusé. Choisissez-en un plus long et plus complexe.';
    }
    const { error: erreurStatut } = await supabase.rpc('marquer_mdp_change');
    if (erreurStatut) {
      return 'Mot de passe changé, mais son statut n’a pas pu être mis à jour. Contactez l’administrateur.';
    }
    setProfil((p) => (p ? { ...p, doit_changer_mdp: false } : p));
    return null;
  };

  return (
    <AuthContext.Provider value={{ loading, session, profil, signIn, signOut, changerMotDePasse }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de AuthProvider');
  return ctx;
      }
