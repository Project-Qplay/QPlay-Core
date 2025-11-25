# 🎮 QPlay-Core: Play your way into Quantum

**An interactive quantum physics education platform that makes complex quantum mechanics accessible through gamified 3D experiences.**

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, npm 9+ ([Installation Guide](./Installation_guide.md))

```powershell
# Clone and setup
git clone https://github.com/Project-Qplay/QPlay-Core.git
cd QPlay-Core

# Install dependencies
npm run install:all

# Start development server
npm run dev
```

**Access your app at: http://localhost:8888**

> 🔧 **Having installation issues?** See our [Complete Installation Guide](./Installation_guide.md)

## 🎯 Key Features

- **Interactive Quantum Rooms**: Superposition, Entanglement, Tunneling
- **3D Visualizations**: Three.js quantum physics simulations
- **Serverless Backend**: 7 Netlify Functions for scalability
- **Modern Auth**: Supabase + Google OAuth integration
- **Gamification**: Achievements, leaderboards, progress tracking

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Three.js, Vite, Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Deployment**: Netlify Edge Functions

## 📋 Available Scripts

```json
{
  "dev": "netlify dev",
  "preview": "cd apps/web && npm run preview",
  "install:all": "cd apps/web && npm install && cd ../../netlify/functions && npm install"
}
```

## 📁 Project Structure Overview

```
QPlay-Core/
├── 🎨 apps/web/           # React frontend (300MB+ node_modules)
├── ⚡ netlify/functions/  # Serverless backend (10MB node_modules)
├── 🔧 .env               # Environment variables
├── 📄 netlify.toml       # Netlify deployment config
├── 📚 Project_documentation.md  # Complete documentation
└── 🔧 Installation_guide.md     # Installation & troubleshooting
```

## ✅ System Requirements

- **Node.js**: 18.0.0+ (LTS recommended)
- **npm**: 9.0.0+ (included with Node.js)
- **Git**: 2.30.0+
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space for dependencies

## 📖 Complete Documentation

**👉 [Read the Full Documentation](./Project_documentation.md) 👈**

The comprehensive documentation includes:
- 🏗️ **Architecture Overview** - Monorepo structure and data flow
- 🔧 **Technical Setup** - Environment variables, authentication
- 📁 **Project Structure** - Detailed file organization
- 🛠️ **Development Workflow** - Commands, debugging, best practices
- 🚀 **Deployment Guide** - Production deployment to Netlify
- 🐛 **Troubleshooting** - Common issues and solutions

## 🔗 Important Links

- **📚 [Full Documentation](./Project_documentation.md)** - Complete setup and development guide
- **🔧 [Installation Guide](./Installation_guide.md)** - Step-by-step installation & troubleshooting
- **🌐 Live Demo**: Coming soon
- **📊 Project Status**: Active development
- **🤝 Contributing**: See documentation for guidelines

## 🎉 Get Started

1. **Check prerequisites** (Node.js 18+, npm 9+)
2. **Read the [Installation Guide](./Installation_guide.md)** if you encounter issues
3. **Configure authentication** (Google OAuth + Supabase)
4. **Run `npm run dev`** to start developing
5. **Visit http://localhost:8888** to see your quantum physics game!

**🚀 Ready to explore quantum physics through interactive learning? Let's build the future of education! ⚛️🎮**

## 📜 Credits

- Cat 3D model: [LowPoly Cat Rig + Run Animation](https://sketchfab.com/3d-models/lowpoly-cat-rig-run-animation-c36df576c9ae4ed28e89069b1a2f427a) by Omabuarts Studio

---

*For detailed setup, troubleshooting, and development guides, see [Project_documentation.md](./Project_documentation.md) and [Installation_guide.md](./Installation_guide.md)*