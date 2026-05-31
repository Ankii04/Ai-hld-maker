
<p align="center">

```
   _____            .__   .__  _______  .__            .___
  /  _  \_______  __|  |__|  | \      \ |__| ____    __| _/
 /  /_\  \_  __ \/  _  ||  | /   |   \|  |/    \  / __ |
/    |    \  | \/  /_/ ||  |/    |    \  |   |  \/ /_/ |
\____|__  /__|  \____ ||____\____|__  /__|___|  /\____ |
        \/           \/             \/        \/      \/
```

</p>

<p align="center">
  <strong>🧠 ArchMind — AI-Powered System Design & UI/UX Blueprint Generator</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License" />
</p>

---

## 📖 What is ArchMind?

**ArchMind** is a full-stack, AI-powered application that transforms a simple project description into a comprehensive, production-ready system design blueprint — in seconds.

Whether you're a developer preparing for a system design interview, an architect drafting technical specifications, or a startup founder sketching your product's architecture, ArchMind generates:

- 🏗️ **High-Level Design (HLD)** — Microservices, monolith, or serverless architectures
- 🔩 **Low-Level Design (LLD)** — Class diagrams, design patterns, component interactions
- 🗄️ **Database Schema** — Entity-Relationship diagrams and table definitions
- 🌐 **REST API Contracts** — Endpoints, request/response bodies, status codes
- 🎨 **UI/UX Blueprints** — Wireframe-level screen flows and component hierarchies
- 📈 **Scalability Strategies** — Caching, CDN, load balancing, queue recommendations
- 💡 **Challenge Mode** — Practice mode with edge-case Q&A for interview prep

All designs are visualized on an **interactive whiteboard** (Excalidraw-like canvas) and can be exported as PNG, SVG, or JSON.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 + Vite |
| **UI Components** | Tailwind CSS + shadcn/ui |
| **State Management** | Zustand |
| **Routing** | React Router v6 |
| **Whiteboard Canvas** | Excalidraw / React Flow |
| **HTTP Client** | Axios |
| **Backend Runtime** | Node.js 18+ |
| **Backend Framework** | Express.js |
| **AI Engine** | Google Gemini 1.5 Pro (via `@google/generative-ai`) |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | bcrypt |
| **Environment Config** | dotenv |
| **Dev Tools** | Nodemon, ESLint, Prettier |

---

## ✨ Features

### 🏗️ High-Level Design (HLD)
Generate architecture diagrams illustrating major system components — services, databases, message queues, CDNs, and external integrations — with annotated data-flow descriptions.

### 🔩 Low-Level Design (LLD)
Break down each service into class structures, interface contracts, design patterns (Factory, Singleton, Observer, etc.), and module interaction diagrams.

### 🗄️ Database Schema Designer
Produce normalized relational schemas or NoSQL document structures with entity relationships, indexes, and cardinality annotations.

### 🌐 API Blueprint Generator
Auto-generate complete REST API specifications including:
- Endpoint paths and HTTP methods
- Request headers, path params, query params, and body schemas
- Response payloads and HTTP status codes
- Authentication requirements per endpoint

### 🎨 UI/UX Blueprint Mode
Design screen-by-screen wireframe flows including navigation structure, component hierarchy, and user journey mapping — all rendered on the interactive canvas.

### 📈 Scalability & Infrastructure Advisor
Receive targeted recommendations for:
- Horizontal vs. vertical scaling strategies
- Caching layers (Redis, Memcached)
- Load balancing and reverse proxy configurations
- Message queues (Kafka, RabbitMQ, SQS)
- CDN integration and edge caching

### 💡 Challenge Mode (Interview Prep)
Enter **Challenge Mode** to receive curated follow-up questions about your design's bottlenecks, failure modes, trade-offs, and scaling decisions — perfect for senior-level system design interview practice.

### 🖼️ Interactive Whiteboard
An Excalidraw-powered canvas where every generated diagram is rendered as editable, draggable nodes. You can:
- Pan, zoom, and rearrange components
- Add freehand annotations
- Export as **PNG**, **SVG**, or **JSON**
- Share a read-only link with teammates

