# 一个需求引发的学习之 Rollup 编译

## 引

此前的文章，介绍了我做了一个 Vite 插件，以满足以 Markdown 文件写博客/文档的需求。核心功能已在上篇文章中实现。但实现形式不太完美：是以本地单文件的形式实现的。不能很好地在项目之间复用。

因此，本篇文章准备将该单文件插件加以改造，变成一个完整的 npm 项目，以方便后期在 npm 发布。

我们可以将 npm 项目粗浅地分为 Node 项目/ Web 项目/ Node&Web 同构项目。

例如，Vite CLi 是个 Node 项目（因为 Vite CLi 只能在 Node 环境下运行），我们使用 Vite 模板搭建的网站显然是个 Web 项目，而 Axios 则是 Node&Web 同构项目（因为 Axios 提供了多种适配器，可以在 Node 和 浏览器环境下运行）。

而我们想要开发的 Vite 插件，显然是个 Node 项目。

既然准备做成了一个完整的项目，那么就可以使用一系列工程化手段，让我们获得更好的开发体验、更合理的项目架构和产出物。为了更契合 Vite 技术栈，本项目选择使用 Rollup 作为模块打包工具。

## 开发

### 依赖与 package.json 文件配置

1. 新建文件夹，并使用 `npm init` 或 `yarn init` 进行 npm 包项目初始化

   Vite 推荐以 vite-plugin- 为前缀命名，并需要在 package.json 里包含 vite-plugin [keywords](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#keywords)

2. 安装依赖（下文 -D 结尾表示开发依赖）

   - 因使用 Rollup 打包器，故需要安装 Rollup -D
   - 因期望产出代码体积小，故需要安装压缩插件 rollup-plugin-terser -D
   - 因期望使用 TypeScript 语言进行开发，故需要安装编译插件 @rollup/plugin-typescript -D 与 编译器 typescript -D 与依赖库 tslib -D
   - 因期望在开发期间获得 MarkdownIt 与 Node 的类型提示，故需要安装类型 @types/markdown-it -D 与 @types/node -D
   - 因期望获得 Vite 插件类型的类型提示，故需要安装 vite -D
   - 因每次编译都需要删除 dist 目录，故安装跨平台删除文件 CLi rimraf -D
   - 因需要使用 MarkdownIt 的 md 文档转 html 能力，故需要安装依赖 markdown-it

3. [npm scripts](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#scripts)

   本项目较为简单，仅需要一个对应编译需求的指令。在 package.json 添加 scripts build，其内容为 `rimraf dist && rollup -c`,其作用为删除 dist 文件夹并使用 Rollup 对项目进行编译。

4. [npm main](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#main)

   main 字段标志该 npm 包发布的入口文件。注意，此处是发布后的入口文件，而非项目编译的入口文件。

至此，该项目 npm 相关内容搭建完毕。

### rollup.config.js 配置

上文配置的 build script 内容为 `rimraf dist && rollup -c`，其中 `rollup -c` 即表示使用项目根目录下的 rollup.config.js 文件配置进行编译。

rollup.config.js 需要 export 一个对象，我们可以使用 Rollup 提供的 defineConfig 函数来对该对象进行类型检查。

本项目配置如下

```js
import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
  },
  plugins: [typescript(), terser()],
});
```

其中，input 字段指项目的编译入口文件；output 值编译后的文件路径及模块化方案，因本项目作为 Vite 插件只需要给 Vite 使用，故选择了 ES 模块化方案；plugins 指需要用到的插件，本项目只需要用到 TypeScript 编译插件和 terser 压缩插件。

至此，rollup.config.js 配置完毕。

### tsconfig.js 配置

因本项目使用 TypeScript 进行开发，故需要使用`tsc --init`指令在根目录下生成 tsconfig.js 文件。不属于本项目重点，详见仓库。

### 代码分层

从单文件代码组织形式编程项目代码组织形式后，自然可以设计更为合理的代码分层了。

在 src 文件夹下，代码分为三层

- index.ts 编译入口文件，负责 export 出一个 Vite 对象
- utils.ts 工具函数集合，主要是对 Node FileSystem 函数的封装，满足本项目对文件读写的需求
- gen 主要业务代码，负责生成所需路由文件和组件文件
  - gen/genRoutes.ts 
  - gen/genComponents.ts
  - gen/genPathMap.ts

### 代码迁移与新功能

将此前的单文件中的代码，迁移至上述分层后的各文件之中。

同时，此前的实现的插件，能够生成 Vue 组件代码文件。为让该插件拥有更好的适用性，实现了允许使用者自定义生成组件代码文件的能力。

核心代码示意如下，详细代码见仓库：

```ts
export type GenComponentFn = (html: string) => string;
export type ComponentTempalte = 'vue' | 'react' | GenComponentFn;

const getGenFn = (genComponent: ComponentTempalte): GenComponentFn;

const genComponent = async (componentTempalte: ComponentTempalte, componentPath: string, htmlString: string) => {
  const genFn = getGenFn(componentTempalte);
  const componentString = genFn(htmlString);

  await writeFile(componentPath, componentString);
}

```

## 编译

因上文已在 package.json 文件中配置了 build script，故在项目根目录下执行 `npm run build` 即可进行编译。执行后，出现的 dist 文件夹如下：

![截屏2022-08-15 20.51.51](./imgs/p1.png)

生成的插件代码和类型注释均符合预期，项目迁移成功。

后期，该插件将作为一个开源项目，进行长期更新与维护。

后续文章将更新，以该项目为基础，进行 npm 包发布与 monorepo 改造。