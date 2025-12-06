# 🎮 QPlay-Core: Quantum Physics Learning Game

**A modern, interactive quantum physics education platform built with React, TypeScript, and Netlify Functions**

---

## 📋 **Table of Contents**

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Project Structure](#project-structure)
5. [Authentication Setup](#authentication-setup)
6. [Development Workflow](#development-workflow)
7. [Technical Details](#technical-details)
8. [Troubleshooting](#troubleshooting)
9. [Deployment](#deployment)

---

## 🎯 **Project Overview**

### **What is QPlay-Core?**
An immersive quantum physics learning game that makes complex quantum mechanics concepts accessible through interactive 3D visualizations, gamified challenges, and real-time simulations.

### **Key Features**
- 🎮 **Interactive Quantum Rooms**: Superposition Tower, Entanglement Bridge, Tunneling Vault
- 🔬 **Real Physics Simulations**: Accurate quantum mechanics calculations
- 🏆 **Gamification**: Achievements, leaderboards, progress tracking
- 🔐 **Modern Authentication**: Supabase + Google OAuth integration
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🚀 **Serverless Backend**: Netlify Functions for scalability

### **Technology Stack**
- **Frontend**: React 18.3.1, TypeScript, Three.js, Vite
- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Deployment**: Netlify Edge Functions
- **Styling**: Tailwind CSS

---

## 🏗️ **Architecture**

### **Monorepo Structure**
```
QPlay-Core/
├── 🎨 apps/web/              # Frontend React Application
│   ├── src/
│   │   ├── components/       # React UI components
│   │   ├── contexts/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API communication
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Helper functions
│   ├── public/              # Static assets
│   ├── dist/                # Build output (gitignored)
│   └── package.json         # Frontend dependencies (300MB+ node_modules)
│
├── ⚡ netlify/functions/     # Serverless Backend
│   ├── auth-google.js       # Google OAuth handler
│   ├── auth-login.js        # User authentication
│   ├── auth-signup.js       # User registration
│   ├── achievements.js      # Achievement system
│   ├── game-session.js      # Game state management
│   ├── leaderboard.js       # Score tracking
│   ├── quantum-measurements.js # Physics calculations
│   └── package.json         # Backend dependencies (10MB node_modules)
│
├── 🔧 Configuration Files
│   ├── .env                 # Environment variables
│   ├── netlify.toml         # Netlify deployment config
│   ├── package.json         # Root project scripts
│   ├── vite.config.ts       # Vite build configuration
│   └── tailwind.config.js   # Styling configuration
```

### **Data Flow Architecture**
```
User Browser (localhost:8888)
         ↕️
    React Frontend
         ↕️
   Netlify Functions (serverless)
         ↕️
    Supabase Database
         ↕️
    Google OAuth API
```

### **Why Monorepo + Two node_modules?**

**This is modern best practice for full-stack applications:**

1. **Frontend (`apps/web/node_modules/`)** - 300MB+
   - React ecosystem, Three.js, TypeScript, Vite
   - Rich UI libraries and development tools
   - Complete build system dependencies

2. **Backend (`netlify/functions/node_modules/`)** - 10MB
   - Minimal serverless runtime dependencies
   - Only Google OAuth library needed
   - Optimized for cold starts

**Benefits:**
- ✅ **Performance**: Faster cold starts for serverless functions
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Scalability**: Independent deployment and scaling
- ✅ **Development**: Isolated dependency management

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation & Setup**
```powershell
# Clone the repository
git clone https://github.com/Project-Qplay/QPlay-Core.git
cd QPlay-Core

# Install all dependencies
npm run install:all

# Start development server
npm run dev
```

### **Access Your Application**
Open your browser and navigate to: **http://localhost:8888**

### **Available Scripts**
```json
{
  "dev": "netlify dev",                    # Start development server
  "preview": "cd apps/web && npm run preview",  # Preview production build
  "install:all": "cd apps/web && npm install && cd ../../netlify/functions && npm install"
}
```

---

## 📁 **Detailed Project Structure**

### **Frontend Components (`apps/web/src/components/`)**
```
components/
├── 3d/                      # Three.js 3D components
│   ├── CatModel.tsx         # Schrödinger's cat visualization
│   ├── LoadingScreen.tsx    # 3D loading animations
│   ├── QuantumScene.tsx     # Main 3D quantum world
│   ├── QuantumTerminalLoader.tsx
│   └── Spaceship.tsx        # 3D spaceship model
│
├── rooms/                   # Quantum physics rooms
│   ├── EntanglementBridge.tsx    # Quantum entanglement concepts
│   ├── ProbabilityBay.tsx        # Probability distributions
│   ├── QuantumArchive.tsx        # Historical quantum experiments
│   ├── StateChamber.tsx          # Quantum state manipulation
│   ├── SuperpositionTower.tsx    # Superposition principles
│   └── TunnelingVault.tsx        # Quantum tunneling effects
│
├── auth/                    # Authentication components
│   └── AuthModal.tsx        # Login/signup modal
│
├── achievements/            # Gamification
│   └── Achievements.tsx     # Achievement system UI
│
├── ui/                      # Reusable UI components
│   ├── Button.tsx           # Custom button component
│   ├── PortalTransition.tsx # Portal animation effects
│   └── ThemeProvider.tsx    # Theme management
│
└── Core Components
    ├── GameController.tsx   # Main game logic controller
    ├── MainMenu.tsx         # Main navigation menu
    ├── QuantumGuide.tsx     # Interactive tutorials
    ├── Settings.tsx         # Application settings
    └── Leaderboard.tsx      # Score display
```

### **Context Providers (`apps/web/src/contexts/`)**
```
contexts/
├── AuthContext.tsx          # User authentication state
├── GameContext.tsx          # Game state management
├── LoadingContext.tsx       # Loading state management
└── SettingsContext.tsx      # User preferences
```

### **Backend Functions (`netlify/functions/`)**
```
functions/
├── auth-google.js           # Google OAuth flow handler
├── auth-login.js            # User login validation
├── auth-signup.js           # User registration processing
├── achievements.js          # Achievement CRUD operations
├── game-session.js          # Game state persistence
├── leaderboard.js           # Score tracking and rankings
└── quantum-measurements.js  # Physics calculations and simulations
```

---

## 🔐 **Authentication Setup**

### **Environment Variables (`.env`)**
```env
# Supabase Configuration
SUPABASE_URL=https://ylahofxrvdhqkjmsolin.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your_google_client_id

# Vite Frontend Variables
VITE_SUPABASE_URL=https://ylahofxrvdhqkjmsolin.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Node Configuration
NODE_VERSION=18
```

### **Google Cloud Console Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Credentials → OAuth 2.0 Client IDs
3. Edit your OAuth client and add:

**Authorized JavaScript Origins:**
```
http://localhost:8888
https://your-production-domain.netlify.app
```

**Authorized Redirect URIs:**
```
http://localhost:8888/auth/callback
http://localhost:8888/auth/google/callback
https://your-production-domain.netlify.app/auth/callback
```

### **Supabase Dashboard Setup**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to Authentication → URL Configuration
3. Configure:

**Site URL:** `http://localhost:8888` (development) / `https://your-domain.netlify.app` (production)

**Redirect URLs:** `http://localhost:8888/**` (development) / `https://your-domain.netlify.app/**` (production)

---

## 💻 **Development Workflow**

### **Starting Development**
```powershell
# Navigate to project root
Set-Location "c:\Users\Naren\Downloads\Q-RESEARCH\QPlay-Core"

# Start development server
npm run dev
```

**What happens:**
1. **Environment Loading**: All `.env` variables injected
2. **Static Server**: Frontend served from `apps/web/dist` on port 3999
3. **Main Server**: Netlify dev server on port 8888
4. **Functions Loading**: All 7 serverless functions become available
5. **Hot Reload**: Changes automatically trigger rebuilds

### **Development Server Output**
```
◈ Netlify Dev ◈
◈ Injected .env file env var: SUPABASE_URL
◈ Injected .env file env var: GOOGLE_CLIENT_ID
◈ Running static server from "apps/web/dist"
◈ Static server listening to 3999

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