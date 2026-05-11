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
  if (!['.ts', '.tsx', '.json', '.md', '.html', '.css', '.yml', '.yaml', '.mjs', '.sh', '.example', '.patch', '.config'].includes(ext) && !filePath.includes('.env')) {
    return;
  }

  if (filePath.includes('pnpm-lock.yaml') || filePath.includes('fix-identifiers.mjs')) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix invalid identifiers: any Jasmin.ia touching a letter, number, _, or $
    // Pass 1: character before Jasmin.ia
    content = content.replace(/([a-zA-Z0-9_$])Jasmin\.ia/g, '$1Jasminia');
    // Pass 2: character after Jasmin.ia
    content = content.replace(/Jasmin\.ia([a-zA-Z0-9_$])/g, 'Jasminia$1');
    // Also rename jasminiaai -> jasminia
    content = content.replace(/jasminiaai/g, 'jasminia');
    
    // Some filenames might have been imported with Jasmin.ia, e.g., useJasmin.iaIssueRuntime.ts
    // Let's fix those occurrences in import statements
    content = content.replace(/Jasmin\.ia/g, (match, offset, fullString) => {
      // If it's inside a string that looks like a path
      const prefix = fullString.slice(Math.max(0, offset - 10), offset);
      if (prefix.includes('/') || prefix.includes('./')) {
        return 'Jasminia';
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e}`);
  }
});

console.log(`Updated ${count} files.`);
