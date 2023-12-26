import type { BlockState } from '~/types'

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]
const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500',
]

export class GamePlay {
  mineGenerated = false
  state = ref<BlockState[][]>([])
  gameState = ref<'play' | 'won' | 'lost'>('play')

  constructor(public width: number, public height: number) {
    this.reset()
  }

  reset() {
    this.gameState.value = 'play'
    this.mineGenerated = false
    this.state.value = Array.from({ length: this.height }, (_, y) =>
      Array.from({ length: this.width }, (_, x): BlockState => ({
        x,
        y,
        adjacentMines: 0,
        revealed: false,
      })))
  }

  generateMines(initial: BlockState) {
    for (const row of this.state.value) {
      for (const block of row) {
        if (Math.abs(initial.x - block.x) <= 1)
          continue
        if (Math.abs(initial.y - block.y) <= 1)
          continue
        block.mine = Math.random() < 0.4
      }
    }
    this.updateNumbers()
  }

  updateNumbers() {
    this.state.value.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return
        this.getSiblings(block).forEach((s) => {
          if (s.mine)
            block.adjacentMines++
        })
      })
    })
  }

  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return
    this.getSiblings(block).forEach((s) => {
      if (!s.revealed) {
        s.revealed = true
        this.expendZero(s)
      }
    })
  }

  expendAll() {
    this.state.value.flat().forEach(block => block.revealed = true)
  }

  getSiblings(block: BlockState) {
    return directions.map(([x, y]) => {
      const x2 = block.x + x
      const y2 = block.y + y
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined
      return this.state.value[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  getBlockClass(block: BlockState) {
    if (block.flagged)
      return 'bg-gray-500/10'
    if (!block.revealed)
      return 'bg-gray-500/10 hover:bg-gray/20'
    return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
  }

  checkGameState() {
    const blocks = this.state.value.flat()
    if (blocks.every(block => block.revealed || block.flagged)) {
      if (blocks.some(block => (!block.mine && block.flagged) || (block.mine && block.revealed)))
        this.gameState.value = 'lost'
      else
        this.gameState.value = 'won'
    }
  }

  onClick(block: BlockState) {
    if (block.flagged || this.gameState.value !== 'play')
      return
    if (!this.mineGenerated) {
      this.generateMines(block)
      this.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      this.expendAll()
      return
    }
    this.expendZero(block)
  }

  onRightClick(block: BlockState) {
    if (block.revealed || this.gameState.value !== 'play')
      return
    block.flagged = !block.flagged
  }
}
