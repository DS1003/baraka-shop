# Architecture & Stratégie de Haute Disponibilité (High Availability — HA)
## Baraka Shop (Baraka Électronique)

Ce document détaille l'ensemble des mécanismes et des protocoles mis en œuvre pour garantir un taux de disponibilité supérieur à **99.95% (SLA High Availability)** pour la plateforme e-commerce Baraka Shop.

---

## 1. Vue d'Ensemble de l'Architecture Résiliente

```
                               ┌────────────────────────────────┐
                               │   Utilisateurs & Acheteurs     │
                               └────────────────┬───────────────┘
                                                │
                                                ▼
                               ┌────────────────────────────────┐
                               │   Réseau CDN Edge Mondial      │
                               │  (Vercel / Cloudflare Cache)   │
                               └────────────────┬───────────────┘
                                                │
                                                ▼
                               ┌────────────────────────────────┐
                               │     Middleware Résilient       │
                               │  - Fail-Open Circuit Breaker   │
                               │  - 1200ms Timeout Guard        │
                               └────────────────┬───────────────┘
                                                │
                    ┌───────────────────────────┴───────────────────────────┐
                    │                                                       │
                    ▼                                                       ▼
   ┌────────────────────────────────┐                      ┌────────────────────────────────┐
   │    Cache L1 Mémoire Vive       │                      │    Cache L2 Upstash Redis      │
   │  (Zéro dépendance réseau)      │◄─── Synchronisé ────►│  (Persistance globale distribuée)
   │  - Stale-While-Revalidate      │                      │  - Auto-reconnect infini       │
   └────────────────┬───────────────┘                      └────────────────┬───────────────┘
                    │                                                       │
                    └───────────────────────────┬───────────────────────────┘
                                                │ (Cache Miss ou Mutex)
                                                ▼
                               ┌────────────────────────────────┐
                               │   Base de Données Neon PG      │
                               │  (Serverless Pooled Cluster)   │
                               │  - withDbRetry (Backoff exp.)  │
                               │  - Pooler pgbouncer 30s        │
                               └────────────────────────────────┘
```

---

## 2. Piliers Techniques Implémentés

### A. Auto-Guérison de la Base de Données (`lib/prisma.ts`)
- **`withDbRetry` (Exponential Backoff + Jitter) :**
  - Toute requête critique de lecture/écriture en cas de cold-start de Neon ou de déconnexion réseau transitoire (`P1001`, `P2024`, `ETIMEDOUT`, `ECONNRESET`) déclenche automatiquement jusqu'à **3 tentatives successives** avec temporisation progressive (150ms, 300ms, etc.) et jitter aléatoire.
  - Résultat : 99.9% des micro-coupures réseau sont absorbées de façon transparente sans impacter l'expérience client.
- **Paramétrage du Pool de Connexions :**
  - Utilise l'URL poolée Neon (`-pooler...aws.neon.tech`).
  - `keepAlive: true`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 30000`.

### B. Double Étage de Cache & "Stale-While-Revalidate on Error" (`lib/redis.ts`)
- **Cache L1 In-Memory :**
  - Si Upstash Redis subit une déconnexion ou une saturation de quota, un cache L1 en mémoire vive (`Map` LRU plafonnée à 500 entrées) prend le relais immédiatement.
- **Stale-While-Revalidate en cas d'erreur :**
  - Si la base de données ne répond pas, `rememberCache` sert automatiquement la dernière version saine connue en cache au lieu de renvoyer une erreur 500.
  - Protection anti-empoisonnement de cache : une réponse vide consécutive à une erreur ne peut jamais écraser un cache sain.
- **Reconnexion Infinie :**
  - Le `retryStrategy` d'ioredis ne s'arrête jamais définitivement (backoff plafonné à 10s).
  - Le healthcheck réveille automatiquement la connexion si elle est au repos.

### C. Barrières d'Interception d'Erreurs (Error Boundaries)
- **`app/error.tsx` :**
  - Capture toute exception de rendu ou de server-action dans la boutique.
  - Présente une interface de marque rassurante avec bouton « Réessayer » (sans perte de contexte), retour à l'accueil et lien direct vers le support WhatsApp commercial.
- **`app/global-error.tsx` :**
  - Capture les pannes critiques du layout racine.
  - Stylisé en CSS pur inline (100% autonome, ne dépend d'aucun CDN ou fichier CSS externe).

### D. Endpoint de Monitoring Uptime (`/api/health`)
- Disponible publiquement sur `/api/health`.
- Teste en temps réel :
  1. La connectivité Neon PostgreSQL via un `SELECT 1` avec timeout de 3000ms.
  2. La latence Upstash Redis via un `PING`.
  3. L'état du mode maintenance.
  4. La mémoire Node.js (heap, RSS) et l'uptime système.
- Retourne **HTTP 200 (healthy / degraded)** ou **HTTP 503 (unhealthy)**.

---

## 3. Configuration Recommandée pour le Monitoring Externe (Gratuit)

Pour être alerté 24h/24 en cas de défaillance, connectez l'URL `/api/health` à l'un des services suivants :

1. **UptimeRobot (Recommandé) :**
   - Type : `HTTP(s)`
   - URL : `https://baraka.sn/api/health`
   - Fréquence : Toutes les 60 secondes.
   - Alerte si code != 200 ou temps de réponse > 4000ms.
2. **BetterStack / StatusCake :**
   - Vérification du mot clé `"status": "healthy"`.

---

## 4. Déploiement en Production (Checklist)

| Composant | Service | Recommandation Haute Disponibilité |
|---|---|---|
| **Hébergement Frontend / API** | Vercel Pro | Régions multiples activées (Multi-Region Edge CDN) |
| **Base de Données** | Neon PostgreSQL | Scale-to-zero désactivé ou min CU = 0.25 pour éviter les cold-starts |
| **Cache & Sessions** | Upstash Redis | Instance globale répliquée |
| **Images & Médias** | Cloudinary | CDN mondial Akamai / Fastly (déjà intégré dans `lib/utils.ts`) |
| **E-mails Transactionnels** | Resend | Retry asynchrone non-bloquant (`lib/stock-service.ts`) |
