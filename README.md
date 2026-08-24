# TerraFrais - Plateforme Agricole

Plateforme web qui connecte directement les agriculteurs et les acheteurs, permettant l'achat de produits frais, locaux et de qualité sans intermédiaires.

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Agriculteur 1 | Richard@gmail.com | password |
| Agriculteur 2 | gerth@gmail.com | password |
| Acheteur | roseline@gmail.com | password |
| Admin | ordi@gmail.com | password |

---

## Architecture Logicielle

### Vue d'ensemble

TerraFrais est une application web **monolithique** construite avec **Next.js 16 (App Router)** et **React 19**, écrite en **TypeScript**. L'application suit une architecture en couches organisée autour du système de routage de Next.js, avec une gestion d'état centralisée par **React Context** et une persistance des données via **localStorage**.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Navigateur)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    COUCHE PRÉSENTATION                  │  │
│  │  app/(main) · app/(auth) · app/(dashboard)             │  │
│  │  components/ (UI réutilisables + shadcn/ui)            │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │                 COUCHE ÉTAT & CONTEXTE                 │  │
│  │  AuthProvider · DataProvider · CartProvider            │  │
│  │  (React Context + localStorage)                        │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │              COUCHE LOGIQUE MÉTIER (lib/)              │  │
│  │  types.ts · payment.ts · ai-insights.ts · mock-data.ts │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │              COUCHE API (app/api/)                     │  │
│  │  /api/payments/mpesa · /api/payments/orange-money      │  │
│  │  /api/upload                                           │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│                    ┌──────▼──────┐                           │
│                    │  Fournisseurs externes                  │
│                    │  M-Pesa · Orange Money                 │
│                    └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Structure des dossiers

```
agri-tech-platform/
├── app/                          # Routage Next.js (App Router)
│   ├── layout.tsx                # Layout racine (providers globaux)
│   ├── page.tsx                  # Page d'accueil
│   ├── globals.css               # Styles globaux
│   │
│   ├── (main)/                   # Pages publiques (avec Header + Footer)
│   │   ├── layout.tsx            # Layout public (Header/Footer)
│   │   ├── marche/               # Marché (catalogue produits)
│   │   ├── actualites/           # Actualités agricoles
│   │   ├── a-propos/             # Page "À propos"
│   │   └── contact/              # Page de contact
│   │
│   ├── (auth)/                   # Pages d'authentification
│   │   ├── layout.tsx
│   │   ├── connexion/            # Connexion
│   │   └── inscription/          # Inscription
│   │
│   ├── (dashboard)/              # Tableaux de bord (espaces privés)
│   │   ├── layout.tsx
│   │   ├── agriculteur/          # Dashboard agriculteur
│   │   │   └── messages/         # Messagerie agriculteur
│   │   ├── acheteur/             # Dashboard acheteur
│   │   │   ├── commandes/        # Commandes acheteur
│   │   │   ├── messages/         # Messagerie acheteur
│   │   │   └── support/          # Support acheteur
│   │   └── admin/                # Dashboard administrateur
│   │       └── messages/         # Messagerie admin
│   │
│   └── api/                      # Routes API (côté serveur)
│       ├── payments/
│       │   ├── mpesa/            # Intégration M-Pesa
│       │   │   ├── route.ts      # Endpoint STK Push
│       │   │   └── callback/     # Callback M-Pesa
│       │   └── orange-money/     # Intégration Orange Money
│       │       ├── route.ts      # Endpoint paiement
│       │       └── callback/     # Callback Orange Money
│       └── upload/               # Upload d'images
│
├── components/                   # Composants React réutilisables
│   ├── ui/                       # Primitives shadcn/ui (Button, Card, Dialog…)
│   ├── buyer/                    # Composants spécifiques acheteur
│   │   ├── buyer-sidebar.tsx
│   │   ├── messages-panel.tsx
│   │   └── orders-panel.tsx
│   ├── farmer/                   # Composants spécifiques agriculteur
│   │   ├── ai-insights-panel.tsx # Panneau d'analyses IA
│   │   ├── order-details-dialog.tsx
│   │   └── sales-charts.tsx      # Graphiques de ventes (Recharts)
│   ├── messaging/                # Composants de messagerie
│   │   ├── chat-window.tsx
│   │   └── conversation-list.tsx
│   ├── header.tsx                # En-tête global
│   ├── footer.tsx                # Pied de page global
│   ├── hero-slider.tsx           # Carrousel d'accueil
│   ├── product-card.tsx          # Carte produit
│   ├── cart-sheet.tsx            # Panier latéral
│   ├── checkout-dialog.tsx       # Dialogue de paiement
│   ├── contact-farmer-dialog.tsx # Contact agriculteur
│   ├── order-chat-dialog.tsx     # Chat lié à une commande
│   ├── farmer-ratings.tsx        # Évaluations agriculteur
│   ├── star-rating.tsx           # Étoiles de notation
│   ├── message-notifications.tsx # Notifications de messages
│   ├── scroll-reveal.tsx         # Animation au défilement
│   ├── auth-side-panel.tsx       # Panneau latéral authentification
│   └── theme-provider.tsx        # Gestion du thème (clair/sombre)
│
├── lib/                          # Logique métier et utilitaires
│   ├── types.ts                  # Types TypeScript (User, Product, Order…)
│   ├── auth-context.tsx          # Contexte d'authentification
│   ├── data-context.tsx          # Contexte de données (CRUD global)
│   ├── cart-context.tsx          # Contexte du panier
│   ├── payment.ts                # Logique paiement Mobile Money
│   ├── ai-insights.ts            # Moteur d'analyses IA (heuristique)
│   ├── mock-data.ts              # Données de démonstration
│   └── utils.ts                  # Fonctions utilitaires (cn, etc.)
│
├── hooks/                        # Hooks React personnalisés
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── public/                       # Assets statiques (images, uploads)
├── styles/                       # Styles globaux additionnels
├── package.json                  # Dépendances et scripts
├── next.config.mjs               # Configuration Next.js
├── tsconfig.json                 # Configuration TypeScript
└── components.json               # Configuration shadcn/ui
```

