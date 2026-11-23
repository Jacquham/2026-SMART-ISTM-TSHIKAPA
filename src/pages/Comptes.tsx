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
        <h1 className="text-lg font-semib
