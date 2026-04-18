# API YaoundéLoc (Express + MySQL)

Ce dépôt est prévu **au même niveau** que le frontend, par exemple :

```text
PROJET/
├── yaound-rentals-connect/   # frontend (Vite + React)
└── backend/                  # cette API (vous êtes ici)
```

## Prérequis

- Node.js 20+
- MySQL 8 (ou compatible)

## Configuration

```bash
cd /chemin/vers/backend
cp .env.example .env
```

Éditer `.env` : identifiants MySQL, `JWT_SECRET` (≥ 16 caractères), `CORS_ORIGIN` (ex. `http://localhost:8080`).

## Base de données

```bash
npm install
npm run db:migrate
npm run db:seed
```

Le seed crée des annonces de démo et deux comptes (mot de passe **`password123`**) :

- `owner@test.cm` — rôle propriétaire (tableau de bord, création d’annonces)
- `user@test.cm` — rôle utilisateur

## Lancer l’API

```bash
npm run dev
```

Par défaut : `http://localhost:3000` — santé : `GET /api/health`.

## Endpoints principaux

| Méthode | Chemin | Auth |
|--------|--------|------|
| GET | `/api/health` | Non |
| POST | `/api/auth/register` | Non |
| POST | `/api/auth/login` | Non |
| GET | `/api/auth/me` | Bearer JWT |
| GET | `/api/properties` | Non (filtres query) |
| GET | `/api/properties/stats` | Non |
| GET | `/api/properties/mine` | Owner |
| GET | `/api/properties/:id` | Non |
| POST | `/api/properties` | Owner (body JSON + `images: string[]` URLs HTTPS) |
| PATCH | `/api/properties/:id` | Owner (auteur) |
| DELETE | `/api/properties/:id` | Owner (auteur) |
| GET | `/api/favorites` | Oui (liste d’annonces) |
| POST | `/api/favorites/:propertyId` | Oui |
| DELETE | `/api/favorites/:propertyId` | Oui |
| GET | `/api/meta/neighborhoods` | Non |

Les images sont des URLs (ex. Cloudinary) uploadées **depuis le frontend** ; l’API ne gère pas Cloudinary.
# back-location-yde
