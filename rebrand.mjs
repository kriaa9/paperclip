import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPLACEMENTS = [
  { search: /paperclipai/g, replace: "jasminia" },
  { search: /Paperclip/g, replace: "Jasminia" },
  { search: /paperclip/g, replace: "jasminia" },
  { search: /PAPERCLIP/g, replace: "JASMINIA" },
  { search: /ClipMart/g, replace: "Jasmin Market" },
  { search: /Clippy/g, replace: "Jasmin" },
  { search: /https:\/\/github\.com\/paperclipai\S*/g, replace: "#" },
  { search: /paperclip\.ing/g, replace: "jasminia.com" },
];

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
  if (!['.ts', '.tsx', '.json', '.md', '.html', '.css', '.yml', '.yaml', '.mjs', '.sh', '.example', '.patch', '.config'].includes(ext) && !filePath.includes('.env')) {
    return;
  }
  
  if (filePath.includes('pnpm-lock.yaml') || filePath.includes('rebrand.mjs')) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const { search, replace } of REPLACEMENTS) {
      content = content.replace(search, replace);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e}`);
  }
});

console.log(`Updated ${count} files.`);
