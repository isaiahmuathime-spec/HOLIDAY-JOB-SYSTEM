const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'storage.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DATA_PATH)) {
    const initial = {
      jobs: [],
      students: [],
      applications: []
    };
    fs.writeFileSync(DATA_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { ensureDataFile, readData, saveData };
