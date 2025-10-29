# ⚡ Revoque — Modern E-Commerce Platform

Revoque is a full-featured e-commerce platform built with **Next.js** and **FastAPI**, designed for performance, scalability, and smooth shopping experiences. It uses **multi-tier caching**, **real-time revalidation**, **fast full-text search**, and **AI-powered retrieval-augmented generation (RAG)** to deliver highly responsive storefront interactions.

---

## 🏗️ Architecture Overview

![Architecture Diagram](./architecture.png)

**Key Highlights**
- **Next.js App Router** — SSR, ISR revalidation, and SWR caching
- **FastAPI Backend** — optimized Python APIs
- **Redis Cache** — sessions, carts & cached API responses
- **PostgreSQL** — primary data authority (products, orders, users)
- **Meilisearch** — Instant product search with filters
- **Qdrant** — vector search for semantic similarity (product embeddings)
- **Supabase Storage** — product images, invoice files, exports
- **Celery** — background tasks (embedding generation, indexing, exports, notifications)
- **Gemini (LLM)** — conversational AI assistant using RAG
- **CDN Cache** (Vercel/Cloudflare) — global static asset delivery

---

## ✨ Features

- 🔐 Secure authentication & authorization
- 🛒 Persistent cart & smooth checkout flow
- ⚡ SWR + CDN + Redis multi-level caching
- 🔍 Real-time full-text product search (Meilisearch)
- 🤖 AI-powered product discovery & conversational assistant (Gemini + Qdrant)
  - Semantic "related products" via SentenceTransformers → Qdrant
  - RAG conversational assistant: Meilisearch + Qdrant + DB retrieval → Gemini
- 🧾 PDF invoice generation & storage on Supabase
- 🔄 Background task processing with Celery
- 📦 Bulk product import/export via spreadsheet
- 💳 Payment integration with **Paystack**

---

## 🧰 Tech Stack

### Frontend
- **Next.js** (App Router)
- **React**
- **TailwindCSS**
- **SWR / React Query**

### Backend
- **FastAPI**
- **PostgreSQL**
- **Redis**
- **Celery + Redis broker**
- **Meilisearch**
- **Qdrant**
- **SentenceTransformers**
- **Gemini API**
- **Supabase Storage**

---

## 🚀 Getting Started

### ✅ Prerequisites
- Node.js ≥ 18
- Python ≥ 3.11
- PostgreSQL
- Redis
- Meilisearch
- Qdrant
- Supabase Project (for storage buckets)
- Paystack account (for payments)

---

### 📦 Installation

1. Clone repo
```sh
git clone https://github.com/teebarg/botcommerce.git
cd botcommerce
```

2. Install frontend
```sh
cd frontend
npm install
```

3. Install backend
```sh
cd ../backend
uv sync
```

4. Add environment variables
Create `.env` in both `frontend` and `backend` using `.env.example` as a guide. Key entries include:
- `DATABASE_URL` (Postgres)
- `REDIS_URL`
- `MEILISEARCH_URL`
- `QDRANT_URL` and `QDRANT_API_KEY` (if used)
- `SUPABASE_URL` and `SUPABASE_KEY`
- `PAYSTACK_SECRET`
- `GEMINI_API_KEY` (or appropriate LLM key)

5. Create Supabase Storage buckets
| Bucket | Purpose |
|--------|---------|
| `images` | Product images |
| `exports` | Exported XLSX files |
| `invoices` | Order invoice PDFs |

> Ensure **public read access** is enabled ⚠️ (or generate signed URLs if you prefer restricted access)

---

### ▶️ Running the App (development)

Start the backend:
```sh
cd backend
uvicorn main:app --reload
```

Start the frontend:
```sh
cd frontend
npm run dev
```

Visit 👉 http://localhost:3000

---

## 🧠 AI — Hybrid Search & RAG

This project uses a hybrid search pattern combining Meilisearch (keyword + filters) and Qdrant (semantic vector similarity) to support both fast keyword search and human-like semantic queries.

**Pipeline summary:**
1. Product embedding generation (SentenceTransformers) runs as a Celery job when products are created/updated.
2. Embeddings are stored in Qdrant for nearest-neighbor similarity queries ("Related Products").
3. For AI chat, FastAPI retrieves relevant contexts from:
   - Meilisearch (top keyword matches)
   - Qdrant (top semantically-similar documents/products)
   - PostgreSQL (product metadata, FAQs)
4. Retrieved context is packaged and sent to **Gemini** (RAG) to produce a concise, conversational response.

**Notes & best practices:**
- Keep embedding vector dimensionality and Qdrant index configuration consistent across updates.
- Use chunking for long product descriptions to improve retrieval relevance.
- Apply rate-limiting and caching for LLM calls to control cost and latency.

---

## 🛠️ Operational Notes
- Celery uses Redis as broker in this setup: ensure worker(s) are running for async jobs.
- Meilisearch and Qdrant should be monitored for index health and storage usage.
- Supabase storage policies: consider signed URLs for private downloads.

---

## 🤝 Contributing
Contributions are welcome! See: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 License
Distributed under the **MIT License**. See: [LICENSE](LICENSE)

---

## 📬 Contact
For inquiries: **teebarg01@gmail.com**



