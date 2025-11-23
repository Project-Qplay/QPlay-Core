# 🎮 QPlay-Core: Quantum Physics Learning Game# 🎮 QPlay-Core: Quantum Physics Learning Game



**A modern, interactive quantum physics education platform built with React, TypeScript, and Netlify Functions****A modern, interactive quantum physics education platform built with React, TypeScript, and Netlify Functions**



------



## 📋 **Table of Contents**## 📋 **Table of Contents**



1. [Project Overview](#project-overview)1. [Project Overview](#project-overview)

2. [Architecture](#architecture)2. [Architecture](#architecture)

3. [Quick Start](#quick-start)3. [Quick Start](#quick-start)

4. [Project Structure](#project-structure)4. [Project Structure](#project-structure)

5. [Authentication Setup](#authentication-setup)5. [Authentication Setup](#authentication-setup)

6. [Development Workflow](#development-workflow)6. [Development Workflow](#development-workflow)

7. [Technical Details](#technical-details)7. [Technical Details](#technical-details)

8. [Troubleshooting](#troubleshooting)8. [Troubleshooting](#troubleshooting)

9. [Deployment](#deployment)9. [Deployment](#deployment)



------



## 🎯 **Project Overview**## 🎯 **Project Overview**



### **What is QPlay-Core?**### **What is QPlay-Core?**

An immersive quantum physics learning game that makes complex quantum mechanics concepts accessible through interactive 3D visualizations, gamified challenges, and real-time simulations.An immersive quantum physics learning game that makes complex quantum mechanics concepts accessible through interactive 3D visualizations, gamified challenges, and real-time simulations.



### **Key Features**### **Key Features**

- 🎮 **Interactive Quantum Rooms**: Superposition Tower, Entanglement Bridge, Tunneling Vault- 🎮 **Interactive Quantum Rooms**: Superposition Tower, Entanglement Bridge, Tunneling Vault

- 🔬 **Real Physics Simulations**: Accurate quantum mechanics calculations- 🔬 **Real Physics Simulations**: Accurate quantum mechanics calculations

- 🏆 **Gamification**: Achievements, leaderboards, progress tracking- 🏆 **Gamification**: Achievements, leaderboards, progress tracking

- 🔐 **Modern Authentication**: Supabase + Google OAuth integration- 🔐 **Modern Authentication**: Supabase + Google OAuth integration

- 📱 **Responsive Design**: Works on desktop, tablet, and mobile- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

- 🚀 **Serverless Backend**: Netlify Functions for scalability- 🚀 **Serverless Backend**: Netlify Functions for scalability



### **Technology Stack**### **Technology Stack**

- **Frontend**: React 18.3.1, TypeScript, Three.js, Vite- **Frontend**: React 18.3.1, TypeScript, Three.js, Vite

- **Backend**: Netlify Functions (serverless)- **Backend**: Netlify Functions (serverless)

- **Database**: Supabase (PostgreSQL)- **Database**: Supabase (PostgreSQL)

- **Authentication**: Supabase Auth + Google OAuth- **Authentication**: Supabase Auth + Google OAuth

- **Deployment**: Netlify Edge Functions- **Deployment**: Netlify Edge Functions

- **Styling**: Tailwind CSS- **Styling**: Tailwind CSS



------



## 🏗️ **Architecture**## 🏗️ **Architecture**



### **Monorepo Structure**### **Monorepo Structure**

``````

QPlay-Core/QPlay-Core/

├── 🎨 apps/web/              # Frontend React Application├── 🎨 apps/web/              # Frontend React Application

│   ├── src/│   ├── src/

│   │   ├── components/       # React UI components│   │   ├── components/       # React UI components

│   │   ├── contexts/         # React Context providers│   │   ├── contexts/         # React Context providers

│   │   ├── hooks/           # Custom React hooks│   │   ├── hooks/           # Custom React hooks

│   │   ├── services/        # API communication│   │   ├── services/        # API communication

│   │   ├── types/           # TypeScript definitions│   │   ├── types/           # TypeScript definitions

│   │   └── utils/           # Helper functions│   │   └── utils/           # Helper functions

│   ├── public/              # Static assets│   ├── public/              # Static assets

│   ├── dist/                # Build output (gitignored)│   ├── dist/                # Build output (gitignored)

│   └── package.json         # Frontend dependencies (300MB+ node_modules)│   └── package.json         # Frontend dependencies (300MB+ node_modules)

││

├── ⚡ netlify/functions/     # Serverless Backend├── ⚡ netlify/functions/     # Serverless Backend

│   ├── auth-google.js       # Google OAuth handler│   ├── auth-google.js       # Google OAuth handler

│   ├── auth-login.js        # User authentication│   ├── auth-login.js        # User authentication

│   ├── auth-signup.js       # User registration│   ├── auth-signup.js       # User registration

│   ├── achievements.js      # Achievement system│   ├── achievements.js      # Achievement system

│   ├── game-session.js      # Game state management│   ├── game-session.js      # Game state management

│   ├── leaderboard.js       # Score tracking│   ├── leaderboard.js       # Score tracking

│   ├── quantum-measurements.js # Physics calculations│   ├── quantum-measurements.js # Physics calculations

│   └── package.json         # Backend dependencies (10MB node_modules)│   └── package.json         # Backend dependencies (10MB node_modules)

││

├── 🔧 Configuration Files├── 🔧 Configuration Files

│   ├── .env                 # Environment variables│   ├── .env                 # Environment variables

│   ├── netlify.toml         # Netlify deployment config│   ├── netlify.toml         # Netlify deployment config

│   ├── package.json         # Root project scripts│   ├── package.json         # Root project scripts

│   ├── vite.config.ts       # Vite build configuration│   ├── vite.config.ts       # Vite build configuration

│   └── tailwind.config.js   # Styling configuration│   └── tailwind.config.js   # Styling configuration

``````



### **Data Flow Architecture**### **Data Flow Architecture**

``````

User Browser (localhost:8888)User Browser (localhost:8888)

         ↕️         ↕️

    React Frontend    React Frontend

         ↕️         ↕️

   Netlify Functions (serverless)   Netlify Functions (serverless)

         ↕️         ↕️

    Supabase Database    Supabase Database

         ↕️         ↕️

    Google OAuth API    Google OAuth API

``````



### **Why Monorepo + Two node_modules?**### **Why Monorepo + Two node_modules?**



**This is modern best practice for full-stack applications:****This is modern best practice for full-stack applications:**



1. **Frontend (`apps/web/node_modules/`)** - 300MB+1. **Frontend (`apps/web/node_modules/`)** - 300MB+

   - React ecosystem, Three.js, TypeScript, Vite   - React ecosystem, Three.js, TypeScript, Vite

   - Rich UI libraries and development tools   - Rich UI libraries and development tools

   - Complete build system dependencies   - Complete build system dependencies



2. **Backend (`netlify/functions/node_modules/`)** - 10MB2. **Backend (`netlify/functions/node_modules/`)** - 10MB

   - Minimal serverless runtime dependencies   - Minimal serverless runtime dependencies

   - Only Google OAuth library needed   - Only Google OAuth library needed

   - Optimized for cold starts   - Optimized for cold starts



**Benefits:****Benefits:**

- ✅ **Performance**: Faster cold starts for serverless functions- ✅ **Performance**: Faster cold starts for serverless functions

- ✅ **Maintainability**: Clear separation of concerns- ✅ **Maintainability**: Clear separation of concerns

- ✅ **Scalability**: Independent deployment and scaling- ✅ **Scalability**: Independent deployment and scaling

- ✅ **Development**: Isolated dependency management- ✅ **Development**: Isolated dependency management



------



## 🚀 **Quick Start**## 🚀 **Quick Start**



### **Prerequisites**### **Prerequisites**

- Node.js 18+ - Node.js 18+ 

- npm or yarn- npm or yarn

- Git- Git



### **Installation & Setup**### **Installation & Setup**

```powershell```powershell

# Clone the repository# Clone the repository

git clone https://github.com/Project-Qplay/QPlay-Core.gitgit clone https://github.com/Project-Qplay/QPlay-Core.git

cd QPlay-Corecd QPlay-Core



# Install all dependencies# Install all dependencies

npm run install:allnpm run install:all



# Start development server# Start development server

npm run devnpm run dev

``````



### **Access Your Application**### **Access Your Application**

Open your browser and navigate to: **http://localhost:8888**Open your browser and navigate to: **http://localhost:8888**



### **Available Scripts**### **Available Scripts**

```json```json

{{

  "dev": "netlify dev",                    # Start development server  "dev": "netlify dev",                    # Start development server

  "preview": "cd apps/web && npm run preview",  # Preview production build  "preview": "cd apps/web && npm run preview",  # Preview production build

  "install:all": "cd apps/web && npm install && cd ../../netlify/functions && npm install"  "install:all": "cd apps/web && npm install && cd ../../netlify/functions && npm install"

}}

``````



------



## 📁 **Detailed Project Structure**## 📁 **Detailed Project Structure**



### **Frontend Components (`apps/web/src/components/`)**### **Frontend Components (`apps/web/src/components/`)**

``````

components/components/

├── 3d/                      # Three.js 3D components├── 3d/                      # Three.js 3D components

│   ├── CatModel.tsx         # Schrödinger's cat visualization│   ├── CatModel.tsx         # Schrödinger's cat visualization

│   ├── LoadingScreen.tsx    # 3D loading animations│   ├── LoadingScreen.tsx    # 3D loading animations

│   ├── QuantumScene.tsx     # Main 3D quantum world│   ├── QuantumScene.tsx     # Main 3D quantum world

│   ├── QuantumTerminalLoader.tsx│   ├── QuantumTerminalLoader.tsx

│   └── Spaceship.tsx        # 3D spaceship model│   └── Spaceship.tsx        # 3D spaceship model

││

├── rooms/                   # Quantum physics rooms├── rooms/                   # Quantum physics rooms

│   ├── EntanglementBridge.tsx    # Quantum entanglement concepts│   ├── EntanglementBridge.tsx    # Quantum entanglement concepts

│   ├── ProbabilityBay.tsx        # Probability distributions│   ├── ProbabilityBay.tsx        # Probability distributions

│   ├── QuantumArchive.tsx        # Historical quantum experiments│   ├── QuantumArchive.tsx        # Historical quantum experiments

│   ├── StateChambrer.tsx         # Quantum state manipulation│   ├── StateChambrer.tsx         # Quantum state manipulation

│   ├── SuperpositionTower.tsx    # Superposition principles│   ├── SuperpositionTower.tsx    # Superposition principles

│   └── TunnelingVault.tsx        # Quantum tunneling effects│   └── TunnelingVault.tsx        # Quantum tunneling effects

││

├── auth/                    # Authentication components├── auth/                    # Authentication components

│   └── AuthModal.tsx        # Login/signup modal│   └── AuthModal.tsx        # Login/signup modal

││

├── achievements/            # Gamification├── achievements/            # Gamification

│   └── Achievements.tsx     # Achievement system UI│   └── Achievements.tsx     # Achievement system UI

││

├── ui/                      # Reusable UI components├── ui/                      # Reusable UI components

│   ├── Button.tsx           # Custom button component│   ├── Button.tsx           # Custom button component

│   ├── PortalTransition.tsx # Portal animation effects│   ├── PortalTransition.tsx # Portal animation effects

│   └── ThemeProvider.tsx    # Theme management│   └── ThemeProvider.tsx    # Theme management

││

└── Core Components└── Core Components

    ├── GameController.tsx   # Main game logic controller    ├── GameController.tsx   # Main game logic controller

    ├── MainMenu.tsx         # Main navigation menu    ├── MainMenu.tsx         # Main navigation menu

    ├── QuantumGuide.tsx     # Interactive tutorials    ├── QuantumGuide.tsx     # Interactive tutorials

    ├── Settings.tsx         # Application settings    ├── Settings.tsx         # Application settings

    └── Leaderboard.tsx      # Score display    └── Leaderboard.tsx      # Score display

``````



---### **Context Providers (`apps/web/src/contexts/`)**

```

## 🔐 **Authentication Setup**contexts/

├── AuthContext.tsx          # User authentication state

### **Environment Variables (`.env`)**├── GameContext.tsx          # Game state management

```env├── LoadingContext.tsx       # Loading state management

# Supabase Configuration└── SettingsContext.tsx      # User preferences

SUPABASE_URL=https://ylahofxrvdhqkjmsolin.supabase.co```

SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_KEY=your_supabase_service_key### **Backend Functions (`netlify/functions/`)**

```

# Google OAuth Configuration  functions/

GOOGLE_CLIENT_ID=your_google_client_id├── auth-google.js           # Google OAuth flow handler

├── auth-login.js            # User login validation

# Vite Frontend Variables├── auth-signup.js           # User registration processing

VITE_SUPABASE_URL=https://ylahofxrvdhqkjmsolin.supabase.co├── achievements.js          # Achievement CRUD operations

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key├── game-session.js          # Game state persistence

VITE_GOOGLE_CLIENT_ID=your_google_client_id├── leaderboard.js           # Score tracking and rankings

└── quantum-measurements.js  # Physics calculations and simulations

# Node Configuration```

NODE_VERSION=18

```---



### **Google Cloud Console Setup**## 🔐 **Authentication Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Navigate to APIs & Credentials → OAuth 2.0 Client IDs### **Environment Variables (`.env`)**

3. Edit your OAuth client and add:```env

# Supabase Configuration

**Authorized JavaScript Origins:**SUPABASE_URL=https://ylahofxrvdhqkjmsolin.supabase.co

```SUPABASE_ANON_KEY=your_supabase_anon_key

http://localhost:8888SUPABASE_SERVICE_KEY=your_supabase_service_key

https://your-production-domain.netlify.app

```# Google OAuth Configuration  

GOOGLE_CLIENT_ID=your_google_client_id

**Authorized Redirect URIs:**

```# Vite Frontend Variables

http://localhost:8888/auth/callbackVITE_SUPABASE_URL=https://ylahofxrvdhqkjmsolin.supabase.co

http://localhost:8888/auth/google/callbackVITE_SUPABASE_ANON_KEY=your_supabase_anon_key

https://your-production-domain.netlify.app/auth/callbackVITE_GOOGLE_CLIENT_ID=your_google_client_id

```

# Node Configuration

### **Supabase Dashboard Setup**NODE_VERSION=18

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)```

2. Navigate to Authentication → URL Configuration

3. Configure:### **Google Cloud Console Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

**Site URL:** `http://localhost:8888` (development) / `https://your-domain.netlify.app` (production)2. Navigate to APIs & Credentials → OAuth 2.0 Client IDs

3. Edit your OAuth client and add:

**Redirect URLs:** `http://localhost:8888/**` (development) / `https://your-domain.netlify.app/**` (production)

**Authorized JavaScript Origins:**

---```

http://localhost:8888

## 💻 **Development Workflow**https://your-production-domain.netlify.app

```

### **Starting Development**

```powershell**Authorized Redirect URIs:**

# Navigate to project root```

Set-Location "c:\Users\Naren\Downloads\Q-RESEARCH\QPlay-Core"http://localhost:8888/auth/callback

http://localhost:8888/auth/google/callback

# Start development serverhttps://your-production-domain.netlify.app/auth/callback

npm run dev```

```

### **Supabase Dashboard Setup**

**What happens:**1. Go to [Supabase Dashboard](https://supabase.com/dashboard)

1. **Environment Loading**: All `.env` variables injected2. Navigate to Authentication → URL Configuration

2. **Static Server**: Frontend served from `apps/web/dist` on port 39993. Configure:

3. **Main Server**: Netlify dev server on port 8888

4. **Functions Loading**: All 7 serverless functions become available**Site URL:** `http://localhost:8888` (development) / `https://your-domain.netlify.app` (production)

5. **Hot Reload**: Changes automatically trigger rebuilds

**Redirect URLs:** `http://localhost:8888/**` (development) / `https://your-domain.netlify.app/**` (production)

### **Port Architecture**

- **Port 8888**: Main development server (your access point)---

- **Port 3999**: Internal static file server (background)

## 💻 **Development Workflow**

---

### **Starting Development**

## 🚀 **Deployment**```powershell

# Navigate to project root

### **Netlify Production Deployment**Set-Location "c:\Users\Naren\Downloads\Q-RESEARCH\QPlay-Core"



#### **Automatic Deployment (Recommended)**# Start development server

1. **Connect Repository**: Link GitHub repo to Netlifynpm run dev

2. **Build Settings**: ```

   - Build command: `cd apps/web && npm run build`

   - Publish directory: `apps/web/dist`**What happens:**

   - Functions directory: `netlify/functions`1. **Environment Loading**: All `.env` variables injected

3. **Environment Variables**: Add all `.env` variables to Netlify dashboard2. **Static Server**: Frontend served from `apps/web/dist` on port 3999

4. **Deploy**: Automatic deployment on git push3. **Main Server**: Netlify dev server on port 8888

4. **Functions Loading**: All 7 serverless functions become available

---5. **Hot Reload**: Changes automatically trigger rebuilds



**🎉 Happy coding with quantum physics! 🚀⚛️🎮**### **Development Server Output**

```

---◈ Netlify Dev ◈

◈ Injected .env file env var: SUPABASE_URL

*Last updated: November 23, 2025*◈ Injected .env file env var: GOOGLE_CLIENT_ID

*Version: 1.0.0*◈ Running static server from "apps/web/dist"

*Maintained by: QPlay Team*◈ Static server listening to 3999

┌─────────────────────────────────────────────────┐
│   ◈ Server now ready on http://localhost:8888   │
└─────────────────────────────────────────────────┘

◈ Loaded function auth-google
◈ Loaded function auth-login
◈ Loaded function achievements
◈ Loaded function game-session
◈ Loaded function leaderboard
◈ Loaded function quantum-measurements
```

### **Port Architecture**
- **Port 8888**: Main development server (your access point)
- **Port 3999**: Internal static file server (background)

### **Making Changes**
- **Frontend changes**: Edit files in `apps/web/src/` → Hot reload automatically
- **Backend changes**: Edit files in `netlify/functions/` → Restart `npm run dev`
- **Environment changes**: Update `.env` → Restart `npm run dev`

---

## 🔧 **Technical Details**

### **Build Configuration**

**Vite Config (`vite.config.ts`)**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
```

**Netlify Config (`netlify.toml`)**
```toml
[build]
  command = "cd apps/web && npm run build"
  functions = "netlify/functions"
  publish = "apps/web/dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **TypeScript Configuration**
- **Strict mode enabled**: Maximum type safety
- **Path aliases**: Clean import statements
- **Vite environment types**: Full development environment support

### **Dependencies Overview**

**Frontend Key Dependencies:**
```json
{
  "@react-three/fiber": "^8.15.11",    // Three.js React integration
  "@supabase/supabase-js": "^2.38.5",  // Supabase client
  "react": "^18.3.1",                  // Core React
  "react-router-dom": "^6.20.1",       // Client-side routing
  "three": "^0.158.0",                 // 3D graphics library
  "tailwindcss": "^3.3.6"             // Utility-first CSS
}
```

**Backend Key Dependencies:**
```json
{
  "google-auth-library": "^9.4.1"      // Google OAuth verification
}
```

---

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### **Server Won't Start**
```powershell
# Check if you're in the correct directory
Get-Location  # Should be: C:\Users\Naren\Downloads\Q-RESEARCH\QPlay-Core

# Navigate to correct directory
Set-Location "c:\Users\Naren\Downloads\Q-RESEARCH\QPlay-Core"

# Try starting again
npm run dev
```

#### **Environment Variables Not Loading**
1. Verify `.env` file exists in project root
2. Check variable names match exactly (case-sensitive)
3. Restart development server after changes
4. Ensure no quotes around values unless needed

#### **Google Authentication Fails**
1. Verify `localhost:8888` is added to Google Console
2. Check `GOOGLE_CLIENT_ID` matches exactly
3. Ensure Supabase configuration includes correct redirect URLs
4. Clear browser cache and cookies

#### **Functions Not Loading**
```powershell
# Reinstall function dependencies
cd netlify/functions
npm install
cd ../..
npm run dev
```

#### **TypeScript Errors**
```powershell
# Check TypeScript configuration
cd apps/web
npx tsc --noEmit

# Fix import issues
# Update vite-env.d.ts if needed
```

### **Debug Commands**
```powershell
# Check package.json syntax
Get-Content package.json | ConvertFrom-Json

# Verify environment variables
Get-Content .env

# Check function dependencies
Get-Content netlify/functions/package.json | ConvertFrom-Json

# Test individual function
curl http://localhost:8888/.netlify/functions/auth-login
```

---

## 🚀 **Deployment**

### **Netlify Production Deployment**

#### **Automatic Deployment (Recommended)**
1. **Connect Repository**: Link GitHub repo to Netlify
2. **Build Settings**: 
   - Build command: `cd apps/web && npm run build`
   - Publish directory: `apps/web/dist`
   - Functions directory: `netlify/functions`
3. **Environment Variables**: Add all `.env` variables to Netlify dashboard
4. **Deploy**: Automatic deployment on git push

#### **Manual Deployment**
```powershell
# Install Netlify CLI globally
npm install -g netlify-cli

# Build for production
cd apps/web
npm run build
cd ..

# Deploy to Netlify
netlify deploy --prod --dir=apps/web/dist --functions=netlify/functions
```

### **Environment Configuration for Production**
Update your production environment variables:
- **Site URL**: Your production domain
- **Google OAuth**: Add production redirect URIs
- **Supabase**: Update allowed origins

### **Performance Optimizations**
- ✅ **Code Splitting**: Automatic with Vite
- ✅ **Asset Optimization**: Images, CSS, JS minification
- ✅ **CDN**: Netlify global CDN
- ✅ **Edge Functions**: Low-latency serverless execution

---

## 📊 **Project Metrics**

### **Codebase Stats**
- **Frontend**: ~50+ React components
- **Backend**: 7 serverless functions  
- **Dependencies**: 300MB+ frontend, 10MB backend
- **Build Time**: ~30-60 seconds
- **Bundle Size**: ~2-3MB (optimized)

### **Performance Targets**
- **First Load**: < 3 seconds
- **Cold Start**: < 500ms (functions)
- **Interactive**: < 1 second
- **Lighthouse Score**: 90+ (all metrics)

---

## 🎯 **Next Steps & Roadmap**

### **Immediate Development Priorities**
1. **Complete Authentication Flow**: Implement full user registration/login
2. **Game Logic**: Build core quantum physics simulations
3. **3D Interactions**: Enhance Three.js quantum visualizations
4. **Achievement System**: Complete gamification features
5. **Mobile Optimization**: Responsive design improvements

### **Future Enhancements**
- **Multiplayer Support**: Real-time collaborative learning
- **Advanced Physics**: More complex quantum simulations
- **AI Tutor**: Intelligent learning assistance
- **Content Management**: Admin panel for educators
- **Analytics**: Learning progress tracking

---

## 📚 **Additional Resources**

### **Documentation**
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)

### **Quantum Physics Resources**
- [Quantum Computing Explained](https://quantum-computing.ibm.com/)
- [MIT Quantum Mechanics Courses](https://ocw.mit.edu/courses/physics/)
- [Quantum Game Theory](https://quantum-game.com/)

---

## 📝 **Contributing**

### **Development Guidelines**
1. **Code Style**: Follow existing TypeScript/React patterns
2. **Testing**: Add tests for new features
3. **Documentation**: Update this README for significant changes
4. **Commits**: Use conventional commit messages
5. **Pull Requests**: Include detailed descriptions

### **Getting Help**
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**: Contact the QPlay team

---

**🎉 Happy coding with quantum physics! 🚀⚛️🎮**

---

*Last updated: November 23, 2025*
*Version: 1.0.0*
*Maintained by: QPlay Team*