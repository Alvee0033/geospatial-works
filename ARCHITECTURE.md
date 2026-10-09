# ARCHITECTURE.md — Enterprise Next.js + NestJS Architecture Specification

This document details the system design, data flow, component hierarchy, backend modularity, and security architecture for the **Geospatial Works Enterprise Platform** including the **Admin Panel**, **Multimedia Vlog**, and **Hybrid AI + Human Support Agent Desk**.

---

## 1. System High-Level Topology

```mermaid
graph TD
    Client["Public Client Browser"] -->|HTTPS / WSS| CDN["Vercel CDN / NGINX Edge"]
    Admin["Admin / Support Agent Console"] -->|HTTPS / WSS| CDN

    CDN --> NextJS["Next.js 14+ App Router (Port 3000)"]
    CDN --> NestJS["NestJS Backend API (Port 4000)"]
    
    subgraph "Next.js Frontend Architecture"
        NextJS --> PublicPages["Public Portal & Fleet Explorer"]
        NextJS --> VlogPages["Multimedia Field Vlog & Video Center"]
        NextJS --> SupportWidget["Hybrid AI + Human Live Chat Widget"]
        NextJS --> AdminPanel["Enterprise Admin CMS Console (/admin)"]
    end

    subgraph "NestJS Backend Modular Engine"
        NestJS --> WsGateway["WebSocket Gateway (Real-Time Live Chat)"]
        NestJS --> CmsModule["CMS Module (Page Editor)"]
        NestJS --> VlogModule["Vlog & Media Module (Video / Audio)"]
        NestJS --> SupportModule["Support Agent Module (AI RAG + Human Escalation)"]
        NestJS --> QuoteModule["Quote Estimator & Booking Module"]
        NestJS --> Prisma["Prisma ORM Layer"]
    end
    
    Prisma --> Postgres[("PostgreSQL Database")]
    SupportModule --> VectorDB[("Vector Store / RAG Embeddings")]
```

---

## 2. Updated Prisma Data Models

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  CONTENT_EDITOR
  SUPPORT_AGENT
  FIELD_SURVEYOR
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(SUPPORT_AGENT)
  createdAt DateTime @default(now())
}

model VlogPost {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  summary     String
  content     String   // Rich Markdown / HTML
  videoUrl    String?  // HLS / MP4 aerial flight clip
  audioUrl    String?  // Audio podcast / field note
  thumbnail   String
  author      String
  category    String   // drone-survey, rtk-gnss, gis-mapping
  published   Boolean  @default(true)
  publishedAt DateTime @default(now())
}

model CmsSection {
  id          String   @id @default(uuid())
  sectionKey  String   @unique // hero, about, services, fleet, team
  title       String
  subtitle    String?
  contentJson Json     // Flexible CMS JSON configuration payload
  updatedAt   DateTime @updatedAt
}

model SupportTicket {
  id          String        @id @default(uuid())
  clientName  String
  clientEmail String?
  clientPhone String
  status      String        @default("BOT_ACTIVE") // BOT_ACTIVE, ESCALATED_HUMAN, RESOLVED
  assignedTo  String?       // Support Agent User ID
  messages    ChatMessage[]
  createdAt   DateTime      @default(now())
}

model ChatMessage {
  id        String        @id @default(uuid())
  ticketId  String
  sender    String        // CLIENT, AI_BOT, HUMAN_AGENT
  text      String
  createdAt DateTime      @default(now())
  ticket    SupportTicket @relation(fields: [ticketId], references: [id])
}
```

---

## 3. Hybrid AI + Human Support Agent Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Visitor
    participant Widget as Chat Widget
    participant WS as WebSocket Gateway
    participant AI as AI RAG Agent
    participant Human as Human Support Agent
    
    Client->>Widget: Opens Chat & Types Question ("What is the drone accuracy?")
    Widget->>WS: Sends Message payload
    WS->>AI: Query Knowledge Base
    AI-->>WS: Return Answer ("Our DJI Mavic 3E provides sub-centimeter RTK fix ±1cm accuracy...")
    WS-->>Widget: Render AI Response

    Client->>Widget: Clicks "Speak to Human Officer"
    Widget->>WS: Request Escalation
    WS->>Human: Trigger Dashboard Alert (New Escalated Ticket)
    Human->>WS: Join Chat Session
    WS-->>Widget: "Representative Husni has joined the conversation."
    Human->>Widget: Send live human reply
```
