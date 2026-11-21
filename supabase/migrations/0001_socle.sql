-- =============================================================================
-- SMART-ISTM-T'PA — Migration 0001 : socle commun (modules SEC-01 à SEC-03, PAR-02)
-- À exécuter dans Supabase > SQL Editor, ou via la CLI Supabase.
-- Principes : RLS activé sur toutes les tables ; droits contrôlés côté base ;
-- journal d'audit alimenté uniquement par déclencheur (non modifiable par les utilisateurs).
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Rôles (référentiel, aligné sur la section 5 du cahier)
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  code text primary key,
  libelle text not null,
  sensible boolean not null default false  -- authentification renforcée recommandée
);

insert into public.roles (code, libelle, sensible) values
  ('admin_central', 'Administrateur central', true),
  ('dg', 'Directeur général', true),
  ('sgac', 'Secrétaire général académique', true),
  ('sgr', 'Secrétaire général à la recherche', false),
  ('sgad', 'Secrétaire général administratif', false),
  ('ab', 'Administrateur du budget', true),
  ('chef_section', 'Chef de section ou de département', false),
  ('agent_scolarite', 'Agent de scolarité', true),
  ('membre_commission', 'Membre de commission d''inscription', true),
  ('president_jury', 'Président de jury', true),
  ('caissier', 'Caissier / agent de recette', true),
  ('enseignant', 'Enseignant', false),
  ('resp_stages', 'Responsable des stages', false),
  ('resp_biblio', 'Responsable de la bibliothèque', false),
  ('gest_rh', 'Gestionnaire des ressources humaines', true),
  ('cellule_qualite', 'Cellule qualité', false),
  ('cellule_comm', 'Cellule communication', false),
  ('auditeur', 'Auditeur', false)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Sections et départements (PAR-02 / ACA-04)
-- ---------------------------------------------------------------------------
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  intitule text not null,
  type text not null check (type in ('section', 'departement')),
  actif boolean not null default true,
  cree_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Profils : une ligne par compte, liée à l'utilisateur d'authentification
--    Les comptes sont créés par l'administrateur central uniquement (principe P5).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  prenom text not null,
  email text,
  statut text not null default 'actif' check (statut in ('actif', 'suspendu', 'revoque')),
  cree_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Attribution des rôles, avec périmètre (section) et durée (délégation)
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_code text not null references public.roles(code),
  section_id uuid references public.sections(id),  -- null = rôle institutionnel
  date_debut date not null default current_date,
  date_fin date,                                    -- null = sans échéance
  attribue_par uuid references public.profiles(id),
  cree_le timestamptz not null default now()
);

create unique index if not exists user_roles_unique
  on public.user_roles (user_id, role_code, coalesce(section_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- ---------------------------------------------------------------------------
-- 5. Journal d'audit (SEC-03) : rempli uniquement par déclencheur
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  utilisateur_id uuid,
  action text not null,
  table_name text not null,
  record_id text,
  details jsonb,
  cree_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. Fonction de contrôle des droits (utilisée par toutes les règles RLS)
-- ---------------------------------------------------------------------------
create or replace function public.has_role(p_role text, p_section uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = auth.uid()
      and ur.role_code = p_role
      and p.statut = 'actif'
      and (ur.date_fin is null or ur.date_fin >= current_date)
      and (p_section is null or ur.section_id is null or ur.section_id = p_section)
  );
$$;

-- ---------------------------------------------------------------------------
-- 7. Déclencheur d'audit
-- ---------------------------------------------------------------------------
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (utilisateur_id, action, table_name, record_id, details)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce(new.id, old.id)::text,
    case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles after insert or update or delete on public.profiles
  for each row execute function public.audit_trigger();

drop trigger if exists audit_user_roles on public.user_roles;
create trigger audit_user_roles after insert or update or delete on public.user_roles
  for each row execute function public.audit_trigger();

drop trigger if exists audit_sections on public.sections;
create trigger audit_sections after insert or update or delete on public.sections
  for each row execute function public.audit_trigger();

-- ---------------------------------------------------------------------------
-- 8. Règles d'accès (RLS)
-- ---------------------------------------------------------------------------
alter table public.roles enable row level security;
alter table public.sections enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_log enable row level security;

-- Référentiel des rôles : lisible par tout utilisateur connecté.
drop policy if exists roles_lecture on public.roles;
create policy roles_lecture on public.roles
  for select to authenticated using (true);

-- Sections : lisibles par tout utilisateur connecté ; modifiables par l'administrateur et la DG.
drop policy if exists sections_lecture on public.sections;
create policy sections_lecture on public.sections
  for select to authenticated using (true);

drop policy if exists sections_ecriture on public.sections;
create policy sections_ecriture on public.sections
  for all to authenticated
  using (public.has_role('admin_central') or public.has_role('dg'))
  with check (public.has_role('admin_central') or public.has_role('dg'));

-- Profils : chacun voit le sien ; l'administrateur, la DG et l'auditeur voient tous les profils.
drop policy if exists profils_lecture on public.profiles;
create policy profils_lecture on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.has_role('admin_central')
    or public.has_role('dg')
    or public.has_role('auditeur')
  );

drop policy if exists profils_ecriture_admin on public.profiles;
create policy profils_ecriture_admin on public.profiles
  for all to authenticated
  using (public.has_role('admin_central'))
  with check (public.has_role('admin_central'));

-- Rôles attribués : chacun voit les siens ; seul l'administrateur attribue.
drop policy if exists roles_attribues_lecture on public.user_roles;
create policy roles_attribues_lecture on public.user_roles
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_role('admin_central')
    or public.has_role('dg')
    or public.has_role('auditeur')
  );

drop policy if exists roles_attribues_ecriture on public.user_roles;
create policy roles_attribues_ecriture on public.user_roles
  for all to authenticated
  using (public.has_role('admin_central'))
  with check (public.has_role('admin_central'));

-- Journal d'audit : lecture seule pour l'administrateur et l'auditeur.
-- Aucune politique d'écriture : seul le déclencheur (security definer) écrit.
drop policy if exists audit_lecture on public.audit_log;
create policy audit_lecture on public.audit_log
  for select to authenticated
  using (public.has_role('admin_central') or public.has_role('auditeur'));

-- ---------------------------------------------------------------------------
-- 9. Amorçage (à faire UNE fois, après création du premier compte dans Authentication)
--    Remplacer l'identifiant par l'UUID réel du premier administrateur :
--
--    insert into public.profiles (id, nom, prenom, email)
--    values ('UUID-DU-PREMIER-ADMIN', 'Nom', 'Prénom', 'email@institut');
--    insert into public.user_roles (user_id, role_code)
--    values ('UUID-DU-PREMIER-ADMIN', 'admin_central');
-- ---------------------------------------------------------------------------
