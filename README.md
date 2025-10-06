# Remote TLDraw Collaboration

A real-time collaborative whiteboard application built with TLDraw, featuring AI-powered diagram generation, video calling, and multi-user collaboration.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can draw and edit simultaneously using Liveblocks and Yjs
- **AI-Powered Diagrams**: Generate diagrams and shapes using OpenAI integration
- **Video Calling**: Built-in video chat powered by Stream Video SDK
- **Persistent Storage**: Cloudflare Durable Objects for state management
- **Sample Diagrams**: Pre-built templates for ER diagrams, flowcharts, and more

## 📁 Project Structure

This is a monorepo with multiple components:

```
Remote-TLdraw-Collaboration/
├── example/
│   ├── client/          # Frontend React/Vite app
│   ├── worker/          # Cloudflare Worker (AI & Durable Objects)
│   └── wrangler.toml    # Cloudflare Worker configuration
├── backend/             # Node.js token service (Stream/Liveblocks)
├── package/             # TLDraw AI module package
└── my-whiteboard/       # Next.js alternative implementation
```

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TLDraw, Chakra UI
- **Backend**: 
  - Cloudflare Workers (AI processing)
  - Cloudflare Durable Objects (state management)
  - Node.js/Express (token service)
- **Real-time**: Liveblocks, Yjs
- **Video**: Stream Video SDK
- **Package Manager**: pnpm

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** (v9 or higher)
- **Git**
- API Keys for:
  - [OpenAI](https://platform.openai.com/api-keys)
  - [Liveblocks](https://liveblocks.io/)
  - [Stream](https://getstream.io/)

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Remote-TLdraw-Collaboration.git
cd Remote-TLdraw-Collaboration
```

### 2. Enable Corepack (for pnpm)

```bash
corepack enable
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Configure Environment Variables

#### **A. Frontend Environment** (Optional)

Create `/example/.env` for public API keys:

```bash
# example/.env
VITE_LIVEBLOCKS_PUBLIC_KEY=pk_dev_xxxxxxxxxxxxx
```

#### **B. Cloudflare Worker Environment** (Required)

Create `/example/.dev.vars`:

```bash
# example/.dev.vars
OPENAI_API_KEY=sk-proj-your-openai-key-here
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-secret-key
LIVEBLOCKS_SECRET_KEY=sk_dev_xxxxxxxxxxxxx
NODE_ENV=development
PORT=3001
```

#### **C. Backend Token Service** (Required)

Create `/backend/.env`:

```bash
# backend/.env
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-secret-key
LIVEBLOCKS_SECRET_KEY=sk_dev_xxxxxxxxxxxxx
NODE_ENV=development
PORT=3001
```

### 5. Start Development Servers

#### **Option 1: Start Everything Together** (Recommended)

From the root directory:

```bash
pnpm run dev
```

This will start:
- Frontend (Vite) at `http://localhost:5173`
- Cloudflare Worker (local) at `http://localhost:8787`

#### **Option 2: Start Services Individually**

**Terminal 1 - Cloudflare Worker:**
```bash
cd example
pnpm wrangler dev --local --port 8787
```

**Terminal 2 - Frontend:**
```bash
cd example
pnpm vite dev
```

**Terminal 3 - Backend Token Service:**
```bash
cd backend
pnpm run dev
```

### 6. Open the Application

Navigate to **http://localhost:5173** in your browser.

### 7. Run Python Transcript Service

Refer to https://github.com/naruto716/705py for details