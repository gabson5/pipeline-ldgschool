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
├── workflows/
│   └── n8n/               # Exports des workflows n8n
├── messages/
│   ├── drh.md             # Templates messages DRH/RH
│   ├── dirigeants.md      # Templates messages Dirigeants PME
│   └── cip.md             # Templates messages CIP
├── supabase/
│   └── schema.sql         # Schéma de la base leads
└── docs/
    └── setup.md           # Guide d'installation et configuration
```

---

*Pipeline LDG-School — prospection B2B automatisée.*
