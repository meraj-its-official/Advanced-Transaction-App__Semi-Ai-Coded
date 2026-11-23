import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDirectory = fileURLToPath(new URL('../dist/', import.meta.url));

async function updateImports(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await updateImports(entryPath);
      continue;
    }

    if (!entry.name.endsWith('.js')) continue;

    const source = await readFile(entryPath, 'utf8');
    const updated = source.replace(
      /(\b(?:from\s*|import\s*\()\s*['"])(\.\.?\/[^'"]+)(['"])/g,
      (match, prefix, specifier, suffix) => {
        if (path.extname(specifier)) return match;
        return `${prefix}${specifier}.js${suffix}`;
      },
    );

    if (updated !== source) await writeFile(entryPath, updated);
  }
}

await updateImports(outputDirectory);
