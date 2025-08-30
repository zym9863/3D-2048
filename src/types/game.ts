/**
 * 2048 游戏通用类型定义
 * - 方向常量对象用于输入与移动逻辑（兼容 erasableSyntaxOnly）
 * - 游戏状态包含棋盘、分数与结束/胜利标记
 */
export const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
} as const

export type Direction = typeof Direction[keyof typeof Direction]

export type Cell = number | 0

export interface GameState {
  /** 棋盘尺寸，默认 4x4 */
  size: number
  /** 棋盘二维数组，0 表示空 */
  board: Cell[][]
  /** 当前分数 */
  score: number
  /** 是否胜利（出现 2048） */
  won: boolean
  /** 是否无可用步（游戏结束） */
  over: boolean
}

export interface MoveResult {
  state: GameState
  /** 本次移动产生的分数增量 */
  gained: number
  /** 是否发生了移动或合并 */
  moved: boolean
}
