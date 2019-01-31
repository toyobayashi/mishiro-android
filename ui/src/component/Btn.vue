<template>
<div class="btn-wrapper">
  <button class="btn" :class="['btn-' + theme]"><slot></slot></button>
</div>
</template>

<script lang="ts" src="./v-btn.ts">
</script>

<style scoped>
.btn-wrapper {
  min-width: 102px;
  height: 64px;
  position: relative;
  user-select: none;
}
.btn-wrapper .btn-cancel {
  background: linear-gradient(180deg, rgb(240, 240, 240), rgb(192, 192, 192));
  color: #333;
}
.btn-wrapper .btn-ok {
  background: linear-gradient(180deg, rgb(240, 128, 208), rgb(192, 32, 160));
  color: #fff;
}
.btn-wrapper .btn {
  position: absolute;
  bottom: 0;
  display: inline-block;
  white-space: nowrap;
  touch-action: manipulation;
  min-width: 102px;
  height: 64px;
  border: none;
  outline: none;
  border-radius: 8px;
  box-sizing: border-box;
  box-shadow: 0px 0px 10px 0px #fff inset;
  border-top: 2px solid #000;
  border-left: 2px solid #000;
  border-right: 2px solid #000;
  border-bottom: 6px solid #000;
  font-size: 29px;
  margin:0;
  padding-bottom: 4px;
  font-weight: bold;
}
.btn-wrapper .btn:active {
  padding-bottom: 2px;
  border-bottom: 2px solid #000;
  height: 60px;
}
</style>
