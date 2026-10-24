# ApplyFlow

**Application web de suivi des candidatures — React, Node.js, Express et architecture microservices.**

ApplyFlow est une application full-stack permettant de centraliser ses candidatures, suivre leur progression, consulter des statistiques et recevoir des notifications internes lorsqu'une candidature doit être relancée.

Ce projet personnel a été développé pour approfondir le développement JavaScript, la conception d'API REST, l'authentification, les bases de données, le cache applicatif, la communication asynchrone et Docker.

## Fonctionnalités

- Inscription et connexion avec authentification JWT.
- Hashage des mots de passe avec bcrypt.
- Création, consultation, modification et suppression de candidatures.
- Gestion des statuts de candidature.
- Accès aux candidatures limité à leur propriétaire.
- Tableau de bord avec statistiques personnelles.
- Cache Redis avec expiration de 60 secondes.
- Invalidation du cache après les opérations CRUD.
- Détection automatique des candidatures à relancer.
- Communication asynchrone via RabbitMQ.
- Création et consultation de notifications internes.
- Marquage des notifications comme lues.
- Interface React responsive avec thème sombre.
- Conteneurisation des services backend avec Docker Compose.
- Tests d'intégration automatisés.

### Statuts des candidatures

| Statut | Description |
|---|---|
| `TO_APPLY` | À envoyer |
| `APPLIED` | Envoyée |
| `HR_INTERVIEW` | Entretien RH |
| `TECH_INTERVIEW` | Entretien technique |
| `REJECTED` | Refusée |
| `OFFER` | Offre reçue |

## Stack technique

| Composant | Technologies |
|---|---|
| Frontend | React 19, JavaScript, Vite, React Router, CSS |
| Backend | Node.js 24, Express 5 |
| Authentification | JWT, bcrypt |
| Base de données | PostgreSQL 17 |
| Cache | Redis 7 |
| Messagerie | RabbitMQ 3 |
| Conteneurisation | Docker, Docker Compose |
| Tests | Node.js Test Runner, assertions natives |
| Qualité frontend | ESLint, Vite |

Le projet utilise volontairement une architecture relativement simple pour comprendre le fonctionnement de chaque composant sans introduire d'abstractions inutiles.

## Architecture

```text
                              React / Vite
                             localhost:5173
                                   |
                              REST API + JWT
                                   |
                  +----------------+------------------+
                  |                |                  |
                  v                v                  v
             Auth Service   Application Service   Notification Service
                :3001             :3000                :3002
                  |                |                    |
                  v                v                    |
             PostgreSQL       PostgreSQL <--------------+
             applyflow_auth   applyflow_applications
                                   |
                                   +----------> Redis
                                   |           Dashboard cache
                                   |
                                   v
                            Follow-up Scheduler
                                   |
                                   v
                                RabbitMQ
                                   |
                                   v
                           Notification Consumer
                                   |
                                   v
                               PostgreSQL
                              notifications
```

### Description des services

**Auth Service**

Responsable de l'inscription, de la connexion, du hashage des mots de passe avec bcrypt et de la génération des JWT.

**Application Service**

Gère les candidatures, vérifie les droits d'accès des utilisateurs et fournit les statistiques du dashboard. Utilise PostgreSQL pour les données et Redis pour le cache.

**Notification Service**

Expose une API REST permettant de consulter ses notifications et de les marquer comme lues.

**Follow-up Scheduler**

Recherche périodiquement les candidatures nécessitant une relance et publie des événements dans RabbitMQ.

**Notification Consumer**

Consomme les messages RabbitMQ et enregistre les notifications correspondantes dans PostgreSQL.

Les trois services API sont séparés. Le Scheduler et le Consumer sont exécutés dans des conteneurs dédiés.

## Structure du projet

