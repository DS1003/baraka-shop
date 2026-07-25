# 📋 AUDIT TECHNIQUE ET ARCHITECTURAL COMPLET - BARAKA SHOP

> **Date de l'audit** : 25 Juillet 2026  
> **Projet** : Baraka Shop E-Commerce Platform (`baraka-shop`)  
> **Stack Principale** : Next.js 15.5.0 (App Router), React 19, TypeScript 5, Tailwind CSS, Prisma 7, PostgreSQL (Neon), Redis (ioredis), Auth.js (NextAuth v5), Cloudinary, Gemini AI.

---

## 📑 TABLE DES MATIÈRES
1. [Synthèse Exécutive](#1-synthèse-exécutive)
2. [Architecture Globale & Stack Technique](#2-architecture-globale--stack-technique)
3. [Audit de Sécurité & Habilitations (Alertes Critiques)](#3-audit-de-sécurité--habilitations-alertes-critiques)
4. [Audit de Performance, Middleware & Caching](#4-audit-de-performance-middleware--caching)
5. [Audit de Qualité du Code & Type Safety](#5-audit-de-qualité-du-code--type-safety)
6. [Audit de la Base de Données & Schéma Prisma](#6-audit-de-la-base-de-données--schéma-prisma)
7. [Audit des Fonctionnalités Métier & Tâches de Fond (FTP / IA)](#7-audit-des-fonctionnalités-métier--tâches-de-fond-ftp--ia)
8. [Audit Frontend, UI/UX & SEO](#8-audit-frontend-uiux--seo)
9. [Matrice des Risques & Plan d'Action Recommandé](#9-matrice-des-risques--plan-daction-recommandé)

---

## 1. SYNTHÈSE EXÉCUTIVE

L'application **Baraka Shop** est une plateforme e-commerce moderne et robuste adaptée aux réalités du marché (gestion de boutiques physiques, modes de retrait Click & Collect, univers de produits, synchronisation avec système ERP externe via FTP, et enrichissement IA des fiches produits).

Le projet présente des bases architecturales solides (Next.js 15 App Router, Redis fail-soft, ORM Prisma 7, composants modernes). Néanmoins, l'audit met en évidence **plusieurs vulnérabilités de sécurité critiques (P0)** au niveau des Server Actions et des endpoints d'API d'administration qui nécessitent une correction immédiate avant toute mise en production à grande échelle.

### Index de Santé du Projet
- 🟢 **Compilation & Types** : **100%** (`tsc --noEmit` sans aucune erreur)
- 🟡 **Architecture & Modularité** : **75%** (Bon découpage, mais composants UI comme `Header.tsx` trop volumineux)
- 🟠 **Performance & Scalabilité** : **65%** (Utilisation de Redis fail-soft excellente, mais sur-sollicitation HTTP dans le middleware Edge)
- 🔴 **Sécurité & Contrôle d'Accès** : **35%** (Présence de Server Actions et d'APIs admin non protégées)

---

## 2. ARCHITECTURE GLOBALE & STACK TECHNIQUE

### 2.1. Framework et Infrastructure
- **Next.js 15.5.0** avec App Router et Server Actions (`'use server'`).
- **React 19** avec hydratation progressive et Server Components.
- **TypeScript 5** pour le typage statique.

### 2.2. Base de Données & Cache
- **PostgreSQL sur Neon Serverless** avec connexion via `@prisma/adapter-pg` et pool de connexion `pg` natif (limit max: 5).
- **Prisma Client v7.7.0** pour le mapping objet-relationnel.
- **Redis (ioredis)** pour le dictionnaire de cache mémoire et le rate limiting.

### 2.3. Services Tierces & Intégrations
- **NextAuth.js v5 (beta 31)** : Stratégie JWT avec Credentials Provider.
- **Cloudinary** : Stockage et optimisation des médias d'images de produits et bannières.
- **Google GenAI (`@google/genai`)** : Normalisation et formatage automatisé des caractéristiques techniques via Gemini.
- **basic-ftp & xlsx** : Synchronisation du catalogue de produits et des catégories avec le serveur ERP d'inventaire.

---

## 3. AUDIT DE SÉCURITÉ & HABILITATIONS (ALERTES CRITIQUES)

> [!CAUTION]
> **Niveau de risque : CRITIQUE**. Plusieurs points d'entrée d'écriture et de lecture d'administration sont exposés publiquement sans authentification.

### 🔴 3.1. Server Actions d'Administration Non Protégées
- **Fichier impacté** : [`lib/actions/admin-actions.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/lib/actions/admin-actions.ts) (1570+ lignes) et [`lib/actions/product-actions.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/lib/actions/product-actions.ts)
- **Constat** : Dans `admin-actions.ts`, des fonctions modifiant des données sensibles (gestion d'utilisateurs, configuration du site, suppression/modification de catégories et statistiques) ne contiennent aucun contrôle de session `auth()`.
- **Mécanisme d'attaque** : En Next.js, toute fonction exportée dans un fichier avec la directive `'use server'` génère un endpoint HTTP RPC public. Un attaquant peut invoquer directement ces fonctions sans être connecté.
- **Correctif requis** :
```typescript
const session = await auth();
if (!session || session.user?.role !== 'ADMIN') {
    throw new Error("Accès non autorisé.");
}
```

### 🔴 3.2. Endpoints d'API d'Administration sans Contrôle d'Accès
- **Fichiers impactés** :
  - [`app/api/admin/stores/route.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/app/api/admin/stores/route.ts#L64)
  - [`app/api/admin/physical-stores/route.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/app/api/admin/physical-stores/route.ts#L34)
- **Constat** : Les méthodes `POST` exécutent des requêtes d'insertion, mise à jour ou suppression SQL sans vérifier l'identité de l'utilisateur.
- **Facteur aggravant** : Dans [`middleware.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/middleware.ts#L126), le matcher exclut explicitement `/api` :
  `matcher: ['/((?!api|_next/static|_next/image|sitemap\\.xml|robots\\.txt|.*\\.png$).*)']`
  Par conséquent, l'Edge Middleware n'intercepte **aucune** route sous `/api/admin/...`.

### 🔴 3.3. Fuite de Données Personnelles (RGPD / Confidentialité)
- **Fichier impacté** : [`app/api/admin/orders/route.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/app/api/admin/orders/route.ts#L8)
- **Constat** : La méthode `GET` de cette route renvoie la liste complète des commandes clients avec les emails, numéros de téléphone et articles achetés sans aucune vérification d'habilitation `ADMIN`.
- **Impact** : N'importe qui sur Internet connaissant ou découvrant cette URL peut récupérer l'intégralité du fichier client et des ventes.

### 🔴 3.4. Upload Cloudinary Anonyme et Indiscipliné
- **Fichier impacté** : [`app/api/upload/route.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/app/api/upload/route.ts#L4)
- **Constat** : L'API accepte des fichiers jusqu'à 20 Mo sans authentification. Un script malveillant pourrait consommer tout le quota de stockage et de bande passante du compte Cloudinary.

### 🟠 3.5. Authentification Fail-Open sur la Clé Cron
- **Fichier impacté** : [`app/api/cron/sync/route.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/app/api/cron/sync/route.ts#L11)
- **Code problématique** :
  `if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`)`
- **Explication** : Si la variable d'environnement `CRON_SECRET` n'est pas définie dans l'environnement de production, l'expression `process.env.CRON_SECRET` vaut `undefined` (falsy). La condition s'évalue à `false`, permettant de contourner l'authentification et de forcer la synchronisation FTP via `/api/cron/sync?force=true`.

---

## 4. AUDIT DE PERFORMANCE, MIDDLEWARE & CACHING

> [!WARNING]
> **Niveau de risque : MOYEN / ÉLEVÉ**. Problèmes potentiels de latence au niveau du TTFB.

### 🟠 4.1. Requêtes HTTP Récursives dans le Middleware Edge
- **Fichier impacté** : [`middleware.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/middleware.ts#L24)
- **Constat** : Pour chaque requête entrante sur le site public, le middleware exécute :
  `await fetch(`${origin}/api/site-status`, { cache: 'no-store' })`
- **Impact** : Cela ajoute une boucle d'aller-retour HTTP interne sur chaque requête utilisateur, dégradant fortement le Time To First Byte (TTFB) et augmentant la charge sur le serveur Web.
- **Solution recommandée** : Utiliser un cache mémoire en Edge ou vérifier l'état du mode maintenance via un cookie, un fichier statique léger ou un header sans appel HTTP récursif.

### 🟢 4.2. Stratégie de Cache Redis (Fail-Soft)
- **Fichier analysé** : [`lib/redis.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/lib/redis.ts)
- **Points forts** :
  - Connexion Redis encapsulée avec `ioredis` et gestion des retries.
  - Implémentation "fail-soft" dans `getCache`, `setCache` et `invalidateCache` : si le serveur Redis tombe ou subit une panne de réseau, le code intercepte silencieusement l'erreur et retombe directement sur la base de données PostgreSQL sans faire planter le site.

---

## 5. AUDIT DE QUALITÉ DU CODE & TYPE SAFETY

> [!NOTE]
> **Compilation TypeScript** : `npm run type-check` passe avec **0 erreur**.

### 🟠 5.1. Perte du Typage Prisma avec le Type `any`
- **Fichier impacté** : [`lib/prisma.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/lib/prisma.ts#L20-L27)
- **Code problématique** :
  `const adapter = new PrismaPg(pool as any);`
  `return new PrismaClient({ adapter }) as any;`
  `const prisma: any = globalThis.prismaGlobal ?? prismaClientSingleton();`
- **Impact** : En typant le singleton `prisma` en `any`, TypeScript ne valide plus les modèles, champs ou relations de la base de données dans le reste du code. Les erreurs d'orthographe sur les noms de colonnes ne sont détectées qu'à l'exécution.

### 🟡 5.2. Encombrement de la Racine du Projet (Fichiers de Debug/Test)
Le répertoire racine du projet contient 20+ fichiers de script temporaires et journaux de débogage qui devraient être nettoyés ou déplacés :
- **Scripts de vérification** : `check-cats.ts`, `check-db.cjs`, `check-db.js`, `check-db.ts`, `check-history.ts`, `check-jobs.js`, `check-status.js`, `check-status.ts`
- **Scripts de debug** : `debug-counts.js`, `debug-db-counts.js`, `debug-db.js`, `debug-products.ts`, `debug-status.js`
- **Fichiers de tests ponctuels** : `test-prisma.ts`, `test-query-adapter.js`, `test-query-adapter2.js`, `test-query.js`, `test-sync.ts`, `test-xlsx.ts`
- **Logs et captures HTML** : `dev-startup.log`, `server-debug.log`, `source.html`, `homepage_source.html`

---

## 6. AUDIT DE LA BASE DE DONNÉES & SCHÉMA PRISMA

- **Fichier analysé** : [`prisma/schema.prisma`](file:///c:/Users/seydiop07/Desktop/baraka-shop/prisma/schema.prisma) (362 lignes, 22 modèles).

### 🟢 6.1. Modélisation Métier Adaptée
Le schéma est bien structuré et répond aux exigences d'un e-commerce omnicanal :
- Hiérarchie de catégories à 3 niveaux (`Category` -> `SubCategory` -> `ThirdLevelCategory`).
- Variantes de couleurs de produits (`ProductColorVariant`).
- Boutiques physiques (`Store`, `PhysicalStore`) et zones de livraison.
- Bannières publicitaires et promotions dynamiques (`HomePromo`, `BigBanner`, `PopularUniverse`).
- Historique de synchronisation et configurations (`SyncConfig`, `SyncHistory`).

### 🟢 6.2. Indexation de la Base de Données
Les index de recherche et de jointure fréquents sont bien définis sur le modèle `Product` :
- `@@index([name])`, `@@index([slug])`
- `@@index([categoryId])`, `@@index([subCategoryId])`, `@@index([thirdLevelCategoryId])`
- `@@index([brandId])`, `@@index([storeId])`, `@@index([stock])`

---

## 7. AUDIT DES FONCTIONNALITÉS MÉTIER & TÂCHES DE FOND (FTP / IA)

### 🟢 7.1. Synchronisation Automatique FTP & Verrouillage Atomique
- **Fichier analysé** : [`instrumentation.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/instrumentation.ts) et [`lib/ftp-sync.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/lib/ftp-sync.ts)
- **Mécanisme** :
  - `instrumentation.ts` enregistre un timer qui vérifie la planification toutes les 30 secondes en environnement Node.js.
  - Pour éviter les exécutions concurrentes en multi-worker, l'application utilise un verrou atomique basé sur le système de fichiers (`fs.mkdirSync(lockDir)`).
  - La synchronisation utilise `os.tmpdir()` pour être compatible avec les environnements read-only comme Vercel Serverless.

### 🟢 7.2. Intégration IA avec Gemini (`lib/ai-service.ts`)
- **Fichier analysé** : [`lib/ai-service.ts`](file:///c:/Users/seydiop07/Desktop/baraka-shop/lib/ai-service.ts)
- Utilisation du SDK officiel `@google/genai` avec le modèle `gemini-1.5-flash` en mode streaming (`normalizeProductSpecsStream`) pour une expérience fluide d'édition de fiches produits par l'administrateur.

---

## 8. AUDIT FRONTEND, UI/UX & SEO

### 🟢 8.1. Design & Composants UI
- Utilisation moderne de **Tailwind CSS**, **Framer Motion** (animations de transitions et modales), et **Sonner** (notifications toasts).
- Composants spécialisés : `ProductCard.tsx`, `WatermarkOverlay.tsx`, `MiniCart.tsx`, `OrientationBlocker.tsx`, `BorderGlow.tsx`.

### 🟡 8.2. Composant Monolithique `Header.tsx`
- **Fichier** : [`layout/Header.tsx`](file:///c:/Users/seydiop07/Desktop/baraka-shop/layout/Footer.tsx) / [`layout/Header.tsx`](file:///c:/Users/seydiop07/Desktop/baraka-shop/layout/Header.tsx) (59.3 KB, ~1500+ lignes).
- **Recommandation** : Découper `Header.tsx` en sous-composants (`SearchBar.tsx`, `NavigationMenu.tsx`, `UserNav.tsx`, `MobileDrawer.tsx`) pour simplifier la maintenance et améliorer la vitesse de recompilation HMR en développement.

### 🟢 8.3. Optimisation SEO
- Présence de `sitemap.ts` générant dynamiquement les URLs de produits, catégories et boutiques.
- Présence de `robots.ts` configuré avec les règles d'indexation.

---

## 9. MATRICE DES RISQUES & PLAN D'ACTION RECOMMANDÉ

### Tableau de Priorisation

| Ref | Priorité | Domaine | Description du problème | Action corrective |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | 🔴 **P0 (Urgent)** | Sécurité | Server Actions d'administration sans authentification | Ajouter un contrôle `auth()` avec vérification du rôle `ADMIN` dans `admin-actions.ts` et `product-actions.ts`. |
| **SEC-02** | 🔴 **P0 (Urgent)** | Sécurité | APIs admin d'écriture et d'ordres publiques | Securiser `/api/admin/orders`, `/api/admin/stores` et `/api/admin/physical-stores` avec vérification de session. |
| **SEC-03** | 🔴 **P0 (Urgent)** | Sécurité | Route d'upload Cloudinary sans protection | Restreindre `/api/upload` aux seuls utilisateurs authentifiés. |
| **SEC-04** | 🟠 **P1 (Haute)** | Sécurité | Fail-open sur `CRON_SECRET` dans `/api/cron/sync` | Exiger explicitement la présence de `CRON_SECRET` sans fallback permissif. |
| **PERF-01**| 🟠 **P1 (Haute)** | Performance | Over-fetching HTTP dans le middleware Edge | Supprimer le `fetch()` synchrone dans `middleware.ts` et utiliser un stockage d'état plus direct. |
| **QUAL-01**| 🟠 **P1 (Haute)** | Type Safety | Client Prisma casté en `any` (`lib/prisma.ts`) | Restaurer le typage fort `PrismaClient` nativement généré. |
| **CLEAN-01**| 🟡 **P2 (Moyenne)**| Organisation | Fichiers de test et de debug à la racine | Déplacer ou supprimer tous les fichiers `check-*.ts`, `debug-*.js` et `.log` de la racine. |
| **ARCH-01** | 🟡 **P2 (Moyenne)**| Architecture | Composant `Header.tsx` trop volumineux | Refactoriser `Header.tsx` en sous-composants modulaires. |

---

### Conclusion
L'application **Baraka Shop** dispose d'une excellente architecture métier et technique. Une fois les vulnérabilités de sécurité corrigées (principalement l'ajout de gardes d'authentification sur les Server Actions et APIs admin), l'application sera prête pour une exploitation sécurisée et hautement performante.
