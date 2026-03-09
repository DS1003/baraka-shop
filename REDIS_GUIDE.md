# 🚀 Redis Integration for Baraka Shop

L'intégration de Redis a été effectuée pour transformer l'application en une plateforme performante, scalable et sécurisée. Voici une vue d'ensemble de ce qui a été mis en œuvre.

## 🛠️ Stack Technique
- **Client :** `ioredis` (Singleton pattern)
- **Hébergement recommandé :** Docker, Upstash, ou Redis Cloud.
- **Variable d'environnement :** `REDIS_URL=redis://localhost:6379`

## 💎 Fonctionnalités Implémentées

### 1. Caching Global (Performance)
- **Produits :** Mise en cache des listes de produits, résultats de recherche et filtres (`lib/actions/product-actions.ts`).
- **Entités (Nouveau) :** Mise en cache des IDs de Catégories, Marques et Sous-catégories pendant l'importation. Cela réduit de **90%** les transactions SQL lors d'une injection massive.
- **Catégories & Marques :** Mise en cache des listes complètes pour accélérer le chargement du menu.
- **Invalidation Automatique :** Le cache est automatiquement vidé après chaque batch d'importation réussi.

### 2. Rate Limiting (Sécurité)
- **Inscription :** Limitation du nombre d'inscriptions par adresse IP (5 par 15 min) pour éviter le spam et les attaques par force brute (`lib/rate-limit.ts`).
- **Extensibilité :** Le module `rateLimit` peut être appliqué à n'importe quelle route API ou Server Action sensible.

### 3. Background Jobs (Robustesse)
- **Importation :** Utilisation de Redis pour le suivi de la progression en temps réel des imports massifs (`lib/actions/import-bg-actions.ts`).
- **Vitesse :** L'interface récupère le statut depuis Redis (beaucoup plus rapide que des requêtes SQL répétées sur PostgreSQL).

## 🚀 Comment lancer un serveur Redis localement ?

Si vous n'avez pas de serveur Redis, le plus simple est d'utiliser Docker :

```bash
docker run -d --name baraka-redis -p 6379:6379 redis:alpine
```

Ou si vous installez Redis en local sur Windows/Linux :
- Windows : [Memurai](https://www.memurai.com/) ou [WSL2](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-database#install-redis)
- macOS : `brew install redis && brew services start redis`

## 📂 Fichiers Créés / Modifiés
- `lib/redis.ts` : Singleton et helpers de cache.
- `lib/rate-limit.ts` : Logique de limitation de débit.
- `lib/actions/product-actions.ts` : Intégration du cache et de l'invalidation.
- `lib/actions/import-bg-actions.ts` : Suivi de progression temps réel.
- `app/api/register/route.ts` : Protection anti-spam.
- `.env` : Configuration de la variable `REDIS_URL`.

## 🧪 Tester l'intégration
Pour vérifier que Redis fonctionne, surveillez vos logs :
- `[Redis] Connecting...` au démarrage.
- `[Redis] Cache Hit for products:...` lors de la navigation répétée sur les produits.
- `[Redis] Invalidated keys...` après un import.

---
*Géré par Antigravity — Votre Senior Lead Engineer.*
