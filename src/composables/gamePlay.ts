import type { BlockState, GameStatus } from '~/types'

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
  mineGenerated = ref(false)
  state = ref<BlockState[][]>([])
  gameState = ref<GameStatus>('play')
  playTime = useInterval(1000, { controls: true, immediate: false })

  constructor(public width: number, public height: number, public mines: number) {
    this.reset()
  }

  get blocks() {
    return this.state.value.flat()
  }

  reset(width = this.width, height = this.height, mines = this.mines) {
    this.width = width
    this.height = height
    this.mines = mines
    this.gameState.value = 'play'
    this.mineGenerated.value = false
    if (this.playTime.isActive) {
      this.playTime.reset()
      this.playTime.pause()
    }
    this.state.value = Array.from({ length: this.height }, (_, y) =>
      Array.from({ length: this.width }, (_, x): BlockState => ({
        x,
        y,
        adjacentMines: 0,
        revealed: false,
      })))
  }

  randomInt(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min)
  }

  generateMines(initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = this.state.value[y][x]
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from({ length: this.mines }, () => {
      let placed = false
      while (!placed)
        placed = placeRandom()
      return placed
    })
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

  expandZero(block: BlockState) {
    if (block.adjacentMines)
      return
    this.getSiblings(block).forEach((s) => {
      if (!s.revealed) {
        s.revealed = true
        this.expandZero(s)
      }
    })
  }

  expandAll() {
    this.blocks.forEach(block => block.revealed = true)
  }

  autoExpand(block: BlockState) {
    const siblings = this.getSiblings(block)
    let flags = 0
    let reveals = 0
    siblings.forEach((item) => {
      flags += (item.flagged ? 1 : 0)
      reveals += (item.revealed ? 1 : 0)
    })
    if (flags + reveals === siblings.length)
      return
    if (flags === block.adjacentMines) {
      siblings.forEach((item) => {
        if (!item.revealed && !item.flagged)
          item.revealed = true
      })
    }
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

  onGameOver(status: GameStatus) {
    this.gameState.value = status
    this.playTime.pause()
    this.expandAll()
  }

  checkGameState() {
    if (!this.mineGenerated.value)
      return
    if (this.blocks.every(block => (block.mine && block.flagged) || (!block.mine && block.revealed)))
      this.onGameOver('won')

    else if (this.blocks.some(block => (block.mine && block.revealed)))
      this.onGameOver('lost')
  }

  onClick(block: BlockState) {
    if (block.flagged || this.gameState.value !== 'play')
      return
    if (block.revealed)
      return this.autoExpand(block)
    if (!this.mineGenerated.value) {
      this.generateMines(block)
      this.mineGenerated.value = true
      this.playTime.resume()
    }
    block.revealed = true
    if (block.mine)
      return
    this.expandZero(block)
  }

  onRightClick(block: BlockState) {
    if (block.revealed || this.gameState.value !== 'play')
      return
    block.flagged = !block.flagged
  }
}
