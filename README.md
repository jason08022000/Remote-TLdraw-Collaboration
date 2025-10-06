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

### 7. Run Python Transcript Service (Optional)

Refer to https://github.com/naruto716/705py for details on the transcript generation service.

---

## 💻 System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Node.js**: v18.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free disk space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **Internet**: Stable broadband connection (5 Mbps minimum for video calls)

### Development Tools
- **pnpm**: v9.0.0 or higher (installed via corepack)
- **Git**: v2.30.0 or higher
- **Text Editor**: VS Code, WebStorm, or any modern code editor
- **Terminal**: Bash, Zsh, or PowerShell

### External Services (API Keys Required)
- **OpenAI API**: For AI-powered diagram generation
- **Liveblocks**: For real-time collaboration features
- **Stream**: For video calling functionality
- **Cloudflare Account**: For Durable Objects (optional for deployment)

---

## 🎯 General Functionality

### Core Features

#### 1. **Real-time Collaborative Whiteboard**
- Multiple users can join the same room and draw simultaneously
- Live cursor tracking shows where other users are working
- Changes sync in real-time across all connected clients
- Conflict resolution handled automatically by Yjs CRDT

#### 2. **AI-Powered Diagram Generation**
- **Text-to-Diagram**: Describe a diagram in natural language, and AI generates it
- **Smart Shapes**: AI understands context (ER diagrams, flowcharts, UML, etc.)
- **Iterative Refinement**: Ask AI to modify existing diagrams

#### 3. **Sample Diagram Templates**
Pre-built professional diagrams:
- **Entity-Relationship Diagrams**: User system, Product catalog, Order management, Blog platform
- **Flowcharts**: Process flows, decision trees
- **System Architecture**: Cloud infrastructure, microservices
- One-click insertion with proper styling and connections

#### 4. **Video Calling & Communication**
- Built-in HD video conferencing
- Screen sharing capabilities
- Real-time audio/video streaming via Stream SDK
- Participant management (mute, video toggle)
- Works seamlessly while collaborating on the whiteboard

#### 5. **Drawing & Editing Tools**
- **Shape Tools**: Rectangle, circle, arrow, line, text, sticky notes
- **Freehand Drawing**: Pen tool with pressure sensitivity
- **Text Editing**: Rich text with formatting options
- **Styling**: Colors, stroke width, fill patterns, transparency
- **Selection & Manipulation**: Move, resize, rotate, group, align
- **Layers**: Z-index management for overlapping elements

#### 6. **Persistent Storage**
- Automatic saving of all changes
- Cloudflare Durable Objects for state persistence
- Session recovery on disconnect/reconnect
- Cross-device synchronization

---

## 📊 Implementation vs Original Plan

### What Was Implemented Successfully ✅

1. **Real-time Collaboration** 
   - Fully implemented using Liveblocks + Yjs
   - Multi-user cursor tracking works perfectly
   - Conflict-free replicated data types (CRDT) for consistency

2. **AI Integration**
   - Custom prompt engineering for shape descriptions
   - Streaming responses for better UX
   - Transform system for coordinate simplification

3. **Video Calling**
   - Stream Video SDK integrated successfully
   - HD video and audio working
   - Screen sharing enabled

4. **Sample Diagrams**
   - Multiple professional templates created
   - One-click insertion working
   - Proper styling and positioning

5. **Frontend Architecture**
   - React + Vite setup complete
   - Chakra UI for modern interface
   - TLDraw SDK integration successful

### Differences from Original Plan 🔄

#### 1. **Deployment Strategy**
- **Original Plan**: Deploy all services to Cloudflare Workers
- **Current Implementation**: 
  - ✅ Cloudflare Workers for AI processing (working locally)
  - ⚠️ Cloudflare Workers.dev SSL issues prevented production deployment
  - ✅ Vercel deployment for backend token service (alternative solution)
  - **Reason**: Cloudflare workers.dev subdomain had SSL certificate issues that blocked HTTPS access. Vercel was used as a more reliable alternative for the backend API.

#### 2. **Backend Service Architecture**
- **Original Plan**: Single Cloudflare Worker handling all backend logic
- **Current Implementation**: 
  - Cloudflare Worker for AI processing and Durable Objects
  - Separate Node.js/Express service on Vercel for token generation
  - **Reason**: Better separation of concerns and easier debugging. Token generation doesn't require Durable Objects, so it was separated.

#### 3. **Durable Objects Usage**
- **Original Plan**: Use for both collaboration and AI state
- **Current Implementation**: 
  - ✅ Durable Objects set up for TLDraw and AI
  - ⚠️ Only accessible in local development mode due to deployment issues
  - Alternative: Liveblocks handles collaboration state successfully
  - **Reason**: Cloudflare deployment SSL issues; Liveblocks provides a robust alternative for real-time collaboration

#### 4. **Environment Configuration**
- **Original Plan**: Simple .env file configuration
- **Current Implementation**: 
  - Multiple environment files (.env, .dev.vars)
  - Different configs for local vs production
  - Separate configurations for Vercel and Cloudflare
  - **Reason**: Different platforms require different environment variable handling

### Known Limitations ⚠️

1. **Cloudflare Workers Production Deployment**
   - SSL/TLS handshake failures on workers.dev subdomain
   - Works perfectly in local development mode
   - Would work with custom domain (not configured)

2. **Durable Objects**
   - SQLite in Durable Objects only supported in local mode
   - Production deployment would require custom domain setup

3. **Video Calling Scalability**
   - Stream API has rate limits on free tier
   - Multiple simultaneous video calls may hit API limits

