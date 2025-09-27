# Firebase 部署说明

## 项目概述
这是一个五子棋（Gomoku）游戏，支持人机对战和人人对战，具有不同难度级别的AI。

## 部署步骤

### 1. 登录 Firebase
```bash
firebase login
```

### 2. 初始化项目（如果还没有）
```bash
firebase init
```
选择：
- Hosting: Configure files for Firebase Hosting
- 选择现有项目：project-4985760607655592059
- 公共目录：. (当前目录)
- 单页应用：是
- 自动重写：是

### 3. 部署项目
```bash
firebase deploy
```

## 项目结构
- `index.html` - 主页面
- `js/` - JavaScript文件
  - `Game.js` - 游戏逻辑
  - `Board.js` - 棋盘逻辑
  - `Player.js` - 玩家和AI逻辑
  - `ai-worker.js` - AI算法（Web Worker）
  - `firebase-config.js` - Firebase配置
- `style/` - CSS样式文件
- `images/` - 游戏图片资源

## Firebase 配置
项目已配置为使用以下Firebase项目：
- Project ID: project-4985760607655592059
- 已启用Analytics

## 访问地址
部署成功后，项目将在以下地址可用：
https://project-4985760607655592059.firebaseapp.com