```text
applyflow/
├── docker-compose.yml
├── .env.docker.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
│
├── tests/
│   └── api.test.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
└── services/
    ├── auth-service/
    │   ├── src/
    │   ├── sql/
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── application-service/
    │   ├── src/
    │   │   ├── config/
    │   │   ├── controllers/
    │   │   ├── jobs/
    │   │   ├── middlewares/
    │   │   ├── routes/
    │   │   └── services/
    │   ├── sql/
    │   ├── Dockerfile
    │   └── package.json
    │
    └── notification-service/
        ├── src/
        │   ├── config/
        │   ├── controllers/
        │   ├── middlewares/
        │   ├── routes/
        │   ├── services/
        │   └── consumer.js
        ├── Dockerfile
        └── package.json
```

## Installation et démarrage

L'application peut être exécutée sous **Windows avec PowerShell** ou sous **Linux avec Bash**.

### Prérequis

- Git
- Docker Desktop (Windows) ou Docker Engine (Linux)
- Docker Compose
- Node.js 24 et npm

PostgreSQL, Redis et RabbitMQ fonctionnent dans Docker. Il n'est pas nécessaire de les installer directement sur l'ordinateur.

### 1. Cloner le dépôt

**Windows PowerShell et Linux Bash :**

```bash
git clone https://github.com/abadaoui77/applyflow.git
cd applyflow
```

### 2. Configurer Docker

Créer `.env.docker` à partir du fichier d'exemple.

**Windows — PowerShell :**

```powershell
Copy-Item .env.docker.example .env.docker
```

**Linux — Bash :**

```bash
cp .env.docker.example .env.docker
```

Modifier ensuite `.env.docker` :

```dotenv
POSTGRES_PASSWORD=REPLACE_WITH_A_STRONG_PASSWORD
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

Pour générer une valeur aléatoire avec Node.js :

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Générer deux valeurs différentes pour PostgreSQL et JWT.

**Sécurité :** `.env.docker` contient des informations sensibles. Ce fichier est ignoré par Git et ne doit jamais être commité.

### 3. Installer les dépendances frontend

**Windows et Linux :**

```bash
npm --prefix frontend ci
```

### 4. Configurer les variables du frontend

Copier le fichier d'exemple.

**Windows — PowerShell :**

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

**Linux — Bash :**

```bash
cp frontend/.env.example frontend/.env.local
```

Configuration attendue :

```dotenv
VITE_AUTH_API_URL=http://localhost:3001
VITE_APPLICATION_API_URL=http://localhost:3000
```

Le frontend utilise également `http://localhost:3002` pour communiquer avec le Notification Service.

Les variables `VITE_*` sont exposées dans le frontend compilé : elles ne doivent contenir aucun secret.

### 5. Construire et démarrer Docker

**Windows et Linux :**

```bash
npm run docker:build
```

Cette commande construit les images nécessaires puis démarre les neuf conteneurs Docker :

| Service Docker | Rôle |
|---|---|
| `postgres-auth` | Base de données des utilisateurs |
| `postgres-app` | Base de données des candidatures et notifications |
| `redis` | Cache des statistiques |
| `rabbitmq` | Communication asynchrone |
| `auth-service` | API d'authentification |
| `application-service` | API de gestion des candidatures |
| `notification-service` | API de notifications |
| `notification-consumer` | Consommation des événements RabbitMQ |
| `follow-up-scheduler` | Vérification automatique des relances |

Vérifier l'état des conteneurs :

```bash
npm run docker:ps
```

Lors du premier démarrage avec de nouveaux volumes PostgreSQL, les tables sont créées à partir des scripts SQL d'initialisation.

### 6. Démarrer le frontend

**Windows et Linux :**

```bash
npm run dev:frontend
```

Ouvrir dans un navigateur :

**http://localhost:5173**

Pour les démarrages suivants, une seule commande permet de démarrer les services Docker existants et React :

```bash
npm run dev
```

### Arrêter l'application

Arrêter Vite avec `Ctrl+C`, puis exécuter :

```bash
npm run docker:down
```

Cette commande arrête les conteneurs sans supprimer les volumes PostgreSQL.

## Services et ports

