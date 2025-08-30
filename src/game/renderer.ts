import * as THREE from 'three'
import type { GameState } from '../types/game'

export interface RenderHandles {
  updateFromState: (state: GameState) => void
  dispose: () => void
}

/**
 * 创建Three渲染器与场景，并返回更新接口
 * @param container DOM容器
 * @param state 初始游戏状态
 */
export function createRenderer(container: HTMLElement, state: GameState): RenderHandles {
  // 渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  // 场景和相机
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#202225')
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(5, 7.5, 8.5)
  camera.lookAt(0, 0, 0)

  // 光照
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)
  const dir = new THREE.DirectionalLight(0xffffff, 0.7)
  dir.position.set(5, 10, 7)
  scene.add(dir)

  // 棋盘底座
  const boardSize = state.size
  const tileGap = 0.1
  const tileSize = 1
  const boardGeom = new THREE.BoxGeometry(boardSize * tileSize + (boardSize + 1) * tileGap, 0.3, boardSize * tileSize + (boardSize + 1) * tileGap)
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x3b3e45, metalness: 0.2, roughness: 0.8 })
  const boardMesh = new THREE.Mesh(boardGeom, boardMat)
  boardMesh.position.y = -0.2
  scene.add(boardMesh)

  // 网格辅助线（可选）
  const grid = new THREE.GridHelper(boardSize * 1.1, boardSize, 0x666666, 0x444444)
  grid.position.y = -0.05
  scene.add(grid)

  // 方块容器
  const tilesGroup = new THREE.Group()
  scene.add(tilesGroup)

  // 颜色映射
  const colorFor = (v: number) => {
    const palette: Record<number, number> = {
      2: 0xeee4da,
      4: 0xede0c8,
      8: 0xf2b179,
      16: 0xf59563,
      32: 0xf67c5f,
      64: 0xf65e3b,
      128: 0xedcf72,
      256: 0xedcc61,
      512: 0xedc850,
      1024: 0xedc53f,
      2048: 0xedc22e,
    }
    return palette[v] ?? 0xcccccc
  }

  const key = (r: number, c: number) => `${r}-${c}`

  type TileObj = { mesh: THREE.Mesh; value: number; targetPos: THREE.Vector3 }
  const tiles = new Map<string, TileObj>()

  function cellToPosition(r: number, c: number): THREE.Vector3 {
    const total = boardSize * tileSize + (boardSize - 1) * tileGap
    const originX = -total / 2 + tileSize / 2
    const originZ = -total / 2 + tileSize / 2
    const x = originX + c * (tileSize + tileGap)
    const z = originZ + r * (tileSize + tileGap)
    return new THREE.Vector3(x, 0, z)
  }

  function buildOrUpdate(state: GameState) {
    const seen = new Set<string>()
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        const v = state.board[r][c]
        const k = key(r, c)
        if (v === 0) continue
        seen.add(k)
        const pos = cellToPosition(r, c)
        if (!tiles.has(k)) {
          const geom = new THREE.BoxGeometry(tileSize, 0.9, tileSize)
          const mat = new THREE.MeshStandardMaterial({ color: colorFor(v) })
          const mesh = new THREE.Mesh(geom, mat)
          mesh.position.copy(pos)
          mesh.castShadow = true
          tilesGroup.add(mesh)
          tiles.set(k, { mesh, value: v, targetPos: pos.clone() })
        } else {
          const t = tiles.get(k)!
          if (t.value !== v) {
            ;(t.mesh.material as THREE.MeshStandardMaterial).color.set(colorFor(v))
            t.value = v
            // 轻微弹跳动画目标
            t.mesh.scale.set(1.05, 1.05, 1.05)
          }
          t.targetPos.copy(pos)
        }
      }
    }
    // 移除不再存在的方块
    for (const [k, t] of tiles) {
      if (!seen.has(k)) {
        tilesGroup.remove(t.mesh)
        t.mesh.geometry.dispose()
        ;(t.mesh.material as THREE.Material).dispose()
        tiles.delete(k)
      }
    }
  }

  buildOrUpdate(state)

  // 动画循环
  const clock = new THREE.Clock()
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.033)
    // 插值移动与缩放恢复
    for (const { mesh, targetPos } of tiles.values()) {
      mesh.position.lerp(targetPos, Math.min(1, dt * 12))
      mesh.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, dt * 6))
    }
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
  }
  tick()

  function onResize() {
    const w = container.clientWidth
    const h = container.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', onResize)

  return {
    updateFromState: (s) => buildOrUpdate(s),
    dispose: () => {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    },
  }
}
