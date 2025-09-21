# 🚀 EMPATHY LEDGER - LOCAL HOSTING SETUP

## 🎯 **CONSISTENT LOCAL DEVELOPMENT ENVIRONMENT**

### **📍 Available Service Addresses:**

#### **Option 1: Standard Port (Recommended)**
```bash
npm run dev
```
**URL**: `http://localhost:3030`
**Admin**: `http://localhost:3030/admin`

#### **Option 2: Custom Port**
```bash
npm run dev:custom
```
**URL**: `http://localhost:4000`
**Admin**: `http://localhost:4000/admin`

---

## **🌐 OPTION 2: Custom Local Domain**

### **Set up unique service address that stays the same:**

#### **Step 1: Edit your hosts file**
```bash
sudo nano /etc/hosts
```

#### **Step 2: Add these lines:**
```
127.0.0.1    empathy-ledger.local
127.0.0.1    admin.empathy-ledger.local
127.0.0.1    api.empathy-ledger.local
```

#### **Step 3: Access via custom domain:**
- **Main Site**: `http://empathy-ledger.local:3030`
- **Admin Panel**: `http://empathy-ledger.local:3030/admin`
- **API**: `http://empathy-ledger.local:3030/api`

---

## **🔒 OPTION 3: HTTPS Local Development**

### **Generate SSL certificate for secure local development:**

#### **Step 1: Install mkcert**
```bash
# On macOS
brew install mkcert
mkcert -install
```

#### **Step 2: Generate certificates**
```bash
cd /Users/benknight/Code/empathy-ledger-v2
mkdir -p .ssl
mkcert -key-file .ssl/key.pem -cert-file .ssl/cert.pem empathy-ledger.local localhost 127.0.0.1
```

#### **Step 3: Update Next.js config for HTTPS**
Create `dev-server.js`:
```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('.ssl/key.pem'),
  cert: fs.readFileSync('.ssl/cert.pem')
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3030, (err) => {
    if (err) throw err;
    console.log('🚀 Ready on https://empathy-ledger.local:3030');
  });
});
```

#### **Step 4: Add HTTPS script to package.json**
```json
"dev:https": "node dev-server.js"
```

#### **Step 5: Access via HTTPS:**
- **URL**: `https://empathy-ledger.local:3030`
- **Admin**: `https://empathy-ledger.local:3030/admin`

---

## **🌍 OPTION 4: External Access (Testing on Devices)**

### **For testing on mobile/other devices on your network:**

#### **Step 1: Find your local IP**
```bash
ipconfig getifaddr en0
# Example output: 192.168.1.100
```

#### **Step 2: Update Next.js to bind to all interfaces**
```json
"dev:network": "next dev -p 3030 -H 0.0.0.0"
```

#### **Step 3: Access from other devices:**
- **URL**: `http://192.168.1.100:3030` (use your IP)
- **Admin**: `http://192.168.1.100:3030/admin`

---

## **🎯 RECOMMENDED SETUP FOR YOU:**

### **Primary Development URL:**
```
http://empathy-ledger.local:3030
```

### **Quick Start Commands:**
```bash
# 🚀 RECOMMENDED: Clean development startup (kills conflicts, locks port 3030)
npm run dev:clean

# Standard development (locked to port 3030)
npm run dev

# Custom port development
npm run dev:custom

# Network access (for device testing)
npm run dev:network
```

### **⚠️ SOLVING CONNECTION REFUSED ERRORS:**

If you get "localhost refused to connect" or "ERR_CONNECTION_REFUSED":

**Root Cause**: Multiple Next.js processes fight over ports, causing conflicts.

**Solution**: Always use the clean startup command:
```bash
npm run dev:clean
```

This script:
- Kills any existing Next.js processes
- Clears port 3030 completely
- Removes Next.js cache
- Starts fresh on port 3030

**Alternative Manual Fix**:
```bash
# Kill all Next.js processes
pkill -f "next dev"
lsof -ti:3030 | xargs kill -9

# Then start normally
npm run dev
```

### **Admin Access:**
```
http://empathy-ledger.local:3030/admin
```

### **Super Admin Login:**
```
file:///Users/benknight/Code/empathy-ledger-v2/super-admin-login.html
```

---

## **📝 Environment Variables:**

Your `.env.local` is already configured. The app will work with any of these URLs since Supabase and other services are configured via environment variables.

---

## **🔧 Current Status:**

- ✅ **Locked Ports**: 3030 (primary), 4000 (custom)
- ✅ **No Port Conflicts**: Fixed port assignment
- ✅ **Ready for Custom Domain**: Add hosts file entries
- ✅ **HTTPS Ready**: Follow Option 3 for SSL
- ✅ **Network Ready**: Use dev:network for external access

**Your empathy ledger will now always be available at the same URL! 🌟**