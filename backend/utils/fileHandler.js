const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

exports.readJsonFile = (filename) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
};

exports.writeJsonFile = (filename, data) => {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

exports.backupFile = (filename) => {
    const filePath = path.join(dataDir, filename);
    const backupPath = path.join(dataDir, `${filename}.backup-${Date.now()}`);
    if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupPath);
    }
}; 