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
- **AI**: OpenAI API
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

## 🎯 Using the Application

### Basic Drawing
- Use the toolbar to select drawing tools
- Draw shapes, add text, and create diagrams
- Changes sync in real-time with other users

### AI Diagram Generation
1. Click the **AI Generate** button
2. Enter a prompt (e.g., "Create an ER diagram for a blog system")
3. The AI will generate shapes and diagrams based on your prompt

### Sample Diagrams
- Click the **Sample Diagrams** menu
- Choose from pre-built templates:
  - ER Diagrams (User, Product, Order, Blog systems)
  - Flowcharts
  - Architecture diagrams

### Video Calling
1. Enter your name in the username field
2. Click the video icon to start a call
3. Other users in the room can join the call

### Real-time Collaboration
1. Share the room URL with others
2. Multiple users can edit simultaneously
3. See live cursors and selections from other users

## 🔧 Development Commands

### Root Directory
```bash
pnpm install          # Install all dependencies
pnpm run dev          # Start all development servers
pnpm run build        # Build all packages
```

### Example Directory (Frontend + Worker)
```bash
cd example
pnpm build            # Build frontend and worker
pnpm wrangler dev     # Run worker locally
pnpm vite dev         # Run frontend dev server
```

### Backend Directory (Token Service)
```bash
cd backend
pnpm run dev          # Run with hot reload
pnpm run build        # Build TypeScript
pnpm start            # Run production build
```

## 🐛 Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
```bash
# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 8787 (worker)
lsof -ti:8787 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### Cloudflare Worker SSL Issues
If you encounter SSL errors when deploying to Cloudflare Workers:
- Use local development mode: `pnpm wrangler dev --local`
- This runs the worker locally without SSL complications

### Missing Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript declarations
pnpm run types
```

## 📦 Building for Production

### Build Frontend and Worker
```bash
cd example
pnpm build
```

### Build Backend
```bash
cd backend
pnpm run build
```

### Deploy to Cloudflare (Worker)
```bash
cd example
pnpm wrangler deploy
```

**Note**: You may encounter SSL issues with workers.dev subdomain. For production, consider:
- Using a custom domain
- Deploying the frontend to Vercel/Netlify
- Keeping the worker for API endpoints only

## 🤝 API Endpoints

### Backend Token Service
- `POST /api/tokens` - Generate Stream video token
- `GET /api/health` - Health check
- `POST /api/liveblocks-auth` - Liveblocks authentication

### Cloudflare Worker
- `/api/generate` - AI diagram generation
- `/api/stream` - Streaming AI responses

## 📚 Additional Documentation

- [TLDraw AI Module Guide](./package/README.md)
- [Compound Diagrams Guide](./COMPOUND_DIAGRAMS_GUIDE.md)
- [OpenAI Integration](./example/worker/do/openai/README.md)
- [Collaboration Features](./example/client/features/collaboration/README.md)

## 🔑 Getting API Keys

### OpenAI
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `/example/.dev.vars`

### Liveblocks
1. Sign up at https://liveblocks.io/
2. Create a new project
3. Get your secret key from the dashboard
4. Add to `/example/.dev.vars` and `/backend/.env`

### Stream
1. Sign up at https://getstream.io/
2. Create a new app
3. Get API key and secret from dashboard
4. Add to `/example/.dev.vars` and `/backend/.env`

## 🏗️ Architecture

### Data Flow
1. **User draws** → TLDraw editor
2. **Changes** → Yjs document
3. **Sync** → Liveblocks (real-time)
4. **Persist** → Cloudflare Durable Objects

### AI Integration
1. **User prompt** → Frontend
2. **Process** → Cloudflare Worker
3. **Generate** → OpenAI API
4. **Transform** → Simplified coordinates
5. **Render** → TLDraw shapes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is provided under the MIT license. See [LICENSE.md](LICENSE.md) for details.

The tldraw SDK is provided under the [tldraw license](https://github.com/tldraw/tldraw/blob/main/LICENSE.md).

## 🙏 Acknowledgments

- Built with [TLDraw](https://tldraw.dev)
- AI module based on [@tldraw/ai](https://www.npmjs.com/package/@tldraw/ai)
- Real-time collaboration powered by [Liveblocks](https://liveblocks.io/)
- Video calling powered by [Stream](https://getstream.io/)

## 📞 Support

- [TLDraw Discord](https://discord.gg/9PSF2C5KgV)
- [TLDraw Documentation](https://tldraw.dev)

## 🔗 Links

- [TLDraw GitHub](https://github.com/tldraw/tldraw)
- [Liveblocks Docs](https://liveblocks.io/docs)
- [Stream Video SDK Docs](https://getstream.io/video/docs/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
