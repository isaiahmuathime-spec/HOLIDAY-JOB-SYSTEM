const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`\n⚠️  MongoDB Connection Failed - App will run in localStorage mode`);
    console.error(`\nTo fix this:`);
    console.error(`1. Go to https://cloud.mongodb.com/`);
    console.error(`2. Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere"`);
    console.error(`3. Make sure your cluster is ACTIVE (not paused)`);
    console.error(`4. Verify database user credentials in "Database Access"`);
    console.error(`5. Restart the server\n`);
    return false;
  }
};

module.exports = connectDatabase;
