# API-SPEC.md — Geospatial Works NestJS Backend REST API & WebSocket Specification

> **Base URL:** `http://localhost:4000/api/v1`  
> **WebSocket Gateway:** `ws://localhost:4000/support-chat`  
> **OpenAPI Swagger Interface:** `http://localhost:4000/api/docs`  
> **Content-Type:** `application/json`

---

## 1. Complete Endpoints Overview

| Method / Protocol | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | System health check & uptime status |
| `GET` | `/fleet` | Public | List hardware inventory & software tools |
| `GET` | `/projects` | Public | List milestone projects |
| `POST` | `/quote/calculate` | Public | Calculate instant BDT survey cost estimate |
| `POST` | `/quote/book` | Public | Submit official site inspection booking |
| `GET` | `/vlog` | Public | List published field vlogs & audio podcasts |
| `GET` | `/vlog/:slug` | Public | Get single vlog post with video/audio stream |
| `POST` | `/vlog` | JWT (Editor/Admin) | Create/Publish new field vlog entry |
| `GET` | `/cms/:section` | Public | Get landing page section content payload |
| `PUT` | `/cms/:section` | JWT (Admin) | Update landing page section content |
| `POST` | `/support/chat` | Public | Send message to AI Support Agent |
| `GET` | `/support/tickets` | JWT (Support) | List support tickets for human escalation |
| `WS` | `/support-chat` | Public / JWT | Real-time WebSocket gateway for live chat |

---

## 2. Dynamic CMS & Vlog Endpoint Schemas

### 2.1 GET `/api/v1/vlog/:slug`
Fetches a single vlog post with embedded video clip and audio podcast link.

**Response `200 OK`:**
```json
{
  "statusCode": 200,
  "data": {
    "id": "vlog-casmar-mangrove",
    "slug": "casmar-mangrove-drone-survey-2026",
    "title": "UAV Multispectral Mapping in Sundarbans Mangrove Belt",
    "summary": "Aerial flight logs and NDVI biomass analysis for the CASMAR mangrove afforestation project.",
    "content": "# Aerial Survey Report\n\nDuring our 2026 mission with BONDHU Foundation...",
    "videoUrl": "https://cdn.geospatialworks.com.bd/video/casmar-flight-4k.mp4",
    "audioUrl": "https://cdn.geospatialworks.com.bd/audio/field-log-ep14.mp3",
    "thumbnail": "https://cdn.geospatialworks.com.bd/img/casmar-thumb.jpg",
    "author": "Husni Mobarak Prince",
    "category": "drone-survey",
    "publishedAt": "2026-07-28T10:00:00Z"
  }
}
```

---

### 2.2 POST `/api/v1/support/chat` (AI Agent Response)
Sends a question to the AI Support Agent.

**Request Payload:**
```json
{
  "ticketId": "tick-9042",
  "message": "What equipment do you use for bathymetric river surveys?"
}
```

**Response `200 OK`:**
```json
{
  "statusCode": 200,
  "data": {
    "ticketId": "tick-9042",
    "sender": "AI_BOT",
    "text": "For bathymetric and hydrographic river surveys, Geospatial Works utilizes the CHCNAV D270 Dual-Frequency Depth Echo Sounder paired with Sokkia B20A TBM leveling equipment to map underwater riverbeds with sub-centimeter elevation accuracy.",
    "escalatedToHuman": false
  }
}
```
