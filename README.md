# SMART-ISTM-T'PA

Système Moderne d'Administration et de Gestion Académique — ISTM-Tshikapa.
Conçu par **SCIENCE-PLUS — Académie de la connaissance** (gestion : M. Jacques BAKUETU · +243 973 213 157).

Référence fonctionnelle : *Cahier des charges général, version 1.2*.

## Ce que contient ce dépôt (phase 1 — socle et prototype)

- Application web **responsive** : ordinateur, tablette, téléphone Android.
- **Installable** comme application (PWA) depuis le navigateur, sans passer par le Play Store.
- **Navigation par espaces de travail** (13 espaces, configurés dans `src/config/espaces.ts`).
- **Socle Supabase** : rôles, profils, sections, attribution des rôles avec périmètre et durée, journal d'audit, règles RLS (`supabase/migrations/0001_socle.sql`).

Les écrans métier sont à réaliser par module. Ce dépôt ne contient **aucune donnée réelle**.

## Mise en route

Prérequis : Node.js 20 ou plus récent, un compte GitHub, un projet Supabase.

```bash
git clone https://github.com/<organisation>/smart-istm-t-pa.git
cd smart-istm-t-pa
npm install
cp .env.example .env        # puis renseigner les valeurs Supabase
npm run dev                 # application sur http://localhost:5173
```

### Configurer Supabase (une seule fois)

1. Créer un projet Supabase. **Choisir la région en accord avec la décision du comité sur l'hébergement des données (question 16).**
2. Dans **SQL Editor**, exécuter le fichier `supabase/migrations/0001_socle.sql`.
3. Dans **Authentication > Providers > Email**, **désactiver** « Allow new users to sign up ». Aucun compte ne doit être créé par le public (principe P5).
4. Créer le premier administrateur dans **Authentication > Users**, puis exécuter les deux instructions d'amorçage en bas du fichier SQL.
5. Dans **Project Settings > API**, copier l'URL et la clé « anon public » dans `.env`.

La clé `service_role` ne doit **jamais** être placée dans le code ni dans le dépôt.

### Publier l'application

```bash
npm run build               # produit le dossier dist/
```

Le dossier `dist/` peut être hébergé sur tout service de fichiers statiques (Netlify, Vercel, Cloudflare Pages, ou serveur de l'Institut). Les variables `VITE_*` doivent être définies au moment du build.

## Règles de développement

- Une branche par module (`feat/aca-03-charges`), revue avant fusion dans `main`.
- Aucune donnée réelle dans le code, les tests, les captures d'écran ou les démonstrations (principe P16).
- Toute règle de droit est contrôlée dans la base (RLS), jamais seulement dans l'interface.
- Toute évolution du cahier se reporte d'abord dans le cahier, puis dans `src/config/espaces.ts`.

## Feuille de route

Voir la section 29 du cahier des charges. Prochaines étapes : authentification et écran de connexion, gestion des comptes (SEC-01), structure (PAR-02), comptes enseignants (ACA-02).

## Application Android (Play Store), plus tard

Le même code pourra être encapsulé pour Android (par exemple avec Capacitor), puis publié sur le Play Store. Cela exige un compte développeur Google Play (frais unique) et une politique de confidentialité publique. Ce n'est pas nécessaire pour utiliser l'application dès maintenant : la version PWA fonctionne déjà sur Android.

## Licence et propriété

Le code est la propriété de l'ISTM-Tshikapa (principe P10). Le dépôt doit appartenir à un compte de l'Institut.
