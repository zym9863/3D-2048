# 3D 2048

English | [中文](./README.md)

A three-dimensional 2048 game built with Three.js, featuring modern 3D visual effects and smooth animation experience.

## Features

- 🎮 Classic 2048 game mechanics
- 🎨 3D stereoscopic visual effects  
- ⚡ Smooth animation transitions
- 🎯 Responsive design for different screen sizes
- ⌨️ Keyboard controls (Arrow Keys / WASD)
- 🔄 Game restart functionality
- 🏆 Win and lose state detection

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Three.js** - 3D graphics rendering library
- **Vite** - Modern build tool
- **CSS3** - Styling and layout

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## Game Controls

- **Move Tiles** - Use Arrow Keys (↑↓←→) or WASD keys
- **Restart** - Click the "Restart" button
- **Goal** - Merge tiles with the same number to reach 2048 and win

## Project Structure

```
src/
├── game/
│   ├── core.ts      # Game core logic
│   └── renderer.ts  # 3D rendering engine
├── types/
│   └── game.ts      # Type definitions
├── main.ts          # Program entry point
├── style.css        # Stylesheet
└── vite-env.d.ts    # Vite type declarations
```

## Development Guide

### Core Components

- **Game Core** (`src/game/core.ts`) - Implements game state management, move logic and win/lose detection
- **3D Renderer** (`src/game/renderer.ts`) - Three.js-based 3D rendering system
- **Main Entry** (`src/main.ts`) - Program entry point, handles user interaction and UI updates

### Game Logic

The game uses a 4x4 grid where players move all tiles using directional keys. Tiles with the same number merge and double their value. After each move, a new tile (number 2 or 4) is randomly generated.

### 3D Rendering

Uses Three.js to create 3D game tiles with support for:
- Camera control and perspective adjustment
- 3D materials and lighting effects for tiles
- Smooth movement and merge animations
- Responsive scene adaptation

## License

MIT License