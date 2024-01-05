<!--
 * @Description:
 * @Author: jiangguo
 * @Date: 2023-12-18 21:37:08
 * @LastEditTime: 2024-01-05 21:24:31
 * @LastEditors: jiangguo
 * @FilePath: \vue-minesweeper\src\pages\index.vue
-->
<script setup lang="ts" generic="T extends any, O extends any">
const play = new GamePlay(9, 9, 10)

const mineCount = computed(() => {
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0), 0)
})

const isDev = ref(false)
const toggleDev = useToggle(isDev)

watchEffect(() => {
  play.checkGameState()
})

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(30, 16, 99)
      break
  }
}
</script>

<template>
  <div>
    Minesweeper
    <div p5>
      <div flex="~ gap1" justify-center p5>
        <button btn @click="play.reset()">
          New Game
        </button>
        <button btn @click="newGame('easy')">
          Easy
        </button>
        <button btn @click="newGame('medium')">
          Medium
        </button>
        <button btn @click="newGame('hard')">
          Hard
        </button>
      </div>
      <div v-for="row, y in play.state.value" :key="y" flex="~" items-center justify-center>
        <button
          v-for="block, x in row" :key="x" h-10 w-10 m="0.5" flex="~" items-center justify-center
          border="~ gray-400/10" :class="play.getBlockClass(block)" @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        >
          <div v-if="block.flagged" i-mdi:flag-variant text-red />
          <template v-else-if="block.revealed || isDev">
            <div v-if="block.mine" i-mdi:mine />
            <div v-else font-bold>
              {{ block.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
    <div>MineCount：{{ mineCount }}</div>
    <button m-3 btn @click="toggleDev()">
      {{ isDev ? 'DEV' : 'NORMAL' }}
    </button>
    <Confetti :passed="play.gameState.value === 'won'" />
  </div>
</template>
