<template>
<div class="flex-center task-panel">
  <p class="text-center">{{text}}</p>
  <ProgressBar :theme="theme" :loaded="loaded"/>
  <p class="text-center">※请在网络良好的环境下进行</p>
</div>
</template>

<script lang="ts" src="./v-task-panel.ts">
</script>

<style scoped>
.task-panel{
  border-radius: 10px;
  border: 3px solid #000;
  padding: 10px 20px;
  background-color: #aaa;
  height: 120px;
  width: 90%;
  flex-direction: column;
}
.task-panel .text-center {
  height: 30px;
  line-height: 30px;
}
</style>
