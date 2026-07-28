# MongoDB Connection Troubleshooting Guide

## Current Error:
```
Error connecting to MongoDB: querySrv ECONNREFUSED _mongodb._tcp.cluster0.tvzdowj.mongodb.net
```

This means the server **cannot connect** to your MongoDB Atlas cluster.

## Step-by-Step Fix:

### **1. Check if Cluster is Running**
1. Go to https://cloud.mongodb.com/
2. Sign in with your account
3. Check if cluster `cluster0` is **ACTIVE** (not paused)
4. If paused, click **"Resume"** to start it

### **2. Whitelist Your IP Address (MOST COMMON ISSUE)**
1. In MongoDB Atlas, click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
4. Click **"Confirm"**

**OR** add your specific IP:
- Go to https://www.whatismyip.com/ to get your IP
- Add that IP in Atlas

### **3. Verify Database User Exists**
1. In MongoDB Atlas, click **"Database Access"** (left sidebar)
2. Look for user: **`isaiahmuathime_db_user`**
3. If user doesn't exist:
   - Click **"Add New Database User"**
   - Username: `isaiahmuathime_db_user`
   - Password: `6KvZhw9P4b7rEePx`
   - Grant: **"Read and write to any database"**
   - Click **"Add User"**

### **4. Verify Connection String**
Your connection string in `.env`:
```
mongodb+srv://isaiahmuathime_db_user:6KvZhw9P4b7rEePx@cluster0.tvzdowj.mongodb.net/holiday-job-system?retryWrites=true&w=majority
```

Make sure this matches exactly what's in Atlas:
1. In Atlas, click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. Compare it with your `.env` file

### **5. Test Connection**
After making changes, restart the server:
```bash
npm start
```

Look for: `MongoDB Connected: cluster0.tvzdowj.mongodb.net`

## Common Issues:

### **Issue: "IP not whitelisted"**
**Solution:** Add your IP in Atlas → Network Access → Add IP Address → Allow Access from Anywhere

### **Issue: "Authentication failed"**
**Solution:** Check username and password in Database Access. Make sure user has read/write permissions.

### **Issue: "Cluster paused"**
**Solution:** Resume the cluster in Atlas dashboard (clusters pause after 30 days of inactivity on free tier)

### **Issue: "Network timeout"**
**Solution:** 
- Check internet connection
- Whitelist IP address
- Try again in a few minutes

## Quick Checklist:

- [ ] Cluster is ACTIVE (not paused)
- [ ] IP address whitelisted (`0.0.0.0/0` or your IP)
- [ ] Database user `isaiahmuathime_db_user` exists
- [ ] Database user password is `6KvZhw9P4b7rEePx`
- [ ] Connection string in `.env` is correct
- [ ] Server restarted after changes

## Still Not Working?

1. **Check Atlas Status:** https://status.mongodb.com/
2. **Try MongoDB Compass:** Download and test connection with your connection string
3. **Check Firewall:** Make sure port 27017 is not blocked
4. **Wait a few minutes:** Sometimes Atlas takes time to provision new clusters

## After MongoDB Connects:

Once you see `MongoDB Connected: cluster0.tvzdowj.mongodb.net`, you can:

1. **Create admin account:**
```bash
curl -X POST http://localhost:3000/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Admin",
    "password": "admin123",
    "signupSecret": "your-admin-signup-secret-change-this-67890"
  }'
```

2. **Test the app:** Open `auth/index.html` in your browser

3. **Login with:** Username: `Admin`, Password: `admin123`