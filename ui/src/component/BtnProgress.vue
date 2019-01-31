<template>
<div class="btn-progress-wrapper">
  <div class="half-wrapper left">
    <div class="ring left" :style="{
    transform: 'rotate(' + leftDeg + 'deg)',
    'border-top': '5px solid ' + color,
    'border-left': '5px solid ' + color
    }"></div>
  </div>
  <div class="half-wrapper right">
    <div class="ring right" :style="{
      transform: 'rotate(' + rightDeg + 'deg)',
      'border-top': '5px solid ' + color,
      'border-right': '5px solid ' + color
    }"></div>
  </div>
  <svg v-if="type === 'play'" width="25" height="25" t="1548857945423" class="icon" style="margin: 13px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3808" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M893.035 463.821679C839.00765 429.699141 210.584253 28.759328 179.305261 8.854514 139.495634-16.737389 99.686007 17.385148 99.686007 57.194775v909.934329c0 45.496716 42.653172 68.245075 76.775709 48.340262 45.496716-28.435448 676.763657-429.375262 716.573284-454.967165 34.122537-22.748358 34.122537-76.775709 0-96.680522z" fill="rgb(141, 206, 214)" p-id="3809"></path></svg>
  <svg v-if="type === 'pause'" width="24" height="24" t="1548858220661" class="icon" style="margin: 13px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4588" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M757.52 73.107h-62.493c-34.526 0-62.498 27.984-62.498 62.511v749.948c0 34.526 27.974 62.493 62.498 62.493h62.493c34.516 0 62.502-27.968 62.502-62.493v-749.953c-0.001-34.524-27.984-62.509-62.502-62.509z" p-id="4589" fill="rgb(141, 206, 214)"></path><path d="M320.054 73.107h-62.502c-34.526 0-62.498 27.984-62.498 62.511v749.948c0 34.526 27.974 62.493 62.498 62.493h62.502c34.505 0 62.493-27.968 62.493-62.493v-749.953c-0.001-34.524-27.984-62.509-62.493-62.509z" p-id="4590" fill="rgb(141, 206, 214)"></path></svg>
</div>
</template>

<script lang="ts" src="./v-btn-progress.ts">
</script>

<style scoped>
.btn-progress-wrapper {
  width: 50px;
  height: 50px;
  position: relative;
}

.btn-progress-wrapper .half-wrapper {
  width: 25px;
  height: 50px;
  overflow: hidden;
  position: absolute;
}

.btn-progress-wrapper .half-wrapper.left {
  left: 0;
}
.btn-progress-wrapper .half-wrapper.right {
  right: 0;
}

.btn-progress-wrapper .half-wrapper .ring {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  position: absolute;
}

/* [-225, -45] */
.btn-progress-wrapper .half-wrapper .ring.left {
  border-right: 5px solid transparent;
  border-bottom: 5px solid transparent;
  left: 0;
}

/* [-135, 45] */
.btn-progress-wrapper .half-wrapper .ring.right {
  right: 0;
  border-left: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

</style>

