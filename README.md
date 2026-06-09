# Pipeline Prospection LDG-SCHOOL

Système de pipeline de prospection commerciale pour **LDG-SCHOOL** — plateforme de formation et d'accompagnement scolaire.

---

## Vue d'ensemble

Ce pipeline structure l'ensemble du processus de prospection, depuis l'identification des leads jusqu'à la conversion en clients, en passant par la qualification, la prise de contact et le suivi.

```
Identification → Qualification → Contact → Présentation → Suivi → Conversion
```

---

## Étapes du Pipeline

### 1. Identification des Leads
- **Sources** : réseaux sociaux, recommandations, événements scolaires, partenariats
- **Critères** : familles avec enfants scolarisés (collège / lycée), établissements privés, CPE
- **Outils** : scraping LinkedIn, Google Maps, annuaires scolaires

### 2. Qualification
- Vérification des besoins (soutien scolaire, orientation, prépa examens)
- Scoring du lead (chaud / tiède / froid)
- Segmentation par profil : **parent**, **établissement**, **entreprise partenaire**

### 3. Prise de Contact
- Email personnalisé (séquence automatisée)
- Appel téléphonique de découverte (script dédié)
- Message LinkedIn / Instagram
- Délai de relance : J+3, J+7, J+14

### 4. Présentation de l'Offre
- Envoi du pitch deck LDG-SCHOOL
- Démonstration de la plateforme (démo live ou vidéo)
- Envoi de la proposition commerciale adaptée

### 5. Suivi & Négociation
- Réponse aux objections (grille objections/réponses)
- Ajustement de l'offre si nécessaire
- Relance automatique après silence

### 6. Conversion & Onboarding
- Signature du contrat / bon de commande
- Accueil et onboarding de l'élève / de l'établissement
- Suivi satisfaction J+30

---

## Structure du Repo

```
pipeline-ldgschool/
├── README.md
├── leads/
│   ├── sources.md           # Liste des sources de leads
│   └── scoring.md           # Grille de scoring
├── scripts/
│   ├── email_sequences/     # Templates emails de prospection
│   ├── call_scripts/        # Scripts d'appel téléphonique
│   └── linkedin_messages/   # Messages LinkedIn/DM
├── offres/
│   ├── pitch_deck.pdf       # Présentation commerciale
│   └── tarifs.md            # Grille tarifaire
├── suivi/
│   ├── crm_template.csv     # Template suivi CRM
│   └── kpis.md              # Indicateurs de performance
└── docs/
    └── onboarding.md        # Guide d'onboarding client
```

---

## KPIs du Pipeline

| Indicateur | Objectif |
|---|---|
| Leads identifiés / mois | 200+ |
| Taux de qualification | > 40% |
| Taux de prise de contact | > 60% |
| Taux de démo réalisée | > 25% |
| Taux de conversion final | > 10% |
| Délai moyen de conversion | < 21 jours |

---

## Stack & Outils

- **CRM** : Notion / HubSpot / Airtable
- **Emailing** : Lemlist / Brevo
- **Automatisation** : Make (Integromat) / Zapier
- **Tracking** : Google Analytics, UTM tags
- **Communication** : Slack (équipe), WhatsApp Business (prospects)

---

## Contribuer

1. Fork le repo
2. Crée une branche (`feature/ma-contribution`)
3. Commit tes modifications
4. Ouvre une Pull Request

---

## Contact

**LDG-SCHOOL** — *Élever chaque élève à son plein potentiel*  
📧 contact@ldg-school.fr  
🌐 [ldg-school.fr](https://ldg-school.fr)

---

*Pipeline maintenu par l'équipe commerciale LDG-SCHOOL.*
