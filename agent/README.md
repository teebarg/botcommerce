# 🤖 Revoque Customer Support Agent

An advanced agentic AI customer support system built with **LangGraph**, **LangChain**, **Qdrant**, **RAG**, and **FastAPI**.
Features intelligent conversation flows, forms, quick replies, and comprehensive observability.
Runs on multiple LLM providers — deployable on 500MB free tier servers.

---

## 🏗️ Architecture

```
Your App
      │
      ▼ POST /chat
┌─────────────────────────────┐
│   FastAPI (Render 500MB)    │
│                             │
│   LangGraph Agent           │
│   ├── search_products       │──► Qdrant (free cloud)
│   ├── search_faqs           │──► Qdrant (free cloud)
│   ├── search_policies       │──► Qdrant (free cloud)
│   ├── check_order_status    │──► shop API
│   ├── check_stock           │──► shop API
│   ├── request_refund        │──► shop API
│   ├── escalate_to_human     │──► Human Helpdesk
│   ├── intent classification │──► LLM
│   ├── form generation       │──► Dynamic UI
│   └── quick replies         │──► Contextual
│                             │
│   LLM: Groq/Claude/Others   │
│   Memory: Redis (session)   │
│   Observability: Langfuse   │
└─────────────────────────────┘
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Docker (optional, for Redis)
- UV (recommended package manager)

### 1. Clone & Install
```bash
git clone https://github.com/teebarg/botcommerce
cd agent
uv sync
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
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `GOOGLE_API_KEY` | From Google AI Studio |
| `QDRANT_URL` | From cloud.qdrant.io |
| `QDRANT_API_KEY` | From cloud.qdrant.io |
| `REDIS_URL` | From Render Redis service |
| `API_BASE_URL` | Your shop API URL |
| `LANGFUSE_SECRET_KEY` | From Langfuse dashboard |
| `LANGFUSE_PUBLIC_KEY` | From Langfuse dashboard |
| `LANGFUSE_HOST` | Your Langfuse instance URL |
| `SLACK_WEBHOOK_URL` | For escalation notifications |

### Deploy Steps
1. Push your code to GitHub
2. Create a new **Web Service** on Render → connect your repo
3. Set **Build Command**: `uv sync`
4. Set **Start Command**: `uv run uvicorn app.main:app --host 0.0.0.0 --port 8000`
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

````
agent/
├── app/
│   ├── main.py              # FastAPI entry point & endpoints
│   ├── config.py            # Settings & LLM factory (multiple providers)
│   ├── agent/
│   │   ├── agent_graph.py   # LangGraph agent with state management
│   │   ├── agent.py         # Legacy ReAct agent (fallback)
│   │   ├── tools.py         # All agent tools (RAG + shop API)
│   │   ├── memory.py        # Redis-backed conversation memory
│   │   └── db.py            # Database operations for conversations
│   ├── rag/
│   │   ├── qdrant_client.py # Qdrant connection & search
│   │   └── ingest.py        # Data ingestion pipeline
│   ├── schemas/
│   │   └── models.py        # Pydantic v2 request/response models
│   ├── observability/       # Monitoring & evaluation
│   │   ├── tracing.py       # Langfuse integration
│   │   ├── eval_runner.py   # Automated evaluation pipeline
│   │   ├── evaluators.py    # Custom evaluation metrics
│   │   ├── db.py           # Evaluation database
│   │   └── langfuse_client.py # Langfuse client setup
│   ├── utils.py             # Utility functions (Slack, etc.)
│   └── redis_client.py      # Redis connection management
├── models/                   # Local embedding models
├── scripts/                  # Utility scripts
├── pyproject.toml           # UV-based dependency management
├── Dockerfile               # Optimized for Render 500MB
├── .env.example
└── README.md
```

---

## � Advanced Features

### 🎯 Smart Intent Classification
The agent automatically classifies customer intents and responds appropriately:
- **Normal queries** → LangGraph agent with full tool access
- **Escalation requests** → Human agent form collection
- **Complaints** → Structured complaint form
- **Contact updates** → Customer detail update form

### 📝 Dynamic Forms
Interactive forms that appear contextually:
```json
{
  "type": "escalation_details",
  "title": "Before we connect you with an agent",
  "fields": [
    {"name": "name", "label": "Your name", "type": "text", "required": true},
    {"name": "phone", "label": "Phone number", "type": "tel", "required": false},
    {"name": "summary", "label": "Describe the issue", "type": "textarea", "required": true}
  ]
}
```

### ⚡ Contextual Quick Replies
AI-generated quick reply buttons that adapt to conversation context:
- Rule-based for simple queries (greetings, basic questions)
- LLM-generated for complex scenarios (orders, refunds, complaints)
- Always relevant and action-oriented

### 📊 Comprehensive Observability
Built-in monitoring and evaluation with Langfuse:
- **Tracing**: Full conversation flow tracking
- **Evaluation**: Automated quality assessment
- **Metrics**: Response time, tool usage, escalation rates
- **Analytics**: Customer satisfaction and conversation patterns

### 🔄 Multi-LLM Support
Flexible LLM provider switching:
- **Groq**: Fast, cost-effective production
- **Claude**: High-quality reasoning
- **Google Gemini**: Advanced capabilities
- **Local models**: Ollama integration
- **Cerebras**: High-performance inference

---

## �� Integrating with Your Shop

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
// data.reply           → show this to the customer
// data.session_id      → save this for the next message
// data.escalated      → if true, notify a human agent
// data.products       → product cards for UI display
// data.quick_replies  → array of button labels
// data.form           → dynamic form object (if needed)
// data.sources        → ['Products', 'Faqs', 'Policies']
```

---

## 🛠️ Updating Your Data

Whenever you add new products, FAQs, or update policies:

1. Call the ingest endpoint:
```bash
curl -X POST https://your-agent.onrender.com/ingest \
  -d '{"collection": "products"}'
```
