import { Direction, type Cell, type GameState, type MoveResult } from '../types/game'

/**
 * 初始化状态
 * @param size 棋盘尺寸，默认4
 */
export function createInitialState(size = 4): GameState {
  const board: Cell[][] = Array.from({ length: size }, () => Array<Cell>(size).fill(0))
  const state: GameState = { size, board, score: 0, won: false, over: false }
  spawnRandomTiles(state, 2)
  return state
}

/**
 * 在空位随机生成 n 个新砖（值为 2 或 4，2 的概率 90%）
 */
export function spawnRandomTiles(state: GameState, n = 1): void {
  const empties: Array<{ r: number; c: number }> = []
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (state.board[r][c] === 0) empties.push({ r, c })
    }
  }
  for (let i = 0; i < n && empties.length > 0; i++) {
    const idx = Math.floor(Math.random() * empties.length)
    const { r, c } = empties.splice(idx, 1)[0]
    state.board[r][c] = Math.random() < 0.9 ? 2 : 4
  }
}

/**
 * 执行一次移动（纯函数：返回新对象）
 */
export function move(state: GameState, dir: Direction): MoveResult {
  const next: GameState = {
    size: state.size,
    board: state.board.map((row) => row.slice()),
    score: state.score,
    won: state.won,
    over: state.over,
  }

  const { moved, gained } = slideAndMerge(next, dir)
  if (moved) {
    next.score += gained
    if (!next.won) next.won = hasValue(next, 2048)
    spawnRandomTiles(next, 1)
    next.over = !canMove(next)
  }
  return { state: next, gained, moved }
}

/**
 * 判断是否还能移动
 */
export function canMove(state: GameState): boolean {
  const size = state.size
  // 存在空位
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (state.board[r][c] === 0) return true
  // 相邻可合并
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = state.board[r][c]
      if (r + 1 < size && state.board[r + 1][c] === v) return true
      if (c + 1 < size && state.board[r][c + 1] === v) return true
    }
  }
  return false
}

function hasValue(state: GameState, target: number): boolean {
  return state.board.some((row) => row.some((v) => v >= target))
}

/**
 * 根据方向滑动并合并
 */
function slideAndMerge(state: GameState, dir: Direction): { moved: boolean; gained: number } {
  const size = state.size
  let moved = false
  let gained = 0

  const read = (r: number, c: number) => state.board[r][c]
  const write = (r: number, c: number, v: number) => (state.board[r][c] = v)

  const lines: number[][] = []
  // 提取每条线
  if (dir === Direction.Left || dir === Direction.Right) {
    for (let r = 0; r < size; r++) lines.push(state.board[r].slice())
    if (dir === Direction.Right) lines.forEach((l) => l.reverse())
  } else {
    for (let c = 0; c < size; c++) {
      const col: number[] = []
      for (let r = 0; r < size; r++) col.push(read(r, c))
      lines.push(col)
    }
    if (dir === Direction.Down) lines.forEach((l) => l.reverse())
  }

  const processed = lines.map(compactMerge)
  processed.forEach((res) => {
    gained += res.gained
    if (res.moved) moved = true
  })

  // 写回棋盘
  const out = processed.map((p) => p.line)
  if (dir === Direction.Left || dir === Direction.Right) {
    out.forEach((l, r) => {
      const line = dir === Direction.Right ? l.slice().reverse() : l
      for (let c = 0; c < size; c++) if (read(r, c) !== line[c]) write(r, c, line[c])
    })
  } else {
    out.forEach((l, c) => {
      const line = dir === Direction.Down ? l.slice().reverse() : l
      for (let r = 0; r < size; r++) if (read(r, c) !== line[r]) write(r, c, line[r])
    })
  }

  return { moved, gained }
}

/**
 * 压缩 + 合并 + 再压缩
 */
function compactMerge(line: number[]): { line: number[]; moved: boolean; gained: number } {
  const size = line.length
  const nonzero = line.filter((v) => v !== 0)
  let moved = nonzero.length !== line.length
  const merged: number[] = []
  let gained = 0
  for (let i = 0; i < nonzero.length; i++) {
    const v = nonzero[i]
    const nxt = nonzero[i + 1]
    if (nxt !== undefined && nxt === v) {
      const nv = v * 2
      merged.push(nv)
      gained += nv
      i++
      moved = true
    } else {
      merged.push(v)
    }
  }
  while (merged.length < size) merged.push(0)
  return { line: merged, moved, gained }
}
