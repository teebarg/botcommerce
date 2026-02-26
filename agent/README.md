# 🤖 Customer Support Agent

An agentic AI customer support system built with **LangChain**, **Qdrant**, **RAG**, and **FastAPI**.
Runs on Groq — deployable on 500MB free tier servers.

---

## 🏗️ Architecture

```
Your App
      │
      ▼ POST /chat
┌─────────────────────────────┐
│   FastAPI (Render 500MB)    │
│                             │
│   LangChain ReAct Agent     │
│   ├── search_products       │──► Qdrant (free cloud)
│   ├── search_faqs           │──► Qdrant (free cloud)
│   ├── search_policies       │──► Qdrant (free cloud)
│   ├── check_order_status    │──► shop API
│   ├── check_stock           │──► shop API
│   ├── request_refund        │──► shop API
│   └── escalate_to_human     │──► Human Helpdesk
│                             │
│   LLM: Groq (prod)          │
│   Memory: Redis (session)   │
└─────────────────────────────┘
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Docker (optional, for Redis)

### 1. Clone & Install
```bash
git clone <your-repo>
cd customer-support-agent
pip install -r requirements.txt
```

### 2. Set Up Environment
```bash
cp .env.example .env
```

### 3. Start Redis (with Docker)
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 4. Ingest Your Data
```bash
# Load all collections (products, FAQs, policies)
python -m app.rag.ingest --collection all

# Or load individually
python -m app.rag.ingest --collection products
python -m app.rag.ingest --collection faqs
```

### 5. Start the Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Test It
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Where is my order #12345?", "session_id": "test-session"}'
```

Visit **http://localhost:8000/docs** for the interactive API documentation.

---

## 🚀 Deployment (Render Free Tier)

### Prerequisites
- [Qdrant Cloud](https://cloud.qdrant.io) free account (1GB, no credit card)
- [Groq](https://console.groq.com) free API key
- [Render](https://render.com) account

### Environment Variables on Render
Set these in your Render service settings:

| Variable | Value |
|---|---|
| `ENV` | `production` |
| `GROQ_API_KEY` | From console.groq.com |
| `QDRANT_URL` | From cloud.qdrant.io |
| `QDRANT_API_KEY` | From cloud.qdrant.io |
| `REDIS_URL` | From Render Redis service |
| `API_BASE_URL` | Your shop API URL |

### Deploy Steps
1. Push your code to GitHub
2. Create a new **Web Service** on Render → connect your repo
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Add all environment variables
6. Deploy!

### Ingest Data After Deployment
```bash
curl -X POST https://your-render-app.onrender.com/ingest \
  -H "Content-Type: application/json" \
  -d '{"collection": "all"}'
```

---

## 📁 Project Structure

```
customer-support-agent/
├── app/
│   ├── main.py              # FastAPI entry point & endpoints
│   ├── config.py            # Settings & LLM factory (Groq)
│   ├── agent/
│   │   ├── agent.py         # LangChain ReAct agent loop
│   │   ├── tools.py         # All agent tools (RAG + shop API)
│   │   └── memory.py        # Redis-backed conversation memory
│   ├── rag/
│   │   ├── qdrant_client.py # Qdrant connection & search
│   │   └── ingest.py        # Data ingestion pipeline
│   └── schemas/
│       └── models.py        # Pydantic v2 request/response models
├── data/
│   ├── products.json        # Your product catalog
│   ├── faqs.json            # Frequently asked questions
│   └── policies.txt         # Store policies
├── Dockerfile               # Optimized for Render 500MB
├── requirements.txt
└── .env.example
```

---

## 🔌 Integrating with Your Shop

Send a POST request to `/chat` for every customer message:

```javascript
// In your frontend
const response = await fetch('https://api.agent.com/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    session_id: sessionStorage.getItem('supportSessionId'), // persist across messages
    customer_id: loggedInUser?.id,  // optional: pass if user is logged in
  })
});

const data = await response.json();
// data.reply        → show this to the customer
// data.session_id   → save this for the next message
// data.escalated    → if true, notify a human agent
```

---

## 🛠️ Updating Your Data

Whenever you add new products, FAQs, or update policies:

1. Call the ingest endpoint:
```bash
curl -X POST https://your-agent.onrender.com/ingest \
  -d '{"collection": "products"}'
```

---

## 📊 CV Skills This Project Demonstrates

- **LangChain** — ReAct agents, tool calling, memory management
- **RAG** (Retrieval-Augmented Generation) — semantic search over knowledge base
- **Qdrant** — vector database, embedding storage, semantic search
- **Sentence Transformers** — local embeddings, `all-MiniLM-L6-v2`
- **FastAPI** — async REST API, background tasks, middleware
- **Pydantic v2** — data validation and settings management
- **Redis** — distributed session state and conversation memory
- **Docker** — containerization, multi-stage builds, health checks
- **Prompt Engineering** — ReAct format, agent behavior control
- **Model-agnostic design** — Claude / Groq switching
- **Groq API** — LLM inference, open-source model deployment
