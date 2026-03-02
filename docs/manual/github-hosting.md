# example 托管到 GitHub（GitHub Pages）

## 当前项目状态（已检查）

- 当前分支：`main`（跟踪 `origin/main`）
- 远程仓库：`https://github.com/PlutoCRown/react-app-tabs.git`
- `docs/manual` 已存在，可继续维护文档
- 当前仓库没有 `.github/workflows`（即没有自动部署流程）
- `example/vite.config.ts` 目前未配置 `base`，直接部署到 Pages 子路径会导致资源路径错误

## 推荐方案（GitHub Actions 自动部署）

以下是建议你执行的步骤。

### 1. 修改 `example/vite.config.ts`

给 `defineConfig` 增加 `base`，值使用仓库名：

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/react-app-tabs/',
  server: {
    port: 5173,
    fs: {
      allow: ['..'],
    },
  },
});
```

如果你后续改仓库名，需要同步修改这里的 `base`。

### 2. 新增部署工作流

创建文件：`.github/workflows/deploy-example.yml`

```yml
name: Deploy Example to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'example/**'
      - '.github/workflows/deploy-example.yml'

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: example
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Install deps
        run: bun install --frozen-lockfile
      - name: Build example
        run: bun run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: example/dist

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 3. 提交并推送

```bash
git add example/vite.config.ts .github/workflows/deploy-example.yml docs/manual/example-github-hosting.md
git commit -m "chore: add GitHub Pages deployment for example"
git push origin main
```

### 4. 在 GitHub 开启 Pages

仓库页面 -> `Settings` -> `Pages`：

- `Build and deployment` 选择 `Source: GitHub Actions`

首次部署成功后，地址通常是：

`https://plutocrown.github.io/react-app-tabs/`

## 后续更新操作（每次改 example）

1. 修改 `example/` 代码  
2. 提交并推送到 `main`  
3. 在 `Actions` 页面确认 `Deploy Example to GitHub Pages` 成功  
4. 打开线上地址验证页面

## 常见问题

- 页面空白/样式丢失：通常是 `base` 未设置为 `/react-app-tabs/`
- Actions 失败：先看 `build` job 日志，通常是依赖安装或构建错误
- 改了仓库名：同步更新 `example/vite.config.ts` 的 `base`