### 🔐 User Accounts & History
Save, revisit, and iterate on past blueprints. Each design is versioned so you can compare architectural decisions over time.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** `v18.0.0` or higher
- **npm** `v9+` or **yarn**
- **MongoDB** running locally on `mongodb://localhost:27017` (or a MongoDB Atlas URI)
- A **Google Gemini API Key** — get one free at [Google AI Studio](https://aistudio.google.com/)

### Installation

```bash
# Prerequisites: Node.js 18+, MongoDB running locally

# 1. Clone/navigate to project
cd archmind

# 2. Setup backend
cd backend
npm install
copy .env.example .env
# Edit .env: add GEMINI_API_KEY and MONGODB_URI

# 3. Start backend
npm run dev
# Backend runs on http://localhost:5000

# 4. Setup frontend (new terminal)
cd ../frontend
npm install
copy .env.example .env

# 5. Start frontend
npm run dev
# Frontend runs on http://localhost:5173
```

> **Tip:** On Linux/macOS, replace `copy` with `cp` in the commands above.

Open your browser and navigate to **http://localhost:5173** to start designing!

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Port for the Express server | `5000` |
| `MONGODB_URI` | ✅ Yes | MongoDB connection string | `mongodb://localhost:27017/archmind` |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini AI API key | `AIzaSy...` |
| `JWT_SECRET` | ✅ Yes | Secret key for signing JWTs | `your_super_secret_key` |
| `JWT_EXPIRES_IN` | No | JWT token expiry duration | `7d` |
| `NODE_ENV` | No | Runtime environment | `development` |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ Yes | Base URL of the backend API | `http://localhost:5000/api` |
| `VITE_APP_NAME` | No | Application display name | `ArchMind` |
| `VITE_ENABLE_CHALLENGE_MODE` | No | Toggle Challenge Mode feature | `true` |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Login and receive a JWT token | ❌ |
| `GET` | `/api/auth/me` | Get current authenticated user | ✅ |
| `POST` | `/api/auth/logout` | Invalidate the current session | ✅ |

### Blueprint Generation

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/generate/hld` | Generate High-Level Design blueprint | ✅ |
| `POST` | `/api/generate/lld` | Generate Low-Level Design blueprint | ✅ |
| `POST` | `/api/generate/database` | Generate database schema | ✅ |
| `POST` | `/api/generate/api` | Generate REST API specification | ✅ |
| `POST` | `/api/generate/uiux` | Generate UI/UX wireframe blueprint | ✅ |
| `POST` | `/api/generate/scalability` | Generate scalability recommendations | ✅ |
| `POST` | `/api/generate/challenge` | Generate Challenge Mode Q&A | ✅ |
| `POST` | `/api/generate/full` | Generate all blueprints in one call | ✅ |

### Blueprint Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/blueprints` | List all blueprints for current user | ✅ |
| `GET` | `/api/blueprints/:id` | Get a single blueprint by ID | ✅ |
| `PUT` | `/api/blueprints/:id` | Update/rename a blueprint | ✅ |
| `DELETE` | `/api/blueprints/:id` | Delete a blueprint | ✅ |
| `GET` | `/api/blueprints/:id/export` | Export blueprint as JSON | ✅ |

### Health

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/health` | Server health check | ❌ |

---

## 💰 Plans & Monetization

| Feature | 🆓 Free | ⭐ Pro |
|---------|:-------:|:-----:|
| Blueprint generations / month | 10 | Unlimited |
| HLD Generation | ✅ | ✅ |
| LLD Generation | ✅ | ✅ |
| Database Schema | ✅ | ✅ |
| API Blueprint | ✅ | ✅ |
| UI/UX Blueprint | ❌ | ✅ |
| Scalability Advisor | ❌ | ✅ |
| Challenge Mode | ❌ | ✅ |
| Full Blueprint (all-in-one) | ❌ | ✅ |
| Export PNG / SVG | ✅ | ✅ |
| Export JSON | ❌ | ✅ |
| Saved blueprint history | 5 | Unlimited |
| Shareable read-only links | ❌ | ✅ |
| Priority AI response | ❌ | ✅ |
| **Price** | **Free forever** | **$9.99 / month** |

---

## 🖼️ Whiteboard Features

ArchMind renders every generated blueprint onto an **interactive canvas** powered by [Excalidraw](https://excalidraw.com/) and [React Flow](https://reactflow.dev/), giving you a diagram experience that feels natural and collaborative.

### Canvas Interactions

| Feature | Description |
|---------|-------------|
| 🖱️ **Pan & Zoom** | Click-drag to pan; scroll wheel or pinch to zoom in/out |
| ↔️ **Drag Nodes** | Move any component, service, or entity box freely on the canvas |
| ✏️ **Inline Edit** | Double-click any node label to rename it directly on the canvas |
| 🔗 **Connect Components** | Draw new relationship arrows by dragging between node handles |
| 🎨 **Freehand Drawing** | Switch to pencil mode to sketch annotations alongside AI-generated diagrams |
| 📦 **Group & Cluster** | Select multiple nodes and group them into bounded containers (e.g., "Auth Service Cluster") |
| 🗑️ **Delete & Undo** | Full undo/redo history with `Ctrl+Z` / `Ctrl+Y` support |
| 📐 **Snap to Grid** | Optional grid snapping for pixel-perfect alignment |
| 🏷️ **Sticky Notes** | Add free-floating text notes anywhere on the canvas |

### Export Options

| Format | Description |
|--------|-------------|
| **PNG** | High-resolution raster image, ideal for presentations and documents |
| **SVG** | Scalable vector graphic, perfect for embedding in wikis or Notion |
| **JSON** | Full canvas state export — re-import and continue editing anytime |

### Collaboration (Pro)

Pro users can generate a **shareable read-only link** for any blueprint, allowing teammates, reviewers, or interviewers to view the live canvas without needing an account.

---

## 📁 Project Structure

```
archmind/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handler logic
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   ├── models/            # Mongoose schemas (User, Blueprint)
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Gemini AI integration, generation logic
│   │   └── utils/             # JWT helpers, validators, formatters
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level page components
│   │   ├── store/             # Zustand global state
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API call abstractions (Axios)
│   │   └── utils/             # Helpers, constants, formatters
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🧪 Running Tests

```bash
# Backend unit & integration tests
cd backend
npm test

# Frontend component tests
cd frontend
npm test

# End-to-end tests (requires both servers running)
npm run test:e2e
```

---

## 🤝 Contributing

Contributions are welcome and greatly appreciated! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```
3. **Commit** your changes with a descriptive message:
   ```bash
   git commit -m "feat: add real-time collaboration to whiteboard"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/my-awesome-feature
   ```
5. **Open a Pull Request** — describe what you've changed and why

### Contribution Guidelines

- Follow the existing code style (ESLint + Prettier configs are included)
- Write or update tests for any new functionality
- Keep PRs focused — one feature or fix per PR
- Update this README if you add new environment variables or API endpoints

### Reporting Issues

Found a bug or have a feature idea? [Open an issue](https://github.com/your-username/archmind/issues) with:
- A clear title and description
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots or logs if applicable

---

## 🗺️ Roadmap

- [ ] Real-time collaborative whiteboard (multi-user cursors)
- [ ] GitHub Integration — auto-generate architecture from a repo URL
- [ ] Figma plugin for UI/UX blueprint export
- [ ] Terraform / IaC output generation
- [ ] OpenAPI 3.0 YAML export for API blueprints
- [ ] Team workspaces with role-based access control
- [ ] Dark mode for the canvas
- [ ] CLI tool (`npx archmind generate --prompt "..."`)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full details.

```
MIT License

Copyright (c) 2026 ArchMind Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<p align="center">
  Built with ❤️ using React, Express, MongoDB & Google Gemini AI<br/>
  <strong>ArchMind</strong> — Design smarter. Build faster.
</p>
