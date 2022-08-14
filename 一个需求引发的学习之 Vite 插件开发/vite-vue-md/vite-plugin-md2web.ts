import { Plugin } from 'vite';
import { promises as fs } from 'fs';
import mdit from 'markdown-it';

const { readdir, stat, writeFile } = fs;

const wf = async (file: string, content: string) => {
  const dir = file.split('/').slice(0, -1).join('/');
  await fs.mkdir(dir, { recursive: true });
  await writeFile(file, content);
};

/**
 * @description Get all files in the directory
 * @param rootDir
 * @returns
 */
const getFiles = async (rootDir: string) => {
  const files: string[] = [];
  const queue = [rootDir];

  while (queue.length) {
    const currentDir = queue.shift();
    if (!currentDir) continue;
    const dirContents = await readdir(currentDir);
    for (const file of dirContents) {
      const fullPath = `${currentDir}/${file}`;
      const stats = await stat(fullPath);
      if (stats.isDirectory()) {
        queue.push(fullPath);
      } else if (
        stats.isFile() &&
        (file.endsWith('.MD') || file.endsWith('.md'))
      ) {
        files.push(fullPath);
      }
    }
  }

  return files;
};

/**
 * Generate the routes file
 * @param files
 * @param targetFile
 */
const genRoutes = async (files: string[], targetFile: string) => {
  const routes = files.map((file) => {
    const parts = file.split(/\/|\./).slice(1, -1);
    const path = parts.join('/');
    return `{ path: '/${path}', name: '${parts.join(
      '.'
    )}', component: () => import('/src/docs/${path}/index.vue')}`;
  });

  const content = `export default [\n${routes.join(',\n')}\n]`;
  await wf(targetFile, content);
};

/**
 * Generate components
 * @param files
 * @param componentsDir
 */
const genComponents = async (files: string[], componentsDir: string) => {
  for (const file of files) {
    const parts = file.split(/\/|\./).slice(1, -1);
    const path = parts.join('/');

    const mdString = await fs.readFile(file, 'utf8');
    const htmlString = mdit().render(mdString);

    const content = `<template>\n<div>\n${htmlString}</div>\n</template>`;
    await wf(`${componentsDir}/${path}/index.vue`, content);
  }
};

interface Options {
  rootDir?: string;
  routeFilePath?: string | false;
  componentsDir?: string | false;
}

const run = async ({ rootDir, routeFilePath, componentsDir }: Options) => {
  const files = await getFiles(rootDir);
  const tasks = [];
  if (routeFilePath) {
    tasks.push(genRoutes(files, routeFilePath));
  }
  if (componentsDir) {
    tasks.push(genComponents(files, componentsDir));
  }
  await Promise.all(tasks);
};

export default (
  options: Options = {
    rootDir: 'docs',
    routeFilePath: 'src/router/md.ts',
    componentsDir: 'src/docs',
  }
): Plugin => {
  const PLUGIN_NAME = 'vite-plugin-md2web';
  const { rootDir, componentsDir } = options;
  
  if (rootDir === componentsDir) {
    throw new Error(
      `[${PLUGIN_NAME}]: rootDir and componentsDir must be different`
    );
  }

  const pwd = process.cwd();

  return {
    name: PLUGIN_NAME,
    buildStart: async () => {
      await run(options);
    },
    handleHotUpdate: async (ctx) => {
      if (ctx.file.includes(`${pwd}/${rootDir}`)) {
        await run(options);
      }
    },
  };
};
