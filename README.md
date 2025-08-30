# 3D 2048

[English](./README-EN.md) | 中文

一个基于 Three.js 的三维 2048 游戏，具有现代化的 3D 视觉效果和流畅的动画体验。

## 功能特性

- 🎮 经典的 2048 游戏逻辑
- 🎨 3D 立体视觉效果
- ⚡ 流畅的动画过渡
- 🎯 响应式设计，支持不同屏幕尺寸
- ⌨️ 支持键盘控制（方向键 / WASD）
- 🔄 游戏重新开始功能
- 🏆 胜利和失败状态检测

## 技术栈

- **TypeScript** - 类型安全的 JavaScript
- **Three.js** - 3D 图形渲染库
- **Vite** - 现代化构建工具
- **CSS3** - 样式和布局

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 游戏操作

- **移动块** - 使用方向键（↑↓←→）或 WASD 键
- **重新开始** - 点击 "Restart" 按钮
- **游戏目标** - 合并相同数字的块，达到 2048 即可获胜

## 项目结构

```
src/
├── game/
│   ├── core.ts      # 游戏核心逻辑
│   └── renderer.ts  # 3D 渲染引擎
├── types/
│   └── game.ts      # 类型定义
├── main.ts          # 程序入口
├── style.css        # 样式文件
└── vite-env.d.ts    # Vite 类型声明
```

## 开发说明

### 核心组件

- **Game Core** (`src/game/core.ts`) - 实现游戏状态管理、移动逻辑和胜负判断
- **3D Renderer** (`src/game/renderer.ts`) - 基于 Three.js 的 3D 渲染系统
- **Main Entry** (`src/main.ts`) - 程序入口，处理用户交互和UI更新

### 游戏逻辑

游戏采用 4x4 网格，玩家通过方向键移动所有块，相同数字的块会合并并翻倍。每次移动后会随机生成新的块（数字 2 或 4）。

### 3D 渲染

使用 Three.js 创建立体的游戏方块，支持：
- 相机控制和视角调整
- 方块的3D材质和光照效果
- 平滑的移动和合并动画
- 响应式的场景适配

## 许可证

MIT License