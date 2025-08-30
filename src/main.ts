import './style.css'
import { createInitialState, move } from './game/core'
import { createRenderer } from './game/renderer'
import { Direction } from './types/game'

/**
 * 程序入口：初始化游戏状态、渲染与交互
 */
function main() {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="hud">
      <div class="title">3D 2048</div>
      <div class="score">Score: <span id="score">0</span></div>
      <div class="actions">
        <button id="restart">Restart</button>
      </div>
      <div class="help">Use Arrow Keys / WASD to move</div>
    </div>
    <div id="stage" class="stage"></div>
    <div id="overlay" class="overlay hidden">
      <div class="modal">
        <div id="overlay-text" class="overlay-text"></div>
        <button id="overlay-restart">Play Again</button>
      </div>
    </div>
  `

  const stage = document.getElementById('stage') as HTMLDivElement
  const scoreEl = document.getElementById('score') as HTMLSpanElement
  const overlay = document.getElementById('overlay') as HTMLDivElement
  const overlayText = document.getElementById('overlay-text') as HTMLDivElement
  const overlayRestart = document.getElementById('overlay-restart') as HTMLButtonElement
  const restartBtn = document.getElementById('restart') as HTMLButtonElement

  let state = createInitialState(4)
  const renderer = createRenderer(stage, state)
  scoreEl.textContent = `${state.score}`

  function updateUI() {
    scoreEl.textContent = `${state.score}`
    renderer.updateFromState(state)
    if (state.won) {
      overlay.classList.remove('hidden')
      overlayText.textContent = 'You Win!'
    } else if (state.over) {
      overlay.classList.remove('hidden')
      overlayText.textContent = 'Game Over'
    } else {
      overlay.classList.add('hidden')
    }
  }

  function tryMove(dir: Direction) {
    if (state.over || state.won) return
    const res = move(state, dir)
    if (res.moved) {
      state = res.state
      updateUI()
    }
  }

  const keyDir: Record<string, Direction | undefined> = {
    ArrowUp: Direction.Up,
    ArrowDown: Direction.Down,
    ArrowLeft: Direction.Left,
    ArrowRight: Direction.Right,
    w: Direction.Up,
    s: Direction.Down,
    a: Direction.Left,
    d: Direction.Right,
    W: Direction.Up,
    S: Direction.Down,
    A: Direction.Left,
    D: Direction.Right,
  }

  function onKey(e: KeyboardEvent) {
    const dir = keyDir[e.key]
    if (!dir) return
    e.preventDefault()
    tryMove(dir)
  }
  window.addEventListener('keydown', onKey)

  function restart() {
    state = createInitialState(4)
    updateUI()
  }
  restartBtn.addEventListener('click', restart)
  overlayRestart.addEventListener('click', restart)

  // 适配舞台尺寸
  const resizeObserver = new ResizeObserver(() => {
    // 渲染器内部已监听window resize，这里确保容器尺寸正确即可
  })
  resizeObserver.observe(stage)
}

main()
