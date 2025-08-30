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
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.appendChild(renderer.domElement)

  // 场景和相机
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0a0d12')
  scene.fog = new THREE.Fog('#0a0d12', 10, 25)
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(5, 7.5, 8.5)
  camera.lookAt(0, 0, 0)

  // 光照
  const ambient = new THREE.AmbientLight(0x404080, 0.3)
  scene.add(ambient)
  
  const dir = new THREE.DirectionalLight(0xffffff, 1.2)
  dir.position.set(8, 12, 6)
  dir.castShadow = true
  dir.shadow.mapSize.width = 2048
  dir.shadow.mapSize.height = 2048
  dir.shadow.camera.near = 0.5
  dir.shadow.camera.far = 50
  dir.shadow.camera.left = -10
  dir.shadow.camera.right = 10
  dir.shadow.camera.top = 10
  dir.shadow.camera.bottom = -10
  scene.add(dir)
  
  // 补充光源
  const fillLight = new THREE.DirectionalLight(0x80c8ff, 0.4)
  fillLight.position.set(-5, 3, -5)
  scene.add(fillLight)

  // 棋盘底座
  const boardSize = state.size
  const tileGap = 0.1
  const tileSize = 1
  const boardGeom = new THREE.BoxGeometry(boardSize * tileSize + (boardSize + 1) * tileGap, 0.4, boardSize * tileSize + (boardSize + 1) * tileGap)
  const boardMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a3142, 
    metalness: 0.3, 
    roughness: 0.7,
    emissive: 0x0a0f1a,
    emissiveIntensity: 0.1
  })
  const boardMesh = new THREE.Mesh(boardGeom, boardMat)
  boardMesh.position.y = -0.25
  boardMesh.receiveShadow = true
  scene.add(boardMesh)

  // 网格辅助线（增强版）
  const grid = new THREE.GridHelper(boardSize * 1.1, boardSize, 0x4a5568, 0x2d3748)
  grid.position.y = -0.05
  grid.material.opacity = 0.7
  grid.material.transparent = true
  scene.add(grid)

  // 方块容器
  const tilesGroup = new THREE.Group()
  scene.add(tilesGroup)

  // 颜色映射 - 增强版
  const colorFor = (v: number) => {
    const palette: Record<number, number> = {
      2: 0xf4f1eb,      // 温暖的米白
      4: 0xf0e6d2,      // 淡黄
      8: 0xf2b179,      // 橙色
      16: 0xf59563,     // 深橙
      32: 0xf67c5f,     // 红橙
      64: 0xf65e3b,     // 红色
      128: 0xedcf72,    // 金黄
      256: 0xedcc61,    // 深金黄
      512: 0xedc850,    // 黄色
      1024: 0xedc53f,   // 深黄
      2048: 0xedc22e,   // 胜利金色
      4096: 0x9c88ff,   // 紫色
      8192: 0x6c5ce7,   // 深紫
    }
    return palette[v] ?? 0xcccccc
  }
  
  // 创建材质的函数
  const createTileMaterial = (value: number) => {
    const color = colorFor(value)
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.05,
    })
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
          // 创建圆角方块
          const geom = new THREE.BoxGeometry(tileSize, 0.9, tileSize)
          // 添加轻微的圆角效果
          const edges = new THREE.EdgesGeometry(geom)
          const mat = createTileMaterial(v)
          const mesh = new THREE.Mesh(geom, mat)
          mesh.position.copy(pos)
          mesh.castShadow = true
          mesh.receiveShadow = true
          
          // 新生成的瓦片从小开始缩放
          mesh.scale.set(0.1, 0.1, 0.1)
          
          // 添加轻微的发光边框
          const lineMat = new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            opacity: 0.1, 
            transparent: true 
          })
          const wireframe = new THREE.LineSegments(edges, lineMat)
          mesh.add(wireframe)
          
          tilesGroup.add(mesh)
          tiles.set(k, { mesh, value: v, targetPos: pos.clone() })
        } else {
          const t = tiles.get(k)!
          if (t.value !== v) {
            // 更新材质而不是颜色
            t.mesh.material = createTileMaterial(v)
            t.value = v
            // 增强弹跳动画
            t.mesh.scale.set(1.1, 1.1, 1.1)
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
    const time = clock.getElapsedTime()
    
    // 插值移动与缩放恢复，以及轻微的呼吸动画
    for (const { mesh, targetPos } of tiles.values()) {
      mesh.position.lerp(targetPos, Math.min(1, dt * 12))
      mesh.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, dt * 6))
      
      // 添加轻微的垂直浮动动画
      const floatY = Math.sin(time * 2 + mesh.position.x * 2 + mesh.position.z * 2) * 0.02
      mesh.position.y = targetPos.y + floatY
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
