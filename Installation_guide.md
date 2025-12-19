# 🔧 Installation Requirements & Troubleshooting

## ✅ **System Requirements**

### **Minimum Requirements**
- **Node.js**: 18.0.0+ (LTS recommended)
- **npm**: 9.0.0+ (comes with Node.js)
- **Git**: 2.30.0+
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### **Recommended Setup**
```bash
node --version    # Should show v18.x.x or v20.x.x
npm --version     # Should show 9.x.x or 10.x.x
git --version     # Should show 2.x.x
```

---

## 🚀 **Step-by-Step Installation**

### **1. Check Prerequisites**
```powershell
# Check Node.js version (REQUIRED: 18+)
node --version

# Check npm version  
npm --version

# If you need to install/update Node.js:
# Download from: https://nodejs.org/
```

### **2. Clone Repository**
```powershell
git clone https://github.com/Project-Qplay/QPlay-Core.git
cd QPlay-Core
```

### **3. Install All Dependencies**
```powershell
# This installs both frontend AND backend dependencies
npm run install:all
```

**What this does:**
1. Installs frontend deps in `apps/web/` (~300MB)
2. Installs backend deps in `netlify/functions/` (~10MB)
3. Total: ~350MB of dependencies

### **4. Set Up Environment**
```powershell
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials:
# SUPABASE_URL=your-supabase-url
# GOOGLE_CLIENT_ID=your-google-client-id
# etc.
```

### **5. Start Development**
```powershell
npm run dev
```

**Expected output:**
```
◈ Netlify Dev ◈
◈ Server now ready on http://localhost:8888
◈ Loaded function auth-google
◈ Loaded function achievements
# ... all 7 functions should load
```

---

## 🐛 **Common Installation Issues & Fixes**

### **❌ "node: command not found"**
**Solution:**
```powershell
# Install Node.js from: https://nodejs.org/
# Choose LTS version (18.x.x or 20.x.x)
# Restart terminal after installation
```

### **❌ "npm ERR! peer dep missing"**
**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules, apps/web/node_modules, netlify/functions/node_modules
npm run install:all
```

### **❌ "ERESOLVE unable to resolve dependency tree"**
**Solution:**
```powershell
# Use npm force install
cd apps/web
npm install --force

cd ../../netlify/functions  
npm install --force
```

### **❌ "gyp ERR! stack Error: Python executable not found"**
**Solution:**
```powershell
# Install Visual Studio Build Tools (Windows)
npm install --global windows-build-tools

# Or install Python 3.x and add to PATH
```

### **❌ "Port 8888 already in use"**
**Solution:**
```powershell
# Kill existing process
Stop-Process -Name "node" -Force

# Or use different port in netlify.toml
```

### **❌ "Module not found: Can't resolve '@supabase/supabase-js'"**
**Solution:**
```powershell
# Reinstall frontend dependencies
cd apps/web
npm install @supabase/supabase-js
npm run build
```

---

## 🎯 **Version Compatibility Matrix**

### **✅ Tested & Working**
| Component | Versions | Status |
|-----------|----------|--------|
| Node.js | 18.17.0, 18.19.0, 20.10.0 | ✅ Fully compatible |
| npm | 9.8.1, 10.2.0, 10.5.0 | ✅ Fully compatible |
| Windows | 10, 11 | ✅ Tested |
| macOS | Monterey, Ventura, Sonoma | ✅ Tested |
| Ubuntu | 20.04, 22.04 | ✅ Tested |

### **⚠️ Known Issues**
| Component | Versions | Issue |
|-----------|----------|-------|
| Node.js | <18.0.0 | ❌ ES modules not supported |
| Node.js | 19.x.x | ⚠️ Experimental, use 18.x or 20.x |
| npm | <8.0.0 | ❌ Workspace support missing |

---

## 🔍 **Dependency Analysis**

### **Frontend Dependencies (`apps/web/`)**
```json
{
  "react": "^18.3.1",           // ✅ Stable
  "typescript": "^5.5.3",       // ✅ Latest stable
  "vite": "^5.4.2",            // ✅ Latest stable
  "three": "0.151.3",          // ✅ Pinned version (compatibility)
  "@react-three/fiber": "^8.13.6", // ✅ Compatible with three@0.151.3
  "tailwindcss": "^3.4.1"      // ✅ Latest stable
}
```

### **Backend Dependencies (`netlify/functions/`)**
```json
{
  "google-auth-library": "^9.0.0"  // ✅ Latest stable
}
```

### **Security Considerations**
- ✅ **No known vulnerabilities** in dependencies
- ✅ **Regular updates** recommended
- ✅ **Pinned versions** where needed for compatibility

---

## 🛠️ **Development Environment Setup**

### **VS Code Extensions (Recommended)**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### **Git Configuration**
```powershell
# Set up Git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Recommended Git settings for this project
git config core.autocrlf false
git config core.eol lf
```

---

## ✅ **Verification Checklist**

After installation, verify everything works:

```powershell
# ✅ 1. Check Node.js version
node --version  # Should be 18.x.x or 20.x.x

# ✅ 2. Check dependencies installed
ls apps/web/node_modules          # Should exist (~300MB)
ls netlify/functions/node_modules  # Should exist (~10MB)

# ✅ 3. Check environment file
cat .env  # Should contain your credentials

# ✅ 4. Test development server
npm run dev  # Should start without errors

# ✅ 5. Test build process
cd apps/web
npm run build  # Should complete successfully
```

---

## 🎉 **Success Indicators**

✅ **Installation Successful When:**
- Node.js 18+ installed
- All dependencies downloaded (~350MB total)
- `npm run dev` starts server at http://localhost:8888
- All 7 Netlify Functions load successfully
- No error messages in terminal
- Environment variables loaded correctly

---

## 📞 **Get Help**

If you encounter issues not covered here:

1. **Check Node.js version**: Must be 18+
2. **Clear npm cache**: `npm cache clean --force`
3. **Reinstall dependencies**: Delete `node_modules` and run `npm run install:all`
4. **Check firewall/antivirus**: May block npm installations
5. **Try different network**: Corporate networks may block some packages

---

**Happy coding! 🚀⚛️**