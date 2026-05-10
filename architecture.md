# Enterprise AI Backend Architecture for "IDR AI"

As a senior AI backend architect, I have designed this architecture to transform your current Express/MongoDB setup into a highly scalable, production-ready AI SaaS application. This structure is heavily inspired by systems like ChatGPT, focusing on separation of concerns, scalability, fault tolerance, and modularity.

---

## 1. High-Level System Architecture

The architecture utilizes a **Microservices-oriented Monolith** approach (often called a Modular Monolith) built on Node.js, combined with dedicated external services (Python/FastAPI) for heavy AI processing.

### Request Flow
1. **Client Request**: Frontend sends a request via HTTPS to an API Gateway / Load Balancer (Nginx/AWS ALB).
2. **Security Layer**: Request hits rate limiters, WAF, and Helmet.
3. **API Gateway / Router**: Request is routed to specific module controllers.
4. **Auth Middleware**: JWT validation, RBAC checks.
5. **Controller Layer**: Validates input (Zod/Joi) and calls the Service Layer.
6. **Service Layer**: Core business logic. If it's a chat request, the AI Service coordinates:
   - **Memory Service**: Retrieves past context and summaries.
   - **RAG Service**: Fetches relevant vectors from the DB (Pinecone/Milvus/MongoDB Atlas Vector Search).
   - **Provider Layer**: Abstracts the model (Gemini, OpenAI, Local).
7. **Streaming Response**: Chunks are streamed back via Server-Sent Events (SSE) or WebSockets.
8. **Background Jobs (BullMQ)**: Asynchronous tasks like summarizing the chat, generating embeddings, and updating logs are pushed to Redis queues.

---

## 2. Advanced Folder Structure

This structure separates concerns using a module-based domain-driven design.

```text
backend/
├── src/
│   ├── config/              # Environment vars, DB config, Redis config
│   ├── database/            # Mongoose connections, connection pooling
│   │   └── models/          # Mongoose Schemas (User, Chat, Message, Memory, File, etc.)
│   ├── modules/             # Domain-driven modules
│   │   ├── auth/            # Auth controller, service, routes
│   │   ├── users/           # User management
│   │   ├── chats/           # Chat management, message histories
│   │   ├── files/           # File upload and processing
│   │   └── admin/           # Admin dashboards and analytics
│   ├── ai/                  # Core AI Brain
│   │   ├── providers/       # Abstraction layer (Gemini, OpenAI, Ollama)
│   │   ├── orchestrator/    # Decides which model/tool to use (Fallback system)
│   │   ├── memory/          # Short-term and Long-term context injection
│   │   ├── prompts/         # System prompts, prompt templates
│   │   └── streaming/       # SSE and WebSocket streaming handlers
│   ├── rag/                 # Retrieval-Augmented Generation
│   │   ├── embeddings/      # Embedding generation services
│   │   ├── vector_db/       # Pinecone/Qdrant/Mongo Vector connections
│   │   └── semantic/        # Semantic search logic
│   ├── tools/               # AI Agents & Function Calling
│   │   ├── web_search/      # DuckDuckGo/Tavily API integration
│   │   ├── code_executor/   # Secure sandbox execution
│   │   └── api_tools/       # Webhooks and external API handlers
│   ├── services/            # Cross-domain services
│   │   ├── python_bridge/   # FastAPI connection (Axios/gRPC)
│   │   ├── cache/           # Redis caching logic
│   │   └── s3_storage/      # AWS S3 / Cloudinary integration
│   ├── queues/              # BullMQ queue workers and producers
│   │   ├── jobs/            # Job definitions (e.g., summarize_chat.js)
│   │   └── workers/         # Background processing logic
│   ├── middleware/          # Express middlewares
│   │   ├── auth.js          # JWT Verification
│   │   ├── rbac.js          # Role Based Access Control
│   │   ├── rateLimiter.js   # Redis-based rate limiting
│   │   ├── sanitizer.js     # Prompt injection protection & Input validation
│   │   └── errorHandler.js  # Global error handling
│   ├── utils/               # Helpers, formatters, constants
│   ├── sockets/             # Socket.io configuration for real-time alerts
│   ├── logs/                # Winston logger configurations & Error Tracking
│   ├── app.js               # Express setup, middleware injection
│   └── server.js            # Entry point, HTTP server, Graceful shutdown
├── tests/                   # Jest/Mocha tests (Unit & E2E)
├── docker-compose.yml       # Local dev setup (Mongo, Redis, Node, Python)
├── Dockerfile               # Production build
└── .env                     # Environment variables
```

---

## 3. Core Architectural Components

### 3.1 Authentication & Security (The Gatekeeper)
- **JWT & Sessions**: Use Short-lived Access Tokens (15 mins) and Long-lived Refresh Tokens (7 days) stored in HTTP-only, secure cookies.
- **RBAC**: Define roles (`FREE_USER`, `PRO_USER`, `ADMIN`). Rate limits, model access (e.g., Gemini Flash vs Gemini Pro), and tool access depend on these roles.
- **Security**: 
  - `helmet` for HTTP headers.
  - `express-rate-limit` backed by Redis to prevent DDoS and abuse.
  - Custom middleware for prompt injection detection (Regex/LLM-based filtering before sending to the main model).
  - Strict CORS policies.