### Couches architecturales

#### 1. Couche Présentation (`app/` + `components/`)

- **Route groups Next.js** : `(main)`, `(auth)`, `(dashboard)` organisent les pages par domaine fonctionnel.
- **Composants UI** : Les primitives `shadcn/ui` (dans `components/ui/`) fournissent les éléments de base (boutons, dialogues, formulaires, tableaux…).
- **Composants métier** : Les composants spécifiques aux rôles (`buyer/`, `farmer/`, `messaging/`) encapsulent la logique d'affichage propre à chaque espace.

#### 2. Couche État & Contexte (`lib/`)

L'application utilise **trois contextes React** imbriqués dans `app/layout.tsx` :

```
<AuthProvider>      → Gère l'utilisateur connecté (login, register, logout)
  <DataProvider>    → Gère toutes les données (produits, commandes, utilisateurs, articles…)
    <CartProvider>  → Gère le panier d'achat et les paniers sauvegardés
```

- **AuthProvider** (`auth-context.tsx`) : Authentification simulée avec persistance dans `localStorage` (`agrimarche_user`).
- **DataProvider** (`data-context.tsx`) : Source de vérité pour toutes les données de l'application, initialisée avec `mock-data.ts` et persistée dans `localStorage`.
- **CartProvider** (`cart-context.tsx`) : Gestion du panier, des quantités, des paniers sauvegardés et de l'état d'ouverture du panier/checkout.

#### 3. Couche Logique Métier (`lib/`)

- **`types.ts`** : Définit tous les types TypeScript du domaine (User, Product, Order, PaymentTransaction, SupportTicket, Conversation, etc.) ainsi que les constantes métier (taux de commission 3%, frais de compte agriculteur 56 000 FC).
- **`payment.ts`** : Logique de paiement Mobile Money — regroupe le panier par agriculteur, calcule la commission plateforme (3%) et le montant net reversé (97%), valide les numéros de téléphone et génère les références de transaction.
- **`ai-insights.ts`** : Moteur d'analyse heuristique embarqué (sans API externe) qui agrège l'historique des commandes, mesure la vélocité des ventes sur fenêtres glissantes de 7 jours, détecte les tendances et projette la demande future. Prêt à être remplacé par un modèle d'IA externe.
- **`mock-data.ts`** : Données de démonstration (utilisateurs, produits, commandes, articles, conversations).

#### 4. Couche API (`app/api/`)

Les routes API Next.js servent d'**interface entre le client et les fournisseurs de paiement externes** :

- **`/api/payments/mpesa`** : Endpoint STK Push M-Pesa — authentification OAuth, génération du mot de passe STK, soumission de la demande de paiement. **Mode démonstration** automatique si les variables d'environnement ne sont pas configurées.
- **`/api/payments/mpesa/callback`** : Callback de confirmation M-Pesa.
- **`/api/payments/orange-money`** : Endpoint de paiement Orange Money (même pattern).
- **`/api/payments/orange-money/callback`** : Callback Orange Money.
- **`/api/upload`** : Upload d'images vers `public/uploads/`.

### Gestion des rôles

| Rôle | Espace | Fonctionnalités principales |
|------|--------|---------------------------|
| **Agriculteur** | `/dashboard/agriculteur` | Gestion des produits, suivi des commandes, analyses IA des ventes, graphiques, messagerie |
| **Acheteur** | `/dashboard/acheteur` | Achat de produits, suivi des commandes, messagerie, support, évaluations |
| **Admin** | `/dashboard/admin` | Gestion des utilisateurs, produits, articles, transactions, demandes de compte agriculteur, vitrine produits |

### Flux de paiement

```
Acheteur (panier)
    │
    ▼
groupCartByFarmer() → Regroupe les produits par agriculteur
    │
    ▼
processMobileMoneyPayment() → Appelle /api/payments/{method}
    │
    ▼
Route API → Fournisseur externe (M-Pesa / Orange Money)
    │
    ▼
Transaction enregistrée (commission 3% plateforme, 97% agriculteur)
```

### Technologies clés

| Technologie | Rôle |
|-------------|------|
| **Next.js 16** (App Router) | Framework React, routage, SSR/SSG, routes API |
| **React 19** | Bibliothèque UI |
| **TypeScript** | Typage statique |
| **Tailwind CSS 4** | Styling utilitaire |
| **shadcn/ui** | Composants UI accessibles (Radix UI) |
| **Recharts** | Graphiques de ventes |
| **React Hook Form + Zod** | Formulaires et validation |
| **Sonner** | Notifications toast |
| **next-themes** | Thème clair/sombre |
| **Vercel Analytics** | Analytics |

### Points d'extension

- **IA externe** : Le module `ai-insights.ts` est conçu pour être remplacé par un appel à un modèle d'IA externe (OpenAI, etc.) sans impact sur l'interface.
- **Base de données** : La couche `DataProvider` centralise l'accès aux données — elle peut être migrée vers une vraie base de données (PostgreSQL, MongoDB) en remplaçant l'implémentation interne.
- **Nouveaux fournisseurs de paiement** : Le pattern des routes API `mpesa/` et `orange-money/` peut être dupliqué pour ajouter d'autres opérateurs Mobile Money.