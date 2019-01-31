<template>
<div class="cgss-progress" :class="['cgss-progress-' + theme]">
  <div class="bar">
    <div class="progress" v-bind:style="{ width: loaded + '%' }"></div>
    <span class="text">{{loaded.toFixed(2)}}%</span>
  </div>
</div>
</template>

<script lang="ts" src="./v-progress-bar.ts">
</script>

<style scoped>
.cgss-progress {
  width: 100%;
  height: 22px;
  border: 1px solid #101010;
  background-color: #d0d0d0;
  border-radius: 3px;
  padding: 1px 2px 1px 2px;
}
.cgss-progress .bar{
  overflow: hidden;
  position: relative;
  width: 100%;
  /* height: calc(100% - 0px); */
  height: 18px;
  border: 1px solid #808080;
  border-radius: 2px;
  background-color: #101010; 
}
.cgss-progress .text {
  position: absolute;
  display: block;
  width: 100%;
  line-height: 16px;
  font-size: 15px;
  /*-webkit-text-stroke: 0px #202020;*/
  text-align: center;
  color: #fff;
  z-index: 100;
}
.cgss-progress-stamina .progress{
  float: left;
  height: 100%;
  background: linear-gradient(180deg, #f0c060, #f05010);
  /* transition: width 0.6s cubic-bezier(0, 0.25, 0.25, 0.99); */
}
.cgss-progress-event .progress{
  float: left; 
  height: 100%;
  background: linear-gradient(180deg, #f090c0, #e02060);
  /* transition: width 0.6s cubic-bezier(0, 0.25, 0.25, 0.99); */
}
.cgss-progress-load .progress{
  float: left;
  height: 100%;
  background: linear-gradient(180deg, #70e0f0, #20b0f0);
  /* transition: width 0.6s cubic-bezier(0, 0.25, 0.25, 0.99); */
}
.cgss-progress-live .progress{
  float: left;
  height: 100%;
  background: linear-gradient(180deg, #b0f070 30%, #40d000);
  /* transition: width 0.6s cubic-bezier(0, 0.25, 0.25, 0.99); */
}
</style>
