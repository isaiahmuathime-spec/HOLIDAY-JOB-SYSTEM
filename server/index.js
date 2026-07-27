require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`Holiday Job backend listening on http://localhost:${PORT}`);
});
