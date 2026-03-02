# react-app-tabs 发包流程（npm）

本文档基于当前仓库状态（`react-app-tabs@0.1.0`）整理。

## 1. 发包前检查

在仓库根目录执行：

```bash
npm run check
npm run build
npm run pack:dry
```

说明：
- `check`：TypeScript 类型检查
- `build`：生成 `dist/` 产物
- `pack:dry`：模拟打包，检查最终会发布哪些文件

## 2. 本机 npm 缓存权限问题（你当前环境已出现）

如果出现类似错误：

```text
npm ERR! code EPERM
npm ERR! Your cache folder contains root-owned files
```

可选处理方式：

1. 永久修复（推荐）
```bash
sudo chown -R "$(id -u)":"$(id -g)" ~/.npm
```

2. 临时绕过（不改系统权限）
```bash
npm_config_cache=/tmp/.npm-cache npm run pack:dry
npm_config_cache=/tmp/.npm-cache npm publish --access public
```

## 3. 登录与权限确认

```bash
npm whoami || npm login
```

确认你对包名 `react-app-tabs` 具备发布权限（首次发布通常直接创建）。

## 4. 更新版本号

按语义化版本升级：

```bash
npm version patch
# 或 npm version minor
# 或 npm version major
```

该命令会更新 `package.json` 版本并自动创建 git tag（如 `v0.1.1`）。

## 5. 正式发布

```bash
npm publish --access public
```

如果仍受缓存权限影响，改用：

```bash
npm_config_cache=/tmp/.npm-cache npm publish --access public
```

## 6. 发布后验证

```bash
npm view react-app-tabs version
```

确认线上版本号已更新。

