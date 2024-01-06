<!--
 * @Description:
 * @Author: jiangguo
 * @Date: 2023-12-18 21:37:08
 * @LastEditTime: 2024-01-06 18:13:00
 * @LastEditors: jiangguo
 * @FilePath: \vue-minesweeper\src\pages\index.vue
-->
<script setup lang="ts" generic="T extends any, O extends any">
const play = new GamePlay(9, 9, 10)

const mineCount = computed(() => {
  if (!play.mineGenerated.value && play.state.value)
    return play.mines
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0), 0)
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
    <div>
      <div flex="~ gap1" m5 justify-center>
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
      <div flex="~ gap2" justify-center>
        <div flex="~ gap1" items-center text-xl>
          <div i-mdi:timer-outline />
          <div>{{ play.playTime.counter }}</div>
        </div>
        <div flex="~ gap1" items-center text-xl>
          <div i-mdi:mine />
          {{ mineCount }}
        </div>
      </div>
      <div p5>
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
    </div>
    <button m-3 btn @click="toggleDev()">
      {{ isDev ? 'DEV' : 'NORMAL' }}
    </button>
    <Confetti :passed="play.gameState.value === 'won'" />
  </div>
</template>
