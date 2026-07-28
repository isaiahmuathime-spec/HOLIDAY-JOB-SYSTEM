# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas/database
2. Sign up for a free account
3. Create a new cluster (choose FREE tier - M0)

## Step 2: Get Your Connection String
1. In Atlas dashboard, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster0.mongodb.net/database?retryWrites=true&w=majority`)

## Step 3: Configure the App
1. Open the `.env` file in the project root
2. Replace the `MONGODB_URI` value with your actual connection string
3. Replace `username` and `password` in the connection string with your Atlas database user credentials
4. Change the database name from `holiday-job-system` to your preferred name

Example:
```
MONGODB_URI=mongodb+srv://myUser:myPass123@cluster0.mongodb.net/holidayjobs?retryWrites=true&w=majority
```

## Step 4: Create Database User in Atlas
1. In Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username and strong password
5. Grant "Read and write to any database" permissions
6. Save the user

## Step 5: Whitelist Your IP
1. In Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development only)
4. Or add your specific IP address for better security

## Step 6: Start the Server
```bash
npm start
```

You should see: `MongoDB Connected: cluster0.mongodb.net`

## Step 7: Create Admin Account
Use the admin signup endpoint to create your first admin:
```bash
curl -X POST http://localhost:3000/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Admin",
    "password": "admin123",
    "signupSecret": "your-admin-signup-secret-change-this-67890"
  }'
```

Or use Postman/Thunder Client to make a POST request to:
- URL: `http://localhost:3000/api/auth/admin/signup`
- Body (JSON):
```json
{
  "username": "Admin",
  "password": "admin123",
  "signupSecret": "your-admin-signup-secret-change-this-67890"
}
```

## Troubleshooting

### "MongoDB Connected" not showing
- Check your connection string in `.env`
- Verify your IP is whitelisted in Atlas
- Ensure database user credentials are correct

### Authentication errors
- Make sure you're using the correct signup secret from `.env`
- Check that the admin account was created successfully

### Connection timeout
- Check your internet connection
- Verify the cluster is running in Atlas
- Make sure firewall isn't blocking port 27017