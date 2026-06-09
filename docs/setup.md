# Guide d'installation — Pipeline LDG-School

## Prérequis

- Node.js 18+
- Un projet Supabase actif
- Un compte Unipile avec accès API
- n8n (self-hosted ou cloud)

---

## 1. Cloner le repo

```bash
git clone https://github.com/gabson5/pipeline-ldgschool.git
cd pipeline-ldgschool
```

## 2. Installer les dépendances

```bash
npm install @supabase/supabase-js
```

## 3. Configurer les variables d'environnement

Copier le fichier d'exemple et renseigner les valeurs :

```bash
cp .env.example .env
```

Éditer `.env` :

```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Les clés Supabase sont disponibles dans **Project Settings → API** de ton projet.

## 4. Créer la table leads dans Supabase

La migration est déjà appliquée sur le projet. Si tu pars d'un nouveau projet Supabase, exécute le SQL suivant dans l'éditeur SQL de Supabase :

```sql
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom          TEXT,
  nom             TEXT,
  email           TEXT,
  poste           TEXT,
  entreprise      TEXT,
  statut          TEXT CHECK (statut IN ('froid', 'tiede', 'chaud')),
  cible           TEXT CHECK (cible IN ('DRH', 'Dirigeant', 'CIP')),
  source          TEXT CHECK (source IN ('linkedin', 'landing_page')),
  date_contact    DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 5. Utiliser les fonctions leads

```ts
import { insertLead, getLeads, updateLeadStatut } from './supabase/leads'

// Insérer un lead
await insertLead({
  prenom:       'Marie',
  nom:          'Dupont',
  email:        'marie@entreprise.fr',
  poste:        'DRH',
  entreprise:   'Acme SAS',
  cible:        'DRH',
  source:       'linkedin',
  statut:       'froid',
  date_contact: '2026-06-09',
})

// Récupérer tous les leads chauds
await getLeads({ statut: 'chaud' })

// Récupérer les DRH tièdes
await getLeads({ statut: 'tiede', cible: 'DRH' })

// Mettre à jour le statut d'un lead
await updateLeadStatut('uuid-du-lead', 'chaud')
```

## 6. Templates de messages LinkedIn

Les templates sont dans `messages/` :

| Fichier | Usage |
|---|---|
| `drh.md` | Prospection DRH/RH — dispositif POEI + référent IA |
| `dirigeants.md` | Prospection dirigeants PME — automatisation IA |
| `cip.md` | Prospection CIP — formation IA certifiante CPF |
| `reseau-proche.md` | Réactivation réseau proche |
| `reseau-croise.md` | Prise de contact réseau croisé |

Remplacer `[Prénom]` par la valeur dynamique dans n8n avant l'envoi via Unipile.

## 7. Connecter Unipile

1. Créer un compte sur [unipile.com](https://unipile.com) et connecter ton compte LinkedIn
2. Récupérer ta clé API dans **Settings → API Keys**
3. Dans n8n, utiliser le nœud HTTP Request avec l'API Unipile pour envoyer les messages

## 8. Configurer n8n

Importer les workflows depuis `workflows/n8n/` dans ton instance n8n.

Deux workflows à configurer :
- **Prospection active** : déclenchement manuel ou planifié → lecture Supabase → envoi message LinkedIn via Unipile
- **Lead entrant** : webhook landing page → insertion Supabase → notification

---

> Ne jamais commiter le fichier `.env`. Il est ignoré par `.gitignore`.