| Service | Adresse |
|---|---|
| Frontend React | http://localhost:5173 |
| Application Service | http://localhost:3000 |
| Auth Service | http://localhost:3001 |
| Notification Service | http://localhost:3002 |
| RabbitMQ Management | http://localhost:15672 |
| Redis | localhost:6379 |

Les deux bases PostgreSQL sont accessibles par le réseau interne Docker et ne sont pas exposées sur un port local.

## API REST

### Auth Service — Port 3001

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/health` | Vérification de disponibilité |
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion et génération JWT |

Les mots de passe sont hashés avec bcrypt avant leur stockage. Les JWT possèdent une durée d'expiration.

### Application Service — Port 3000

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/applications` | Lister ses candidatures |
| GET | `/applications/:id` | Consulter une candidature |
| POST | `/applications` | Créer une candidature |
| PUT | `/applications/:id` | Modifier une candidature |
| DELETE | `/applications/:id` | Supprimer une candidature |
| GET | `/dashboard` | Récupérer les statistiques |

### Notification Service — Port 3002

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/notifications` | Consulter ses notifications |
| PATCH | `/notifications/:id/read` | Marquer une notification comme lue |

Les routes privées utilisent un JWT dans l'en-tête HTTP :

```http
Authorization: Bearer <token>
```

Les identifiants utilisateur sont extraits du JWT vérifié. Les opérations SQL sont paramétrées et filtrées pour limiter l'accès aux données de leur propriétaire.

## Cache Redis

Les statistiques du dashboard sont calculées à partir des candidatures de chaque utilisateur.

Le dashboard affiche :

- Le nombre total de candidatures.
- Les candidatures à envoyer.
- Les candidatures envoyées.
- Les candidatures en entretien.
- Les candidatures refusées.
- Les offres reçues.

Pour éviter de répéter inutilement les requêtes SQL, les résultats sont mis en cache dans Redis.

**Exemple de clé :**

```text
dashboard:{userId}
```

**TTL : 60 secondes.**

Lorsqu'une candidature est créée, modifiée ou supprimée, l'Application Service invalide la clé Redis associée à l'utilisateur.

À la prochaine consultation, les statistiques sont recalculées depuis PostgreSQL lorsque le cache est absent.

## RabbitMQ et notifications automatiques

ApplyFlow dispose d'un système simple de relance des candidatures.

### Détection des candidatures à relancer

Le Follow-up Scheduler recherche les candidatures :

- ayant le statut `APPLIED` ;
- dont la date de candidature remonte à au moins neuf jours.

Le Scheduler effectue une vérification au démarrage, puis toutes les heures.

### Publication d'un événement

Lorsqu'une candidature remplit les conditions, un événement est publié dans RabbitMQ.

**Exemple :**

```json
{
  "type": "APPLICATION_FOLLOWUP_DUE",
  "userId": 1,
  "applicationId": 12,
  "company": "Airbus"
}
```

**File RabbitMQ :**

```text
applyflow_reminder
```

### Consommation et enregistrement

Le Notification Consumer lit les messages RabbitMQ et crée une notification dans PostgreSQL.

Exemple :

```text
Pense à relancer Airbus
```

L'utilisateur peut ensuite consulter ses notifications depuis l'interface React et les marquer comme lues.

### Protection contre les doublons

La table `notifications` possède une contrainte d'unicité :

```sql
UNIQUE (application_id, type)
```

L'insertion utilise :

```sql
ON CONFLICT (application_id, type) DO NOTHING
```

Cela empêche l'enregistrement de plusieurs notifications identiques pour une même candidature et un même type d'événement.

Le système utilise une file durable, des messages persistants et un ACK après le traitement en base.

Il s'agit d'une implémentation volontairement simple, adaptée au périmètre du projet.

## Tests automatisés

Le projet possède une suite de tests d'intégration dans :

```text
tests/api.test.js
```

Elle utilise les outils natifs de Node.js 24 :

- `node:test`
- `node:assert/strict`
- `fetch`

### Scénarios testés

- Accès refusé sans JWT.
- Inscription de deux utilisateurs.
- Connexion et récupération des JWT.
- Création d'une candidature.
- Consultation de ses candidatures.
- Isolation entre utilisateurs.
- Statistiques après création.
- Modification du statut.
- Actualisation du dashboard après modification.
- Consultation des notifications avec JWT.
- Refus des notifications sans JWT.
- Suppression d'une candidature.
- Vérification de la suppression.
- Mise à jour du dashboard après suppression.

### Lancer les tests

Avec Docker démarré :

**Windows et Linux :**

```bash
npm test
```

**Dernière validation locale : 24 octobre 2026**

```text
Tests : 15
Réussis : 15
Échecs : 0
```

Le résultat compte 14 sous-tests ainsi que leur test parent.

Les tests créent des comptes temporaires et une candidature, ensuite supprimée. Les comptes de test restent enregistrés dans la base de développement.

Cette suite ne doit pas être exécutée contre une base de production.

### Qualité et compilation

**Windows et Linux :**

```bash
npm run lint
npm run build
```

Dernière validation locale :

```text
ESLint : OK
Build Vite : OK
32 modules transformés
```

Le build génère les fichiers optimisés dans `frontend/dist/`.

## Commandes disponibles

Toutes les commandes suivantes sont compatibles avec Windows PowerShell et Linux Bash.

| Commande | Description |
|---|---|
| `npm run dev` | Démarrer Docker et React |
| `npm run dev:frontend` | Démarrer uniquement React |
| `npm run docker:up` | Démarrer les conteneurs existants |
| `npm run docker:build` | Construire et démarrer les conteneurs |
| `npm run docker:down` | Arrêter les conteneurs |
| `npm run docker:ps` | Afficher l'état des conteneurs |
| `npm run docker:logs` | Consulter les logs |
| `npm test` | Lancer les tests d'intégration |
| `npm run lint` | Vérifier le frontend |
| `npm run build` | Compiler le frontend |

## Sécurité

Le projet inclut les mesures suivantes :

- Hashage des mots de passe avec bcrypt.
- Authentification JWT avec expiration.
- Middleware de vérification JWT.
- Contrôle d'accès aux données par utilisateur.
- Requêtes SQL paramétrées.
- Validation des données reçues par les API.
- Configuration des secrets par variables d'environnement.
- Fichiers `.env` locaux ignorés par Git.

Le JWT est conservé dans `localStorage` côté frontend. Ce choix pédagogique simplifie le fonctionnement de l'application, mais présente un risque en cas de faille XSS.

Les secrets ayant éventuellement été exposés dans d'anciens commits doivent être renouvelés : leur exclusion de la version courante ne suffit pas à les révoquer.

## Limites du projet

ApplyFlow est une V1 pédagogique, non une application destinée à une utilisation en production.

Les principales limites sont :

- Absence de tests automatisés des interactions React.
- Absence de tests automatisés de reprise après panne PostgreSQL ou RabbitMQ.
- Gestion simplifiée des messages RabbitMQ invalides.
- Notifications uniquement internes, sans envoi d'emails.
- Absence de déploiement en production.
- Absence de pipeline CI/CD et de supervision avancée.
- Conservation des comptes créés par les tests d'intégration.

## Objectifs pédagogiques

Ce projet m'a permis de pratiquer et de mieux comprendre :

- Le développement frontend avec React.
- La création d'API REST avec Node.js et Express.
- L'authentification et l'autorisation avec JWT.
- La gestion des mots de passe avec bcrypt.
- Les requêtes SQL et la persistance avec PostgreSQL.
- La mise en cache avec Redis.
- La communication asynchrone avec RabbitMQ.
- La séparation des responsabilités dans une architecture microservices.
- La conteneurisation avec Docker Compose.
- Les tests d'intégration automatisés.



---

**ApplyFlow — Projet personnel full-stack JavaScript et architecture microservices.**
