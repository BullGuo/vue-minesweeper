export interface BlockState {
  x: number
  y: number
  revealed: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}

export type GameStatus = 'play' | 'won' | 'lost'