### 3.2 AI Models Layer (Provider Abstraction & Fallback)
Never hardcode API calls directly in controllers. Use an abstraction layer.
```javascript
// Example: src/ai/providers/ModelManager.js
class ModelManager {
  async generateStream(prompt, modelId, context) {
    try {
      if (modelId === 'gemini-pro') return await GeminiProvider.generate(prompt, context);
      if (modelId === 'openai-gpt4') return await OpenAIProvider.generate(prompt, context);
      if (modelId === 'local-llama') return await OllamaProvider.generate(prompt, context);
    } catch (error) {
      if (error.status === 429) {
        // AI Fallback System: If primary model is rate-limited, failover seamlessly
        return await FallbackProvider.generate(prompt, context); 
      }
      throw error;
    }
  }
}
```

### 3.3 AI Memory System
To avoid exceeding token limits and reduce costs:
1. **Short-Term Memory**: The last 10-15 messages are passed directly in the conversation array.
2. **Long-Term Memory**: Older messages are pushed to a background queue (`BullMQ`) where a cheaper, faster model (like Gemini Flash Lite) generates a rolling summary. This summary is continuously injected into the System Prompt.
3. **Personalization**: Extract user preferences (e.g., "I am a React developer from New York") using a background NLP pipeline and save them to a user-specific Vector DB namespace for smart context injection.

### 3.4 Tool Calling & Agents
When the user asks "What's the weather?" or "Run this code":
- The orchestrator utilizes the LLM's Native Function Calling capabilities.
- It parses the requested tool, executes it inside the `src/tools/` sandbox, and feeds the result back into the AI to generate the final human-readable response.

### 3.5 RAG (Retrieval-Augmented Generation) & Files
- **Upload Pipeline**: User uploads PDF -> Uploads to S3/Cloudinary -> Job pushed to Redis Queue.
- **Processing Worker**: Background worker downloads file -> Extracts text -> Chunks text -> Calls Embedding Model (e.g. text-embedding-3) -> Stores in Vector DB (MongoDB Atlas Vector Search).
- **Chat Flow**: User asks a question -> Query is embedded -> Vector DB queried for top 5 chunks -> Chunks injected as context into the prompt.

### 3.6 Python Service Integration
For heavy AI tasks (image generation, complex data science, specialized local HuggingFace models), Node.js is not ideal.
- Deploy a separate **FastAPI Microservice**.
- Node.js communicates with Python via a dedicated internal REST API or gRPC (`src/services/python_bridge/`).
- Use message queues (Redis) to pass long-running tasks to Python without blocking Node.js.

### 3.7 Queues & Background Jobs (Redis + BullMQ)
Crucial for scaling. You cannot block the HTTP request thread with heavy tasks.
- **Queues**: `memory-summarization`, `document-indexing`, `email-notifications`, `ai-tasks`.
- **Workers**: Separate Node.js processes (or Docker containers) that pull from these queues and execute them safely.

---

## 4. API Architecture Design (RESTful)

```text
/api/v1/auth
  POST /register, /login, /refresh, /logout
  
/api/v1/users
  GET /me            -> Get profile
  PUT /preferences   -> Update AI personalization settings

/api/v1/chats
  POST /             -> Create new session
  GET /              -> List user sessions (paginated)
  GET /:id           -> Get full chat history & memory context
  POST /:id/message  -> Send message (Streams SSE response)
  DELETE /:id

/api/v1/models
  GET /              -> List available models based on user role (Dynamic Model Manager)

/api/v1/files
  POST /upload       -> Returns file ID, queues indexing
  GET /:id/status    -> Check indexing status (Processing, Completed, Failed)
  GET /            -> List user's uploaded knowledge base

/api/v1/admin
  GET /stats         -> Token usage, active users, AI tools logs (Role: ADMIN only)
```

---

## 5. Database Architecture (MongoDB Collections)

1. **Users**: Identifiers, hashed passwords, roles, subscription status, token balance.
2. **Chats**: `_id`, `userId`, `title`, `systemContext`, `summary` (for long-term memory).
3. **Messages**: `_id`, `chatId`, `role` (user/ai/system/tool), `content`, `tokensUsed`, `createdAt`. *(Separating Messages from Chats allows infinite scaling without hitting the 16MB MongoDB document limit).*
4. **MemoryContexts**: Extracted facts and personalized details mapped to a specific `userId`.
5. **Files**: `_id`, `userId`, `filename`, `url`, `status` (processing/indexed/failed).
6. **UsageLogs**: Daily token consumption, tool usage, and execution times per user for rate-limiting and billing.

---

## 6. Production & Scaling Strategy

1. **Dockerization**: The app is split into multiple containers via `docker-compose`: 
   - `api-server` (Node.js REST API)
   - `worker-node` (Node.js running BullMQ workers)
   - `python-ai-service` (FastAPI)
   - `redis` (Cache & Queues)
2. **Horizontal Scaling**: Because authentication uses JWTs and queues use Redis, the Node.js `api-server` is entirely **stateless**. You can spin up 10 instances of `api-server` behind an AWS Application Load Balancer / Kubernetes as traffic grows.
3. **Load Balancing**: Distribute incoming AI chat requests evenly across all running instances.
4. **Graceful Shutdown**: Intercept `SIGTERM` signals to close DB connections and finish active API requests before the server shuts down, ensuring zero downtime deployments.

---

## 7. Coding Standards & Best Practices
- **MVC + Services**: Controllers only handle HTTP (req/res). Business logic lives strictly in Services (`src/modules/chats/chat.service.js`).
- **Dependency Injection**: Pass configs/DB connections to services rather than hardcoding them, making unit testing easy.
- **Async/Await & Error Handling**: Never use raw `.catch()`. Wrap controllers in an `express-async-handler` to pass errors to the global error middleware automatically.
- **Streaming**: For perceived performance, AI responses MUST be streamed. Use Server-Sent Events (SSE) using `res.write()` in Node.js so the user sees text immediately.
