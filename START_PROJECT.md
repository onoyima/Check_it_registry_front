# How to Start Check It Project

## Quick Start (2 Terminals Required)

### Terminal 1 - Start Backend Server
```bash
cd server
npm start
```
**Expected output:**
```
✅ Database connection pool created
Check It API Server running on port 3005
Environment: development
Frontend URL: http://localhost:5173
```

### Terminal 2 - Start Frontend
```bash
npm run dev
```
**Expected output:**
```
VITE v6.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Alternative - Using Batch Files (Windows)

### Option 1: Double-click these files
- `start-server.bat` - Starts the backend
- `start-frontend.bat` - Starts the frontend

### Option 2: Command line
```bash
# Start backend (new terminal window)
start-server.bat

# Start frontend (new terminal window)  
start-frontend.bat
```

## Access the Application

Once both servers are running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3005
- **Health Check**: http://localhost:3005/health

## Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" error:
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Then restart the servers
```

### Database Connection Issues
The server will start even without MySQL. Database errors will show when you try to use features that need the database.

To set up MySQL:
1. Install MySQL 8.0+
2. Create database: `CREATE DATABASE check_it_registry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
3. Import schema: `mysql -u root -p check_it_registry < mysql/schema.sql`
4. Update `server/.env` with your MySQL password

### Frontend Build Issues
If frontend has issues:
```bash
npm install
npm run build
```

## Current Configuration

- **Backend Port**: 3005
- **Frontend Port**: 5173 (default Vite)
- **API Base URL**: http://localhost:3005/api
- **Database**: MySQL (optional for basic testing)

## Features Available

✅ **Without Database:**
- Server health check
- Basic API structure
- Frontend loads

✅ **With Database:**
- User registration/login
- Device registration
- Public device checking
- Admin dashboard
- Report management
- Full functionality

---

**Ready to start!** Open 2 terminals and run the commands above.