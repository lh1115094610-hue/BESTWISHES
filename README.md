# 🎄 Interactive Christmas Tree - 开发与部署指南

本项目是一个基于 React 19、Three.js (R3F) 和 MediaPipe 的高保定交互式 3D 圣诞树。

---

## 🛠 第一步：安装 Node.js 和 npm

在开始之前，你的电脑需要安装 Node.js 环境（它会自动安装 npm）。

### 1. 下载安装包
- **Windows / macOS**: 访问 [Node.js 官网 (nodejs.org)](https://nodejs.org/)。
- 推荐下载 **LTS (Long Term Support)** 版本（例如 v20.x 或 v22.x），因为它最稳定。
- 下载后运行安装程序，一路点击“下一步 (Next)”即可。

### 2. 验证安装
打开你的终端（Windows 使用 `cmd` 或 `PowerShell`，macOS 使用 `Terminal`），输入以下命令：
```bash
node -v
npm -v
```
如果能看到版本号（如 `v20.10.0`），说明安装成功。

---

## 🚀 第二步：配置项目环境

1. **获取代码**：
   将项目文件夹下载到本地。

2. **进入目录**：
   在终端中进入该文件夹：
   ```bash
   cd [你的项目路径]
   ```

3. **安装依赖**：
   输入以下命令安装 React、Three.js 等必要库：
   ```bash
   npm install
   ```

---

## 💻 第三步：本地开发

在终端运行以下命令开启实时预览：
```bash
npm run dev
```
之后在浏览器访问 `http://localhost:5173` 即可看到 3D 圣诞树。

---

## 🌐 第四步：部署到 GitHub Pages

1. **修改配置文件**：
   打开 `vite.config.ts`，将 `base: '/你的仓库名/'` 修改为你 GitHub 仓库的真实名称。

2. **安装部署工具**：
   ```bash
   npm install gh-pages --save-dev
   ```

3. **一键部署**：
   在终端运行：
   ```bash
   npm run deploy
   ```
   这会自动构建项目并将其推送到 GitHub 的 `gh-pages` 分支。

4. **开启在线访问**：
   - 进入你的 GitHub 仓库 -> **Settings** -> **Pages**。
   - 在 **Build and deployment** 下，确保 **Branch** 选择的是 `gh-pages`。
   - 几分钟后，你就可以通过 `https://[你的用户名].github.io/[仓库名]/` 访问了！

---

## 📸 摄像头使用注意事项
- **必须使用 HTTPS**：GitHub Pages 默认支持 HTTPS，这是调用摄像头的硬性要求。
- **权限请求**：浏览器会弹出摄像头权限请求，请点击“允许”。
- **手势操作**：
  - **握拳 (Fist)**：召唤并凝聚圣诞树。
  - **张开手掌 (Open Palm)**：释放能量，使粒子回归混沌状态。
  - **左右挥动手掌**：控制树体旋转。
