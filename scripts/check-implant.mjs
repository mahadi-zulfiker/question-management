// Fails the build if the padded-loader supply-chain implant is back in a source file.
// See README: the loader hides behind a long whitespace run on an auto-executed config.
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);

const SKIP = new Set(['node_modules', '.next', '.git', '.vercel', 'out', 'build', 'coverage']);
const SRC = /\.(mjs|cjs|jsx?|tsx?)$/;
const SIGNATURES = [
  /\S[ \t]{40,}\S.{59,}/,                   // payload hidden mid-line behind whitespace padding
  /_0x[0-9a-f]{4,6}\(0x[0-9a-f]+\)/,        // obfuscator string-table calls
  /global\s*\[\s*['"][a-z]['"]\s*\]\s*=\s*require/, // loader stashing require() on global
  /eth_getBlockByNumber|eth_getTransactionCount/,   // blockchain-resolved C2
];

const hits = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (SRC.test(e.name) && resolve(p) !== SELF) {
      const text = readFileSync(p, 'utf8');
      const sig = SIGNATURES.find((re) => re.test(text));
      if (sig) hits.push(`${p}  (matched ${sig})`);
    }
  }
})(process.cwd());

if (hits.length) {
  console.error(`\nSUPPLY-CHAIN IMPLANT DETECTED in ${hits.length} file(s):\n${hits.join('\n')}\n`);
  process.exit(1);
}
console.log('implant scan: clean');
