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
  if (!['.ts', '.tsx'].includes(ext)) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/workspaceRepoUrl: "#(\r?\n)/g, 'workspaceRepoUrl: "#",$1');
    content = content.replace(/repoUrl: "#(\r?\n)/g, 'repoUrl: "#",$1');
    content = content.replace(/workspaceRepoUrl: "#,(\r?\n)/g, 'workspaceRepoUrl: "#",$1');
    content = content.replace(/repoUrl: "#,(\r?\n)/g, 'repoUrl: "#",$1');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e}`);
  }
});

console.log(`Updated ${count} TS files.`);
