import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!['node_modules', '.git', 'dist', '.agents', '.claude'].includes(f)) {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

let count = 0;

walkDir(__dirname, function(filePath) {
  const ext = path.extname(filePath);
  if (ext !== '.json') {
    return;
  }

  if (filePath.includes('pnpm-lock.yaml') || filePath.includes('fix-json.mjs')) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/"url": "#",\n\s*\}/g, '"url": "#"\n  }');
    content = content.replace(/"url": "#",\r\n\s*\}/g, '"url": "#"\r\n  }');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e}`);
  }
});

console.log(`Updated ${count} files.`);