4. **AI Generation Limits**
   - OpenAI API rate limits apply
   - Complex diagrams may take 5-10 seconds to generate
   - Very large diagrams (50+ shapes) may fail

### Recommended Production Setup 🚀

For a production deployment, we recommend:

1. **Frontend**: Deploy to Vercel or Netlify
2. **Backend API**: Deploy to Vercel (token service)
3. **AI Worker**: 
   - Option A: Deploy to Cloudflare with custom domain (recommended)
   - Option B: Refactor to serverless functions on Vercel
4. **Real-time Collaboration**: Continue using Liveblocks (handles everything)
5. **Video**: Stream SDK (already working)

---

## 🎨 Using the Application

### Basic Drawing
1. Use the toolbar to select drawing tools
2. Draw shapes, add text, and create diagrams
3. Changes sync in real-time with other users

### AI Diagram Generation
1. Click the **AI Generate** button
2. Enter a prompt (e.g., "Create an ER diagram for a blog system")
3. The AI will generate shapes and diagrams based on your prompt
4. Modify the prompt to refine the diagram

### Sample Diagrams
1. Click the **Sample Diagrams** menu
2. Choose from pre-built templates:
   - ER Diagrams (User, Product, Order, Blog systems)
   - Flowcharts
   - Architecture diagrams
3. Diagram is inserted instantly

### Video Calling
1. Enter your name in the username field
2. Click the video icon to start a call
3. Other users in the room can join the call
4. Toggle video/audio as needed

### Real-time Collaboration
1. Share the room URL with others
2. Multiple users can edit simultaneously
3. See live cursors and selections from other users
4. All changes are automatically saved

---

## 🔧 Development Commands

### Root Directory
```bash
pnpm install          # Install all dependencies
pnpm run dev          # Start all development servers
pnpm run build        # Build all packages
pnpm run clean        # Clean build artifacts
```

### Example Directory (Frontend + Worker)
```bash
cd example
pnpm build            # Build frontend and worker
pnpm wrangler dev --local --port 8787    # Run worker locally
pnpm vite dev         # Run frontend dev server
```

### Backend Directory (Token Service)
```bash
cd backend
pnpm run dev          # Run with hot reload
pnpm run build        # Build TypeScript
pnpm start            # Run production build
pnpm run type-check   # Type checking only
```

---

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
- For production, use a custom domain instead of workers.dev

### Missing Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript declarations
pnpm run types
pnpm run build
```

### TLDraw Version Conflicts
If you see warnings about multiple tldraw versions:
```bash
# Clean install to resolve version conflicts
rm -rf node_modules
pnpm install --force
```

### Environment Variables Not Loading
- Make sure `.env` files are in the correct directories
- Verify variable names match exactly (case-sensitive)
- Restart development servers after changing .env files

---

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

---

## 🤝 API Endpoints

### Backend Token Service (Vercel)
- `POST /api/tokens` - Generate Stream video token
  - Request: `{ "userId": "user123" }`
  - Response: `{ "apiKey": "...", "token": "...", "userId": "..." }`
- `GET /api/health` - Health check
- `POST /api/liveblocks/auth` - Liveblocks authentication

### Cloudflare Worker (Local)
- `/api/generate` - AI diagram generation
- `/api/stream` - Streaming AI responses

---

## 📚 Additional Documentation

- [TLDraw AI Module Guide](./package/README.md)
- [Compound Diagrams Guide](./COMPOUND_DIAGRAMS_GUIDE.md)
- [OpenAI Integration](./example/worker/do/openai/README.md)
- [Collaboration Features](./example/client/features/collaboration/README.md)

---

## 🔑 Getting API Keys

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

---

## 🏗️ Architecture Overview

### Data Flow
1. **User draws** → TLDraw editor
2. **Changes** → Yjs document
3. **Sync** → Liveblocks (real-time)
4. **Persist** → Cloudflare Durable Objects (local mode)

### AI Integration Flow
1. **User prompt** → Frontend
2. **Process** → Cloudflare Worker
3. **Generate** → OpenAI API
4. **Transform** → Simplified coordinates
5. **Render** → TLDraw shapes

### Video Call Flow
1. **User joins** → Request token from backend
2. **Authenticate** → Stream SDK with JWT token
3. **Connect** → WebRTC peer-to-peer connection
4. **Stream** → Real-time audio/video

---

## 📄 License

This project is provided under the MIT license. See [LICENSE.md](LICENSE.md) for details.

The tldraw SDK is provided under the [tldraw license](https://github.com/tldraw/tldraw/blob/main/LICENSE.md).

---

## 🙏 Acknowledgments

- Built with [TLDraw](https://tldraw.dev)
- AI module based on [@tldraw/ai](https://www.npmjs.com/package/@tldraw/ai)
- Real-time collaboration powered by [Liveblocks](https://liveblocks.io/)
- Video calling powered by [Stream](https://getstream.io/)
- Deployment infrastructure: [Cloudflare Workers](https://workers.cloudflare.com/) & [Vercel](https://vercel.com)

---

## 📞 Support

- [TLDraw Discord](https://discord.gg/9PSF2C5KgV)
- [TLDraw Documentation](https://tldraw.dev)
- [Liveblocks Docs](https://liveblocks.io/docs)
- [Stream Video SDK Docs](https://getstream.io/video/docs/)

---

## 🔗 Related Links

- [TLDraw GitHub](https://github.com/tldraw/tldraw)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Python Transcript Service](https://github.com/naruto716/705py)