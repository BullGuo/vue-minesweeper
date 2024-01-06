<!--
 * @Description:
 * @Author: jiangguo
 * @Date: 2023-12-18 21:37:08
 * @LastEditTime: 2024-01-06 23:46:13
 * @LastEditors: jiangguo
 * @FilePath: \vue-minesweeper\src\components\TheFooter.vue
-->
<template>
  <nav mt-6 inline-flex gap-2 text-xl>
    <button icon-btn @click="toggleDark()">
      <div i-carbon-sun dark:i-carbon-moon />
    </button>

    <a
      i-carbon-logo-github icon-btn
      rel="noreferrer"
      href="https://github.com/bullguo"
      target="_blank"
      title="GitHub"
    />
  </nav>
</template>
