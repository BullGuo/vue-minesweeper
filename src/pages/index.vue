<!--
 * @Description:
 * @Author: jiangguo
 * @Date: 2023-12-18 21:37:08
 * @LastEditTime: 2023-12-21 20:02:41
 * @LastEditors: jiangguo
 * @FilePath: \vue-minesweeper\src\pages\index.vue
-->
<script setup lang="ts" generic="T extends any, O extends any">
interface BlockState {
  x: number
  y: number
  revealed: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}

const WIDTH = 10
const HEIGHT = 10
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x): BlockState => ({
      x,
      y,
      adjacentMines: 0,
      revealed: false,
    }))),
)

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

function generateMines(initial: BlockState) {
  for (const row of state) {
    for (const block of row) {
      if (Math.abs(initial.x - block.x) <= 1)
        continue
      if (Math.abs(initial.y - block.y) <= 1)
        continue
      block.mine = Math.random() < 0.4
    }
  }
  updateNumbers()
}

function updateNumbers() {
  state.forEach((row) => {
    row.forEach((block) => {
      if (block.mine)
        return
      getSiblings(block).forEach((s) => {
        if (s.mine)
          block.adjacentMines++
      })
    })
  })
}

function expendZero(block: BlockState) {
  if (block.adjacentMines)
    return
  getSiblings(block).forEach((s) => {
    if (!s.revealed) {
      s.revealed = true
      expendZero(s)
    }
  })
}

function expendAll() {
  state.flat().forEach(block => block.revealed = true)
}

function getSiblings(block: BlockState) {
  return directions.map(([x, y]) => {
    const x2 = block.x + x
    const y2 = block.y + y
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined
    return state[y2][x2]
  }).filter(Boolean) as BlockState[]
}

const dev = false
let mineGenerated = false

function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray/20'
  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}

function onClick(block: BlockState) {
  if (block.flagged)
    return
  if (!mineGenerated) {
    generateMines(block)
    mineGenerated = true
  }
  block.revealed = true
  if (block.mine) {
    expendAll()
    return
  }
  expendZero(block)
}

function onRightClick(block: BlockState) {
  if (block.revealed)
    return
  block.flagged = !block.flagged
}

watchEffect(checkGameState)

function checkGameState() {
  const blocks = state.flat()
  if (blocks.every(block => block.revealed || block.flagged)) {
    if (blocks.some(block => (!block.mine && block.flagged) || (block.mine && block.revealed)))
      alert('输了')
    else
      alert('赢了')
  }
}
</script>

<template>
  <div>
    Minesweeper
    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <button
          v-for="block, x in row" :key="x" h-10 w-10 m="0.5" flex="~" items-center justify-center
          border="~ gray-400/10" :class="getBlockClass(block)" @click="onClick(block)"
          @contextmenu.prevent="onRightClick(block)"
        >
          <div v-if="block.flagged" i-mdi:flag-variant text-red />
          <template v-else-if="block.revealed || dev">
            <div v-if="block.mine" i-mdi:mine />
            <div v-else>
              {{ block.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
