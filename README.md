# Pipeline Prospection LDG-School

Pipeline de prospection commerciale pour **LDG-School**.

---

## Objectif

Automatiser et structurer la prospection commerciale de LDG-School, depuis la génération de leads jusqu'à la prise de contact, en ciblant les bons interlocuteurs au sein des entreprises.

---

## Cibles

| Profil | Description |
|---|---|
| **DRH / RH** | Responsables ressources humaines en charge de la formation et du développement des collaborateurs |
| **Dirigeants PME** | Dirigeants et fondateurs de PME sensibles aux enjeux de formation et de montée en compétences |
| **CIP** | Conseillers en Insertion Professionnelle accompagnant des publics en reconversion ou en recherche d'emploi |

---

## Entrées du Pipeline

### 1. Prospection active — LinkedIn via Unipile

- Recherche et identification de profils LinkedIn correspondant aux 3 cibles
- Envoi de messages de prospection personnalisés via l'API Unipile
- Suivi des réponses et relances automatisées via n8n

### 2. Leads entrants — Landing page

- Formulaire de contact ou d'inscription sur la landing page LDG-School
- Capture automatique du lead dans Supabase
- Déclenchement d'un workflow n8n à la réception du lead

---

## Architecture technique

```
LinkedIn (Unipile)          Landing page
       │                         │
       ▼                         ▼
   Unipile API              Formulaire web
       │                         │
       └──────────┬──────────────┘
                  ▼
                 n8n
          (orchestration)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
    Supabase            Claude Code
  (stockage leads)    (personnalisation
                       des messages)
```

---

## Stack

| Outil | Rôle |
|---|---|
| **Unipile** | Connexion LinkedIn, envoi et réception de messages |
| **n8n** | Orchestration des workflows et automatisations |
| **Supabase** | Base de données des leads, suivi des statuts |
| **Claude Code** | Personnalisation des messages de prospection |

---

## Structure du repo

```
pipeline-ldgschool/
├── README.md
├── .env.example                  # Variables d'environnement à configurer
├── supabase/
│   ├── client.ts                 # Client Supabase typé
│   ├── leads.ts                  # insertLead / getLeads / updateLeadStatut
│   └── types.ts                  # Types TypeScript générés depuis le schéma
├── messages/
│   ├── drh.md                    # Template LinkedIn → DRH/RH
│   ├── dirigeants.md             # Template LinkedIn → Dirigeants PME
│   ├── cip.md                    # Template LinkedIn → CIP
│   ├── reseau-proche.md          # Réactivation réseau proche
│   └── reseau-croise.md          # Prise de contact réseau croisé
├── workflows/
│   └── n8n/                      # Exports des workflows n8n
└── docs/
    └── setup.md                  # Guide d'installation complet
```

---

## Schéma Supabase — table `leads`

| Colonne | Type | Valeurs possibles |
|---|---|---|
| `id` | UUID | auto-généré |
| `prenom` | TEXT | — |
| `nom` | TEXT | — |
| `email` | TEXT | — |
| `poste` | TEXT | — |
| `entreprise` | TEXT | — |
| `statut` | TEXT | `froid`, `tiede`, `chaud` |
| `cible` | TEXT | `DRH`, `Dirigeant`, `CIP` |
| `source` | TEXT | `linkedin`, `landing_page` |
| `date_contact` | DATE | — |
| `notes` | TEXT | — |
| `created_at` | TIMESTAMPTZ | auto |

---

## Fonctions TypeScript disponibles

```ts
// Insérer un lead
insertLead(lead: LeadInsert): Promise<Lead>

// Récupérer les leads avec filtres optionnels
getLeads(filters?: { statut?: LeadStatut, cible?: LeadCible }): Promise<Lead[]>

// Mettre à jour le statut d'un lead
updateLeadStatut(id: string, statut: LeadStatut): Promise<Lead>
```

---

## Installation

Voir [docs/setup.md](docs/setup.md).

---

*Pipeline LDG-School — prospection B2B automatisée.*
