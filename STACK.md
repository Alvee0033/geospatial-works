# STACK.md — Enterprise Technology Stack & Vibe Coding Guidelines

This document details the exact library versions, development tools, infrastructure dependencies, and **Vibe Coding Guidelines** for the **Geospatial Works Enterprise Platform**.

---

## 1. Technology Stack Summary

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `^14.2.0` | React Server Components, SSR, Dynamic Routing |
| **UI Library** | React / React DOM | `^18.3.0` | Declarative Component-driven UI |
| **Language** | TypeScript | `^5.4.0` | Strict Static Typing & Interface Contracts |
| **Styling** | Vanilla CSS / Glassmorphic Design | CSS3 Custom Tokens | Dark Emerald Obsidian Theme & Radar Animations |
| **Icons & Visuals** | Lucide React / Custom SVG | `^0.360.0` | Vector HUD Icons & Status Indicators |
| **Backend Framework** | NestJS | `^10.3.0` | Enterprise Modular Node.js REST API |
| **Database ORM** | Prisma ORM | `^5.12.0` | Type-safe PostgreSQL Client & Migrations |
| **Database** | PostgreSQL | `^16.0` | Relational Storage for Fleet, Projects & Quotes |
| **Caching Engine** | Redis | `^7.2` | High-speed cache for GNSS telemetry & quotes |
| **API Documentation** | Swagger / OpenAPI 3.0 | `@nestjs/swagger` | Interactive API documentation endpoint (`/api/docs`) |
| **Code Formatter** | Prettier | `^3.2.0` | Automated Code Formatting |
| **Linter** | ESLint | `^8.57.0` | Code Quality & Syntax Standards |

---

## 2. Vibe Coding Best Practices

### 🎨 1. Rich Aesthetics & Visual Excellence
- **No Boring Default Whites/Grays:** Always use the Dark Emerald Obsidian palette (`#071D16` / `#0B2B20`) with glowing safety orange (`#FF8C00`) and cyber cyan (`#00D2FF`) highlights.
- **Glassmorphism:** Use `backdrop-filter: blur(16px)` with subtle cyan borders (`rgba(0, 210, 255, 0.12)`).
- **Micro-Animations:** Smooth hover transforms (`translateY(-4px)`), radar sweep rotation keyframes, blinking GNSS pulse status dots.
- **Zero Placeholders:** Never use generic "Lorem Ipsum" text or broken image boxes. Use domain-authentic geospatial data (e.g. CHCNAV i83, DJI Mavic 3 Enterprise, 10,000+ GCPs across 64 districts).

### ⚡ 2. High Performance & Code Quality
- **React Server Components (RSC) First:** Render static pages (About, Services, Team) on the server for instant LCP (<0.8s). Use `'use client'` only for interactive widgets (Fleet Tabs, Project Filters, Quote Estimator).
- **Strict TypeScript Types:** Define explicit DTO interfaces for all API payloads and props. Never use implicit `any`.
- **Modular Component Isolation:** Keep UI components under `src/components/` under 150 lines per file.

### 🛡️ 3. Security & API Standards
- **Input Sanitation:** Validate all incoming HTTP payloads via NestJS `ValidationPipe` with `class-validator`.
- **JWT Protection:** Protect administrative routes using NestJS Passport JWT guards.
- **Strict CORS & Rate Limiting:** Enforce Throttler rules (max 100 requests per minute).

---

## 3. Docker Compose Local Setup (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: geospatial_postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: geospatial_works
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: geospatial_redis
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```
