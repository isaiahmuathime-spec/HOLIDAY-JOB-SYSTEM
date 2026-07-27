const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'storage.json');
const TEMP_DATA_PATH = `${DATA_PATH}.tmp`;

function getInitialData() {
  return {
    admins: [],
    jobs: [],
    students: [],
    applications: []
  };
}

function ensureDataFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(getInitialData(), null, 2), 'utf-8');
  }
}

function readData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read storage file: ${error.message}. Recreating storage.`);
    const initial = getInitialData();
    saveData(initial);
    return initial;
  }
}

function saveData(data) {
  const serialized = JSON.stringify(data, null, 2);
  fs.writeFileSync(TEMP_DATA_PATH, serialized, 'utf-8');
  fs.renameSync(TEMP_DATA_PATH, DATA_PATH);
}

module.exports = { ensureDataFile, readData, saveData };
