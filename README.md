# IDR AI Chatbot 🤖✨

An enterprise-grade, highly scalable AI Chatbot application featuring a fully interactive 3D animated character (Vivi). Built with a modern **React + Vite** frontend and a robust **Node.js + Express** modular monolith backend.

## 🌟 Key Features

- **Interactive 3D Avatar**: Real-time responsive 3D character using `@react-three/fiber` and `@react-three/drei` with procedural eye-blink animations and idle movements.
- **Enterprise-Grade AI Backend**: Features an advanced abstraction layer for multiple AI models (Gemini, OpenAI, Local LLaMA) with seamless failovers.
- **RAG & Memory Systems**: Integrated short-term context injection and long-term memory processing using BullMQ and Redis for continuous summarization.
- **Scalable Architecture**: Microservices-oriented monolith architecture designed for horizontal scaling, robust security (JWT, RBAC), and streaming responses (SSE).
- **Beautiful UI**: Highly responsive, premium aesthetic designed with **Tailwind CSS 4**, featuring glassmorphism and Framer Motion micro-animations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Framer Motion
- **3D Rendering**: Three.js + React Three Fiber / Drei
- **Markdown**: React Markdown + Remark GFM

### Backend
- **Framework**: Node.js + Express 5
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Generative AI (`@google/generative-ai`)
- **Security**: CORS, Dotenv
- **Architecture**: Modular Monolith, Domain-Driven Design

## 📂 Project Structure

```text
AiChatbot/
├── backend/                  # Node.js Express Backend
│   ├── src/
│   │   ├── config/           # Environment and DB Configurations
│   │   ├── database/         # MongoDB Connections
│   │   ├── models/           # Mongoose Schemas (Chat, User, etc.)
│   │   ├── modules/          # Domain-driven modules (chats, users, etc.)
│   │   ├── server.js         # HTTP Server Entry Point
│   │   └── app.js            # Express App Configuration
│   └── package.json
├── frontend/                 # React + Vite Frontend
│   ├── public/               # Static assets (3D Models, Icons)
│   ├── src/
│   │   ├── components/       # Reusable React components (ChatWindow, Sidebar, etc.)
│   │   ├── assets/           # Images, SVGs
│   │   ├── App.jsx           # Main Application layout
│   │   └── main.jsx          # React DOM render point
│   ├── vite.config.js
│   └── package.json
└── architecture.md           # Detailed Enterprise Architecture Documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local or Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Indrajitpadhiyar/ChatBot.git
   cd ChatBot
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend/` directory:*
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *Start the backend server:*
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   *Start the frontend development server:*
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application in action!

## 🧠 System Architecture

The application is built heavily inspired by production systems like ChatGPT. It features:
- **Provider Abstraction & Fallback**: Never hardcode API calls. Routes through a `ModelManager` to easily switch between Gemini, GPT-4, and Local models.
- **RAG (Retrieval-Augmented Generation)**: Designed to support background workers mapping PDFs/knowledge bases into a Vector Database.
- **Streaming Responses**: Core infrastructure set up to support real-time token streaming to the frontend to ensure perceived high performance.

For a deep dive into the backend architecture, please refer to the [`architecture.md`](./architecture.md) file.
